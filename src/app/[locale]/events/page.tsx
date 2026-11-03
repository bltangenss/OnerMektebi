import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { PageHero } from "@/components/ui/PageHero";
import { getEventGroups } from "@/lib/content";
import { dateParts, formatTime, hasTime, isToday } from "@/lib/dates";
import { getDictionary, href, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

// Деление событий на предстоящие и прошедшие пересчитывается раз в час.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/events", title: dict.events.heading, description: dict.meta.eventsDescription });
}

export default async function EventsPage({ params }: PageProps<"/[locale]/events">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const { upcoming, past } = await getEventGroups();

  // «Өнер күнтізбесі»: компактный список ближайших событий по месяцам.
  const months = new Map<string, typeof upcoming>();
  for (const e of upcoming) {
    const p = dateParts(e.startsAt, locale);
    const key = `${p.monthLong} ${p.year}`;
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  return (
    <>
      <PageHero title={dict.events.heading} lead={dict.events.lead} tone="sand" />

      <div className="shell grid gap-16 py-14 md:py-20 lg:grid-cols-[0.75fr_1.6fr] lg:gap-16">
        <aside aria-labelledby="calendar-title" className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="calendar-title" className="display text-[2.8rem] text-wine">
            {dict.events.calendar}
          </h2>
          {months.size ? (
            <div className="mt-6 space-y-8">
              {[...months].map(([month, list]) => (
                <div key={month}>
                  <h3 className="text-sm font-semibold tracking-[0.06em] text-muted first-letter:uppercase">{month}</h3>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {list.map((e) => {
                      const p = dateParts(e.startsAt, locale);
                      return (
                        <li key={e.slug}>
                          <Link href={href(locale, `/events/${e.slug}`)} className="group flex items-center gap-4 py-3 no-underline">
                            <span className="display w-10 text-center text-[2rem] leading-none text-wine">{p.day}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-ink group-hover:text-wine">{t(e.title, locale)}</span>
                              <span className="text-sm text-muted">
                                {dict.events.categories[e.category]}
                                {hasTime(e.startsAt) && ` · ${formatTime(e.startsAt, locale)}`}
                                {isToday(e.startsAt) && ` · ${dict.events.today}`}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-muted">{dict.events.calendarEmpty}</p>
          )}
        </aside>

        <div className="space-y-16">
          {!upcoming.length && !past.length && <p className="text-lg text-muted">{dict.events.empty}</p>}
          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-title">
              <h2 id="upcoming-title" className="display text-[clamp(2.6rem,7vw,4rem)]">
                {dict.events.upcoming}
              </h2>
              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {upcoming.map((e) => (
                  <li key={e.slug} className="rise">
                    <EventCard event={e} locale={locale} dict={dict} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section aria-labelledby="past-title">
              <h2 id="past-title" className="display text-[clamp(2.6rem,7vw,4rem)]">
                {dict.events.past}
              </h2>
              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {past.map((e) => (
                  <li key={e.slug} className="rise">
                    <EventCard event={e} locale={locale} dict={dict} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
