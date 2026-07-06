"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Coverflow } from "../Coverflow";
import { VideoLightbox } from "../VideoLightbox";
import { useScrollTilt } from "@/lib/useScrollTilt";
import { fadeUp } from "@/lib/motion";

type Play = { yt: string; badge?: string; cat: string; title: string; meta: string };

const PLAYABLE: Play[] = [
  { yt: "Nr8vCC5JWCQ", badge: "Top 1 · 2024", cat: "TVC", title: "TVC ARISAQUA", meta: "Business Challenge 2024 · ISB Academic Team" },
  { yt: "BWeBzuIDSRk", cat: "Commercial", title: "Shadow Funnel · Bán hàng tự động", meta: "Commercial explainer · Mona Media" },
  { yt: "3xfFHWMzung", cat: "Explainer", title: "Explainer trên iPad", meta: "Product demo · Mona Media · EdTech" },
  { yt: "1cJGz4wwduA", badge: "Top 20", cat: "Social", title: "Let's On Air · Sống Thay Xô Bồ", meta: "Social campaign · S Communications · 2023" },
];

type Item = { yt?: string; badge?: string; cat: string; title: string; meta: string; soon?: boolean; add?: boolean };
type Category = { name: string; tag?: string; items: Item[] };

const CATEGORIES: Category[] = [
  {
    name: "TVC & competition",
    tag: "2× Top 1 · national",
    items: [
      { yt: "Nr8vCC5JWCQ", badge: "Top 1 · 2024", cat: "TVC", title: "TVC ARISAQUA", meta: "Business Challenge 2024 · ISB Academic Team" },
      { soon: true, badge: "Top 1 · 2023", cat: "TVC", title: "Business Challenge 2023 · TVC", meta: "ISB Academic Team · back-to-back champion" },
    ],
  },
  {
    name: "Commercial & explainer",
    tag: "Client · Mona Media",
    items: [
      { yt: "BWeBzuIDSRk", cat: "Commercial", title: "Shadow Funnel · Bán hàng tự động", meta: "Commercial explainer · Mona Media" },
      { yt: "3xfFHWMzung", cat: "Explainer", title: "Explainer trên iPad", meta: "Product demo · Mona Media · EdTech client" },
    ],
  },
  {
    name: "Communication campaigns",
    items: [
      { yt: "1cJGz4wwduA", badge: "Top 20", cat: "Social", title: "Let's On Air · Sống Thay Xô Bồ", meta: "Social campaign · S Communications · 2023" },
      { add: true, cat: "Campaign", title: "Campaign film", meta: "To be added" },
    ],
  },
  {
    name: "Music videos",
    tag: "L.O.M Music Club",
    items: [
      { soon: true, cat: "Theme", title: "ISB Be Yourself · Theme Song 2023", meta: "Official theme · L.O.M Music Club · 800+ participants" },
      { soon: true, cat: "MV", title: "Remake · Chìm Sâu", meta: "Music video · L.O.M Music Club · 2023" },
    ],
  },
  {
    name: "Events",
    tag: "S Communications",
    items: [
      { soon: true, cat: "Event film", title: "Tết Tròn Tết Vuông 2023", meta: "Tết event film · S Communications" },
      { soon: true, cat: "Teaser", title: "DATH2023 · Nét Đẹp Từ Nghệ Thuật", meta: "Event teaser · arts festival · S Communications" },
    ],
  },
  {
    name: "Short reels & podcast",
    items: [
      { add: true, cat: "Short-form", title: "Short-form reel", meta: "To be added" },
      { add: true, cat: "Podcast", title: "Podcast episode", meta: "To be added" },
    ],
  },
];

