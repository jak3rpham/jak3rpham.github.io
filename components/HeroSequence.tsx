"use client";
import { FrameScrub } from "./FrameScrub";

/**
 * The hand off out of the hero: a scroll scrubbed sequence of the figure at the desk
 * assembling out of particles, generated for this site rather than borrowed from a case study.
 *
 * It sits in the dark run because the artwork is near black. Dropping it into one of the paper
 * bands would put a black rectangle on a light page, which is why the systems sequence is not
 * wired in yet, that section is light.
 *
 * Full resolution frames, 1920 wide. Phones do not fetch them: at that viewport the sequence
 * cannot resolve anyway, so all a phone would get out of the download is the download. They
 * see the poster, which is the same frame.
 */
export function HeroSequence() {
  return (
    <section id="sequence" className="relative z-[4]">
      <FrameScrub
        dir="/images/home/frames/hero"
        count={150}
        fallback="/images/home/hero-still.webp"
        alt="A figure at a desk assembling out of drifting particles, surrounded by fragments of charts, code and interface"
        heightVh={230}
        minWidth={900}
      />
    </section>
  );
}
