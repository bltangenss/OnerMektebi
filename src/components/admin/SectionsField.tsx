"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { DirectionSection } from "@/types/content";

type Props = { name: string; label: string; defaultValue?: DirectionSection[] | null };

const empty = (): DirectionSection => ({ heading: { kk: "", ru: "" }, body: { kk: "", ru: "" } });
const input = "mt-1 w-full rounded-felt border border-line bg-white px-3 py-2";

/** Разделы страницы направления: заголовок и текст на двух языках. */
export function SectionsField({ name, label, defaultValue }: Props) {
  const [items, setItems] = useState<DirectionSection[]>(defaultValue?.length ? defaultValue : [empty()]);

  const update = (i: number, part: "heading" | "body", lang: "kk" | "ru", value: string) =>
    setItems((list) => list.map((s, j) => (j === i ? { ...s, [part]: { ...s[part], [lang]: value } } : s)));
  const move = (i: number, d: number) =>
    setItems((list) => {
      const next = [...list];
      const [x] = next.splice(i, 1);
      next.splice(i + d, 0, x);
      return next;
    });

  return (
    <fieldset>
      <legend className="font-semibold">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <ol className="mt-3 space-y-4">
        {items.map((s, i) => (
          <li key={i} className="rounded-felt border border-line bg-linen p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">Раздел {i + 1}</span>
              <div className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="flex size-10 items-center justify-center rounded disabled:opacity-30" aria-label="Выше">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="flex size-10 items-center justify-center rounded disabled:opacity-30" aria-label="Ниже">
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="flex size-10 items-center justify-center rounded text-wine" aria-label={`Удалить раздел ${i + 1}`}>
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(["kk", "ru"] as const).map((lang) => (
                <div key={lang}>
                  <label className="block text-sm">
                    Заголовок ({lang === "kk" ? "қазақша" : "по-русски"})
                    <input className={input} value={s.heading[lang]} onChange={(e) => update(i, "heading", lang, e.target.value)} />
                  </label>
                  <label className="mt-2 block text-sm">
                    Текст ({lang === "kk" ? "қазақша" : "по-русски"})
                    <textarea rows={4} className={input} value={s.body[lang]} onChange={(e) => update(i, "body", lang, e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => setItems((l) => [...l, empty()])} className="btn btn-outline mt-3 text-wine">
        <Plus className="size-5" aria-hidden />
        Добавить раздел
      </button>
    </fieldset>
  );
}
