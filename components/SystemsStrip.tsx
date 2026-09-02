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
      { label: "GSC · GA4 · PSI", kind: "in" },
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
      { label: "PDF + webhook", kind: "engine" },
      { label: "CRM lead", kind: "out" },
    ],
    delta: "Static PDF → tracked",
    note: "Downloads became a measurable channel instead of a dead end.",
  },
];

const RAIL_Y = 52;
const X = [26, 120, 214];

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
    <svg viewBox="0 0 240 84" className="h-auto w-full" role="img" aria-label={stations.map((s) => s.label).join(" then ")}>
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

      {/* the measured outcome, printed on the rail itself — the annotation is the point */}
      <motion.text
        x={120}
        y={RAIL_Y - 26}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--color-forest)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        {delta}
      </motion.text>

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
          <text
            x={X[i]}
            y={RAIL_Y + 24}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            fontFamily="var(--font-mono)"
            fontSize={9.5}
            fill="var(--color-cream)"
          >
            {s.label}
          </text>
          {s.sub && (
            <text
              x={X[i]}
              y={RAIL_Y + 36}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={8.5}
              fill="var(--color-sand)"
            >
              {s.sub}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export function SystemsStrip() {
  return (
    <section id="systems" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <div>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-forest">{"// systems"}</span>
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
            className="max-w-[44ch] text-[1rem] font-light leading-[1.7] text-tan"
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
          className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SYSTEMS.map((s) => (
            <motion.div key={s.name} variants={fadeUp} className="flex flex-col">
              <div className="rounded-[10px] border border-rule/70 bg-ink-raised/40 px-3 py-2">
                <Schematic stations={s.stations} delta={s.delta} />
              </div>
              <div className="mt-4 text-[1.02rem] font-medium text-cream">{s.name}</div>
              <p className="mt-1.5 text-[0.92rem] font-light leading-[1.6] text-tan">{s.note}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-sand">
            Built at terra-plat.vn · Sep 2024 → Jun 2026 · WordPress · Apps Script · Gemini
          </span>
          <a
            href="/terra"
            className="group flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-forest"
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
