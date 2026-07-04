"use client";
import { useRef, useState } from "react";

export function useCountUp(to: number, decimals = 0, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    function step(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Number((to * eased).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return { value, start };
}
