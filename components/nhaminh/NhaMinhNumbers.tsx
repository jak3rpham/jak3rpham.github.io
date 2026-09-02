"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";
import { WebGLNhaMinh3D } from "@/components/WebGLNhaMinh3D";

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const METRICS = [
  ["100%", "Medical Safety Pass Rate", "134 unit tests validating prompt boundaries against clinical malpractice."],
  ["<1.2s", "OCR Extraction Latency", "Near-instant extraction of drug names, dosages, and schedules via Gemini 2.5 Flash."],
  ["0", "Hallucinated Prescriptions", "Zero synthetic drugs created outside verified clinical databases."],
  ["24/7", "Google Workspace Sync", "Bi-directional OAuth sync with Google Calendar & Google Tasks."],
];

export function NhaMinhNumbers() {
  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            06 · System Performance
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              Engineered for <span className="text-[#FF6B4B]">Clinical Reliability</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* 4 Metric Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(([val, title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm backdrop-blur-md"
            >
              <span className="font-display text-3xl font-extrabold text-[#FF6B4B]">{val}</span>
              <div className="mt-2 text-sm font-bold text-slate-900">{title}</div>
              <p className="mt-1 text-[0.82rem] font-normal leading-[1.55] text-slate-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card with 3D Illustration */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/40 to-orange-100/20 p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            <div className="lg:col-span-8 space-y-3">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#FF6B4B] font-bold">
                Open Source & Live App
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900 md:text-2xl">
                Explore the Production Codebase & Live App
              </h3>
              <p className="max-w-[56ch] text-[0.92rem] text-slate-600">
                Review the dual-interface React architecture, Gemini 2.5 Flash Vision OCR pipeline, and 134 safety unit tests on GitHub.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="https://ai-riser-namdosan-fa737.web.app"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B4B] to-[#FF8E53] px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[0_6px_20px_rgba(255,107,75,0.35)] transition-all hover:scale-[1.02]"
                >
                  <span>Launch Live App</span>
                  <ExternalIcon />
                </a>

                <a
                  href="https://github.com/jak3rpham/ai-riser-namdosan"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs font-bold text-slate-700 shadow-sm hover:border-[#FF6B4B] hover:text-[#FF6B4B]"
                >
                  <span>GitHub Repository</span>
                  <ExternalIcon />
                </a>

                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs font-bold text-slate-700 shadow-sm hover:border-[#FF6B4B] hover:text-[#FF6B4B]"
                >
                  <ArrowLeftIcon />
                  <span>Return Home</span>
                </a>
              </div>
            </div>

            {/* Decorative 3D Illustration */}
            <div className="lg:col-span-4 relative flex items-center justify-center">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[#FF6B4B]/15 blur-2xl" />
              <WebGLNhaMinh3D className="h-[180px] w-full sm:h-[200px]" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
