"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SpotlightCard } from "./SpotlightCard";
import { Cta } from "./Cta";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { fadeUp } from "@/lib/motion";

/**
 * `spec` is the card's fixed slot set, not free text. Every card fills the same three columns,
 * so a build with a long stack line and one with a short one still produce the same block, and
 * the eye can compare across the row instead of re-reading each card's layout. It replaces the
 * old single `tags` string, which was doing three jobs at three different lengths.
 */
type Project = {
  n: string;
  title: string;
  spec: { role: string; stack: string; year: string };
  desc: string;
  img: string;
  links: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    n: "01",
    title: "Nhà Mình",
    spec: { role: "Healthcare AI", stack: "Gemini 2.5 Flash · React · Cloud Run", year: "2026" },
    desc: "A family healthcare companion with dual UX for seniors and caregivers, prescription OCR, a voice assistant, and medical guardrails.",
    img: "/images/nha-minh-preview.webp",
    links: [
      { label: "Case study", href: "/nha-minh" },
      { label: "Code", href: "https://github.com/jak3rpham/ai-riser-namdosan" },
    ],
  },
  {
    n: "02",
    title: "uphub.vn",
    spec: { role: "SEO consulting", stack: "Freelance · EN / VI", year: "2024" },
    desc: "Metadata audit and rebuild across 18 bilingual variants, keyword gap analysis, H1 and slug restructuring, 301 mapping with zero traffic loss.",
    img: "/images/uphub.webp",
    links: [{ label: "Visit", href: "https://uphub.vn" }],
  },
  {
    n: "03",
    title: "Badminton Splitter",
    spec: { role: "AI-directed build", stack: "Supabase · PWA · VietQR", year: "2026" },
    desc: "A group payment and debt ledger PWA with live VietQR and MoMo generation, surplus fund tracking, and realtime synchronisation.",
    img: "/images/badminton-preview.webp",
    links: [
      { label: "Live", href: "https://badminton-app-weld.vercel.app/" },
      { label: "Code", href: "https://github.com/jak3rpham/badminton-app" },
    ],
  },
  {
    n: "04",
    title: "IELTS Studio",
    spec: { role: "AI-directed build", stack: "Claude API · Full-stack", year: "2026" },
    desc: "An IELTS practice platform with server-side AI grading for Writing, multi-user auth, and graceful degradation without a database.",
    img: "/images/ielts-preview.webp",
    links: [
      { label: "Case study", href: "/ielts-studio" },
      { label: "Live", href: "https://ielts-test-kohl.vercel.app/" },
      { label: "Code", href: "https://github.com/jak3rpham/Ielts-Test" },
    ],
  },
];

/**
 * One card, and every card is the same card.
 *
 * What was wrong was not the styling, it was that the layout was a function of the content. The
 * image was `flex-1`, so a project with a longer description got a shorter image and the four
 * of them lined up at four different heights; the index numeral was printed over the screenshot,
 * where three of the four were too busy to read it against; and the tag line was one free string
 * doing three jobs, so it wrapped on some cards and not others. Every slot below has a size that
 * does not depend on what is in it: a fixed image window, a one line title, a one line stack, a
 * description clamped to three, and an action rail pushed to the floor by `mt-auto`.
 *
 * The screenshots are the other half of it, and the treatment on them is explained at the image
 * window below.
 */
function ProjectPanel({ p }: { p: Project }) {
  return (
    <SpotlightCard className="group flex h-auto min-h-[460px] w-full flex-col overflow-hidden rounded-[16px] border border-panel-border bg-ink-raised transition-colors duration-300 hover:border-forest/50 lg:h-[66vh] lg:w-[min(86vw,760px)] lg:shrink-0">
      <div className="relative h-[210px] sm:h-[260px] lg:h-[52%] shrink-0 overflow-hidden border-b border-panel-border bg-ink">
        {/* The unifier is a desaturation on the image itself, released on hover. Four products in
            four brand palettes sitting side by side read as a clipping file; held near grey they
            read as one body of work, and the colour comes back when one is looked at.

            It was a forest `mix-blend-color` first, which unified harder but painted everything
            the page's own green. Desaturating leaves each shot its own value structure and only
            takes the argument out of it. A slight contrast lift because three of the four are
            light UI on a white card, and grey alone would let them go soft.

            The rest state is a class, not an inline style. It was inline first and the hover
            never fired: an inline style beats any class, so `group-hover:[filter:...]` had
            nothing it could override and the colour never came back.

            There was a wash under this as well, and it had to go: this section is on paper, where
            the ink token IS the paper, so washing toward it took those three from a mean
            luminance of 230 to 240 against a white card and the window disappeared. The border
            does that job now, at no cost to the picture. */}
        <img
          src={p.img}
          alt={p.title}
          loading="lazy"
          className="shot absolute inset-0 h-full w-full object-cover object-top transition-[filter,transform] duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col px-5 sm:px-7 pb-6 pt-5">
        {/* index rail: the numeral on the panel ground, where it is actually readable */}
        <div className="flex items-baseline gap-4">
          <span className="font-serif-jp text-[2.1rem] font-black leading-none text-forest">{p.n}</span>
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono t-micro uppercase tracking-[0.16em] text-sand">{p.spec.role}</span>
          <span className="font-mono t-micro uppercase tracking-[0.16em] text-sand/70">{p.spec.year}</span>
        </div>

        <h3 className="mt-4 truncate text-[1.6rem] font-semibold leading-tight text-cream">{p.title}</h3>
        <div className="mt-1.5 truncate font-mono t-micro uppercase tracking-[0.08em] text-forest">
          {p.spec.stack}
        </div>
        <p className="mt-3 line-clamp-3 t-small font-light leading-[1.6] text-tan">{p.desc}</p>

        <div className="mt-auto flex flex-wrap gap-2.5 border-t border-rule pt-5">
          {p.links.map((l) => {
            const external = l.href.startsWith("http");
            return (
              <a
                key={l.label}
                href={l.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="rounded-full border border-rule px-4 py-2.5 font-mono t-micro uppercase tracking-[0.08em] text-forest transition-colors hover:border-forest hover:bg-forest hover:text-ink"
              >
                {l.label} <span aria-hidden>{external ? "↗" : "→"}</span>
              </a>
            );
          })}
        </div>
      </div>
    </SpotlightCard>
  );
}

function Heading() {
  return (
    <div className="flex shrink-0 flex-col justify-center">
      <span className="mb-4 font-mono t-micro uppercase tracking-[0.18em] text-forest">Selected work · 01-04</span>
      <h2 className="font-display text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.04em] text-cream">
        Things I&apos;ve
        <br />
        <span className="inline-block pb-[0.12em] text-forest">shipped</span>
      </h2>
      <p className="mt-6 max-w-[32ch] t-body font-light leading-[1.6] text-tan">
        AI-directed healthcare apps, freelance SEO, and full-funnel product builds.
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
    <div className="w-full rounded-[16px] border border-rule bg-ink-raised p-6 sm:p-9">
      <span className="font-serif-jp text-3xl font-bold text-forest">05</span>
      <div className="mb-1 mt-3 text-[1.9rem] font-semibold text-cream">Open for freelance</div>
      <div className="mb-3 font-mono t-micro uppercase tracking-[0.06em] text-sand">Web · AI Integration · Product · 2026</div>
      <p className="mb-6 max-w-[52ch] t-body font-light leading-[1.7] text-tan">
        End-to-end website builds from brief to live deployment. Fullstack AI integrations, SEO architecture, brand video and design systems.
      </p>
      <Cta href="mailto:pnthanh.work@gmail.com">Email</Cta>
    </div>
  );
}
