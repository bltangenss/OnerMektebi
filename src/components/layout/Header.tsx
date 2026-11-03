"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/art/Logo";
import type { Dictionary } from "@/locales/kk";
import { href, switchLocalePath, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dict: Pick<Dictionary, "nav" | "ui" | "meta">;
  contactHref: string;
  contactExternal: boolean;
};

const NAV = ["about", "directions", "talents", "events", "contact"] as const;
const PATHS: Record<(typeof NAV)[number], string> = {
  about: "/about",
  directions: "/directions",
  talents: "/talents",
  events: "/events",
  contact: "/contact",
};

export function Header({ locale, dict, contactHref, contactExternal }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const other: Locale = locale === "kk" ? "ru" : "kk";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Закрываем меню при переходе на другую страницу.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    // Панель начинается ровно под шапкой, даже если над ней есть плашка.
    const header = toggle?.closest("header");
    if (panel && header) panel.style.top = `${header.getBoundingClientRect().bottom}px`;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = [toggle, ...panel.querySelectorAll<HTMLElement>("a, button")].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const isActive = (path: string) => pathname.startsWith(href(locale, path));
  const contactProps = contactExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        open
          ? "bg-milk shadow-[0_1px_0_var(--color-line)]"
          : scrolled
            ? "bg-milk/88 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md"
            : "bg-milk"
      }`}
    >
      <div className="shell flex h-16 items-center gap-4 lg:h-20">
        <Link
          href={href(locale)}
          className="flex shrink-0 items-center gap-2.5 text-wine no-underline"
          aria-label={`${dict.meta.siteName} — ${dict.nav.home}`}
        >
          <LogoMark className="size-9 lg:size-10" />
          <span className="display text-[1.65rem] text-ink lg:text-[1.9rem]">{dict.meta.siteName}</span>
        </Link>

        <nav aria-label={dict.ui.mainNav} className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.filter((k) => k !== "contact").map((key) => (
              <li key={key}>
                <Link
                  href={href(locale, PATHS[key])}
                  aria-current={isActive(PATHS[key]) ? "page" : undefined}
                  className="relative rounded px-3 py-2 text-[0.95rem] font-medium text-ink no-underline transition-colors hover:text-wine aria-[current=page]:text-wine"
                >
                  {dict.nav[key]}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ${
                      isActive(PATHS[key]) ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            lang={other}
            aria-label={dict.ui.switchTo}
            className="flex h-11 min-w-11 items-center justify-center gap-1 rounded px-2 text-sm font-semibold tracking-wide text-ink no-underline transition-colors hover:bg-sand"
          >
            <span className={locale === "kk" ? "text-wine" : "text-muted"}>KZ</span>
            <span aria-hidden className="text-line">/</span>
            <span className={locale === "ru" ? "text-wine" : "text-muted"}>RU</span>
          </Link>
          <a href={contactHref} {...contactProps} className="btn btn-primary hidden min-h-11 px-5 py-2 sm:inline-flex">
            {dict.ui.contactCta}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="flex size-11 items-center justify-center rounded text-ink transition-colors hover:bg-sand lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.ui.menuClose : dict.ui.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto overscroll-contain bg-milk lg:hidden"
      >
        <nav aria-label={dict.ui.mainNav} className="shell flex min-h-full flex-col pt-6 pb-10">
          <ul className="flex flex-col">
            {(["home", ...NAV] as const).map((key, i) => {
              const path = key === "home" ? "/" : PATHS[key];
              const active = key === "home" ? pathname === href(locale) : isActive(path);
              return (
                <li key={key} className="fade-in border-b border-line" style={{ ["--d" as string]: `${i * 40}ms` }}>
                  <Link
                    href={href(locale, path)}
                    aria-current={active ? "page" : undefined}
                    className="display flex min-h-16 items-center justify-between py-3 text-[2.6rem] text-ink no-underline aria-[current=page]:text-wine"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <a href={contactHref} {...contactProps} className="btn btn-primary mt-8 w-full">
            {dict.ui.contactCta}
          </a>
        </nav>
      </div>
    </header>
  );
}
