"use client";
import { motion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";
import { SpotlightCard } from "./SpotlightCard";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";
import { fadeUp } from "@/lib/motion";

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
            <polyline points={sparkPoints} fill="none" stroke="#79B488" strokeWidth="1.4" />
          </svg>
        )}
        <motion.b
          className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-bold text-transparent"
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

export function About() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="about" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="radar" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="relative pl-5 text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream before:absolute before:bottom-[0.1em] before:left-0 before:top-[0.1em] before:w-1.5 before:rounded before:bg-gradient-to-r before:from-[#D2E8B4] before:to-[#6FBE7F]">
            Who I <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">am</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            22 · Cancer · INTJ-T
            <br />
            HCMC, Vietnam
          </div>
        </motion.div>

        <div className="mb-11 grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr] md:items-start">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <p className="mb-6 max-w-[24ch] text-[clamp(1.5rem,2.6vw,2.3rem)] font-normal leading-[1.4] tracking-[-0.01em] text-cream">
              I build{" "}
              <strong className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-semibold text-transparent">
                full-funnel growth systems
              </strong>{" "}
              for B2B SaaS, where strategy and craft meet.
            </p>
            <p className="mb-5 max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              Digital marketing professional at{" "}
              <strong className="font-medium text-cream">I-Glocal Co., Ltd. (Vina Payroll Outsourcing)</strong>, leading the marketing
              build for{" "}
              <a href="https://terra-plat.vn" target="_blank" rel="noreferrer" className="border-b border-forest/40 text-forest">
                terra-plat.vn
              </a>
              . In 17 months I&apos;ve owned the full stack: technical SEO, content architecture, analytics, paid, AI-assisted
              production, and creative.
            </p>
            <p className="max-w-[54ch] text-[1.18rem] font-light leading-[1.85] text-tan">
              International Business at UEH ISB. VP of <strong className="font-medium text-cream">L.O.M Music Club</strong>, Head of
              Media at <strong className="font-medium text-cream">S Communications</strong>: teams of 6 to 50, 10+ events, 800+
              participants. <strong className="font-medium text-cream">Top 1 TVC at Business Challenge 2023 &amp; 2024.</strong>
            </p>
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
          className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {STACK.map(([n, name, tools]) => (
            <SpotlightCard
              key={n}
              className="rounded-[14px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-transform hover:-translate-y-1 hover:border-forest"
            >
              <span className="mb-2 block font-serif-jp text-xl font-bold text-forest">{n}</span>
              <div className="mb-1 text-[1.05rem] font-semibold text-cream">{name}</div>
              <div className="font-mono text-[0.64rem] text-sand">{tools}</div>
            </SpotlightCard>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="border-t border-rule pt-5 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-sand"
        >
          EST. HCMC · UEH ISB B.Intl Business 2025 · IELTS 7.0 C1
        </motion.div>
      </div>
    </section>
  );
}
