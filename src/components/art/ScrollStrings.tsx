"use client";

import { useEffect, useRef } from "react";

/**
 * Две вертикальные струны вдоль текста страницы «Күй».
 * При прокрутке они слегка прогибаются от скорости и затихают сами.
 */
export function ScrollStrings({ className = "" }: { className?: string }) {
  const refs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    let offset = 0;
    let velocity = 0;
    let raf = 0;

    const draw = () => {
      // Пружина: струна тянется к покою и чуть перелетает через него.
      velocity += -offset * 0.18;
      velocity *= 0.82;
      offset += velocity;
      refs.current.forEach((el, i) => {
        const x = i === 0 ? 4 : 14;
        el?.setAttribute("d", `M${x} 0 Q${x + offset * (i === 0 ? 1 : 0.8)} 500 ${x} 1000`);
      });
      raf = Math.abs(offset) > 0.05 || Math.abs(velocity) > 0.05 ? requestAnimationFrame(draw) : 0;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      offset = Math.max(-9, Math.min(9, offset + dy * 0.12));
      if (!raf) raf = requestAnimationFrame(draw);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg viewBox="0 0 18 1000" preserveAspectRatio="none" className={className} aria-hidden>
      {[4, 14].map((x, i) => (
        <path
          key={x}
          ref={(el) => {
            refs.current[i] = el;
          }}
          d={`M${x} 0 Q${x} 500 ${x} 1000`}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
