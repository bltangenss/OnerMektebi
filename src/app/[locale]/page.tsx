import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { getDirections } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

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
  const directions = await getDirections();

  return (
    <>
      <Hero locale={locale} dict={dict} directions={directions} />
    </>
  );
}
