import type { DirectionTheme } from "@/types/content";
import { DombraShape, STRING_X, STRING_Y } from "./Dombra";
import { HORN_PATH } from "./horn-path";
import { HornPair } from "./HornPair";

type Props = {
  theme: DirectionTheme;
  /** Основной цвет рисунка и цвет деталей. */
  ink: string;
  accent: string;
  ground: string;
  className?: string;
};

/**
 * Авторская иллюстрация направления. Показывается, пока у направления
 * нет настоящей фотографии; это рисунок, а не снимок школы.
 */
export function DirectionArt({ theme, ink, accent, ground, className }: Props) {
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {theme === "strings" && (
        <g transform="translate(200 150) rotate(-24) scale(0.3) translate(-720 -170)">
          <DombraShape body={ink} neck={ink} detail={ground} />
          {STRING_Y.map((y) => (
            <line key={y} x1={STRING_X[0]} y1={y} x2={STRING_X[1]} y2={y} stroke={accent} strokeWidth="5" />
          ))}
        </g>
      )}
      {theme === "voices" && (
        <g>
          <path d={HORN_PATH} fill={ink} transform="translate(29 80) scale(1.7)" />
          <path d={HORN_PATH} fill={accent} transform="translate(371 80) scale(-1.7 1.7)" />
          <line x1="40" y1="256" x2="360" y2="256" stroke={ink} strokeWidth="2" className="stitch" />
        </g>
      )}
      {theme === "brush" && <BrushMark ink={ink} accent={accent} />}
      {theme === "plain" && (
        <g>
          <HornPair cx={200} baseY={250} scale={1.5} fill={ink} />
          <line x1="40" y1="250" x2="360" y2="250" stroke={accent} strokeWidth="2" className="stitch" />
        </g>
      )}
    </svg>
  );
}

function BrushMark({ ink, accent }: { ink: string; accent: string }) {
  return (
    <g>
      <defs>
        <filter id="brush-rough" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
      </defs>
      <circle cx="292" cy="96" r="46" fill={accent} />
      <path
        d="M46 212 C 100 120 170 112 206 168 C 238 218 300 226 356 150"
        fill="none"
        stroke={ink}
        strokeWidth="34"
        strokeLinecap="round"
        filter="url(#brush-rough)"
      />
    </g>
  );
}

/** Широкий мазок для страницы рисования: прорисовывается при загрузке. */
export function BrushStroke({ ink, accent, className }: { ink: string; accent: string; className?: string }) {
  return (
    <svg viewBox="0 0 800 420" className={className} aria-hidden>
      <defs>
        <filter id="brush-rough-lg" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </defs>
      <circle cx="600" cy="130" r="88" fill={accent} className="fade-in" style={{ ["--d" as string]: "500ms" }} />
      <path
        d="M60 330 C 160 140 300 120 370 230 C 430 330 560 350 740 190"
        fill="none"
        stroke={ink}
        strokeWidth="58"
        strokeLinecap="round"
        filter="url(#brush-rough-lg)"
        pathLength={1}
        className="brush-draw"
      />
    </svg>
  );
}
