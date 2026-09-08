"use client";
import { motion, type Variants } from "framer-motion";
import { Reveal } from "../Reveal";
import { fadeUp } from "@/lib/motion";

const POST_BASE = "https://www.linkedin.com/feed/update/";

type Format = { name: string; audience: string; index: number; n: number };

const FORMATS: Format[] = [
  { name: "Customer case study", audience: "EN, named client problem", index: 100, n: 1 },
  { name: "Culture and event", audience: "EN, people and office", index: 55, n: 9 },
  { name: "Compliance explainer", audience: "EN, written for expats", index: 36, n: 3 },
  { name: "Labour law update", audience: "VI, written for HR and C&B", index: 28, n: 6 },
  { name: "Product feature", audience: "EN, capability led", index: 22, n: 4 },
  { name: "Company announcement", audience: "EN, holiday and certification", index: 21, n: 5 },
  { name: "Weekly news digest", audience: "Bilingual, recurring series", index: 17, n: 6 },
];

const READS = [
  {
    tag: "// Signal",
    title: "A named problem beat a named product",
    body: "One client's stuck attendance data pulled further than anything opening on what terra sells.",
  },
  {
    tag: "// Signal",
    title: "The recurring series was the weak link",
    body: "The most reliable thing on the calendar and the least read, six times running.",
  },
  {
    tag: "// Signal",
    title: "Language split the audience, not the topic",
    body: "Vietnamese reached HR and C&B, English reached expats and FDI. One update, two framings.",
  },
];

type Shot = { file: string; kind: string; alt: string; body: string; urn: string; w: number; h: number };

const SHOTS: Shot[] = [
  {
    file: "05-service-explainer-si-expat",
    w: 800,
    h: 800,
    kind: "Compliance explainer, EN",
    alt: "Infographic titled One-time Social Insurance Claim for Expatriates, showing a fast track path through paperwork",
    body: "For foreign employees leaving Vietnam who do not know they can still claim social insurance. The visual carries the argument, because this audience rarely clicks through.",
    urn: "urn:li:activity:7432268489056272384",
  },
  {
    file: "02-law-update-econtract-vi",
    w: 800,
    h: 450,
    kind: "Labour law update, VI",
    alt: "Vietnamese infographic on electronic labour contracts effective 1 July 2026, split into four rule panels",
    body: "Electronic labour contracts becoming mandatory. Four panels, each answering one question an HR lead actually asks.",
    urn: "urn:li:activity:7463423434203504640",
  },
  {
    file: "03-culture-appreciation-party",
    w: 800,
    h: 450,
    kind: "Culture, employer branding",
    alt: "Photograph of a printed Employee Appreciation Party table card in a bar setting",
    body: "Shot and selected on the night. Culture was the second strongest format on the page.",
    urn: "urn:li:activity:7462705429794684929",
  },
  {
    file: "04-seasonal-womens-day",
    w: 800,
    h: 1066,
    kind: "Seasonal",
    alt: "Photograph of an easel sign reading Warmth in a touch, Happy International Women's Day, surrounded by daisies",
    body: "The signage was designed first, then photographed as the post asset. One production run, two uses.",
    urn: "urn:li:activity:7436246993204576256",
  },
  {
    file: "07-event-recap-terra-say-hi",
    w: 800,
    h: 450,
    kind: "Event recap",
    alt: "Photograph of prepared fruit cups at the terra say Hi employee event, with branded signage behind",
    body: "An internal appreciation day, framed around what people received rather than who attended.",
    urn: "urn:li:activity:7384777680682008577",
  },
  {
    file: "06-culture-team-photo",
    w: 800,
    h: 450,
    kind: "The counterexample",
    alt: "Group photograph of the terra team holding branded gift envelopes in the office",
    body: "Cheapest culture post to make, reliably the weakest of the set. Kept here for that reason.",
    urn: "urn:li:activity:7431884416156663808",
  },
];

