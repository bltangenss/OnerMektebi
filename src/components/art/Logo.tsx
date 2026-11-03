type Props = { className?: string; title?: string };

/**
 * Временный знак школы: буква «Ө», у которой перекладину заменяют
 * две струны домбры. Заменяется официальным логотипом в одном месте.
 */
export function LogoMark({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <line x1="1.5" y1="17.6" x2="38.5" y2="17.6" stroke="var(--color-gold)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1.5" y1="22.4" x2="38.5" y2="22.4" stroke="var(--color-gold)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
