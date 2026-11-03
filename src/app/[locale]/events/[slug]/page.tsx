import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus, Clock, MapPin, MessageCircle, Printer, Share2 } from "lucide-react";
import { Seam } from "@/components/art/Seam";
import { CopyLink } from "@/components/events/CopyLink";
import { Gallery } from "@/components/gallery/Gallery";
import { Picture } from "@/components/ui/Picture";
import { getEvent, getEvents, getSettings } from "@/lib/content";
import { dateParts, formatDate, formatTime, hasTime, isPast } from "@/lib/dates";
import { galleryLabels } from "@/lib/gallery";
import { format, getDictionary, href, isLocale, locales, t } from "@/lib/i18n";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

type Props = PageProps<"/[locale]/events/[slug]">;

export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  return locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const event = await getEvent(slug);
  if (!event) return {};
  return pageMetadata({
    locale,
    path: `/events/${slug}`,
    title: t(event.title, locale),
    description: `${formatDate(event.startsAt, locale)}. ${t(event.summary, locale)}`,
    image: event.image,
    noIndex: event.isDemo,
  });
}

export default async function EventPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const event = await getEvent(slug);
  if (!event) notFound();

  const dict = getDictionary(locale);
  const settings = await getSettings();
  const title = t(event.title, locale);
  const d = dateParts(event.startsAt, locale);
  const past = isPast(event.startsAt);
  const place = t(event.place, locale);
  const body = t(event.body, locale);
  const wa = whatsappLink(settings.whatsapp, format(dict.contact.messageEvent, { name: title }));
  const gallery = event.gallery.map((src, i) => ({
    id: `${event.slug}-${i}`,
    kind: "image" as const,
    category: event.category,
    categoryName: dict.events.categories[event.category],
    title: `${title} · ${i + 1}`,
    image: src,
    date: formatDate(event.startsAt, locale),
    isDemo: event.isDemo,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description: t(event.summary, locale),
    startDate: event.startsAt,
    eventStatus: "https://schema.org/EventScheduled",
    ...(place ? { location: { "@type": "Place", name: place } } : {}),
    ...(event.image ? { image: [new URL(event.image, siteUrl).toString()] } : {}),
    organizer: { "@type": "Organization", name: dict.meta.siteName, url: `${siteUrl}/${locale}` },
  };

  return (
    <article>
      {!event.isDemo && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <header className="on-dark bg-wine text-milk">
        <div className="shell pt-8 pb-12 md:pt-12 md:pb-16">
          <Link href={href(locale, "/events")} className="inline-flex min-h-11 items-center gap-2 text-muted-on-dark no-underline hover:text-milk">
            <ArrowLeft className="size-5" aria-hidden />
            {dict.nav.events}
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-14">
            <p className="display flex items-end gap-4 text-gold" aria-hidden>
              <span className="text-[clamp(7rem,22vw,13rem)] leading-[0.78]">{d.day}</span>
              <span className="pb-2 text-[clamp(2rem,5vw,3.2rem)] leading-none">
                {d.monthLong}
                <br />
                {d.year}
              </span>
            </p>
            <div>
              <p className="text-muted-on-dark">
                {dict.events.categories[event.category]}
                {event.isDemo && ` · ${dict.ui.demoBadge}`}
              </p>
              <h1 className="display mt-2 text-[clamp(3rem,8vw,5.5rem)]">{title}</h1>
            </div>
          </div>
        </div>
        <Seam top="var(--color-wine)" bottom="var(--color-milk)" />
      </header>

      <div className="shell grid gap-12 py-12 md:py-16 lg:grid-cols-[1.4fr_0.8fr] lg:gap-16">
        <div>
          <p
            role="status"
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${past ? "bg-sand text-muted" : "bg-gold text-ink"}`}
          >
            {past ? dict.events.pastNotice : dict.events.upcomingNotice}
          </p>
          <p className="measure mt-6 text-xl leading-relaxed text-ink-soft">{t(event.summary, locale)}</p>
          {event.image && (
            <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-felt bg-sand">
              <Picture src={event.image} alt={title} sizes="(min-width: 1024px) 60vw, 100vw" priority />
            </div>
          )}
          {body && <div className="measure mt-10 space-y-4 text-lg leading-relaxed whitespace-pre-line">{body}</div>}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <dl className="space-y-5 rounded-felt bg-sand p-6 md:p-8">
            <div className="flex gap-4">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-wine" aria-hidden />
              <div>
                <dt className="text-sm text-muted">{dict.events.when}</dt>
                <dd className="font-semibold">{formatDate(event.startsAt, locale)}</dd>
              </div>
            </div>
            {hasTime(event.startsAt) && (
              <div className="flex gap-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-wine" aria-hidden />
                <div>
                  <dt className="sr-only">{dict.events.when}</dt>
                  <dd className="font-semibold tabular-nums">{formatTime(event.startsAt, locale)}</dd>
                </div>
              </div>
            )}
            {place && (
              <div className="flex gap-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-wine" aria-hidden />
                <div>
                  <dt className="text-sm text-muted">{dict.events.where}</dt>
                  <dd className="font-semibold">{place}</dd>
                </div>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <MessageCircle className="size-5" aria-hidden />
                {dict.events.organizers}
              </a>
            ) : (
              <Link href={href(locale, "/contact")} className="btn btn-primary">
                {dict.events.organizers}
              </Link>
            )}
            {!past && (
              <a href={`${href(locale, `/events/${slug}`)}/calendar`} download className="btn btn-outline text-wine">
                <CalendarPlus className="size-5" aria-hidden />
                {dict.events.addToCalendar}
              </a>
            )}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${formatDate(event.startsAt, locale)}\n${siteUrl}/${locale}/events/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-wine"
            >
              <Share2 className="size-5" aria-hidden />
              {dict.events.shareWhatsapp}
            </a>
            <CopyLink label={dict.events.share} copiedLabel={dict.events.copied} />
            <Link href={`${href(locale, `/events/${slug}`)}/poster`} className="inline-flex min-h-11 items-center justify-center gap-2 text-sm text-muted hover:text-wine">
              <Printer className="size-4" aria-hidden />
              {dict.events.poster}
            </Link>
          </div>
        </aside>
      </div>

      {gallery.length > 0 && (
        <section aria-labelledby="event-gallery" className="shell pb-20 md:pb-28">
          <h2 id="event-gallery" className="display text-[clamp(2.4rem,6vw,3.6rem)]">
            {dict.events.gallery}
          </h2>
          <div className="mt-8">
            <Gallery works={gallery} categories={[]} labels={galleryLabels(dict)} showFilters={false} />
          </div>
        </section>
      )}
    </article>
  );
}
