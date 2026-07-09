import type { Metadata } from "next";
import { SceneBackdrop } from "@/components/SceneBackdrop";
import { VideoHero } from "@/components/video/VideoHero";
import { TvcStage } from "@/components/video/sections/TvcStage";
import { ProjectTvcIndex } from "@/components/video/sections/ProjectTvcIndex";
import { CommercialFrames } from "@/components/video/sections/CommercialFrames";
import { CampaignFan } from "@/components/video/sections/CampaignFan";
import { MusicWall } from "@/components/video/sections/MusicWall";
import { EventsTimeline } from "@/components/video/sections/EventsTimeline";
import { ReelsStrip } from "@/components/video/sections/ReelsStrip";
import { VideoNavRail } from "@/components/video/VideoNavRail";
import { VideoContact } from "@/components/video/VideoContact";
import { VelocityMarquee } from "@/components/VelocityMarquee";
import { Footer } from "@/components/Footer";
import { SECTIONS } from "@/lib/videoData";

export const metadata: Metadata = {
  title: "Video Reel · TVCs, brand films, explainers · Pham Ngoc Thanh (Tatsuki)",
  description:
    "Video and brand production reel by format: TVCs, commercial explainers, music videos, events, campaigns. Two-time Top 1 TVC at Business Challenge. Pham Ngoc Thanh (Tatsuki).",
};

const MARQUEE = ["TVC", "Brand films", "Explainers", "Music videos", "Events", "Campaigns", "Podcasts", "Short reels"];

const RAIL = (
  ["tvc", "commercial", "music", "project-tvc", "campaigns", "events", "reels"] as const
).map((k) => ({ id: SECTIONS[k].id, label: SECTIONS[k].label, accent: SECTIONS[k].accent }));

export default function VideoPage() {
  return (
    <>
      <SceneBackdrop variant="video" className="pointer-events-none fixed inset-0 z-0" />
      <VideoNavRail items={RAIL} />
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
      <TvcStage />
      <CommercialFrames />
      <MusicWall />
      <ProjectTvcIndex />
      <CampaignFan />
      <EventsTimeline />
      <ReelsStrip />
      <VideoContact />
      <Footer />
    </>
  );
}
