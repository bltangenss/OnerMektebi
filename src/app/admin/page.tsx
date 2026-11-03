import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { entities } from "@/lib/admin/entities";
import { isCmsConfigured } from "@/lib/supabase/env";

export default async function AdminHome() {
  if (!isCmsConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="display text-[3rem]">Админ-панель не подключена</h1>
        <p className="mt-4 text-lg">
          Чтобы сотрудники могли сами публиковать события и работы, нужно подключить Supabase.
          Пока он не подключён, сайт показывает содержимое из файлов в папке <code>src/content</code>.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-6">
          <li>Создайте проект на supabase.com.</li>
          <li>Выполните файл <code>supabase/schema.sql</code> в SQL Editor.</li>
          <li>Укажите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в настройках сайта.</li>
          <li>Создайте пользователя и добавьте его в таблицу admins (инструкция в README).</li>
        </ol>
      </main>
    );
  }

  const { supabase, email } = await requireAdmin();
  const counts = await Promise.all(
    entities.map(async (e) => {
      const { count } = await supabase.from(e.table).select("id", { count: "exact", head: true });
      return count ?? 0;
    }),
  );

  return (
    <AdminShell email={email} title="Что будем обновлять?">
      <ul className="grid gap-4 sm:grid-cols-2">
        {entities.map((e, i) => (
          <li key={e.key}>
            <Link href={`/admin/${e.key}`} className="group flex h-full flex-col rounded-felt bg-milk p-6 no-underline shadow-[0_1px_0_var(--color-line)] hover:shadow-[var(--shadow-soft)]">
              <span className="flex items-center justify-between">
                <span className="text-xl font-semibold text-ink group-hover:text-wine">{e.title}</span>
                <span className="rounded-full bg-sand px-3 py-1 text-sm tabular-nums">{counts[i]}</span>
              </span>
              <span className="mt-2 flex-1 text-muted">{e.description}</span>
              <span className="link-arrow mt-4 text-wine">
                Открыть <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/admin/settings" className="group flex h-full flex-col rounded-felt bg-milk p-6 no-underline shadow-[0_1px_0_var(--color-line)] hover:shadow-[var(--shadow-soft)]">
            <span className="flex items-center gap-2 text-xl font-semibold text-ink group-hover:text-wine">
              <Settings className="size-5" aria-hidden />
              Контакты школы
            </span>
            <span className="mt-2 flex-1 text-muted">Адрес, телефон, WhatsApp, Instagram, карта.</span>
            <span className="link-arrow mt-4 text-wine">
              Открыть <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        </li>
      </ul>
    </AdminShell>
  );
}
