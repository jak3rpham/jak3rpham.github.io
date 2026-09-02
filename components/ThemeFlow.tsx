"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Turns the page's theme into a scroll state instead of a set of blocks.
 *
 * Children mark themselves with data-zone="dark" or "light". The winning zone is written to
 * data-theme on the DOCUMENT ELEMENT, not on a wrapper: the scrollbar and the body's own
 * background sit outside any wrapper, and leaving them behind was what put a dark strip down
 * the edge of the light sections. Putting the state on <html> also lets color-scheme follow,
 * which is the only thing that actually recolours a scrollbar.
 *
 * How the crossover is paid for, which is the whole design:
 *
 *   - The palette tokens are NOT animated. Animating an inherited custom property on the root
 *     invalidates the computed style of every element in the document on every frame, which on
 *     a page this size is a style recalc and a full repaint at 60fps for the whole duration.
 *     They swap once, in a single frame.
 *   - What the reader sees instead is two compositor only moves: the ground crossfades between
 *     two pre painted sheets, and the content dips in opacity. Both are opacity on a layer, so
 *     the GPU does them without touching style or layout.
 *   - The swap is timed to land inside the dip, so the one frame where every colour changes at
 *     once is the frame the content is dimmest.
 *
 * Zone offsets are measured on mount and on resize, never during a scroll: reading
 * getBoundingClientRect inside a scroll handler forces a synchronous layout every frame.
 *
 * A scroll listener, not an IntersectionObserver: Lenis drives scrolling in a way IO does not
 * observe, so IO never fires here. Same reason as the nav rails.
 */
type Zone = "dark" | "light";

/** must match the dip transition in globals.css */
const DIP_MS = 260;

export function ThemeFlow({ children, initial = "dark" }: { children: ReactNode; initial?: Zone }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-zone]")];
    if (!els.length) return;

    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tops: { top: number; zone: Zone }[] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = els.map((e) => ({
        top: e.getBoundingClientRect().top + y,
        zone: (e.dataset.zone as Zone) ?? initial,
      }));
    };

    let current: Zone | null = null;
    let dipTimer: number | undefined;
    let clearTimer: number | undefined;

    const commit = (next: Zone) => {
      current = next;
      html.dataset.theme = next;
    };

    const decide = () => {
      const line = window.scrollY + window.innerHeight * 0.42;
      let next = initial;
      for (const t of tops) {
        if (t.top <= line) next = t.zone;
        else break;
      }
      if (next === current) return;

      if (reduced) {
        commit(next);
        return;
      }
      // dip, swap at the bottom of the dip, lift again
      window.clearTimeout(dipTimer);
      window.clearTimeout(clearTimer);
      html.dataset.swapping = "1";
      dipTimer = window.setTimeout(() => commit(next), DIP_MS);
      clearTimer = window.setTimeout(() => delete html.dataset.swapping, DIP_MS + 40);
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
    commit(initial);
    decide();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(dipTimer);
      window.clearTimeout(clearTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      delete html.dataset.theme;
      delete html.dataset.swapping;
    };
  }, [initial]);

  return (
    <div ref={ref} className="flow-content">
      {children}
    </div>
  );
}

/**
 * The page's colour: two stacked sheets that crossfade, each carrying its own drifting orbs
 * and pointer glow in its own state's accent. Literal colours rather than tokens, because two
 * layers cannot fade against each other if both read the same variable.
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
    <div ref={ref} aria-hidden className="flow-ground">
      <div className="flow-sheet flow-sheet-dark">
        <span className="flow-orb flow-orb-a" />
        <span className="flow-orb flow-orb-b" />
        <div className="flow-pointer" />
      </div>
      <div className="flow-sheet flow-sheet-light">
        <span className="flow-orb flow-orb-a" />
        <span className="flow-orb flow-orb-b" />
        <div className="flow-pointer" />
      </div>
    </div>
  );
}
