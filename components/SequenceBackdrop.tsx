"use client";
import { useEffect, useRef, useState } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

/**
 * A scroll scrubbed frame sequence used as the BACKGROUND of a section, rather than as a
 * pinned stage of its own.
 *
 * FrameScrub owns its scroll: it makes a tall track, pins a canvas, and the reader scrubs
 * through it as a separate moment in the page. That is the wrong shape when the sequence is
 * meant to live behind copy. This fills its parent instead, draws cover fit, and takes its
 * progress from the parent's own pass through the viewport, so the section keeps its normal
 * height and reading flow and the artwork moves underneath it.
 *
 * Same loading discipline as FrameScrub, for the same reasons: nothing is fetched until the
 * section is close, nothing is fetched at all below `minWidth`, and the poster covers the gap.
 * Both checks run per tick rather than once, so a window that starts narrow and is widened
 * later still gets the sequence.
 */
export function SequenceBackdrop({
  dir,
  count,
  poster,
  pad = 4,
  ext = "webp",
  opacity = 1,
  mirrored = false,
  minWidth = 900,
  preloadVh = 0.75,
  className = "",
}: {
  dir: string;
  count: number;
  /** shown until the frames decode, on reduced motion, and on anything under minWidth */
  poster: string;
  pad?: number;
  ext?: string;
  opacity?: number;
  /** flip horizontally, for artwork composed with its subject on the wrong side */
  mirrored?: boolean;
  minWidth?: number;
  preloadVh?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const frames: HTMLImageElement[] = [];
    let drawn = -1;

    const src = (i: number) => `${dir}/${String(i + 1).padStart(pad, "0")}.${ext}`;

    function draw(p: number) {
      const c = canvas.current;
      if (!c || !frames.length) return;
      const i = Math.max(0, Math.min(frames.length - 1, Math.round(p * (frames.length - 1))));
      if (i === drawn) return;
      drawn = i;
      const ctx = c.getContext("2d");
      const img = frames[i];
      if (!ctx || !img) return;
      // cover fit: fill the box, crop the overflow, never letterbox behind copy
      const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    }

    function size() {
      const c = canvas.current;
      const el = wrap.current;
      if (!c || !el) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(el.clientWidth * dpr);
      const h = Math.round(el.clientHeight * dpr);
      if (w < 1 || h < 1) return;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        drawn = -1;
      }
    }

    async function load() {
      // probe frame one first, so a missing sequence costs one 404 rather than `count` of them
      const ok = await new Promise<boolean>((res) => {
        const img = new Image();
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = src(0);
      });
      if (!ok || cancelled) return;

      const loaded = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          new Promise<HTMLImageElement | null>((res) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = src(i);
          }),
        ),
      );
      if (cancelled) return;
      for (const f of loaded) if (f) frames.push(f);
      if (frames.length < 2) return;
      setReady(true);
      size();
    }

    let started = false;
    const off = onScrollFrame((y, vh) => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();

      if (!started) {
        if (minWidth && window.innerWidth < minWidth) return;
        if (r.top > vh * preloadVh) return;
        started = true;
        load();
        return;
      }
      // 0 as the section's top reaches the fold, 1 as its bottom leaves the top
      const span = vh + r.height;
      const p = Math.max(0, Math.min(1, (vh - r.top) / span));
      size();
      draw(p);
    });

    return () => {
      // stops the in flight decode from calling setReady after the section is gone
      cancelled = true;
      off();
    };
  }, [dir, count, pad, ext, minWidth, preloadVh]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity, transform: mirrored ? "scaleX(-1)" : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ opacity: ready ? 1 : 0 }} />
    </div>
  );
}
