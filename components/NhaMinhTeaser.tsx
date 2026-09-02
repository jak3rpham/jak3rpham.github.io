"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "./SpotlightCard";
import { Cta } from "./Cta";
import { Reveal } from "./Reveal";
import { fadeUp } from "@/lib/motion";

const TELEMETRY: [string, string, string][] = [
  ["100%", "Medical Safety Pass", "Zero unauthorized diagnosis or dosage alteration"],
  ["Dual-UX", "Parent & Child Modes", "24px+ Senior Interface vs Real-Time Caregiver Dashboard"],
  ["Gemini 2.5", "Vision OCR & Voice AI", "Vietnamese Rx extraction & Natural Speech Assistant 'Cháu Bi'"],
  ["Workspace", "Google Calendar & Tasks", "Automated family medication reminders and calendar sync"],
];

const TABS = [
  { id: "parent", label: "Parent Mode (Senior 60+)" },
  { id: "child", label: "Caregiver Dashboard" },
  { id: "ocr", label: "Gemini Vision OCR" },
] as const;

function HeartIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function NhaMinhTeaser() {
  const [activeTab, setActiveTab] = useState<"parent" | "child" | "ocr">("parent");
  const [pillTaken, setPillTaken] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-progressing tab timer (5 seconds cycle, pauses on user hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((cur) => {
            const nextIdx = (TABS.findIndex((t) => t.id === cur) + 1) % TABS.length;
            return TABS[nextIdx].id;
          });
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeTab, isHovered]);

  useEffect(() => {
    if (isVoicePlaying) {
      const timer = setTimeout(() => setIsVoicePlaying(false), 3800);
      return () => clearTimeout(timer);
    }
  }, [isVoicePlaying]);

  return (
    <section id="nhaminh" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7.5rem)]">
      {/* Harmonious Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full bg-[#FF6B4B]/8 blur-[130px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[420px] w-[420px] rounded-full bg-[#FF6B4B]/8 blur-[140px]" />

      <div className="mx-auto max-w-[1400px]">
        {/* Section Header with Official App Heart Logo */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[#FF6B4B]">
              AI Riser Vietnam 2026 Submission
            </span>
            <span className="rounded-full border border-[#FF6B4B]/30 bg-[#FF6B4B]/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#FF6B4B] backdrop-blur-md">
              Full-Stack & Multimodal AI Lead
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3.5 sm:gap-4.5">
            {/* Clean Official App Icon */}
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A59] via-[#FF6B4B] to-[#E05334] p-2.5 shadow-md shadow-[#FF6B4B]/20">
              <HeartIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-sm" />
            </div>

            <Reveal>
              <h2 className="font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[1.04] tracking-[-0.04em] text-cream">
                Nhà Mình · <span className="text-[#FF6B4B]">Healthcare AI</span>
              </h2>
            </Reveal>
          </div>

          <p className="mt-6 max-w-[68ch] text-[clamp(1.15rem,1.65vw,1.38rem)] font-light leading-[1.75] text-tan">
            An AI-driven family healthcare companion designed for Vietnamese elderly parents (60+) and adult caregivers living
            apart. Features Gemini 2.5 Flash Vision OCR for handwritten prescriptions, natural voice assistance with "Cháu Bi",
            and automated Google Workspace synchronization.
          </p>
        </motion.div>

        {/* Telemetry Counter Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {TELEMETRY.map(([val, label, sub]) => (
            <SpotlightCard
              key={label}
              className="group flex flex-col justify-between rounded-[18px] border border-panel-border bg-ink-raised/85 p-6 backdrop-blur-xl transition-all duration-300 hover:border-forest/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div>
                <span className="font-display text-[clamp(2rem,3.2vw,2.8rem)] font-bold leading-none tracking-tight text-forest drop-shadow-[0_0_12px_rgba(143,212,158,0.35)]">
                  {val}
                </span>
                <div className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-cream font-semibold">
                  {label}
                </div>
              </div>
              <p className="mt-2 text-[0.78rem] font-light leading-[1.5] text-sand">{sub}</p>
            </SpotlightCard>
          ))}
        </motion.div>

        {/* Interactive Dual-UX & Multimodal Showcase */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="mt-12 overflow-hidden rounded-[24px] border border-white/10 bg-ink-raised/80 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:p-10"
        >
          {/* Top Bar with Live Indicator & Auto-Progress Tab Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule/80 pb-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-forest" />
              </span>
              <span className="font-mono text-[0.74rem] uppercase tracking-[0.16em] text-cream">
                Live Dual-Interface & Multimodal Simulation
              </span>
            </div>

            {/* Glass Tab Switcher with Real-Time Progress Indicator */}
            <div className="flex rounded-full border border-white/10 bg-ink/70 p-1.5 backdrop-blur-md">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setProgress(0);
                    }}
                    className={`relative overflow-hidden rounded-full px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-all duration-200 ${
                      isActive
                        ? "bg-forest font-bold text-ink shadow-[0_0_20px_rgba(143,212,158,0.45)]"
                        : "text-sand hover:text-cream"
                    }`}
                  >
                    {isActive && !isHovered && (
                      <span
                        className="absolute bottom-0 left-0 top-0 bg-ink/20 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Stage (Fixed Minimum Height to Prevent ANY Layout Shift) */}
          <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Interactive Device Frame with Strict Height Lock */}
            <div className="lg:col-span-7 h-[470px] min-h-[470px] flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                {/* 1. Parent Mode: Proportional Phone Frame with 100% English UI */}
                {activeTab === "parent" && (
                  <motion.div
                    key="parent"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-[360px] rounded-[32px] border-[3px] border-forest/30 bg-ink p-4 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                  >
                    {/* Dynamic Island Header */}
                    <div className="mx-auto mb-3 h-4 w-24 rounded-full bg-ink-raised border border-white/10" />

                    <div className="rounded-[22px] border border-forest/20 bg-ink-raised/90 p-4">
                      <div className="flex items-center justify-between border-b border-rule/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/20 text-lg">
                            👵
                          </div>
                          <div>
                            <div className="font-display text-base font-bold text-cream">Today's Schedule</div>
                            <div className="font-mono text-[0.6rem] text-sand">Senior Mode · 24px+ Font</div>
                          </div>
                        </div>
                        <span className="rounded-full border border-forest/40 bg-forest/10 px-2.5 py-1 font-mono text-[0.62rem] font-bold text-forest">
                          {pillTaken ? "🟢 3/3 Doses Taken" : "🟡 2/3 Taken"}
                        </span>
                      </div>

                      {/* Medicine Card */}
                      <div className="mt-3.5 rounded-xl border border-forest/40 bg-ink/90 p-3.5">
                        <span className="rounded bg-forest/20 px-2 py-0.5 font-mono text-[0.65rem] font-bold text-forest">
                          19:00 · Evening Dose
                        </span>
                        <div className="mt-1 text-lg font-bold text-cream">Amlodipine 5mg (1 tab)</div>
                        <div className="text-[0.8rem] text-tan">Take after dinner · BP control</div>

                        <button
                          onClick={() => setPillTaken(!pillTaken)}
                          className={`mt-3 w-full rounded-lg py-2.5 font-display text-sm font-bold transition-all ${
                            pillTaken
                              ? "bg-forest/20 text-forest border border-forest/50"
                              : "bg-forest text-ink hover:scale-[1.02] shadow-[0_0_20px_rgba(143,212,158,0.4)]"
                          }`}
                        >
                          {pillTaken ? "✓ Marked as Taken" : "✓ Tap to Confirm: Taken"}
                        </button>
                      </div>

                      {/* Voice Assistant 'Cháu Bi' */}
                      <div className="mt-3 rounded-xl border border-white/10 bg-ink/70 p-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsVoicePlaying(true)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-ink text-sm font-bold"
                          >
                            {isVoicePlaying ? "🔊" : "🎙️"}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.82rem] font-bold text-cream">Voice AI "Cháu Bi"</div>
                            <p className="truncate text-[0.72rem] text-tan">
                              {isVoicePlaying ? "Speaking: Amlodipine dosage details..." : "Tap mic to ask questions"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. Caregiver Dashboard: Proportional Browser Window with 100% English UI */}
                {activeTab === "child" && (
                  <motion.div
                    key="child"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-[480px] overflow-hidden rounded-[20px] border border-white/15 bg-ink p-2 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                  >
                    {/* Browser Window Header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-rule/50 bg-ink-raised/60 rounded-t-[14px]">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <span className="mx-auto font-mono text-[0.65rem] text-sand">nhaminh.app/dashboard</span>
                    </div>

                    <div className="p-4 bg-ink-raised/90 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-ink/80 p-3.5">
                          <span className="font-mono text-[0.62rem] text-sand uppercase">Morning BP</span>
                          <div className="mt-1 text-2xl font-bold text-cream">
                            122/80 <span className="text-xs font-normal text-forest">mmHg</span>
                          </div>
                          <svg viewBox="0 0 100 20" className="mt-1.5 h-5 w-full stroke-forest" fill="none" strokeWidth={1.8}>
                            <path d="M0,10 L25,10 L30,2 L35,18 L40,6 L45,12 L50,10 L100,10" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-ink/80 p-3.5">
                          <span className="font-mono text-[0.62rem] text-sand uppercase">Blood Glucose</span>
                          <div className="mt-1 text-2xl font-bold text-cream">
                            6.1 <span className="text-xs font-normal text-tan">mmol/L</span>
                          </div>
                          <svg viewBox="0 0 100 20" className="mt-1.5 h-5 w-full stroke-tan" fill="none" strokeWidth={1.8}>
                            <path d="M0,12 Q25,6 50,11 T100,8" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      <div className="rounded-xl border border-rule/50 bg-ink/70 p-3.5">
                        <div className="font-mono text-[0.62rem] text-sand uppercase mb-1">Realtime Event Stream</div>
                        <div className="text-[0.82rem] text-tan">💊 Dad confirmed taking Amlodipine 5mg at 19:04</div>
                        <div className="mt-1 text-[0.74rem] text-sand">📅 Synced to Google Calendar & Tasks</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Gemini Vision OCR Scanner: 100% English UI */}
                {activeTab === "ocr" && (
                  <motion.div
                    key="ocr"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-[480px] overflow-hidden rounded-[20px] border border-forest/30 bg-ink p-5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-rule/60 pb-3">
                      <div className="font-display text-base font-bold text-cream">Gemini 2.5 Flash Vision OCR</div>
                      <span className="font-mono text-[0.65rem] text-forest">99.4% Extraction Accuracy</span>
                    </div>

                    <div className="mt-4 relative overflow-hidden rounded-xl border border-forest/30 bg-ink-raised/90 p-4">
                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-forest to-transparent shadow-[0_0_15px_#8FD49E]"
                      />
                      <div className="space-y-2 font-mono text-xs text-tan">
                        <div className="text-forest font-semibold">Structured Medication Schema (JSON):</div>
                        <div>• <span className="text-cream font-bold">Amlodipine 5mg</span>: 1 tab/day (Evening)</div>
                        <div>• <span className="text-cream font-bold">Metformin 500mg</span>: 2 tabs/day (Post-meal)</div>
                        <div>• <span className="text-cream font-bold">Atorvastatin 10mg</span>: 1 tab/day (Bedtime)</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono text-[0.68rem] text-sand">
                      <span>Latency: 1.14s</span>
                      <span className="text-forest">Safety Guardrail: PASSED</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Highlights & Engineering Pillars */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-5">
                <h3 className="font-display text-2xl font-bold text-cream">Key Engineering Pillars</h3>
                <ul className="space-y-4">
                  {[
                    "Zero-cognitive friction UI: 24px+ typography, high-contrast palette, and voice-first natural language interaction.",
                    "Multimodal AI pipeline: Gemini 2.5 Flash Vision structures handwritten medical prescriptions into verifiable schemas.",
                    "Deterministic medical safety guardrails: 5 invariant boundaries block unauthorized diagnosis and medication swapping.",
                    "Google Workspace integration: automated bi-directional synchronization with Google Calendar & Google Tasks.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[0.92rem] font-light leading-[1.68] text-tan">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-forest/20 text-forest text-[0.65rem] font-bold">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-rule/80">
                <Cta href="/nha-minh">Deep-Dive Case Study</Cta>
                <Cta
                  variant="secondary"
                  href="https://github.com/jak3rpham/ai-riser-namdosan"
                  arrow="up-right"
                >
                  Source Code
                </Cta>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
