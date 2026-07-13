"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { WebGLLogo3D } from "../WebGLLogo3D";
import { LetterReveal } from "../LetterReveal";
import { useCountUp } from "@/lib/useCountUp";

function Tel({ to, decimals = 0, prefix = "", suffix = "", label, staticValue }: { to?: number; decimals?: number; prefix?: string; suffix?: string; label: string; staticValue?: string }) {
  const c = useCountUp(to ?? 0, decimals);
  useEffect(() => {
    const id = setTimeout(() => c.start(), 400);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex-1 border-r border-rule px-5 py-4 first:pl-0 last:border-r-0">
      <div className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-cream">
        {prefix}
        {staticValue ?? c.value.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-sand">{label}</div>
    </div>
  );
}

export function TerraHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const objY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative grid min-h-[100dvh] grid-cols-1 items-center gap-10 overflow-hidden px-[var(--pad)] pb-20 pt-28 md:grid-cols-[1.05fr_1fr]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-1/2 z-0 h-[80vh] w-[80vh] max-w-[90vw] -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(143,212,158,0.2), transparent 62%)" }}
      />

      <motion.div style={{ opacity: textOpacity }} className="relative z-[3] max-w-[42rem]">
        <h1 className="font-display text-[clamp(2.8rem,7vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-cream">
          <LetterReveal text="terra-plat.vn" accentStart={5} />
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-5 flex flex-wrap items-center gap-3 text-sand"
        >
          <b className="font-serif-jp text-[1.1rem] font-bold text-forest">達樹</b>
          <span className="h-px w-8 bg-rule" />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">Featured case study · Sep 2024 → Jun 2026</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-7 max-w-[40ch] text-[clamp(1.1rem,1.7vw,1.4rem)] font-light leading-[1.6] text-tan"
        >
          <strong className="font-medium text-cream">12× organic growth</strong> for a B2B payroll and HR SaaS, and the custom tooling
          that made it scale.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-8 flex max-w-[560px] flex-wrap"
        >
          <Tel to={12} suffix="×" label="Organic growth" />
          <Tel to={978} label="Keywords top 10" />
          <Tel to={31.4} decimals={1} suffix="M" label="Impressions" />
          <Tel staticValue="55→90" label="Site health" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.4 }}
        style={{ y: objY }}
        className="relative z-[2] h-[52vh] w-full md:h-[78vh]"
      >
        <WebGLLogo3D className="absolute inset-0" />
      </motion.div>
    </section>
  );
}
