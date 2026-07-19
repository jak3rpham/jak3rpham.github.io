"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";
import { useScramble } from "@/lib/useScramble";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Cta } from "./Cta";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } },
};
const letter: Variants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {text.split("").map((c, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ lineHeight: 0.95 }}>
          <motion.span variants={letter} className="inline-block">
            {c === " " ? " " : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { display, isScrambling, trigger } = useScramble("Pham Ngoc Thanh");
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "-38%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "22%"]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.08]);
  const portraitRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -16]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative grid min-h-[100dvh] grid-cols-1 items-center gap-14 overflow-hidden px-[var(--pad)] pb-20 pt-28 md:grid-cols-[1.45fr_1fr] md:gap-10"
    >
      {/* legibility scrim over the shared 3D backdrop, left-weighted where the copy sits */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-[3] max-w-[46rem]">
        <motion.h1
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative font-display text-[clamp(3.1rem,8vw,6.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-cream"
          onMouseEnter={hoverCapable && !reduceMotion ? trigger : undefined}
        >
          {isScrambling ? (
            <span aria-hidden>{display}</span>
          ) : (
            <>
              <Letters text="Pham Ngoc" className="block" />
              <Letters text="Thanh" className="block text-forest" />
            </>
          )}
          <span className="sr-only">Pham Ngoc Thanh</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 flex items-center gap-4 text-sand"
        >
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em]">Digital marketing &amp; creative</span>
          <span className="h-px w-10 flex-none bg-rule" />
          <span className="flex items-baseline gap-1.5">
            <b className="font-serif-jp text-[1.15rem] font-bold text-forest">達樹</b>
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em]">Tatsuki</span>
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          className="mt-8 max-w-[34ch] text-[clamp(1.2rem,1.8vw,1.5rem)] font-light leading-[1.6] text-tan"
        >
          I build <strong className="font-medium text-cream">full-funnel growth systems</strong> for B2B SaaS. Compounding, measurable,
          owned end to end.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-6"
        >
          <Cta href="#work" size="lg">See the work</Cta>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: portraitY, scale: portraitScale, rotateY: portraitRotate, transformPerspective: 1200 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[3] mx-auto aspect-[4/5] w-[min(72vw,340px)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-serif-jp text-[9rem] font-black leading-none text-cream/[0.06]"
        >
          達樹
        </span>
        <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-panel-border shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
          <img
            src="/images/photo2.webp"
            alt="Pham Ngoc Thanh"
            className="h-full w-full object-cover [filter:saturate(0.9)_contrast(1.02)]"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-2 text-sand md:left-[var(--pad)] md:translate-x-0 md:items-start"
      >
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={reduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-forest"
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
