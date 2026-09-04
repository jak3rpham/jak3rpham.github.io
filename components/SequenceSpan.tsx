"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { onScrollFrame } from "@/lib/scrollTicker";

/**
 * A scroll scrubbed frame sequence that spans a RUN OF SECTIONS rather than sitting inside one.
 *
 * The earlier `SequenceBackdrop` filled a single section and took its progress from that
 * section's pass through the viewport, so the artwork scrolled away with the block it belonged
 * to and the whole sequence had to be spent inside one screen's worth of reading. This wraps
 * however many sections you give it, pins one viewport sized canvas behind all of them, and
 * scrubs the frames across the wrapper's entire traversal. The reader scrolls, the sections move
 * over it, the artwork holds still and keeps playing, and once the sequence is spent the layer
 * fades out and the rest of the run is read on the ground alone.
 *
 * Layout: the pinned layer is `sticky` with a negative bottom margin equal to its own height, so
 * it takes no space in the flow and the first child still starts at the top of the wrapper.
 * `sticky` and not `fixed`, because the wrapper is then what bounds it: it cannot outlive the
 * sections it belongs to, and there is nothing to unpin at the far end.
 *
 * The pinned layer sits UNDER the children. Every section passed in here already carries
 * `relative z-[4]`, and `isolate` on the wrapper keeps that comparison local, so the ordering
 * does not depend on what else on the page happens to have a z-index.
 *
 * Loading discipline is unchanged from the component this replaces, for the same reasons:
 * nothing is fetched until the run is close, nothing at all below `minWidth`, and the poster
 * covers the gap. Both checks run per tick rather than once, so a window that starts narrow and
 * is widened later still gets the sequence.
 *
 * The layer crosses the theme with the page rather than dying at the boundary. The artwork is
 * line work on near black, so on paper it is inverted: the ground flips to white, the lines stay
 * dark, and hue-rotate(180deg) is what stops the accent turning into its complement. Without it
 * the run could not span at all here, because ThemeFlow gives the paper the page at 15% of this
 * run, and a near black sheet under a paper section reads as a hole punched in it. The invert is
 * one CSS rule keyed to data-theme, so it crosses on the same 190ms as the ground sheets.
 *
 * Nothing here reads geometry inside the scroll path. The wrapper's offset and travel, and the
 * canvas backing size, are resolved in the `measure` pass the shared ticker runs on mount and on
 * resize; the per frame work is one opacity write and one `drawImage`.
 */
