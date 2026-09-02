import { ThemeFlow, FlowGround } from "@/components/ThemeFlow";
import { ShrinkSection } from "@/components/ShrinkSection";
import { HomeNavRail } from "@/components/HomeNavRail";
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
 * The homepage does not have a dark half and a light half. It has one palette that changes
 * state as you read, black to white and back, with the brand green carried through both.
 *
 * Every zone below declares which state it wants; ThemeFlow watches them against a line at 42%
 * of the viewport and interpolates the whole token set on the way over, so headings, rules,
 * panels, buttons and the ground all cross together. The hero additionally withdraws into a
 * rounded card as it leaves, so the first hand off is something the reader watches happen
 * rather than something that has already happened.
 *
 * Light where the work is being proved, dark where it is being shown.
 */
export default function Home() {
  return (
    <>
      {/* outside the flow wrapper on purpose: the ground must not dip with the content, it is
          the thing the dip is hiding the swap against */}
      <FlowGround />
      <HomeNavRail />
      <ThemeFlow initial="dark">
        <ShrinkSection zone="dark">
          <Hero />
        </ShrinkSection>

        <div data-zone="light" className="relative z-[4]">
          <StatStrip />
          <About />
          {/* sits directly before the terra teaser on purpose: it opens on "the growth numbers
            came from software", which only lands next to the numbers themselves */}
          <SystemsStrip />
          <TerraTeaser />
        </div>

        {/* Nha Minh moved down one slot to join the other case studies. It carries its own
          identity, an orange accent on dark, so it reads as one of the shown works rather
          than one of the proved ones. */}
        <div data-zone="dark" className="relative z-[4]">
          <NhaMinhTeaser />
          <AruTeaser />
          <BongTeaser />
        </div>

        <div data-zone="light" className="relative z-[4]">
          <WorkSection />
        </div>

        <div data-zone="dark" className="relative z-[4]">
          <VideoTeaser />
          <Contact />
          <Footer />
        </div>
      </ThemeFlow>
    </>
  );
}
