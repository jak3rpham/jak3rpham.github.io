"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { LetterReveal } from "../LetterReveal";
import { Cta } from "../Cta";

/**
 * Fourth hero archetype, deliberately unlike the other three: /terra and /video are splits
 * with an abstract WebGL object, /bong-vespera is a framed film still, /aru-otoko is
 * full-bleed. This one has no image at all — a software project's honest hero is its
 * manifest, so the page opens as a spec sheet: type, a mono fact table, and the two links
 * that actually matter (running app, source).
 */

const SPEC: [string, string][] = [
  ["Role", "Sole designer, engineer, author"],
  ["Stack", "Next.js 15 · React 19 · Supabase · Claude API"],
  ["Surface", "10 learner routes · 3 server routes · 4 Postgres tables"],
  ["Content", "Written by me — no real exam papers"],
  ["Year", "2026"],
];

const TEL: [string, string][] = [
  ["23", "Question types"],
  ["17 / 18", "Grammar / vocab sets"],
  ["4", "RLS-guarded tables"],
  ["0", "Config to run"],
];

export function IeltsHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden px-[var(--pad)] pb-20 pt-28"
    >
      <motion.div style={{ opacity }} className="relative z-[3] mx-auto w-full max-w-[1180px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand"
        >
          <span className="text-forest">{"// case study"}</span>
          <span className="h-px w-8 bg-rule" />
          <span>Product build · solo · 2026</span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.6rem,8vw,6.2rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-cream">
          <LetterReveal text="IELTS Studio" accentStart={6} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-7 max-w-[54ch] text-[clamp(1.1rem,1.7vw,1.4rem)] font-light leading-[1.6] text-tan"
        >
          A practice platform I built to <strong className="font-medium text-cream">study on and teach from</strong> —
          with an examiner-calibrated grader, an original item-writer, and a database that runs on
          nothing until you give it something.
        </motion.p>

        {/* the manifest: this is the hero image */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-10 max-w-[720px] border-t border-rule"
        >
          {SPEC.map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-rule py-3">
              <dt className="w-[104px] shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">{k}</dt>
              <dd className="min-w-0 font-mono text-[0.86rem] text-cream">{v}</dd>
            </div>
          ))}
        </motion.dl>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-9 flex max-w-[720px] flex-wrap border-y border-rule"
        >
          {TEL.map(([n, l]) => (
            <div key={l} className="flex-1 border-r border-rule px-5 py-4 first:pl-0 last:border-r-0">
              <div className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-none tracking-[-0.03em] text-cream">
                {n}
              </div>
              <div className="mt-2 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-sand">{l}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Cta href="https://ielts-test-kohl.vercel.app/" arrow="up-right">Open the app</Cta>
          <Cta href="https://github.com/jak3rpham/Ielts-Test" variant="secondary" arrow="up-right">Read the source</Cta>
        </motion.div>
      </motion.div>
    </section>
  );
}
