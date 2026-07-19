"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

const ROWS: [string, string, string][] = [
  ["Atmospheric keyframes", "Flux Pro 1.1 Ultra", "Cinematic depth, painterly finish, layered fog, single-subject composition."],
  ["Vietnamese typography", "GPT Image 1", "Accurate diacritic rendering (BÓNG, SƯƠNG, KHÔNG) and transparent-background support."],
  ["Concept expansion", "Claude Opus 4.7", "Production-prompt construction from a short brief, structured output, reference inference."],
  ["Single-frame motion", "Seedance 2.0", "1080p cinematic transition between coherent frame pairs, smooth dolly."],
  ["Multi-image narrative", "Pair-wise + manual", "Multiframes free tier fails at chained scene gaps; splitting the problem is the production workflow."],
];

export function BongReflection() {
  return (
    <section id="reflection" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Model selection <span className="text-forest">by task</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            07
            <br />
            Reflection
          </div>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-8 max-w-[62ch] text-[1.1rem] font-light leading-[1.75] text-tan">
          There is no best AI. There is only the right model for each stage of the work.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="overflow-x-auto rounded-[14px] border border-panel-border bg-panel/60 backdrop-blur-md">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-5 py-4 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-sand">Stage</th>
                <th className="px-5 py-4 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-sand">Best tool</th>
                <th className="hidden px-5 py-4 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-sand sm:table-cell">Why this model, here</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([stage, tool, why]) => (
                <tr key={stage} className="border-b border-rule last:border-b-0 align-top">
                  <td className="whitespace-nowrap px-5 py-4 text-[0.92rem] font-medium text-cream">{stage}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-[0.82rem] text-forest">{tool}</td>
                  <td className="px-5 py-4 text-[0.9rem] font-light leading-[1.55] text-tan">
                    <span className="mb-1 block font-mono text-[0.7rem] text-sand sm:hidden">Why here</span>
                    {why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.blockquote variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mt-10 border-l-[3px] border-forest pl-6">
          <p className="text-[clamp(1.3rem,2.6vw,1.9rem)] font-light leading-[1.4] text-cream">
            Flux fails at text. GPT Image 1 succeeds where newer models do not. The orchestration is matching them.
          </p>
          <cite className="mt-3 block font-mono text-[0.62rem] uppercase not-italic tracking-[0.08em] text-sand">Operating principle</cite>
        </motion.blockquote>
      </div>
    </section>
  );
}
