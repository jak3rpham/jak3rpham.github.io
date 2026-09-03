"use client";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Homepage-only, deliberately compact schematics.
 *
 * The full node diagrams live on /terra (DrawDiagram: 460×220, one per card, labels under
 * every node). Reusing those here would have made the homepage as long as the case study,
 * so this is a separate reduction: a single rail, three stations, labels above the line,
 * and the outcome carried in HTML underneath instead of inside the SVG. Different shapes
 * per station (square in, ring engine, diamond out) so a glyph is readable at 240px wide.
 */

type Kind = "in" | "engine" | "out";
type Station = { label: string; sub?: string; kind: Kind };
type System = { name: string; stations: Station[]; delta: string; note: string };

const SYSTEMS: System[] = [
  {
    name: "HR Column Publisher",
    stations: [
      { label: "Word doc", kind: "in" },
      { label: "Gemini 2.5", sub: "5 SEO fields", kind: "engine" },
      { label: "Publish", kind: "out" },
    ],
    delta: "~1 h → 1 click",
    note: "A non-technical producer now publishes Japanese Q&A without me.",
  },
  {
    name: "Page Publisher",
    stations: [
      { label: "HTML paste", kind: "in" },
      { label: "WebP + AI alt", sub: "1 batched call", kind: "engine" },
      { label: "Live page", kind: "out" },
    ],
    delta: "0 manual image steps",
    note: "Image prep and the rebuild step disappeared from the workflow.",
  },
  {
    name: "Marketing data hub",
    stations: [
      { label: "3 sources", sub: "GSC · GA4 · PSI", kind: "in" },
      { label: "Apps Script", sub: "→ Sheets", kind: "engine" },
      { label: "Dashboard", kind: "out" },
    ],
    delta: "Weekly, unattended",
    note: "Reporting that used to be assembled by hand now runs itself.",
  },
  {
    name: "Whitepaper → CRM",
    stations: [
      { label: "One form", kind: "in" },
      { label: "PDF + webhook", sub: "same submit", kind: "engine" },
      { label: "CRM lead", kind: "out" },
    ],
    delta: "Static PDF → tracked",
    note: "Downloads became a measurable channel instead of a dead end.",
  },
];

const RAIL_Y = 13;
const X = [9, 120, 231];

function Node({ kind, x }: { kind: Kind; x: number }) {
  const stroke = "var(--color-forest)";
  if (kind === "in") {
    return <rect x={x - 5} y={RAIL_Y - 5} width={10} height={10} fill="#141813" stroke={stroke} strokeWidth={1.5} />;
  }
  if (kind === "out") {
    return (
      <path d={`M${x} ${RAIL_Y - 7}L${x + 7} ${RAIL_Y}L${x} ${RAIL_Y + 7}L${x - 7} ${RAIL_Y}Z`} fill={stroke} />
    );
  }
  return (
    <>
      <circle cx={x} cy={RAIL_Y} r={11} fill="none" stroke={stroke} strokeOpacity={0.25} />
      <circle cx={x} cy={RAIL_Y} r={6.5} fill="#141813" stroke={stroke} strokeWidth={1.5} />
      <circle cx={x} cy={RAIL_Y} r={2.2} fill={stroke} />
    </>
  );
}

function Schematic({ stations, delta }: { stations: Station[]; delta: string }) {
  return (
    <div>
      <div className="mb-3 text-center font-mono t-micro tracking-[0.04em] text-forest">{delta}</div>

      {/* The SVG carries no type at all. Labels used to live inside it, which meant they scaled
          with the viewBox and collided the moment a station name was longer than "Publish" — and
          the sub-lines sat below the viewBox height and were simply clipped. Graphics here, text
          in HTML below, so the labels wrap and stay legible at any card width. */}
      <svg
        viewBox="0 0 240 26"
        className="h-auto w-full"
        role="img"
        aria-label={stations.map((s) => s.label).join(", then ")}
      >
        {/* two-point <path>, not <line>: WebKit only honours the pathLength attribute framer
            normalises the draw-on against on <path>. */}
        <motion.path
          d={`M${X[0]} ${RAIL_Y}L${X[2]} ${RAIL_Y}`}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth={1.4}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {stations.map((s, i) => (
          <motion.g
            key={s.label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 240, damping: 17 }}
            style={{ transformBox: "view-box", transformOrigin: `${X[i]}px ${RAIL_Y}px` }}
          >
            <Node kind={s.kind} x={X[i]} />
          </motion.g>
        ))}
      </svg>

      {/* The reserve here is what keeps the four cards identical. It was 2rem, which is one line
          of label and no sub; the moment a station wrapped to two lines, or carried a sub that
          wrapped, that card's box grew and its name and note sat lower than its neighbours' for
          the rest of the row. 4.5rem is the worst case at this type size, two lines of each. */}
      <div className="mt-3 grid min-h-[4.5rem] grid-cols-3 items-start gap-x-2">
        {stations.map((s, i) => (
          <div key={s.label} className={i === 0 ? "text-left" : i === 2 ? "text-right" : "text-center"}>
            <div className="break-words font-mono t-micro leading-tight text-cream">{s.label}</div>
            {s.sub && <div className="mt-1 break-words font-mono t-micro leading-tight text-sand">{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemsStrip() {
  return (
    <section id="systems" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4.5rem,9vw,8rem)]">
      {/* The generated diagram is the ground for this section and the terra teaser after it,
          pinned by the SequenceSpan in app/page.tsx so it draws itself across both rather than
          finishing inside this one. It is spent, and gone, before the paper is fully in: the
          artwork is near black, and holding it under a paper band would read as a hole punched
          in the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink via-ink/55 to-ink"
      />
      <div className="relative z-[2] mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <div>
            <span className="font-mono t-micro uppercase tracking-[0.18em] text-forest">{"// systems"}</span>
            <Reveal className="mt-3">
              <h2 className="font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
                Behind the numbers, <span className="text-forest">tooling</span>
              </h2>
            </Reveal>
          </div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-[44ch] t-body font-light leading-[1.7] text-tan"
          >
            The growth numbers came from software, not effort. Four things I built so a team of three
            could publish and measure without me in the loop.
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-1 items-stretch gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SYSTEMS.map((s) => (
            <motion.div key={s.name} variants={fadeUp} className="flex h-full flex-col">
              <div className="rounded-[10px] border border-rule/70 bg-ink-raised/40 px-4 py-4">
                <Schematic stations={s.stations} delta={s.delta} />
              </div>
              <div className="mt-4 t-body font-medium leading-snug text-cream">{s.name}</div>
              <p className="mt-1.5 t-small font-light leading-[1.6] text-tan">{s.note}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
          <span className="font-mono t-micro uppercase tracking-[0.12em] text-sand">
            Built at terra-plat.vn · Sep 2024 → Jun 2026 · WordPress · Apps Script · Gemini
          </span>
          <a
            href="/terra"
            className="group flex items-center gap-1.5 font-mono t-micro uppercase tracking-[0.1em] text-forest"
          >
            How they fit together
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
