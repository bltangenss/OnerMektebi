import { HORN_PATH } from "./horn-path";

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
 * Шов между двумя полями, как в сырмаке: рог цвета нижнего поля
 * врезается в верхнее, а его зеркальная пара — в нижнее.
 * Это контрперемена: одна вырезанная форма, два цвета.
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
        {/* Рог нижнего цвета поднимается в верхнее поле */}
        <path d={HORN_PATH} fill={bottom} transform="translate(438 6) scale(0.64)" />
        {/* Его зеркальная пара опускается в нижнее поле */}
        <path d={HORN_PATH} fill={top} transform="translate(1010 134) scale(-0.64)" />
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
