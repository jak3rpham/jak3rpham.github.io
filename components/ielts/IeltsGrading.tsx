"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Decision = { n: string; title: string; naive: string; chose: string; because: string };

/**
 * The section the rest of the page exists for. Every other case study on this site shows
 * what was made; this one shows what was rejected, because on a software project the
 * discarded option is the part that carries the judgement.
 */
const DECISIONS: Decision[] = [
  {
    n: "01",
    title: "Two rubrics, not one",
    naive: 'A single "grade this essay" prompt for both writing tasks.',
    chose: "Separate system prompts: Task 1 graded on Task Achievement, Task 2 on Task Response.",
    because:
      "They are different exams. A Task 1 report is a factual summary and inventing an opinion is penalised; a Task 2 essay without a clear position is penalised. One prompt marks one of them wrong every time.",
  },
  {
    n: "02",
    title: "Told to be harsh",
    naive: "Let the model score naturally and trust the number.",
    chose:
      'Explicit anti-inflation instruction — "Be honest and calibrated — do not inflate. Reward only what is actually present." — plus enforced penalties for under-length and undeveloped arguments.',
    because:
      "Language models are agreeable by default and drift toward flattering bands. A grader that says 7.0 to everyone is worse than no grader, because the learner stops working.",
  },
  {
    n: "03",
    title: "A contract, not a conversation",
    naive: "Show the model's prose feedback straight to the user.",
    chose:
      "A locked JSON shape — four criteria with bands and comments, an overall, a single next fix, and 3–5 targeted corrections — with the response de-fenced and parsed defensively.",
    because:
      "Free text cannot drive a UI, and it cannot be compared across attempts. A shape makes the feedback renderable, and when parsing fails the route returns the raw text so it is debuggable instead of a blank screen.",
  },
  {
    n: "04",
    title: "English descriptors, Vietnamese feedback",
    naive: "One language throughout.",
    chose: "Grade against the official English band descriptors, return every comment in Vietnamese.",
    because:
      "The rubric only means what it means in English, but a Vietnamese learner reading advice in their second language spends effort on decoding instead of fixing.",
  },
];

const TRAPS: [string, string][] = [
  ["Paraphrase the answer", "The correct option never reuses the source's keywords — keyword-spotting has to fail. Wrong options may lift wording straight from the text. That is the bait."],
  ["Distractors are misreadings", "A detail that is in the source but answers a different question; a half-truth; an overgeneralisation; a number that sits near the right one."],
  ["Correction traps", 'Where a speaker states then revises — "Tuesday — sorry, Wednesday" — the obvious-sounding answer is the discarded one.'],
  ["NOT GIVEN vs FALSE", "Both must appear, and telling them apart has to require real work: absent information versus contradicted information, never merely off-topic."],
];

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-rule/70 py-3">
      <span className="w-[74px] shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sand">{k}</span>
      <span className="min-w-0 flex-1 text-[0.95rem] font-light leading-[1.65] text-tan">{v}</span>
    </div>
  );
}

export function IeltsGrading() {
  return (
    <section id="grading" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <div>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-forest">{"// the grader"}</span>
            <Reveal className="mt-3">
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
                What I <span className="text-forest">didn&apos;t</span> do
              </h2>
            </Reveal>
          </div>
          <p className="max-w-[40ch] text-[1rem] font-light leading-[1.7] text-tan">
            Four decisions where the obvious version was already working, and shipping it would have been
            the mistake.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {DECISIONS.map((d) => (
            <motion.div
              key={d.n}
              variants={fadeUp}
              className="flex flex-col rounded-[14px] border border-panel-border bg-panel/60 p-7 backdrop-blur-md"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[0.72rem] tracking-[0.1em] text-forest">{d.n}</span>
                <span className="text-[1.15rem] font-medium text-cream">{d.title}</span>
              </div>
              <div className="mt-4">
                <Row k="Obvious" v={d.naive} />
                <Row k="Chose" v={d.chose} />
                <Row k="Because" v={d.because} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* the item-writer: the part that is domain knowledge rather than engineering */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-5">
            <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold leading-tight tracking-[-0.03em] text-cream">
              Traps are the <span className="text-forest">specification</span>
            </h3>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">
              /api/generate-questions
            </span>
          </div>

          <p className="mb-8 max-w-[64ch] text-[1.05rem] font-light leading-[1.8] text-tan">
            Since no real papers are used, the app has to write its own questions — and a generated
            question is worthless if it can be answered by matching words. The generator prompt is not
            &ldquo;write some questions&rdquo;; it is a set of rules about how a question must be able to
            catch a candidate who is skimming.
          </p>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-2">
            {TRAPS.map(([t, d]) => (
              <div key={t} className="bg-ink-raised/60 p-6">
                <div className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-forest">{t}</div>
                <p className="text-[0.94rem] font-light leading-[1.7] text-tan">{d}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-[64ch] border-l-2 border-forest/50 pl-5 text-[0.98rem] font-light leading-[1.75] text-sand">
            Reading questions are additionally shaped per part — Part 1 easier and mostly True/False/Not
            Given, Part 3 hardest with the tightest distractors and almost no plain TFNG — because a
            generator that ignores part difficulty produces a flat paper that trains the wrong reflex.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
