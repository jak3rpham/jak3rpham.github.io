"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { ScrubChart } from "../ScrubChart";
import { useCountUp } from "@/lib/useCountUp";
import { fadeUp } from "@/lib/motion";

type Kpi = { to?: number; decimals?: number; suffix?: string; staticValue?: string; label: string; sub: string };

const KPIS: Kpi[] = [
  { staticValue: "175 → 2,137", label: "Daily clicks", sub: "launch to peak" },
  { to: 12.2, decimals: 1, suffix: "×", label: "Growth multiplier", sub: "predominantly organic" },
  { to: 449965, label: "Total clicks", sub: "17-month GSC window" },
  { to: 31.4, decimals: 1, suffix: "M", label: "Impressions", sub: "Google Search" },
  { to: 978, label: "Keywords Top 10", sub: "Google ranking" },
  { staticValue: "55 → 90", label: "Site health", sub: "Semrush" },
];

const LINE =
  "M0.0,162.2 L37.5,155.7 L75.0,148.4 L112.5,136.3 L150.0,131.7 L187.5,140.4 L225.0,144.5 L262.5,135.5 L300.0,63.5 L337.5,35.0 L375.0,108.7 L412.5,104.5 L450.0,57.5 L487.5,32.3 L525.0,100.1 L562.5,12.0 L600.0,128.2";

function KpiCard({ k }: { k: Kpi }) {
  const c = useCountUp(k.to ?? 0, k.decimals ?? 0);
  const shown =
    k.staticValue ??
    `${k.decimals ? c.value.toFixed(k.decimals) : Math.round(c.value).toLocaleString("en-US")}${k.suffix ?? ""}`;
  return (
    <motion.div
      variants={fadeUp}
      onViewportEnter={k.to !== undefined ? () => c.start() : undefined}
      className="rounded-[12px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-none tracking-[-0.03em] text-forest">
        {shown}
      </div>
      <div className="mt-3 t-small font-medium text-cream">{k.label}</div>
      <div className="mt-0.5 font-mono t-micro uppercase tracking-[0.06em] text-sand">{k.sub}</div>
    </motion.div>
  );
}

export function TerraNumbers() {
  return (
    <section id="results" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7.5rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              The <span className="text-forest">numbers</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-10 grid grid-cols-2 gap-4 [perspective:1200px] lg:grid-cols-3"
        >
          {KPIS.map((k) => (
            <KpiCard key={k.label} k={k} />
          ))}
        </motion.div>

        <ScrubChart
          line={LINE}
          area={`${LINE} L600,180 L0,180 Z`}
          dot={{ cx: 562.5, cy: 12.0 }}
          xLabels={["Dec '24", "Apr '25", "Aug '25", "Dec '25", "Mar '26"]}
          barLabel="Google Search Console · monthly clicks"
          caption="Monthly organic clicks · Dec 2024 → Apr 2026 · 17-month GSC window · peak 66.3K in Mar 2026 (2,137/day)"
        />
      </div>
    </section>
  );
}
