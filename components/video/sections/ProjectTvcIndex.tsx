"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { PROJECT_TVC, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS["project-tvc"].accent;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function Row({ film, i, onOpen }: { film: Film; i: number; onOpen: (f: Film) => void }) {
  return (
    <motion.button
      data-idx={i}
      onClick={() => onOpen(film)}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ amount: 0.35 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group flex w-full items-center gap-5 border-b border-rule py-6 text-left"
    >
      <span className="w-9 shrink-0 font-mono text-[0.72rem] tracking-[0.1em] lg:hidden" style={{ color: AC }}>
        {ROMAN[i]}
      </span>
      <div className="relative aspect-video w-[46%] shrink-0 overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised transition-colors group-hover:border-[color:var(--ac)]">
        <img
          src={thumb(film.yt)}
          alt={film.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: `inset 0 0 40px -8px ${AC}` }} />
        <span
          className="absolute left-1/2 top-1/2 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-0.5 text-cream opacity-0 transition-opacity group-hover:opacity-100"
          style={{ borderColor: AC, color: AC }}
        >
          ▶
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[clamp(1.2rem,2.4vw,1.9rem)] font-bold leading-tight text-cream transition-transform duration-300 group-hover:translate-x-1">
          {film.title}
        </div>
        <div className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-sand">{film.meta}</div>
        {film.badge && (
          <span className="mt-2 inline-block rounded-[5px] border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.06em]" style={{ borderColor: `${AC}66`, color: AC }}>
            {film.badge}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function ProjectTvcIndex() {
  const [active, setActive] = useState<Film | null>(null);
  const [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Track which row sits in a thin band ~38% down the viewport → drives the numeral.
  useEffect(() => {
    const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-idx]");
    if (!rows?.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setIdx(Number((e.target as HTMLElement).dataset.idx));
        }
      },
      { rootMargin: "-38% 0px -57% 0px", threshold: 0 }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id={SECTIONS["project-tvc"].id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{ background: `radial-gradient(80% 50% at 10% 20%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
              University project <span style={{ color: AC }}>TVCs</span>
            </h3>
          </Reveal>
          <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
            ISB · terra
            <br />
            Brand & product films
          </div>
        </div>

        <div className="flex gap-10">
          {/* sticky chapter numeral */}
          <div className="hidden w-[16%] shrink-0 lg:block">
            <div className="sticky top-[34vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-[7vw] font-bold leading-none"
                  style={{ color: AC }}
                >
                  {ROMAN[idx]}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">
                {String(idx + 1).padStart(2, "0")} / {String(PROJECT_TVC.length).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div ref={listRef} className="flex-1">
            {PROJECT_TVC.map((f, i) => (
              <Row key={f.yt} film={f} i={i} onOpen={setActive} />
            ))}
          </div>
        </div>
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
