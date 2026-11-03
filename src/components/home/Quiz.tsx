"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Brush, MessageCircle, Music } from "lucide-react";

type Option = { slug: string; label: string; name: string; summary: string; href: string };

type Props = {
  heading: string;
  question: string;
  note: string;
  resultLabel: string;
  moreLabel: string;
  againLabel: string;
  options: Option[];
};

const ICONS: Record<string, typeof Music> = { kui: Music, aitys: MessageCircle, art: Brush };

/**
 * «Өнерді таны»: дружелюбное знакомство с направлениями.
 * Не тест и не диагностика; выбор нигде не сохраняется.
 */
export function Quiz({ heading, question, note, resultLabel, moreLabel, againLabel, options }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const result = options.find((o) => o.slug === picked);
  const resultRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const touched = useRef(false);

  // Кнопки исчезают после выбора, поэтому фокус переводим на результат и обратно.
  useEffect(() => {
    if (!touched.current) return;
    if (result) resultRef.current?.focus();
    else listRef.current?.querySelector("button")?.focus();
  }, [result]);

  const choose = (slug: string | null) => {
    touched.current = true;
    setPicked(slug);
  };

  return (
    <section aria-labelledby="quiz-title" className="on-dark bg-wine text-milk">
      <div className="shell grid gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 id="quiz-title" className="display text-[clamp(3rem,8vw,5.5rem)]">
            <span className="sr-only">{heading}. </span>
            {question}
          </h2>
          <p className="mt-5 max-w-md text-muted-on-dark">{note}</p>
        </div>

        <div>
          {!result ? (
            <ul ref={listRef} className="grid gap-3">
              {options.map((o) => {
                const Icon = ICONS[o.slug] ?? Music;
                return (
                  <li key={o.slug}>
                    <button
                      type="button"
                      onClick={() => choose(o.slug)}
                      className="group flex min-h-20 w-full items-center gap-5 rounded-felt border border-white/25 px-6 py-5 text-left text-xl font-medium transition-[background-color,border-color] duration-300 hover:border-gold hover:bg-white/8"
                    >
                      <Icon className="size-7 shrink-0 text-gold" aria-hidden />
                      <span className="flex-1">{o.label}</span>
                      <ArrowRight className="size-5 text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div ref={resultRef} tabIndex={-1} className="fade-in rounded-felt bg-milk p-8 text-ink outline-none md:p-10" role="status" aria-live="polite">
              <p className="text-sm font-semibold tracking-[0.08em] text-wine">{resultLabel}</p>
              <p className="display mt-3 text-[3.6rem] text-wine">{result.name}</p>
              <p className="mt-3 text-lg text-ink-soft">{result.summary}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={result.href} className="btn btn-primary">
                  {moreLabel}
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
                <button type="button" onClick={() => choose(null)} className="btn btn-outline text-wine">
                  {againLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
