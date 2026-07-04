"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useScramble } from "@/lib/useScramble";
import { useCountUp } from "@/lib/useCountUp";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { HeroCanvasFlow } from "./HeroCanvasFlow";
import { Clock } from "./Clock";

function Telemetry({ to, decimals = 0, suffix = "", label }: { to: number; decimals?: number; suffix?: string; label: string }) {
  const countUp = useCountUp(to, decimals);
  useEffect(() => {
    const id = setTimeout(() => countUp.start(), 300);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex-1 border-r border-rule py-4 pr-5 last:border-r-0">
      <div className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-4xl font-semibold leading-none text-transparent">
        {countUp.value.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-sand">{label}</div>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { display, isScrambling, trigger } = useScramble("Pham Ngoc Thanh");

  const mainX = useMotionValue(0);
  const mainY = useMotionValue(0);
  const portraitX = useMotionValue(0);
  const portraitY = useMotionValue(0);
  const springOpts = { stiffness: 120, damping: 20, mass: 0.6 };
  const mainSX = useSpring(mainX, springOpts);
  const mainSY = useSpring(mainY, springOpts);
  const portraitSX = useSpring(portraitX, springOpts);
  const portraitSY = useSpring(portraitY, springOpts);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduceMotion || !hoverCapable) return;
    const hero = heroRef.current;
    if (!hero) return;
    function onMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      mainX.set(px * 4);
      mainY.set(py * 4);
      portraitX.set(px * 14);
      portraitY.set(py * 14);
    }
    function onLeave() {
      mainX.set(0);
      mainY.set(0);
      portraitX.set(0);
      portraitY.set(0);
    }
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion, hoverCapable]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative z-[4] grid min-h-screen grid-cols-1 items-center gap-8 overflow-hidden px-[var(--pad)] pb-16 pt-24 md:grid-cols-[1.5fr_1fr]"
    >
      <HeroCanvasFlow />
      <div className="absolute left-[var(--pad)] top-[4.4rem] z-[6] flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-forest shadow-[0_0_10px_var(--color-forest)]" />
        Available 2026 · HCMC
      </div>
      <Clock />
      <motion.div
        style={{ x: mainSX, y: mainSY }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2]"
      >
        <h1
          className="mb-2.5 pb-[0.12em] text-[clamp(3.4rem,8vw,7.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-cream [text-shadow:0_2px_50px_rgba(20,13,7,0.6)]"
          // Decorative mouse-only easter egg; intentionally has no keyboard/focus equivalent.
          onMouseEnter={hoverCapable && !reduceMotion ? trigger : undefined}
        >
          {isScrambling ? (
            display
          ) : (
            <>
              Pham Ngoc <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">Thanh</span>
            </>
          )}
        </h1>
        <div className="mb-7 flex items-center gap-4">
          <span className="font-serif-jp text-[1.7rem] font-bold tracking-[0.16em] text-forest">達樹 / Tatsuki</span>
          <span className="h-px w-[60px] flex-none bg-rule" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-sand">Digital × Creative</span>
        </div>
        <p className="mb-9 max-w-[32ch] text-[clamp(1.15rem,1.6vw,1.4rem)] font-light leading-[1.7] text-tan">
          Digital marketing strategist for B2B SaaS. I build{" "}
          <strong className="font-medium text-cream">full-funnel systems</strong> for compounding, measurable growth.
        </p>
        <div className="flex max-w-[580px]">
          <Telemetry to={12} suffix="×" label="Organic growth" />
          <Telemetry to={978} label="Keywords top 10" />
          <Telemetry to={31.4} decimals={1} suffix="M" label="Impressions" />
        </div>
      </motion.div>
      <motion.div
        style={{ x: portraitSX, y: portraitSY }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2] aspect-square w-[min(34vw,400px)] justify-self-center"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-panel-border shadow-[0_22px_60px_rgba(0,0,0,0.4),0_0_55px_rgba(120,200,140,0.16)]">
          <img
            src="/images/photo2.webp"
            alt="Pham Ngoc Thanh"
            className="relative z-[1] h-full w-full object-cover [filter:saturate(0.92)_contrast(1.03)]"
          />
        </div>
        <span className="absolute bottom-[0.6rem] right-[0.9rem] z-[2] font-serif-jp text-[3.2rem] font-black text-cream [text-shadow:0_2px_20px_rgba(20,13,7,0.6)]">
          達樹
        </span>
      </motion.div>
    </section>
  );
}
