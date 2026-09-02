"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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

/**
 * Hero archetype is deliberately NOT the shared split-with-abstract-WebGL-object used on
 * /terra and /video. This is a "film still" hero: the payoff keyframe (KF5) is a framed
 * cinematic still, the dominant visual and the actual subject of the case study. A contained,
 * bordered frame (not an edge-bleed blend) so there is no scrim to leave the image half-covered.
 */
export function BongHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  // slow ken-burns push inside the frame as you scroll into the page
  const kfScale = useTransform(scrollYProgress, [0, 1], [1.03, reduce ? 1.03 : 1.12]);
  const frameY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "10%"]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative grid min-h-[100dvh] grid-cols-1 items-center gap-10 overflow-hidden px-[var(--pad)] pb-20 pt-24 md:grid-cols-[1fr_1.02fr]"
    >
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
          A self-directed experiment in matching AI tools to creative stages. One fictional RPG ad campaign:{" "}
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

      {/* framed film still: the payoff keyframe, the case study's actual subject */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: frameY }}
        className="relative z-[2] mx-auto w-full max-w-[440px] md:mx-0 md:ml-auto"
      >
        {/* soft ember glow behind the frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] opacity-70 blur-[60px]"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(232,162,76,0.28), transparent 70%)" }}
        />
        <figure className="overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]">
          <div className="relative h-[clamp(360px,54vh,560px)] overflow-hidden">
            <motion.img
              src="/images/vng-demo/stills/kf5-after-the-recognition.webp"
              alt="Keyframe KF5, After the Recognition, generated with Flux Pro 1.1 Ultra"
              style={{ scale: kfScale }}
              className="absolute inset-0 h-full w-full object-cover object-[center_58%]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </div>
          <figcaption className="flex items-center justify-between gap-3 border-t border-panel-border px-4 py-3">
            <span className="text-[0.9rem] font-semibold text-cream">After the Recognition</span>
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-sand">KF5 · Flux Pro 1.1</span>
          </figcaption>
        </figure>
      </motion.div>
    </section>
  );
}
