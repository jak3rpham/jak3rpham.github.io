"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";
import { WebGLNhaMinh3D } from "@/components/WebGLNhaMinh3D";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function NhaMinhHero() {
  return (
    <header className="relative z-[4] px-[var(--pad)] pt-24 pb-10">
      <div className="mx-auto max-w-[1120px]">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          
          {/* Top Back & Category Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-4 py-1.5 font-mono text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:border-[#FF6B4B] hover:text-[#FF6B4B]"
            >
              <ArrowLeftIcon />
              <span>Back to Portfolio</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-[#FF6B4B]">
                AI Riser Vietnam 2026
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-sky-600">
                Official Submission
              </span>
            </div>
          </div>

          {/* 2-Column Balanced Hero: Left (3D Emblem + Narrative) · Right (Compact YouTube Player) */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Left Content Column (7 Cols) */}
            <div className="lg:col-span-7">
              {/* 3D App Heart Logo & Brand Title */}
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#FF6B4B] to-[#FFA07A] opacity-35 blur-lg" />
                  <WebGLNhaMinh3D className="relative h-16 w-16" />
                </div>

                <div>
                  <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-900">
                    Nhà Mình <span className="bg-gradient-to-r from-[#FF6B4B] to-[#FF8E53] bg-clip-text text-transparent">Health</span>
                  </h1>
                  <p className="font-mono text-xs font-semibold text-slate-500">
                    Dual-Interface Healthcare AI for Vietnamese Families
                  </p>
                </div>
              </div>

              {/* Tagline & Core Philosophy */}
              <p className="mt-5 text-[1.02rem] font-normal leading-[1.7] text-slate-600 max-w-[58ch]">
                A purpose-built dual-experience healthcare companion connecting elderly parents and adult caregivers living apart. Powered by Gemini 2.5 Flash Vision prescription OCR, the conversational voice assistant "Cháu Bi", and bi-directional Google Calendar sync.
              </p>

              {/* Capability Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { text: "Gemini Vision OCR", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                  { text: "Voice AI 'Cháu Bi'", bg: "bg-sky-50 border-sky-200 text-sky-700" },
                  { text: "5 Safety Rails", bg: "bg-amber-50 border-amber-200 text-amber-700" },
                  { text: "Google Workspace", bg: "bg-purple-50 border-purple-200 text-purple-700" },
                ].map((b, idx) => (
                  <span key={idx} className={`rounded-lg border px-2.5 py-1 font-mono text-[0.68rem] font-bold ${b.bg}`}>
                    {b.text}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="https://ai-riser-namdosan-fa737.web.app"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B4B] to-[#FF8E53] px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[0_6px_20px_rgba(255,107,75,0.35)] transition-all hover:shadow-[0_8px_25px_rgba(255,107,75,0.45)] hover:scale-[1.02]"
                >
                  <span>Launch Live App</span>
                  <ExternalIcon />
                </a>

                <a
                  href="https://github.com/jak3rpham/ai-riser-namdosan"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 font-mono text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-[#FF6B4B] hover:text-[#FF6B4B]"
                >
                  <span>Source Code</span>
                  <ExternalIcon />
                </a>
              </div>
            </div>

            {/* Right Compact YouTube Player (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-orange-200/90 bg-white/95 p-2 shadow-[0_16px_45px_rgba(255,107,75,0.15)] backdrop-blur-xl">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/5CNx1tlCGSM?rel=0&modestbranding=1"
                    title="Nhà Mình : AI Riser Vietnam 2026 Official Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
                <div className="flex items-center justify-between px-2.5 py-2 font-mono text-[0.68rem] text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4B] animate-ping" />
                    1080p Official Demo Video
                  </span>
                  <a
                    href="https://youtube.com/watch?v=5CNx1tlCGSM"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#FF6B4B] hover:underline"
                  >
                    YouTube ↗
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Project Meta Cards (4 Compact Cards) */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Role", val: "Sole Tech & AI Lead" },
              { label: "Timeline", val: "Aug 2026 (AI Riser)" },
              { label: "Core Stack", val: "Vite · React · Node · Cloud Run" },
              { label: "Google Ecosystem", val: "Gemini 2.5 · Firestore · Tasks" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-orange-100 bg-white/80 p-3.5 shadow-sm backdrop-blur-md"
              >
                <span className="font-mono text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">{m.label}</span>
                <div className="mt-1 font-display text-[0.88rem] font-bold text-slate-800">{m.val}</div>
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </header>
  );
}
