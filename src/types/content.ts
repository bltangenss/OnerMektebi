export const locales = ["kk", "ru"] as const;
export type Locale = (typeof locales)[number];

export type Localized = Record<Locale, string>;

export type DirectionTheme = "strings" | "voices" | "brush" | "plain";

export type DirectionSection = {
  heading: Localized;
  body: Localized;
};

/**
 * Универсальная структура направления: новое направление — это новая запись,
 * а не новая страница.
 */
export type Direction = {
  slug: string;
  sortOrder: number;
  theme: DirectionTheme;
  name: Localized;
  title: Localized;
  summary: Localized;
  sections: DirectionSection[];
  image?: string;
  teacherIds: string[];
  published: boolean;
};

export type Teacher = {
  id: string;
  sortOrder: number;
  name: Localized;
  role: Localized;
  bio?: Localized;
  photo?: string;
  published: boolean;
};

export type WorkKind = "image" | "video" | "audio";

export type Work = {
  id: string;
  kind: WorkKind;
  directionSlug: string;
  title: Localized;
  description?: Localized;
  /** Изображение работы или превью выступления. */
  image?: string;
  /** Файл видео или аудио. */
  mediaUrl?: string;
  /** Идентификатор YouTube для видео, размещённых вне сайта. */
  youtubeId?: string;
  /** Показывается только с разрешения родителей; иначе работа анонимна. */
  authorName?: Localized;
  publishedAt: string;
  /** Согласие родителей или законных представителей получено. */
  consent: boolean;
  published: boolean;
  isDemo?: boolean;
};

export const eventCategories = [
  "concert",
  "exhibition",
  "contest",
  "event",
  "announcement",
] as const;
export type EventCategory = (typeof eventCategories)[number];

export type SchoolEvent = {
  slug: string;
  category: EventCategory;
  title: Localized;
  summary: Localized;
  body?: Localized;
  /** Дата YYYY-MM-DD или полный ISO с часовым поясом. */
  startsAt: string;
  place?: Localized;
  image?: string;
  gallery: string[];
  published: boolean;
  isDemo?: boolean;
};

export type Achievement = {
  id: string;
  title: Localized;
  year?: string;
};

export type HistoryEntry = {
  year: string;
  text: Localized;
};

/** Только подтверждённые сведения. Пустое поле на сайте не показывается. */
export type SiteSettings = {
  address?: Localized;
  phone?: string;
  /** Номер WhatsApp в международном формате, только цифры: 77XXXXXXXXX */
  whatsapp?: string;
  instagram?: string;
  otherSocial?: { label: string; url: string }[];
  hours?: Localized;
  /** Ссылка для встраивания карты (2ГИС, Google Maps). */
  mapEmbedUrl?: string;
  /** Обычная ссылка на карту. */
  mapUrl?: string;
};
