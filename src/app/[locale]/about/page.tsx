import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FeltPanel } from "@/components/art/FeltPanel";
import { FinalCta } from "@/components/home/FinalCta";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { PageHero } from "@/components/ui/PageHero";
import { getContactAction } from "@/lib/contact";
import { getAchievements, getDirections, getHistory, getTeachers } from "@/lib/content";
import { getDictionary, href, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/about", title: dict.about.title, description: dict.meta.aboutDescription });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [directions, teachers, history, achievements, contact] = await Promise.all([
    getDirections(),
    getTeachers(),
    getHistory(),
    getAchievements(),
    getContactAction(locale),
  ]);

  return (
    <>
      <PageHero title={dict.about.title} lead={dict.about.lead} tone="sand" />

      <section aria-labelledby="mission-title" className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        <div>
          <h2 id="mission-title" className="display text-[clamp(3rem,9vw,5.5rem)]">
            {dict.about.missionHeading}
          </h2>
          <p className="measure mt-8 text-2xl leading-snug text-ink md:text-[1.75rem]">{dict.about.mission}</p>
          <p className="measure mt-6 text-lg text-muted">{dict.about.mission2}</p>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2">
            {directions.map((d) => (
              <li key={d.slug}>
                <Link
                  href={href(locale, `/directions/${d.slug}`)}
                  className="group display inline-flex items-center gap-2 text-[2.6rem] text-wine no-underline"
                >
                  {t(d.name, locale)}
                  <ArrowRight className="size-6 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rise relative aspect-[4/5] overflow-hidden rounded-felt">
          <FeltPanel className="size-full" />
        </div>
      </section>

      <section aria-labelledby="atmosphere-title" className="bg-linen">
        <div className="shell py-20 md:py-24">
          <h2 id="atmosphere-title" className="display text-[clamp(2.6rem,7vw,4.5rem)]">
            {dict.about.atmosphereHeading}
          </h2>
          <p className="measure mt-6 text-lg text-muted">{dict.about.atmosphereEmpty}</p>
        </div>
      </section>

      <section id="teachers" aria-labelledby="teachers-title" className="shell scroll-mt-28 py-20 md:py-28">
        <h2 id="teachers-title" className="display text-[clamp(2.6rem,7vw,4.5rem)]">
          {dict.teachers.heading}
        </h2>
        {teachers.length ? (
          <ul className="mt-12 grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
            {teachers.map((tc) => (
              <li key={tc.id}>
                <TeacherCard teacher={tc} locale={locale} withBio />
              </li>
            ))}
          </ul>
        ) : (
          <p className="measure mt-6 text-lg text-muted">{dict.teachers.empty}</p>
        )}
      </section>

      {history.length > 0 && (
        <section aria-labelledby="history-title" className="shell pb-20 md:pb-28">
          <div className="border-t border-line pt-16">
            <h2 id="history-title" className="display text-[clamp(2.6rem,7vw,4.5rem)]">
              {dict.about.historyHeading}
            </h2>
            <ol className="mt-10 border-l-2 border-gold pl-8">
              {history.map((h) => (
                <li key={h.year} className="relative pb-10 last:pb-0">
                  <span aria-hidden className="absolute top-2.5 -left-[2.45rem] size-3 rounded-full bg-wine" />
                  <p className="display text-[2.4rem] text-wine">{h.year}</p>
                  <p className="measure mt-1 text-lg text-ink-soft">{t(h.text, locale)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section aria-labelledby="achievements-title" className="shell pb-24 md:pb-32">
        <div className="border-t border-line pt-16">
          <h2 id="achievements-title" className="display text-[clamp(2.6rem,7vw,4.5rem)]">
            {dict.about.achievementsHeading}
          </h2>
          {achievements.length ? (
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-baseline gap-6 py-5">
                  {a.year && <span className="display w-16 shrink-0 text-[1.8rem] text-wine">{a.year}</span>}
                  <span className="text-lg">{t(a.title, locale)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="measure mt-6 text-lg text-muted">{dict.about.achievementsEmpty}</p>
          )}
        </div>
      </section>

      <FinalCta
        heading={dict.finalCta.heading}
        text={dict.finalCta.text}
        button={dict.finalCta.button}
        action={contact}
      />
    </>
  );
}
