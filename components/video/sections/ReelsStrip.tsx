"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { REELS, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.reels.accent;

function ReelCard({ film, i, onOpen }: { film: Film; i: number; onOpen: (f: Film) => void }) {
  // Staggered heights + vertical offset — celluloid frames of uneven length.
  const drop = i % 3 === 1 ? 34 : i % 3 === 2 ? 16 : 0;
  return (
    <motion.button
      onClick={() => onOpen(film)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginTop: drop }}
      className="group relative w-[clamp(160px,42vw,224px)] shrink-0 select-none"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[14px] border border-panel-border bg-ink-raised transition-colors group-hover:border-[color:var(--ac)]">
        <img
          src={thumb(film.yt, "hq")}
          alt={film.title}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 2px ${AC}, inset 0 0 40px -8px ${AC}` }}
        />
        <span
          className="absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-0.5 text-cream transition-colors group-hover:text-[color:var(--ac)]"
          style={{ borderColor: "rgba(245,242,232,0.75)" }}
        >
          ▶
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-black/55 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.06em] text-[color:var(--ac)] backdrop-blur-sm">
          9:16
        </span>
        <div className="absolute inset-x-3 bottom-3">
          <div className="text-[0.82rem] font-semibold leading-tight text-cream">{film.title}</div>
          <div className="mt-0.5 font-mono text-[0.52rem] uppercase tracking-[0.04em] text-sand">{film.meta}</div>
        </div>
      </div>
    </motion.button>
  );
}

// Perforated celluloid edge — a row of sprocket holes.
function Perforation() {
  return (
    <div
      className="h-3.5 w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 10px, rgba(0,0,0,0.55) 10px 20px)",
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    />
  );
}

export function ReelsStrip() {
  const [active, setActive] = useState<Film | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false });

  // Scroll-linked horizontal drift — the whole strip glides as the page scrolls.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const driftX = useTransform(scrollYProgress, [0, 1], [90, -90]);

  const onWheel = (e: React.WheelEvent) => {
    const el = trackRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY;
  };
  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scroll - dx;
  };
  const endDrag = () => (drag.current.down = false);
  const onOpen = (f: Film) => {
    if (drag.current.moved) return; // ignore click that was really a drag
    setActive(f);
  };

  return (
    <section
      ref={sectionRef}
      id={SECTIONS.reels.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden py-[clamp(3.5rem,7vw,6rem)]"
    >
      {/* accent wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(120% 60% at 15% 0%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto mb-9 max-w-[1500px] px-[var(--pad)]">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
              Short <span style={{ color: AC }}>reels</span>
            </h3>
          </Reveal>
          <div className="flex items-center gap-4">
            <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
              Vertical · 9:16 · {REELS.length}
              <br />
              Drag or use →
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => nudge(-1)}
                aria-label="Previous reels"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-panel-border text-cream transition-colors hover:border-[color:var(--ac)] hover:text-[color:var(--ac)]"
              >
                ←
              </button>
              <button
                onClick={() => nudge(1)}
                aria-label="Next reels"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-panel-border text-cream transition-colors hover:border-[color:var(--ac)] hover:text-[color:var(--ac)]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Perforation />
      <div className="relative">
        {/* edge fades hint at more */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-16 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-16 bg-gradient-to-l from-ink to-transparent" />
        <div
          ref={trackRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className="cursor-grab overflow-x-auto scroll-smooth px-[var(--pad)] py-6 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <motion.div style={{ x: driftX }} className="flex w-max gap-5">
            {REELS.map((film, i) => (
              <ReelCard key={film.yt} film={film} i={i} onOpen={onOpen} />
            ))}
            <div className="w-[var(--pad)] shrink-0" aria-hidden />
          </motion.div>
        </div>
      </div>
      <Perforation />

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} vertical onClose={() => setActive(null)} />
    </section>
  );
}
