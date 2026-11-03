import { HornPair } from "./HornPair";

type Props = {
  top: string;
  bottom: string;
  /** Цвет строчки по шву. */
  thread?: string;
  /** Зеркалит узор, чтобы соседние швы не повторялись. */
  flip?: boolean;
  className?: string;
};

/**
 * Шов между двумя полями, как в сырмаке: пара рогов цвета нижнего поля
 * врастает в верхнее, а её двойник цвета верхнего — в нижнее.
 * Это контрперемена: один вырезанный узор, два цвета.
 */
export function Seam({ top, bottom, thread = "var(--color-gold)", flip, className }: Props) {
  return (
    <div aria-hidden className={className} style={{ background: bottom }}>
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="xMidYMid slice"
        className="block h-[76px] w-full md:h-[120px] lg:h-[140px]"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <rect x="0" y="0" width="1440" height="70" fill={top} />
        <rect x="0" y="70" width="1440" height="70" fill={bottom} />
        <HornPair cx={470} baseY={70} scale={0.6} fill={bottom} />
        <HornPair cx={985} baseY={70} scale={0.6} fill={top} hanging />
        <line
          x1="0"
          y1="70"
          x2="1440"
          y2="70"
          stroke={thread}
          strokeWidth="1.5"
          className="stitch sew"
          strokeDasharray="7 6"
        />
      </svg>
    </div>
  );
}
