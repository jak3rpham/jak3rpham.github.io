"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Turns the page's theme into a scroll state instead of a set of blocks.
 *
 * Children mark themselves with data-zone="dark" or "light". This writes the winning one to
 * data-theme on the DOCUMENT ELEMENT, not on a wrapper: the scrollbar and the body's own
 * background sit outside any wrapper, and leaving them behind was what put a dark strip down
 * the edge of the light sections. Putting the state on <html> also lets color-scheme follow,
 * which is what actually recolours the scrollbar.
 *
 * Because every palette token is registered with @property and <html> carries a transition for
 * them (see globals.css), the flip is not a swap: each token interpolates, so headings, rules,
 * panels, buttons and the ground cross over together on one easing.
 *
 * The decision line sits at 42% of the viewport rather than the middle, so the page has
 * usually committed to the new state slightly before the reader's eye reaches it.
 *
 * Zone offsets are measured once and re-measured on resize, never during a scroll. Reading
 * getBoundingClientRect inside a scroll handler forces a synchronous layout on every frame,
 * and with this component, ShrinkSection and the nav rail all doing it the page had a visible
 * stutter through the transition. The scroll path now only compares numbers.
 */
type Zone = "dark" | "light";

export function ThemeFlow({ children, initial = "dark" }: { children: ReactNode; initial?: Zone }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-zone]")];
    if (!els.length) return;

    let tops: { top: number; zone: Zone }[] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = els.map((e) => ({ top: e.getBoundingClientRect().top + y, zone: (e.dataset.zone as Zone) ?? initial }));
    };

    let current: Zone | null = null;
    const decide = () => {
      const line = window.scrollY + window.innerHeight * 0.42;
      let next = initial;
      for (const t of tops) {
        if (t.top <= line) next = t.zone;
        else break;
      }
      if (next !== current) {
        current = next;
        document.documentElement.dataset.theme = next;
      }
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          decide();
        });
    };
    const onResize = () => {
      measure();
      decide();
    };

    measure();
    decide();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      delete document.documentElement.dataset.theme;
    };
  }, [initial]);

  return <div ref={ref}>{children}</div>;
}

/**
 * The page's colour, painted once and fixed.
 *
 * Three layers: the ground itself, two slow drifting accent orbs so the hero is never
 * completely still, and a glow that follows the pointer. All of them read the animated tokens,
 * so the ground crosses states with the rest of the page. The orbs are animated with transform
 * only, which the compositor handles without touching layout or style.
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
    const onMove = (e: MouseEvent) => {
      x = (e.clientX / window.innerWidth) * 100;
      y = (e.clientY / window.innerHeight) * 100;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--mx", `${x}%`);
          el.style.setProperty("--my", `${y}%`);
        });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div aria-hidden className="flow-ground">
      <span className="flow-orb flow-orb-a" />
      <span className="flow-orb flow-orb-b" />
      <div ref={ref} className="flow-pointer" />
    </div>
  );
}
