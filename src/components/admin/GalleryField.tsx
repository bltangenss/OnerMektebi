"use client";

import { useId, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { UPLOAD_RULES } from "@/lib/admin/media";
import { uploadToStorage } from "./FileField";

type Props = { name: string; label: string; folder: string; defaultValue?: string[] | null; hint?: string };

/** Несколько фотографий мероприятия: добавить пачкой, убрать по одной. */
export function GalleryField({ name, label, folder, defaultValue, hint }: Props) {
  const id = useId();
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        added.push(await uploadToStorage(file, "image", folder));
      } catch (e) {
        setError(e instanceof Error ? `${file.name}: ${e.message}` : "Ошибка загрузки.");
      }
    }
    setUrls((u) => [...u, ...added]);
    setBusy(false);
  };

  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      <p className="text-sm text-muted">{hint ?? UPLOAD_RULES.image.label}</p>
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}
      {urls.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {urls.map((u, i) => (
            <li key={u} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- предпросмотр загруженного файла */}
              <img src={u} alt="" className="size-24 rounded-felt border border-line object-cover" />
              <button
                type="button"
                onClick={() => setUrls((list) => list.filter((x) => x !== u))}
                className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-wine text-milk"
                aria-label={`Убрать фото ${i + 1}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <label htmlFor={id} className="btn btn-outline mt-3 cursor-pointer text-wine">
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Upload className="size-5" aria-hidden />}
        {busy ? "Загрузка…" : "Добавить фотографии"}
        <input
          id={id}
          type="file"
          multiple
          className="sr-only"
          accept={UPLOAD_RULES.image.types.join(",")}
          disabled={busy}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-wine">
          {error}
        </p>
      )}
    </div>
  );
}
