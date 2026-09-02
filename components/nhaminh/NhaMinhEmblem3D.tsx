"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";
import { WebGLNhaMinh3D } from "@/components/WebGLNhaMinh3D";

export function NhaMinhEmblem3D() {
  return (
    <section className="relative z-[4] px-[var(--pad)] py-14">
      <div className="mx-auto max-w-[1120px]">
        {/* Section Heading */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            04 · Multimodal AI & Visual Architecture
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              The Living Telemetry Core: <span className="text-[#FF6B4B]">Heartbeat & Orbit</span>
            </h2>
          </Reveal>
          <p className="mt-4 max-w-[68ch] text-[0.98rem] font-normal leading-[1.7] text-slate-600">
            A real-time 3D simulation embodying Nhà Mình&rsquo;s core philosophy: continuous caregiver synchronization, multimodal Gemini OCR vision processing, and deterministic vital sign safeguards.
          </p>
        </motion.div>

        {/* Large Prominent 3D Showcase Stage */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/40 to-white p-6 shadow-[0_20px_50px_rgba(255,107,75,0.12)] backdrop-blur-xl md:p-10"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Left Big 3D Stage (7 Cols) */}
            <div className="relative lg:col-span-7 flex flex-col items-center justify-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 blur-[100px]"
                style={{ background: "radial-gradient(circle, rgba(255,107,75,0.25), transparent 70%)" }}
              />
              <div className="w-full h-[340px] sm:h-[400px] lg:h-[440px] relative flex items-center justify-center">
                <WebGLNhaMinh3D className="h-full w-full" />
              </div>
              <div className="mt-2 text-center font-mono text-[0.66rem] uppercase tracking-[0.16em] text-slate-500">
                Real-Time WebGL · Diastolic/Systolic Pulse Engine · Interactive 3D Model
              </div>
            </div>

            {/* Right Architectural Telemetry Pillars (5 Cols) */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-sm">🫀</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900">Biomimetic Double Pulse</h4>
                    <span className="font-mono text-[0.62rem] text-slate-400">Systole + Diastole Engine</span>
                  </div>
                </div>
                <p className="mt-2 text-[0.8rem] font-normal leading-[1.6] text-slate-600">
                  Simulates continuous blood pressure and vital metric streaming from connected home monitors.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm">🪐</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900">Orbiting Telemetry Halo</h4>
                    <span className="font-mono text-[0.62rem] text-slate-400">Bi-Directional OAuth Sync</span>
                  </div>
                </div>
                <p className="mt-2 text-[0.8rem] font-normal leading-[1.6] text-slate-600">
                  Automated OAuth 2.0 pipelines keeping Google Calendar events & Google Tasks in continuous sync.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">🟢</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900">Dual Multimodal Satellites</h4>
                    <span className="font-mono text-[0.62rem] text-slate-400">Parent (Emerald) · Child (Sky)</span>
                  </div>
                </div>
                <p className="mt-2 text-[0.8rem] font-normal leading-[1.6] text-slate-600">
                  Synchronous role-based delivery: 24px+ Senior Mode with "Cháu Bi" AI and realtime Caregiver streams.
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
