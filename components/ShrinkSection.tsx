"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

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

    // Offsets are measured on mount and on resize, never inside the scroll path: reading
    // getBoundingClientRect per frame forces a synchronous layout. Rides the shared ticker so
    // the page has one scroll listener rather than one per effect.
    let top = 0;
    let height = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
    };

    return onScrollFrame((y, vh) => {
      const bottom = top + height - y;
      const p = Math.max(0, Math.min(1, 1 - bottom / vh));
      el.style.setProperty("--shrink", (1 - (1 - minScale) * p).toFixed(4));
      el.style.setProperty("--shrink-radius", `${(radius * p).toFixed(1)}px`);
    }, measure);
  }, [minScale, radius]);

  return (
    <div
      ref={ref}
      className="shrink-stage"
      data-zone={zone}
      /* a literal ink rather than the token: this block is always dark, and reading the token
         would make it flip to paper for the frame the swap lands on, while it is still partly
         on screen */
      style={{ background: "#0D0F0D" }}
    >
      {children}
    </div>
  );
}
