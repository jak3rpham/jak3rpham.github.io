"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";

/**
 * One fixed, full-viewport, full-width flowing WAVE surface behind a page. The
 * field travels with scroll (background moves up/down WITH the user), giving a
 * continuous scroll transition — not a centred object. Each route is an altered
 * variant (colour + wave rhythm):
 *   home  → broad green swells
 *   terra → tighter, faster green ridges
 *   video → wide calm NEUTRAL cream swells
 *   bong  → slow molten EMBER waves
 */
export type BackdropVariant = "home" | "terra" | "video" | "bong";

export function SceneBackdrop({
  className = "",
  variant = "home",
}: {
  className?: string;
  variant?: BackdropVariant;
}) {
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
