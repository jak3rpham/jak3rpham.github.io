"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wipe-up reveal. We observe the STATIC outer wrapper with our own
 * IntersectionObserver and animate the inner element — framer's `whileInView`
 * observes the inner element, which is translated 110% down and so reports a
 * shifted/blank intersection rect and often never fires, leaving headings stuck
 * hidden. A safety timer guarantees the content is never left invisible.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    const safety = setTimeout(() => setShown(true), 3000);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden pb-[0.14em] ${className}`}>
      <motion.div
        initial={false}
        animate={{ y: shown ? "0%" : "110%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
