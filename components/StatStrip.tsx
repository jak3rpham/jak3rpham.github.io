"use client";
import { VelocityMarquee } from "./VelocityMarquee";

const STATS: { value: string; label: string }[] = [
  { value: "12×", label: "Organic growth" },
  { value: "978", label: "Keywords top 10" },
  { value: "31.4M", label: "Impressions" },
  { value: "55→90", label: "Site health" },
  { value: "2", label: "Top 1 TVCs" },
];

export function StatStrip() {
  return (
    <div className="relative z-[4] border-y border-rule bg-ink-raised/60 py-6">
      <VelocityMarquee baseVelocity={3}>
        {STATS.map((s) => (
          <span key={s.label} className="flex items-center gap-4 pr-8">
            <span className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-cream">
              {s.value}
            </span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-sand">{s.label}</span>
            <span className="ml-4 h-2 w-2 rotate-45 bg-forest" aria-hidden />
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
