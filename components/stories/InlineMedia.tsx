"use client";
import { useEffect, useRef, useState } from "react";
import s from "./Stories.module.css";

export function YouTubeEmbed({ id, title, vertical = false }: { id: string; title: string; vertical?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const sources = vertical
    ? [`https://i.ytimg.com/vi/${id}/oardefault.jpg`, `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`]
    : [`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`];
  const [step, setStep] = useState(0);
  const next = () => setStep(i => Math.min(i + 1, sources.length - 1));
  return <div className={`${s.embed} ${vertical ? s.verticalEmbed : ""}`}>
    {playing
      ? <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      : <button type="button" className={s.embedPoster} onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
          <img
            src={sources[step]}
            alt=""
            loading="lazy"
            onError={next}
            // A missing size returns YouTube's 120x90 grey placeholder with a 200, so onError never fires.
            onLoad={e => { if (e.currentTarget.naturalWidth <= 120) next(); }}
          />
          <span className={s.playDisc} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6.5l9 5.5-9 5.5z" fill="currentColor" /></svg>
          </span>
        </button>}
  </div>;
}

export function FeatureClip({ src, poster, title, description, index }: { src: string; poster: string; title: string; description: string; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ratio,setRatio]=useState(16/9);
  const [playing,setPlaying]=useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !media.matches) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: .55 });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, []);
  return <article className={s.featureRow}><div><span className={s.label}>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{description}</p></div><div className={s.loopMedia}><video ref={ref} onLoadedMetadata={e=>setRatio(e.currentTarget.videoWidth/e.currentTarget.videoHeight)} style={{width:"100%",height:"auto",maxHeight:"none",aspectRatio:ratio,maxWidth:ratio*460}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={title} /><button onClick={()=>{const v=ref.current;if(v){if(v.paused)void v.play().catch(()=>{});else v.pause();}}} aria-label={`${playing?"Pause":"Play"} ${title}`}>{playing?"Pause motion Ⅱ":"Play motion ↗"}</button></div></article>;
}
