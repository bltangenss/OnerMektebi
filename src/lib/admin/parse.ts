import type { Entity } from "./entities";
import { isOwnMediaUrl } from "./media";

export type Row = Record<string, unknown>;
export type ParseResult = { row: Row; errors: string[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** «https://youtu.be/abc», «...watch?v=abc» или просто «abc» → «abc». */
export function youtubeId(input: string): string {
  const m = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,20})/);
  return m ? m[1] : input;
}

/** Разбирает и проверяет форму по описанию раздела. Ничего не доверяет клиенту. */
export function parseForm(entity: Entity, form: FormData, directionSlugs: string[]): ParseResult {
  const row: Row = {};
  const errors: string[] = [];

  for (const f of entity.fields) {
    switch (f.type) {
      case "localized": {
        const kk = str(form, `${f.name}.kk`);
        const ru = str(form, `${f.name}.ru`);
        if (f.required && !kk) errors.push(`«${f.label}»: заполните текст на казахском языке.`);
        row[f.name] = kk || ru ? { kk, ru } : null;
        break;
      }
      case "text": {
        let v = str(form, f.name);
        if (f.name === "youtube_id" && v) v = youtubeId(v);
        if (f.required && !v) errors.push(`«${f.label}»: обязательное поле.`);
        if (v && f.pattern && !f.pattern.test(v)) errors.push(`«${f.label}»: ${f.patternHint ?? "неверный формат"}.`);
        if (f.name === "youtube_id" && v && !/^[A-Za-z0-9_-]{6,20}$/.test(v)) errors.push("Код YouTube не распознан.");
        row[f.name] = v || null;
        break;
      }
      case "number": {
        const v = str(form, f.name);
        const n = v === "" ? 100 : Number.parseInt(v, 10);
        if (!Number.isFinite(n)) errors.push(`«${f.label}»: введите число.`);
        row[f.name] = Number.isFinite(n) ? n : 100;
        break;
      }
      case "select": {
        const v = str(form, f.name) || f.options[0].value;
        if (!f.options.some((o) => o.value === v)) errors.push(`«${f.label}»: выберите значение из списка.`);
        row[f.name] = v;
        break;
      }
      case "direction": {
        const v = str(form, f.name);
        if (!directionSlugs.includes(v)) errors.push(`«${f.label}»: выберите направление.`);
        row[f.name] = v;
        break;
      }
      case "checkbox":
        row[f.name] = form.get(f.name) === "on";
        break;
      case "date": {
        const v = str(form, f.name);
        if (f.required && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(`«${f.label}»: укажите дату.`);
        row[f.name] = v || null;
        break;
      }
      case "time": {
        const v = str(form, f.name);
        if (v && !/^\d{2}:\d{2}$/.test(v)) errors.push(`«${f.label}»: время в формате ЧЧ:ММ.`);
        row[f.name] = v || null;
        break;
      }
      case "file": {
        const v = str(form, f.name);
        if (v && !isOwnMediaUrl(v)) errors.push(`«${f.label}»: файл должен быть загружен через эту форму.`);
        row[f.name] = v || null;
        break;
      }
      case "gallery": {
        const list = form.getAll(f.name).map(String).filter(Boolean);
        if (list.some((u) => !isOwnMediaUrl(u))) errors.push(`«${f.label}»: есть файл не из хранилища сайта.`);
        row[f.name] = list.filter(isOwnMediaUrl);
        break;
      }
      case "teachers": {
        const ids = form.getAll(f.name).map(String).filter((v) => UUID.test(v));
        row[f.name] = ids;
        break;
      }
      case "sections": {
        try {
          const raw = JSON.parse(str(form, f.name) || "[]") as unknown;
          if (!Array.isArray(raw)) throw new Error();
          row[f.name] = raw
            .map((s) => {
              const o = s as { heading?: { kk?: unknown; ru?: unknown }; body?: { kk?: unknown; ru?: unknown } };
              const t = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 4000) : "");
              return {
                heading: { kk: t(o.heading?.kk), ru: t(o.heading?.ru) },
                body: { kk: t(o.body?.kk), ru: t(o.body?.ru) },
              };
            })
            .filter((s) => s.heading.kk || s.body.kk || s.heading.ru || s.body.ru);
        } catch {
          errors.push(`«${f.label}»: не удалось прочитать разделы.`);
          row[f.name] = [];
        }
        break;
      }
    }
  }

  // Правила конкретных разделов.
  if (entity.key === "works") {
    if (row.published && !row.consent) {
      errors.push("Нельзя опубликовать работу без согласия родителей или законных представителей.");
    }
    if (row.kind === "image" && !row.image) errors.push("Для рисунка загрузите изображение.");
    if (row.kind === "audio" && !row.media_url) errors.push("Для аудио загрузите аудиофайл.");
    if (row.kind === "video" && !row.media_url && !row.youtube_id) errors.push("Для видео загрузите файл или укажите код YouTube.");
  }

  row.updated_at = new Date().toISOString();
  return { row, errors };
}
