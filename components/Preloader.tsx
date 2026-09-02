"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/lib/useCountUp";

const SEEN_KEY = "tatsuki:preloader-seen";

export function Preloader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  // 700ms so the counter actually reaches 100 before the 800ms curtain lifts
  const count = useCountUp(100, 0, 700);

  // Render is intentionally NOT branched on `reduce` or on sessionStorage (either
  // diverges SSR vs first client paint and triggers a hydration mismatch). The tree
  // is always the same curtain when !done; reduced motion and a repeat visit just
  // dismiss it instantly via effect.
  //
  // The curtain never locks scroll: a recruiter opening this in one of fifteen tabs
  // must be able to move immediately. It is decoration over a page that is already
  // interactive, not a real loading gate.
  useEffect(() => {
    if (reduce || sessionStorage.getItem(SEEN_KEY)) {
      setDone(true);
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");
    count.start();
    const t = setTimeout(() => setDone(true), 800);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-between overflow-hidden bg-ink px-[var(--pad)] pb-[clamp(2rem,6vw,4rem)]"
          exit={{ y: "-100%" }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
