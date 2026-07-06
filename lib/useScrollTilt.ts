"use client";
import { useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Subtle scroll-linked tilt: the element rotates on X from +max (entering from
 * the bottom) through 0 (centered) to -max (leaving the top), like a gently
 * curved screen. rotateX only — no cursor tracking, no image stretch.
 */
export function useScrollTilt<T extends HTMLElement>(max = 5) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 0.5, 1], [max, 0, -max]);
  const rotateX = useSpring(raw, { stiffness: 90, damping: 30, mass: 0.5 });
  const style = reduce ? {} : { rotateX, transformPerspective: 1600 };
  return { ref, style };
}
