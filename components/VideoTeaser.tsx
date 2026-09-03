"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { VideoLightbox } from "./VideoLightbox";
import { Reveal } from "./Reveal";
import { useScrollTilt } from "@/lib/useScrollTilt";
import { fadeUp } from "@/lib/motion";
import { HOME_PRIORITY, thumb, type Film } from "@/lib/videoData";

function VideoCard({
  v,
  onOpen,
  className = "",
  big = false,
}: {
  v: Film;
  onOpen: (yt: string, title: string) => void;
  className?: string;
  big?: boolean;
}) {
  const tilt = useScrollTilt<HTMLButtonElement>(big ? 3 : 5);
  return (
    <motion.button
      ref={tilt.ref}
      style={tilt.style}
      onClick={() => onOpen(v.yt, v.title)}
      className={`group relative h-full overflow-hidden rounded-[14px] border border-panel-border bg-ink-raised text-left ${className}`}
    >
      <img
        src={thumb(v.yt)}
        alt={v.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85" />
      {v.badge && (
        <span className="absolute left-3 top-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 font-mono t-micro uppercase tracking-[0.08em] text-cream backdrop-blur-sm">
          {v.badge}
        </span>
      )}
      <span
        className={`absolute left-1/2 top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-cream/85 pl-1 text-cream transition-colors group-hover:border-forest group-hover:text-forest ${
          big ? "h-[68px] w-[68px] t-lead" : "h-[50px] w-[50px]"
        }`}
      >
        ▶
      </span>
      <div className="absolute inset-x-4 bottom-4 z-[2]">
        <div className={`font-semibold leading-[1.15] text-cream ${big ? "font-display text-[clamp(1.4rem,2.6vw,2.2rem)] tracking-[-0.02em]" : "t-body"}`}>
          {v.title}
        </div>
        <div className="mt-1 font-mono t-micro uppercase tracking-[0.05em] text-sand">{v.meta}</div>
      </div>
    </motion.button>
  );
}

export function VideoTeaser() {
  const [active, setActive] = useState<{ yt: string; title: string } | null>(null);
  const open = (yt: string, title: string) => setActive({ yt, title });
  const v = HOME_PRIORITY;

  return (
    <section id="video" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Video &amp; <span className="text-forest">brand</span>
            </h2>
          </Reveal>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-[38ch] t-body font-light leading-[1.7] text-tan"
          >
            End-to-end production: TVCs, brand films, event recaps, music videos, explainers. Two-time Top 1 TVC at Business Challenge.
          </motion.p>
        </div>

        {/* asymmetric bento — a big hero + a right stack, then a three-up row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-4 [perspective:1800px] md:grid-cols-12 md:auto-rows-[132px]"
        >
          <VideoCard v={v[0]} onOpen={open} big className="aspect-video md:aspect-auto md:col-span-7 md:row-span-3" />
          <VideoCard v={v[1]} onOpen={open} className="aspect-video md:aspect-auto md:col-span-5 md:row-span-2" />
          <VideoCard v={v[2]} onOpen={open} className="aspect-video md:aspect-auto md:col-span-5 md:row-span-1" />
          <VideoCard v={v[3]} onOpen={open} className="aspect-video md:aspect-auto md:col-span-4 md:row-span-2" />
          <VideoCard v={v[4]} onOpen={open} className="aspect-video md:aspect-auto md:col-span-4 md:row-span-2" />
          <VideoCard v={v[5]} onOpen={open} className="aspect-video md:aspect-auto md:col-span-4 md:row-span-2" />
        </motion.div>

        <motion.a
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          href="/video"
          className="group mt-6 flex items-center justify-between rounded-[14px] border border-rule px-7 py-6 transition-colors hover:border-forest/50 hover:bg-forest/5"
        >
          <div>
            <div className="t-lead font-semibold text-cream">View full video reel</div>
            <div className="mt-1 font-mono t-micro uppercase tracking-[0.06em] text-sand">
              Brand films · TVCs · Events · Music videos · Explainers
            </div>
          </div>
          <span className="text-[1.4rem] text-forest transition-transform duration-200 group-hover:translate-x-1">→</span>
        </motion.a>
      </div>
      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
