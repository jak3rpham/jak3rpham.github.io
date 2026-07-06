"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { useScrollTilt } from "@/lib/useScrollTilt";
import { COMMERCIAL, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.commercial.accent;

function DeviceFrame({ film, onOpen }: { film: Film; onOpen: (f: Film) => void }) {
  const tilt = useScrollTilt<HTMLDivElement>(4);
  return (
    <motion.div ref={tilt.ref} style={tilt.style} className="[perspective:1400px]">
      <button
        onClick={() => onOpen(film)}
        className="group block w-full overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] transition-colors hover:border-[color:var(--ac)]"
      >
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-panel-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0655a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0b978]" />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: AC }} />
          <span className="ml-3 flex-1 truncate rounded-md bg-ink px-3 py-1 font-mono text-[0.55rem] text-sand">
            youtube.com/watch · {film.title}
          </span>
        </div>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumb(film.yt)}
            alt={film.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <span
            className="absolute left-1/2 top-1/2 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-1 text-cream transition-colors group-hover:text-[color:var(--ac)]"
            style={{ borderColor: "rgba(245,242,232,0.8)" }}
          >
            ▶
          </span>
        </div>
      </button>
    </motion.div>
  );
}

function Copy({ film, i }: { film: Film; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em]" style={{ color: AC }}>
        {film.badge === "terra" ? "terra · product" : "client · Mona Media"} · {String(i + 1).padStart(2, "0")}
      </div>
      <h4 className="mt-3 font-display text-[clamp(1.5rem,3vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-cream">
        {film.title}
      </h4>
      <p className="mt-3 max-w-[40ch] text-[0.98rem] font-light leading-[1.6] text-tan">{film.meta}</p>
      <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.1em]" style={{ color: AC }}>
        ▶ Watch explainer
      </span>
    </motion.div>
  );
}

export function CommercialFrames() {
  const [active, setActive] = useState<Film | null>(null);
  return (
    <section
      id={SECTIONS.commercial.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{ background: `radial-gradient(80% 50% at 90% 15%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
              Commercial & <span style={{ color: AC }}>explainer</span>
            </h3>
          </Reveal>
          <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
            Mona Media · terra
            <br />
            Product & support demos
          </div>
        </div>

        <div className="flex flex-col gap-[clamp(3rem,6vw,5rem)]">
          {COMMERCIAL.map((f, i) => (
            <div key={f.yt} className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <DeviceFrame film={f} onOpen={setActive} />
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <Copy film={f} i={i} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
