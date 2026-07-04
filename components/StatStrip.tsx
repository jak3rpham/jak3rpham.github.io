"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

const ITEMS = ["Technical SEO", "12× Organic Growth", "31.4M Impressions", "978 Keywords Top 10"];

export function StatStrip() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="relative z-[4] flex flex-wrap justify-center gap-x-9 gap-y-2 border-y border-rule bg-black/30 px-[var(--pad)] py-5"
    >
      {ITEMS.map((label) => (
        <motion.div key={label} variants={staggerItem} className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-sand">
          <b className="font-medium text-amber">{label}</b>
        </motion.div>
      ))}
    </motion.div>
  );
}
