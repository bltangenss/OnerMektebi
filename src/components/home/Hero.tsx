import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DombraShape, DOMBRA_VIEWBOX, STRING_X, STRING_Y } from "@/components/art/Dombra";
import { Strings } from "@/components/art/Strings";
import type { Dictionary } from "@/locales/kk";
import { href, t, type Locale } from "@/lib/i18n";
import type { Direction } from "@/types/content";

type Props = { locale: Locale; dict: Dictionary; directions: Direction[] };

/** Граница двух полей: левое молочное, правое бордовое. */
const SPLIT = 58;

const DESKTOP_VB: [number, number, number, number] = [0, 40, DOMBRA_VIEWBOX.w, 262];
const MOBILE_VB: [number, number, number, number] = [470, 30, 970, 280];

function DombraBand({ viewBox, className }: { viewBox: [number, number, number, number]; className: string }) {
  const vb = viewBox.join(" ");
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${viewBox[2]} / ${viewBox[3]}` }}>
      {/* Одна домбра, разрезанная по шву: слева бордовая, справа песочная */}
      <svg viewBox={vb} className="absolute inset-0 size-full" style={{ clipPath: `inset(0 ${100 - SPLIT}% 0 0)` }} aria-hidden>
        <DombraShape body="var(--color-wine)" neck="var(--color-wine)" detail="var(--color-milk)" />
      </svg>
      <svg viewBox={vb} className="absolute inset-0 size-full" style={{ clipPath: `inset(0 0 0 ${SPLIT}%)` }} aria-hidden>
        <DombraShape body="var(--color-sand)" neck="var(--color-sand)" detail="var(--color-wine)" />
      </svg>
      <Strings
        viewBox={viewBox}
        ys={STRING_Y}
        x0={STRING_X[0]}
        x1={STRING_X[1]}
        width={2}
        className="absolute inset-0 size-full touch-pan-y"
      />
    </div>
  );
}

export function Hero({ locale, dict, directions }: Props) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-milk">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden bg-wine lg:block" style={{ left: `${SPLIT}%` }} />

      <div className="shell relative grid lg:grid-cols-[58fr_42fr]">
        <div className="pt-8 pb-8 sm:pt-12 lg:pt-10 lg:pr-10 lg:pb-4">
          <h1
            id="hero-title"
            className="display text-[clamp(4.6rem,22vw,7.5rem)] text-wine lg:text-[clamp(4.5rem,7.4vw,8.75rem)]"
          >
            {dict.hero.titleLines.map((word, i) => (
              <span key={word} className="line-in mr-[0.18em]">
                <span style={{ ["--i" as string]: i }}>{word}</span>
              </span>
            ))}
          </h1>
          <p className="fade-in mt-6 max-w-[34rem] text-lg text-ink-soft sm:text-xl" style={{ ["--d" as string]: "420ms" }}>
            {dict.hero.lead}
          </p>
          <div className="fade-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "540ms" }}>
            <Link href={href(locale, "/directions")} className="btn btn-primary">
              {dict.hero.toDirections}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href={href(locale, "/about")} className="btn btn-outline text-wine">
              {dict.hero.toAbout}
            </Link>
          </div>
        </div>

        <div className="on-dark relative hidden flex-col justify-between py-14 pl-14 text-milk lg:flex">
          <p className="fade-in text-sm font-medium tracking-[0.08em] text-gold" style={{ ["--d" as string]: "300ms" }}>
            {dict.hero.city}
          </p>
          <ul className="fade-in space-y-1" style={{ ["--d" as string]: "640ms" }}>
            {directions.map((d) => (
              <li key={d.slug}>
                <Link
                  href={href(locale, `/directions/${d.slug}`)}
                  className="group display inline-flex items-baseline gap-3 text-[clamp(2.6rem,4vw,3.6rem)] text-milk no-underline"
                >
                  <span className="underline decoration-transparent decoration-2 underline-offset-[0.14em] transition-colors group-hover:decoration-gold">
                    {t(d.name, locale)}
                  </span>
                  <ArrowRight className="size-6 text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative">
        <div aria-hidden className="absolute inset-0 lg:hidden" style={{ background: `linear-gradient(90deg, var(--color-milk) ${SPLIT}%, var(--color-wine) ${SPLIT}%)` }} />
        <DombraBand viewBox={MOBILE_VB} className="lg:hidden" />
        <DombraBand viewBox={DESKTOP_VB} className="hidden lg:-mt-8 lg:block" />
        <p className="absolute bottom-2 left-4 text-xs text-muted md:left-8 lg:bottom-4">{dict.hero.stringsHint}</p>
      </div>
    </section>
  );
}
