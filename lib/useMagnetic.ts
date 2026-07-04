"use client";
import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";

export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springOpts = { stiffness: 300, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springOpts);
  const springY = useSpring(y, springOpts);

  function onMouseMove(e: MouseEvent<T>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { ref, style: { x: springX, y: springY }, onMouseMove, onMouseLeave };
}
