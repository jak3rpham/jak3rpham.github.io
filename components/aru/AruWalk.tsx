"use client";
import { SceneBackdrop } from "../SceneBackdrop";
import { MultiScrub, type ScrubLayer } from "../MultiScrub";
import { Halftone } from "../Halftone";
import { Reveal } from "../Reveal";
import { Prose } from "./AruSection";

import { ASSET_S00 } from "@/lib/aruData";

/**
 * The one set piece, now layered. Scroll drives the walk plus three companion clips floated
 * around it, all scrubbing on the same scroll so the whole frame moves at once.
 *
 * The hero (S00) is full-res and loads everywhere. The three companions are lighter (50
 * frames, 560px) and gated to md+ via `minWidth` and `hidden md:block`, so a phone only ever
 * loads and shows the walk. Module-level const keeps the layer array identity stable.
 */
const F = "/images/aru-otoko/frames";
const S = "/images/aru-otoko/stills";

const LAYERS: ScrubLayer[] = [
  {
    dir: `${F}/s00`,
    count: ASSET_S00.frameCount,
    fallback: `${S}/s00-walk.webp`,
    alt: "A man walking on wet asphalt under amber streetlight, knee-down crop",
    wrapClass:
      "absolute left-1/2 top-1/2 z-20 w-[88%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 md:w-[46%] md:max-w-[620px]",
  },
  {
    dir: `${F}/s01`,
    count: 50,
    fallback: `${S}/s01-back.webp`,
    alt: "Back view, walking away down a dusk street",
    minWidth: 768,
    wrapClass: "absolute left-0 top-[6%] z-10 hidden w-[27%] max-w-[300px] md:block lg:left-[2%]",
  },
  {
    dir: `${F}/s09`,
    count: 50,
    fallback: `${S}/s09-profile.webp`,
    alt: "Side profile, tracked alongside the walk",
    minWidth: 768,
    wrapClass: "absolute right-0 top-[19%] z-30 hidden w-[25%] max-w-[280px] md:block lg:right-[3%]",
  },
  {
    dir: `${F}/s03`,
    count: 50,
    fallback: `${S}/s03-crossing.webp`,
    alt: "Legs crossing a wet road as headlights approach",
    minWidth: 768,
    wrapClass: "absolute bottom-[7%] left-[7%] z-10 hidden w-[23%] max-w-[260px] md:block",
  },
];

export function AruWalk({ compact = false }: { compact?: boolean }) {
  return (
    <section id="walk" className="relative z-[4] isolate overflow-clip"><div className="pointer-events-none absolute inset-0 -z-10"><SceneBackdrop variant="aru" className="sticky top-0 h-screen w-full" /></div>
      <div className="relative overflow-x-clip px-[var(--pad)] pt-[clamp(3rem,7vw,6rem)]">
        <Halftone
          size={4}
          opacity={0.3}
          angle={45}
          mask="radial-gradient(ellipse 50% 60% at 50% 100%, #000 5%, transparent 75%)"
        />
        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-4 inline-flex items-stretch">
            <span className="bg-forest px-2.5 py-1 font-mono t-micro font-medium leading-none tracking-[0.1em] text-ink">
              01
            </span>
            <span className="border-y-2 border-r-2 border-[#0C0906] bg-panel px-2.5 py-1 font-mono t-micro uppercase leading-none tracking-[0.14em] text-sand">
              {ASSET_S00.label} · the asset
            </span>
          </div>
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-[clamp(2.2rem,5vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Scroll, and he <span className="text-forest">walks.</span>
            </h2>
          </Reveal>
          <p className="mt-5 text-tan">Set the pace. Let the city move around him.</p>
        </div>
      </div>

      <MultiScrub layers={LAYERS} heightVh={compact ? 160 : 320} heightVhMobile={compact ? 115 : 130} className="mt-[clamp(2rem,5vw,4rem)]" />

    </section>
  );
}

