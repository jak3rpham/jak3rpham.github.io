"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

export function Coverflow({
  items,
  itemClassName = "w-[min(70vw,700px)]",
  gapClass = "gap-8",
}: {
  items: ReactNode[];
  itemClassName?: string;
  gapClass?: string;
}) {
  const compact = useMediaQuery("(max-width: 819px)");
  const [current, setCurrent] = useState(0);
  const [offset, setOffset] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });

  const go = useCallback((i: number) => setCurrent(Math.max(0, Math.min(items.length - 1, i))), [items.length]);

  useEffect(() => {
    if (compact) return;
    const recalc = () => {
      const wrap = wrapRef.current;
      const card = cardRefs.current[current];
      if (wrap && card) setOffset(-(card.offsetLeft + card.offsetWidth / 2 - wrap.clientWidth / 2));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [current, compact]);

  if (compact) {
    return (
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <div key={i} className="w-[82vw] shrink-0 snap-center">
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="relative cursor-grab select-none overflow-x-clip overflow-y-visible py-6 [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] [perspective:1900px] active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { startX: e.clientX, active: true };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (!drag.current.active) return;
          drag.current.active = false;
          const moved = e.clientX - drag.current.startX;
          if (Math.abs(moved) > 45) go(current + (moved < 0 ? 1 : -1));
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY) + 4) {
            if (e.deltaX > 12) go(current + 1);
            else if (e.deltaX < -12) go(current - 1);
          }
        }}
      >
        <div
          className={`flex items-center ${gapClass} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]`}
          style={{ transform: `translateX(${offset}px)` }}
        >
          {items.map((item, i) => {
            const delta = i - current;
            const a = Math.abs(delta);
            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => delta !== 0 && go(i)}
                className={`${itemClassName} shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
                style={{
                  transform: `rotateY(${delta * -22}deg) scale(${delta === 0 ? 1 : 0.82})`,
                  opacity: a === 0 ? 1 : a === 1 ? 0.4 : 0.15,
                  filter: delta === 0 ? "none" : "blur(1px)",
                  cursor: delta === 0 ? "grab" : "pointer",
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      <button
        aria-label="Previous"
        onClick={() => go(current - 1)}
        disabled={current === 0}
        className="absolute left-2 top-1/2 z-[3] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-panel-border bg-ink/70 text-forest backdrop-blur-md transition hover:border-forest hover:bg-forest hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 md:left-6"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={() => go(current + 1)}
        disabled={current === items.length - 1}
        className="absolute right-2 top-1/2 z-[3] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-panel-border bg-ink/70 text-forest backdrop-blur-md transition hover:border-forest hover:bg-forest hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 md:right-6"
      >
        ›
      </button>

      <div className="mt-5 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-forest" : "w-1.5 bg-rule hover:bg-sand"}`}
          />
        ))}
      </div>
    </div>
  );
}
