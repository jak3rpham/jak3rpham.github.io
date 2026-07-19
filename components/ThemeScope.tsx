"use client";
import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Homepage-only accent recolor. The site's single green accent (--color-forest, plus its
 * --color-amber alias) is swapped for a neutral bone on "/", so the busy full-colour media
 * (thumbnails, posters, screenshots) is not competing with a saturated UI accent too.
 *
 * `display: contents` keeps this wrapper boxless — it adds no layout, so the fixed Nav,
 * ScrollProgress, and dot-rail keep positioning against the viewport — while its CSS custom
 * properties still cascade to every descendant. Almost all accents on the page read the var
 * (text-forest / bg-forest / border-forest utilities and inline var(--color-forest)), so this
 * one override recolours the whole homepage, including the layout-level Nav that sits outside
 * the page tree. Other routes (/terra, /video, …) keep the green; aru/bong keep their own themes.
 */
const HOME_ACCENT: CSSProperties = {
  display: "contents",
  ["--color-forest" as string]: "#C7B9A1",
  ["--color-amber" as string]: "#C7B9A1",
};
const PASSTHROUGH: CSSProperties = { display: "contents" };

export function ThemeScope({ children }: { children: ReactNode }) {
  const isHome = usePathname() === "/";
  return <div style={isHome ? HOME_ACCENT : PASSTHROUGH}>{children}</div>;
}
