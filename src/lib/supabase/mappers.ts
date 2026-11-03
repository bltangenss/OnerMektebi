import type {
  Achievement,
  Direction,
  DirectionSection,
  DirectionTheme,
  EventCategory,
  HistoryEntry,
  Localized,
  SchoolEvent,
  SiteSettings,
  Teacher,
  Work,
  WorkKind,
} from "@/types/content";

/** Строки таблиц Supabase (см. supabase/schema.sql). */
export type DirectionRow = {
  id: string;
  slug: string;
  sort_order: number;
  theme: DirectionTheme;
  name: Localized;
  title: Localized;
  summary: Localized;
  sections: DirectionSection[] | null;
  image: string | null;
  teacher_ids: string[] | null;
  published: boolean;
};

export type TeacherRow = {
  id: string;
  sort_order: number;
  name: Localized;
  role: Localized;
  bio: Localized | null;
  photo: string | null;
  published: boolean;
};

export type WorkRow = {
  id: string;
  kind: WorkKind;
  direction_slug: string;
  title: Localized;
  description: Localized | null;
  image: string | null;
  media_url: string | null;
  youtube_id: string | null;
  author_name: Localized | null;
  published_at: string;
  consent: boolean;
  published: boolean;
};

export type EventRow = {
  id: string;
  slug: string;
  category: EventCategory;
  title: Localized;
  summary: Localized;
  body: Localized | null;
  event_date: string;
  event_time: string | null;
  place: Localized | null;
  image: string | null;
  gallery: string[] | null;
  published: boolean;
};

export type AchievementRow = { id: string; title: Localized; year: string | null; sort_order: number; published: boolean };
export type HistoryRow = { id: string; year: string; text: Localized; sort_order: number; published: boolean };
export type SettingsRow = { id: number; data: SiteSettings };

const opt = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);
const hasText = (v: Localized | null | undefined) => (v && (v.kk?.trim() || v.ru?.trim()) ? v : undefined);

export const toDirection = (r: DirectionRow): Direction => ({
  slug: r.slug,
  sortOrder: r.sort_order,
  theme: r.theme,
  name: r.name,
  title: r.title,
  summary: r.summary,
  sections: r.sections ?? [],
  image: opt(r.image),
  teacherIds: r.teacher_ids ?? [],
  published: r.published,
});

export const toTeacher = (r: TeacherRow): Teacher => ({
  id: r.id,
  sortOrder: r.sort_order,
  name: r.name,
  role: r.role,
  bio: hasText(r.bio),
  photo: opt(r.photo),
  published: r.published,
});

export const toWork = (r: WorkRow): Work => ({
  id: r.id,
  kind: r.kind,
  directionSlug: r.direction_slug,
  title: r.title,
  description: hasText(r.description),
  image: opt(r.image),
  mediaUrl: opt(r.media_url),
  youtubeId: opt(r.youtube_id),
  authorName: hasText(r.author_name),
  publishedAt: r.published_at,
  consent: r.consent,
  published: r.published,
});

export const toEvent = (r: EventRow): SchoolEvent => ({
  slug: r.slug,
  category: r.category,
  title: r.title,
  summary: r.summary,
  body: hasText(r.body),
  startsAt: r.event_time ? `${r.event_date}T${r.event_time.slice(0, 5)}:00+05:00` : r.event_date,
  place: hasText(r.place),
  image: opt(r.image),
  gallery: r.gallery ?? [],
  published: r.published,
});

export const toAchievement = (r: AchievementRow): Achievement => ({
  id: r.id,
  title: r.title,
  year: opt(r.year),
});

export const toHistory = (r: HistoryRow): HistoryEntry => ({ year: r.year, text: r.text });
