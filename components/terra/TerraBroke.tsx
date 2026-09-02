"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Cta, ctaClass, CtaArrow } from "../Cta";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { fadeUp } from "@/lib/motion";

export function TerraBroke() {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);

  return (
    <section id="broke" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7.5rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              What <span className="text-forest">broke</span>
            </h2>
          </Reveal>
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="max-w-[68ch]">
          <p className="mb-6 max-w-[26ch] font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-medium leading-[1.3] tracking-[-0.01em] text-cream">
            The 12× and 2,137 clicks/day are a <span className="text-forest">peak</span>, not a promise.
          </p>
          <p className="text-[1.12rem] font-light leading-[1.85] text-tan">
            Those figures mark March 2026, the high point of a 17-month climb. Through Q2 2026 organic compressed as
            impressions and rankings shifted across the category. I caught the drop early in the same GSC pipeline I built,
            which is exactly what that pipeline is for: the number that matters is not the peak, it is how fast you see the
            turn.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mt-14 flex flex-wrap items-center gap-4">
          <motion.a
            href="https://terra-plat.vn"
            target="_blank"
            rel="noreferrer"
            ref={magnetic.ref}
            onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
            onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
            style={hoverCapable ? magnetic.style : undefined}
            className={ctaClass("primary", "md")}
          >
            <span>Visit terra-plat.vn</span>
            <CtaArrow arrow="up-right" />
          </motion.a>
          <Cta href="/" variant="secondary" arrow="none">← Back to all work</Cta>
        </motion.div>
      </div>
    </section>
  );
}
