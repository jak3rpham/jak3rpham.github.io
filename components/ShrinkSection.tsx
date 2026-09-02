"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The hand off between two states, done as a move rather than a boundary.
 *
 * As the section scrolls away it narrows into a rounded card, uncovering the ground behind it,
 * which by then is already crossing to the next state (ThemeFlow starts the token transition
 * at 42% of the viewport). So the page does not step from one colour to another at a section
 * edge: one block visibly withdraws and the next colour is revealed underneath it.
 *
 * Progress is the section's own exit, 0 while its bottom is still below the fold and 1 once it
 * has left, so the effect is tied to this element rather than to a page offset.
 */
export function ShrinkSection({
  children,
  zone,
  /** how far it narrows at full exit */
  minScale = 0.93,
  /** corner radius at full exit, px */
  radius = 28,
}: {
  children: ReactNode;
  zone?: "dark" | "light";
  minScale?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // starts once the section's bottom reaches the fold, completes when it reaches the top
      const span = window.innerHeight;
      const p = Math.max(0, Math.min(1, 1 - r.bottom / span));
      el.style.setProperty("--shrink", (1 - (1 - minScale) * p).toFixed(4));
      el.style.setProperty("--shrink-radius", `${(radius * p).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [minScale, radius]);

  return (
    <div ref={ref} className="shrink-stage bg-ink" data-zone={zone}>
      {children}
    </div>
  );
}
