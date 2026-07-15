"use client";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Reveal } from "./Reveal";
import { fadeUp } from "@/lib/motion";

const CONTACT_LINES = [
  { k: "Email", v: "pnthanh.work@gmail.com", href: "mailto:pnthanh.work@gmail.com" },
  { k: "Phone", v: "+84 398 81 2349", href: "tel:+84398812349" },
  { k: "Location", v: "Ho Chi Minh City, VN" },
  { k: "Languages", v: "VI · EN IELTS 7.0" },
  { k: "Status", v: "Open to full-time & freelance · hybrid / remote" },
];

export function Contact() {
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);

  return (
    <section id="contact" className="relative z-[4] overflow-hidden px-[var(--pad)] py-[clamp(4rem,8vw,7.5rem)]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <Reveal>
            <h2 className="max-w-[16ch] font-display text-[clamp(2.6rem,7vw,5.4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-cream">
              Let&apos;s build something <span className="text-forest">that compounds</span>
            </h2>
          </Reveal>
          <div className="mt-9">
            <motion.a
              href="mailto:pnthanh.work@gmail.com"
              ref={magnetic.ref}
              onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
              onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
              style={hoverCapable ? magnetic.style : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-4 text-[0.95rem] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              Send an email →
            </motion.a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-rule pt-9 sm:grid-cols-3 lg:grid-cols-5">
            {CONTACT_LINES.map(({ k, v, href }) => (
              <div key={k} className="flex flex-col gap-1.5">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">{k}</span>
                {href ? (
                  <a href={href} className="text-[1.02rem] text-cream transition-colors hover:text-forest">
                    {v}
                  </a>
                ) : (
                  <span className="text-[1.02rem] text-cream">{v}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-2">
            {[
              ["LinkedIn", "https://linkedin.com/in/jkpham03/"],
              ["Facebook", "https://facebook.com/phamth.jaker/"],
              ["Instagram", "https://instagram.com/tatsuki.ddd/"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-rule px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-sand transition-colors hover:border-forest hover:bg-forest hover:text-ink"
              >
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
