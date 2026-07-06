"use client";
import { motion } from "framer-motion";

export type DiagramNode = { id: string; x: number; y: number; label?: string; sub?: string; r?: number };
export type DiagramEdge = [string, string];

export function DrawDiagram({
  nodes,
  edges,
  width = 460,
  height = 220,
  className = "",
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label="process diagram">
      {edges.map(([a, b], i) => {
        const na = map[a];
        const nb = map[b];
        if (!na || !nb) return null;
        return (
          <motion.line
            key={`${a}-${b}-${i}`}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="var(--color-forest)"
            strokeWidth={1.6}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.2 }}
            whileInView={{ pathLength: 1, opacity: 0.9 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
      {nodes.map((n, i) => {
        const r = n.r ?? 6;
        return (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.25 + i * 0.06, type: "spring", stiffness: 220, damping: 16 }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke="var(--color-forest)" strokeOpacity={0.22} />
            <circle cx={n.x} cy={n.y} r={r} fill="#141813" stroke="var(--color-forest)" strokeWidth={1.6} />
            <circle cx={n.x} cy={n.y} r={2.6} fill="var(--color-forest)" />
            {n.label && (
              <text x={n.x} y={n.y + r + 15} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10.5} fill="var(--color-cream)">
                {n.label}
              </text>
            )}
            {n.sub && (
              <text x={n.x} y={n.y + r + 29} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-sand)">
                {n.sub}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
