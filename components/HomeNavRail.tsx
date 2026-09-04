"use client";
import { useEffect, useState } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

/**
 * Fixed right-edge dot rail for the homepage, one dot per section, so a reader can see the
 * whole shape of the page and jump around. Adapted from the /video route's VideoNavRail: active
 * = the last section whose top has crossed 40% of the viewport, tracked on scroll.
 * Section offsets are cached on mount and resize; no getBoundingClientRect calls during scroll.
 * Single green accent, on brand. lg+ only; on smaller screens the header menu covers discovery.
 */
const ITEMS: { id: string; label: string }[] = [
  { id: "hero", label: "Top" },
  { id: "about", label: "About" },
  { id: "systems", label: "Systems" },
  { id: "terra", label: "Terra" },
  { id: "nhaminh", label: "Nhà Mình (AI)" },
  { id: "work", label: "Selected builds" },
  { id: "aru", label: "AI Video" },
  { id: "bong", label: "Bóng Vespera" },
  { id: "video", label: "Films" },
  { id: "contact", label: "Contact" },
];

export function HomeNavRail() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    let tops: { id: string; top: number }[] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = ITEMS.map(({ id }) => {
        const el = document.getElementById(id);
        return {
          id,
          top: el ? el.getBoundingClientRect().top + y : 0,
        };
      });
    };

    let currentId = ITEMS[0].id;
    const decide = (y: number, vh: number) => {
      const line = y + vh * 0.4;
      let next = ITEMS[0].id;
      for (const t of tops) {
        if (t.top <= line) next = t.id;
      }
      if (next !== currentId) {
        currentId = next;
        setActive(next);
      }
    };

    measure();
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
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="home-rail chrome-adaptive fixed right-4 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {ITEMS.map((it) => {
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
              className={`whitespace-nowrap font-mono t-micro uppercase tracking-[0.1em] transition-all duration-300 ${
                on
                  ? "text-forest opacity-100"
                  : "translate-x-1 text-sand opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
              }`}
            >
              {it.label}
            </span>
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: on ? 22 : 8,
                height: 8,
                // a token, not a fixed off white: the rail is fixed so it floats over both
                // states, and a light dot is invisible once the page turns to paper
                background: on ? "var(--color-forest)" : "color-mix(in srgb, var(--color-cream) 32%, transparent)",
                boxShadow: on ? "0 0 12px var(--color-forest)" : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
