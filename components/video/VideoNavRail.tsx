"use client";
import { useEffect, useState } from "react";

type RailItem = { id: string; label: string; accent: string };

export function VideoNavRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  // NOTE: intentionally a scroll listener + getBoundingClientRect, NOT an
  // IntersectionObserver. Lenis (see SmoothScroll) drives scrolling in a way that
  // IntersectionObserver does not observe, so IO never fires here; getBoundingClientRect
  // reflects the real position and works under Lenis. Same pattern as HomeNavRail.
  useEffect(() => {
    const ids = items.map((it) => it.id);
    const line = () => window.innerHeight * 0.4; // active = section whose top has crossed 40% down

    const compute = () => {
      let current = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line()) current = id;
      }
      setActive(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [items]);

  return (
    <nav
      aria-label="Video formats"
      className="fixed right-4 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {items.map((it) => {
        const on = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="group flex items-center gap-2.5"
            aria-label={it.label}
            aria-current={on ? "true" : undefined}
          >
            <span
              className={`whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-all duration-300 ${
                on ? "opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
              }`}
              style={{ color: on ? it.accent : "var(--color-sand, #b8b2a2)" }}
            >
              {it.label}
            </span>
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: on ? 22 : 8,
                height: 8,
                background: on ? it.accent : "rgba(245,242,232,0.28)",
                boxShadow: on ? `0 0 12px ${it.accent}` : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
