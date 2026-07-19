"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";
import { HalftoneCityBackdrop } from "@/components/HalftoneCityBackdrop";

/**
 * One fixed, full-viewport, full-width backdrop behind a page.
 *
 * Most routes are a flowing WAVE surface that travels with scroll (background moves
 * up/down WITH the user), giving a continuous scroll transition — not a centred
 * object. Each is an altered variant (colour + wave rhythm):
 *   home  → broad neutral bone swells
 *   terra → tighter, faster green ridges
 *   video → wide calm NEUTRAL cream swells
 *   bong  → slow molten EMBER waves
 *
 * `aru` is NOT a wave variant — it is a different scene entirely (a raymarched city
 * screened into ben-day dots), so it routes to its own component. Note that
 * WaveFieldBackdrop does `VARIANTS[variant] ?? VARIANTS.home`: an unknown variant does
 * not throw, it silently renders home's GREEN waves. Delete the `aru` branch below and
 * the case study gets the homepage backdrop with no type error and no console warning.
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
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
