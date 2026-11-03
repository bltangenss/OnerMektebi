import kk, { type Dictionary } from "@/locales/kk";
import ru from "@/locales/ru";
import { locales, type Locale, type Localized } from "@/types/content";

export { locales, type Locale };
export const defaultLocale: Locale = "kk";

const dictionaries: Record<Locale, Dictionary> = { kk, ru };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Возвращает перевод; если он пуст, показывает казахский вариант. */
export function t(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() || value[defaultLocale] || "";
}

export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

/** Ссылка внутри сайта с учётом языка: href("ru", "/events") → "/ru/events". */
export function href(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Тот же адрес на другом языке, чтобы переключение не уводило на главную. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) {
    parts[1] = target;
    return parts.join("/") || `/${target}`;
  }
  return href(target, pathname);
}

export const htmlLang: Record<Locale, string> = { kk: "kk", ru: "ru" };
export const intlLocale: Record<Locale, string> = { kk: "kk-KZ", ru: "ru-RU" };
