"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const TRACKED = ["about", "nhaminh", "terra", "aru", "bong", "work", "video", "contact"] as const;
type Tracked = (typeof TRACKED)[number];
const WORK_SECTIONS: Tracked[] = ["nhaminh", "terra", "aru", "bong", "work"];

const WORK_ITEMS: { href: string; label: string; sub: string }[] = [
  { href: "/nha-minh", label: "Nhà Mình", sub: "AI Riser 2026 · Healthcare AI" },
  { href: "#terra", label: "terra-plat.vn", sub: "B2B SaaS growth · 22 mo" },
  { href: "#aru", label: "ある男", sub: "AI music video" },
  { href: "#bong", label: "Bóng Vespera", sub: "AI creative pipeline" },
  { href: "#work", label: "Selected builds", sub: "IELTS Studio · Badminton · uphub" },
];

const MOBILE_LINKS: { href: string; label: string }[] = [
  { href: "#about", label: "About" },
  { href: "/nha-minh", label: "Nhà Mình · AI Healthcare" },
  { href: "#terra", label: "terra-plat.vn growth" },
  { href: "#aru", label: "ある男 · AI video" },
  { href: "#bong", label: "Bóng Vespera" },
  { href: "#work", label: "Selected builds" },
  { href: "/video", label: "Films" },
  { href: "#contact", label: "Contact" },
];

function PillLink({ id, label, active }: { id: string; label: string; active: boolean }) {
  return (
    <a
      href={`#${id}`}
      className={`relative z-[2] whitespace-nowrap rounded-full px-4 py-1.5 transition-colors ${
        active ? "text-ink font-bold" : "text-tan hover:text-cream"
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

function WorkMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative z-[2] flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 uppercase transition-colors ${
          active ? "text-ink font-bold" : "text-tan hover:text-cream"
        }`}
      >
        {active && (
          <motion.span
            layoutId="pill-indicator"
            className="absolute inset-0 -z-10 rounded-full bg-forest"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        Work
        <span className={`text-[0.6rem] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-[260px] overflow-hidden rounded-[14px] border border-panel-border bg-ink/90 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            {WORK_ITEMS.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="group flex flex-col gap-0.5 rounded-[9px] px-3 py-2.5 transition-colors hover:bg-forest/12"
              >
                <span className="font-sans text-[0.82rem] normal-case tracking-normal text-cream transition-colors group-hover:text-forest">
                  {it.label}
                </span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-sand">{it.sub}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenu({ isLight }: { isLight: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Sections"
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 uppercase transition-all ${
          isLight
            ? "border border-orange-200/90 bg-white/90 text-slate-800 shadow-sm"
            : "border border-panel-border bg-panel text-tan"
        }`}
      >
        Menu
        <span className={`text-[0.6rem] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute right-0 top-[calc(100%+8px)] w-[240px] overflow-hidden rounded-[14px] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md ${
              isLight
                ? "border border-orange-200 bg-white/95 text-slate-800"
                : "border border-panel-border bg-ink/92 text-cream"
            }`}
          >
            {MOBILE_LINKS.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`block rounded-[9px] px-3 py-2.5 font-sans text-[0.9rem] normal-case tracking-normal transition-colors ${
                  isLight
                    ? "text-slate-700 hover:bg-orange-50 hover:text-[#FF6B4B]"
                    : "text-cream hover:bg-forest/12 hover:text-forest"
                }`}
              >
                {it.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isNhaMinh = pathname === "/nha-minh";
  const [active, setActive] = useState<Tracked | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    let sectionObserver: IntersectionObserver | undefined;
    if (isHome) {
      const targets = TRACKED.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id as Tracked);
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      targets.forEach((t) => sectionObserver!.observe(t));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sectionObserver?.disconnect();
    };
  }, [isHome, pathname]);

  const workActive = active != null && WORK_SECTIONS.includes(active);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[100] flex h-[68px] items-center justify-between px-[var(--pad)] font-mono text-[0.72rem] uppercase tracking-[0.12em] transition-all duration-300 ${
        scrolled
          ? isNhaMinh
            ? "bg-[#FBF9F5]/85 border-b border-orange-200/80 shadow-[0_4px_20px_rgba(255,107,75,0.06)] backdrop-blur-md"
            : "bg-ink/75 border-b border-panel-border shadow-md backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Brand Logo & Author Name */}
      <a href={isHome ? "#hero" : "/"} className="flex items-baseline gap-2 transition-opacity hover:opacity-85">
        {!isHome && <span className={isNhaMinh ? "text-[#FF6B4B]" : "text-forest"}>←</span>}
        <b className={`font-serif-jp text-[1.05rem] font-bold leading-none ${isNhaMinh ? "text-[#FF6B4B]" : "text-forest"}`}>
          達樹
        </b>
        <span className={isNhaMinh ? "text-slate-700 font-semibold" : "text-tan"}>Tatsuki</span>
      </a>

      {/* Desktop Menu Navigation */}
      {isHome ? (
        <>
          <div className="hidden items-center gap-1 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
            <PillLink id="about" label="About" active={active === "about"} />
            <WorkMenu active={workActive} />
            <Link href="/video" className="relative z-[2] rounded-full px-4 py-1.5 text-tan transition-colors hover:text-cream">
              Video
            </Link>
            <PillLink id="contact" label="Contact" active={active === "contact"} />
          </div>
          <MobileMenu isLight={false} />
        </>
      ) : isNhaMinh ? (
        <>
          <div className="hidden items-center gap-2 rounded-full border border-orange-200/90 bg-white/90 p-1 shadow-sm backdrop-blur-md sm:flex">
            <Link
              href="/"
              className="relative z-[2] rounded-full px-3.5 py-1.5 font-bold text-slate-700 transition-colors hover:text-[#FF6B4B]"
            >
              ← Portfolio
            </Link>
            <a
              href="https://ai-riser-namdosan-fa737.web.app"
              target="_blank"
              rel="noreferrer"
              className="relative z-[2] rounded-full bg-gradient-to-r from-[#FF6B4B] to-[#FF8E53] px-4 py-1.5 font-bold text-white shadow-sm transition-all hover:shadow-[0_2px_12px_rgba(255,107,75,0.35)]"
            >
              Live App ↗
            </a>
            <a
              href="https://youtube.com/watch?v=5CNx1tlCGSM"
              target="_blank"
              rel="noreferrer"
              className="relative z-[2] rounded-full px-3.5 py-1.5 font-bold text-slate-700 transition-colors hover:text-[#FF6B4B]"
            >
              1080p Demo ↗
            </a>
            <a
              href="https://github.com/jak3rpham/ai-riser-namdosan"
              target="_blank"
              rel="noreferrer"
              className="relative z-[2] rounded-full px-3.5 py-1.5 font-bold text-slate-700 transition-colors hover:text-[#FF6B4B]"
            >
              GitHub ↗
            </a>
          </div>
          <MobileMenu isLight={true} />
        </>
      ) : (
        <>
          <div className="hidden items-center gap-1 rounded-full border border-panel-border bg-panel p-1 backdrop-blur-md sm:flex">
            <Link href="/" className="relative z-[2] rounded-full px-4 py-1.5 text-tan transition-colors hover:text-cream">
              Home
            </Link>
          </div>
          <MobileMenu isLight={false} />
        </>
      )}
    </nav>
  );
}
