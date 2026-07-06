import type { Metadata } from "next";
import { VideoHero } from "@/components/video/VideoHero";
import { VideoReel } from "@/components/video/VideoReel";
import { VideoContact } from "@/components/video/VideoContact";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Video Reel · TVCs, brand films, explainers · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Video and brand production reel by format: TVCs, commercial explainers, music videos, events, campaigns. Two-time Top 1 TVC at Business Challenge. Pham Ngoc Thanh (Tatsuki).",
};

const MARQUEE = ["TVC", "Brand films", "Explainers", "Music videos", "Events", "Campaigns", "Podcasts", "Short reels"];

export default function VideoPage() {
  return (
    <>
      <VideoHero />
      <div className="relative z-[4] border-y border-rule bg-ink-raised/40 py-4">
        <VelocityMarquee baseVelocity={3}>
          <span className="flex items-center font-display text-[clamp(1.4rem,3vw,2.4rem)] font-bold text-cream/80">
            {MARQUEE.map((w) => (
              <span key={w} className="flex items-center">
                <span className="px-6">{w}</span>
                <span className="text-forest">◆</span>
              </span>
            ))}
          </span>
        </VelocityMarquee>
      </div>
      <VideoReel />
      <VideoContact />
      <Footer />
    </>
  );
}
