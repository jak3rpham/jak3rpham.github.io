"use client";
import { useEffect, useRef } from "react";
import { VelocityMarquee } from "./VelocityMarquee";

/**
 * The numbers count up the first time the strip is seen, rather than arriving already
 * finished. `to` is the countable part; `prefix`/`suffix` carry what is not, so "55->90" and
 * "12x" keep their shape.
 *
 * The count is written straight to textContent rather than held in state. Driving it through
 * React would re-render the marquee, and the marquee clones its children, so a state update
 * per frame would rebuild both copies sixty times a second for an animation that only changes
 * five strings. Writing the DOM also means the values rendered on the server are the finished
 * numbers, which is what a crawler or a reader with JS off should see.
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

export function StatStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const run = () => {
      // every clone the marquee made, so both copies count together
      const nodes = [...el.querySelectorAll<HTMLElement>("[data-stat]")];
      if (!nodes.length) return;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        for (const n of nodes) {
          const to = Number(n.dataset.stat);
          const dec = Number(n.dataset.dec ?? 0);
          n.textContent = (to * eased).toFixed(dec);
        }
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // one shot, and allowed to be approximate under Lenis because it only has to fire once at
    // some point while the strip is on screen
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="relative z-[4] border-y border-rule bg-ink-raised/60 py-6">
      <VelocityMarquee baseVelocity={3}>
        {STATS.map((s) => (
          <span key={s.label} className="flex items-center gap-4 pr-8">
            <span className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-cream tabular-nums">
              {s.prefix}
              <span data-stat={s.to} data-dec={s.decimals ?? 0}>
                {s.to.toFixed(s.decimals ?? 0)}
              </span>
              {s.suffix}
            </span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-sand">{s.label}</span>
            <span className="ml-4 h-2 w-2 rotate-45 bg-forest" aria-hidden />
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
