"use client";
import { useEffect, useRef } from 'react';
import { onScrollFrame } from '@/lib/scrollTicker';
import s from './ScrollArtwork.module.css';
type Variant = 'care' | 'publishing' | 'learning' | 'film' | 'edit' | 'world';
const assets = {care:'/images/visuals/shared-care.webp',publishing:'/images/visuals/publishing-machine.webp',learning:'/images/visuals/draft-to-clarity.webp'};
const captions = {care:'Two places. One shared rhythm.',publishing:'A small system. A different way to work.',learning:'The next draft begins with a closer look.',film:'',edit:'Images become a sequence. The edit gives them a pulse.',world:'Scale. Light. A world that holds together.'};
export function ScrollArtwork({variant,images=[],compact=false}:{variant:Variant;images?:{src:string;alt:string}[];compact?:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const layers=Array.from(el.querySelectorAll<HTMLElement>('[data-depth]'));
    const update=()=>{
      const rect=el.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const progress=reduced.matches?0:Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight));
      layers.forEach(layer=>{
        const depth=Number(layer.dataset.depth);
        layer.style.translate=`0 ${progress*depth}px`;
      });
      el.style.setProperty('--turn',`${progress*9}deg`);
    };
    const off=onScrollFrame(update);
    const move=(event:PointerEvent)=>{
      if(reduced.matches||event.pointerType==='touch')return;
      const rect=el.getBoundingClientRect();
      el.style.setProperty('--pointer',`${((event.clientX-rect.left)/rect.width-.5)*8}deg`);
    };
    const leave=()=>el.style.setProperty('--pointer','0deg');
    el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);reduced.addEventListener('change',update);
    return()=>{off();el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);reduced.removeEventListener('change',update);};
  },[]);
  const artwork=variant==='care'||variant==='publishing'||variant==='learning'?assets[variant]:null;
  return <div ref={root} className={`${s.artwork} ${s[variant]} ${compact?s.compact:''}`} data-artwork={variant}>
    {artwork?<><img className={s.art} data-depth="-38" src={artwork} alt={{care:'Sculptural homes connected by a coral bridge, a visual metaphor for shared care',publishing:'Paper sheets move through a forest-green publishing sculpture',learning:'Manuscript paper unfurls beside a glass lens, a visual metaphor for revision'}[variant as keyof typeof assets]} loading="lazy"/>
      <div className={s.orbit} aria-hidden="true" data-depth="65"><div className={s.sheets}>{[0,1,2,3].map(i=><span key={i} style={{'--sheet':i} as React.CSSProperties}><i/><i/><i/></span>)}</div></div>
    </>:<div className={s.filmSpace} aria-hidden={variant==='film'?'true':undefined}>{images.map((image,i)=><figure className={s.filmFrame} data-depth={i%2?60:-45} key={image.src} style={{'--frame':i} as React.CSSProperties}><img src={image.src} alt={variant==='film'?'':image.alt} loading="lazy"/><figcaption>{String(i+1).padStart(2,'0')}</figcaption></figure>)}</div>}
    {variant==='film'&&<div className={s.heroShade}/>}
    {!compact&&captions[variant]&&<p className={s.caption}>{captions[variant]}</p>}
  </div>;
}
