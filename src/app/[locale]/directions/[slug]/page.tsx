import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HORN_PATH } from "@/components/art/horn-path";
import { ScrollStrings } from "@/components/art/ScrollStrings";
import { DirectionHero } from "@/components/directions/DirectionHero";
import { Gallery } from "@/components/gallery/Gallery";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { getContactAction } from "@/lib/contact";
import { getDirection, getDirections, getTeachers, getWorks } from "@/lib/content";
import { galleryLabels, toGalleryWorks } from "@/lib/gallery";
import { getDictionary, href, isLocale, locales, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Direction } from "@/types/content";

type Props = PageProps<"/[locale]/directions/[slug]">;

export async function generateStaticParams() {
  const directions = await getDirections();
  return locales.flatMap((locale) => directions.map((d) => ({ locale, slug: d.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const direction = await getDirection(slug);
  if (!direction) return {};
  return pageMetadata({
    locale,
    path: `/directions/${slug}`,
    title: t(direction.name, locale),
    description: t(direction.summary, locale),
    image: direction.image,
  });
}

export default async function DirectionPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const direction = await getDirection(slug);
  if (!direction) notFound();

  const dict = getDictionary(locale);
  const name = t(direction.name, locale);
  const [all, teachers, works, contact] = await Promise.all([
    getDirections(),
    getTeachers(),
    getWorks(),
    getContactAction(locale, name),
  ]);
  const own = teachers.filter((tc) => direction.teacherIds.includes(tc.id));
  const ownWorks = toGalleryWorks(works.filter((w) => w.directionSlug === slug), all, locale);
  const others = all.filter((d) => d.slug !== slug);

  return (
    <>
      <DirectionHero
        direction={direction}
        title={t(direction.title, locale)}
        summary={t(direction.summary, locale)}
        hint={dict.hero.stringsHint}
      />

      <div className="relative">
        {direction.theme === "strings" && (
          <ScrollStrings className="pointer-events-none absolute top-0 bottom-0 left-2 hidden h-full w-[18px] md:block lg:left-[max(1rem,calc((100vw-82rem)/2-1rem))]" />
        )}
        <Sections direction={direction} locale={locale} />
      </div>

      <section aria-labelledby="teacher-title" className="shell pb-20 md:pb-28">
        <div className="border-t border-line pt-14">
          <h2 id="teacher-title" className="display text-[clamp(2.6rem,7vw,4rem)]">
            {dict.directions.teacher}
          </h2>
          {own.length ? (
            <ul className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {own.map((tc) => (
                <li key={tc.id}>
                  <TeacherCard teacher={tc} locale={locale} withBio />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-lg text-muted">{dict.directions.teacherEmpty}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="works-title" className="shell pb-20 md:pb-28">
        <div className="border-t border-line pt-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="works-title" className="display text-[clamp(2.6rem,7vw,4rem)]">
              {dict.directions.works}
            </h2>
            {ownWorks.length > 0 && (
              <Link href={href(locale, "/talents")} className="link-arrow text-wine">
                {dict.talents.viewAll}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            )}
          </div>
          <div className="mt-10">
            {ownWorks.length ? (
              <Gallery works={ownWorks.slice(0, 6)} categories={[]} labels={galleryLabels(dict)} showFilters={false} />
            ) : (
              <p className="text-lg text-muted">{dict.directions.worksEmpty}</p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="join-title" className="on-dark bg-wine text-milk">
        <div className="shell grid gap-8 py-16 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h2 id="join-title" className="display text-[clamp(2.8rem,8vw,5rem)]">
              {dict.directions.joinHeading}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-muted-on-dark">{dict.directions.joinText}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            {contact.isWhatsapp && (
              <a href={contact.href} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                <MessageCircle className="size-5" aria-hidden />
                {dict.directions.joinWhatsapp}
              </a>
            )}
            <Link href={href(locale, "/contact")} className="btn btn-outline">
              {dict.directions.joinContacts}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <nav aria-label={dict.directions.others} className="shell py-16 md:py-20">
          <h2 className="text-lg font-semibold text-muted">{dict.directions.others}</h2>
          <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-10">
            {others.map((d) => (
              <li key={d.slug}>
                <Link
                  href={href(locale, `/directions/${d.slug}`)}
                  className="group display inline-flex items-center gap-3 text-[3rem] text-wine no-underline"
                >
                  {t(d.name, locale)}
                  <ArrowRight className="size-7 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}

/** Разделы направления. Айтыс построен как обмен репликами двух голосов. */
function Sections({ direction, locale }: { direction: Direction; locale: "kk" | "ru" }) {
  if (direction.theme === "voices") {
    return (
      <div className="shell py-16 md:py-24">
        <ol className="space-y-14 md:space-y-20">
          {direction.sections.map((s, i) => {
            const right = i % 2 === 1;
            return (
              <li key={i} className={`rise flex gap-5 md:w-[62%] ${right ? "md:ml-auto md:flex-row-reverse md:text-right" : ""}`}>
                <svg viewBox="0 0 100 100" className="mt-2 size-10 shrink-0" aria-hidden style={right ? { transform: "scaleX(-1)" } : undefined}>
                  <path d={HORN_PATH} fill={right ? "var(--color-gold)" : "var(--color-wine)"} />
                </svg>
                <div>
                  <h2 className="display text-[clamp(2.2rem,6vw,3.4rem)] text-wine">{t(s.heading, locale)}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-ink-soft">{t(s.body, locale)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="shell py-16 md:py-24 md:pl-14 lg:pl-16">
      <div className="divide-y divide-line">
        {direction.sections.map((s, i) => (
          <section key={i} className="rise grid gap-4 py-10 first:pt-0 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
            <h2 className="display text-[clamp(2.2rem,6vw,3.4rem)] text-wine">{t(s.heading, locale)}</h2>
            <p className="measure text-lg leading-relaxed text-ink-soft">{t(s.body, locale)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
