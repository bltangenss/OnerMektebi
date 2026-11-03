import { HornPair } from "./HornPair";

/**
 * Панель-сырмақ: узор вырезан из двух войлоков и поменян местами —
 * бордовые рога на песочном поле и песочные на бордовом.
 * Заполняет место фотографии, пока у школы нет своих снимков.
 */
export function FeltPanel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 500" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="250" fill="var(--color-sand)" />
      <rect y="250" width="400" height="250" fill="var(--color-wine)" />
      <HornPair cx={200} baseY={250} scale={1.62} fill="var(--color-wine)" />
      <HornPair cx={200} baseY={250} scale={1.62} fill="var(--color-sand)" hanging />
      <line x1="0" y1="250" x2="400" y2="250" stroke="var(--color-gold)" strokeWidth="2" className="stitch" />
    </svg>
  );
}
