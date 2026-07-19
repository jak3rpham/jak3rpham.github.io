import { SceneBackdrop } from "@/components/SceneBackdrop";
import { HomeNavRail } from "@/components/HomeNavRail";
import { Hero } from "@/components/Hero";
import { StatStrip } from "@/components/StatStrip";
import { About } from "@/components/About";
import { TerraTeaser } from "@/components/TerraTeaser";
import { BongTeaser } from "@/components/BongTeaser";
import { AruTeaser } from "@/components/AruTeaser";
import { WorkSection } from "@/components/WorkSection";
import { VideoTeaser } from "@/components/VideoTeaser";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* one continuous 3D world behind every section (fixed to the viewport) */}
      <SceneBackdrop className="pointer-events-none fixed inset-0 z-0" />
      <HomeNavRail />
      <Hero />
      <StatStrip />
      <About />
      <TerraTeaser />
      <AruTeaser />
      <BongTeaser />
      <WorkSection />
      <VideoTeaser />
      <Contact />
      <Footer />
    </>
  );
}
