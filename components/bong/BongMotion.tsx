"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

type Clip = { src: string; poster: string; kicker: string; title: string; desc: string };

const CLIPS: Clip[] = [
  {
    src: "/images/vng-demo/motion/motion-multiframes-experimental.mp4",
    poster: "/images/vng-demo/stills/kf3-path-of-guardians.webp",
    kicker: "Free tier · Multiframes · 720p",
    title: "Chained 5-frame transition",
    desc: "All 5 keyframes fed sequentially. Visibly inconsistent: the scene gaps exceed the model's coherence threshold.",
  },
  {
    src: "/images/vng-demo/motion/motion-kf3-to-kf5-seedance.mp4",
    poster: "/images/vng-demo/stills/kf5-after-the-recognition.webp",
    kicker: "Seedance 2.0 · 1080p",
    title: "KF3 → KF5 cinematic transition",
    desc: "Two coherent frames interpolated image-to-video. Smooth dolly-out, mist drift, ember pulse intact. Production-tier motion when input frames share visual language.",
  },
];

export function BongMotion() {
  return (
    <section id="motion" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Two clips, <span className="text-forest">on purpose</span>
            </h2>
          </Reveal>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-10 max-w-[64ch] t-lead font-light leading-[1.75] text-tan">
          Both included to show the boundary between free-tier and production capability. The contrast is the lesson. Hiding the
          failure would have been easier; showing it with the diagnosis is what separates a portfolio piece from a brochure.
        </motion.p>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {CLIPS.map((c) => (
            <motion.div key={c.title} variants={fadeUp} className="overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised">
              <video src={c.src} poster={c.poster} controls muted loop playsInline preload="metadata" className="block w-full bg-black" />
              <div className="px-6 py-5">
                <div className="font-mono t-micro uppercase tracking-[0.08em] text-forest">{c.kicker}</div>
                <div className="mt-1.5 t-lead font-semibold text-cream">{c.title}</div>
                <p className="mt-2 t-small font-light leading-[1.6] text-tan">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
