"use client";
import { useEffect, useRef } from "react";
import { onVideoPlaybackChange } from "@/lib/videoPlayback";
import s from "./PortfolioHome.module.css";

export type VideoSource = { src: string; type: string };
const AV1 = 'video/mp4; codecs="av01.0.08M.10"', H264 = "video/mp4";

/** The 2026 reel: a caption-free loop behind the hero, the full cut with sound for the player.
 *  AV1 first; browsers without it (older Safari, most iPhones) take the H.264 file. */
export const REEL = {
  loop: [{ src: "/videos/reel/hero-loop.av1.mp4", type: AV1 }, { src: "/videos/reel/hero-loop.mp4", type: H264 }] as VideoSource[],
  loopPoster: "/videos/reel/hero-loop-poster.webp",
  full: [{ src: "/videos/reel/tatsuki-reel-2026.av1.mp4", type: AV1 }, { src: "/videos/reel/tatsuki-reel-2026.mp4", type: H264 }] as VideoSource[],
  fullPoster: "/videos/reel/tatsuki-reel-2026-poster.webp",
  length: "0:45",
};

export function HeroReel() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    let inView = false, covered = false;
    const sync = () => { if (inView && !covered && !reduce.matches) void video.play().catch(() => {}); else video.pause(); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .1 });
    observer.observe(video);
    // A player opened over the page (the full reel, any film) pauses the loop behind it.
    const stop = onVideoPlaybackChange(playing => { covered = playing; sync(); });
    return () => { observer.disconnect(); stop(); };
  }, []);
  return <video ref={ref} className={s.heroReel} muted loop playsInline preload="metadata" poster={REEL.loopPoster} aria-hidden="true" tabIndex={-1}>
    {REEL.loop.map(v => <source key={v.src} src={v.src} type={v.type} />)}
  </video>;
}
