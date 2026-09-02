import type { Metadata } from "next";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { TerraHero } from "@/components/terra/TerraHero";
import { TerraContext } from "@/components/terra/TerraContext";
import { TerraSystems } from "@/components/terra/TerraSystems";
import { TerraPages } from "@/components/terra/TerraPages";
import { TerraScope } from "@/components/terra/TerraScope";
import { TerraNumbers } from "@/components/terra/TerraNumbers";
import { TerraBroke } from "@/components/terra/TerraBroke";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh",
  description:
    "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale.",
  alternates: { canonical: "/terra" },
  openGraph: { type: "article", url: "/terra", title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh", description: "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale." },
  twitter: { card: "summary_large_image", title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh", description: "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale." },
};

export default function TerraPage() {
  return (
    <>
      <SceneBackdrop variant="terra" className="pointer-events-none fixed inset-0 z-0" />
      <TerraHero />
      <TerraContext />
      <TerraSystems />
      <TerraPages />
      <TerraScope />
      <TerraNumbers />
      <TerraBroke />
      <Footer />
    </>
  );
}
