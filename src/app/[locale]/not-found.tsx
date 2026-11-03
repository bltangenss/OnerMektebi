"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import kk from "@/locales/kk";
import ru from "@/locales/ru";

/** 404 внутри языковой версии: язык берём из адреса. */
export default function NotFound() {
  const locale = usePathname()?.startsWith("/ru") ? "ru" : "kk";
  const dict = locale === "ru" ? ru : kk;
  return (
    <section className="shell flex min-h-[60vh] flex-col justify-center py-24">
      <p className="display text-[clamp(7rem,30vw,16rem)] leading-[0.8] text-wine" aria-hidden>
        404
      </p>
      <h1 className="display mt-6 text-[clamp(2.6rem,7vw,4.5rem)]">{dict.notFound.title}</h1>
      <p className="mt-4 text-lg text-muted">{dict.notFound.text}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-10 self-start">
        {dict.ui.home}
      </Link>
    </section>
  );
}
