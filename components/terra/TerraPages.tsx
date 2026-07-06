"use client";
import { motion } from "framer-motion";
import { Reveal } from "../Reveal";
import { Coverflow } from "../Coverflow";
import { HoverScrollShot } from "../HoverScrollShot";
import { SpotlightCard } from "../SpotlightCard";
import { fadeUp } from "@/lib/motion";

const PAGES = [
  {
    title: "HR Outsourcing Services",
    kind: "Service page · EN",
    img: "/images/terra-outsourcing-preview.webp",
    url: "https://terra-plat.vn/en/hr-outsourcing-services-in-vietnam",
    label: "terra-plat.vn/en/hr-outsourcing-services",
  },
  {
    title: "HR Compliance Consulting",
    kind: "Service page · EN",
    img: "/images/terra-compliance-preview.webp",
    url: "https://terra-plat.vn/en/hr-compliance-consulting-vietnam",
    label: "terra-plat.vn/en/hr-compliance-consulting",
  },
  {
    title: "terra HR System",
    kind: "Product page · EN",
    img: "/images/terra-hrsystem-preview.webp",
    url: "https://terra-plat.vn/en/terra-hr-system",
    label: "terra-plat.vn/en/terra-hr-system",
  },
  {
    title: "Câu chuyện khách hàng",
    kind: "Case study hub · VI",
    img: "/images/terra-customers-preview.webp",
    url: "https://terra-plat.vn/vi/cau-chuyen-khach-hang",
    label: "terra-plat.vn/vi/cau-chuyen-khach-hang",
  },
];

export function TerraPages() {
  const cards = PAGES.map((p) => (
    <SpotlightCard key={p.title} className="overflow-hidden rounded-[14px] border border-panel-border bg-ink-raised">
      <HoverScrollShot src={p.img} alt={p.title} urlLabel={p.label} />
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <div className="text-[1.2rem] font-semibold text-cream">{p.title}</div>
          <div className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.06em] text-sand">{p.kind}</div>
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-rule px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-forest transition-colors hover:border-forest hover:bg-forest hover:text-ink"
        >
          Live ↗
        </a>
      </div>
    </SpotlightCard>
  ));

  return (
    <section id="pages" className="relative z-[4] overflow-hidden py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1400px] px-[var(--pad)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.035em] text-cream">
              Recent <span className="text-forest">page launches</span>
            </h2>
          </Reveal>
          <div className="text-right font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.14em] text-sand">
            Built 03
            <br />
            Live production
          </div>
        </div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} className="mb-10 max-w-[62ch] text-[1.1rem] font-light leading-[1.75] text-tan">
          Pages I shipped end-to-end: keyword strategy, copy, layout, on-page SEO, and technical implementation. Drag to browse; hover
          a screenshot to scroll the full page.
        </motion.p>
      </div>
      <div className="px-[var(--pad)]">
        <div className="mx-auto max-w-[1500px]">
          <Coverflow items={cards} />
        </div>
      </div>
    </section>
  );
}
