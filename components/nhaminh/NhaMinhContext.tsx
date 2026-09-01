"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function NhaMinhContext() {
  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        
        {/* Section Heading */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            01 · Master Portal & Architectural Challenge
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              The Dual-Persona Healthcare <span className="text-[#FF6B4B]">Portal Architecture</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* 2-Column Split: Left (Context Points) · Right (Compact Master Portal Preview) */}
        <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Left Context Points (6 Cols) */}
          <div className="lg:col-span-6 space-y-3.5">
            <p className="text-[0.96rem] font-normal leading-[1.68] text-slate-600">
              Over 13 million seniors in Vietnam manage 2 to 4 chronic medications daily. Existing software is engineered for young digital natives with tiny fonts and cold clinical jargon.
            </p>

            <div className="space-y-3">
              {[
                {
                  icon: EyeIcon,
                  title: "Cognitive & Vision Gap",
                  desc: "Seniors struggle with complex touch targets. 24px+ typography and high-contrast colors eliminate errors.",
                  color: "text-amber-600 bg-amber-50 border-amber-200",
                },
                {
                  icon: UsersIcon,
                  title: "Long-Distance Caregiver Worry",
                  desc: "Adult children in distant metropolitan hubs receive instant realtime verification timestamps.",
                  color: "text-sky-600 bg-sky-50 border-sky-200",
                },
                {
                  icon: ShieldIcon,
                  title: "Deterministic Safety Over AI Malpractice",
                  desc: "5 invariant boundaries prevent dosage hallucinations and cross-check food-drug interactions.",
                  color: "text-emerald-600 bg-emerald-50 border-emerald-200",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-orange-100 bg-white/85 p-3.5 shadow-sm backdrop-blur-md"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.color}`}>
                      <Icon />
                    </div>
                    <div>
                      <h4 className="font-display text-[0.92rem] font-bold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-[0.82rem] font-normal leading-[1.55] text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Compact Master Portal Preview (6 Cols) */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white/95 p-2 shadow-[0_12px_40px_rgba(255,107,75,0.12)] backdrop-blur-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-orange-50/50">
                <img
                  src="/images/nha-minh/landing-hero.webp"
                  alt="Nhà Mình Master Landing Portal Interface"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="flex items-center justify-between px-3 py-2 font-mono text-[0.68rem] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4B]" />
                  Multi-Role Portal Entry
                </span>
                <span className="font-bold text-[#FF6B4B]">Senior · Caregiver · Judge</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
