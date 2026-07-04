"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";

const SECTIONS = ["about", "terra", "contact"] as const;
type SectionId = (typeof SECTIONS)[number];

function PillLink({ id, label, active }: { id: SectionId; label: string; active: boolean }) {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);
  return (
    <motion.a
      href={`#${id}`}
      ref={magnetic.ref}
      onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
      onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
      style={hoverCapable ? magnetic.style : undefined}
      className={`relative z-[2] whitespace-nowrap rounded-full px-4 py-2 text-[0.7rem] transition-colors ${
        active ? "text-ink" : "text-sand hover:text-cream"
      }`}
    >
      {active && (
        <motion.span
          layoutId="pill-indicator"
          className="absolute inset-0 -z-10 rounded-full bg-forest"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {label}
    </motion.a>
  );
}

export function Nav() {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent px-[var(--pad)] py-[1.1rem] font-mono text-[0.7rem] uppercase tracking-[0.14em] text-sand">
      <a href="#hero" className="flex items-center gap-2 text-cream">
        Tatsuki <b className="font-serif-jp text-forest">達樹</b>
      </a>
      <div className="relative hidden gap-0.5 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
        <PillLink id="about" label="About" active={active === "about"} />
        <PillLink id="terra" label="Work" active={active === "terra"} />
        <a href="/video.html" className="relative z-[2] rounded-full px-4 py-2 text-sand hover:text-cream">
          Video
        </a>
        <PillLink id="contact" label="Contact" active={active === "contact"} />
        <a href="/CV.pdf" className="relative z-[2] rounded-full px-4 py-2 text-sand hover:text-cream">
          ↓ CV
        </a>
      </div>
    </nav>
  );
}
