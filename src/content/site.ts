import type {
  Achievement,
  HistoryEntry,
  SiteSettings,
  Teacher,
} from "@/types/content";

/**
 * Контент по умолчанию, пока Supabase не подключён.
 * Заполняйте только подтверждённые данные: пустое поле на сайте не появится,
 * а кнопка WhatsApp заработает, как только будет указан номер.
 *
 * Пример:
 *   whatsapp: "77001234567",
 *   instagram: "https://instagram.com/...",
 *   address: { kk: "Түркістан қ., ...", ru: "г. Туркестан, ..." },
 */
export const siteSettings: SiteSettings = {};

/** Карточки появятся на сайте, как только школа подтвердит сведения. */
export const teachers: Teacher[] = [];

/** Только настоящие награды, грамоты и выступления. */
export const achievements: Achievement[] = [];

/** Только подтверждённые даты. Пустой список скрывает раздел. */
export const history: HistoryEntry[] = [];
