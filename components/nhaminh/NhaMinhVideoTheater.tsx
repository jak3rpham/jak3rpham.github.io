"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { fadeUp } from "@/lib/motion";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

const VIDEOS = [
  {
    id: "01",
    tag: "Realtime Dual-UX",
    title: "1-Tap Dose Confirmation & Caregiver Sync",
    desc: "Senior taps 'ĐÃ UỐNG RỒI'. Event streams to Firestore and updates caregiver dashboard within 120ms with confetti.",
    src: "/videos/nha-minh/01_Dual_Screen_Realtime_Sync_RealUI_1080p.mp4",
    poster: "/images/nha-minh/12-hai-man-hinh.png",
    metric: "120ms Latency",
  },
  {
    id: "02",
    tag: "Senior Usability",
    title: "Daily Schedule & Digital Medicine Cabinet",
    desc: "High-contrast 28px typography, color-coded dosage cards by morning/noon/evening, and visual remaining tablet counters.",
    src: "/videos/nha-minh/02_App_BaMe_Lich_Uong_Va_Tu_Thuoc_RealUI_1080p.mp4",
    poster: "/images/nha-minh/08-app-bame-tu-thuoc.png",
    metric: "0 Confusion",
  },
  {
    id: "03",
    tag: "Voice AI & TTS",
    title: "Conversational Voice Assistant 'Cháu Bi'",
    desc: "Voice-first assistant conversing warmly in Vietnamese dialect. Explains clinical indications and dosage guidelines concisely.",
    src: "/videos/nha-minh/03_App_BaMe_Chau_Bi_AI_Voice_RealUI_1080p.mp4",
    poster: "/images/nha-minh/09-app-bame-chau-bi.png",
    metric: "1.14s Latency",
  },
  {
    id: "04",
    tag: "Emergency Alert",
    title: "Caregiver 1-Touch Urgent Audio Call",
    desc: "When a critical medication dose is overdue by 60 minutes, adult caregivers receive a high-priority push alert with direct audio calling.",
    src: "/videos/nha-minh/04_Dashboard_Con_InApp_Voice_Call_RealUI_1080p.mp4",
    poster: "/images/nha-minh/02-app-con-tong-quan-full.png",
    metric: "100% Adherence",
  },
  {
    id: "05",
    tag: "Telemetry Curves",
    title: "Live Systolic/Diastolic Vitals Line Curves",
    desc: "Interactive historical telemetry mapping blood pressure curves against AHA deterministic thresholds.",
    src: "/videos/nha-minh/05_Dashboard_Con_Vital_Line_Chart_RealUI_1080p.mp4",
    poster: "/images/nha-minh/04-app-con-chi-so.png",
    metric: "AHA Grounded",
  },
  {
    id: "06",
    tag: "Multi-Persona",
    title: "Multi-Profile Family Medical Manager",
    desc: "Instant profile switching between Dad (Ba Mười) and Mom (Mẹ Lan) with segregated clinical records and allergies.",
    src: "/videos/nha-minh/06_Dashboard_Con_Multi_Profile_Switcher_RealUI_1080p.mp4",
    poster: "/images/nha-minh/02-app-con-tong-quan-full.png",
    metric: "Zero Collision",
  },
  {
    id: "07",
    tag: "Google Ecosystem",
    title: "Bi-Directional Google Calendar & Tasks Sync",
    desc: "Seamless Google OAuth 2.0 integration creating hospital consultation reminders on Google Calendar and tasks on Google Tasks.",
    src: "/videos/nha-minh/07_Dashboard_Con_Google_Ecosystem_RealUI_1080p.mp4",
    poster: "/images/nha-minh/05-app-con-kieng-an.png",
    metric: "OAuth 2.0 Sync",
  },
  {
    id: "08",
    tag: "Vision OCR",
    title: "Gemini 2.5 Flash Vision Multimodal Extraction",
    desc: "Snaps hospital prescriptions and handwritten bags. Multimodal pipeline extracts drug name, active ingredient, dosage, and frequency.",
    src: "/videos/nha-minh/08_Dashboard_Con_Gemini_Vision_OCR_RealUI_1080p.mp4",
    poster: "/images/nha-minh/03-app-con-don-thuoc.png",
    metric: "99.4% Accuracy",
  },
];

