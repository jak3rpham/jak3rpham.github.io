"use client";
import { motion } from "framer-motion";
import { TerraStack } from "./TerraStack";
import { SpotlightCard } from "./SpotlightCard";
import { HoverScrollShot } from "./HoverScrollShot";
import { Parallax } from "./Parallax";
import { WebGLLogo3D } from "./WebGLLogo3D";
import { Cta } from "./Cta";
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

const SPEC: [string, string][] = [
  ["Client", "B2B payroll & HR SaaS"],
  ["Market", "FDI · JP / EU buyers"],
  ["Window", "Sep 2024 → Jun 2026 · 22 mo · EN / VI"],
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
          <span className="font-mono t-micro uppercase tracking-[0.18em] text-forest">Featured case study</span>
          <Reveal className="mt-4">
            <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              terra-plat.vn <span className="text-forest">growth</span>
            </h2>
          </Reveal>
          <p className="mt-6 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan">
            22 months of full-funnel work for a B2B payroll and HR SaaS targeting FDI, as sole tech and creative lead. From launch to
            a 2,137 clicks/day peak, 12× the launch baseline, and 978 keywords in the Top 10.
          </p>
        </motion.div>

        <div className="mt-12">
          <TerraStack>
            <div className="grid w-full grid-cols-1 items-center gap-6 shadow-none! md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-10">
              <div className="relative hidden md:block">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 blur-[90px]"
                  style={{ background: "radial-gradient(circle, rgba(199,185,161,0.16), transparent 65%)" }}
                />
                <WebGLLogo3D className="h-[240px] w-full lg:h-[280px]" />
                <div className="mt-1 text-center font-mono t-micro uppercase tracking-[0.14em] text-sand">terra · brand mark</div>
              </div>
              <Parallax speed={-34}>
              <SpotlightCard className="overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised shadow-[0_26px_60px_rgba(0,0,0,0.45)]">
                <HoverScrollShot src="/images/terra-outsourcing-preview.webp" alt="terra-plat.vn" urlLabel="terra-plat.vn · live site" />
              </SpotlightCard>
              </Parallax>
            </div>

            <SpotlightCard className="rounded-[12px] border border-panel-border bg-panel p-7 backdrop-blur-md">
              <div className="mb-5 border-b border-rule pb-3 font-mono t-micro uppercase tracking-[0.1em] text-sand">
                terra-plat.vn · Google Search Console
              </div>
              {/* Annotations live in HTML on top, not in <text> inside the SVG: this chart is
                  preserveAspectRatio="none", so anything drawn inside it stretches with the
                  container and the type would smear. */}
              <div className="relative">
              <svg className="h-[170px] w-full" viewBox="0 0 600 170" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="gareaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#C7B9A1" stopOpacity=".28" />
                    <stop offset="1" stopColor="#C7B9A1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* launch baseline, so the climb is read against something */}
                <path d="M0 138L600 138" fill="none" stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="4 6" />
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

                <span className="pointer-events-none absolute left-0 top-[70%] font-mono t-micro uppercase tracking-[0.08em] text-sand">
                  ~170/day · baseline
                </span>
                <span className="pointer-events-none absolute right-3 top-0 font-mono t-micro tracking-[0.04em] text-forest">
                  2,137/day
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between font-mono t-micro uppercase tracking-[0.1em] text-sand/80">
                <span>Feb 2025</span>
                <span className="h-px flex-1 bg-rule/60" />
                <span>Mar 2026</span>
              </div>
              <div className="mt-3 text-center font-mono t-micro uppercase tracking-[0.1em] text-sand">
                Organic clicks/day · 12× launch
              </div>
              {/* provenance, stated plainly: this is the shape of the real report, hand-traced,
                  not a live data feed. Saying so is worth more than pretending otherwise. */}
              <div className="mt-1.5 text-center font-mono t-micro tracking-[0.06em] text-sand/70">
                Curve redrawn from the Search Console clicks/day report
              </div>
              <div className="mt-6 grid grid-cols-2 border-t border-rule md:grid-cols-4">
                {TELEMETRY.map(([n, l], i) => (
                  <div
                    key={l}
                    className={`px-4 py-4 text-center ${i % 2 === 0 ? "border-r border-rule" : ""} ${
                      i < 2 ? "border-b border-rule md:border-b-0" : ""
                    } md:border-r md:last:border-r-0`}
                  >
                    <div className="font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em] text-cream">{n}</div>
                    <div className="mt-1.5 font-mono t-micro uppercase tracking-[0.06em] text-sand">{l}</div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </TerraStack>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]"
        >
          <ul className="flex flex-col gap-4">
            {BULLETS.map((text, i) => (
              <li
                key={i}
                className="relative pl-5 t-body font-light leading-[1.65] text-tan before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-forest"
              >
                {text}
              </li>
            ))}
          </ul>
          <div>
            {/* a spec line, not pills: the pill row was the third identical one on this page,
                and this teaser's register is the instrument readout above it. */}
            <dl className="mb-6 border-t border-rule">
              {SPEC.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-rule py-2">
                  <dt className="font-mono t-micro uppercase tracking-[0.14em] text-sand">{k}</dt>
                  <dd className="text-right font-mono t-label text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-4">
              <Cta href="/terra">Full case study</Cta>
              <Cta href="https://terra-plat.vn" variant="secondary" arrow="up-right">Live site</Cta>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
