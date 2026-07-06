"use client";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function FloatingCV() {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);
  return (
    <motion.a
      href="/CV.pdf"
      ref={magnetic.ref}
      onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
      onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
      style={hoverCapable ? magnetic.style : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="fixed bottom-[1.4rem] right-[1.4rem] z-[90] flex items-center gap-1.5 rounded-full border border-forest/50 bg-ink/80 px-4 py-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-forest backdrop-blur-md transition-colors hover:bg-forest hover:text-ink"
    >
      <span>↓</span> CV
    </motion.a>
  );
}
