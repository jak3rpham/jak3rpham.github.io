"use client";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { Cta } from "./Cta";
import { Parallax } from "./Parallax";
import { fadeUp } from "@/lib/motion";

const PIPELINE = [
  { x: 100, n: "01", t: "Concept", m: "Claude Opus 4.7" },
  { x: 300, n: "02", t: "Keyframes", m: "Flux Pro 1.1" },
  { x: 500, n: "03", t: "Typography", m: "GPT Image 1" },
  { x: 700, n: "04", t: "Motion", m: "Seedance 2.0" },
  { x: 900, n: "05", t: "Failures", m: "documented" },
];

/**
 * A run log, not the bordered 4-cell stat grid. This case study's subject is a pipeline
 * where the failures are the evidence, so the teaser reports outcomes per step the way a
 * job log would — which the pipeline diagram above cannot show, and which no longer looks
 * like the terra or aru teaser.
 */
type Run = { step: string; detail: string; out: string; ok: boolean };
const RUN: Run[] = [
  { step: "keyframes", detail: "flux pro 1.1", out: "5 + 1 ad mockup", ok: true },
  { step: "motion · chained", detail: "all 5 frames", out: "coherence gap", ok: false },
  { step: "motion · kf3→kf5", detail: "seedance 2.0", out: "1080p, kept", ok: true },
  { step: "typography", detail: "gpt image 1", out: "ok", ok: true },
];
const TOTALS: [string, string][] = [
  ["models", "4"],
  ["elapsed", "6h"],
  ["cost", "$0 · free tier"],
];

export function BongTeaser() {
  return (
    <section id="bong" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              BÓNG <span className="text-forest">VESPERA</span>
            </h2>
          </Reveal>
          <p className="mt-2 text-sand">Latest experiment · Solo · May 2026</p>
          <p className="mt-6 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan">
            A Vietnamese dark-fantasy ad concept taken from brief to motion by orchestrating four AI models, each for what it does
            best, with every failure documented.
          </p>
        </motion.div>

        <motion.svg
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 mb-10 h-auto w-full"
          viewBox="0 0 1000 130"
          aria-hidden="true"
        >
          {/* <path>, not <line>: WebKit only honours the pathLength attribute framer uses to
              normalise the draw-on to a 0..1 stroke-dasharray on <path>. */}
          <motion.path
            d="M100 40L900 40"
            fill="none"
            stroke="var(--color-rule)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          {PIPELINE.map((node, i) => (
            <motion.g
              key={node.n}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            >
              <circle cx={node.x} cy="40" r="14" fill="#141813" stroke="var(--color-forest)" strokeWidth="2" />
              <text x={node.x} y="45" textAnchor="middle" fill="var(--color-forest)" fontFamily="var(--font-mono)" fontSize="12">
                {node.n}
              </text>
              <text x={node.x} y="76" textAnchor="middle" fill="var(--color-cream)" fontFamily="var(--font-sans)" fontSize="14" fontWeight={500}>
                {node.t}
              </text>
              <text x={node.x} y="93" textAnchor="middle" fill="var(--color-sand)" fontFamily="var(--font-mono)" fontSize="12">
                {node.m}
              </text>
            </motion.g>
          ))}
        </motion.svg>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.2fr]"
        >
          <div>
            <div className="mb-6 overflow-hidden rounded-[10px] border border-rule bg-ink-raised/50">
              <div className="flex items-center justify-between border-b border-rule px-4 py-2.5 font-mono t-micro uppercase tracking-[0.14em] text-sand">
                <span>{"// run log"}</span>
                <span>solo · may 2026</span>
              </div>
              <ul className="px-4 py-2">
                {RUN.map((r) => (
                  <li key={r.step} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 font-mono t-micro">
                    <span aria-hidden className={r.ok ? "text-forest" : "text-tan"}>
                      {r.ok ? "✓" : "✕"}
                    </span>
                    <span className="text-cream">{r.step}</span>
                    <span className="text-sand/80">{r.detail}</span>
                    <span className={`ml-auto ${r.ok ? "text-tan" : "text-tan line-through decoration-tan/40"}`}>{r.out}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-rule px-4 py-3 font-mono t-micro text-sand">
                {TOTALS.map(([k, v]) => (
                  <span key={k}>
                    {k} <span className="text-cream">{v}</span>
                  </span>
                ))}
              </div>
            </div>
            <Cta href="/bong-vespera">Full case study</Cta>
          </div>
          <Parallax speed={-46} className="mx-auto w-full max-w-[300px] md:ml-auto md:mr-0">
          <div className="overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised">
            <div className="aspect-[2/3]">
              <img src="/images/vng-demo/final/ad-mockup-final.webp" alt="BÓNG VESPERA ad mockup" className="h-full w-full object-cover" />
            </div>
          </div>
          </Parallax>
        </motion.div>
      </div>
    </section>
  );
}
