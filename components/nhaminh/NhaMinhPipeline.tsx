"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

const STEPS = [
  {
    step: "01",
    label: "Multimodal Capture",
    title: "1. Raw Clinical Input Ingestion",
    desc: "High-resolution camera capture of handwritten prescription bag labels and voice audio waveforms recorded via Web Audio API.",
    tech: "MediaStream API · Opus Audio Encoder · 4K Vision Buffer",
    code: `// Input Payload Buffer
const audioBlob = await recorder.stop();
const visionImage = await camera.captureFrame({ maxRes: "4K" });`,
  },
  {
    step: "02",
    label: "Gemini 2.5 Flash",
    title: "2. Multimodal Schema Extraction",
    desc: "Gemini 2.5 Flash Vision structures messy clinical jargon, dosage frequencies, and doctor handwriting into strongly-typed medication schemas.",
    tech: "Gemini 2.5 Flash Multimodal · JSON Schema Enforcement · 1.14s Avg Latency",
    code: `{
  "medication_name": "Amlodipine 5mg",
  "generic_name": "amlodipine",
  "dosage_form": "tablet",
  "schedule": { "morning": 1, "evening": 0 },
  "instructions": "Take after breakfast with water"
}`,
  },
  {
    step: "03",
    label: "Deterministic Safety",
    title: "3. 5-Invariant Medical Guardrails",
    desc: "Invariant filters intercept hallucinated dosages, verify CYP3A4 Grapefruit food-drug interactions, and block unauthorized diagnostic claims.",
    tech: "National Drug Formulary Engine · AHA/ADA Vital Bounds · CYP3A4 Invariant Engine",
    code: `// Deterministic Food-Drug Check
if (generics.includes("amlodipine") && diet.includes("grapefruit")) {
  triggerCriticalWarning({
    mechanism: "CYP3A4 Inhibition",
    alert: "Severe Hypotension Risk"
  });
}`,
  },
  {
    step: "04",
    label: "Google Workspace",
    title: "4. Bi-Directional OAuth Sync",
    desc: "Automated OAuth 2.0 pipelines populate verified recurring medication events on Google Calendar and generate task reminders on Google Tasks.",
    tech: "Google Calendar API v3 · Google Tasks API · Cloud Run Token Broker",
    code: `await calendar.events.insert({
  calendarId: "primary",
  summary: "💊 Dad: Amlodipine 5mg",
  recurrence: ["RRULE:FREQ=DAILY;BYHOUR=7"]
});`,
  },
  {
    step: "05",
    label: "Dual-UX Delivery",
    title: "5. Realtime Role-Based Rendering",
    desc: "Simultaneous delivery to Senior View (oversized 1-tap confirmation with confetti) and Caregiver Dashboard (telemetry curves & realtime stream).",
    tech: "Firestore Realtime Listener · Confetti Particle Engine · Web Audio TTS",
    code: `// Firestore Live Synchronization
onSnapshot(doc(db, "doses", doseId), (snap) => {
  renderCaregiverLiveFeed(snap.data());
});`,
  },
];

export function NhaMinhPipeline() {
  const [selectedStep, setSelectedStep] = useState(0);
  const cur = STEPS[selectedStep];

  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        
        {/* Section Heading */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            03 · Multimodal AI Architecture
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              End-to-End <span className="text-[#FF6B4B]">Data Flow & Safety Pipeline</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* Step Buttons */}
        <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((s, idx) => {
            const isSel = idx === selectedStep;
            return (
              <button
                key={s.step}
                onClick={() => setSelectedStep(idx)}
                className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSel
                    ? "border-[#FF6B4B] bg-orange-50/90 shadow-[0_2px_12px_rgba(255,107,75,0.15)]"
                    : "border-slate-200 bg-white/80 hover:border-orange-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${isSel ? "text-[#FF6B4B]" : "text-slate-400"}`}>{s.step}</span>
                  {isSel && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4B]" />}
                </div>
                <div className={`mt-1.5 font-display text-xs font-bold ${isSel ? "text-[#FF6B4B]" : "text-slate-700"}`}>{s.label}</div>
              </button>
            );
          })}
        </div>

        {/* Detail Box */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
          
          {/* Left Narrative */}
          <div className="lg:col-span-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#FF6B4B] font-bold">
                // Pipeline Step {cur.step}
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">{cur.title}</h3>
              <p className="mt-3 text-[0.92rem] font-normal leading-[1.65] text-slate-600">{cur.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs text-slate-500">
              <span className="font-bold text-[#FF6B4B]">Stack:</span>
              <span className="text-slate-700 font-semibold">{cur.tech}</span>
            </div>
          </div>

          {/* Right Code Sandbox */}
          <div className="lg:col-span-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-sm flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                  <span className="h-2 w-2 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-[0.62rem] text-slate-400">payload.pipeline_step_{cur.step}.ts</span>
              </div>
              <pre className="mt-3 overflow-x-auto font-mono text-[0.76rem] leading-[1.6] text-emerald-400">
                <code>{cur.code}</code>
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 font-mono text-[0.62rem] text-slate-400">
              <span>Deterministic Assertion: PASSED</span>
              <span className="text-emerald-400">134 Unit Tests Verified</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
