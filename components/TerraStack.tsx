"use client";
import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

function StackCard({ index, total, children }: { index: number; total: number; children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLast = index === total - 1;
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.4]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : 2]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);

  return (
    <div ref={cardRef} className="sticky top-0 flex min-h-[56vh] items-center justify-center py-6">
      <motion.div style={{ scale, opacity, filter }} className="w-full [&>*]:shadow-[0_26px_60px_rgba(0,0,0,0.45)]">
        {children}
      </motion.div>
    </div>
  );
}

export function TerraStack({ children }: { children: ReactNode[] }) {
  const disableStack = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useReducedMotion();

  if (disableStack || reduceMotion) {
    return <div className="flex flex-col gap-6">{children}</div>;
  }

  return (
    <div id="terraStack" className="relative">
      {children.map((child, i) => (
        <StackCard key={i} index={i} total={children.length}>
          {child}
        </StackCard>
      ))}
    </div>
  );
}
