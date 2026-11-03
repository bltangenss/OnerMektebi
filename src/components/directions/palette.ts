import type { DirectionTheme } from "@/types/content";

export type ThemePalette = {
  ground: string;
  hover: string;
  ink: string;
  accent: string;
  text: string;
  muted: string;
  dark: boolean;
};

/** Каждое направление — свой войлок: цвет поля, рисунка и текста. */
export const themePalette: Record<DirectionTheme, ThemePalette> = {
  strings: {
    ground: "var(--color-wine)",
    hover: "var(--color-wine-deep)",
    ink: "var(--color-sand)",
    accent: "var(--color-gold)",
    text: "var(--color-milk)",
    muted: "#e6d3d8",
    dark: true,
  },
  voices: {
    ground: "var(--color-sand)",
    hover: "var(--color-sand-deep)",
    ink: "var(--color-wine)",
    accent: "var(--color-gold)",
    text: "var(--color-ink)",
    muted: "var(--color-muted)",
    dark: false,
  },
  brush: {
    ground: "var(--color-linen)",
    hover: "#e9e4dc",
    ink: "var(--color-wine)",
    accent: "var(--color-gold)",
    text: "var(--color-ink)",
    muted: "var(--color-muted)",
    dark: false,
  },
  plain: {
    ground: "var(--color-sand-deep)",
    hover: "#d8cbb6",
    ink: "var(--color-wine)",
    accent: "var(--color-gold-deep)",
    text: "var(--color-ink)",
    muted: "var(--color-muted)",
    dark: false,
  },
};
