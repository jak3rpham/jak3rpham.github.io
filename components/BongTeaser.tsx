"use client";
import { motion } from "framer-motion";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";
import { fadeUp } from "@/lib/motion";

const PIPELINE = [
  { x: 100, n: "01", t: "Concept", m: "Claude Opus 4.7" },
  { x: 300, n: "02", t: "Keyframes", m: "Flux Pro 1.1" },
  { x: 500, n: "03", t: "Typography", m: "GPT Image 1" },
  { x: 700, n: "04", t: "Motion", m: "Seedance 2.0" },
  { x: 900, n: "05", t: "Failures", m: "documented" },
];

export function BongTeaser() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="bong" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="aurora" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            BÓNG <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">VESPERA</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            Latest experiment · May 2026
            <br />
            Solo · 6 hours · $0
          </div>
        </motion.div>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan"
        >
          A Vietnamese dark-fantasy ad concept taken from brief to motion by orchestrating four AI models, each for what it does best,
          with every failure documented.
        </motion.p>

        <motion.svg
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-8 h-auto w-full"
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
              <circle cx={node.x} cy="40" r="14" fill="#18211A" stroke="var(--color-forest)" strokeWidth="2" />
              <text x={node.x} y="45" textAnchor="middle" fill="var(--color-amber)" fontFamily="var(--font-mono)" fontSize="12">
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
          className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.2fr]"
        >
          <div>
            <div className="mb-4 flex divide-x divide-rule border-y border-rule">
              {[
                ["6h", "End-to-end"],
                ["5+1", "KFs + ad"],
                ["4", "Models"],
                ["$0", "Free tier"],
              ].map(([n, l]) => (
                <div key={l} className="flex-1 px-2 py-4 text-center">
                  <div className="text-[1.7rem] font-semibold leading-none text-amber">{n}</div>
                  <div className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-sand">{l}</div>
                </div>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {["AI Orchestration", "Creative Pipeline", "Solo Build"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>
            <a href="/bong-vespera.html" className="inline-flex items-center gap-2 rounded-[9px] bg-amber px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-forest">
              Full case study →
            </a>
          </div>
          <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] md:ml-auto md:mr-0">
            <div className="aspect-[2/3]">
              <img src="/images/vng-demo/final/ad-mockup-final.webp" alt="BÓNG VESPERA ad mockup" className="h-full w-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
