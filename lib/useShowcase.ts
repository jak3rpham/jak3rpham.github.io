"use client";
import { useEffect, useRef, useState } from "react";

export function useShowcase(count: number, duration = 6000, ready = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { setHidden(document.hidden); setReduced(media.matches); };
    sync();
    const observer = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: .35 });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', sync);
    media.addEventListener('change', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', sync); };
  }, []);
  const running = visible && !hidden && !reduced && !paused && ready;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      elapsed.current += now - last; last = now;
      if (elapsed.current >= duration) { elapsed.current = 0; setIndex(i => (i + 1) % count); }
      setProgress(elapsed.current / duration);
    }, 80);
    return () => clearInterval(timer);
  }, [running, duration, count]);
  const select = (next: number) => { setPaused(true); elapsed.current = 0; setProgress(0); setIndex(next); };
  return { ref, index, select, paused, running, progress, reduced, visible: visible && !hidden, stop: () => setPaused(true), toggle: () => setPaused(p => !p) };
}
