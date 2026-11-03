import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Fira_Sans_Extra_Condensed, Onest } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getContactAction } from "@/lib/contact";
import { isDemoMode } from "@/lib/content";
import { getDictionary, href, htmlLang, isLocale, locales } from "@/lib/i18n";
import { isCmsConfigured } from "@/lib/supabase/env";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "swap",
});

const fira = Fira_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["700"],
  variable: "--font-fira",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f8f6f1",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/icon.svg" },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const contact = await getContactAction(locale);

  return (
    <html lang={htmlLang[locale]} className={`${onest.variable} ${fira.variable}`}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-wine px-4 py-3 text-milk focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {dict.ui.skip}
        </a>
        {isDemoMode && (
          <p className="bg-gold px-4 py-2 text-center text-sm font-medium text-ink">{dict.ui.demoBanner}</p>
        )}
        <Header
          locale={locale}
          dict={{ nav: dict.nav, ui: dict.ui, meta: dict.meta }}
          contactHref={contact.href}
          contactExternal={contact.external}
          applyHref={isCmsConfigured() ? href(locale, "/apply") : undefined}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
