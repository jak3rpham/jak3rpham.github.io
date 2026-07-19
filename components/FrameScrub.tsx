"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven image sequence on a canvas. Pin the section, scrub the frames.
 *
 * Nothing project-specific lives here, point it at a directory of zero-padded frames
 * and it handles preload, decode, draw, and teardown.
 *
 * Degrades in one direction only: if the frames are missing, or the user asked for
 * reduced motion, it shows `fallback` and never fetches a thing.
 */
export function FrameScrub({
  dir,
  count,
  fallback,
  alt,
  pad = 4,
  ext = "webp",
  heightVh = 260,
  className = "",
}: {
  /** e.g. "/images/aru-otoko/frames/s00" */
  dir: string;
  count: number;
  /** shown until frames decode, and forever if they never do */
  fallback: string;
  alt: string;
  pad?: number;
  ext?: string;
  /**
   * Scrollable track height, in vh. Lower = fewer vh per frame = the sequence
   * races through more frames per unit of scroll. A long 150-frame sequence wants
   * a short track (~140) or it feels like wading; a short one wants a tall track.
   */
  heightVh?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const frames: HTMLImageElement[] = [];
    let raf = 0;

    const src = (i: number) => `${dir}/${String(i + 1).padStart(pad, "0")}.${ext}`;

    async function load() {
      // probe frame 1 first: if the sequence was never generated, bail without firing
      // 70 requests that will all 404.
      const probe = await new Promise<boolean>((res) => {
        const img = new Image();
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = src(0);
      });
      if (!probe || cancelled) return;

      const loaded = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          new Promise<HTMLImageElement | null>((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = src(i);
          })
        )
      );
      if (cancelled) return;

      for (const f of loaded) if (f) frames.push(f);
      if (frames.length < 2) return;

      setReady(true);
      draw();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      onResize();
    }

    function onResize() {
      const c = canvas.current;
      const first = frames[0];
      if (!c || !first) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round((c.clientWidth * first.naturalHeight) / first.naturalWidth * dpr);
      if (w < 1 || h < 1) return;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      draw();
    }

    function progress() {
      const el = wrap.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.max(0, Math.min(1, -r.top / total));
    }

    function draw() {
      const c = canvas.current;
      if (!c || !frames.length) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const i = Math.min(frames.length - 1, Math.round(progress() * (frames.length - 1)));
      const img = frames[i];
      if (!img) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    }

    load();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [dir, count, pad, ext]);

  return (
    <div ref={wrap} className={`relative ${className}`} style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[1100px] px-[var(--pad)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fallback}
            alt={alt}
            className={`block w-full rounded-[6px] border-2 border-[#0C0906] transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
          />
          <canvas
            ref={canvas}
            aria-hidden
            className={`absolute inset-0 h-full w-full rounded-[6px] border-2 border-[#0C0906] transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}
