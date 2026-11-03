"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Копирует постоянную ссылку на событие, например для QR-кода на афише. */
export function CopyLink({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href.split("#")[0]);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }}
      className="btn btn-outline text-wine"
    >
      {copied ? <Check className="size-5" aria-hidden /> : <Link2 className="size-5" aria-hidden />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
