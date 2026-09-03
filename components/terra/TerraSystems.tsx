"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { DrawDiagram, type DiagramNode, type DiagramEdge } from "../DrawDiagram";
import { fadeUp } from "@/lib/motion";

type System = {
  tag: string;
  title: string;
  desc: string;
  impact: string;
  pills: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

const SYSTEMS: System[] = [
  {
    tag: "// WordPress plugin",
    title: "Page Publisher",
    desc: "Paste an HTML layout, get a live Elementor page. Every image is auto-converted to WebP and described with AI alt text, batched into a single API call per page.",
    impact: "Removed the manual image-prep and rebuild step, so the team ships pages without touching code.",
    pills: ["WordPress plugin", "Gemini", "WebP"],
    nodes: [
      { id: "a", x: 55, y: 110, label: "HTML paste" },
      { id: "i1", x: 175, y: 62 },
      { id: "i2", x: 175, y: 110, label: "images → WebP" },
      { id: "i3", x: 175, y: 158 },
      { id: "c", x: 315, y: 110, label: "AI alt", sub: "1 batched call" },
      { id: "d", x: 415, y: 110, label: "Live page", r: 8 },
    ],
    edges: [["a", "i1"], ["a", "i2"], ["a", "i3"], ["i1", "c"], ["i2", "c"], ["i3", "c"], ["c", "d"]],
  },
  {
    tag: "// WPCode + AI",
    title: "HR Column Publisher",
    desc: "A Word doc goes in; one Gemini pass sprays out the five SEO fields (focus keyword, title, meta, slug, supporting keywords) and applies them on publish.",
    impact: "~1 hour of manual formatting per article became one click. A non-technical producer now publishes Japanese Q&A independently.",
    pills: ["mammoth.js", "Gemini 2.5", "Polylang"],
    nodes: [
      { id: "a", x: 52, y: 110, label: "Word doc" },
      { id: "g", x: 175, y: 110, label: "Gemini 2.5", r: 9 },
      { id: "f1", x: 300, y: 62 },
      { id: "f2", x: 300, y: 110, label: "5 SEO fields" },
      { id: "f3", x: 300, y: 158 },
      { id: "out", x: 415, y: 110, label: "Publish", r: 8 },
    ],
    edges: [["a", "g"], ["g", "f1"], ["g", "f2"], ["g", "f3"], ["f1", "out"], ["f2", "out"], ["f3", "out"]],
  },
  {
    tag: "// Data layer",
    title: "Marketing data hub",
    desc: "Three sources (Search Console, GA4, PageSpeed) funnel through an Apps Script pipeline into Google Sheets, refreshed automatically into a weekly board-level dashboard.",
    impact: "Reporting that used to be manual now runs itself, feeding decisions weekly.",
    pills: ["Apps Script", "GSC / GA4", "~13 MCP servers"],
    nodes: [
      { id: "s1", x: 60, y: 60, label: "GSC" },
      { id: "s2", x: 60, y: 110, label: "GA4" },
      { id: "s3", x: 60, y: 160, label: "PSI" },
      { id: "h", x: 200, y: 110, label: "Apps Script" },
      { id: "sh", x: 315, y: 110, label: "Sheets" },
      { id: "d", x: 415, y: 110, label: "Dashboard", r: 8 },
    ],
    edges: [["s1", "h"], ["s2", "h"], ["s3", "h"], ["h", "sh"], ["sh", "d"]],
  },
  {
    tag: "// Lead gen",
    title: "Whitepaper + CRM hub",
    desc: "One form, two outcomes: the visitor gets the PDF, and a webhook pushes the lead straight into Bizfly CRM at the same moment.",
    impact: "Turned static PDFs into a measurable lead-generation channel.",
    pills: ["ACF", "Contact Form 7", "Bizfly webhook"],
    nodes: [
      { id: "a", x: 52, y: 110, label: "Visitor" },
      { id: "f", x: 165, y: 110, label: "CF7 form", r: 9 },
      { id: "p", x: 290, y: 64, label: "PDF" },
      { id: "w", x: 290, y: 158, label: "Webhook" },
      { id: "dl", x: 415, y: 64, label: "Download" },
      { id: "crm", x: 415, y: 158, label: "CRM lead" },
    ],
    edges: [["a", "f"], ["f", "p"], ["f", "w"], ["p", "dl"], ["w", "crm"]],
  },
];

const FOUNDATION = [
  "Website architecture (VI/EN)",
  "Technical SEO · schema · CWV",
  "Keyword strategy · on-page & AEO optimization · 978 Top-10 KW",
  "GA4 from scratch",
  "News & whitepaper sections",
  "Video & creative production",
];

// Stacked cards in a 2-col grid, not alternating left/right rows: four consecutive
// image+text splits read as a monotonous zigzag, so the diagrams sit on top of their copy
// inside a card gallery instead.
function SystemPanel({ s }: { s: System }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col rounded-[16px] border border-panel-border bg-panel/60 p-6 backdrop-blur-md md:p-7"
    >
      <div className="rounded-[10px] border border-rule/60 bg-ink/40 p-3">
        <DrawDiagram nodes={s.nodes} edges={s.edges} className="h-auto w-full" />
      </div>
      <div className="mt-6">
        <div className="mb-2 font-mono t-micro uppercase tracking-[0.12em] text-forest">{s.tag}</div>
        <div className="mb-2.5 font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] text-cream">{s.title}</div>
        <p className="mb-3.5 t-body font-light leading-[1.65] text-tan">{s.desc}</p>
        <p className="mb-4 border-l-2 border-forest/50 pl-4 t-small font-light leading-[1.55] text-sand">{s.impact}</p>
        <div className="flex flex-wrap gap-2">
          {s.pills.map((p) => (
            <span key={p} className="rounded-full border border-rule px-3 py-1.5 font-mono t-micro uppercase tracking-[0.08em] text-sand">
              {p}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TerraSystems() {
  return (
    <section id="systems" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Systems I <span className="text-forest">built</span>
            </h2>
          </Reveal>
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-14 max-w-[64ch] t-lead font-light leading-[1.75] text-tan">
          The growth did not come from effort alone. I built the tooling that let a small, non-technical team publish, measure, and
          convert on its own. Each system solves a different bottleneck, so each one is shaped differently.
        </motion.p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SYSTEMS.map((s) => (
            <SystemPanel key={s.title} s={s} />
          ))}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-16">
          <div className="mb-4 font-mono t-micro uppercase tracking-[0.12em] text-sand">// Plus the foundation</div>
          <div className="flex flex-wrap gap-2">
            {FOUNDATION.map((f) => (
              <span key={f} className="rounded-full border border-rule px-3.5 py-2 font-mono t-micro uppercase tracking-[0.06em] text-tan">
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
