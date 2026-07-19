"use client";
import { useEffect, useState } from "react";

/**
 * Fixed right-edge dot rail for the homepage, one dot per section, so a reader can see the
 * whole shape of the page and jump around. Adapted from the /video route's VideoNavRail: active
 * = the last section whose top has crossed 40% of the viewport, tracked on scroll (this fires
 * under Lenis on real input, same as VideoNavRail). Single green accent, on brand. lg+ only;
 * on smaller screens the header menu covers discovery.
 */
const ITEMS: { id: string; label: string }[] = [
  { id: "hero", label: "Top" },
  { id: "about", label: "About" },
  { id: "terra", label: "Terra" },
  { id: "aru", label: "AI Video" },
  { id: "bong", label: "Bóng Vespera" },
  { id: "work", label: "Other builds" },
  { id: "video", label: "Films" },
  { id: "contact", label: "Contact" },
];

export function HomeNavRail() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const line = () => window.innerHeight * 0.4;
    const compute = () => {
      let current = ITEMS[0].id;
      for (const { id } of ITEMS) {
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
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-4 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
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
              className={`whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-all duration-300 ${
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
                background: on ? "var(--color-forest)" : "rgba(245,242,232,0.28)",
                boxShadow: on ? "0 0 12px var(--color-forest)" : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
