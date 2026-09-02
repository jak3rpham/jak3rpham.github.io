"use client";

/**
 * One scroll listener and one rAF for the whole page.
 *
 * Everything scroll driven on the homepage used to bring its own listener: the theme flow, the
 * hero shrink, every parallax element, the nav rail. Each one also scheduled its own rAF, so a
 * single scroll produced a handful of separate frames of work. This collapses them into one
 * subscription list ticked once per frame.
 *
 * Subscribers get scrollY and the viewport height and are expected to WRITE ONLY. Anything that
 * needs an element's position measures it in `onMeasure`, which runs on mount and on resize,
 * never during a scroll: reading getBoundingClientRect inside a scroll handler forces a
 * synchronous layout on every frame, which is what made the theme crossover stutter.
 *
 * A scroll listener rather than an IntersectionObserver, because the site runs on Lenis and IO
 * does not observe its scrolls. Same reason as the nav rails.
 */
type Tick = (scrollY: number, viewportH: number) => void;

const ticks = new Set<Tick>();
const measures = new Set<() => void>();
let raf = 0;
let bound = false;

function frame() {
  raf = 0;
  const y = window.scrollY;
  const h = window.innerHeight;
  for (const t of ticks) t(y, h);
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function onResize() {
  for (const m of measures) m();
  onScroll();
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
}

function unbind() {
  if (!bound || ticks.size || measures.size) return;
  bound = false;
  cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
}

/** Register a per-frame writer plus an optional measure pass. Returns an unsubscribe. */
export function onScrollFrame(tick: Tick, measure?: () => void) {
  ticks.add(tick);
  if (measure) {
    measures.add(measure);
    measure();
  }
  bind();
  tick(window.scrollY, window.innerHeight);
  return () => {
    ticks.delete(tick);
    if (measure) measures.delete(measure);
    unbind();
  };
}
