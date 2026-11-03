import { BrushStroke } from "@/components/art/DirectionArt";
import { DombraShape, STRING_X, STRING_Y } from "@/components/art/Dombra";
import { HornPair } from "@/components/art/HornPair";
import { HORN_PATH } from "@/components/art/horn-path";
import { Seam } from "@/components/art/Seam";
import { Strings } from "@/components/art/Strings";
import { Picture } from "@/components/ui/Picture";
import type { Direction } from "@/types/content";
import { themePalette } from "./palette";

type Props = { direction: Direction; title: string; summary: string; hint: string };

const VB: [number, number, number, number] = [0, 40, 1440, 262];

/** Слова, которыми обмениваются два голоса айтыса. */
const VOICE_WORDS = ["сөз", "ой", "ұйқас", "жыр", "үн", "дауыс", "өлең", "жауап"];

export function DirectionHero({ direction, title, summary, hint }: Props) {
  const p = themePalette[direction.theme];
  // У «Күй» иллюстрация — домбра во всю ширину ниже, поэтому заголовок занимает всю строку.
  const sideArt = Boolean(direction.image) || direction.theme !== "strings";

  return (
    <div style={{ background: p.ground, color: p.text }} className={p.dark ? "on-dark" : ""}>
      <div className={`shell grid items-end gap-10 pt-12 pb-10 md:pt-20 ${sideArt ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <div>
          <h1 className="display line-in text-[clamp(3.4rem,11vw,7.5rem)]">
            <span>{title}</span>
          </h1>
          <p className="fade-in measure mt-6 text-lg md:text-xl" style={{ color: p.muted, ["--d" as string]: "250ms" }}>
            {summary}
          </p>
        </div>

        <div className="fade-in relative" style={{ ["--d" as string]: "200ms" }}>
          {direction.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-felt">
              <Picture src={direction.image} alt="" sizes="(min-width: 1024px) 40vw, 100vw" priority />
            </div>
          ) : direction.theme === "voices" ? (
            <VoicesArt ink={p.ink} accent={p.accent} />
          ) : direction.theme === "brush" ? (
            <BrushStroke ink={p.ink} accent={p.accent} className="w-full" />
          ) : direction.theme === "plain" ? (
            <svg viewBox="0 0 400 260" className="w-full" aria-hidden>
              <HornPair cx={200} baseY={250} scale={1.4} fill={p.ink} />
            </svg>
          ) : null}
        </div>
      </div>

      {direction.theme === "strings" && !direction.image && (
        <div className="relative">
          <div className="relative" style={{ aspectRatio: `${VB[2]} / ${VB[3]}` }}>
            <svg viewBox={VB.join(" ")} className="absolute inset-0 size-full" aria-hidden>
              <DombraShape body="var(--color-sand)" neck="var(--color-sand)" detail="var(--color-wine)" />
            </svg>
            <Strings viewBox={VB} ys={STRING_Y} x0={STRING_X[0]} x1={STRING_X[1]} className="absolute inset-0 size-full touch-pan-y" />
          </div>
          <p className="shell pb-3 text-xs" style={{ color: p.muted }}>
            {hint}
          </p>
        </div>
      )}

      <Seam top={p.ground} bottom="var(--color-milk)" />
    </div>
  );
}

/** Два рога, обращённые друг к другу, и слова, перелетающие между ними. */
function VoicesArt({ ink, accent }: { ink: string; accent: string }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 400 260" className="w-full" aria-hidden>
        <path d={HORN_PATH} fill={ink} transform="translate(22 76) scale(1.74)" />
        <path d={HORN_PATH} fill={accent} transform="translate(378 76) scale(-1.74 1.74)" />
      </svg>
      <ul aria-hidden className="pointer-events-none absolute inset-x-8 -top-4 flex flex-wrap justify-center gap-x-5 gap-y-0">
        {VOICE_WORDS.map((w, i) => (
          <li
            key={w}
            className="fade-in display text-[2.1rem]"
            style={{
              color: i % 2 ? "var(--color-ink-soft)" : ink,
              ["--d" as string]: `${400 + i * 140}ms`,
            }}
          >
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
