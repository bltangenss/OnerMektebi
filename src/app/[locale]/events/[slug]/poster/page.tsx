import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { HornPair } from "@/components/art/HornPair";
import { LogoMark } from "@/components/art/Logo";
import { PrintButton } from "@/components/events/PrintButton";
import { getEvent } from "@/lib/content";
import { dateParts, formatTime, hasTime } from "@/lib/dates";
import { getDictionary, href, isLocale, t } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

type Props = PageProps<"/[locale]/events/[slug]/poster">;

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Печатная афиша A4: крупная дата, название и QR-код со ссылкой
 * на страницу события. Распечатать можно прямо из браузера.
 */
export default async function PosterPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const event = await getEvent(slug);
  if (!event) notFound();

  const dict = getDictionary(locale);
  const url = `${siteUrl}/${locale}/events/${slug}`;
  const qr = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#242424", light: "#0000" },
  });
  const d = dateParts(event.startsAt, locale);
  const place = t(event.place, locale);

  return (
    <div className="poster-page bg-sand py-8 print:bg-transparent print:py-0">
      <div className="shell no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={href(locale, `/events/${slug}`)} className="inline-flex min-h-11 items-center gap-2 text-muted no-underline hover:text-wine">
          <ArrowLeft className="size-5" aria-hidden />
          {t(event.title, locale)}
        </Link>
        <PrintButton label={dict.events.print} />
      </div>

      {/* Лист A4 в пропорции 210 × 297 */}
      <article className="poster-sheet relative mx-auto flex aspect-[210/297] w-full max-w-[210mm] flex-col overflow-hidden bg-milk shadow-[var(--shadow-soft)] print:shadow-none">
        <div className="flex flex-1 flex-col bg-wine px-[8%] pt-[8%] pb-[6%] text-milk">
          <p className="flex items-center gap-3 text-[clamp(0.9rem,2.4vw,1.25rem)] text-gold">
            <LogoMark className="size-[1.6em] text-milk" />
            {dict.meta.siteName} · {dict.events.categories[event.category]}
          </p>
          <p className="display mt-auto flex items-end gap-[0.12em] text-gold">
            <span className="text-[clamp(6rem,30vw,15rem)] leading-[0.78]">{d.day}</span>
            <span className="pb-[0.2em] text-[clamp(1.6rem,7vw,3.6rem)] leading-none">
              {d.monthLong}
              <br />
              {d.year}
            </span>
          </p>
          <h1 className="display mt-[6%] text-[clamp(2.6rem,10vw,5.4rem)] leading-[0.92]">{t(event.title, locale)}</h1>
        </div>

        <svg viewBox="0 0 400 60" className="block w-full" aria-hidden>
          <rect width="400" height="30" fill="var(--color-wine)" />
          <rect y="30" width="400" height="30" fill="var(--color-milk)" />
          <HornPair cx={110} baseY={30} scale={0.26} fill="var(--color-milk)" />
          <HornPair cx={290} baseY={30} scale={0.26} fill="var(--color-wine)" hanging />
        </svg>

        <div className="grid grid-cols-[1fr_auto] items-end gap-[6%] px-[8%] pt-[4%] pb-[7%]">
          <div className="space-y-2 text-[clamp(0.95rem,2.6vw,1.35rem)]">
            {hasTime(event.startsAt) && <p className="display text-[2em] leading-none text-wine">{formatTime(event.startsAt, locale)}</p>}
            {place && <p className="font-semibold">{place}</p>}
            <p className="text-muted">{t(event.summary, locale)}</p>
          </div>
          <div className="w-[clamp(6rem,24vw,9.5rem)] text-center">
            <div className="aspect-square w-full [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="mt-2 text-[clamp(0.6rem,1.6vw,0.8rem)] leading-tight text-muted">{dict.events.posterScan}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
