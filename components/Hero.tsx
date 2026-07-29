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

// The four disciplines, previewed here and expanded with proof in the About lanes below.
const RANGE = ["SEO & data", "Product builds", "AI orchestration", "Video"];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { display, isScrambling, trigger } = useScramble("Pham Ngoc Thanh");
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "-38%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "20%"]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.07]);
  const portraitRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -12]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative grid min-h-[100dvh] grid-cols-1 items-center gap-14 overflow-hidden px-[var(--pad)] pb-20 pt-24 md:grid-cols-[1.5fr_1fr] md:gap-12 md:pl-[clamp(2.5rem,8vw,8rem)]"
    >
      {/* legibility scrim over the shared 3D backdrop, left-weighted where the copy sits */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-[3] max-w-[48rem]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mb-7 flex items-center gap-4 text-sand"
        >
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em]">Growth, product &amp; video</span>
          <span className="h-px w-10 flex-none bg-rule" />
          <span className="flex items-baseline gap-1.5">
            <b className="font-serif-jp text-[1.15rem] font-bold text-forest">達樹</b>
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em]">Tatsuki</span>
          </span>
        </motion.div>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative whitespace-nowrap font-display text-[clamp(2.1rem,6vw,4.7rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-cream"
          onMouseEnter={hoverCapable && !reduceMotion ? trigger : undefined}
        >
          {isScrambling ? (
            <span aria-hidden>{display}</span>
          ) : (
            <>
              <Letters text="Pham Ngoc" />
              {" "}
              <Letters text="Thanh" className="text-forest" />
            </>
          )}
          <span className="sr-only">Pham Ngoc Thanh</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          className="mt-7 max-w-[46rem] text-[clamp(1.2rem,1.8vw,1.55rem)] font-light leading-[1.5] text-tan"
        >
          <strong className="font-medium text-cream">Technical</strong> enough to <span className="text-forest">build it</span>,{" "}
          <strong className="font-medium text-cream">creative</strong> enough to <span className="text-forest">film it</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Cta href="#work" size="lg">See the work</Cta>
          <Cta href="#contact" variant="secondary" size="lg">Get in touch</Cta>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-5"
        >
          {RANGE.map((r) => (
            <span key={r} className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-sand">
              {r}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: portraitY, scale: portraitScale, rotateY: portraitRotate, transformPerspective: 1200 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[3] mx-auto aspect-[4/5] w-[min(64vw,312px)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-serif-jp text-[8rem] font-black leading-none text-cream/[0.06]"
        >
          達樹
        </span>
        <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-panel-border shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
          <img
            src="/images/hero-portrait.webp"
            alt="Pham Ngoc Thanh"
            className="h-full w-full object-cover object-top [filter:saturate(0.96)_contrast(1.02)]"
          />
        </div>
      </motion.div>
    </section>
  );
}
