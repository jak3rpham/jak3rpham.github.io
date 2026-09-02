"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";
import { HalftoneCityBackdrop } from "@/components/HalftoneCityBackdrop";
import { GridWaveBackdrop } from "@/components/GridWaveBackdrop";
import { FilmStripBackdrop } from "@/components/FilmStripBackdrop";
import { EmberDuskBackdrop } from "@/components/EmberDuskBackdrop";
import { PulseMatrixBackdrop } from "@/components/PulseMatrixBackdrop";
import { MarkingPassBackdrop } from "@/components/MarkingPassBackdrop";

/**
 * One fixed, full-viewport, full-width backdrop behind a page. Each route now has its own
 * bespoke scene, routed here:
 *   home    → WaveFieldBackdrop    · broad neutral bone swells that travel with scroll
 *   terra   → GridWaveBackdrop     · a clean rippling wireframe grid
 *   video   → FilmStripBackdrop    · film strips (sprocket holes + frame lines) scrolling sideways
 *   bong    → EmberDuskBackdrop    · warm embers rising through a dusk glow
 *   aru     → HalftoneCityBackdrop · a raymarched city screened into ben-day dots
 *   nhaminh → PulseMatrixBackdrop  · a 2D canvas grid with pulsing nodes
 *   ielts   → MarkingPassBackdrop  · ruled columns of text under a sweeping marking pass
 *
 * Only `home` still uses the shared wave. WaveFieldBackdrop does
 * `VARIANTS[variant] ?? VARIANTS.home`, so an unknown variant does not throw — it
 * silently renders home's neutral waves.
 */
export type BackdropVariant = "home" | "terra" | "video" | "bong" | "aru" | "nhaminh" | "ielts";

export function SceneBackdrop({
  className = "",
  variant = "home",
}: {
  className?: string;
  variant?: BackdropVariant;
}) {
  if (variant === "nhaminh") return <PulseMatrixBackdrop className={className} />;
  if (variant === "aru") return <HalftoneCityBackdrop className={className} />;
  if (variant === "terra") return <GridWaveBackdrop className={className} />;
  if (variant === "video") return <FilmStripBackdrop className={className} />;
  if (variant === "bong") return <EmberDuskBackdrop className={className} />;
  if (variant === "ielts") return <MarkingPassBackdrop className={className} />;
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
