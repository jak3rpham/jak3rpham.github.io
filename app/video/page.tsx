import type { Metadata } from "next";
import { VideoStory } from "@/components/stories/CreativeStories";
export const metadata: Metadata = {
  title: "Video Reel · TVCs, brand films, explainers · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Video and brand production reel by format: TVCs, commercial explainers, music videos, events, campaigns. Two-time Top 1 TVC at Business Challenge. Pham Ngoc Thanh (Tatsuki).",
  alternates: { canonical: "/video" },
  openGraph: { type: "article", url: "/video", title: "Video Reel · TVCs, brand films, explainers · Pham Ngoc Thanh (Tatsuki)", description: "Video and brand production reel by format: TVCs, commercial explainers, music videos, events, campaigns. Two-time Top 1 TVC at Business Challenge. Pham Ngoc Thanh (Tatsuki)." },
  twitter: { card: "summary_large_image", title: "Video Reel · TVCs, brand films, explainers · Pham Ngoc Thanh (Tatsuki)", description: "Video and brand production reel by format: TVCs, commercial explainers, music videos, events, campaigns. Two-time Top 1 TVC at Business Challenge. Pham Ngoc Thanh (Tatsuki)." },
};
export default function Page() { return <VideoStory />; }
