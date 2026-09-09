import type { Metadata } from "next";
import { AruStory } from "@/components/stories/CreativeStories";
export const metadata: Metadata = {
  title: "ある男 · AI music video · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Case study: a 33-second AI music video about a man worn down by the city's rush. Eleven fixed 5s generations, speed-ramped by hand to make the city move. Nano Banana 2 + Seedance, cut in CapCut. Pham Ngoc Thanh (Tatsuki).",
  alternates: { canonical: "/aru-otoko" },
  openGraph: { type: "article", url: "/aru-otoko", title: "ある男 · AI music video · Pham Ngoc Thanh (Tatsuki)", description: "Case study: a 33-second AI music video about a man worn down by the city's rush. Eleven fixed 5s generations, speed-ramped by hand to make the city move. Nano Banana 2 + Seedance, cut in CapCut. Pham Ngoc Thanh (Tatsuki)." },
  twitter: { card: "summary_large_image", title: "ある男 · AI music video · Pham Ngoc Thanh (Tatsuki)", description: "Case study: a 33-second AI music video about a man worn down by the city's rush. Eleven fixed 5s generations, speed-ramped by hand to make the city move. Nano Banana 2 + Seedance, cut in CapCut. Pham Ngoc Thanh (Tatsuki)." },
};
export default function Page() { return <AruStory />; }
