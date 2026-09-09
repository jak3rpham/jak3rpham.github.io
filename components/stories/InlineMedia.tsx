"use client";
import { useEffect, useRef, useState } from "react";
import s from "./Stories.module.css";

export function YouTubeEmbed({ id, title, vertical = false }: { id: string; title: string; vertical?: boolean }) {
  return <div className={`${s.embed} ${vertical ? s.verticalEmbed : ""}`}><iframe src={`https://www.youtube.com/embed/${id}?rel=0`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
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
