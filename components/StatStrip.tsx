"use client";
import { motion, type Variants } from "framer-motion";

const ITEMS = ["Technical SEO", "12× Organic Growth", "31.4M Impressions", "978 Keywords Top 10"];

const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function StatStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="relative z-[4] flex flex-wrap justify-center gap-x-9 gap-y-2 border-y border-rule bg-black/30 px-[var(--pad)] py-5"
    >
      {ITEMS.map((label) => (
        <motion.div key={label} variants={item} className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-sand">
          <b className="font-medium text-amber">{label}</b>
        </motion.div>
      ))}
    </motion.div>
  );
}