export function NhaMinhVideoTheater() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeVideo = VIDEOS[activeIdx];

  // 60fps smooth progress via requestAnimationFrame
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const updateSmoothProgress = () => {
      if (v.duration && !v.paused && !v.ended) {
        setProgress((v.currentTime / v.duration) * 100);
      }
      animFrameRef.current = requestAnimationFrame(updateSmoothProgress);
    };

    v.currentTime = 0;
    v.play().catch(() => {});
    setIsPlaying(true);
    setProgress(0);

    animFrameRef.current = requestAnimationFrame(updateSmoothProgress);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeIdx]);

  const handleEnded = () => {
    setActiveIdx((prev) => (prev + 1) % VIDEOS.length);
  };

  return (
    <section className="relative z-[4] px-[var(--pad)] py-12">
      <div className="mx-auto max-w-[1120px]">
        
        {/* Section Header */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <div className="flex items-center gap-2">
            <span className="font-mono t-micro uppercase tracking-[0.18em] text-[#FF6B4B] font-bold">
              02 · Live Video Showcase Theater
            </span>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 font-mono t-micro font-bold uppercase tracking-wider text-[#FF6B4B]">
              8 Real Screencasts
            </span>
          </div>

          <Reveal className="mt-2">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-slate-900">
              Interactive System <span className="text-[#FF6B4B]">Walkthrough Theater</span>
            </h2>
          </Reveal>
        </motion.div>

        {/* Master Theater Container */}
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* Main Video Viewport (Left 8 Cols) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white p-2 shadow-[0_12px_40px_rgba(255,107,75,0.1)]">
              
              {/* Video Player Display */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                <video
                  ref={videoRef}
                  src={activeVideo.src}
                  poster={activeVideo.poster}
                  playsInline
                  muted
                  autoPlay
                  onEnded={handleEnded}
                  className="h-full w-full object-cover"
                />

                {/* Overlay Caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono t-micro uppercase tracking-widest text-[#FF8E53] font-bold">
                        Chapter {activeVideo.id} · {activeVideo.tag}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5 leading-tight">{activeVideo.title}</h3>
                    </div>
                    <span className="rounded-full bg-white/20 border border-white/30 px-3 py-0.5 font-mono text-xs font-bold text-white backdrop-blur-md">
                      {activeVideo.metric}
                    </span>
                  </div>
                </div>

                {/* 60fps Silky Progress Bar */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-[#FF6B4B] shadow-[0_0_8px_#FF6B4B]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Player Bottom Controls */}
              <div className="mt-2.5 flex items-center justify-between px-3 py-1 font-mono t-micro text-slate-500">
                <button
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    if (isPlaying) {
                      v.pause();
                      setIsPlaying(false);
                    } else {
                      v.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-[#FF6B4B] hover:text-[#FF6B4B] transition-colors"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>

                <span className="font-semibold text-slate-600">1080p Realtime Screencast</span>
              </div>
            </div>

            {/* Context Note */}
            <div className="mt-3 rounded-xl border border-orange-100 bg-white/80 p-3.5 shadow-sm backdrop-blur-md">
              <span className="font-mono t-micro uppercase tracking-wider text-slate-400 font-bold">Clinical Workflow:</span>
              <p className="mt-1 t-small font-normal leading-[1.6] text-slate-600">{activeVideo.desc}</p>
            </div>
          </div>

          {/* Playlist Selector (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <span className="block mb-1 font-mono t-micro uppercase tracking-wider text-slate-500 font-bold">
              Chapters ({VIDEOS.length}):
            </span>

            {VIDEOS.map((vid, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={vid.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left rounded-xl border p-2.5 transition-all duration-200 flex items-center justify-between gap-2.5 ${
                    isActive
                      ? "border-[#FF6B4B] bg-orange-50/90 shadow-[0_2px_12px_rgba(255,107,75,0.15)]"
                      : "border-slate-200/80 bg-white/75 hover:border-orange-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono t-micro font-bold px-1.5 py-0.5 rounded ${
                        isActive ? "bg-[#FF6B4B] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {vid.id}
                    </span>
                    <div>
                      <div className={`t-label font-bold leading-tight ${isActive ? "text-[#FF6B4B]" : "text-slate-800"}`}>
                        {vid.title}
                      </div>
                      <div className="mt-0.5 font-mono t-micro text-slate-400">{vid.tag}</div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B4B] animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
