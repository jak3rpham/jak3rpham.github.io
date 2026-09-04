"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/lib/useMediaQuery";

function GsapLenisSync() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    gsap.registerPlugin(ScrollTrigger);
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(500, 33);
    // Layouts settle after fonts/images; refresh so pinned triggers measure correctly.
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 600);
    window.addEventListener("load", refresh);
    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      window.removeEventListener("load", refresh);
      clearTimeout(t);
    };
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: { offset: -80 } }}>
      <GsapLenisSync />
      {children}
    </ReactLenis>
  );
}
