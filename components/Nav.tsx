"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const SECTIONS = ["about", "work", "contact"] as const;
type SectionId = (typeof SECTIONS)[number];

function PillLink({ id, label, active }: { id: SectionId; label: string; active: boolean }) {
  return (
    <a
      href={`#${id}`}
      className={`relative z-[2] whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${
        active ? "text-ink" : "text-tan hover:text-cream"
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
    </a>
  );
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [active, setActive] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const heroObserver = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    if (hero) heroObserver.observe(hero);

    let sectionObserver: IntersectionObserver | undefined;
    if (isHome) {
      const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id as SectionId);
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      targets.forEach((t) => sectionObserver!.observe(t));
    }

    return () => {
      heroObserver.disconnect();
      sectionObserver?.disconnect();
    };
  }, [isHome, pathname]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[100] flex h-[68px] items-center justify-between px-[var(--pad)] font-mono text-[0.72rem] uppercase tracking-[0.12em] transition-colors duration-500 ${
        scrolled ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <a href={isHome ? "#hero" : "/"} className="flex items-baseline gap-2 text-cream">
        {!isHome && <span className="text-forest">←</span>}
        <b className="font-serif-jp text-[1.05rem] font-bold leading-none text-forest">達樹</b>
        <span className="text-tan">Tatsuki</span>
      </a>

      {isHome ? (
        <div className="hidden items-center gap-1 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
          <PillLink id="about" label="About" active={active === "about"} />
          <PillLink id="work" label="Work" active={active === "work"} />
          <a href="/video" className="relative z-[2] rounded-full px-4 py-1.5 text-tan transition-colors hover:text-cream">
            Video
          </a>
          <PillLink id="contact" label="Contact" active={active === "contact"} />
        </div>
      ) : (
        <div className="hidden items-center gap-1 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
          <a href="/" className="relative z-[2] rounded-full px-4 py-1.5 text-tan transition-colors hover:text-cream">
            Home
          </a>
        </div>
      )}
    </nav>
  );
}
