"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getEntity } from "@/lib/admin/entities";
import { mediaPath } from "@/lib/admin/media";
import { parseForm } from "@/lib/admin/parse";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/content";

export type FormState = { error?: string; errors?: string[] };

function refreshSite() {
  revalidateTag("cms", { expire: 0 });
  revalidatePath("/", "layout");
}

function friendly(message: string): string {
  if (message.includes("duplicate key")) return "Такой адрес страницы уже занят. Придумайте другой.";
  if (message.includes("works_consent_before_publish")) return "Нельзя опубликовать работу без согласия родителей.";
  if (message.includes("row-level security")) return "Нет прав на это действие.";
  return "Не удалось сохранить. Проверьте интернет и попробуйте ещё раз.";
}

// ───────── Вход и выход ─────────

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Введите email и пароль." };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Неверный email или пароль." };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "У этой учётной записи нет доступа к админ-панели." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ───────── Записи ─────────

export async function saveEntity(key: string, id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const entity = getEntity(key);
  if (!entity) return { error: "Неизвестный раздел." };

  const { data: dirs } = await supabase.from("directions").select("slug");
  const slugs = (dirs ?? []).map((d: { slug: string }) => d.slug);
  const { row, errors } = parseForm(entity, form, slugs);
  if (errors.length) return { errors };

  const query = id
    ? supabase.from(entity.table).update(row).eq("id", id)
    : supabase.from(entity.table).insert(row);
  const { error } = await query;
  if (error) return { error: friendly(error.message) };

  refreshSite();
  redirect(`/admin/${key}?saved=1`);
}

export async function setPublished(key: string, id: string, published: boolean) {
  const { supabase } = await requireAdmin();
  const entity = getEntity(key);
  if (!entity) return;
  if (key === "works" && published) {
    const { data } = await supabase.from("works").select("consent").eq("id", id).single();
    if (!data?.consent) redirect(`/admin/${key}?error=consent`);
  }
  const { error } = await supabase.from(entity.table).update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect(`/admin/${key}?error=save`);
  refreshSite();
  redirect(`/admin/${key}`);
}

export async function deleteEntity(key: string, id: string) {
  const { supabase } = await requireAdmin();
  const entity = getEntity(key);
  if (!entity) return;

  const { data: row } = await supabase.from(entity.table).select("*").eq("id", id).single();
  const { error } = await supabase.from(entity.table).delete().eq("id", id);
  if (error) redirect(`/admin/${key}?error=delete`);

  // Файлы удалённой записи больше нигде не нужны — убираем их из хранилища.
  if (row) {
    const urls = Object.values(row as Record<string, unknown>).flatMap((v) =>
      typeof v === "string" ? [v] : Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [],
    );
    const paths = urls.map(mediaPath).filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  }

  refreshSite();
  redirect(`/admin/${key}?deleted=1`);
}

// ───────── Контакты ─────────

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const s = (k: string) => String(form.get(k) ?? "").trim();
  const errors: string[] = [];

  const whatsapp = s("whatsapp").replace(/\D/g, "");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)) {
    errors.push("WhatsApp: номер в международном формате, например 77001234567.");
  }
  const urlOk = (v: string) => !v || /^https:\/\/[^\s]+$/.test(v);
  for (const k of ["instagram", "mapUrl", "mapEmbedUrl"]) {
    if (!urlOk(s(k))) errors.push(`Ссылка «${k}» должна начинаться с https://`);
  }
  const embed = s("mapEmbedUrl");
  if (embed && !/^https:\/\/(www\.)?(google\.[a-z.]+\/maps|widgets\.2gis\.com|yandex\.[a-z]+\/map-widget)/.test(embed)) {
    errors.push("Встраиваемая карта: поддерживаются ссылки Google Maps, 2ГИС или Яндекс Карт для встраивания.");
  }
  if (errors.length) return { errors };

  const loc = (k: string) => (s(`${k}.kk`) || s(`${k}.ru`) ? { kk: s(`${k}.kk`), ru: s(`${k}.ru`) } : undefined);
  const otherSocial = s("otherSocial")
    .split("\n")
    .map((line) => line.split("|").map((x) => x.trim()))
    .filter(([label, url]) => label && url && /^https:\/\//.test(url))
    .map(([label, url]) => ({ label, url }));

  const data: SiteSettings = {
    address: loc("address"),
    hours: loc("hours"),
    phone: s("phone") || undefined,
    whatsapp: whatsapp || undefined,
    instagram: s("instagram") || undefined,
    mapUrl: s("mapUrl") || undefined,
    mapEmbedUrl: embed || undefined,
    otherSocial: otherSocial.length ? otherSocial : undefined,
  };

  const { error } = await supabase
    .from("settings")
    .update({ data: JSON.parse(JSON.stringify(data)), updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: friendly(error.message) };

  refreshSite();
  redirect("/admin/settings?saved=1");
}
