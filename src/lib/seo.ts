import type { Metadata } from "next";
import { getDictionary, locales, type Locale } from "./i18n";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

type Options = {
  locale: Locale;
  /** Путь без языка: "/about", "/" для главной. */
  path: string;
  title?: string;
  description: string;
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata({ locale, path, title, description, image, noIndex }: Options): Metadata {
  const dict = getDictionary(locale);
  const suffix = path === "/" ? "" : path;
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${suffix}`]));
  const fullTitle = title ? `${title} — ${dict.meta.siteName}` : dict.meta.homeTitle;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: { ...languages, "x-default": `/kk${suffix}` },
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title: fullTitle,
      description,
      url: `/${locale}${suffix}`,
      locale: locale === "kk" ? "kk_KZ" : "ru_RU",
      alternateLocale: locale === "kk" ? ["ru_RU"] : ["kk_KZ"],
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
