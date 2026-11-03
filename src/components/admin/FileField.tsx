"use client";

import { useId, useRef, useState } from "react";
import { FileAudio, FileVideo, Loader2, Trash2, Upload } from "lucide-react";
import { UPLOAD_RULES } from "@/lib/admin/media";
import type { FileKind } from "@/lib/admin/entities";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { browserClient } from "@/lib/supabase/browser";

type Props = {
  name: string;
  label: string;
  accept: FileKind | "media";
  folder: string;
  defaultValue?: string | null;
  hint?: string;
};

/**
 * Загрузка файла прямо в Supabase Storage из браузера сотрудника.
 * Тип и размер проверяются здесь и ещё раз на стороне Storage,
 * права на запись — политикой RLS (только администраторы).
 */
export async function uploadToStorage(file: File, accept: FileKind | "media", folder: string): Promise<string> {
  const rule = UPLOAD_RULES[accept];
  if (!rule.types.includes(file.type)) throw new Error(`Этот тип файла не подходит. Можно: ${rule.label}.`);
  if (file.size > rule.maxMb * 1024 * 1024) throw new Error(`Файл слишком большой. Можно: ${rule.label}.`);
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = browserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("Не удалось загрузить файл. Проверьте интернет и попробуйте ещё раз.");
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function FileField({ name, label, accept, folder, defaultValue, hint }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rule = UPLOAD_RULES[accept];
  const isImage = accept === "image";

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      setUrl(await uploadToStorage(file, accept, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      <p className="text-sm text-muted">{hint ?? rule.label}</p>
      <input type="hidden" name={name} value={url} />

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {url &&
          (isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- предпросмотр загруженного файла
            <img src={url} alt="" className="h-28 w-auto rounded-felt border border-line object-cover" />
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-felt border border-line px-4 py-3">
              {url.match(/\.(mp4|webm)$/) ? <FileVideo className="size-5" aria-hidden /> : <FileAudio className="size-5" aria-hidden />}
              Открыть файл
            </a>
          ))}
        <label
          htmlFor={id}
          className="btn btn-outline cursor-pointer text-wine focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-wine"
        >
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Upload className="size-5" aria-hidden />}
          {busy ? "Загрузка…" : url ? "Заменить" : "Выбрать файл"}
          <input
            ref={input}
            id={id}
            type="file"
            className="sr-only"
            accept={rule.types.join(",")}
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {url && !busy && (
          <button type="button" onClick={() => setUrl("")} className="inline-flex min-h-11 items-center gap-2 text-wine">
            <Trash2 className="size-4" aria-hidden />
            Убрать
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-wine">
          {error}
        </p>
      )}
    </div>
  );
}
