import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { isCmsConfigured } from "@/lib/supabase/env";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
  email: string;
};

/**
 * Серверная проверка прав: пользователь вошёл и записан в таблицу admins.
 * Вызывается в каждой странице и каждом действии админки, а не только в proxy.
 */
export async function requireAdmin(): Promise<AdminContext> {
  if (!isCmsConfigured()) redirect("/admin");
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/admin/login?denied=1");
  return { supabase, email: data.user.email ?? "" };
}
