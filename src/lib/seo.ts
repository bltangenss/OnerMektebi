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
      // Без своей картинки страница берёт общее превью языковой версии.
      images: [image ? { url: image } : { url: `/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
