"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

const CONSTRAINTS: { k: string; t: string; d: string }[] = [
  {
    k: "01",
    t: "Two users, one codebase",
    d: "I needed it as a learner and as someone teaching from it. Those want opposite things — a learner wants zero setup, a teacher wants accounts, saved progress and a way to add material. Both had to fit in one app without a paid tier or a second build.",
  },
  {
    k: "02",
    t: "No real exam papers",
    d: "Reusing published Cambridge tests would have been the fast path and the wrong one. Every passage, question and vocabulary set in the repo is written from scratch, which made an original item-writer a requirement rather than a feature.",
  },
  {
    k: "03",
    t: "Free tier, permanently",
    d: "Vercel Hobby and Supabase Free. That is not a budget note, it is a design constraint: it decided the data model, where the AI calls live, and why there is a scheduled job in the repo at all.",
  },
];

export function IeltsWhy() {
  return (
    <section id="why" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-rule pb-6">
          <span className="font-mono t-micro uppercase tracking-[0.18em] text-forest">{"// why it exists"}</span>
          <Reveal className="mt-3">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Built for a real user. <span className="text-forest">Me.</span>
            </h2>
          </Reveal>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 max-w-[62ch] t-lead font-light leading-[1.8] text-tan"
        >
          Practice apps grade you against a keyword list and call it a band score. What actually moves a
          score is being told, specifically, what to fix next — and being trained against the traps a
          real paper sets. That is a writing problem and a prompt problem before it is a UI problem, so
          that is where most of the work went.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-3"
        >
          {CONSTRAINTS.map((c) => (
            <motion.div key={c.k} variants={fadeUp} className="bg-ink p-7">
              <div className="font-mono t-micro tracking-[0.1em] text-forest">{c.k}</div>
              <div className="mb-3 mt-3 t-lead font-medium leading-tight text-cream">{c.t}</div>
              <p className="t-small font-light leading-[1.7] text-tan">{c.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
