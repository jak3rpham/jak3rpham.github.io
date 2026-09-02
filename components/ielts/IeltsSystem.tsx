"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { DrawDiagram, type DiagramNode, type DiagramEdge } from "../DrawDiagram";
import { fadeUp, staggerContainer } from "@/lib/motion";

const BOOT: { nodes: DiagramNode[]; edges: DiagramEdge[] } = {
  nodes: [
    { id: "app", x: 52, y: 110, label: "App boots" },
    { id: "chk", x: 165, y: 110, label: "env set?", r: 9 },
    { id: "sb", x: 305, y: 62, label: "Supabase", sub: "auth · RLS · sync" },
    { id: "ls", x: 305, y: 158, label: "localStorage", sub: "no account" },
    { id: "ui", x: 420, y: 110, label: "Same UI", r: 8 },
  ],
  edges: [["app", "chk"], ["chk", "sb"], ["chk", "ls"], ["sb", "ui"], ["ls", "ui"]],
};

const GRADE: { nodes: DiagramNode[]; edges: DiagramEdge[] } = {
  nodes: [
    { id: "e", x: 48, y: 110, label: "Essay" },
    { id: "g", x: 150, y: 110, label: "Word gate", sub: "reject early" },
    { id: "r", x: 262, y: 110, label: "/api/grade", sub: "key server-only", r: 9 },
    { id: "c", x: 362, y: 110, label: "Claude" },
    { id: "j", x: 435, y: 110, label: "JSON", r: 8 },
  ],
  edges: [["e", "g"], ["g", "r"], ["r", "c"], ["c", "j"]],
};

const TABLES: { name: string; shape: string; note: string }[] = [
  {
    name: "user_progress",
    shape: "upsert · PK (user_id, item_id) · state jsonb",
    note: "Progress is current state, so a row is overwritten, never appended. state is jsonb so a new kind of exercise needs no migration — only a new id prefix.",
  },
  {
    name: "mock_attempts",
    shape: "append-only · indexed (user_id, created_at desc)",
    note: "A test history is a log, not a state. Deliberately the opposite shape to the table above; conflating the two would have destroyed the record on every retake.",
  },
  {
    name: "content",
    shape: "public read where published · authed write",
    note: "Tests added through /admin land here and merge with the ones in the repo, so a collaborator adds material without touching code or waiting for a deploy.",
  },
  {
    name: "profiles",
    shape: "display_name public · email never exposed",
    note: "The leaderboard is public by design, so it reads a chosen name. Multiple SELECT policies OR together in Postgres, so public read was added without weakening read-your-own.",
  },
];

const OPS: [string, string][] = [
  [
    "Keys never reach the browser",
    "Every model call goes through a server route. The Anthropic and transcript keys have no NEXT_PUBLIC prefix, so they cannot be bundled by accident.",
  ],
  [
    "Paid routes require a session",
    "The two routes that spend money check for a signed-in user before doing anything. A public endpoint that calls a metered API is a bill waiting to happen.",
  ],
  [
    "A cron job to stay alive",
    "Supabase pauses a free project after seven days idle. A GitHub Action pings the REST endpoint every three days, so the app is never asleep when someone opens it.",
  ],
  [
    "Copyright handled deliberately",
    "YouTube transcripts are an input to question generation and are never displayed back; the video is embedded, never re-hosted.",
  ],
];

function Diagram({ title, meta, data }: { title: string; meta: string; data: { nodes: DiagramNode[]; edges: DiagramEdge[] } }) {
  return (
    <div className="rounded-[14px] border border-panel-border bg-panel/60 p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <span className="text-[1.02rem] font-medium text-cream">{title}</span>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-sand">{meta}</span>
      </div>
      <div className="rounded-[10px] border border-rule/60 bg-ink/40 p-2">
        <DrawDiagram nodes={data.nodes} edges={data.edges} className="h-auto w-full" />
      </div>
    </div>
  );
}

export function IeltsSystem() {
  return (
    <section id="system" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-rule pb-6">
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-forest">{"// the system"}</span>
          <Reveal className="mt-3">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Degrades <span className="text-forest">on purpose</span>
            </h2>
          </Reveal>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-10 max-w-[64ch] text-[1.08rem] font-light leading-[1.8] text-tan"
        >
          Clone the repo, run it, and it works — progress saves to the browser and nothing asks you to
          sign in. Add two environment variables and the same build becomes multi-user with row-level
          security. There is no flag and no second code path: the app checks whether it was given
          credentials and picks a lane.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          <motion.div variants={fadeUp}>
            <Diagram title="Boot path" meta="src/lib/progress.ts" data={BOOT} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Diagram title="Grading path" meta="src/app/api/grade" data={GRADE} />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
            <h3 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-[-0.03em] text-cream">
              Four tables, four different shapes
            </h3>
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sand">RLS on every one</span>
          </div>
          <div className="border-t border-rule">
            {TABLES.map((t) => (
              <div key={t.name} className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[210px_1fr]">
                <div>
                  <div className="font-mono text-[0.86rem] text-forest">{t.name}</div>
                  <div className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-sand">{t.shape}</div>
                </div>
                <p className="max-w-[68ch] text-[0.98rem] font-light leading-[1.7] text-tan">{t.note}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-2"
        >
          {OPS.map(([t, d]) => (
            <motion.div key={t} variants={fadeUp} className="bg-ink p-6">
              <div className="mb-2 text-[1.02rem] font-medium text-cream">{t}</div>
              <p className="text-[0.94rem] font-light leading-[1.7] text-tan">{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
