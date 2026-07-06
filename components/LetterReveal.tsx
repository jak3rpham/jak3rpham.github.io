"use client";
import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } },
};
const letter: Variants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Per-letter mask reveal. Letters from `accentStart` onward render in the accent
 * color. Words are grouped in `whitespace-nowrap` spans so a line only ever
 * breaks between words, never mid-word (e.g. "VESPERA" stays intact).
 */
export function LetterReveal({
  text,
  className = "",
  accentStart,
}: {
  text: string;
  className?: string;
  accentStart?: number;
}) {
  const words = text.split(" ");
  let idx = 0; // running char index across the full string, spaces included
  return (
    <motion.span variants={container} initial="hidden" animate="visible" className={className} aria-label={text}>
      {words.map((word, wi) => {
        const wordNode = (
          <span key={`w${wi}`} className="inline-block whitespace-nowrap">
            {word.split("").map((c) => {
              const i = idx++;
              return (
                <span key={i} className="inline-block overflow-hidden align-bottom" style={{ lineHeight: 0.92 }} aria-hidden>
                  <motion.span variants={letter} className={`inline-block ${accentStart !== undefined && i >= accentStart ? "text-forest" : ""}`}>
                    {c}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
        idx++; // the space that separated this word from the next
        return (
          <Fragment key={`f${wi}`}>
            {wordNode}
            {wi < words.length - 1 && " "}
          </Fragment>
        );
      })}
    </motion.span>
  );
}
