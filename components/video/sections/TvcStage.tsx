"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { useCountUp } from "@/lib/useCountUp";
import { TVC_CROWNED, TVC_ALSO, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.tvc.accent;

// A laurel wreath framing the badge; both branches self-draw on view.
function Laurel({ show }: { show: boolean }) {
  const branch =
    "M0,0 C-10,-14 -10,-30 -4,-46 M-3,-8 c-9,-1 -14,-7 -15,-15 M-4,-20 c-9,-1 -14,-7 -16,-14 M-3,-32 c-8,-2 -12,-8 -13,-15";
  return (
    <svg viewBox="-60 -60 120 70" className="absolute inset-0 h-full w-full" aria-hidden>
      {[1, -1].map((s) => (
        <motion.path
          key={s}
          d={branch}
          transform={`scale(${s},1)`}
          fill="none"
          stroke={AC}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={show ? { pathLength: 1, opacity: 0.9 } : {}}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function AwardCard({ film, i, onOpen }: { film: Film; i: number; onOpen: (f: Film) => void }) {
  const [seen, setSeen] = useState(false);
  const { value, start } = useCountUp(1, 0, 900);
  return (
    <motion.button
      onClick={() => onOpen(film)}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => {
        setSeen(true);
        start();
      }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block w-full text-left"
    >
      <div className="relative aspect-video overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised transition-colors group-hover:border-[color:var(--ac)]">
        <img
          src={thumb(film.yt)}
          alt={film.title}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 from-30% to-black/85" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 60px -10px ${AC}` }}
        />
        <span
          className="absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-1 text-cream transition-colors group-hover:text-[color:var(--ac)]"
          style={{ borderColor: "rgba(245,242,232,0.8)" }}
        >
          ▶
        </span>
        <div className="absolute inset-x-5 bottom-5">
          <div className="font-display text-[1.6rem] font-bold leading-none text-cream">{film.title}</div>
          <div className="mt-1.5 font-mono t-micro uppercase tracking-[0.06em] text-sand">{film.meta}</div>
        </div>
      </div>

      {/* Award medallion — laurel + count-up rank */}
      <div className="absolute -top-5 left-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-ink/90 backdrop-blur-md">
        <Laurel show={seen} />
        <div className="text-center leading-none">
          <div className="font-display text-[1.5rem] font-bold" style={{ color: AC }}>
            0{value}
          </div>
          <div className="font-mono t-micro uppercase tracking-[0.12em] text-sand">Top</div>
        </div>
      </div>
      {film.badge && (
        <span
          className="absolute -top-2 right-5 rounded-md px-2.5 py-1 font-mono t-micro font-semibold uppercase tracking-[0.08em] text-ink"
          style={{ background: AC }}
        >
          {film.badge}
        </span>
      )}
    </motion.button>
  );
}

function AlsoCard({ film, onOpen }: { film: Film; onOpen: (f: Film) => void }) {
  return (
    <button
      onClick={() => onOpen(film)}
      className="group relative block overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised/60 text-left transition-colors hover:border-[color:var(--ac)]"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={thumb(film.yt)}
          alt={film.title}
          loading="lazy"
          className="h-full w-full object-cover opacity-80 transition duration-700 ease-out group-hover:scale-[1.05] group-hover:opacity-100"
        />
      </div>
      <div className="px-4 py-3">
        <div className="t-small font-semibold text-cream">{film.title}</div>
        <div className="mt-0.5 font-mono t-micro uppercase tracking-[0.05em] text-sand">{film.meta}</div>
      </div>
    </button>
  );
}

export function TvcStage() {
  const [active, setActive] = useState<Film | null>(null);

  return (
    <section
      id={SECTIONS.tvc.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ background: `radial-gradient(90% 50% at 80% 10%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-cream">
              TVC & <span style={{ color: AC }}>competition</span>
            </h3>
          </Reveal>
          <div className="text-right font-mono t-micro uppercase leading-[1.7] tracking-[0.12em] text-sand">
            2× Top 1 · national
            <br />
            Back-to-back champion
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
          {TVC_CROWNED.map((f, i) => (
            <AwardCard key={f.yt} film={f} i={i} onOpen={setActive} />
          ))}
        </div>

        <div className="mt-16">
          <div className="mb-5 flex items-center gap-4">
            <span className="font-mono t-micro uppercase tracking-[0.12em] text-sand">Also competed</span>
            <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${AC}55, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {TVC_ALSO.map((f) => (
              <AlsoCard key={f.yt} film={f} onOpen={setActive} />
            ))}
          </div>
        </div>
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
