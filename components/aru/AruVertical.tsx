"use client";
import { motion } from "framer-motion";
import { AruSection, Prose } from "./AruSection";
import { AruVideo } from "./AruVideo";
import { fadeUp } from "@/lib/motion";
import { POSTER, YT } from "@/lib/aruData";

export function AruVertical() {
  return (
    <AruSection
      id="vertical"
      no="04"
      kicker="the other cut"
      title="Nine by"
      accent="sixteen"
      lede="Same 33 seconds, same speed ramps, recomposed for a phone. Every clip was generated 16:9, so the vertical cut is a reframing job, which is its own argument about what generation does and does not decide."
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:items-center"
      >
        <AruVideo
          id={YT.vertical}
          label="Final cut · 9:16"
          title="ある男, vertical cut"
          poster={POSTER.vertical}
          vertical
          inline
        />
        <Prose className="space-y-4">
          <p className="max-w-[52ch] t-body font-light leading-[1.78] text-tan">
            The 16:9 frame was fixed in the style block and never varied, so nothing here
            was generated vertical. The crop had to find a 9:16 read inside a widescreen
            composition, which works for the tight shots and fights the wide ones.
          </p>
          <p className="max-w-[52ch] t-body font-light leading-[1.78] text-tan">
            <span className="text-cream">The close-up survives the crop; the skyline does not.</span>{" "}
            Framing for two aspect ratios is a decision that belongs at the prompt, before
            anything exists, not at the edit, after everything does.
          </p>
        </Prose>
      </motion.div>
    </AruSection>
  );
}
