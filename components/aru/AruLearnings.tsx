"use client";
import { motion } from "framer-motion";
import { AruSection, Prose } from "./AruSection";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { LEARNINGS } from "@/lib/aruData";

/**
 * Not a bug list, a map of a current AI pipeline's limits, drawn by touching every one of
 * them. The fixed-clip lesson leads; it is the one /bong-vespera (static frame pairs, no
 * temporal dimension) cannot make.
 */
export function AruLearnings() {
  return (
    <AruSection
      id="learnings"
      no="06"
      kicker="the map"
      title="What I"
      accent="learned"
      lede={
        <>
          Not a list of things that went wrong. A map of where this pipeline currently ends,
          drawn the only way it can be, by walking into every edge of it.
        </>
      }
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {LEARNINGS.map((l) => (
          <motion.article
            key={l.k}
            variants={staggerItem}
            className="relative rounded-[4px] border-2 border-[#0C0906] bg-ink/85 p-6"
          >
            <div className="flex items-start gap-4">
              <span className="font-serif-jp text-[2rem] font-bold leading-none text-forest/70">{l.k}</span>
              <div>
                <h3 className="font-display t-lead font-semibold leading-[1.3] tracking-[-0.015em] text-cream">
                  {l.title}
                </h3>
                <p className="mt-2.5 t-body font-light leading-[1.75] text-tan">{l.body}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="mt-12 pt-4"
      >
        <Prose className="max-w-[70ch]">
        <p className="t-lead font-light leading-[1.8] text-tan">
          The video is a prototype and stops where the credits stopped, it is not a finished
          piece and is not offered as one.{" "}
          <span className="text-cream">
            What it proves is that I can take a fixed musical constraint, work out which layer
            of an AI pipeline can and cannot honour it, and route around the ones that cannot.
          </span>{" "}
          The models will change. The routing is the skill.
        </p>
        </Prose>
      </motion.div>
    </AruSection>
  );
}
