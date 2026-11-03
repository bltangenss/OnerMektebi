import type { GalleryLabels, GalleryWork } from "@/components/gallery/types";
import type { Dictionary } from "@/locales/kk";
import type { Direction, Work } from "@/types/content";
import { formatDate } from "./dates";
import { t, type Locale } from "./i18n";

export function toGalleryWorks(works: Work[], directions: Direction[], locale: Locale): GalleryWork[] {
  return works.map((w) => {
    const direction = directions.find((d) => d.slug === w.directionSlug);
    return {
      id: w.id,
      kind: w.kind,
      category: w.directionSlug,
      categoryName: direction ? t(direction.name, locale) : w.directionSlug,
      title: t(w.title, locale),
      description: t(w.description, locale) || undefined,
      image: w.image,
      mediaUrl: w.mediaUrl,
      youtubeId: w.youtubeId,
      author: t(w.authorName, locale) || undefined,
      date: formatDate(w.publishedAt, locale),
      isDemo: w.isDemo,
    };
  });
}

export function galleryLabels(dict: Dictionary): GalleryLabels {
  return {
    ...dict.viewer,
    all: dict.talents.all,
    filterLabel: dict.talents.filterLabel,
    anonymous: dict.talents.anonymous,
    kinds: dict.talents.kinds,
    open: dict.talents.open,
    demoBadge: dict.ui.demoBadge,
    exhibition: dict.talents.exhibition,
    exhibitionText: dict.talents.exhibitionText,
    exhibitionOpen: dict.talents.exhibitionOpen,
  };
}
