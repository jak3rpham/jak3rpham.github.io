"use client";
import type { ReactNode } from "react";
import { Reveal } from "../Reveal";

/**
 * Section shell for the case study.
 *
 * The marker is a comic panel tab, NOT bóng's rule-line + numeral, reusing that
 * treatment would read as the same page in a new colour. Numbering is legitimate
 * here because the shots really are an ordered sequence locked to a music timeline,
 * rather than decorative counting.
 */
export function AruSection({
  id,
  no,
  kicker,
  title,
  accent,
  lede,
  children,
  className = "",
}: {
  id: string;
  no: string;
  kicker: string;
  title: ReactNode;
  accent?: string;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-[4] px-[var(--pad)] py-[clamp(4rem,8vw,7rem)] ${className}`}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-stretch">
              <span className="bg-forest px-2.5 py-1 font-mono text-[0.62rem] font-medium leading-none tracking-[0.1em] text-ink">
                {no}
              </span>
              <span className="border-y-2 border-r-2 border-[#0C0906] bg-panel px-2.5 py-1 font-mono text-[0.62rem] uppercase leading-none tracking-[0.14em] text-sand">
                {kicker}
              </span>
            </div>
            <Reveal>
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
                {title}
                {accent ? <span className="text-forest"> {accent}</span> : null}
              </h2>
            </Reveal>
          </div>
        </div>
        {lede ? (
          <Prose className="mb-10 max-w-[66ch]">
            <p className="text-[1.08rem] font-light leading-[1.75] text-tan">{lede}</p>
          </Prose>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Glass + comic frame for body copy floating over the animated backdrop.
 *
 * The backdrop moves under the whole page, so free prose was hard to read. A near-opaque ink
 * fill (no backdrop-blur, which was expensive to composite over the live WebGL city every
 * frame) lifts text off the motion, inside a comic frame (ink border + hard offset shadow) so
 * it reads as part of the page's language, not a floating card.
 */
export function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[5px] border border-[#0C0906] bg-ink/90 px-5 py-4 md:px-6 md:py-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Comic panel frame: thick ink border, flat (no drop shadow). */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[3px] border-2 border-[#0C0906] bg-panel ${className}`}
    >
      {children}
    </div>
  );
}