function FeatureCard({ v, onOpen }: { v: Play; onOpen: (yt: string, title: string) => void }) {
  return (
    <button
      onClick={() => onOpen(v.yt, v.title)}
      className="group relative block w-full overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised text-left"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${v.yt}/maxresdefault.jpg`}
          alt={v.title}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-45% to-black/85" />
      {v.badge && (
        <span className="absolute left-4 top-4 z-[2] rounded-md bg-forest px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-ink">
          {v.badge}
        </span>
      )}
      <span className="absolute right-4 top-4 z-[2] rounded-md bg-black/55 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-forest backdrop-blur-sm">
        {v.cat}
      </span>
      <span className="absolute left-1/2 top-1/2 z-[2] flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-cream/85 pl-1 text-cream transition-colors group-hover:border-forest group-hover:text-forest">
        ▶
      </span>
      <div className="absolute inset-x-5 bottom-5 z-[2]">
        <div className="text-[1.35rem] font-semibold leading-tight text-cream">{v.title}</div>
        <div className="mt-1.5 font-mono text-[0.62rem] text-sand">{v.meta}</div>
      </div>
    </button>
  );
}

function CardInner({ item }: { item: Item }) {
  const playable = Boolean(item.yt);
  const dim = item.soon || item.add;
  return (
    <>
      <div className="relative aspect-video overflow-hidden">
        {playable ? (
          <img
            src={`https://img.youtube.com/vi/${item.yt}/maxresdefault.jpg`}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(90deg,#141813,#141813_16px,#171c14_16px,#171c14_20px)]">
            <span className="font-serif-jp text-[1.7rem] text-sand/50">{item.add ? "＋" : "映"}</span>
          </div>
        )}
        {playable && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/80" />
            <span className="absolute left-1/2 top-1/2 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/80 pl-0.5 text-[0.7rem] text-cream transition-colors group-hover:border-forest group-hover:text-forest">
              ▶
            </span>
          </>
        )}
        {item.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-forest px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.06em] text-ink">
            {item.badge}
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-[5px] bg-black/55 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.06em] text-forest backdrop-blur-sm">
          {item.cat}
        </span>
        {dim && (
          <span className="absolute bottom-2.5 left-2.5 rounded-[5px] border border-rule bg-black/40 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.05em] text-sand">
            {item.add ? "To be added" : "Link coming soon"}
          </span>
        )}
      </div>
      <div className="px-4 py-3.5">
        <div className={`text-[1rem] font-semibold leading-snug ${dim ? "text-sand" : "text-cream"}`}>{item.title}</div>
        <div className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.04em] text-sand">{item.meta}</div>
      </div>
    </>
  );
}

// Only the playable card uses scroll-tilt, and it attaches the ref to a native
// element — required by framer useScroll (avoids "target ref not hydrated").
function PlayableCard({ item, onOpen }: { item: Item; onOpen: (yt: string, title: string) => void }) {
  const tilt = useScrollTilt<HTMLDivElement>(3);
  return (
    <motion.div
      ref={tilt.ref}
      style={tilt.style}
      onClick={() => onOpen(item.yt!, item.title)}
      className="group block cursor-pointer overflow-hidden rounded-[12px] border border-panel-border bg-ink-raised transition-colors hover:border-forest/50"
    >
      <CardInner item={item} />
    </motion.div>
  );
}

function CatalogueCard({ item, onOpen }: { item: Item; onOpen: (yt: string, title: string) => void }) {
  if (item.yt) return <PlayableCard item={item} onOpen={onOpen} />;
  return (
    <div className={`group overflow-hidden rounded-[12px] border bg-ink-raised/40 ${item.add ? "border-dashed border-panel-border" : "border-panel-border"}`}>
      <CardInner item={item} />
    </div>
  );
}

export function VideoReel() {
  const [active, setActive] = useState<{ yt: string; title: string } | null>(null);
  const open = (yt: string, title: string) => setActive({ yt, title });

  return (
    <section id="work" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.6vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-cream">
              Selected <span className="text-forest">films</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            Showreel
            <br />
            Drag · click to play
          </div>
        </div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-8 max-w-[60ch] text-[1.05rem] font-light leading-[1.7] text-tan">
          The playable pieces — drag to browse, click the framed film to watch. The rest of the catalogue is organised by format below.
        </motion.p>
      </div>

      <div className="mx-auto max-w-[1500px]">
        <Coverflow items={PLAYABLE.map((v) => <FeatureCard key={v.yt} v={v} onOpen={open} />)} />
      </div>

      <div className="mx-auto mt-[clamp(3.5rem,7vw,6rem)] max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h3 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.06] tracking-[-0.03em] text-cream">
              The full catalogue, <span className="text-forest">by format</span>
            </h3>
          </Reveal>
          <div className="text-right font-mono text-[0.62rem] uppercase leading-[1.7] tracking-[0.12em] text-sand">
            7 formats
            <br />
            More linking soon
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {CATEGORIES.map((c) => (
            <div key={c.name}>
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="mb-5 flex flex-wrap items-center gap-4">
                <span className="text-[1.2rem] font-semibold text-cream">{c.name}</span>
                {c.tag && (
                  <span className="rounded-[6px] border border-rule px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-forest">{c.tag}</span>
                )}
                <span className="h-px flex-1 bg-gradient-to-r from-rule to-transparent" />
              </motion.div>
              <motion.div
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 gap-5 [perspective:1600px] sm:grid-cols-2"
              >
                {c.items.map((item, i) => (
                  <motion.div key={item.title + i} variants={fadeUp}>
                    <CatalogueCard item={item} onOpen={open} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <VideoLightbox videoId={active?.yt ?? null} title={active?.title} onClose={() => setActive(null)} />
    </section>
  );
}
