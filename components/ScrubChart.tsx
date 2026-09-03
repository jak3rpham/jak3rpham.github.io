"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ScrubChart({
  line,
  area,
  dot,
  xLabels,
  barLabel,
  caption,
}: {
  line: string;
  area: string;
  dot: { cx: number; cy: number };
  xLabels: string[];
  barLabel: string;
  caption: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5 });
  const areaOpacity = useTransform(scrollYProgress, [0.4, 1], [0, 1]);
  const dotOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  return (
    <div ref={ref} className="rounded-[12px] border border-panel-border bg-panel p-6 backdrop-blur-md md:p-8">
      <div className="mb-5 border-b border-rule pb-3 font-mono t-micro uppercase tracking-[0.1em] text-sand">{barLabel}</div>
      <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="h-[220px] w-full" aria-hidden>
        <defs>
          <linearGradient id="scrubArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8FD49E" stopOpacity=".3" />
            <stop offset="1" stopColor="#8FD49E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d={area} fill="url(#scrubArea)" style={{ opacity: areaOpacity }} />
        <motion.path d={line} fill="none" stroke="var(--color-forest)" strokeWidth={3} strokeLinecap="round" style={{ pathLength }} />
        <motion.circle cx={dot.cx} cy={dot.cy} r={5.5} fill="var(--color-forest)" style={{ opacity: dotOpacity }} />
      </svg>
      <div className="mt-2 flex justify-between font-mono t-micro uppercase tracking-[0.08em] text-sand">
        {xLabels.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <div className="mt-3 font-mono t-micro leading-relaxed text-sand">{caption}</div>
    </div>
  );
}
