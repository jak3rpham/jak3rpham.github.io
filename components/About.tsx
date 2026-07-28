"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Lane = { n: string; t: string; d: string; go: string; href: string };

// Range proof: four disciplines actually shipped in, each pointing straight to a case.
const LANES: Lane[] = [
  {
    n: "01",
    t: "Growth & technical",
    d: "Technical SEO, data pipelines, GA4 and GSC dashboards, and full-funnel execution in EN and VI.",
    go: "terra-plat.vn",
    href: "/terra",
  },
  {
    n: "02",
    t: "Product & AI builds",
    d: "Shipped apps end to end: IELTS Studio with Claude API grading, a Badminton PWA on Supabase with live VietQR.",
    go: "Selected builds",
    href: "#work",
  },
  {
    n: "03",
    t: "AI orchestration",
    d: "Directing several AI models into one pipeline: from eleven raw generations to a finished music video.",
    go: "ある男",
    href: "/aru-otoko",
  },
  {
    n: "04",
    t: "Creative & film",
    d: "TVCs, music videos, and AI-directed video from brief to final cut. Two-time Top 1 TVC at Business Challenge.",
    go: "Video reel",
    href: "/video",
  },
];

function LaneRow({ lane }: { lane: Lane }) {
  const cls =
    "group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 border-t border-rule py-6 transition-colors hover:bg-forest/[0.03] md:grid-cols-[auto_1fr_auto] md:gap-8";
  const inner = (
    <>
      <span className="font-serif-jp text-[1.7rem] font-black leading-none text-forest">{lane.n}</span>
      <span className="min-w-0">
        <span className="block text-[1.25rem] font-medium text-cream">{lane.t}</span>
        <span className="mt-1.5 block max-w-[62ch] text-[0.98rem] font-light leading-[1.6] text-tan">{lane.d}</span>
      </span>
      <span className="col-start-2 flex items-center gap-1.5 justify-self-start font-mono text-[0.66rem] uppercase tracking-[0.1em] text-forest transition-transform duration-200 group-hover:translate-x-1 md:col-start-auto md:justify-self-end">
        {lane.go} <span aria-hidden>→</span>
      </span>
    </>
  );

  if (lane.href.startsWith("/")) {
    return (
      <Link href={lane.href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={lane.href} className={cls}>
      {inner}
    </a>
  );
}

export function About() {
  return (
    <section id="about" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <h2 className="font-display text-[clamp(1.7rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-cream md:whitespace-nowrap">
            One person, the <span className="text-forest">whole pipeline</span>.
          </h2>
        </Reveal>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-5 max-w-[56ch] text-[1.05rem] font-light leading-[1.7] text-tan"
        >
          Four lanes, four disciplines I actually ship in. Each one goes straight to the proof.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10"
        >
          {LANES.map((lane) => (
            <motion.div key={lane.n} variants={fadeUp}>
              <LaneRow lane={lane} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 border-t border-rule pt-6 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-sand">
          Ho Chi Minh City · UEH ISB B.Intl Business 2025 · IELTS 7.0 C1 · VI / EN
        </div>
      </div>
    </section>
  );
}
