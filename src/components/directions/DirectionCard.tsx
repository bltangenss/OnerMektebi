import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DirectionArt } from "@/components/art/DirectionArt";
import { Picture } from "@/components/ui/Picture";
import { href, t, type Locale } from "@/lib/i18n";
import type { Direction } from "@/types/content";
import { themePalette } from "./palette";

type Props = { direction: Direction; locale: Locale; moreLabel: string; className?: string };

export function DirectionCard({ direction, locale, moreLabel, className = "" }: Props) {
  const p = themePalette[direction.theme];
  const name = t(direction.name, locale);
  return (
    <Link
      href={href(locale, `/directions/${direction.slug}`)}
      className={`group flex flex-col overflow-hidden rounded-felt bg-[var(--g)] no-underline transition-[background-color,box-shadow] duration-500 hover:bg-[var(--h)] hover:shadow-[var(--shadow-soft)] ${
        p.dark ? "on-dark" : ""
      } ${className}`}
      style={{ ["--g" as string]: p.ground, ["--h" as string]: p.hover, color: p.text }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]">
          {direction.image ? (
            <Picture src={direction.image} alt="" sizes="(min-width: 1024px) 33vw, 100vw" />
          ) : (
            <DirectionArt theme={direction.theme} ink={p.ink} accent={p.accent} ground={p.ground} className="size-full" />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <h3 className="display text-[3.4rem] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
          {name}
        </h3>
        <p className="mt-3 flex-1" style={{ color: p.muted }}>
          {t(direction.summary, locale)}
        </p>
        <span className="link-arrow mt-6">
          {moreLabel}
          <span className="sr-only">: {name}</span>
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
