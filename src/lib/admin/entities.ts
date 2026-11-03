/**
 * Описание разделов админки. Форма, список и сохранение строятся по этим
 * описаниям, поэтому новый тип контента — это новая запись здесь.
 */

export type FileKind = "image" | "audio" | "video";

export type Field =
  | { name: string; label: string; type: "localized"; required?: boolean; multiline?: boolean; hint?: string }
  | { name: string; label: string; type: "text"; required?: boolean; hint?: string; pattern?: RegExp; patternHint?: string }
  | { name: string; label: string; type: "number"; hint?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean }
  | { name: string; label: string; type: "checkbox"; hint?: string }
  | { name: string; label: string; type: "date"; required?: boolean }
  | { name: string; label: string; type: "time"; hint?: string }
  | { name: string; label: string; type: "file"; accept: FileKind | "media"; hint?: string }
  | { name: string; label: string; type: "gallery"; hint?: string }
  | { name: string; label: string; type: "sections" }
  | { name: string; label: string; type: "teachers" }
  | { name: string; label: string; type: "direction" };

export type Entity = {
  key: string;
  table: string;
  title: string;
  singular: string;
  description: string;
  orderBy: { column: string; ascending: boolean };
  fields: Field[];
  /** Публичный адрес записи — показывается рядом, например для QR-кода. */
  publicPath?: (row: Record<string, unknown>) => string;
};

const SLUG = /^[a-z0-9-]+$/;
const SLUG_HINT = "Латинские буквы, цифры и дефис: new-year-concert";

export const entities: Entity[] = [
  {
    key: "events",
    table: "events",
    title: "События и новости",
    singular: "событие",
    description: "Концерты, выставки, конкурсы, объявления.",
    orderBy: { column: "event_date", ascending: false },
    publicPath: (r) => `/kk/events/${r.slug}`,
    fields: [
      { name: "title", label: "Название", type: "localized", required: true },
      { name: "slug", label: "Адрес страницы", type: "text", required: true, pattern: SLUG, patternHint: SLUG_HINT },
      {
        name: "category",
        label: "Категория",
        type: "select",
        required: true,
        options: [
          { value: "concert", label: "Концерт" },
          { value: "exhibition", label: "Выставка" },
          { value: "contest", label: "Конкурс" },
          { value: "event", label: "Мероприятие" },
          { value: "announcement", label: "Объявление" },
        ],
      },
      { name: "event_date", label: "Дата", type: "date", required: true },
      { name: "event_time", label: "Время начала", type: "time", hint: "Можно оставить пустым" },
      { name: "place", label: "Место проведения", type: "localized" },
      { name: "summary", label: "Короткое описание", type: "localized", required: true, multiline: true },
      { name: "body", label: "Полный текст", type: "localized", multiline: true },
      { name: "image", label: "Афиша или главное фото", type: "file", accept: "image" },
      { name: "gallery", label: "Фотографии мероприятия", type: "gallery" },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
  {
    key: "works",
    table: "works",
    title: "Работы учеников",
    singular: "работу",
    description: "Рисунки, видео выступлений, аудиозаписи кюев.",
    orderBy: { column: "published_at", ascending: false },
    fields: [
      { name: "title", label: "Название работы", type: "localized", required: true },
      {
        name: "kind",
        label: "Тип",
        type: "select",
        required: true,
        options: [
          { value: "image", label: "Рисунок или фото" },
          { value: "video", label: "Видео" },
          { value: "audio", label: "Аудио" },
        ],
      },
      { name: "direction_slug", label: "Направление", type: "direction" },
      { name: "description", label: "Описание", type: "localized", multiline: true },
      { name: "image", label: "Изображение или обложка", type: "file", accept: "image" },
      { name: "media_url", label: "Видео- или аудиофайл", type: "file", accept: "media", hint: "MP4, WebM, MP3, M4A, WAV до 50 МБ" },
      { name: "youtube_id", label: "Или код видео YouTube", type: "text", hint: "Из ссылки youtube.com/watch?v=КОД" },
      {
        name: "author_name",
        label: "Имя автора",
        type: "localized",
        hint: "Только с письменного разрешения родителей. Оставьте пустым, чтобы работа была анонимной.",
      },
      { name: "published_at", label: "Дата публикации", type: "date", required: true },
      {
        name: "consent",
        label: "Родители или законные представители дали согласие на публикацию",
        type: "checkbox",
        hint: "Без согласия работа не появится на сайте.",
      },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
  {
    key: "directions",
    table: "directions",
    title: "Направления",
    singular: "направление",
    description: "Кюй, айтыс, рисование и новые направления.",
    orderBy: { column: "sort_order", ascending: true },
    publicPath: (r) => `/kk/directions/${r.slug}`,
    fields: [
      { name: "name", label: "Короткое название", type: "localized", required: true },
      { name: "slug", label: "Адрес страницы", type: "text", required: true, pattern: SLUG, patternHint: SLUG_HINT },
      { name: "title", label: "Заголовок страницы", type: "localized", required: true },
      { name: "summary", label: "Краткое описание", type: "localized", required: true, multiline: true },
      {
        name: "theme",
        label: "Оформление",
        type: "select",
        options: [
          { value: "plain", label: "Обычное (рога-орнамент)" },
          { value: "strings", label: "Струны домбры" },
          { value: "voices", label: "Два голоса (айтыс)" },
          { value: "brush", label: "Мазок кисти" },
        ],
      },
      { name: "sections", label: "Разделы страницы", type: "sections" },
      { name: "image", label: "Фотография", type: "file", accept: "image", hint: "Если пусто — показывается рисунок-орнамент" },
      { name: "teacher_ids", label: "Педагоги направления", type: "teachers" },
      { name: "sort_order", label: "Порядок в списке", type: "number" },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
  {
    key: "teachers",
    table: "teachers",
    title: "Педагоги",
    singular: "педагога",
    description: "Карточки преподавателей.",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "ФИО", type: "localized", required: true },
      { name: "role", label: "Направление или должность", type: "localized", required: true },
      { name: "bio", label: "Коротко об опыте", type: "localized", multiline: true, hint: "Только подтверждённые сведения" },
      { name: "photo", label: "Фотография", type: "file", accept: "image" },
      { name: "sort_order", label: "Порядок в списке", type: "number" },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
  {
    key: "achievements",
    table: "achievements",
    title: "Достижения",
    singular: "достижение",
    description: "Только настоящие награды, дипломы и выступления.",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "title", label: "Название", type: "localized", required: true },
      { name: "year", label: "Год", type: "text" },
      { name: "sort_order", label: "Порядок", type: "number" },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
  {
    key: "history",
    table: "history",
    title: "История школы",
    singular: "событие истории",
    description: "Подтверждённые даты для временной шкалы на странице «О школе».",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "year", label: "Год", type: "text", required: true },
      { name: "text", label: "Что произошло", type: "localized", required: true, multiline: true },
      { name: "sort_order", label: "Порядок", type: "number" },
      { name: "published", label: "Опубликовано на сайте", type: "checkbox" },
    ],
  },
];

export function getEntity(key: string): Entity | undefined {
  return entities.find((e) => e.key === key);
}

/** Как называть запись в списке. */
export function rowTitle(row: Record<string, unknown>): string {
  const pick = (v: unknown) =>
    v && typeof v === "object" && "kk" in v ? String((v as { kk?: string; ru?: string }).kk || (v as { ru?: string }).ru || "") : "";
  return pick(row.title) || pick(row.name) || String(row.year ?? row.slug ?? "—");
}
