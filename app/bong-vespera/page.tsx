import type { Metadata } from "next";
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
};

export default function BongVesperaPage() {
  return (
    <>
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
    </>
  );
}
