"use client";
import { WaveFieldBackdrop } from "@/components/WaveFieldBackdrop";
import { HalftoneCityBackdrop } from "@/components/HalftoneCityBackdrop";
import { GridWaveBackdrop } from "@/components/GridWaveBackdrop";
import { FilmStripBackdrop } from "@/components/FilmStripBackdrop";
import { EmberDuskBackdrop } from "@/components/EmberDuskBackdrop";
import { PulseMatrixBackdrop } from "@/components/PulseMatrixBackdrop";

export type BackdropVariant = "home" | "terra" | "video" | "bong" | "aru" | "nhaminh";

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
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
