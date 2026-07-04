"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionMotif } from "./SectionMotif";
import { VideoLightbox } from "./VideoLightbox";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";
import { fadeUp } from "@/lib/motion";

const FEATURED = { yt: "Nr8vCC5JWCQ", badge: "TVC · Top 1 · 2024", title: "Business Challenge 2024 · TVC ARISAQUA", meta: "Top 1 TVC · ISB Academic Team" };
const STRIP = [
  { yt: "1cJGz4wwduA", badge: "Social · Top 20", title: "Let's On Air 2023", meta: "S Communications" },
  { yt: "BWeBzuIDSRk", badge: "Explainer", title: "Shadow Funnel", meta: "Mona Media" },
  { yt: "3xfFHWMzung", badge: "Product", title: "Explainer trên iPad", meta: "Mona Media" },
];

function VideoCard({ yt, badge, title, meta, onOpen, featured }: { yt: string; badge: string; title: string; meta: string; onOpen: (yt: string, title: string) => void; featured?: boolean }) {
  return (
    <button
      onClick={() => onOpen(yt, title)}
      className={`group relative overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] text-left ${featured ? "" : "aspect-[16/10]"}`}
    >
      <img
        src={`https://img.youtube.com/vi/${yt}/maxresdefault.jpg`}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-black/85" />
      <span className="absolute left-3 top-3 z-[2] rounded-md bg-black/60 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-cream">
        {badge}
      </span>
      <span className="absolute left-1/2 top-1/2 z-[2] flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-cream/85 text-cream">
        ▶
      </span>
      <div className="absolute bottom-3.5 left-4 right-4 z-[2]">
        <div className="text-[1rem] font-semibold leading-[1.3] text-cream">{title}</div>
        <div className="mt-1 font-mono text-[0.58rem] text-sand">{meta}</div>
      </div>
    </button>
  );
}

export function VideoTeaser() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  const [active, setActive] = useState<{ yt: string; title: string } | null>(null);

  return (
    <section ref={ref} id="video" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="eq" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-9 flex flex-wrap items-end justify-between gap-8 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Video &amp; <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">brand</span>
          </h2>
          <div className="text-right font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-sand">
            Two-time Top 1 TVC
            <br />
            Business Challenge
          </div>
        </motion.div>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-9 max-w-[62ch] text-[clamp(1.15rem,1.6vw,1.35rem)] font-light leading-[1.75] text-tan"
        >
          End-to-end video production: TVCs, brand films, event recaps, music videos, explainers.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]"
        >
          <VideoCard {...FEATURED} onOpen={(yt, title) => setActive({ yt, title })} featured />
          <div className="grid grid-rows-3 gap-4">
            {STRIP.map((v) => (
              <VideoCard key={v.yt} {...v} onOpen={(yt, title) => setActive({ yt, title })} />
            ))}
          </div>
        </motion.div>

        <motion.a
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          href="/video.html"
          className="flex items-center justify-between rounded-[14px] border border-rule px-7 py-6 transition-colors hover:bg-forest hover:text-ink"
        >
          <div>
            <div className="text-[1.1rem] font-semibold">View full video reel</div>
            <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-sand">
              Brand films · TVCs · Events · Music videos · Explainers
            </div>
          </div>
          <span className="text-[1.4rem]">→</span>
        </motion.a>
      </div>
      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
