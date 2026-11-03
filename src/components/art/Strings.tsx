"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Видимая область в координатах рисунка: [x, y, ширина, высота]. */
  viewBox: [number, number, number, number];
  ys: readonly number[];
  x0: number;
  x1: number;
  color?: string;
  width?: number;
  className?: string;
};

type StringState = { amp: number; start: number; px: number };

const FREQ = 6.5; // колебаний в секунду, чтобы глаз успевал увидеть волну
const DECAY = 0.55; // секунды затухания

/**
 * Живые струны: их можно задеть курсором или пальцем, и они дрожат.
 * Звука нет и не имитируется — это только жест, отклик на касание.
 */
export function Strings({ viewBox, ys, x0, x1, color = "var(--color-gold)", width = 2, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const states: StringState[] = ys.map(() => ({ amp: 0, start: 0, px: (x0 + x1) / 2 }));
    const last = new Map<number, { x: number; y: number }>();
    let raf = 0;

    const draw = (now: number) => {
      let active = false;
      states.forEach((s, i) => {
        const el = pathRefs.current[i];
        if (!el) return;
        const t = (now - s.start) / 1000;
        const env = s.amp * Math.exp(-t / DECAY);
        const y = ys[i];
        if (Math.abs(env) < 0.05) {
          el.setAttribute("d", `M${x0} ${y} L${x1} ${y}`);
          return;
        }
        active = true;
        const off = env * Math.cos(2 * Math.PI * FREQ * t);
        el.setAttribute("d", `M${x0} ${y} Q${s.px} ${y + off * 2} ${x1} ${y}`);
      });
      raf = active ? requestAnimationFrame(draw) : 0;
    };

    const pluck = (i: number, px: number, amp: number) => {
      states[i] = { amp, start: performance.now(), px: Math.min(Math.max(px, x0 + 40), x1 - 40) };
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const toLocal = (clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      if (r.width === 0) return null;
      const [vx, vy, vw, vh] = viewBox;
      return {
        x: vx + ((clientX - r.left) / r.width) * vw,
        y: vy + ((clientY - r.top) / r.height) * vh,
        inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom,
      };
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (!p) return;
      const prev = last.get(e.pointerId);
      last.set(e.pointerId, { x: p.x, y: p.y });
      if (!prev || !p.inside || p.x < x0 || p.x > x1) return;
      ys.forEach((sy, i) => {
        if ((prev.y - sy) * (p.y - sy) < 0) {
          const dy = p.y - prev.y;
          pluck(i, p.x, Math.sign(dy) * Math.min(Math.max(Math.abs(dy) * 0.6, 4), 13));
        }
      });
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (!p?.inside) return;
      ys.forEach((sy, i) => {
        if (Math.abs(p.y - sy) < 22) pluck(i, p.x, 9);
      });
    };

    const onLeave = (e: PointerEvent) => last.delete(e.pointerId);

    // Один приветственный щипок после того, как струны натянулись.
    const hello = window.setTimeout(() => {
      ys.forEach((_, i) => window.setTimeout(() => pluck(i, x0 + (x1 - x0) * 0.62, 6), i * 140));
    }, 1300);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointercancel", onLeave);
    return () => {
      window.clearTimeout(hello);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointercancel", onLeave);
    };
  }, [viewBox, ys, x0, x1]);

  return (
    <svg ref={svgRef} viewBox={viewBox.join(" ")} className={className} aria-hidden>
      {ys.map((y, i) => (
        <path
          key={y}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={`M${x0} ${y} L${x1} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          className="string-draw"
          style={{ ["--i" as string]: i }}
        />
      ))}
    </svg>
  );
}
