"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useCountUp(to: number, decimals = 0, duration = 1200) {
  // Initialise to the final value so the server-rendered HTML (what a no-JS
  // crawler / LLM sees) shows the real number, not "0". On the client we reset
  // to 0 before paint, so the count-up still animates from zero.
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useIsomorphicLayoutEffect(() => {
    setValue(0);
  }, []);

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
