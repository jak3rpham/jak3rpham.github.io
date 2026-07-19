"use client";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { Cta } from "./Cta";
import { fadeUp } from "@/lib/motion";

const PIPELINE = [
  { x: 100, n: "01", t: "Concept", m: "Claude Opus 4.7" },
  { x: 300, n: "02", t: "Keyframes", m: "Flux Pro 1.1" },
  { x: 500, n: "03", t: "Typography", m: "GPT Image 1" },
  { x: 700, n: "04", t: "Motion", m: "Seedance 2.0" },
  { x: 900, n: "05", t: "Failures", m: "documented" },
];

const STATS: [string, string][] = [
  ["6h", "End-to-end"],
  ["5+1", "KFs + ad"],
  ["4", "Models"],
  ["$0", "Free tier"],
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
          <motion.line
            x1="100"
            y1="40"
            x2="900"
            y2="40"
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
              <text x={node.x} y="93" textAnchor="middle" fill="var(--color-sand)" fontFamily="var(--font-mono)" fontSize="10.5">
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
            <div className="mb-6 grid grid-cols-4 border-y border-rule">
              {STATS.map(([n, l], i) => (
                <div key={l} className={`px-2 py-5 text-center ${i < STATS.length - 1 ? "border-r border-rule" : ""}`}>
                  <div className="font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em] text-cream">{n}</div>
                  <div className="mt-1.5 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-sand">{l}</div>
                </div>
              ))}
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {["AI Orchestration", "Creative Pipeline", "Solo Build"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>
            <Cta href="/bong-vespera">Full case study</Cta>
          </div>
          <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised md:ml-auto md:mr-0">
            <div className="aspect-[2/3]">
              <img src="/images/vng-demo/final/ad-mockup-final.webp" alt="BÓNG VESPERA ad mockup" className="h-full w-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
