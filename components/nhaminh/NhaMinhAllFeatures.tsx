"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

const FEATURES = [
  {
    num: "01",
    tag: "Multimodal OCR",
    title: "Gemini 2.5 Flash Vision Extraction",
    desc: "Snaps hospital prescriptions and handwritten medicine bag labels into verified JSON schemas.",
    img: "/images/nha-minh/03-app-con-don-thuoc.png",
    video: "/videos/nha-minh/08_Dashboard_Con_Gemini_Vision_OCR_RealUI_1080p.mp4",
    badge: "99.4% Accuracy",
  },
  {
    num: "02",
    tag: "Voice AI & TTS",
    title: "Voice Assistant 'Cháu Bi'",
    desc: "Empathetic senior AI companion handling colloquial dialects and answering medication queries.",
    img: "/images/nha-minh/09-app-bame-chau-bi.png",
    video: "/videos/nha-minh/03_App_BaMe_Chau_Bi_AI_Voice_RealUI_1080p.mp4",
    badge: "1.14s Latency",
  },
  {
    num: "03",
    tag: "Clinical Telemetry",
    title: "Live Vitals & AHA Threshold Analytics",
    desc: "Interactive systolic/diastolic blood pressure curves anchored in deterministic AHA clinical thresholds.",
    img: "/images/nha-minh/04-app-con-chi-so.png",
    video: "/videos/nha-minh/05_Dashboard_Con_Vital_Line_Chart_RealUI_1080p.mp4",
    badge: "AHA Grounded",
  },
  {
    num: "04",
    tag: "Safety Intelligence",
    title: "Food-Drug & Drug-Drug Checker",
    desc: "Cross-references prescribed medications with Vietnamese foods (e.g. Grapefruit + Amlodipine).",
    img: "/images/nha-minh/05-app-con-kieng-an.png",
    video: "/videos/nha-minh/07_Dashboard_Con_Google_Ecosystem_RealUI_1080p.mp4",
    badge: "CYP3A4 Engine",
  },
  {
    num: "05",
    tag: "Google Workspace",
    title: "Bi-Directional Calendar & Tasks Sync",
    desc: "OAuth 2.0 integration automatically creating Google Calendar schedules and Google Tasks checklists.",
    img: "/images/nha-minh/02-app-con-tong-quan-full.png",
    video: "/videos/nha-minh/07_Dashboard_Con_Google_Ecosystem_RealUI_1080p.mp4",
    badge: "OAuth 2.0 Sync",
  },
  {
    num: "06",
    tag: "Senior Usability",
    title: "Simplified Digital Medicine Cabinet",
    desc: "Visual medicine inventory featuring high-contrast pill icons and remaining tablet counters.",
    img: "/images/nha-minh/08-app-bame-tu-thuoc.png",
    video: "/videos/nha-minh/02_App_BaMe_Lich_Uong_Va_Tu_Thuoc_RealUI_1080p.mp4",
    badge: "0 Confusion",
  },
];

export function NhaMinhAllFeatures() {
  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        
        {/* Heading */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
            04 · Core Capabilities
          </span>
          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              Complete Feature & <span className="text-[#FF6B4B]">System Suite</span>
            </h2>
          </Reveal>
          <p className="mt-2 max-w-[62ch] text-[0.96rem] font-normal leading-[1.65] text-slate-600">
            Every core capability of Nhà Mình is built with authentic healthcare workflows, validated by real screencasts and multimodal AI pipelines.
          </p>
        </motion.div>

        {/* 2-Column Balanced Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((feat) => (
            <motion.div
              key={feat.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="overflow-hidden rounded-2xl border border-orange-200/90 bg-white/95 p-3 shadow-[0_8px_30px_rgba(255,107,75,0.08)] backdrop-blur-xl flex flex-col justify-between h-full transition-all hover:border-[#FF6B4B]/50 hover:shadow-[0_12px_36px_rgba(255,107,75,0.15)]">
                
                {/* 16:9 Video Container */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                  <video
                    src={feat.video}
                    poster={feat.img}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 font-mono text-[0.6rem] font-bold text-white backdrop-blur-md">
                    {feat.badge}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.62rem] uppercase tracking-widest text-[#FF6B4B] font-bold">
                      // {feat.tag}
                    </span>
                    <span className="font-serif-jp text-base font-bold text-[#FF6B4B]">{feat.num}</span>
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-slate-900 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[0.84rem] font-normal leading-[1.6] text-slate-600">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
