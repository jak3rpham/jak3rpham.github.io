"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

type Concept = { dir: string; title: string; desc: string; mood: string; target: string; pick?: boolean };

const CONCEPTS: Concept[] = [
  {
    dir: "Direction A",
    title: "The Last Lantern",
    desc: "A small girl carries the last living flame through a fallen empire, with the ghost of her sworn protector.",
    mood: "Quiet, aching, after-war",
    target: "Narrative seekers",
  },
  {
    dir: "Direction B",
    title: "Heaven's Edge",
    desc: "A mortal warrior climbs a thousand-step shrine to break a sword across the face of the god who burned the world.",
    mood: "Thunderous, defiant",
    target: "Power fantasy",
  },
  {
    dir: "Direction C",
    title: "What the Mist Remembers",
    desc: "A masked wanderer enters a forgotten valley where every ruin whispers a name they should not know, including their own.",
    mood: "Hushed, hypnotic, uncanny",
    target: "Lone explorer · lore-readers",
    pick: true,
  },
];

export function BongConcept() {
  return (
    <section id="concept" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Three directions, <span className="text-forest">one chosen</span>
            </h2>
          </Reveal>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-10 max-w-[64ch] text-[1.1rem] font-light leading-[1.75] text-tan">
          Decision under constraint matters more than picking the best concept. C won because a single subject plus atmospheric scenes
          maximise per-credit yield on Flux, and the mood is recruiter-distinctive (most VN game ads default to power fantasy).
        </motion.p>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {CONCEPTS.map((c) => (
            <motion.div
              key={c.dir}
              variants={fadeUp}
              className={`relative rounded-[16px] border bg-panel p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 ${
                c.pick ? "border-forest shadow-[0_0_28px_rgba(232,162,76,0.16)]" : "border-panel-border"
              }`}
            >
              {c.pick && (
                <span className="absolute right-4 top-4 rounded-[5px] bg-forest px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-ink">
                  Picked
                </span>
              )}
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">{c.dir}</div>
              <div className="mb-2 mt-1 text-[1.2rem] font-semibold text-cream">{c.title}</div>
              <p className="mb-4 text-[0.92rem] font-light leading-[1.6] text-tan">{c.desc}</p>
              <div className="space-y-1 border-t border-rule pt-3 text-[0.82rem] text-sand">
                <div>
                  Mood <b className="font-medium text-forest">{c.mood}</b>
                </div>
                <div>
                  Target <b className="font-medium text-forest">{c.target}</b>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
