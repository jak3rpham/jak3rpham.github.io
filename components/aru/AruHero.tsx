"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Halftone } from "../Halftone";
import { AruVideo } from "./AruVideo";
import { Prose } from "./AruSection";
import { fadeUp } from "@/lib/motion";
import { POSTER, TRACK, YT, SOURCES, totalGenerated } from "@/lib/aruData";

const STATS = [
  { k: "Track", v: `${TRACK.seconds}s · ${TRACK.bpm} BPM` },
  { k: "Sources", v: `${SOURCES.length} clips` },
  { k: "Generated", v: `${totalGenerated()}s` },
];

export function AruHero() {
  return (
    <header className="relative z-[4] overflow-hidden px-[var(--pad)] pb-[clamp(3rem,6vw,5rem)] pt-[clamp(7rem,13vw,10rem)]">
      <Halftone size={6} opacity={0.2} angle={15} mask="radial-gradient(ellipse 60% 70% at 20% 40%, #000 5%, transparent 70%)" />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end">
          <div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-5 inline-flex items-stretch"
            >
              <span className="bg-forest px-2.5 py-1 font-mono text-[0.62rem] font-medium leading-none tracking-[0.1em] text-ink">
                CASE STUDY
              </span>
              <span className="border-y-2 border-r-2 border-[#0C0906] bg-panel px-2.5 py-1 font-mono text-[0.62rem] uppercase leading-none tracking-[0.14em] text-sand">
                AI music video · prototype
              </span>
            </motion.div>

            <Reveal>
              <h1 className="font-serif-jp text-[clamp(3.6rem,9vw,6.5rem)] font-black leading-[0.98] tracking-[0.02em] text-cream">
                ある男
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-forest">
                Aru Otoko · a man
              </p>
            </Reveal>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.25 }}
              className="mt-7 max-w-[46ch] font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.25] tracking-[-0.02em] text-cream"
            >
              A man, worn down by the city&rsquo;s indifferent rush.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
              className="mt-4"
            >
              <Prose className="max-w-[54ch]">
                <p className="text-[1.04rem] font-light leading-[1.75] text-tan">
                  A 33-second music video for the song, made from eleven AI generations. The city
                  never slows for him. That rush is not generated; it is speed-ramped in by hand,
                  clip by clip. This is an account of building it.
                </p>
              </Prose>
            </motion.div>

            <motion.dl
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45 }}
              className="mt-9 flex flex-wrap gap-x-9 gap-y-4 border-t border-rule pt-6"
            >
              {STATS.map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-clay">{s.k}</dt>
                  <dd className="mt-1 font-mono text-[0.95rem] text-cream">{s.v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <AruVideo
              id={YT.hero}
              label="Final cut · 16:9"
              title="ある男, AI music video"
              poster={POSTER.horizontal}
              inline
            />
            <p className="mt-3 font-mono text-[0.58rem] leading-[1.8] tracking-[0.04em] text-clay">
              AI-directed and orchestrated end to end · not a commissioned production
            </p>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
