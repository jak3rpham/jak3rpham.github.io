"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

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

/** how long the pulse that accompanies the swap stays down; must match globals.css */
const PULSE_MS = 260;

/**
 * Fraction of the viewport the incoming zone's top must cross to win. Larger fires earlier.
 * Exported because HeroStage places a zone marker inside itself and has to do the same
 * arithmetic to know where the swap will land.
 */
export const LINE = 0.55;

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
    let pulseTimer: number | undefined;

    /**
     * Ground and text change on the SAME frame. An earlier version flipped the ground on the
     * boundary and let the tokens follow 90ms later, on the theory that a dip could hide the
     * swap. What that actually produced was text visibly arriving after its background, which
     * is the one thing a two state page cannot get away with. There is no ordering to tune
     * here any more: one attribute, one frame, everything at once.
     *
     * The softness comes from a short pulse that plays alongside the change rather than from
     * staggering it, so nothing is ever waiting on anything else.
     */
    const commit = (next: Zone, pulse = true) => {
      current = next;
      html.dataset.theme = next;
      window.clearTimeout(pulseTimer);
      if (pulse && !reduced) {
        html.dataset.swapping = "1";
        pulseTimer = window.setTimeout(() => delete html.dataset.swapping, PULSE_MS);
      }
    };

    const decide = (y: number, vh: number) => {
      const line = y + vh * LINE;
      let next = initial;
      for (const t of tops) {
        if (t.top <= line) next = t.zone;
        else break;
      }
      if (next === current) return;
      commit(next);
    };

    measure();
    // no pulse for the initial state: nothing changed, the page just loaded
    commit(initial, false);
    const off = onScrollFrame(decide, measure);

    const onWinLoad = () => {
      measure();
      decide(window.scrollY, window.innerHeight);
    };
    window.addEventListener("load", onWinLoad);
    const t1 = window.setTimeout(onWinLoad, 400);
    const t2 = window.setTimeout(onWinLoad, 1200);

    return () => {
      off();
      window.removeEventListener("load", onWinLoad);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(pulseTimer);
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
