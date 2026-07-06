"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SpotlightCard } from "./SpotlightCard";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { fadeUp } from "@/lib/motion";

type Project = {
  n: string;
  title: string;
  tags: string;
  desc: string;
  img: string;
  urlLabel: string;
  links: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    n: "01",
    title: "uphub.vn",
    tags: "SEO Consulting · Freelance 2024 · EN / VI",
    desc: "Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301 redirect mapping with zero indexed traffic loss.",
    img: "/images/uphub.webp",
    urlLabel: "uphub.vn",
    links: [{ label: "Visit ↗", href: "https://uphub.vn" }],
  },
  {
    n: "02",
    title: "Badminton Payment Splitter",
    tags: "AI-directed build + Supabase · 2026",
    desc: "Solved a recurring group-payment friction point: a live PWA that auto-generates a VietQR code per member and tracks payment status in real time.",
    img: "/images/badminton-preview.webp",
    urlLabel: "badminton-app-weld.vercel.app",
    links: [
      { label: "Live ↗", href: "https://badminton-app-weld.vercel.app/" },
      { label: "Code ↗", href: "https://github.com/jak3rpham/badminton-app" },
    ],
  },
  {
    n: "03",
    title: "IELTS Studio",
    tags: "AI-directed build + Claude API · 2026",
    desc: "A full-stack IELTS practice platform with server-side AI grading for Writing tasks, multi-user auth, and graceful degradation with or without a configured database.",
    img: "/images/ielts-preview.webp",
    urlLabel: "ielts-test-kohl.vercel.app",
    links: [
      { label: "Live ↗", href: "https://ielts-test-kohl.vercel.app/" },
      { label: "Code ↗", href: "https://github.com/jak3rpham/Ielts-Test" },
    ],
  },
];

function ProjectPanel({ p }: { p: Project }) {
  return (
    <SpotlightCard className="group flex h-[66vh] w-[min(86vw,860px)] shrink-0 flex-col overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised transition-colors duration-300 hover:border-forest/50">
      <div className="relative flex-1 overflow-hidden">
        <img src={p.img} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <span className="pointer-events-none absolute left-6 top-4 font-serif-jp text-[4rem] font-black leading-none text-forest/90 mix-blend-screen">
          {p.n}
        </span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 px-7 py-6">
        <div className="max-w-[46ch]">
          <div className="mb-1 text-[1.7rem] font-semibold leading-tight text-cream">{p.title}</div>
          <div className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-sand">{p.tags}</div>
          <p className="text-[0.98rem] font-light leading-[1.65] text-tan">{p.desc}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {p.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-forest transition-colors hover:border-forest hover:bg-forest hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}

function Heading() {
  return (
    <div className="flex shrink-0 flex-col justify-center">
      <span className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-forest">Selected work · 01—04</span>
      <h2 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.04em] text-cream">
        Things I&apos;ve
        <br />
        <span className="inline-block pb-[0.12em] text-forest">shipped</span>
      </h2>
      <p className="mt-6 max-w-[32ch] text-[1.05rem] font-light leading-[1.6] text-tan">
        Freelance SEO, AI-directed builds, and full-funnel product work.
      </p>
    </div>
  );
}

export function WorkSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const hijack = !isMobile && !reduce;

  useEffect(() => {
    if (!hijack) return;
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [hijack]);

  if (!hijack) {
    return (
      <section id="work" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
        <div className="mx-auto max-w-[1400px]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mb-12">
            <Heading />
          </motion.div>
          <div className="flex flex-col gap-8 [perspective:1600px]">
            {PROJECTS.map((p) => (
              <ProjectPanel key={p.n} p={p} />
            ))}
            <FreelanceRow />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="relative z-[4]">
      <div ref={wrapRef} className="relative h-[100dvh] overflow-hidden">
        {/* giant faint backdrop word, stays put behind the moving track */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-[var(--pad)] select-none font-display text-[22vw] font-extrabold leading-none tracking-[-0.05em] text-cream/[0.03]"
        >
          WORK
        </span>
        <div ref={trackRef} className="flex h-full items-center gap-10 px-[var(--pad)] [perspective:1600px] will-change-transform">
          <div className="flex h-[66vh] w-[min(84vw,620px)] shrink-0 items-center pr-10">
            <Heading />
          </div>
          {PROJECTS.map((p) => (
            <ProjectPanel key={p.n} p={p} />
          ))}
          <div className="flex h-[66vh] w-[min(84vw,600px)] shrink-0 items-center">
            <FreelanceRow />
          </div>
        </div>
      </div>
    </section>
  );
}

function FreelanceRow() {
  return (
    <div className="w-full rounded-[16px] border border-rule bg-ink-raised p-9">
      <span className="font-serif-jp text-3xl font-bold text-forest">04</span>
      <div className="mb-1 mt-3 text-[1.9rem] font-semibold text-cream">Open for freelance</div>
      <div className="mb-3 font-mono text-[0.64rem] uppercase tracking-[0.06em] text-sand">Web · SEO · Video Production · 2026</div>
      <p className="mb-6 max-w-[52ch] text-[1rem] font-light leading-[1.7] text-tan">
        End-to-end website builds from brief to live deployment. SEO audits, keyword strategy, brand video and photography.
        Selective availability, full ownership.
      </p>
      <a
        href="mailto:pnthanh.work@gmail.com"
        className="inline-flex rounded-full bg-forest px-6 py-3.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink transition-transform duration-200 hover:-translate-y-0.5"
      >
        Email →
      </a>
    </div>
  );
}
