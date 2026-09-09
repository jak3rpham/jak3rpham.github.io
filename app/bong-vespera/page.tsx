import type { Metadata } from "next";
import { BongStory } from "@/components/stories/CreativeStories";
export const metadata: Metadata = {
  title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki).",
  alternates: { canonical: "/bong-vespera" },
  openGraph: { type: "article", url: "/bong-vespera", title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)", description: "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki)." },
  twitter: { card: "summary_large_image", title: "BÓNG VESPERA · AI-orchestrated creative pipeline · Pham Ngoc Thanh (Tatsuki)", description: "Case study: an AI-orchestrated creative pipeline. One fictional RPG ad campaign across four AI models in six hours on the free tier. Pham Ngoc Thanh (Tatsuki)." },
};
export default function Page() { return <BongStory />; }
