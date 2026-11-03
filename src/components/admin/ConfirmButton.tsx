"use client";

import type { ReactNode } from "react";

type Props = { message: string; className?: string; children: ReactNode; label?: string };

/** Кнопка отправки, которая сначала спрашивает подтверждение (например, удаления). */
export function ConfirmButton({ message, className, children, label }: Props) {
  return (
    <button
      type="submit"
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
