"use client";
import { useEffect, useRef, useState } from "react";

export type ScrubLayer = {
  /** e.g. "/images/aru-otoko/frames/s00" */
  dir: string;
  count: number;
  /** still shown until frames decode, on reduced motion, and on skipped (mobile) layers */
  fallback: string;
  alt: string;
  pad?: number;
  ext?: string;
  /** positioning + size classes for this layer's box (absolute on desktop, etc.) */
  wrapClass?: string;
  /** skip loading frames (show the still only) below this viewport width in px. For companions. */
  minWidth?: number;
};

/**
 * Several scroll-scrubbed image sequences sharing ONE pinned stage and ONE scroll progress,
 * so they animate together as the reader scrolls. Built for the walk set piece: a full-res
 * hero sequence plus lighter companion clips floated around it.
 *
 * The frame is driven by an IntersectionObserver-gated rAF loop that reads the stage's live
 * position each frame, NOT by a `scroll` event. The site runs on Lenis, which does not emit a
 * native `window` "scroll" event for its programmatic scrolls, so a `scroll` listener never
 * fired and the frame froze on frame 0 (worst felt on mobile). Reading getBoundingClientRect
 * per frame is the single source of truth and works under Lenis, native scroll, and touch alike.
 * The per-frame draw is guarded by a frame-index check, so an idle loop costs almost nothing.
 *
 * Cost control: each layer decodes independently, companions can be gated by `minWidth` so a
 * phone only ever loads the hero. Reduced motion shows the stills and never fetches frames.
 */
export function MultiScrub({
  layers,
  heightVh = 320,
  heightVhMobile,
  mobileMaxWidth = 767,
  className = "",
}: {
  layers: ScrubLayer[];
  heightVh?: number;
  /** shorter stage under `mobileMaxWidth`, so one clip does not stretch over a huge scroll */
  heightVhMobile?: number;
  mobileMaxWidth?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);

  // SSR + first client render use the desktop height (identical markup, no hydration mismatch);
  // an effect trims it on small screens after mount.
  const [stageVh, setStageVh] = useState(heightVh);
  useEffect(() => {
    if (heightVhMobile == null) return;
    const mq = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`);
    const apply = () => setStageVh(mq.matches ? heightVhMobile : heightVh);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [heightVh, heightVhMobile, mobileMaxWidth]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let raf = 0;
    let running = false;
    const framesByLayer: HTMLImageElement[][] = layers.map(() => []);
    const activeLayer: boolean[] = layers.map(() => false);
    const lastIdx: number[] = layers.map(() => -1);

    const src = (l: ScrubLayer, i: number) =>
      `${l.dir}/${String(i + 1).padStart(l.pad ?? 4, "0")}.${l.ext ?? "webp"}`;

    function progress() {
      const el = wrap.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return 0;
      return Math.max(0, Math.min(1, -r.top / total));
    }

    function sizeLayer(li: number) {
      const c = canvases.current[li];
      const first = framesByLayer[li][0];
      if (!c || !first) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(((c.clientWidth * first.naturalHeight) / first.naturalWidth) * dpr);
      if (w < 1 || h < 1) return;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        lastIdx[li] = -1; // canvas was cleared by the resize, force the next draw
      }
    }

    function drawLayer(li: number, p: number) {
      const c = canvases.current[li];
      const arr = framesByLayer[li];
      if (!c || !arr.length) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const i = Math.min(arr.length - 1, Math.round(p * (arr.length - 1)));
      if (i === lastIdx[li]) return; // frame unchanged since last draw: skip
      lastIdx[li] = i;
      const img = arr[i];
      if (!img) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);
    }

    function drawAll() {
      const p = progress();
      for (let i = 0; i < layers.length; i++) if (activeLayer[i]) drawLayer(i, p);
    }

    function tick() {
      if (cancelled) return;
      drawAll();
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (running || cancelled) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    async function loadLayer(l: ScrubLayer, li: number) {
      if (l.minWidth && window.innerWidth < l.minWidth) return; // never fetched on small screens
      const ok = await new Promise<boolean>((res) => {
        const im = new Image();
        im.onload = () => res(true);
        im.onerror = () => res(false);
        im.src = src(l, 0);
      });
      if (!ok || cancelled) return;

      const loaded = await Promise.all(
        Array.from({ length: l.count }, (_, i) =>
          new Promise<HTMLImageElement | null>((res) => {
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = () => res(null);
            im.src = src(l, i);
          }),
        ),
      );
      if (cancelled) return;

      const arr = framesByLayer[li];
      for (const f of loaded) if (f) arr.push(f);
      if (arr.length < 2) return;

      activeLayer[li] = true;
      sizeLayer(li);
      drawLayer(li, progress()); // paint the correct starting frame even if the loop is idle
    }

    function onResize() {
      for (let i = 0; i < layers.length; i++) if (activeLayer[i]) sizeLayer(i);
      if (!running) drawAll(); // keep the frame correct while parked out of view
    }

    // Drive the scrub from the stage's live position while it is on screen. The stage is tall,
    // so it counts as intersecting for the whole scrub; the IO pauses the loop once it leaves the
    // viewport. The loop is started unconditionally below rather than only from the IO's first
    // callback: IntersectionObserver delivery can be delayed or throttled (and under Lenis there is
    // no native scroll event to fall back on), which would otherwise leave the frame frozen on the
    // still. An off-screen loop is nearly free — the per-frame draw is skipped by the lastIdx guard.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) start();
        else stop();
      },
      { rootMargin: "0px" },
    );
    if (wrap.current) io.observe(wrap.current);
    start();

    layers.forEach((l, i) => loadLayer(l, i));
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [layers]);

  return (
    <div ref={wrap} className={`relative ${className}`} style={{ height: `${stageVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-[1400px] px-[var(--pad)]">
          {layers.map((l, i) => (
            <div key={l.dir} className={l.wrapClass}>
              <div className="relative">
                {/* still fallback sits under the canvas; canvas draws over it once frames load */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.fallback}
                  alt={l.alt}
                  className="block w-full rounded-[5px] border-2 border-[#0C0906]"
                />
                <canvas
                  ref={(el) => {
                    canvases.current[i] = el;
                  }}
                  aria-hidden
                  className="absolute inset-0 h-full w-full rounded-[5px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
