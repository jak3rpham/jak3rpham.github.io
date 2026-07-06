"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

const LEARNINGS: { k: string; title: string; body: string }[] = [
  {
    k: "一",
    title: "Pivot under constraint",
    body: "The payoff frame failed twice to a trained prior no prompt could override. The fix was not a better prompt but reframing the shot entirely. Routing around a model boundary under constraint is the senior signal.",
  },
  {
    k: "二",
    title: "Free tier as transparency",
    body: "Two clips, not one. The failure is evidence of where the free tier breaks; the working clip is the same brief with the right tool. The diagnosis matters more than the polish.",
  },
  {
    k: "三",
    title: "Process over output",
    body: "Not a finished campaign: no media plan, no audience testing. What it proves is that I can decompose a brief across the right models, route around their limits, and ship a coherent deliverable in a single workday — including flagging what did not work.",
  },
];

export function BongLearnings() {
  return (
    <section id="learnings" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              What I <span className="text-forest">learned</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            08
            <br />
            Learnings
          </div>
        </div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {LEARNINGS.map((l) => (
            <motion.div key={l.k} variants={fadeUp} className="rounded-[16px] border border-panel-border bg-panel p-6 backdrop-blur-md">
              <div className="font-serif-jp text-[1.6rem] leading-none text-forest">{l.k}</div>
              <div className="mb-2 mt-3 text-[1.1rem] font-semibold text-cream">{l.title}</div>
              <p className="text-[0.9rem] font-light leading-[1.6] text-tan">{l.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mt-12 flex flex-wrap items-center gap-6">
          <a href="/" className="inline-flex rounded-full bg-forest px-7 py-3.5 text-[0.95rem] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5">
            ← Back to portfolio
          </a>
          <a href="/terra" className="border-b border-forest/50 pb-0.5 text-[0.95rem] text-tan transition-colors hover:text-forest">
            See the terra case →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
