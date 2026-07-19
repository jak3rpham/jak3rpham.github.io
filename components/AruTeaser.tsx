"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { Cta } from "./Cta";
import { fadeUp } from "@/lib/motion";
import { SOURCES, TRACK, YT, totalGenerated } from "@/lib/aruData";
import { beginVideoPlayback, endVideoPlayback } from "@/lib/videoPlayback";

/**
 * Homepage case-study teaser, built to pull the click. The feature reads as a real video: the
 * horizontal MV poster with a big play button that plays the film inline in place (thumbnail-first,
 * YouTube loads only on click). A distinct "Full case study" CTA carries the reader to the writeup,
 * so both jobs are covered: watch it here, or read how it was made. Filmstrip + stats beside it.
 */
const POSTER = "/images/aru-otoko/poster/poster-horizontal.webp";
const still = (id: string) => SOURCES.find((s) => s.id === id)?.still ?? "";
const STRIP = ["s08", "s01", "s07", "s09"].map(still);

const STATS: [string, string][] = [
  [`${SOURCES.length}`, "AI clips"],
  [`${TRACK.seconds}s`, "Final cut"],
  [`${TRACK.bpm}`, "BPM"],
  [`${totalGenerated()}s`, "Generated"],
];

function FeatureVideo() {
  const [playing, setPlaying] = useState(false);

  // pause the fixed backdrop shader while the film decodes, same as the case-study player
  useEffect(() => {
    if (!playing) return;
    beginVideoPlayback();
    return endVideoPlayback;
  }, [playing]);

  if (playing && YT.hero) {
    return (
      <div className="native-cursor h-full overflow-hidden rounded-[10px] border border-panel-border bg-black">
        <iframe
          className="block aspect-video w-full lg:h-full"
          src={`https://www.youtube.com/embed/${YT.hero}?autoplay=1`}
          title="ある男, AI music video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label="Play ある男, the music video"
      className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-[10px] border border-panel-border text-left"
    >
      <div className="relative aspect-video w-full lg:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER}
          alt="ある男, the music video"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

        <span className="absolute left-5 top-5 rounded-full bg-ink/70 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
          Final cut · 33s · watch here
        </span>

        {/* play affordance: this is a video, not a static image */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cream/80 bg-ink/45 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <span className="ml-1 block h-0 w-0 border-y-[11px] border-l-[17px] border-y-transparent border-l-cream" />
          </span>
        </span>

        <div className="absolute inset-x-6 bottom-6">
          <p className="font-display text-[clamp(1.4rem,2.4vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.02em] text-cream">
            Eleven generations, one man, a burning city.
          </p>
        </div>
      </div>
    </button>
  );
}

export function AruTeaser() {
  return (
    <section id="aru" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-forest">
            Case study · AI music video
          </p>
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.035em] text-cream">
              <span className="font-serif-jp">ある男</span>, a man the city{" "}
              <span className="text-forest">won&rsquo;t slow for</span>
            </h2>
          </Reveal>
          <p className="mt-5 max-w-[60ch] text-[clamp(1.1rem,1.5vw,1.3rem)] font-light leading-[1.7] text-tan">
            A 33-second music video, directed and edited end to end from eleven AI generations. The
            model only makes calm 5-second clips; the rush of the city is built by hand.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-stretch">
          {/* feature: the horizontal poster, plays the film inline */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
            <FeatureVideo />
          </motion.div>

          {/* side: filmstrip + stats + tags + CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="grid grid-cols-2 gap-2">
              {STRIP.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-[4px] border border-panel-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="block aspect-[1376/768] w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-4 border-y border-rule">
              {STATS.map(([n, l], i) => (
                <div key={l} className={`px-1 py-4 text-center ${i < STATS.length - 1 ? "border-r border-rule" : ""}`}>
                  <div className="font-display text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-cream">{n}</div>
                  <div className="mt-1.5 font-mono text-[0.5rem] uppercase tracking-[0.06em] text-sand">{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["AI Direction", "Music Video", "Solo Build"].map((p) => (
                <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-sand">
                  {p}
                </span>
              ))}
            </div>

            <Cta href="/aru-otoko" className="mt-auto">Full case study</Cta>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
