"use client";
import { motion, type Variants } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

type ScopeCard = { tag: string; title: string; body: string };

const CARDS: ScopeCard[] = [
  {
    tag: "// Reporting",
    title: "Reporting into decisions",
    body: "Built and delivered the recurring performance reporting used by the team and by the BOD to set quarterly and annual direction. Reports ran on GSC, GA4, and PageSpeed pipelines via MCP and API, each with extracted insight and recommended next actions.",
  },
  {
    tag: "// Change process",
    title: "Website change briefs",
    body: "Owned the site change process: wrote briefs specifying what to change, why, and the expected outcome, each backed by performance data, then implemented and measured the result.",
  },
  {
    tag: "// Paid media",
    title: "Paid media, honest scope",
    body: "Facebook Ads and Google Ads at execution level: campaign setup and A/B testing, not strategy ownership. The strength sat underneath, in reporting and insight extraction on MCP and API pipelines that turned ad and search data into the next cycle's decision.",
  },
  {
    tag: "// Social",
    title: "Social execution & measurement",
    body: "Produced terra's social output on brief from the Content Strategist: social posts, Facebook ad creative, video, shorts and reels, and on-site banners. Channel planning and page management sat with the Strategist; production and the measurement layer were mine. Social metrics fed the same MCP and API reporting pipeline as search, web, and paid, so every channel reported through one system.",
  },
  {
    tag: "// Email automation",
    title: "Marketing automation",
    body: "Built email flows in Bizfly: automation sequences with conditional logic and triggers, wired to the whitepaper and CRM lead capture. Flow and automation setup was mine; email content was owned by the Content / Email Strategist.",
  },
];

const CREATIVE = [
  "Service brochures",
  "Ad creative (paid social + search)",
  "Service videos",
  "Service & event banners",
  "Internal event banners · Tết lì xì design",
  "Event photo & video",
  "Seminar / webinar production",
  "Internal music & performance videos",
];

const rowsContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export function TerraScope() {
  return (
    <section id="scope" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Full <span className="text-forest">scope</span>
            </h2>
          </Reveal>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 max-w-[64ch] text-[1.1rem] font-light leading-[1.75] text-tan"
        >
          Growth was the headline, not the whole job. Around it ran a full operating scope: compliance verification,
          board-level reporting, a documented change process, paid and social execution, marketing automation, and in-house
          creative, all run by one person.
        </motion.p>

        {/* B1: regulatory & cross-functional verification: highest-value, its own block */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 overflow-hidden rounded-[14px] border border-forest/40 bg-panel p-8 backdrop-blur-md md:p-10"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-forest">// Regulatory verification</span>
            <span className="h-px flex-1 bg-forest/25" />
          </div>
          <p className="max-w-[62ch] font-display text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-[1.35] tracking-[-0.01em] text-cream">
            Every claim shipped had to survive expert review.
          </p>
          <p className="mt-5 max-w-[62ch] text-[1.08rem] font-light leading-[1.8] text-tan">
            Worked directly with the Payroll and IT teams to verify payroll calculation logic and to confirm that all website
            content complied with Vietnamese labour law before publishing. In a category where wrong content is a legal risk,
            marketing could not run ahead of the experts.
          </p>
        </motion.div>

        {/* B2–B5 operational scope */}
        <motion.div
          variants={rowsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {CARDS.map((c) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              className="rounded-[12px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mb-3 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-forest">{c.tag}</div>
              <div className="mb-2.5 text-[1.15rem] font-semibold text-cream">{c.title}</div>
              <p className="text-[0.98rem] font-light leading-[1.7] text-tan">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* B6: Japanese-language content, one line */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-8 max-w-[64ch] border-l-2 border-forest/50 pl-4 text-[0.98rem] font-light leading-[1.7] text-sand"
        >
          Maintained and updated the Japanese-language content alongside the VI and EN builds, in collaboration with a
          Japanese colleague.
        </motion.p>

        {/* B7: in-house creative production */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-14"
        >
          <div className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-sand">// In-house creative output</div>
          <p className="mb-5 max-w-[56ch] text-[1.02rem] font-light leading-[1.7] text-tan">
            Creative production ran alongside the growth work, one person covering both.
          </p>
          <div className="flex flex-wrap gap-2">
            {CREATIVE.map((c) => (
              <span key={c} className="rounded-full border border-rule px-3.5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-tan">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
