import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FeltPanel } from "@/components/art/FeltPanel";
import { Seam } from "@/components/art/Seam";
import { DirectionCard } from "@/components/directions/DirectionCard";
import { EventCard } from "@/components/events/EventCard";
import { AudioPlayer } from "@/components/gallery/AudioPlayer";
import { Gallery } from "@/components/gallery/Gallery";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Quiz } from "@/components/home/Quiz";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { EmptyFrames } from "@/components/ui/EmptyFrames";
import { SectionHead } from "@/components/ui/SectionHead";
import { getContactAction } from "@/lib/contact";
import { getDirections, getEventGroups, getTeachers, getWorks } from "@/lib/content";
import { galleryLabels, toGalleryWorks } from "@/lib/gallery";
import { getDictionary, href, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

// Деление событий на предстоящие и прошедшие пересчитывается раз в час.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/", description: dict.meta.homeDescription });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [directions, works, events, teachers, contact] = await Promise.all([
    getDirections(),
    getWorks(),
    getEventGroups(),
    getTeachers(),
    getContactAction(locale),
  ]);

  const visualWorks = toGalleryWorks(works.filter((w) => w.kind !== "audio").slice(0, 6), directions, locale);
  const audioWorks = works.filter((w) => w.kind === "audio" && w.mediaUrl).slice(0, 3);
  // Сначала ближайшие события, затем недавно прошедшие — не больше трёх.
  const latestEvents = [...events.upcoming, ...events.past].slice(0, 3);
  const quizOptions = (["kui", "aitys", "art"] as const)
    .map((slug) => {
      const d = directions.find((x) => x.slug === slug);
      return d
        ? {
            slug,
            label: dict.quiz.options[slug],
            name: t(d.name, locale),
            summary: t(d.summary, locale),
            href: href(locale, `/directions/${slug}`),
          }
        : null;
    })
    .filter((o) => o !== null);

  return (
    <>
      <Hero locale={locale} dict={dict} directions={directions} />

      <section aria-labelledby="about-title" className="shell grid items-center gap-10 py-24 md:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="rise relative aspect-[4/5] overflow-hidden rounded-felt">
          <FeltPanel className="size-full" />
        </div>
        <div>
          <h2 id="about-title" className="display text-[clamp(3rem,9vw,5.5rem)]">
            {dict.homeAbout.heading}
          </h2>
          <p className="measure mt-6 text-xl leading-relaxed text-ink-soft">{dict.homeAbout.text}</p>
          <p className="measure mt-4 text-lg text-muted">{dict.homeAbout.text2}</p>
          <Link href={href(locale, "/about")} className="btn btn-primary mt-10">
            {dict.ui.more}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </section>

      <section aria-labelledby="directions-title" className="shell pb-24 md:pb-32">
        <SectionHead id="directions-title" title={dict.directions.heading} sub={dict.directions.sub} />
        <ul className="mt-12 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {directions.map((d, i) => (
            <li key={d.slug} className={`rise flex ${i % 3 === 1 ? "md:mt-16" : ""}`}>
              <DirectionCard direction={d} locale={locale} moreLabel={dict.ui.more} className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      {quizOptions.length > 1 && (
        <>
          <Seam top="var(--color-milk)" bottom="var(--color-wine)" />
          <Quiz
            heading={dict.quiz.heading}
            question={dict.quiz.question}
            note={dict.quiz.note}
            resultLabel={dict.quiz.result}
            moreLabel={dict.ui.more}
            againLabel={dict.quiz.again}
            options={quizOptions}
          />
          <Seam top="var(--color-wine)" bottom="var(--color-milk)" flip />
        </>
      )}

      <section aria-labelledby="talents-title" className="shell py-24 md:py-32">
        <SectionHead
          id="talents-title"
          title={dict.talents.heading}
          sub={dict.talents.intro}
          action={visualWorks.length ? { href: href(locale, "/talents"), label: dict.talents.viewAll } : undefined}
        />
        <div className="mt-12">
          {visualWorks.length ? (
            <Gallery works={visualWorks} categories={[]} labels={galleryLabels(dict)} showFilters={false} />
          ) : (
            <EmptyFrames title={dict.talents.emptyTitle} text={dict.talents.emptyText} />
          )}
        </div>
      </section>

      {audioWorks.length > 0 && (
        <section aria-labelledby="sound-title" className="border-t border-line">
          <div className="shell grid gap-10 py-20 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 id="sound-title" className="display text-[clamp(2.8rem,7vw,4.5rem)]">
                {dict.sound.heading}
              </h2>
              <p className="mt-4 max-w-sm text-muted">{dict.sound.text}</p>
            </div>
            <ul className="divide-y divide-line">
              {audioWorks.map((w) => {
                const title = t(w.title, locale);
                const author = t(w.authorName, locale);
                return (
                  <li key={w.id} className="py-6 first:pt-0">
                    <p className="font-semibold">
                      {title}
                      {w.isDemo && (
                        <span className="ml-2 rounded bg-gold px-2 py-0.5 align-middle text-xs font-semibold">{dict.ui.demoBadge}</span>
                      )}
                    </p>
                    <p className="mb-3 text-sm text-muted">{author || dict.talents.anonymous}</p>
                    <AudioPlayer src={w.mediaUrl!} title={title} labels={dict.viewer} />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <Seam top="var(--color-milk)" bottom="var(--color-sand)" />
      <div className="bg-sand">
        <section aria-labelledby="events-title" className="shell pt-12 pb-24 md:pt-16 md:pb-28">
          <SectionHead
            id="events-title"
            title={dict.events.heading}
            sub={dict.events.lead}
            action={latestEvents.length ? { href: href(locale, "/events"), label: dict.events.all } : undefined}
          />
          {latestEvents.length ? (
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestEvents.map((e) => (
                <li key={e.slug} className="rise">
                  <EventCard event={e} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-lg text-muted">{dict.events.empty}</p>
          )}
        </section>

        <section aria-labelledby="teachers-title" className="shell pb-24 md:pb-32">
          <div className="border-t border-wine/20 pt-16">
            <SectionHead
              id="teachers-title"
              title={dict.teachers.heading}
              action={teachers.length > 4 ? { href: href(locale, "/about#teachers"), label: dict.teachers.all } : undefined}
            />
            {teachers.length ? (
              <ul className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {teachers.slice(0, 4).map((tc) => (
                  <li key={tc.id}>
                    <TeacherCard teacher={tc} locale={locale} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="measure mt-8 text-lg text-muted">{dict.teachers.empty}</p>
            )}
          </div>
        </section>
      </div>

      <FinalCta
        heading={dict.finalCta.heading}
        text={dict.finalCta.text}
        button={dict.finalCta.button}
        action={contact}
        above="var(--color-sand)"
      />
    </>
  );
}
