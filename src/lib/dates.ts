import { intlLocale, type Locale } from "./i18n";

const TIME_ZONE = "Asia/Almaty";

function parse(value: string): Date {
  // Дата без времени трактуется как полдень по Туркестану, чтобы не съезжать на день.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+05:00`) : new Date(value);
}

export function hasTime(value: string): boolean {
  return !/^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(parse(value));
}

export function formatTime(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(parse(value));
}

/** Части даты для афиши: число и месяц крупно. */
export function dateParts(value: string, locale: Locale) {
  const d = parse(value);
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale[locale], { ...o, timeZone: TIME_ZONE }).format(d);
  return {
    day: fmt({ day: "numeric" }),
    month: fmt({ month: "short" }).replace(".", ""),
    monthLong: fmt({ month: "long" }),
    year: fmt({ year: "numeric" }),
  };
}

function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
}

/** Событие считается прошедшим со следующего дня после даты проведения. */
export function isPast(value: string, now = new Date()): boolean {
  return dayKey(parse(value)) < dayKey(now);
}

export function isToday(value: string, now = new Date()): boolean {
  return dayKey(parse(value)) === dayKey(now);
}

export function toTimestamp(value: string): number {
  return parse(value).getTime();
}
