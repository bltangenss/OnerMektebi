import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectionCard } from "@/components/directions/DirectionCard";
import { PageHero } from "@/components/ui/PageHero";
import { getDirections } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/directions">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/directions", title: dict.directions.heading, description: dict.meta.directionsDescription });
}

export default async function DirectionsPage({ params }: PageProps<"/[locale]/directions">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const directions = await getDirections();

  return (
    <>
      <PageHero title={dict.directions.heading} lead={dict.directions.sub} tone="sand" />
      <section className="shell py-16 md:py-24" aria-label={dict.directions.heading}>
        <p className="measure text-lg text-muted">{dict.directions.pageLead}</p>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {directions.map((d) => (
            <li key={d.slug} className="rise flex">
              <DirectionCard direction={d} locale={locale} moreLabel={dict.ui.more} className="w-full" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
