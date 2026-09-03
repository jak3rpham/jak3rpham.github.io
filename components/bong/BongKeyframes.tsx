"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Coverflow } from "../Coverflow";
import { fadeUp } from "@/lib/motion";

type KF = { no: string; img: string; title: string; credit: string; lesson: string };

const KEYFRAMES: KF[] = [
  {
    no: "KF1",
    img: "/images/vng-demo/stills/kf1-the-gate-at-dawn.webp",
    title: "The Gate at Dawn",
    credit: "14 cr · 2 attempts",
    lesson: "Vietnamese-specific architectural vocabulary is non-negotiable. Generic Asian gate defaults the model to a Japanese torii every time.",
  },
  {
    no: "KF2",
    img: "/images/vng-demo/stills/kf2-the-wanderer-enters.webp",
    title: "The Wanderer Enters",
    credit: "7 cr · single shot",
    lesson: "Vocabulary calibrated on one frame compounds; later generations inherit the visual grammar for free.",
  },
  {
    no: "KF3",
    img: "/images/vng-demo/stills/kf3-path-of-guardians.webp",
    title: "Path of Guardians",
    credit: "7 cr · 1 attempt",
    lesson: "Specifying internal variation (kneeling, headless, eroded) stops the model defaulting to identical replicas.",
  },
  {
    no: "KF4",
    img: "/images/vng-demo/stills/kf4-the-kneeling-moment.webp",
    title: "The Kneeling Moment",
    credit: "7 cr · compromise",
    lesson: "Flux has a strong Buddha prior on stone deity. Credits were conserved here for the harder KF5 rather than fought.",
  },
  {
    no: "KF5",
    img: "/images/vng-demo/stills/kf5-after-the-recognition.webp",
    title: "After the Recognition",
    credit: "21 cr · 3 attempts",
    lesson: "Stone statue + glow triggers a demon prior that prompts cannot override. Reframing to imply, not reveal, landed harder. The senior signal.",
  },
];

function KFCard({ k }: { k: KF }) {
  return (
    <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised">
      <div className="relative aspect-[2/3] overflow-hidden bg-ink-raised">
        <img src={k.img} alt={k.title} draggable={false} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-[5px] bg-black/60 px-2 py-0.5 font-mono t-micro uppercase tracking-[0.08em] text-cream backdrop-blur-sm">
          {k.no}
        </span>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="t-lead font-semibold text-cream">{k.title}</div>
          <div className="shrink-0 font-mono t-micro uppercase tracking-[0.04em] text-forest">{k.credit}</div>
        </div>
        <p className="mt-2 t-small font-light leading-[1.55] text-tan">{k.lesson}</p>
      </div>
    </div>
  );
}

export function BongKeyframes() {
  return (
    <section id="keyframes" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px] px-[var(--pad)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Direction C, <span className="text-forest">frame by frame</span>
            </h2>
          </Reveal>
        </div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-4 max-w-[62ch] t-body font-light leading-[1.7] text-tan">
          Five atmospheric stills, each with its credit cost and the prompting lesson it taught. Drag to browse, or use the arrows.
        </motion.p>
      </div>
      <div className="px-[var(--pad)]">
        <div className="mx-auto max-w-[1500px]">
          <Coverflow items={KEYFRAMES.map((k) => <KFCard key={k.no} k={k} />)} itemClassName="w-[min(80vw,410px)]" gapClass="gap-3" />
        </div>
      </div>
    </section>
  );
}
