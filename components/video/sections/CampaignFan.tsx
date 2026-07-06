"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../../Reveal";
import { VideoLightbox } from "../../VideoLightbox";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { CAMPAIGNS, SECTIONS, thumb, type Film } from "@/lib/videoData";

const AC = SECTIONS.campaigns.accent;

function CardFace({ film }: { film: Film }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[14px] border border-panel-border bg-ink-raised">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumb(film.yt)}
          alt={film.title}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
        {film.badge && (
          <span
            className="absolute left-2.5 top-2.5 rounded-[5px] px-2 py-0.5 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.06em] text-ink"
            style={{ background: AC }}
          >
            {film.badge}
          </span>
        )}
        <span
          className="absolute left-1/2 top-1/2 flex h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] pl-0.5 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ borderColor: AC, color: AC }}
        >
          ▶
        </span>
      </div>
      <div className="px-3.5 py-3">
        <div className="text-[0.95rem] font-semibold leading-snug text-cream">{film.title}</div>
        <div className="mt-1.5 font-mono text-[0.52rem] uppercase tracking-[0.05em] text-sand">{film.meta}</div>
      </div>
    </div>
  );
}

export function CampaignFan() {
  const [active, setActive] = useState<Film | null>(null);
  const [spread, setSpread] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const fanCapable = useMediaQuery("(min-width: 900px)");

  const n = CAMPAIGNS.length;
  const center = (n - 1) / 2;

  const header = (
    <div className="mx-auto max-w-[1200px] px-[var(--pad)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-5 border-b border-rule pb-6">
        <Reveal>
          <h3 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-cream">
            Communication <span style={{ color: AC }}>campaigns</span>
          </h3>
        </Reveal>
        <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
          SRadio · L.O.M
          <br />
          {fanCapable ? "Hover · click a card" : "Swipe · tap a card"}
        </div>
      </div>
    </div>
  );

  return (
    <section
      id={SECTIONS.campaigns.id}
      data-vsection
      style={{ ["--ac" as string]: AC }}
      className="relative z-[4] overflow-hidden py-[clamp(3.5rem,7vw,6rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{ background: `radial-gradient(90% 55% at 50% 0%, ${AC}, transparent 60%)` }}
      />
      {header}

      {fanCapable ? (
        <motion.div
          onViewportEnter={() => setSpread(true)}
          viewport={{ once: true, amount: 0.4 }}
          onMouseLeave={() => setHover(null)}
          className="relative mx-auto mt-8 h-[440px] w-full max-w-[1200px] [perspective:1600px]"
        >
          {CAMPAIGNS.map((film, i) => {
            const off = i - center;
            const isHover = hover === i;
            const rot = spread ? off * 9 : 0;
            const tx = spread ? off * 150 : 0;
            const ty = spread ? Math.abs(off) * 26 : 60;
            const transform = isHover
              ? `translate(-50%, -50%) translateX(${tx}px) translateY(-40px) rotate(0deg) scale(1.07)`
              : `translate(-50%, -50%) translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`;
            return (
              <button
                key={film.yt}
                onClick={() => setActive(film)}
                onMouseEnter={() => setHover(i)}
                aria-label={film.title}
                className="group absolute left-1/2 top-1/2 w-[300px] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform,
                  transformOrigin: "bottom center",
                  zIndex: isHover ? 50 : 10 + (n - Math.abs(off)),
                  opacity: hover !== null && !isHover ? 0.55 : spread ? 1 : 0,
                  filter: isHover ? `drop-shadow(0 24px 50px ${AC}44)` : "none",
                }}
              >
                <CardFace film={film} />
              </button>
            );
          })}
        </motion.div>
      ) : (
        // Mobile fallback: horizontal scroll row of the same portrait cards.
        <div className="mt-6 flex gap-4 overflow-x-auto px-[var(--pad)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CAMPAIGNS.map((film) => (
            <button
              key={film.yt}
              onClick={() => setActive(film)}
              className="group w-[300px] shrink-0 self-start"
            >
              <CardFace film={film} />
            </button>
          ))}
        </div>
      )}

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
