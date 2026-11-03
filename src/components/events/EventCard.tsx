import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import type { Dictionary } from "@/locales/kk";
import { dateParts, isPast } from "@/lib/dates";
import { href, t, type Locale } from "@/lib/i18n";
import type { SchoolEvent } from "@/types/content";

type Props = { event: SchoolEvent; locale: Locale; dict: Dictionary; headingLevel?: "h3" | "h2" };

/** Карточка-афиша: дата крупно, как на бумажной афише. */
export function EventCard({ event, locale, dict, headingLevel: H = "h3" }: Props) {
  const d = dateParts(event.startsAt, locale);
  const past = isPast(event.startsAt);
  const title = t(event.title, locale);

  return (
    <Link
      href={href(locale, `/events/${event.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-felt bg-milk no-underline shadow-[0_1px_0_var(--color-line)] transition-shadow duration-500 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-wine">
        {event.image ? (
          <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            <Picture src={event.image} alt="" sizes="(min-width: 1024px) 33vw, 100vw" />
          </div>
        ) : (
          <div className="on-dark absolute inset-0 flex items-end p-6 text-milk">
            <span className="display text-[6rem] leading-[0.8]">{d.day}</span>
            <span className="display mb-1 ml-3 text-[2rem] text-gold">{d.monthLong}</span>
          </div>
        )}
        {event.isDemo && (
          <span className="absolute top-3 left-3 rounded bg-gold px-2 py-1 text-xs font-semibold text-ink">
            {dict.ui.demoBadge}
          </span>
        )}
      </div>
      <div className="flex flex-1 gap-5 p-6">
        <div className="w-14 shrink-0 text-center text-wine" aria-hidden>
          <p className="display text-[2.8rem] leading-none">{d.day}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em]">{d.month}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-sm text-muted">
            {dict.events.categories[event.category]}
            {past && ` · ${dict.events.past}`}
          </p>
          <H className="mt-1 text-xl font-semibold text-ink group-hover:text-wine">{title}</H>
          <p className="mt-2 flex-1 text-muted">{t(event.summary, locale)}</p>
          <span className="link-arrow mt-4 text-wine">
            {dict.ui.more}
            <span className="sr-only">: {title}</span>
            <ArrowRight className="size-5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
