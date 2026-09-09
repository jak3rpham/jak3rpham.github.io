"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FlowGround, ThemeFlow } from "../ThemeFlow";
import { Footer } from "../Footer";
import { NextCase } from "../CaseOpening";
import { VideoLightbox } from "../VideoLightbox";
import s from "./Stories.module.css";
import { ProcessIllustration } from './ProcessIllustrations';

export function Story({ children, next }: { children: ReactNode; next: "terra" | "nha" | "ielts" | "aru" | "bong" | "video" }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.setAttribute("data-in-view", String(entry.isIntersecting))), { threshold: .08 });
    root.current?.querySelectorAll("section").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={s.story} data-project={next}><FlowGround /><ThemeFlow initial="dark">{children}<section data-zone="dark" className={s.ending}><NextCase project={next} /><Footer /></section></ThemeFlow></div>;
}
export function Chapter({ id, light = false, children, className = "" }: { id: string; light?: boolean; children: ReactNode; className?: string }) {
  return <section id={id} data-zone={light ? "light" : "dark"} className={`${s.chapter} ${className}`}>{children}</section>;
}
export function Heading({ n, title, accent, children }: { n: string; title: string; accent: string; children?: ReactNode }) {
  return <div className={s.heading}><div><span className={s.label}>{n}</span><h2>{title}<br /><em>{accent}</em></h2></div>{children && <div className={s.headingCopy}>{children}</div>}</div>;
}
export function Action({ href, children }: { href: string; children: ReactNode }) {
  return <a className={s.action} href={href}>{children}<span aria-hidden="true">↗</span></a>;
}
export function Picture({ src, alt, caption, portrait = false }: { src: string; alt: string; caption?: string; portrait?: boolean }) {
  return <figure className={`${s.picture} ${portrait ? s.portrait : ""}`}><img src={src} alt={alt} loading="lazy" />{caption && <figcaption>{caption}</figcaption>}</figure>;
}
export function Film({ poster, yt, src, title }: { poster: string; yt?: string; src?: string; title: string }) {
  const [open, setOpen] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) v.pause(); });
    observer.observe(v);
    return () => observer.disconnect();
  }, [open]);
  return <div className={s.film}>{src && open ? <video ref={video} src={src} poster={poster} controls autoPlay playsInline preload="metadata" /> : <button onClick={() => setOpen(true)} aria-label={`Play ${title}`}><img src={poster} alt={title} loading="lazy" /><span className={s.play}>▶</span><span className={s.filmCaption}>{title} · Watch ↗</span></button>}{yt && <VideoLightbox videoId={open ? yt : null} title={title} onClose={() => setOpen(false)} />}</div>;
}
export function Process({ steps, illustrated = false }: { steps: [string, string][]; illustrated?: boolean }) {
  return <div className={`${s.process} ${illustrated ? s.illustratedProcess : ''}`}>{steps.map(([title, body], i) => <div key={title}><span className={s.processNumber}>0{i + 1}</span>{illustrated ? <ProcessIllustration kind={i}/> : <svg viewBox="0 0 100 30" aria-hidden="true"><path d="M0 15H85m-10-9 10 9-10 9" fill="none" stroke="currentColor" /></svg>}<h3>{title}</h3><p>{body}</p></div>)}</div>;
}
export function Notes({ rows, visible = false }: { rows: [string, string][]; visible?: boolean }) {
  if (visible) return <dl className={s.facts}>{rows.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>;
  return <div className={s.notes}>{rows.map(([title, text], i) => <details key={title}><summary><span>0{i + 1}</span>{title}<b>+</b></summary><p>{text}</p></details>)}</div>;
}
export { s };
