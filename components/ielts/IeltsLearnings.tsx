"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Cta } from "../Cta";
import { fadeUp } from "@/lib/motion";

const LEARNINGS: { k: string; title: string; body: string }[] = [
  {
    k: "一",
    title: "The prompt is the product",
    body: "The UI took a weekend; the grader and the item-writer took the rest. What separates this from a wrapper is not the code around the API call — it is knowing that Task 1 is marked on Task Achievement and that a model will inflate a band unless you forbid it.",
  },
  {
    k: "二",
    title: "Constraints picked the architecture",
    body: "The free tier decided the data model, put every key behind a server route, and put a cron job in the repo. Given a budget I would have reached for a managed CMS and learned less about where the seams actually are.",
  },
  {
    k: "三",
    title: "What it is not",
    body: "Not a validated product. No cohort has been measured, the grader has never been checked against a certified examiner's marking, and the content is mine rather than official. It is a working system built to a real spec, and it should be read as that.",
  },
];

export function IeltsLearnings() {
  return (
    <section id="learnings" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              What I <span className="text-forest">learned</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {LEARNINGS.map((l) => (
            <motion.div
              key={l.k}
              variants={fadeUp}
              className="rounded-[16px] border border-panel-border bg-panel p-6 backdrop-blur-md"
            >
              <div className="font-serif-jp text-[1.6rem] leading-none text-forest">{l.k}</div>
              <div className="mb-2 mt-3 text-[1.1rem] font-semibold text-cream">{l.title}</div>
              <p className="text-[0.9rem] font-light leading-[1.6] text-tan">{l.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Cta href="https://ielts-test-kohl.vercel.app/" arrow="up-right">Open the app</Cta>
          <Cta href="https://github.com/jak3rpham/Ielts-Test" variant="secondary" arrow="up-right">Read the source</Cta>
          <Cta href="/" variant="secondary" arrow="none">← Back to portfolio</Cta>
        </motion.div>
      </div>
    </section>
  );
}
