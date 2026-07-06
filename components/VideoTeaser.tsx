"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { VideoLightbox } from "./VideoLightbox";
import { Reveal } from "./Reveal";
import { useScrollTilt } from "@/lib/useScrollTilt";
import { fadeUp } from "@/lib/motion";

type Vid = { yt: string; badge: string; title: string; meta: string };

const VIDEOS: Vid[] = [
  { yt: "Nr8vCC5JWCQ", badge: "Top 1 TVC · 2024", title: "Business Challenge 2024 · TVC ARISAQUA", meta: "ISB Academic Team" },
  { yt: "1cJGz4wwduA", badge: "Social · Top 20", title: "Let's On Air 2023", meta: "S Communications" },
  { yt: "BWeBzuIDSRk", badge: "Explainer", title: "Shadow Funnel", meta: "Mona Media" },
  { yt: "3xfFHWMzung", badge: "Product", title: "Explainer trên iPad", meta: "Mona Media" },
];

function VideoCard({
  v,
  onOpen,
  className = "",
}: {
  v: Vid;
  onOpen: (yt: string, title: string) => void;
  className?: string;
}) {
  const tilt = useScrollTilt<HTMLButtonElement>(4);
  return (
    <motion.button
      ref={tilt.ref}
      style={tilt.style}
      onClick={() => onOpen(v.yt, v.title)}
      className={`group relative overflow-hidden rounded-[14px] border border-panel-border bg-ink-raised text-left ${className}`}
    >
      <img
        src={`https://img.youtube.com/vi/${v.yt}/maxresdefault.jpg`}
        alt={v.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85" />
      <span className="absolute left-3 top-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-cream backdrop-blur-sm">
        {v.badge}
      </span>
      <span className="absolute left-1/2 top-1/2 z-[2] flex h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-cream/85 pl-1 text-cream transition-colors group-hover:border-forest group-hover:text-forest">
        ▶
      </span>
      <div className="absolute bottom-4 left-4 right-4 z-[2]">
        <div className="text-[1.05rem] font-semibold leading-[1.3] text-cream">{v.title}</div>
        <div className="mt-1 font-mono text-[0.58rem] text-sand">{v.meta}</div>
      </div>
    </motion.button>
  );
}

export function VideoTeaser() {
  const [active, setActive] = useState<{ yt: string; title: string } | null>(null);
  const open = (yt: string, title: string) => setActive({ yt, title });

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
            className="max-w-[38ch] text-[1.02rem] font-light leading-[1.7] text-tan"
          >
            End-to-end production: TVCs, brand films, event recaps, music videos, explainers. Two-time Top 1 TVC at Business Challenge.
          </motion.p>
        </div>

        {/* asymmetric, staggered mosaic with 3D tilt */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 [perspective:1800px] md:grid-cols-12"
        >
          <VideoCard v={VIDEOS[0]} onOpen={open} className="aspect-[16/9] md:col-span-7" />
          <VideoCard v={VIDEOS[1]} onOpen={open} className="aspect-[16/11] md:col-span-5" />
          <VideoCard v={VIDEOS[2]} onOpen={open} className="aspect-[16/11] md:col-span-5" />
          <VideoCard v={VIDEOS[3]} onOpen={open} className="aspect-[16/9] md:col-span-7" />
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
            <div className="text-[1.1rem] font-semibold text-cream">View full video reel</div>
            <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-sand">
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