const rows: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export function TerraSocial() {
  return (
    <section id="social" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              The social <span className="text-forest">layer</span>
            </h2>
          </Reveal>
          <span className="font-mono t-micro uppercase tracking-[0.12em] text-sand">
            62 posts reviewed, Sep 2025 to Jun 2026
          </span>
        </div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 max-w-[64ch] t-lead font-light leading-[1.75] text-tan"
        >
          The buyers here are HR managers, C&B leads and CFOs at Japanese and European companies in Vietnam, which
          makes LinkedIn the channel that matters. I contributed copy alongside the Content Strategist, designed every
          visual, and read the reach each week to decide what came next.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="overflow-hidden rounded-[14px] border border-forest/40 bg-panel p-6 backdrop-blur-md md:p-10"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono t-micro uppercase tracking-[0.12em] text-forest">// Format performance</span>
            <span className="h-px flex-1 bg-forest/25" />
          </div>
          <p className="mb-2 max-w-[62ch] font-display text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-[1.35] tracking-[-0.01em] text-cream">
            Eight formats went out. They did not perform anything alike.
          </p>
          <p className="mb-9 max-w-[62ch] t-body font-light leading-[1.7] text-tan">
            Strongest format set to 100, the rest indexed against it. Absolute figures stay with the company.
          </p>
          <motion.div variants={rows} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {FORMATS.map((f, i) => (
              <motion.div
                key={f.name}
                variants={fadeUp}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-t border-rule py-4 last:border-b md:grid-cols-[minmax(190px,1.05fr)_minmax(110px,2fr)_84px]"
              >
                <div className="min-w-0">
                  <div className={i === 0 ? "t-body font-semibold text-cream" : "t-body font-medium text-cream/90"}>
                    {f.name}
                  </div>
                  <div className="mt-1 font-mono t-micro uppercase tracking-[0.06em] text-sand">{f.audience}</div>
                </div>

                <div className="order-3 col-span-2 md:order-none md:col-span-1">
                  <div className="h-[10px] w-full overflow-hidden rounded-[2px] bg-forest/15">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: f.index + "%" }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={i === 0 ? "h-full rounded-[2px] bg-cream" : "h-full rounded-[2px] bg-forest"}
                    />
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="t-lead font-semibold tracking-[-0.01em] text-cream">{f.index}</div>
                  <div className="font-mono t-micro text-sand">n={f.n}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-6 max-w-[64ch] t-body font-light leading-[1.7] text-sand">
            The case study rests on one post, so read 100 as a signal, not a ceiling. The digest is the sturdier finding.
          </p>
        </motion.div>

        <motion.div
          variants={rows}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {READS.map((r) => (
            <motion.div
              key={r.title}
              variants={fadeUp}
              className="rounded-[12px] border border-panel-border bg-panel p-6 backdrop-blur-md transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mb-3 font-mono t-micro uppercase tracking-[0.12em] text-forest">{r.tag}</div>
              <div className="mb-2.5 t-lead font-semibold leading-[1.3] text-cream">{r.title}</div>
              <p className="t-body font-light leading-[1.7] text-tan">{r.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16">
          <div className="mb-2 font-mono t-micro uppercase tracking-[0.12em] text-sand">// Selected posts</div>
          <p className="mb-7 max-w-[58ch] t-body font-light leading-[1.7] text-tan">
            All built against the brand system, sized for LinkedIn. Each links to the post it shipped in.
          </p>

          <motion.div
            variants={rows}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="columns-1 gap-5 sm:columns-2 lg:columns-3"
          >
            {SHOTS.map((s) => (
              <motion.a
                key={s.file}
                variants={fadeUp}
                href={POST_BASE + s.urn + "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-5 flex w-full break-inside-avoid flex-col overflow-hidden rounded-[14px] border border-panel-border bg-panel backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-forest/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <div className="overflow-hidden bg-ink-raised">
                  <img
                    src={"/images/terra-social/" + s.file + ".webp"}
                    alt={s.alt}
                    width={s.w}
                    height={s.h}
                    loading="lazy"
                    className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2.5 font-mono t-micro uppercase tracking-[0.1em] text-forest">{s.kind}</div>
                  <p className="flex-1 t-body font-light leading-[1.7] text-tan">{s.body}</p>
                  <span className="mt-5 font-mono t-micro uppercase tracking-[0.08em] text-sand transition-colors group-hover:text-forest">
                    View on LinkedIn
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}




