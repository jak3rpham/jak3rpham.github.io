"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { DrawDiagram, type DiagramNode, type DiagramEdge } from "../DrawDiagram";
import { fadeUp } from "@/lib/motion";

const STAGES = [
  { label: "INPUT", sub: "Short brief" },
  { label: "EXPAND", sub: "Claude Opus 4.7" },
  { label: "KEYFRAMES", sub: "Flux Pro 1.1" },
  { label: "TYPOGRAPHY", sub: "GPT Image 1" },
  { label: "ASSEMBLE", sub: "Compositor" },
  { label: "MOTION", sub: "Seedance 2.0" },
];

const NODES: DiagramNode[] = STAGES.map((s, i) => ({
  id: `n${i}`,
  x: 60 + i * 148,
  y: 42,
  r: 11,
  label: s.label,
  sub: s.sub,
}));
const EDGES: DiagramEdge[] = STAGES.slice(1).map((_, i) => [`n${i}`, `n${i + 1}`] as DiagramEdge);

export function BongPipeline() {
  return (
    <section id="pipeline" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              The <span className="text-forest">orchestration</span>
            </h2>
          </Reveal>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-8 max-w-[64ch] text-[1.1rem] font-light leading-[1.75] text-tan">
          Each stage hands its artifact to the next. No single model handles two stages; model selection is by what each is genuinely
          best at.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="rounded-[14px] border border-panel-border bg-panel/60 p-4 backdrop-blur-md md:p-8">
          <DrawDiagram nodes={NODES} edges={EDGES} width={900} height={110} className="h-auto w-full" />
        </motion.div>

        <motion.figure variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="mt-8 overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised">
          <img
            src="/images/vng-demo/workflow/weave-canvas-full.webp"
            alt="Figma Weave production canvas with parked iterations"
            loading="lazy"
            className="w-full"
          />
          <figcaption className="px-6 py-4 text-center font-mono text-[0.62rem] leading-relaxed tracking-[0.04em] text-sand">
            Figma Weave canvas · working pipeline (top) + parked iterations: gradient overlay rejected, Flux text-rendering failures,
            hook layer dropped
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
