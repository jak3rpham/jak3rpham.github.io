"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { VelocityMarquee } from "../../VelocityMarquee";
import { MUSIC, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.music.accent;

// hoisted: building this inside Cover would mint a new component type on every render
// and blow away the element's state each time.
const MotionLink = motion(Link);

function Cover({ film, big, onOpen }: { film: Film; big?: boolean; onOpen: (f: Film) => void }) {
  // Nothing to play yet: link to the case study instead of opening an empty player.
  const linkOnly = !film.yt && !!film.caseStudy;
  const Wrapper = (linkOnly ? MotionLink : motion.button) as typeof motion.button;
  const wrapperProps = linkOnly
    ? { href: film.caseStudy! }
    : { onClick: () => onOpen(film) };

  return (
    <Wrapper
      {...(wrapperProps as object)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block w-full overflow-hidden rounded-[18px] border border-panel-border bg-ink-raised text-left"
    >
      <div className={`overflow-hidden ${big ? "aspect-[21/9]" : "aspect-video"}`}>
        <img
          src={film.poster ?? thumb(film.yt)}
          alt={film.title}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
      </div>
      {/* magenta colour bleed */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(to top, ${AC}22, transparent 55%), linear-gradient(to top, rgba(0,0,0,0.85), transparent 60%)` }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 80px -20px ${AC}` }}
      />
      {linkOnly ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[1.5px] px-5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cream transition-colors group-hover:text-[color:var(--ac)]" style={{ borderColor: "rgba(245,242,232,0.8)" }}>
          Case study →
        </span>
      ) : (
        <span
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-1 text-cream transition-colors group-hover:text-[color:var(--ac)]"
          style={{ borderColor: "rgba(245,242,232,0.8)", width: big ? 76 : 56, height: big ? 76 : 56 }}
        >
          ▶
        </span>
      )}
      {film.badge && (
        <span className="absolute right-4 top-4 rounded-md px-2.5 py-1 font-mono text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-ink" style={{ background: AC }}>
          {film.badge}
        </span>
      )}
      <div className="absolute inset-x-5 bottom-5">
        <div className={`font-display font-bold leading-[0.98] tracking-[-0.02em] text-cream ${big ? "text-[clamp(2rem,6vw,4.2rem)]" : "text-[1.5rem]"}`}>
          {film.title}
        </div>
        <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-sand">{film.meta}</div>
      </div>
    </Wrapper>
  );
}

export function MusicWall() {
  const [active, setActive] = useState<Film | null>(null);
  const [featured, ...rest] = MUSIC;

  return (
    <section
      id={SECTIONS.music.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden py-[clamp(4rem,8vw,7rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ background: `radial-gradient(90% 55% at 50% 0%, ${AC}, transparent 60%)` }}
      />
      <div className="mx-auto max-w-[1360px] px-[var(--pad)]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
              Music <span style={{ color: AC }}>videos</span>
            </h3>
          </Reveal>
          <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
            L.O.M Music Club
            <br />
            Themes · MVs · visualizers
          </div>
        </div>

        <Cover film={featured} big onOpen={setActive} />
      </div>

      <div className="my-8 overflow-hidden border-y border-rule py-3" style={{ background: `${AC}0d` }}>
        <VelocityMarquee baseVelocity={2}>
          <span className="flex items-center font-display text-[clamp(1.2rem,2.6vw,2rem)] font-bold" style={{ color: `${AC}cc` }}>
            {MUSIC.map((m) => (
              <span key={m.title} className="flex items-center">
                <span className="px-6">{m.title}</span>
                <span style={{ color: AC }}>♪</span>
              </span>
            ))}
          </span>
        </VelocityMarquee>
      </div>

      <div className="mx-auto max-w-[1360px] px-[var(--pad)]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rest.map((f) => (
            <Cover key={f.title} film={f} onOpen={setActive} />
          ))}
        </div>
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
