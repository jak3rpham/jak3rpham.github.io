"use client";
import type { CSSProperties } from "react";

/**
 * Ben-day dot overlay, drawn in CSS. Zero bytes, crisp at any DPR, and it scales
 * with the element instead of with a bitmap.
 *
 * Deliberately not an image: halftone is high-frequency noise, which is the worst
 * case for webp — baking these dots into an asset would cost real weight for a
 * pattern two gradients can state exactly.
 */
export function Halftone({
  size = 5,
  opacity = 0.28,
  color = "224, 160, 90",
  angle = 15,
  mask,
  className = "",
}: {
  /** dot pitch in px */
  size?: number;
  opacity?: number;
  /** rgb triplet, unwrapped — e.g. "224, 160, 90" */
  color?: string;
  /** screen angle in degrees. print uses 15/45/75; vary it to avoid moiré between layers. */
  angle?: number;
  /** a CSS mask-image, so the field can fade instead of stopping at an edge */
  mask?: string;
  className?: string;
}) {
  const style: CSSProperties = {
    backgroundImage: `radial-gradient(circle at center, rgba(${color}, ${opacity}) ${size * 0.2}px, transparent ${size * 0.32}px)`,
    backgroundSize: `${size}px ${size}px`,
    transform: `rotate(${angle}deg)`,
    // rotating a fixed box exposes the corners; oversize so the field still covers
    inset: "-40%",
    ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}),
  };
  return <div aria-hidden className={`pointer-events-none absolute ${className}`} style={style} />;
}
