"use client";
import { useEffect, useRef } from "react";

/**
 * The numbers, as a vertical column read top to bottom, for the right hand side of the hero
 * stage. It replaces the horizontal marquee band that used to sit under the hero: the opening is
 * one pinned screen now, and a full width running strip has nowhere to run across it.
 *
 * The count up survives from that version and so does the reason for how it is written. Each
 * value is put straight into `textContent` rather than held in state, so a sixty frames a second
 * animation over five strings does not re-render the column; it also means the markup the server
 * sends already carries the finished numbers, which is what a crawler or a reader with no JS
 * should get.
 *
 * The stagger is a CSS animation delay rather than another scroll subscriber. HeroStage mounts
 * this at its cue and drives the column's arrival from the right; what happens inside the column
 * is one gesture that only plays once, so it belongs to the element, not to the ticker.
 */
type Stat = { to: number; decimals?: number; prefix?: string; suffix?: string; label: string };

const STATS: Stat[] = [
  { to: 12, suffix: "×", label: "Organic growth" },
  { to: 978, label: "Keywords top 10" },
  { to: 31.4, decimals: 1, suffix: "M", label: "Impressions" },
  { to: 90, prefix: "55→", label: "Site health" },
  { to: 2, label: "Top 1 TVCs" },
];

const DURATION = 1100;

export function StatColumn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const nodes = [...el.querySelectorAll<HTMLElement>("[data-stat]")];
    if (!nodes.length) return;

    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      for (const n of nodes) {
        n.textContent = (Number(n.dataset.stat) * eased).toFixed(Number(n.dataset.dec ?? 0));
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-start gap-5 border-l border-rule pl-6">
      {STATS.map((s, i) => (
        <div key={s.label} className="stat-drop" style={{ animationDelay: `${i * 90}ms` }}>
          <div className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-none tracking-[-0.03em] text-cream tabular-nums">
            {s.prefix}
            <span data-stat={s.to} data-dec={s.decimals ?? 0}>
              {s.to.toFixed(s.decimals ?? 0)}
            </span>
            {s.suffix}
          </div>
          <div className="mt-1.5 font-mono t-micro uppercase tracking-[0.16em] text-sand">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
