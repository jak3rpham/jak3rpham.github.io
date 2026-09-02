"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Turns the page's theme into a scroll state instead of a set of blocks.
 *
 * Children mark themselves with data-zone="dark" or "light". This walks those zones on scroll
 * and writes the winning one to data-theme on the wrapper. Because every palette token is
 * registered with @property and the wrapper carries a transition for them (see globals.css),
 * the flip is not a swap: each token interpolates, so headings, rules, panels, buttons and the
 * ground all cross over together on the same easing.
 *
 * The decision line sits at 42% of the viewport rather than the middle, so the page has
 * usually committed to the new state slightly before the reader's eye reaches it, which is
 * what stops the change from feeling like it happened underneath them.
 *
 * A scroll listener, not an IntersectionObserver: Lenis drives scrolling in a way IO does not
 * observe, so IO never fires here. Same reason as the nav rails.
 */
export function ThemeFlow({ children, initial = "dark" }: { children: ReactNode; initial?: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const zones = [...root.querySelectorAll<HTMLElement>("[data-zone]")];
    if (!zones.length) return;

    let current = initial;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const line = window.innerHeight * 0.42;
      // last zone whose top has crossed the line wins, so the state follows reading order
      let next = initial;
      for (const z of zones) {
        if (z.getBoundingClientRect().top <= line) next = (z.dataset.zone as "dark" | "light") ?? next;
        else break;
      }
      if (next !== current) {
        current = next;
        root.dataset.theme = next;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    root.dataset.theme = initial;
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [initial]);

  return (
    <div ref={ref} className="theme-flow" data-theme={initial}>
      {children}
    </div>
  );
}

/**
 * The page's colour, painted once and fixed, plus a pointer glow in the accent. Both read the
 * animated tokens, so the ground crossfades with the rest of the page rather than being
 * swapped underneath it.
 */
export function FlowGround() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let x = 50;
    let y = 30;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    const onMove = (e: MouseEvent) => {
      x = (e.clientX / window.innerWidth) * 100;
      y = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <div ref={ref} aria-hidden className="flow-ground" />;
}
