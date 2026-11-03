import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { LogoMark } from "@/components/art/Logo";

type Props = { email: string; children: ReactNode; title: string; back?: { href: string; label: string } };

export function AdminShell({ email, children, title, back }: Props) {
  return (
    <>
      <header className="border-b border-line bg-milk">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-wine no-underline">
            <LogoMark className="size-8" />
            <span className="display text-[1.6rem] text-ink">Админ-панель</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{email}</span>
            <a href="/kk" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded px-3 text-ink no-underline hover:bg-sand">
              <ExternalLink className="size-4" aria-hidden />
              Сайт
            </a>
            <form action={signOut}>
              <button type="submit" className="inline-flex min-h-11 items-center gap-1 rounded px-3 hover:bg-sand">
                <LogOut className="size-4" aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {back && (
          <Link href={back.href} className="text-sm text-muted no-underline hover:text-wine">
            ← {back.label}
          </Link>
        )}
        <h1 className="display mt-2 text-[2.8rem] md:text-[3.4rem]">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}
