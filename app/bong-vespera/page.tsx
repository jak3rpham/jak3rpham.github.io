import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { BongHero } from "@/components/bong/BongHero";
import { BongPremise } from "@/components/bong/BongPremise";
import { BongConcept } from "@/components/bong/BongConcept";
import { BongPipeline } from "@/components/bong/BongPipeline";
import { BongKeyframes } from "@/components/bong/BongKeyframes";
import { BongFinal } from "@/components/bong/BongFinal";
import { BongMotion } from "@/components/bong/BongMotion";
import { BongReflection } from "@/components/bong/BongReflection";
import { BongLearnings } from "@/components/bong/BongLearnings";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki).",
  alternates: { canonical: "/bong-vespera" },
  openGraph: { type: "article", url: "/bong-vespera", title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)", description: "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki)." },
  twitter: { card: "summary_large_image", title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)", description: "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki)." },
};

// re-theme the whole page from the site's green accent to an ember dusk. These
// override the @theme tokens for descendants, so every text-forest / border-amber /
// text-tan utility on this page recolours without touching shared components.
const EMBER: CSSProperties = {
  ["--color-forest" as string]: "#e8a24c",
  ["--color-amber" as string]: "#e8a24c",
  ["--color-tan" as string]: "#e6cba2",
  ["--color-sand" as string]: "#b39b78",
  ["--color-clay" as string]: "#8a7659",
};

export default function BongVesperaPage() {
  return (
    <>
      <SceneBackdrop variant="bong" className="pointer-events-none fixed inset-0 z-0" />
      <div style={EMBER}>
        <BongHero />
        <BongPremise />
        <BongConcept />
        <BongPipeline />
        <BongKeyframes />
        <BongFinal />
        <BongMotion />
        <BongReflection />
        <BongLearnings />
        <Footer />
      </div>
    </>
  );
}
