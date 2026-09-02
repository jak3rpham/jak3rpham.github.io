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
  { id: "nhaminh", label: "Nhà Mình (AI)" },
  { id: "terra", label: "Terra" },
  { id: "aru", label: "AI Video" },
  { id: "bong", label: "Bóng Vespera" },
  { id: "work", label: "Selected builds" },
  { id: "video", label: "Films" },
  { id: "contact", label: "Contact" },
];

/**
 * The rail is fixed, so it floats over both the ink and the paper bands and cannot be
 * themed by the wrapper the way the sections are. It already knows which section is
 * active, so it reads its own colours off that instead.
 */
const LIGHT_SECTIONS = new Set(["about", "terra", "work"]);

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

  const onLight = active != null && LIGHT_SECTIONS.has(active);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-4 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {ITEMS.map((it) => {
        const on = active === it.id;
        // umber is the light band's accent (see .theme-light); the glow is dropped on paper
        const accent = onLight ? "#6F5B33" : "var(--color-forest)";
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
              style={{ color: on ? accent : onLight ? "#6A705E" : "var(--color-sand)" }}
            >
              {it.label}
            </span>
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: on ? 22 : 8,
                height: 8,
                background: on ? accent : onLight ? "rgba(22,25,15,0.28)" : "rgba(245,242,232,0.28)",
                boxShadow: on && !onLight ? `0 0 12px ${accent}` : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
