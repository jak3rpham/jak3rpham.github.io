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
      className="fixed bottom-[1.4rem] right-[1.4rem] z-[90] flex items-center gap-1.5 rounded-full bg-amber px-4 py-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-forest"
    >
      <span>↓</span> CV
    </motion.a>
  );
}
