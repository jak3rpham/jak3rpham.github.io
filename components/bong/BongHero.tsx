"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { WebGLGate } from "../WebGLGate";
import { LetterReveal } from "../LetterReveal";
import { useCountUp } from "@/lib/useCountUp";

function Tel({ to, decimals = 0, suffix = "", label, staticValue }: { to?: number; decimals?: number; suffix?: string; label: string; staticValue?: string }) {
  const c = useCountUp(to ?? 0, decimals);
  useEffect(() => {
    const id = setTimeout(() => c.start(), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex-1 border-r border-rule px-5 py-4 first:pl-0 last:border-r-0">
      <div className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-cream">
        {staticValue ?? c.value.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-sand">{label}</div>
    </div>
  );
}

export function BongHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const objY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  // ken-burns drift on the backdrop still as you scroll into the page
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, reduce ? 1.06 : 1.16]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "8%"]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative grid min-h-[100dvh] grid-cols-1 items-center gap-10 overflow-hidden px-[var(--pad)] pb-20 pt-28 md:grid-cols-[1.1fr_1fr]"
    >
      {/* project keyframe as a duotone backdrop, merged into the dark + green theme */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src="/images/vng-demo/stills/kf5-after-the-recognition.webp"
          alt=""
          style={{ scale: bgScale, y: bgY }}
          className="absolute inset-0 h-full w-full object-cover object-[center_72%] opacity-[0.9] [filter:saturate(0.85)_contrast(1.05)]"
        />
        {/* push the still toward the site's single green accent (kept light so detail shows) */}
        <div className="absolute inset-0 bg-forest opacity-20 mix-blend-color" />
        {/* readability scrim: solid ink behind the copy on the left, image fully open on the right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 12%, rgba(13,15,13,0.55) 46%, rgba(13,15,13,0.12) 74%, transparent 100%)",
          }}
        />
        {/* soft top/bottom vignette so it blends into the next section */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,15,13,0.6) 0%, transparent 26%, transparent 68%, var(--color-ink) 100%)",
          }}
        />
      </div>

      <motion.div
        aria-hidden
        style={{ y: objY }}
        className="pointer-events-none absolute right-[8%] top-1/2 z-[1] h-[70vh] w-[70vh] max-w-[90vw] -translate-y-1/2 rounded-full opacity-50 blur-[130px]"
      >
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle, rgba(232,162,76,0.24), transparent 62%)" }} />
      </motion.div>

      <motion.div style={{ opacity: textOpacity }} className="relative z-[3] max-w-[44rem]">
        <h1 className="font-display text-[clamp(2.8rem,7.6vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-cream">
          <LetterReveal text="BÓNG VESPERA" accentStart={5} />
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-5 flex flex-wrap items-center gap-3 text-sand"
        >
          <b className="font-serif-jp text-[1.3rem] font-bold text-forest">霧</b>
          <span className="h-px w-8 bg-rule" />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">Case study · AI-orchestrated pipeline · May 2026</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-7 max-w-[44ch] text-[clamp(1.1rem,1.7vw,1.4rem)] font-light leading-[1.6] text-tan"
        >
          A self-directed experiment in matching AI tools to creative stages. One fictional RPG ad campaign —{" "}
          <strong className="font-medium text-cream">four models, six hours, $0</strong>. The test: what does it look like when AI is
          treated as orchestration, not tool?
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-8 flex max-w-[600px] flex-wrap"
        >
          <Tel to={6} suffix="h" label="End-to-end build" />
          <Tel staticValue="5+1" label="Keyframes + mockup" />
          <Tel to={13} label="Generations · 4 models" />
          <Tel staticValue="$0" label="Free tier only" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.4 }}
        style={{ y: objY }}
        className="relative z-[2] h-[48vh] w-full md:h-[74vh]"
      >
        <WebGLGate className="absolute inset-0" rim={[0.9, 0.6, 0.32]} />
      </motion.div>
    </section>
  );
}
