import type { WorkKind } from "@/types/content";
import type { PlayerLabels } from "./AudioPlayer";

/** Работа, уже переведённая на язык страницы: так её получает клиент. */
export type GalleryWork = {
  id: string;
  kind: WorkKind;
  category: string;
  categoryName: string;
  title: string;
  description?: string;
  image?: string;
  mediaUrl?: string;
  youtubeId?: string;
  author?: string;
  date: string;
  isDemo?: boolean;
};

export type GalleryLabels = PlayerLabels & {
  all: string;
  filterLabel: string;
  anonymous: string;
  kinds: Record<WorkKind, string>;
  open: string;
  close: string;
  prev: string;
  next: string;
  demoBadge: string;
  videoFallback: string;
  exhibition: string;
  exhibitionText: string;
  exhibitionOpen: string;
};
