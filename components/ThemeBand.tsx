import type { ReactNode } from "react";

/**
 * A run of sections that reads on paper instead of on ink.
 *
 * The site stays dark by default. This wraps the stretch that should invert and carries
 * two things: the `.theme-light` token overrides (see globals.css), and an opaque `bg-ink`
 * — opaque because the WebGL backdrop is fixed behind the whole page and would otherwise
 * show through the band.
 *
 * `z-[4]` matches what the sections themselves use, so the band sits in the same stacking
 * layer they already occupied above the backdrop.
 */
export function ThemeBand({ children }: { children: ReactNode }) {
  return <div className="theme-light relative z-[4] bg-ink">{children}</div>;
}
