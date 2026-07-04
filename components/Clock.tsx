"use client";
import { useEffect, useState } from "react";

export function formatHCMC(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `HCMC ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
}

export function Clock() {
  const [label, setLabel] = useState("HCMC 00:00:00");

  useEffect(() => {
    const tick = () => setLabel(formatHCMC(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute right-[var(--pad)] top-[4.4rem] z-[6] font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sand">
      {label}
    </div>
  );
}
