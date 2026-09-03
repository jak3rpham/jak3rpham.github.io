"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useScramble } from "@/lib/useScramble";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Cta } from "./Cta";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } },
};
const letter: Variants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {text.split("").map((c, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" style={{ lineHeight: 0.95 }}>
          <motion.span variants={letter} className="inline-block">
            {c === " " ? " " : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// The four disciplines, previewed here and expanded with proof in the About lanes below.
const RANGE = ["SEO & data", "Product builds", "AI orchestration", "Video"];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { display, isScrambling, trigger } = useScramble("Pham Ngoc Thanh");
  const isTouch = !hoverCapable;
  const d1 = isTouch ? 0.1 : 0.9;
  const d2 = isTouch ? 0.2 : 1.05;
  const d3 = isTouch ? 0.3 : 1.2;
  const d4 = isTouch ? 0.4 : 1.4;

  return (
    <section
      id="hero"
      className="relative grid h-full min-h-[100dvh] grid-cols-1 items-center gap-8 sm:gap-14 overflow-hidden px-[var(--pad)] pb-12 pt-20 sm:pb-20 sm:pt-24 md:grid-cols-[1.5fr_1fr] md:gap-12 md:pl-[clamp(2.5rem,8vw,8rem)]"
    >
      {/* No scroll driven parallax here any more. HeroStage pins this whole screen and spends
          the scroll on the card instead, so a `useScroll` against this section would sit at
          zero forever, and an internal drift under a shrinking card reads as two motions
          fighting. What is left is the arrival.

          The scrim is the card's surface, and it is what makes the closing frame legible: the
          artwork behind the stage does not move, so an unpainted card would shut against an
          identical background and the move would be invisible. HeroStage wraps this in
          `theme-ink`, so these are ink values on a page that is paper throughout: the container
          is the dark thing and the frame closing on it uncovers light that was always behind.

          Heavier and flatter than it was. The artwork behind is inverted on paper, so what shows
          through a thin right hand end is a PALE image under a dark wash, which greys the
          container instead of texturing it. The sequence is the reveal now, not the underlay. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink/96 via-ink/92 to-ink/86" />

      {/* HeroStage publishes --hero-fade as its frame closes; the copy leaves ahead of it so the
          clip never crops a sentence in half. A var rather than a subscriber of its own, so the
          stage stays the only thing reading the scroll on this screen. */}
      <div
        className="relative z-[3] max-w-[48rem] will-change-[opacity]"
        style={{ opacity: "calc(1 - var(--hero-fade, 0))" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d1, duration: 0.6 }}
          className="mb-5 sm:mb-7 flex items-center gap-4 text-sand"
        >
          <span className="font-mono t-label uppercase tracking-[0.18em]">Growth, product &amp; video</span>
          <span className="h-px w-10 flex-none bg-rule" />
          <span className="flex items-baseline gap-1.5">
            <b className="font-serif-jp t-lead font-bold text-forest">達樹</b>
            <span className="font-mono t-label uppercase tracking-[0.18em]">Tatsuki</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isTouch ? 0.15 : 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative whitespace-normal sm:whitespace-nowrap font-display text-[clamp(2.1rem,6.2vw,4.7rem)] font-extrabold leading-[1.02] sm:leading-[0.95] tracking-[-0.04em] text-cream"
          onMouseEnter={hoverCapable && !reduceMotion ? trigger : undefined}
        >
          {isScrambling ? (
            <span aria-hidden>{display}</span>
          ) : (
            <span>
              Pham Ngoc <span className="text-forest">Thanh</span>
            </span>
          )}
          <span className="sr-only">Pham Ngoc Thanh</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d2, duration: 0.6 }}
          className="mt-5 sm:mt-7 max-w-[46rem] text-[clamp(1.15rem,1.8vw,1.55rem)] font-light leading-[1.5] text-tan"
        >
          <strong className="font-medium text-cream">Technical</strong> enough to <span className="text-forest">build it</span>,{" "}
          <strong className="font-medium text-cream">creative</strong> enough to <span className="text-forest">film it</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d3, duration: 0.6 }}
          className="mt-7 sm:mt-9 flex flex-wrap items-center gap-4"
        >
          <Cta href="#work" size="lg">See the work</Cta>
          <Cta href="#contact" variant="secondary" size="lg">Get in touch</Cta>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d4, duration: 0.6 }}
          className="mt-8 sm:mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-5"
        >
          {RANGE.map((r) => (
            <span key={r} className="font-mono t-micro uppercase tracking-[0.14em] text-sand">
              {r}
            </span>
          ))}
        </motion.div>
      </div>

      {/* The marker HeroStage aims its closing frame at is this plain wrapper, and the entry
          animation is on the child. They used to be the same element, which meant the thing
          being measured was also the thing carrying a transform: the frame was aimed at wherever
          the portrait happened to be on its way in, and when it settled somewhere else the frame
          closed on empty scrim with the picture outside it. Nothing transforms this box. */}
      {/* Portrait photo: On mobile, displayed cleanly without special motion delays; on desktop, serves as the target for the pinned closing frame */}
      <div
        data-hero-portrait
        className="relative z-[3] mx-auto aspect-[4/5] w-[min(60vw,240px)] sm:w-[min(64vw,280px)] lg:w-[min(64vw,312px)] mt-4 lg:mt-0"
      >
        {/* Opacity only. It used to rise 40px as well, and for the first second and a half of the
            page that put the picture 40px below the frame that closes on it; a reader who flicked
            straight down saw the frame shut on empty scrim. Nothing inside this box may move. */}
        <motion.div
          initial={{ opacity: isTouch ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: isTouch ? 0.2 : 1, delay: isTouch ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-serif-jp text-[8rem] font-black leading-none text-cream/[0.06]"
        >
          達樹
        </span>
        {/* a lighter drop than it carried on ink: this screen is paper now, and a 0.5 black at 70px
              reads as a bruise under a card on white */}
          <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-panel-border shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <img
            src="/images/hero-portrait.webp"
            alt="Pham Ngoc Thanh"
            className="h-full w-full object-cover object-top [filter:saturate(0.96)_contrast(1.02)]"
          />
        </div>
      </motion.div>
      </div>
    </section>
  );
}
