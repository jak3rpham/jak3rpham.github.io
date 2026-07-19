import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { AruHero } from "@/components/aru/AruHero";
import { AruWalk } from "@/components/aru/AruWalk";
import { AruPanels } from "@/components/aru/AruPanels";
import { AruPipeline } from "@/components/aru/AruPipeline";
import { AruVertical } from "@/components/aru/AruVertical";
import { AruReels } from "@/components/aru/AruReels";
import { AruLearnings } from "@/components/aru/AruLearnings";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ある男 · AI music video · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Case study: a 33-second AI music video about a man worn down by the city's rush. Eleven fixed 5s generations, speed-ramped by hand to make the city move. Nano Banana 2 + Seedance, cut in CapCut. Pham Ngoc Thanh (Tatsuki).",
};

/**
 * Re-themes the page from the site's green accent to warm amber. These override the
 * @theme tokens for descendants, so every text-forest / border-amber / text-tan
 * utility recolours here without touching shared components, the same trick
 * /bong-vespera uses.
 */
const AMBER: CSSProperties = {
  ["--color-forest" as string]: "#F0B571",
  ["--color-amber" as string]: "#F0B571",
  ["--color-cream" as string]: "#F5F0E8",
  ["--color-tan" as string]: "#D8CDBB",
  // sand + clay lifted well up: the old browns (#8A7D6B / #61574A) vanished into the
  // halftone city. Meta/caption text has to clear the backdrop, so the greys start bright.
  ["--color-sand" as string]: "#C3B7A2",
  ["--color-clay" as string]: "#A99B85",
  ["--color-ink" as string]: "#17130F",
  ["--color-panel" as string]: "rgba(24, 19, 15, 0.86)",
  ["--color-panel-border" as string]: "rgba(237, 230, 219, 0.18)",
  ["--color-rule" as string]: "rgba(237, 230, 219, 0.16)",
};

export default function AruOtokoPage() {
  return (
    <>
      <SceneBackdrop variant="aru" className="pointer-events-none fixed inset-0 z-0" />
      {/* readability scrim: keeps the city visible but stops text floating on full-bright halftone */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-ink/55" />
      <div style={AMBER} className="relative">
        <AruHero />
        <AruWalk />
        <AruPanels />
        <AruPipeline />
        <AruVertical />
        <AruReels />
        <AruLearnings />
        <Footer />
      </div>
    </>
  );
}
