"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { parseApplication, type ApplicationErrorKey } from "@/lib/applications";
import { getDirections } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import { isCmsConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export type ApplyState = {
  ok?: boolean;
  errors?: ApplicationErrorKey[];
  error?: "rate" | "server";
};

/** Сколько миллисекунд человек минимум тратит на заполнение формы. */
const MIN_FILL_MS = 3000;

async function ipHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (!ip) return null;
  const salt = process.env.APPLICATIONS_SALT || "oner-mektebi";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Уведомление сотрудникам в Telegram. Без имени и телефона:
 * персональные данные остаются только в базе, ответ — через админ-панель.
 */
async function notify(kind: string, direction: string | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const text = [
    "Өнер мектебі: жаңа өтінім / новая заявка",
    `${kind}${direction ? ` · ${direction}` : ""}`,
    `${siteUrl}/admin/applications`,
  ].join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Заявка уже сохранена; уведомление — только удобство.
  }
}

export async function submitApplication(locale: string, _: ApplyState, form: FormData): Promise<ApplyState> {
  if (!isCmsConfigured()) return { error: "server" };

  // Ловушки для ботов: скрытое поле и слишком быстрое заполнение.
  if (String(form.get("website") ?? "")) return { error: "server" };
  const started = Number(form.get("startedAt"));
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) return { error: "rate" };

  const directions = await getDirections();
  const { data, errors } = parseApplication(
    form,
    directions.map((d) => d.slug),
  );
  if (!data) return { errors };

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc("submit_application", {
    p_kind: data.kind,
    p_parent_name: data.parentName,
    p_phone: data.phone,
    p_contact_method: data.contactMethod,
    p_direction_slug: data.directionSlug,
    p_child_age: data.childAge,
    p_message: data.message,
    p_locale: isLocale(locale) ? locale : "kk",
    p_ip_hash: await ipHash(),
  });

  if (error) {
    if (error.message.includes("rate_limited")) return { error: "rate" };
    console.error("[apply] заявка не сохранена", error.message);
    return { error: "server" };
  }

  await notify(data.kind, data.directionSlug);
  return { ok: true };
}
