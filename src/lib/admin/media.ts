import { MEDIA_BUCKET, supabaseUrl } from "@/lib/supabase/env";
import type { FileKind } from "./entities";

/** Разрешённые типы и размеры. Те же ограничения дублирует сам бакет Storage. */
export const UPLOAD_RULES: Record<FileKind | "media", { types: string[]; maxMb: number; label: string }> = {
  image: { types: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxMb: 10, label: "JPG, PNG, WebP до 10 МБ" },
  audio: { types: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg"], maxMb: 30, label: "MP3, M4A, WAV до 30 МБ" },
  video: { types: ["video/mp4", "video/webm"], maxMb: 50, label: "MP4, WebM до 50 МБ" },
  media: {
    types: ["video/mp4", "video/webm", "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg"],
    maxMb: 50,
    label: "MP4, WebM, MP3, M4A, WAV до 50 МБ",
  },
};

export const publicMediaPrefix = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/`;

/** Принимаем только ссылки на собственный бакет — чужие адреса в контент не попадут. */
export function isOwnMediaUrl(url: string): boolean {
  return Boolean(supabaseUrl) && url.startsWith(publicMediaPrefix) && !url.includes("..");
}

export function mediaPath(url: string): string | undefined {
  return isOwnMediaUrl(url) ? decodeURIComponent(url.slice(publicMediaPrefix.length)) : undefined;
}
