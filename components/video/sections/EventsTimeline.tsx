"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { EVENTS, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.events.accent;

export function EventsTimeline() {
  const [active, setActive] = useState<Film | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false });

  const onWheel = (e: React.WheelEvent) => {
    const el = trackRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY;
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
  const open = (f: Film) => {
    if (drag.current.moved) return;
    setActive(f);
  };

  return (
    <section
      id={SECTIONS.events.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden py-[clamp(4rem,8vw,7rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{ background: `radial-gradient(80% 50% at 20% 10%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto mb-8 max-w-[1400px] px-[var(--pad)]">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
              <span style={{ color: AC }}>Events</span> & recaps
            </h3>
          </Reveal>
          <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
            L.O.M · SRadio
            <br />
            Drag → along the timeline
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="flex cursor-grab overflow-x-auto scroll-smooth px-[var(--pad)] pb-4 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {EVENTS.map((film, i) => (
          <motion.div
            key={film.yt}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-[clamp(260px,72vw,340px)] shrink-0 flex-col"
          >
            <div className="px-1 font-display text-[1.4rem] font-bold" style={{ color: AC }}>
              {film.date}
            </div>
            {/* node + connector line */}
            <div className="relative my-3 h-4">
              <span className="absolute left-0 right-0 top-1/2 h-px" style={{ background: `${AC}55` }} />
              <span className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full" style={{ background: AC, boxShadow: `0 0 10px ${AC}` }} />
            </div>
            <button
              onClick={() => open(film)}
              className="group mr-5 block overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised text-left transition-colors hover:border-[color:var(--ac)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={thumb(film.yt)}
                  alt={film.title}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <span
                  className="absolute left-1/2 top-1/2 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-0.5 text-cream opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ borderColor: AC, color: AC }}
                >
                  ▶
                </span>
              </div>
              <div className="px-4 py-3">
                <div className="text-[0.98rem] font-semibold leading-snug text-cream">{film.title}</div>
                <div className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.05em] text-sand">{film.meta}</div>
              </div>
            </button>
          </motion.div>
        ))}
        <div className="w-[var(--pad)] shrink-0" aria-hidden />
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
