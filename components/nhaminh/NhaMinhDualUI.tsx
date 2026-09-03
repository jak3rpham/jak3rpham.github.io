"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

export function NhaMinhDualUI() {
  const [activeTab, setActiveTab] = useState<"parent" | "child">("parent");
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 60fps smooth timer (6s duration)
  useEffect(() => {
    startTimeRef.current = Date.now();
    const DURATION = 6000;

    const tick = () => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        const p = Math.min(100, (elapsed / DURATION) * 100);
        setProgress(p);

        if (elapsed >= DURATION) {
          setActiveTab((prev) => (prev === "parent" ? "child" : "parent"));
          startTimeRef.current = Date.now();
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, isHovered]);

  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono t-micro uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            04 · Product Architecture
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              One Codebase, <span className="text-[#FF6B4B]">Two Radical Interfaces</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* Mode Switcher */}
        <div className="mt-6 flex justify-center">
          <div className="flex max-w-full overflow-x-auto rounded-full border border-orange-200 bg-white p-1 shadow-sm">
            {(
              [
                { id: "parent", label: "👵 App Ba Mẹ (Parent Mode · 60+)", shortLabel: "👵 App Ba Mẹ (60+)" },
                { id: "child", label: "📱 App Con (Caregiver Dashboard)", shortLabel: "📱 App Con (Caregiver)" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    startTimeRef.current = Date.now();
                    setProgress(0);
                  }}
                  className={`relative overflow-hidden rounded-full px-3 sm:px-5 py-2 font-mono text-xs uppercase tracking-wider transition-all shrink-0 ${
                    isActive
                      ? "bg-[#FF6B4B] font-bold text-white shadow-[0_2px_12px_rgba(255,107,75,0.35)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && !isHovered && (
                    <span
                      className="absolute bottom-0 left-0 top-0 bg-white/20"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Frame */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
        >
          {/* Visual Frame */}
          <div className="lg:col-span-7 h-[460px] min-h-[460px] flex items-center justify-center relative">
            {activeTab === "parent" ? (
              <div className="relative h-[440px] w-[220px] rounded-[30px] border-[3px] border-[#FF6B4B]/40 bg-white p-2 shadow-[0_16px_45px_rgba(255,107,75,0.18)] flex flex-col justify-between overflow-hidden">
                <div className="mx-auto mb-1 h-3 w-16 rounded-full bg-slate-900 shrink-0" />
                <div className="flex-1 w-full overflow-hidden rounded-[18px]">
                  <img
                    src="/images/nha-minh/07-app-bame-hom-nay.png"
                    alt="App Ba Me Senior Interface"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-orange-200 bg-white p-2 shadow-[0_16px_45px_rgba(255,107,75,0.15)]">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                    <span className="h-2 w-2 rounded-full bg-green-500/80" />
                  </div>
                  <span className="mx-auto font-mono t-micro text-slate-500">nhaminh.app/dashboard</span>
                </div>
                <div className="overflow-hidden rounded-b-xl">
                  <img
                    src="/images/nha-minh/02-app-con-tong-quan-full.png"
                    alt="App Con Caregiver Dashboard Overview"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Highlights */}
          <div className="lg:col-span-5 h-[460px] min-h-[460px] flex flex-col justify-center">
            <div className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur-md">
              <div className="font-mono t-micro uppercase tracking-wider text-[#FF6B4B] font-bold">
                {activeTab === "parent" ? "// Senior Accessibility" : "// Caregiver Telemetry"}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                {activeTab === "parent" ? "Zero Cognitive Load for Seniors" : "Clinical Oversight & Peace of Mind"}
              </h3>
              <ul className="mt-4 space-y-3 t-small font-normal leading-[1.6] text-slate-600">
                {activeTab === "parent" ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>24px+ Typography:</strong> Readable without reading glasses.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>Voice-First Assistant:</strong> Trợ lý "Cháu Bi" explains indications with polite tone.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>4 Dedicated Tabs:</strong> 💊 Hôm nay · 📦 Tủ thuốc · 🎙️ Hỏi cháu · 👤 Tôi.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>Live Vitals Curves:</strong> BP, glucose, and WHO threshold anomaly alerts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>Prescription Scanner:</strong> Snaps prescriptions to generate automated schedules.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF6B4B] font-bold">▸</span>
                      <span><strong>Realtime Sync Stream:</strong> Instant confirmation timestamps when meds are taken.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
