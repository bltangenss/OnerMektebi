import type { ReactNode } from "react";
import { Seam } from "@/components/art/Seam";

const TONES = {
  milk: { bg: "var(--color-milk)", text: "text-ink", lead: "text-muted", dark: false },
  sand: { bg: "var(--color-sand)", text: "text-ink", lead: "text-muted", dark: false },
  linen: { bg: "var(--color-linen)", text: "text-ink", lead: "text-muted", dark: false },
  wine: { bg: "var(--color-wine)", text: "text-milk", lead: "text-muted-on-dark", dark: true },
} as const;

type Props = {
  title: string;
  lead?: string;
  tone?: keyof typeof TONES;
  /** Иллюстрация справа (на телефоне — под текстом). */
  art?: ReactNode;
  /** Что-то под заголовком: ссылки, метки. */
  children?: ReactNode;
  /** Шов в молочное поле страницы. */
  seam?: boolean;
  titleClassName?: string;
};

export function PageHero({ title, lead, tone = "sand", art, children, seam = true, titleClassName = "" }: Props) {
  const p = TONES[tone];
  return (
    <div style={{ background: p.bg }} className={p.dark ? "on-dark" : ""}>
      <div className={`shell grid items-end gap-10 pt-12 pb-10 md:pt-20 md:pb-14 ${art ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <div className={p.text}>
          <h1 className={`display line-in text-[clamp(3.6rem,13vw,8.5rem)] ${titleClassName}`}>
            <span>{title}</span>
          </h1>
          {lead && <p className={`fade-in measure mt-6 text-lg md:text-xl ${p.lead}`} style={{ ["--d" as string]: "250ms" }}>{lead}</p>}
          {children}
        </div>
        {art && <div className="fade-in" style={{ ["--d" as string]: "200ms" }}>{art}</div>}
      </div>
      {seam && <Seam top={p.bg} bottom="var(--color-milk)" flip />}
    </div>
  );
}
