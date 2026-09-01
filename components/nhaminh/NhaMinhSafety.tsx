"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

const INVARIANTS = [
  {
    num: "I",
    title: "No Unauthorized Medical Diagnosis",
    rule: "The AI companion explains verified medication purposes only. It never fabricates disease diagnoses for unrecorded symptoms.",
    bad: "❌ 'You are diagnosed with severe chronic heart failure.'",
    good: "✅ 'Upper stomach discomfort can be related to NSAIDs. Please consult your physician if symptoms persist.'",
  },
  {
    num: "II",
    title: "Zero Dosage Alteration (Immutable Regimen)",
    rule: "Dosages, pill counts, and timings strictly reflect verified doctor prescriptions. The LLM cannot suggest doubling up or skipping.",
    bad: "❌ 'Take 2 pills instead of 1 to relieve pain faster.'",
    good: "✅ 'Your verified regimen specifies exactly 1 tablet daily after breakfast. Never alter prescribed dosage.'",
  },
  {
    num: "III",
    title: "Food-Drug & Drug-Drug Interaction Matrix",
    rule: "Deterministic cross-referencing against National Drug Formulary (e.g. Grapefruit CYP3A4 inhibition with Amlodipine, High Potassium herbs).",
    bad: "❌ Silent ingestion of grapefruit juice alongside calcium channel blockers.",
    good: "✅ Immediate Critical Alert: Grapefruit inhibits CYP3A4 breakdown, causing severe hypotensive crisis.",
  },
  {
    num: "IV",
    title: "Deterministic WHO/AHA Telemetry Thresholds",
    rule: "Vital evaluations (systolic/diastolic blood pressure, glucose) are computed by hard clinical bounds, not arbitrary LLM sentiment.",
    bad: "❌ '170/105 looks okay, just rest a bit.'",
    good: "✅ Deterministic Trigger: Stage 2 Hypertension (>=140/90). Prompt urgent notification to family and physician.",
  },
  {
    num: "V",
    title: "Zero PII Medical Data Leakage",
    rule: "All patient identifiers (full names, exact birthdates, phone numbers, doctor signatures) are pseudonymized locally before API dispatch.",
    bad: "❌ Sending 'Mr. Pham Van A, Phone 0903..., Doctor Tran' to external LLM.",
    good: "✅ Pseudonymized Buffer: age_band '70-74', clinical meds list only. 100% PII sanitized.",
  },
];

export function NhaMinhSafety() {
  const [activeTab, setActiveTab] = useState(2);
  const cur = INVARIANTS[activeTab];

  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            05 · Clinical Boundaries
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              The 5 Invariant <span className="text-[#FF6B4B]">Medical Safety Rails</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* Invariant Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {INVARIANTS.map((inv, idx) => {
            const isSel = idx === activeTab;
            return (
              <button
                key={inv.num}
                onClick={() => setActiveTab(idx)}
                className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSel
                    ? "border-[#FF6B4B] bg-[#FF6B4B] text-white font-bold shadow-[0_2px_12px_rgba(255,107,75,0.35)]"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:border-orange-200 hover:text-slate-900"
                }`}
              >
                <span>Rail {inv.num}</span>
                <span className="hidden md:inline">· {inv.title}</span>
              </button>
            );
          })}
        </div>

        {/* Detail Box */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-serif-jp text-2xl font-bold text-[#FF6B4B]">{cur.num}</span>
              <h3 className="font-display text-xl font-bold text-slate-900">{cur.title}</h3>
            </div>
            <span className="rounded-full bg-orange-50 border border-orange-200 px-3 py-0.5 font-mono text-[0.62rem] text-[#FF6B4B] uppercase font-bold">
              Zero Tolerance Invariant
            </span>
          </div>

          <p className="mt-4 text-[0.96rem] font-normal leading-[1.65] text-slate-600 max-w-[78ch]">{cur.rule}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
              <span className="font-mono text-[0.62rem] uppercase tracking-wider text-red-700 font-bold">
                [UNACCEPTABLE LLM HALLUCINATION]
              </span>
              <p className="mt-1.5 text-[0.85rem] font-mono leading-[1.6] text-red-900">{cur.bad}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <span className="font-mono text-[0.62rem] uppercase tracking-wider text-emerald-700 font-bold">
                [NHÀ MÌNH DETERMINISTIC RESPONSE]
              </span>
              <p className="mt-1.5 text-[0.85rem] font-mono leading-[1.6] text-emerald-900">{cur.good}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
