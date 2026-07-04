"use client";
import { useSpotlight } from "@/lib/useSpotlight";
import type { ReactNode } from "react";

export function SpotlightCard({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, onMouseMove } = useSpotlight<HTMLDivElement>();
  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`spotlight ${className ?? ""}`}>
      {children}
    </div>
  );
}
