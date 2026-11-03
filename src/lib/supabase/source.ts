import { createClient } from "@supabase/supabase-js";
import type { ContentSource } from "@/lib/content";
import { isCmsConfigured, supabaseAnonKey, supabaseUrl } from "./env";
import {
  toAchievement,
  toDirection,
  toEvent,
  toHistory,
  toTeacher,
  toWork,
  type AchievementRow,
  type DirectionRow,
  type EventRow,
  type HistoryRow,
  type SettingsRow,
  type TeacherRow,
  type WorkRow,
} from "./mappers";

export { isCmsConfigured };

/** Через сколько секунд опубликованные изменения появляются, даже без явного сброса кэша. */
const REVALIDATE_SECONDS = 300;

function publicClient() {
  // Публичный ключ: политики RLS отдают только опубликованное.
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: ["cms"] } }),
    },
  });
}

async function rows<T>(table: string, order: string, ascending = true): Promise<T[]> {
  const { data, error } = await publicClient()
    .from(table)
    .select("*")
    .eq("published", true)
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as T[];
}

export const cmsSource: ContentSource = {
  directions: async () => (await rows<DirectionRow>("directions", "sort_order")).map(toDirection),
  teachers: async () => (await rows<TeacherRow>("teachers", "sort_order")).map(toTeacher),
  works: async () =>
    (await rows<WorkRow>("works", "published_at", false)).filter((w) => w.consent).map(toWork),
  events: async () => (await rows<EventRow>("events", "event_date", false)).map(toEvent),
  achievements: async () => (await rows<AchievementRow>("achievements", "sort_order")).map(toAchievement),
  history: async () => (await rows<HistoryRow>("history", "sort_order")).map(toHistory),
  settings: async () => {
    const { data, error } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return ((data as SettingsRow | null)?.data ?? {}) as SettingsRow["data"];
  },
};
