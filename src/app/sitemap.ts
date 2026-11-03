import type { MetadataRoute } from "next";
import { getDirections, getEvents } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [directions, events] = await Promise.all([getDirections(), getEvents()]);
  const paths = [
    "",
    "/about",
    "/directions",
    "/talents",
    "/events",
    "/contact",
    "/apply",
    ...directions.map((d) => `/directions/${d.slug}`),
    ...events.filter((e) => !e.isDemo).map((e) => `/events/${e.slug}`),
  ];

  return paths.map((path) => ({
    url: `${siteUrl}/kk${path}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    changeFrequency: path.startsWith("/events") ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
