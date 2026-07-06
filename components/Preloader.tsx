"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";

export function Preloader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const count = useCountUp(100, 0);

  // Render is intentionally NOT branched on `reduce` (that diverges SSR vs first
  // client paint and triggers a hydration mismatch). The tree is always the same
  // curtain when !done; reduced motion just dismisses it instantly via effect.
  useEffect(() => {
    if (reduce) {
      setDone(true);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    count.start();
    const t = setTimeout(() => setDone(true), 2100);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [reduce]);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-between overflow-hidden bg-ink px-[var(--pad)] pb-[clamp(2rem,6vw,4rem)]"
          exit={{ y: "-100%" }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end gap-3"
          >
            <span className="font-serif-jp text-[clamp(3rem,9vw,6rem)] font-black leading-[0.8] text-forest">達樹</span>
            <span className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sand">Tatsuki</span>
          </motion.div>
          <div className="font-display text-[clamp(3rem,9vw,6rem)] font-bold leading-[0.8] tracking-[-0.04em] text-cream tabular-nums">
            {count.value.toFixed(0)}
          </div>
          <motion.div
            className="absolute inset-x-[var(--pad)] bottom-0 h-px origin-left bg-rule"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
