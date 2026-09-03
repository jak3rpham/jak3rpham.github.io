import type { Metadata } from "next";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { IeltsHero } from "@/components/ielts/IeltsHero";
import { IeltsWhy } from "@/components/ielts/IeltsWhy";
import { IeltsGrading } from "@/components/ielts/IeltsGrading";
import { IeltsSystem } from "@/components/ielts/IeltsSystem";
import { IeltsLearnings } from "@/components/ielts/IeltsLearnings";
import { Footer } from "@/components/Footer";

const TITLE = "IELTS Studio case study · AI grading on Next.js + Supabase · Pham Ngoc Thanh";
const DESCRIPTION =
  "How IELTS Studio was built: two separate examiner rubrics for Writing Task 1 and 2, an anti-inflation grading prompt, an original item-writer built around exam traps, and a Supabase schema that runs with zero configuration.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ielts-studio" },
  openGraph: { type: "article", url: "/ielts-studio", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function IeltsStudioPage() {
  return (
    <>
      <SceneBackdrop variant="ielts" className="pointer-events-none fixed inset-0 z-0" />
      {/* Dark tint overlay: darkens background and subdues pattern so text is effortlessly readable */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#070907]/80" aria-hidden="true" />
      <IeltsHero />
      <IeltsWhy />
      <IeltsGrading />
      <IeltsSystem />
      <IeltsLearnings />
      <Footer />
    </>
  );
}
