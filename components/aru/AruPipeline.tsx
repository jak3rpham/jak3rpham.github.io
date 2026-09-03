"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AruSection, Panel, Prose } from "./AruSection";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { PIPELINE, TIMESPAN, TOOLING } from "@/lib/aruData";

/**
 * Deliberately short, and deliberately not first.
 *
 * The handover pitched this as the headline. It is not: "one person routes a brief
 * across several models" is the argument /bong-vespera already makes, and repeating it
 * here would dilute that page rather than add a second proof. Here it is supporting
 * evidence for how the timing got imposed, nothing more. No node graph either; that
 * is bóng's visual language.
 */
export function AruPipeline() {
  const [zoom, setZoom] = useState(false);

  return (
    <AruSection
      id="pipeline"
      no="03"
      kicker="the chain"
      title="How it was"
      accent="assembled"
      lede="Six stages, each handing an artifact to the next. Worth noting only because of where the timing enters, which is at the very end, by hand, and nowhere else."
    >
      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="grid gap-3 md:grid-cols-3 lg:grid-cols-6"
      >
        {PIPELINE.map((s, i) => (
          <motion.li key={s.label} variants={staggerItem}>
            <div className="flex h-full flex-col rounded-[4px] border-2 border-[#0C0906] bg-ink/80 p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono t-micro tracking-[0.1em] text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i === PIPELINE.length - 1 ? (
                  <span className="font-mono t-micro uppercase tracking-[0.1em] text-forest">
                    timing enters here
                  </span>
                ) : null}
              </div>
              <p className="font-mono t-label font-medium tracking-[0.08em] text-cream">{s.label}</p>
              <p className="mt-0.5 font-mono t-micro tracking-[0.04em] text-forest">{s.sub}</p>
              <p className="mt-3 t-small font-light leading-[1.65] text-tan">{s.note}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start"
      >
        <button
          onClick={() => setZoom((z) => !z)}
          className="block w-full cursor-zoom-in text-left"
          aria-label="Toggle full-size workflow canvas"
        >
          <Panel>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TOOLING.screenshot}
              alt="The Weavy node canvas: prompt nodes wired into Nano Banana 2 and Seedance, grouped per shot"
              loading="lazy"
              className={`block w-full ${zoom ? "" : "max-h-[520px] object-cover object-top"}`}
            />
            <span className="absolute right-0 top-0 bg-panel px-2 py-1 font-mono t-micro uppercase tracking-[0.1em] text-sand">
              {zoom ? "click to shrink" : "click to expand"}
            </span>
          </Panel>
        </button>

        <Prose>
          <p className="font-mono t-micro uppercase tracking-[0.16em] text-clay">the canvas</p>
          <p className="mt-3 t-body font-light leading-[1.78] text-tan">
            {TOOLING.canvas}. <span className="text-cream">{TOOLING.canvasNote}</span> One
            group per shot, two prompt nodes each, references wired in by hand, a port per
            input, so three reference images means three wires, every time.
          </p>
          <dl className="mt-6 space-y-3 border-t border-rule pt-5">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {TIMESPAN.map((t) => (
                <div key={t.k} title={t.note}>
                  <dt className="font-mono t-micro uppercase tracking-[0.14em] text-clay">{t.k}</dt>
                  <dd className="mt-1 font-display text-[1.35rem] font-semibold leading-none text-cream">
                    {t.v}
                  </dd>
                </div>
              ))}
            </div>
            <p className="t-small font-light leading-[1.65] text-tan">
              Three hours to generate the full source set; two more to cut both the horizontal and
              vertical versions. Fast because the routing was worked out first, not in the edit.
            </p>
            <div>
              <dt className="font-mono t-micro uppercase tracking-[0.14em] text-clay">Spend</dt>
              <dd className="mt-1 font-mono t-label text-cream">{TOOLING.spend}</dd>
            </div>
            <div>
              <dt className="font-mono t-micro uppercase tracking-[0.14em] text-clay">Why it stopped</dt>
              <dd className="mt-1 t-small font-light leading-[1.7] text-tan">
                Credits, not completion. The prototype answered its question before the
                budget ran out, so it was left where it stood.
              </dd>
            </div>
          </dl>
        </Prose>
      </motion.div>
    </AruSection>
  );
}
