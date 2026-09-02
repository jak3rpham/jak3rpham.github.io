import { SceneBackdrop } from "@/components/SceneBackdrop";
import { HomeNavRail } from "@/components/HomeNavRail";
import { ThemeBand } from "@/components/ThemeBand";
import { Hero } from "@/components/Hero";
import { StatStrip } from "@/components/StatStrip";
import { About } from "@/components/About";
import { NhaMinhTeaser } from "@/components/NhaMinhTeaser";
import { SystemsStrip } from "@/components/SystemsStrip";
import { TerraTeaser } from "@/components/TerraTeaser";
import { BongTeaser } from "@/components/BongTeaser";
import { AruTeaser } from "@/components/AruTeaser";
import { WorkSection } from "@/components/WorkSection";
import { VideoTeaser } from "@/components/VideoTeaser";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

/**
 * The page alternates between ink and paper, in five bands:
 *
 *   dark   hero
 *   light  the claim and the evidence for it — stats, the four lanes, the tooling, terra
 *   dark   the case studies, each of which carries its own theme
 *   light  the shipped products
 *   dark   films, contact, footer
 *
 * Light where the work is being proved, dark where it is being shown. The product
 * screenshots are light UIs, and on ink they floated as glowing rectangles instead of
 * sitting in the page; that is what the light bands are for.
 */
export default function Home() {
  return (
    <>
      {/* one continuous 3D world behind every section (fixed to the viewport) */}
      <SceneBackdrop className="pointer-events-none fixed inset-0 z-0" />
      <HomeNavRail />

      <Hero />

      <ThemeBand>
        <StatStrip />
        <About />
        {/* sits directly before the terra teaser on purpose: it opens on "the growth numbers
            came from software", which only lands next to the numbers themselves */}
        <SystemsStrip />
        <TerraTeaser />
      </ThemeBand>

      {/* Nhà Mình moved down one slot to join the other case studies. It has its own identity
          — an orange accent, glows, dark glass — so it belongs in the dark run rather than
          being rewritten to sit on paper. */}
      <NhaMinhTeaser />
      <AruTeaser />
      <BongTeaser />

      <ThemeBand>
        <WorkSection />
      </ThemeBand>

      <VideoTeaser />
      <Contact />
      <Footer />
    </>
  );
}
