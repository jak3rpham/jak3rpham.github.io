"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

/**
 * Scroll linked drift for one element.
 *
 * Transform only, so it composites and never touches layout or style, and it rides the shared
 * scroll ticker rather than adding another listener. `speed` is how far the element travels
 * across its whole pass through the viewport, in px: positive lags behind the scroll, negative
 * runs ahead of it. Pairing a positive and a negative in one section is what makes the two
 * halves separate as you go past.
 *
 * Bails entirely on reduced motion, leaving a plain wrapper.
 */
export function Parallax({
  children,
  speed = 40,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let top = 0;
    let height = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
    };

    return onScrollFrame((y, vh) => {
      // -0.5 as the element enters the viewport, +0.5 as it leaves
      const p = (y + vh / 2 - (top + height / 2)) / (vh + height);
      el.style.transform = `translate3d(0, ${(p * speed).toFixed(2)}px, 0)`;
    }, measure);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
