"use client";
import { useEffect, useRef, useState } from 'react';
import { useShowcase } from '@/lib/useShowcase';
import s from './FeatureShowcase.module.css';

export function FeatureShowcase({ demos, descriptions }: { demos: string[][]; descriptions: string[] }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [manualMotion, setManualMotion] = useState(false);
  const gallery = useShowcase(demos.length, 8000, ready);
  const [front, setFront] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const { index, visible, paused, reduced } = gallery;
  useEffect(() => {
    const slot = 1 - front;
    const video = videos.current[slot];
    if (!video) return;
    let cancelled = false;
    const prepare = () => { if (!cancelled) { setReady(false); setFailed(false); } };
    const reveal = () => {
      if (cancelled) return;
      setFront(slot); setLoaded(index); setReady(true);
    };
    video.pause();
    const fail = () => { if (!cancelled) setFailed(true); };
    video.addEventListener('loadeddata', reveal, { once: true });
    video.addEventListener('loadstart', prepare, { once: true });
    video.addEventListener('error', fail, { once: true });
    video.src = `/videos/nha-minh/${demos[index][1]}.mp4`;
    video.load();
    return () => { cancelled = true; video.removeEventListener('loadeddata', reveal); video.removeEventListener('loadstart', prepare); video.removeEventListener('error', fail); };
    // Only a requested selection loads the back buffer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, demos]);
  useEffect(() => {
    videos.current.forEach((video, slot) => {
      if (!video) return;
      if (slot === front && visible && !motionPaused && (!reduced || manualMotion) && ready) void video.play().catch(() => {});
      else video.pause();
    });
  }, [front, visible, motionPaused, reduced, manualMotion, ready]);
  return <div ref={gallery.ref} className={s.gallery} data-showcase>
    <div className={s.toolbar}><div role="tablist" aria-label="App features" className={s.tabs} onFocusCapture={gallery.stop} onKeyDown={e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? demos.length - 1 : (index + d + demos.length) % demos.length;
      gallery.select(next); document.getElementById(`feature-tab-${next}`)?.focus();
    }}>{demos.map(([name], i) => <button key={name} id={`feature-tab-${i}`} role="tab" aria-selected={index === i} aria-controls="feature-preview" tabIndex={index === i ? 0 : -1} onClick={() => gallery.select(i)}>{name}{index === i && <i aria-hidden style={{ transform: `scaleX(${gallery.progress})` }}/>}</button>)}</div>
    <button className={s.pause} onClick={gallery.toggle} aria-pressed={paused} disabled={reduced}>{reduced ? 'Auto-switch off' : paused ? 'Resume showcase ↗' : 'Pause showcase Ⅱ'}</button></div>
    <div id="feature-preview" role="tabpanel" aria-labelledby={`feature-tab-${index}`} aria-busy={!ready} className={s.preview}>
      <div className={s.copy}>{demos.map(([name], i) => <div key={name} aria-hidden={loaded !== i} style={{ visibility: loaded === i ? 'visible' : 'hidden' }}><span>0{i + 1}</span><h3>{name}</h3><p>{descriptions[i]}</p></div>)}</div>
      <div><div className={s.stage}><img src="/images/nha-minh/01-trang-chao-hero.png" alt="Nhà Mình welcome screen"/>{[0, 1].map(slot => <video key={slot} ref={el => { videos.current[slot] = el; }} muted loop playsInline preload="auto" aria-label={demos[loaded][0]} aria-hidden={slot !== front} className={slot === front ? s.front : ''}/>)}{!ready && <span className={s.loading} role="status">{failed ? 'Preview unavailable. Choose another feature.' : 'Preparing preview…'}</span>}</div><button className={s.pause} onClick={() => { gallery.stop(); if (reduced && !manualMotion) { setManualMotion(true); setMotionPaused(false); } else setMotionPaused(p => !p); }}>{motionPaused || (reduced && !manualMotion) ? 'Play motion ↗' : 'Pause motion Ⅱ'}</button></div>
    </div>
  </div>;
}
