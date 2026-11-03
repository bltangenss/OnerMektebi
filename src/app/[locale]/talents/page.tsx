import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Gallery } from "@/components/gallery/Gallery";
import { EmptyFrames } from "@/components/ui/EmptyFrames";
import { PageHero } from "@/components/ui/PageHero";
import { getDirections, getWorks } from "@/lib/content";
import { galleryLabels, toGalleryWorks } from "@/lib/gallery";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/talents">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/talents", title: dict.talents.heading, description: dict.meta.talentsDescription });
}

export default async function TalentsPage({ params }: PageProps<"/[locale]/talents">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const [directions, works] = await Promise.all([getDirections(), getWorks()]);
  const items = toGalleryWorks(works, directions, locale);
  const categories = directions.map((d) => ({ slug: d.slug, name: t(d.name, locale) }));

  return (
    <>
      <PageHero title={dict.talents.heading} lead={dict.talents.intro} tone="linen" />
      <section className="shell py-14 md:py-20" aria-label={dict.talents.heading}>
        {items.length ? (
          <Gallery works={items} categories={categories} labels={galleryLabels(dict)} showExhibition />
        ) : (
          <EmptyFrames title={dict.talents.emptyTitle} text={dict.talents.emptyText} />
        )}
        <p className="mt-16 flex max-w-2xl gap-3 text-sm text-muted">
          <ShieldCheck className="size-5 shrink-0 text-wine" aria-hidden />
          {dict.talents.safety}
        </p>
      </section>
    </>
  );
}
