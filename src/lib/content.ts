import { cache } from "react";
import { directions as staticDirections } from "@/content/directions";
import {
  achievements as staticAchievements,
  history as staticHistory,
  siteSettings as staticSettings,
  teachers as staticTeachers,
} from "@/content/site";
import { demoEvents, demoWorks } from "@/content/demo";
import type {
  Achievement,
  Direction,
  HistoryEntry,
  SchoolEvent,
  SiteSettings,
  Teacher,
  Work,
} from "@/types/content";
import { isPast, toTimestamp } from "./dates";
import { cmsSource, isCmsConfigured } from "./supabase/source";

/**
 * Единая точка чтения контента для публичных страниц.
 * Если Supabase настроен, данные берутся из него, иначе — из src/content.
 * Черновики и работы без согласия родителей сюда не попадают никогда.
 */

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_CONTENT === "true";

export type ContentSource = {
  directions(): Promise<Direction[]>;
  teachers(): Promise<Teacher[]>;
  works(): Promise<Work[]>;
  events(): Promise<SchoolEvent[]>;
  settings(): Promise<SiteSettings>;
  achievements(): Promise<Achievement[]>;
  history(): Promise<HistoryEntry[]>;
};

const staticSource: ContentSource = {
  directions: async () => staticDirections,
  teachers: async () => staticTeachers,
  works: async () => [],
  events: async () => [],
  settings: async () => staticSettings,
  achievements: async () => staticAchievements,
  history: async () => staticHistory,
};

const source: ContentSource = isCmsConfigured() ? cmsSource : staticSource;

/** Если CMS временно недоступна, сайт продолжает работать на встроенном контенте. */
async function safe<T>(load: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error("[content] источник недоступен, используется встроенный контент", error);
    return fallback();
  }
}

export const getDirections = cache(async () => {
  const list = await safe(source.directions, staticSource.directions);
  return list.filter((d) => d.published).sort((a, b) => a.sortOrder - b.sortOrder);
});

export const getDirection = cache(async (slug: string) => {
  const list = await getDirections();
  return list.find((d) => d.slug === slug);
});

export const getTeachers = cache(async () => {
  const list = await safe(source.teachers, staticSource.teachers);
  return list.filter((t) => t.published).sort((a, b) => a.sortOrder - b.sortOrder);
});

export const getWorks = cache(async () => {
  const real = await safe(source.works, staticSource.works);
  const list = isDemoMode ? [...real, ...demoWorks] : real;
  return list
    .filter((w) => w.published && w.consent)
    .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt));
});

export const getEvents = cache(async () => {
  const real = await safe(source.events, staticSource.events);
  const list = isDemoMode ? [...real, ...demoEvents] : real;
  return list.filter((e) => e.published);
});

export async function getEventGroups() {
  const events = await getEvents();
  const upcoming = events
    .filter((e) => !isPast(e.startsAt))
    .sort((a, b) => toTimestamp(a.startsAt) - toTimestamp(b.startsAt));
  const past = events
    .filter((e) => isPast(e.startsAt))
    .sort((a, b) => toTimestamp(b.startsAt) - toTimestamp(a.startsAt));
  return { upcoming, past };
}

export const getEvent = cache(async (slug: string) => {
  const events = await getEvents();
  return events.find((e) => e.slug === slug);
});

export const getSettings = cache(() => safe(source.settings, staticSource.settings));
export const getAchievements = cache(() => safe(source.achievements, staticSource.achievements));
export const getHistory = cache(() => safe(source.history, staticSource.history));
