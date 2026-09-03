"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { WebGLObject } from "../WebGLObject";
import { LetterReveal } from "../LetterReveal";
import { useCountUp } from "@/lib/useCountUp";

function Tel({ to, decimals = 0, prefix = "", suffix = "", label, staticValue }: { to?: number; decimals?: number; prefix?: string; suffix?: string; label: string; staticValue?: string }) {
  const c = useCountUp(to ?? 0, decimals);
  useEffect(() => {
    const id = setTimeout(() => c.start(), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex-1 border-r border-rule px-5 py-4 first:pl-0 last:border-r-0">
      <div className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-cream">
        {prefix}
        {staticValue ?? c.value.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 font-mono t-micro uppercase tracking-[0.1em] text-sand">{label}</div>
    </div>
  );
}

/**
 * Hero archetype is deliberately NOT the shared split-with-side-object used on /terra. This is
 * a full-bleed "title card": the WebGL object fills the whole frame as the ambient asset, the
 * copy sits low over a bottom-weighted scrim, and the format stats run as a full-width bar along
 * the base. Distinct from /terra (split) and /bong-vespera (framed film still).
 */
export function VideoHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const objScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden px-[var(--pad)] pb-14 pt-24"
    >
      {/* full-bleed ambient asset */}
      <motion.div style={{ scale: objScale }} className="absolute inset-0 z-0">
        <WebGLObject className="absolute inset-0" />
      </motion.div>
      {/* bottom-weighted scrim: guarantees the copy reads over whatever the object renders */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, var(--color-ink) 0%, var(--color-ink) 16%, rgba(13,15,13,0.82) 40%, rgba(13,15,13,0.34) 68%, rgba(13,15,13,0.08) 100%)",
        }}
      />

      <motion.div style={{ opacity: textOpacity }} className="relative z-[3] w-full">
        <h1 className="max-w-[16ch] font-display text-[clamp(2.8rem,8vw,6.4rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-cream">
          <LetterReveal text="Video reel" accentStart={6} />
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-5 flex flex-wrap items-center gap-3 text-sand"
        >
          <b className="font-serif-jp text-[1.3rem] font-bold text-forest">影</b>
          <span className="h-px w-8 bg-rule" />
          <span className="font-mono t-micro uppercase tracking-[0.16em]">Creative work · video &amp; brand production</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-6 max-w-[52ch] text-[clamp(1.1rem,1.7vw,1.4rem)] font-light leading-[1.6] text-tan"
        >
          End-to-end production across formats: TVCs, brand films, commercial explainers, music videos, events.{" "}
          <strong className="font-medium text-cream">Two-time Top 1 TVC</strong> at Business Challenge.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-9 flex w-full max-w-[760px] flex-wrap border-t border-rule pt-2"
        >
          <Tel to={15} suffix="+" label="Productions led" />
          <Tel staticValue="2×" label="Top 1 TVC awards" />
          <Tel to={800} suffix="+" label="Largest audience" />
          <Tel to={7} label="Formats covered" />
        </motion.div>
      </motion.div>
    </section>
  );
}
