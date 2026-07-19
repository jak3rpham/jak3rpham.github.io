"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";
import { HalftoneCityBackdrop } from "@/components/HalftoneCityBackdrop";
import { GridWaveBackdrop } from "@/components/GridWaveBackdrop";
import { LightStreaksBackdrop } from "@/components/LightStreaksBackdrop";
import { EmberDuskBackdrop } from "@/components/EmberDuskBackdrop";

/**
 * One fixed, full-viewport, full-width backdrop behind a page. Each route now has its own
 * bespoke scene, routed here:
 *   home  → WaveFieldBackdrop  · broad neutral bone swells that travel with scroll
 *   terra → GridWaveBackdrop   · a clean rippling wireframe grid
 *   video → LightStreaksBackdrop · drifting cinematic cream light streaks
 *   bong  → EmberDuskBackdrop  · warm embers rising through a dusk glow
 *   aru   → HalftoneCityBackdrop · a raymarched city screened into ben-day dots
 *
 * Only `home` still uses the shared wave. WaveFieldBackdrop does
 * `VARIANTS[variant] ?? VARIANTS.home`, so an unknown variant does not throw — it
 * silently renders home's neutral waves.
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
  if (variant === "terra") return <GridWaveBackdrop className={className} />;
  if (variant === "video") return <LightStreaksBackdrop className={className} />;
  if (variant === "bong") return <EmberDuskBackdrop className={className} />;
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
