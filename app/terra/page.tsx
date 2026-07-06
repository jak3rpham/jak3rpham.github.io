import type { Metadata } from "next";
import { TerraHero } from "@/components/terra/TerraHero";
import { TerraContext } from "@/components/terra/TerraContext";
import { TerraSystems } from "@/components/terra/TerraSystems";
import { TerraPages } from "@/components/terra/TerraPages";
import { TerraNumbers } from "@/components/terra/TerraNumbers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh",
  description:
    "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale.",
};

export default function TerraPage() {
  return (
    <>
      <TerraHero />
      <TerraContext />
      <TerraSystems />
      <TerraPages />
      <TerraNumbers />
      <Footer />
    </>
  );
}
