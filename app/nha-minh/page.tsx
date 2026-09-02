import type { Metadata } from "next";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { NhaMinhHero } from "@/components/nhaminh/NhaMinhHero";
import { NhaMinhContext } from "@/components/nhaminh/NhaMinhContext";
import { NhaMinhVideoTheater } from "@/components/nhaminh/NhaMinhVideoTheater";
import { NhaMinhEmblem3D } from "@/components/nhaminh/NhaMinhEmblem3D";
import { NhaMinhPipeline } from "@/components/nhaminh/NhaMinhPipeline";
import { NhaMinhDualUI } from "@/components/nhaminh/NhaMinhDualUI";
import { NhaMinhAllFeatures } from "@/components/nhaminh/NhaMinhAllFeatures";
import { NhaMinhSafety } from "@/components/nhaminh/NhaMinhSafety";
import { NhaMinhNumbers } from "@/components/nhaminh/NhaMinhNumbers";
import { NhaMinhFooter } from "@/components/nhaminh/NhaMinhFooter";

export const metadata: Metadata = {
  title: "Nhà Mình · AI Family Healthcare Companion · Case Study · Pham Ngoc Thanh",
  description:
    "AI Riser Vietnam 2026 entry: Dual-interface healthcare companion for elderly parents and adult caregivers, featuring Gemini 2.5 Flash Vision OCR, voice assistant 'Cháu Bi', and 5-invariant medical safety guardrails.",
};

export default function NhaMinhPage() {
  return (
    <div className="relative min-h-screen bg-[#FBF9F5] text-slate-900 selection:bg-[#FF6B4B]/20 selection:text-[#FF6B4B]">
      <SceneBackdrop variant="nhaminh" className="pointer-events-none fixed inset-0 z-0" />
      <NhaMinhHero />
      <NhaMinhContext />
      <NhaMinhVideoTheater />
      <NhaMinhEmblem3D />
      <NhaMinhPipeline />
      <NhaMinhDualUI />
      <NhaMinhAllFeatures />
      <NhaMinhSafety />
      <NhaMinhNumbers />
      <NhaMinhFooter />
    </div>
  );
}
