"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";
import { HalftoneCityBackdrop } from "@/components/HalftoneCityBackdrop";
import { ContourTerrainBackdrop } from "@/components/ContourTerrainBackdrop";

/**
 * One fixed, full-viewport, full-width backdrop behind a page.
 *
 * Some routes share a flowing WAVE surface that travels with scroll (background moves
 * up/down WITH the user), giving a continuous scroll transition — not a centred
 * object. Each is an altered variant (colour + wave rhythm):
 *   home  → broad neutral bone swells
 *   video → wide calm NEUTRAL cream swells
 *   bong  → slow molten EMBER waves
 *
 * `aru` and `terra` are NOT wave variants — each is its own scene, so it routes to its
 * own component: `aru` a raymarched city screened into ben-day dots, `terra` a
 * contour-lined topographic terrain that rises as you scroll. Note that WaveFieldBackdrop
 * does `VARIANTS[variant] ?? VARIANTS.home`: an unknown variant does not throw, it
 * silently renders home's neutral waves — so a route dropped from the branches below
 * quietly falls back to the homepage backdrop with no type error and no console warning.
 */
export type BackdropVariant = "home" | "terra" | "video" | "bong" | "aru";

export function SceneBackdrop({
  className = "",
  variant = "home",
}: {
  className?: string;
  variant?: BackdropVariant;
}) {
  if (variant === "aru") return <HalftoneCityBackdrop className={className} />;
  if (variant === "terra") return <ContourTerrainBackdrop className={className} />;
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
