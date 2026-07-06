"use client";
import { motion } from "framer-motion";
import { TerraStack } from "./TerraStack";
import { SpotlightCard } from "./SpotlightCard";
import { HoverScrollShot } from "./HoverScrollShot";
import { Reveal } from "./Reveal";
import { fadeUp } from "@/lib/motion";

// Ported from index.html's static line-chart SVG (600×170 viewBox); these coordinates
// trace the original hand-tuned GSC clicks/day curve, not real-time data.
const CHART_PATH =
  "M0.0,138.0 L46.2,129.9 L92.3,124.4 L138.5,133.8 L184.6,137.0 L230.8,129.2 L276.9,60.8 L323.1,29.7 L369.2,103.7 L415.4,97.7 L461.5,55.1 L507.7,31.3 L553.8,88.7 L600.0,12.0";
const AREA_PATH = `${CHART_PATH} L600,170 L0,170 Z`;

const TELEMETRY: [string, string][] = [
  ["12×", "Organic growth"],
  ["978", "Keywords top 10"],
  ["31.4M", "Impressions"],
  ["55→90", "Site health"],
];

const BULLETS = [
  "Built the publishing tooling: custom WordPress plugins that turn a one-hour manual workflow into a single click, so a non-technical team ships SEO-ready content on its own.",
  "Built the marketing data layer: automated pipelines feeding GSC, GA4, and PageSpeed into live dashboards and weekly reports.",
  "Owned full-funnel growth: technical SEO, content architecture, and paid coordination, in EN and VI, for FDI buyers.",
];

export function TerraTeaser() {
  return (
    <section id="terra" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-forest">Featured case study</span>
          <Reveal className="mt-4">
            <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              terra-plat.vn <span className="text-forest">growth</span>
            </h2>
          </Reveal>
          <p className="mt-6 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan">
            17 months of full-funnel work for a B2B payroll and HR SaaS targeting FDI, as sole tech and creative lead. From launch to
            a 2,137 clicks/day peak, 12× the launch baseline, and 978 keywords in the Top 10.
          </p>
        </motion.div>

        <div className="mt-14">
          <TerraStack>
            <SpotlightCard className="mx-auto w-full max-w-[820px] overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised">
              <HoverScrollShot src="/images/terra-outsourcing-preview.webp" alt="terra-plat.vn" urlLabel="terra-plat.vn · live site" />
            </SpotlightCard>

            <SpotlightCard className="rounded-[12px] border border-panel-border bg-panel p-7 backdrop-blur-md">
              <div className="mb-5 border-b border-rule pb-3 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-sand">
                terra-plat.vn · Google Search Console
              </div>
              <svg className="mb-4 h-[170px] w-full" viewBox="0 0 600 170" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="gareaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8FD49E" stopOpacity=".28" />
                    <stop offset="1" stopColor="#8FD49E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={AREA_PATH}
                  fill="url(#gareaG)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 1.4 }}
                />
                <motion.path
                  d={CHART_PATH}
                  fill="none"
                  stroke="var(--color-forest)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  cx="600"
                  cy="12"
                  r="5"
                  fill="var(--color-forest)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 1.8 }}
                />
              </svg>
              <div className="text-center font-mono text-[0.64rem] uppercase tracking-[0.1em] text-sand">
                Organic clicks/day · Feb 2025 to Mar 2026 peak · 2,137/day, 12× launch
              </div>
            </SpotlightCard>

            <div className="grid grid-cols-2 border-y border-rule md:grid-cols-4">
              {TELEMETRY.map(([n, l], i) => (
                <div
                  key={l}
                  className={`px-4 py-5 text-center ${i % 2 === 0 ? "border-r border-rule" : ""} ${
                    i < 2 ? "border-b border-rule md:border-b-0" : ""
                  } md:border-r md:last:border-r-0`}
                >
                  <div className="font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em] text-cream">{n}</div>
                  <div className="mt-1.5 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-sand">{l}</div>
                </div>
              ))}
            </div>
          </TerraStack>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]"
        >
          <ul className="flex flex-col gap-4">
            {BULLETS.map((text, i) => (
              <li
                key={i}
                className="relative pl-5 text-[1.05rem] font-light leading-[1.65] text-tan before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-forest"
              >
                {text}
              </li>
            ))}
          </ul>
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              {["B2B SaaS", "FDI Targeting", "EN / VI"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="/terra"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
              >
                Full case study →
              </a>
              <a href="https://terra-plat.vn" target="_blank" rel="noreferrer" className="border-b border-forest/50 pb-0.5 text-[0.92rem] text-tan transition-colors hover:text-forest">
                Live site ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
