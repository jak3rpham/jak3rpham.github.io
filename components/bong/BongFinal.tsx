"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

export function BongFinal() {
  return (
    <section id="final" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              The <span className="text-forest">final mockup</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            05
            <br />
            Assembled
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_0.85fr]">
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="max-w-[52ch] text-[clamp(1.15rem,1.7vw,1.4rem)] font-light leading-[1.7] text-tan">
            KF5 regenerated as background, GPT Image 1 logotype on a transparent background, composited in Figma Weave. The ornamental
            flourish below the logo was <span className="text-forest">unprompted</span>, a model bonus.
          </motion.p>

          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised"
          >
            <img src="/images/vng-demo/final/ad-mockup-final.webp" alt="BÓNG VESPERA ad mockup final" loading="lazy" className="w-full" />
            <figcaption className="px-4 py-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
              BÓNG VESPERA · ad cover
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
