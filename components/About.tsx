"use client";
import { motion, type Variants } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { SpotlightCard } from "./SpotlightCard";
import { fadeUp } from "@/lib/motion";

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const word: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function LeadReveal() {
  const parts = [
    { t: "I", accent: false },
    { t: "build", accent: false },
    { t: "full-funnel", accent: true },
    { t: "growth", accent: true },
    { t: "systems", accent: true },
    { t: "for", accent: false },
    { t: "B2B", accent: false },
    { t: "SaaS,", accent: false },
    { t: "where", accent: false },
    { t: "strategy", accent: false },
    { t: "and", accent: false },
    { t: "craft", accent: false },
    { t: "meet.", accent: false },
  ];
  return (
    <motion.h2
      variants={wordContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="max-w-[20ch] font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-bold leading-[1.08] tracking-[-0.035em] text-cream"
    >
      {parts.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span variants={word} className={`inline-block ${p.accent ? "text-forest" : ""}`}>
            {p.t}
            {i < parts.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

function Fact({
  label,
  sparkPoints,
  to,
  decimals = 0,
  suffix = "",
  staticValue,
}: {
  label: string;
  sparkPoints?: string;
  to?: number;
  decimals?: number;
  suffix?: string;
  staticValue?: string;
}) {
  const countUp = useCountUp(to ?? 0, decimals);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule py-[0.95rem] first:border-t">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sand">{label}</span>
      <span className="flex items-center gap-2.5 text-2xl font-semibold text-cream">
        {sparkPoints && (
          <svg className="h-[15px] w-14" viewBox="0 0 56 15" aria-hidden="true">
            <polyline points={sparkPoints} fill="none" stroke="var(--color-forest)" strokeWidth="1.4" />
          </svg>
        )}
        <motion.b
          className="font-display font-bold tracking-[-0.02em] text-cream"
          viewport={{ once: true, amount: 0.5 }}
          onViewportEnter={to !== undefined ? () => countUp.start() : undefined}
        >
          {staticValue ?? `${countUp.value.toFixed(decimals)}${suffix}`}
        </motion.b>
      </span>
    </div>
  );
}

const STACK = [
  ["01", "Growth & SEO", "Technical SEO · Schema/CWV · Paid Media"],
  ["02", "Analytics & Data", "GA4/GSC/Clarity · Semrush/Ahrefs · Power BI"],
  ["03", "Creative & Production", "Video · Adobe Suite · Photography"],
  ["04", "Build & AI", "WordPress/Elementor · AI Workflows · MCP"],
];

function StackCard({ n, name, tools }: { n: string; name: string; tools: string }) {
  return (
    <SpotlightCard className="h-full rounded-[12px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-colors duration-200 hover:-translate-y-1 hover:border-forest/50">
      <span className="mb-3 block font-serif-jp text-xl font-bold text-forest">{n}</span>
      <div className="mb-1.5 text-[1.05rem] font-semibold text-cream">{name}</div>
      <div className="font-mono text-[0.64rem] leading-relaxed text-sand">{tools}</div>
    </SpotlightCard>
  );
}

export function About() {
  return (
    <section id="about" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <LeadReveal />

        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr] md:items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <p className="mb-6 max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              Digital marketing professional at{" "}
              <strong className="font-medium text-cream">I-Glocal Co., Ltd. (Vina Payroll Outsourcing)</strong>, leading the marketing
              build for{" "}
              <a href="https://terra-plat.vn" target="_blank" rel="noreferrer" className="border-b border-forest/40 text-forest">
                terra-plat.vn
              </a>
              . In 17 months I&apos;ve owned the full stack: technical SEO, content architecture, analytics, paid, AI-assisted
              production, and creative.
            </p>
            <p className="mb-8 max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              International Business at UEH ISB. VP of <strong className="font-medium text-cream">L.O.M Music Club</strong>, Head of
              Media at <strong className="font-medium text-cream">S Communications</strong>: teams of 6 to 50, 10+ events, 800+
              participants. <strong className="font-medium text-cream">Top 1 TVC at Business Challenge 2023 &amp; 2024.</strong>
            </p>
            <div className="font-mono text-[0.66rem] uppercase tracking-[0.13em] text-sand">
              Ho Chi Minh City · UEH ISB B.Intl Business 2025 · IELTS 7.0 C1
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 }}
          >
            <Fact label="Organic growth" sparkPoints="0,13 15,10 30,7 43,4 56,1" to={12} suffix="×" />
            <Fact label="Keywords top 10" sparkPoints="0,12 17,10 31,6 44,5 56,2" to={978} />
            <Fact label="Impressions" sparkPoints="0,13 15,12 30,8 43,5 56,1" to={31.4} decimals={1} suffix="M" />
            <Fact label="Events produced" staticValue="10+" />
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {STACK.map(([n, name, tools]) => (
            <StackCard key={n} n={n} name={name} tools={tools} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
