"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { fadeUp } from "@/lib/motion";

const CLIENTS = ["I-Glocal · terra-plat.vn", "ISB Academic Team", "Mona Media", "S Communications", "L.O.M Music Club"];

export function VideoContact() {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);

  return (
    <section id="contact" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(5rem,11vw,8rem)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 right-[var(--pad)] select-none font-display text-[15vw] font-extrabold leading-none text-cream/[0.03]"
      >
        影
      </span>
      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.6vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-cream">
              Need video for <span className="text-forest">your brand?</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            Contact
            <br />
            Freelance
          </div>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan">
          From concept to final delivery: TVCs, brand films, commercial explainers, event recaps. Selectively available for
          freelance.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mt-8 flex flex-wrap gap-2">
          {CLIENTS.map((c) => (
            <span key={c} className="rounded-full border border-rule px-3.5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-tan">
              {c}
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mt-10 flex flex-wrap items-center gap-6">
          <motion.a
            href="mailto:pnthanh.work@gmail.com"
            ref={magnetic.ref}
            onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
            onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
            style={hoverCapable ? magnetic.style : undefined}
            className="inline-flex rounded-full bg-forest px-7 py-3.5 text-[0.95rem] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get in touch →
          </motion.a>
          <a href="/" className="border-b border-forest/50 pb-0.5 text-[0.95rem] text-tan transition-colors hover:text-forest">
            ← Back to portfolio
          </a>
        </motion.div>
      </div>
    </section>
  );
}
