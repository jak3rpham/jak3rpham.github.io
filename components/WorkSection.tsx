"use client";
import { motion } from "framer-motion";
import { SpotlightCard } from "./SpotlightCard";
import { HoverScrollShot } from "./HoverScrollShot";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";
import { fadeUp } from "@/lib/motion";

const COMPACT_PROJECTS = [
  {
    n: "02",
    title: "Badminton Payment Splitter",
    tags: "AI-directed build + Supabase · 2026",
    desc: "Solved a recurring group-payment friction point - built a live PWA that auto-generates a VietQR code per member and tracks payment status in real time.",
    img: "/images/badminton-preview.webp",
    urlLabel: "badminton-app-weld.vercel.app",
    live: "https://badminton-app-weld.vercel.app/",
    code: "https://github.com/jak3rpham/badminton-app",
  },
  {
    n: "03",
    title: "IELTS Studio",
    tags: "AI-directed build + Claude API · 2026",
    desc: "Built a full-stack IELTS practice platform with server-side AI grading for Writing tasks, multi-user auth, and graceful degradation with or without a configured database.",
    img: "/images/ielts-preview.webp",
    urlLabel: "ielts-test-kohl.vercel.app",
    live: "https://ielts-test-kohl.vercel.app/",
    code: "https://github.com/jak3rpham/Ielts-Test",
  },
];

export function WorkSection() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  return (
    <section ref={ref} id="work" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="stripes" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,9vw,7.5rem)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-11 border-b border-rule pb-6"
        >
          <h2 className="text-[clamp(2.8rem,5.6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Selected <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">work</span>
          </h2>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mb-6">
          <SpotlightCard className="overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A]">
            <div className="flex items-center gap-2 border-b border-rule bg-black/25 px-4 py-3">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-clay" />
              <span className="ml-2 font-mono text-[0.64rem] text-sand">uphub.vn</span>
            </div>
            <div className="aspect-[21/9] overflow-hidden">
              <img src="/images/uphub.webp" alt="uphub.vn" loading="lazy" className="h-full w-full object-cover object-top" />
            </div>
            <div className="flex flex-wrap justify-between gap-8 px-7 py-6">
              <div>
                <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-3xl font-bold text-transparent">01</span>
                <div className="mb-1 mt-1 text-[1.7rem] font-semibold text-cream">uphub.vn</div>
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">SEO Consulting · Freelance 2024 · EN / VI</div>
              </div>
              <div className="max-w-[52ch]">
                <p className="mb-3 text-[1rem] font-light leading-[1.7] text-tan">
                  Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301
                  redirect mapping with zero indexed traffic loss.
                </p>
                <a href="https://uphub.vn" target="_blank" rel="noreferrer" className="inline-block rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                  Visit ↗
                </a>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {COMPACT_PROJECTS.map((p) => (
            <SpotlightCard key={p.n} className="overflow-hidden rounded-[14px] border border-panel-border bg-[#18211A] pb-6">
              <HoverScrollShot src={p.img} alt={p.title} urlLabel={p.urlLabel} />
              <div className="px-6">
                <span className="mt-4 block bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-2xl font-bold text-transparent">
                  {p.n}
                </span>
                <div className="mb-1 text-[1.7rem] font-semibold text-cream">{p.title}</div>
                <div className="mb-3 font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">{p.tags}</div>
                <p className="mb-3 text-[1rem] font-light leading-[1.7] text-tan">{p.desc}</p>
                <div className="flex flex-wrap gap-2.5">
                  <a href={p.live} target="_blank" rel="noreferrer" className="rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                    Live ↗
                  </a>
                  <a href={p.code} target="_blank" rel="noreferrer" className="rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
                    Code ↗
                  </a>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-t border-rule py-8"
        >
          <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text font-serif-jp text-3xl font-bold text-transparent">
            04
          </span>
          <div>
            <div className="mb-1 text-[1.7rem] font-semibold text-cream">Open for freelance</div>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">Web · SEO · Video Production · 2026</div>
            <p className="max-w-[62ch] text-[1rem] font-light leading-[1.7] text-tan">
              End-to-end website builds from brief to live deployment. SEO audits, keyword strategy, brand video and photography.
              Selective availability, full ownership.
            </p>
          </div>
          <a href="mailto:pnthanh.work@gmail.com" className="whitespace-nowrap rounded-lg border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-amber transition-colors hover:border-amber hover:bg-amber hover:text-ink">
            Email →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
