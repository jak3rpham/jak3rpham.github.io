"use client";
import { motion, type Variants } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

const SPECS: [string, string][] = [
  ["Company", "I-Glocal · Vina Payroll"],
  ["Role", "Tech & creative lead"],
  ["Team", "Manager + Strategist + me"],
  ["Duration", "Sep 2024 → Jun 2026 · 22 months"],
  ["Audience", "FDI · JP / EU buyers"],
  ["Stack", "WP · Elementor · GA4/GSC"],
];

const rowsContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const row: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function TerraContext() {
  return (
    <section id="ctx" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[var(--pad)] select-none font-display text-[16vw] font-extrabold leading-none text-cream/[0.03]"
      >
        01
      </span>
      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Context &amp; <span className="text-forest">role</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            Project 01
            <br />
            I-Glocal Co., Ltd.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr] md:items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <p className="mb-6 max-w-[24ch] font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-medium leading-[1.35] tracking-[-0.01em] text-cream">
              Joined at <span className="text-forest">~170 clicks/day</span>, health 55, no GA4. Sole tech &amp; creative lead.
            </p>
            <p className="max-w-[54ch] text-[1.12rem] font-light leading-[1.85] text-tan">
              terra is a B2B payroll and HR SaaS for <strong className="font-medium text-cream">FDI enterprises</strong> in Vietnam,
              selling to HR managers and CFOs through a long, research-heavy, bilingual buyer journey (VI + EN for Japanese and
              European decision-makers). The mandate was full-stack: build the SEO foundation, the analytics layer, and the content
              engine in parallel, then make all of it run without me.
            </p>
          </motion.div>

          <motion.div
            variants={rowsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-[12px] border border-panel-border bg-panel p-2 backdrop-blur-md"
          >
            {SPECS.map(([k, v]) => (
              <motion.div key={k} variants={row} className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3.5 last:border-b-0">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-sand">{k}</span>
                <span className="text-right text-[0.95rem] font-medium text-cream">{v}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
