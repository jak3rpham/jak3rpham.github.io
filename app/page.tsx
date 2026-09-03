import { ThemeFlow, FlowGround } from "@/components/ThemeFlow";
import { HeroStage } from "@/components/HeroStage";
import { SequenceSpan } from "@/components/SequenceSpan";
import { HomeNavRail } from "@/components/HomeNavRail";
import { Hero } from "@/components/Hero";
import { StatColumn } from "@/components/StatColumn";
import { AboutPanel } from "@/components/About";
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
 * The homepage has one palette that changes state as you read, and the point of the rewrite
 * below is that it now does so FOUR times instead of seven. The old order alternated on nearly
 * every section, which turned a device into a tic; each run here is long enough that the change
 * reads as a chapter break.
 *
 *   light   hero, about              who he is
 *   dark    systems, terra           the growth work, and the tooling under it
 *   light   nha minh, selected builds the product work
 *   dark    aru, bong, video, close   the film work
 *
 * Aru and Bong moved down to sit with the video reel. They were between terra and the builds,
 * which forced either a fifth and sixth crossover or two film pieces printed on paper. They are
 * both music video work and the reel follows them, so the run they are in now is the one they
 * belonged to; this is the only place the reading order was changed rather than the colour.
 *
 * The page opens on PAPER and stays there through the whole opening. The dark thing is the hero
 * container, laid on top of it, so the frame closing on the portrait uncovers light that was
 * always behind rather than a state change timed to happen; the site chrome adapts on its own
 * while the container is under it. See components/HeroStage.tsx.
 *
 * There were transition bands between the runs for a while, empty screens carrying a gradient so
 * the swap could land with no copy on screen. They worked and they cost a screenful of scrolling
 * each, and they are gone.
 *
 * Neither generated sequence is the background of a single section. Each is pinned behind a RUN
 * of them by SequenceSpan, so the artwork holds still and keeps drawing while the sections move
 * over it, and fades out once it is spent. On paper the layer inverts rather than dying at the
 * boundary, which is what lets the hero sequence work at all now that the hero is on paper.
 */
export default function Home() {
  return (
    <>
      {/* outside the flow wrapper on purpose: the ground must not dip with the content, it is
          the thing the dip is hiding the swap against */}
      <FlowGround />
      <HomeNavRail />
      <ThemeFlow initial="light">
        {/* The opening is one pinned screen, not a section that scrolls past. The artwork holds
            still and keeps drawing; the hero's frame closes in on the portrait, drifts to the
            right of centre, and the whole About panel arrives from the left into the room that
            leaves while the numbers arrive from the right. About is no longer a section of its
            own; the opening carries the claim and its proof together, which is a screen and a
            half off the page. See components/HeroStage.tsx for the choreography. */}
        <SequenceSpan
          dir="/images/home/frames/hero"
          count={150}
          poster="/images/home/hero-still.webp"
          opacity={0.85}
          lightOpacity={0.5}
          playEnd={0.9}
          fadeIn={0.03}
          fadeOut={0.74}
        >
          <HeroStage zone="light" lead={<AboutPanel />} aside={<StatColumn />}>
            <Hero />
          </HeroStage>
        </SequenceSpan>

        {/* The diagram is the ground for systems AND the terra teaser under it, drawing itself
            out across both rather than finishing inside one.

            It used to start part way through About so that it could lead the "// systems" label
            in. About is inside the pinned opening now, so there is no longer a section above
            this run to lead it from, and the layer comes up with the run itself: full strength
            4% in, which is while the section is still arriving and before the label has reached
            reading height. If a longer lead is wanted back, it needs a section above it inside
            this span, not a smaller number.

            Fractions are of the run's traversal and are tuned against measured heights. */}
        <SequenceSpan
          dir="/images/home/frames/systems"
          count={150}
          poster="/images/home/systems-still.webp"
          opacity={0.5}
          lightOpacity={0.34}
          playEnd={0.95}
          fadeIn={0.04}
          fadeOut={0.8}
        >
          {/* Systems and terra are one dark run: the tooling and the growth it produced are the
              same argument, and splitting them was a crossover spent on nothing. */}
          <div data-zone="dark" className="relative z-[4]">
            <SystemsStrip />
          </div>

          <div data-zone="dark" className="relative z-[4]">
            <TerraTeaser />
          </div>
        </SequenceSpan>

        {/* The product run. Nha Minh is an app and the builds are apps, so they are proved on
            paper together. */}
        <div data-zone="light" className="relative z-[4]">
          <NhaMinhTeaser />
          <WorkSection />
        </div>

        {/* The film run, and the close. */}
        <div data-zone="dark" className="relative z-[4]">
          <AruTeaser />
          <BongTeaser />
          <VideoTeaser />
          <Contact />
          <Footer />
        </div>
      </ThemeFlow>
    </>
  );
}
