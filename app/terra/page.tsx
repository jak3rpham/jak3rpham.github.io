import type { Metadata } from "next";
import { TerraStory } from "@/components/stories/ProductStories";
export const metadata: Metadata = {
  title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh",
  description:
    "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale.",
  alternates: { canonical: "/terra" },
  openGraph: { type: "article", url: "/terra", title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh", description: "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale." },
  twitter: { card: "summary_large_image", title: "terra-plat.vn case study · 12× organic growth · Pham Ngoc Thanh", description: "Featured case study: 12× organic growth for a B2B payroll & HR SaaS (terra-plat.vn), plus the custom WordPress tooling, data pipelines, and technical SEO that made it scale." },
};
export default function Page() { return <TerraStory />; }
