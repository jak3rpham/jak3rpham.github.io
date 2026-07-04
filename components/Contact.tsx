"use client";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/useMagnetic";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { SectionMotif } from "./SectionMotif";
import { useLiveWhenVisible } from "@/lib/useLiveWhenVisible";
import { fadeUp } from "@/lib/motion";

const CONTACT_LINES = [
  { k: "Email", v: "pnthanh.work@gmail.com", href: "mailto:pnthanh.work@gmail.com" },
  { k: "Phone", v: "+84 398 81 2349", href: "tel:+84398812349" },
  { k: "Location", v: "Ho Chi Minh City, VN" },
  { k: "Languages", v: "VI · EN IELTS 7.0" },
  { k: "Status", v: "Available 2026 · hybrid / remote" },
];

export function Contact() {
  const { ref, live } = useLiveWhenVisible<HTMLElement>();
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const magnetic = useMagnetic<HTMLAnchorElement>(0.3);

  return (
    <section ref={ref} id="contact" className={`sec relative z-[4] overflow-hidden ${live ? "live" : ""}`}>
      <SectionMotif variant="signal" />
      <div className="relative z-[2] px-[var(--pad)] py-[clamp(5rem,12vw,9rem)]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <h2 className="max-w-[18ch] text-[clamp(2.6rem,6vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            Let&apos;s build something{" "}
            <span className="bg-gradient-to-r from-[#D2E8B4] to-[#6FBE7F] bg-clip-text text-transparent">that compounds</span>
          </h2>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <motion.a
              href="mailto:pnthanh.work@gmail.com"
              ref={magnetic.ref}
              onMouseMove={hoverCapable ? magnetic.onMouseMove : undefined}
              onMouseLeave={hoverCapable ? magnetic.onMouseLeave : undefined}
              style={hoverCapable ? magnetic.style : undefined}
              className="inline-flex items-center gap-2 rounded-[9px] bg-amber px-6 py-3.5 text-[0.92rem] font-semibold text-ink transition-colors hover:bg-forest"
            >
              Send an email →
            </motion.a>
            <a href="/CV.pdf" className="border-b border-forest pb-0.5 text-[0.92rem] text-tan transition-colors hover:text-forest">
              Download CV ↓
            </a>
          </div>
          <div className="my-8 flex flex-wrap gap-x-12 gap-y-6 border-t border-rule pt-7">
            {CONTACT_LINES.map(({ k, v, href }) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-sand">{k}</span>
                {href ? (
                  <a href={href} className="text-[1.05rem] text-cream hover:text-forest">
                    {v}
                  </a>
                ) : (
                  <span className="text-[1.05rem] text-cream">{v}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["LinkedIn", "https://linkedin.com/in/jkpham03/"],
              ["Facebook", "https://facebook.com/phamth.jaker/"],
              ["Instagram", "https://instagram.com/jak3rpham/"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-rule px-3 py-1.5 font-mono text-[0.62rem] text-sand transition-colors hover:border-forest hover:bg-forest hover:text-ink"
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
