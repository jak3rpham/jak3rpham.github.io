"use client";

import { type ReactNode } from "react";
import { GrainOverlay } from "./GrainOverlay";
import { Nav } from "./Nav";
import { SmoothScroll } from "./SmoothScroll";
import { Preloader } from "./Preloader";
import { ScrollProgress } from "./ScrollProgress";

export function InnerChrome({ children }: { children: ReactNode }) {
  return <><a href="#content" className="skip-link">Skip to content</a><Preloader /><ScrollProgress /><GrainOverlay /><Nav /><SmoothScroll>{children}</SmoothScroll></>;
}
