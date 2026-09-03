"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AruSection, Prose } from "./AruSection";
import { Halftone } from "../Halftone";
import { fadeUp } from "@/lib/motion";
import { POSTER, REELS_IG } from "@/lib/aruData";
import { beginVideoPlayback, endVideoPlayback } from "@/lib/videoPlayback";

/**
 * The only first-person evidence on the page, and the only part a reader cannot get from the
 * artifacts. The reel lives on Instagram, so rather than drop IG's white embed card onto a
 * dark page, this is a dark on-theme poster that opens the reel in a lightbox on click.
 */
const embedSrc = `${REELS_IG.permalink.replace(/\/?$/, "/")}embed/`;

export function AruReels() {
  const [open, setOpen] = useState(false);

  // pause the backdrop while the reel lightbox is open (backdrop is hidden behind it anyway)
  useEffect(() => {
    if (!open) return;
    beginVideoPlayback();
    return endVideoPlayback;
  }, [open]);

  return (
    <div className="relative overflow-x-clip">
      <Halftone
        size={5}
        opacity={0.26}
        angle={75}
        mask="radial-gradient(ellipse 60% 55% at 70% 50%, #000 5%, transparent 72%)"
      />
      <AruSection
        id="reels"
        no="05"
        kicker="behind it"
        title="Talking through"
        accent="the build"
        lede="The part that does not fit in a caption: what got routed where, what broke, and what I did about it, in my own words at the canvas."
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:items-center"
        >
          <div>
            <button
              onClick={() => setOpen(true)}
              className="group relative block w-full overflow-hidden rounded-[6px] border-2 border-[#0C0906]"
              aria-label="Play the process reel"
            >
              <div className="relative aspect-[9/16] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={POSTER.vertical}
                  alt="Process reel"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cream/80 bg-ink/50 transition-transform duration-300 group-hover:scale-110">
                    <span className="ml-1 block h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-cream" />
                  </span>
                  <span className="font-mono t-micro uppercase tracking-[0.16em] text-cream">
                    Process reel
                  </span>
                </div>
                <span className="absolute bottom-2 left-0 right-0 text-center font-mono t-micro tracking-[0.08em] text-tan">
                  Instagram · {REELS_IG.handle}
                </span>
              </div>
            </button>
          </div>
          <Prose className="space-y-4">
            <p className="max-w-[54ch] t-body font-light leading-[1.78] text-tan">
              Everything else on this page is an artifact: a still, a prompt, a timeline. This is
              the reasoning that produced them, which is the part that actually transfers to the
              next project.
            </p>
            <p className="max-w-[54ch] t-body font-light leading-[1.78] text-tan">
              The tools will be obsolete within a year.{" "}
              <span className="text-cream">Knowing which layer a problem belongs to will not be.</span>
            </p>
          </Prose>
        </motion.div>
      </AruSection>

      {open ? (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 font-mono t-micro uppercase tracking-[0.14em] text-cream hover:text-forest"
          >
            ✕ close
          </button>
          <div
            className="w-full max-w-[400px] overflow-hidden rounded-[6px]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={embedSrc}
              title="ある男 process reel"
              className="h-[min(80vh,720px)] w-full border-0 bg-black"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
