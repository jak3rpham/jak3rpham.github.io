"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AruSection, Panel, Prose } from "./AruSection";
import { AruVideo } from "./AruVideo";
import { fadeUp } from "@/lib/motion";
import {
  GEN_DUR,
  GEN_RES,
  REFERENCES,
  REFERENCE_CREDIT,
  SOURCES,
  STYLE_BLOCK,
  WARDROBE,
  unusedSources,
  type Source,
} from "@/lib/aruData";

/**
 * The eleven generations as a comic page.
 *
 * These are the SOURCES, what the model actually returned, every one 5.04s. The gallery
 * shows the world the man moves through; open a panel for the prompts that made it and the
 * untouched clip it came back as. The two grids (in the cut, and never cut) each expand in
 * their own place: opening scrolls to the detail, closing returns to the panel you clicked.
 */
const used = SOURCES.filter((s) => s.usedInEdit);
const dropped = unusedSources();

export function AruPanels() {
  const [open, setOpen] = useState<string | null>(null);
  const active = SOURCES.find((s) => s.id === open) ?? null;
  const detailRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // opening: bring the freshly expanded detail into view (after it has room to lay out)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 140);
    return () => clearTimeout(t);
  }, [open]);

  const toggle = (id: string) => {
    if (open === id) {
      setOpen(null);
      // closing: go back to the panel that was clicked
      requestAnimationFrame(() =>
        btnRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    } else {
      setOpen(id);
    }
  };

  const detail =
    active ? (
      <motion.div
        ref={detailRef}
        key={active.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden scroll-mt-24"
      >
        <div className="mt-6 rounded-[6px] border-2 border-[#0C0906] bg-ink p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
            <h3 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-cream">
              <span className="text-forest">{active.label}</span> {active.title}
            </h3>
            <button
              onClick={() => toggle(active.id)}
              className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-sand hover:text-cream"
            >
              ✕ close
            </button>
          </div>

          {active.note ? (
            <p className="mb-6 max-w-[70ch] text-[0.98rem] font-light leading-[1.75] text-tan">
              {active.note}
            </p>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              {active.imgPrompt ? (
                <Prompt label="Image prompt" body={active.imgPrompt} />
              ) : (
                <p className="rounded-[4px] border border-rule bg-ink/60 p-3 font-mono text-[0.66rem] leading-[1.85] text-sand">
                  No written prompt on record. This shot emerged in the build rather than from the
                  spec.
                </p>
              )}
              {active.motPrompt ? <Prompt label="Motion prompt" body={active.motPrompt} /> : null}
              {active.imgPrompt ? (
                <>
                  <details className="group">
                    <summary className="cursor-pointer list-none font-mono text-[0.6rem] uppercase tracking-[0.14em] text-clay hover:text-sand">
                      + style block · appended verbatim, never varied
                    </summary>
                    <p className="mt-2 font-mono text-[0.66rem] leading-[1.9] text-sand">{STYLE_BLOCK}</p>
                  </details>
                  {active.id !== "s06" && active.id !== "s08" ? (
                    <details className="group">
                      <summary className="cursor-pointer list-none font-mono text-[0.6rem] uppercase tracking-[0.14em] text-clay hover:text-sand">
                        + wardrobe canon · the model has no memory between runs
                      </summary>
                      <p className="mt-2 font-mono text-[0.66rem] leading-[1.9] text-sand">{WARDROBE}</p>
                    </details>
                  ) : null}
                </>
              ) : null}
            </div>

            <div>
              <AruVideo
                id={active.youtube}
                label={`${active.label} · raw generation · ${GEN_DUR}s`}
                title={`${active.label} raw generation`}
                poster={active.still}
                inline
              />
              <p className="mt-3 font-mono text-[0.6rem] leading-[1.9] text-sand">
                Uncut, ungraded, straight out of Seedance. {GEN_DUR}s at {GEN_RES}, the only length
                and frame the model makes.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    ) : null;

  return (
    <AruSection
      id="shots"
      no="02"
      kicker="the shots"
      title="Eleven"
      accent="generations"
      lede={
        <>
          The world of the video, one clip at a time. Each came back as a fixed {GEN_DUR}s at{" "}
          {GEN_RES}. Open a panel for the two prompts that made it, and for the raw clip straight
          out of the model.
        </>
      }
    >
      {/* references first, the anchors that existed before any shot did */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mb-12"
      >
        <p className="mb-3 inline-block rounded bg-ink/80 px-2 py-1 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-sand">
          reference · loaded before the first generation
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {REFERENCES.map((r) => (
            <Panel key={r.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.src} alt={r.label} loading="lazy" className="block aspect-[16/9] w-full object-cover opacity-90" />
              <div className="border-t-2 border-[#0C0906] p-3">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-forest">{r.label}</p>
                <p className="mt-1 text-[0.82rem] font-light leading-[1.6] text-tan">{r.note}</p>
              </div>
            </Panel>
          ))}
        </div>
        <Prose className="mt-3">
          <p className="font-mono text-[0.62rem] leading-[1.8] text-sand">{REFERENCE_CREDIT}</p>
        </Prose>
      </motion.div>

      {/* the shots that made the cut */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-forest text-[0.7rem] font-bold leading-none text-forest">
          +
        </span>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-cream">
          Tap any shot for its two prompts + the raw clip
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {used.map((s) => (
          <ShotButton
            key={s.id}
            s={s}
            open={open === s.id}
            onClick={() => toggle(s.id)}
            innerRef={(el) => (btnRefs.current[s.id] = el)}
          />
        ))}
      </div>

      {/* detail for the used grid expands right here */}
      <AnimatePresence mode="wait">{active?.usedInEdit ? detail : null}</AnimatePresence>

      {/* generated, never cut */}
      {dropped.length ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-14 pt-10"
        >
          <Prose className="mb-6 max-w-[64ch]">
            <p className="mb-1 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-cream">
              {dropped.length} generations that never made the cut
            </p>
            <p className="text-[0.98rem] font-light leading-[1.7] text-tan">
              Generated, paid for, and left out. Approving a still is cheap; animating one is not.
              These are the price of finding the edit by making more than you keep.
            </p>
          </Prose>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {dropped.map((s) => (
              <ShotButton
                key={s.id}
                s={s}
                open={open === s.id}
                onClick={() => toggle(s.id)}
                innerRef={(el) => (btnRefs.current[s.id] = el)}
                muted
              />
            ))}
          </div>

          {/* detail for the dropped grid expands right here */}
          <AnimatePresence mode="wait">{active && !active.usedInEdit ? detail : null}</AnimatePresence>
        </motion.div>
      ) : null}
    </AruSection>
  );
}

function ShotButton({
  s,
  open,
  onClick,
  innerRef,
  muted = false,
}: {
  s: Source;
  open: boolean;
  onClick: () => void;
  innerRef?: (el: HTMLButtonElement | null) => void;
  muted?: boolean;
}) {
  return (
    <motion.button
      ref={innerRef}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      onClick={onClick}
      aria-expanded={open}
      className="group relative min-w-0 cursor-pointer scroll-mt-24 text-left"
    >
      <Panel className={open ? "ring-2 ring-forest" : ""}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.still}
          alt={s.title}
          loading="lazy"
          className={`block aspect-[1376/768] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
            muted ? "opacity-70 grayscale-[0.35] group-hover:opacity-100 group-hover:grayscale-0" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-0 px-2 py-0.5 font-mono text-[0.6rem] font-medium tracking-[0.08em] text-ink ${
            muted ? "bg-sand" : "bg-forest"
          }`}
        >
          {s.label}
        </span>
        {/* persistent affordance: makes it obvious the panel opens */}
        <span
          className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-[0.85rem] font-bold leading-none transition-transform duration-300 group-hover:scale-110 ${
            open ? "rotate-45 border-forest bg-forest text-ink" : "border-cream/70 bg-ink/70 text-cream"
          }`}
          aria-hidden
        >
          +
        </span>
        <span className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/95 to-transparent px-2 pb-1.5 pt-7 font-mono text-[0.58rem] tracking-[0.04em] text-cream">
          {s.title}
          <span className="shrink-0 text-[0.5rem] uppercase tracking-[0.1em] text-forest">
            {open ? "close" : "prompts +"}
          </span>
        </span>
      </Panel>
    </motion.button>
  );
}

function Prompt({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-forest">{label}</p>
      <p className="rounded-[4px] border border-rule bg-ink/70 p-3 font-mono text-[0.68rem] leading-[1.85] text-tan">
        {body}
      </p>
    </div>
  );
}