export function SequenceSpan({
  children,
  dir,
  count,
  poster,
  pad = 4,
  ext = "webp",
  /** peak opacity, reached after the fade in and held until the fade out */
  opacity = 1,
  /** the same, for the inverted state; the artwork carries differently on paper */
  lightOpacity = opacity,
  /** flip horizontally, for artwork composed with its subject on the wrong side */
  mirrored = false,
  /**
   * The window of the run the sequence exists in, as fractions of the run's traversal. The
   * frames are spent between them, so the artwork can arrive after the run has started and be
   * finished before it ends: `playStart` is what lets a sequence lead a section in rather than
   * beginning on its first pixel, and `playEnd` is what leaves the last stretch to be read
   * without it.
   */
  playStart = 0,
  playEnd = 0.7,
  /** how much of the run the layer takes to come up, measured from playStart */
  fadeIn = 0.04,
  /** and starts leaving at this one, reaching zero at playEnd */
  fadeOut = 0.5,
  minWidth = 900,
  preloadVh = 0.75,
  className = "",
}: {
  children: ReactNode;
  dir: string;
  count: number;
  /** shown until the frames decode, on reduced motion, and on anything under minWidth */
  poster: string;
  pad?: number;
  ext?: string;
  opacity?: number;
  lightOpacity?: number;
  mirrored?: boolean;
  playStart?: number;
  playEnd?: number;
  fadeIn?: number;
  fadeOut?: number;
  minWidth?: number;
  preloadVh?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const frames: HTMLImageElement[] = [];
    let drawn = -1;

    const src = (i: number) => `${dir}/${String(i + 1).padStart(pad, "0")}.${ext}`;

    // measured on mount and on resize, never read during a scroll
    let top = 0;
    let travel = 1;

    const measure = () => {
      const el = wrap.current;
      const c = canvas.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      // 0 when the run's top meets the top of the viewport, 1 when its bottom meets the bottom
      travel = Math.max(1, r.height - window.innerHeight);
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (w > 0 && h > 0 && (c.width !== w || c.height !== h)) {
        c.width = w;
        c.height = h;
        drawn = -1;
      }
    };

    function draw(p: number) {
      const c = canvas.current;
      if (!c || !frames.length) return;
      const i = Math.max(0, Math.min(frames.length - 1, Math.round(p * (frames.length - 1))));
      if (i === drawn) return;
      drawn = i;
      const ctx = c.getContext("2d");
      const img = frames[i];
      if (!ctx || !img) return;
      // cover fit: fill the viewport, crop the overflow, never letterbox behind copy
      const scale = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
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

      // Concurrency worker pool: load 8 frames concurrently to prevent saturating the network
      // and image decoding threads all at once.
      const loaded: (HTMLImageElement | null)[] = new Array(count);
      const concurrency = 8;
      let currentIndex = 0;

      async function worker() {
        while (currentIndex < count && !cancelled) {
          const i = currentIndex++;
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              loaded[i] = img;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = src(i);
          });
        }
      }

      await Promise.all(Array.from({ length: Math.min(concurrency, count) }, () => worker()));
      if (cancelled) return;
      for (const f of loaded) if (f) frames.push(f);
      if (frames.length < 2) return;
      setReady(true);
      measure();
    }

    let started = false;
    const off = onScrollFrame((y, vh) => {
      const layer = art.current;
      if (!layer) return;

      const p = (y - top) / travel;

      // in, held, out. One number lands on the layer and the compositor does the rest, so the
      // fade costs nothing below it.
      const rampIn = fadeIn > 0 ? Math.min(1, Math.max(0, (p - playStart) / fadeIn)) : 1;
      const tail = Math.max(0.001, playEnd - fadeOut);
      const rampOut = Math.min(1, Math.max(0, (playEnd - p) / tail));
      // Only the RAMP is written here, 0 to 1. Which peak it is multiplied by is a CSS decision
      // keyed to data-theme, because this used to read the attribute and the read could be one
      // frame stale: a child's effect runs before its parent's, so this component's first tick
      // fires before ThemeFlow has written the theme at all, and the layer painted its dark
      // strength for a frame on a page that opens on paper.
      layer.style.setProperty("--seq-p", (rampIn * rampOut).toFixed(3));

      if (reduced) return;

      if (!started) {
        if (minWidth && window.innerWidth < minWidth) return;
        if (top + travel * playStart - y > vh * preloadVh) return;
        started = true;
        load();
        return;
      }
      if (p < playStart || p > playEnd) return;
      draw(Math.min(1, (p - playStart) / Math.max(0.001, playEnd - playStart)));
    }, measure);

    return () => {
      // stops the in flight decode from calling setReady after the run is gone
      cancelled = true;
      off();
    };
  }, [dir, count, pad, ext, playStart, playEnd, fadeIn, fadeOut, minWidth, preloadVh]);

  return (
    <div ref={wrap} className="relative isolate">
      {/* Pinned, and pulled back out of the flow by its own height so the first section still
          starts at the top of the run. */}
      <div
        aria-hidden
        className={`pointer-events-none sticky top-0 z-0 -mb-[100dvh] h-[100dvh] overflow-hidden ${className}`}
      >
        <div
          ref={art}
          className="seq-art absolute inset-0"
          style={
            {
              "--seq-dark": opacity,
              "--seq-light": lightOpacity,
              transform: mirrored ? "scaleX(-1)" : undefined,
            } as CSSProperties
          }
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
      </div>
      {children}
    </div>
  );
}
