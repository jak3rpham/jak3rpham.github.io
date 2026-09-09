"use client";
import { useEffect, useRef, useState } from 'react';
import s from './CareMechanism.module.css';
const names = ['Capture', 'Structure', 'Review', 'Organise', 'Share'];
const detail = [
  ['A photo becomes the starting point.', 'The prescription image stays available beside the extracted information. Voice is another way into the experience.'],
  ['Readable fields, not a final decision.', 'Gemini Vision turns the image into structured medication information. The family still needs to review the result.'],
  ['A deliberate pause before reminders.', 'Keep extraction and confirmation separate. The prescribed regimen is not something a model response should rewrite.'],
  ['Care fits into an ordinary day.', 'Reviewed information supports medication routines, Calendar events and Tasks. The next action becomes easier to find.'],
  ['One update, two useful views.', 'A parent checks in through a simple interface. The caregiver sees the update with the surrounding context.'],
];
export function CareMechanism() {
  const [active, setActive] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = viewport.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const center = [105, 389, 389, 579, 709][active];
    el.scrollTo({left: Math.max(0, center - el.clientWidth / 2), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }, [active]);
  return <div className={s.mechanism} data-preserved="nha-care-pipeline">
    <div className={s.nav} aria-label="Explore the care flow">{names.map((name,i)=><button key={name} aria-pressed={active===i} onClick={()=>setActive(i)}><span>0{i+1}</span>{name}</button>)}</div>
    <div className={s.scene} data-step={active}>
      <div ref={viewport} className={s.viewport}>
      <svg viewBox="0 0 820 380" role="img" aria-label={`Illustrated care flow, ${names[active]}. Prescription, review, reminders and shared family views.`}>
        <defs><pattern id="care-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" opacity=".12"/></pattern></defs>
        <rect width="820" height="380" fill="url(#care-dots)"/>
        <path d="M165 180H296M486 180H591M591 180V107H640M591 180V278H640" fill="none" stroke="currentColor" opacity=".25" strokeWidth="2"/>
        <path className={s.flow} d="M165 180H296M486 180H591M591 180V107H640M591 180V278H640" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 14"/>
        <g className={active<2?s.active:''} transform="translate(35 85) rotate(-6 75 90)"><rect x="7" y="9" width="135" height="181" rx="10" fill="currentColor" opacity=".1"/><rect width="135" height="181" rx="10" fill="var(--color-ink)" stroke="currentColor"/><text x="17" y="31" fontSize="15" fill="currentColor">Prescription</text><path d="M18 49H115M18 76H101M18 95H116M18 114H91M18 133H108" stroke="currentColor" opacity=".45" strokeWidth="3"/><path d="M11 62H124V151H11Z" fill="currentColor" opacity={active===0?'.12':'0'}/><text x="18" y="166" fontSize="14" fill="currentColor">Original image</text></g>
        <g className={active===1||active===2?s.active:''}><rect x="285" y="74" width="207" height="213" rx="16" fill="var(--color-ink)" stroke="currentColor"/><path d="M285 118H492" stroke="currentColor" opacity=".35"/><text x="305" y="102" fill="currentColor" fontSize="16">Review together</text>{['Medication','Instructions','Timing'].map((label,i)=><g key={label}><text x="304" y={148+i*37} fill="currentColor" fontSize="14">{label}</text><rect x="404" y={136+i*37} width="65" height="15" rx="3" fill="currentColor" opacity=".15"/></g>)}<rect x="303" y="250" width="170" height="23" rx="11" fill="currentColor" opacity=".15"/><text x="388" y="267" textAnchor="middle" fontSize="14" fill="currentColor">Check before using</text></g>
        <g className={active===3?s.active:''}><circle cx="579" cy="180" r="30" fill="var(--color-ink)" stroke="currentColor"/><path d="M579 161V180L592 187" stroke="currentColor" fill="none" strokeWidth="3"/><text x="579" y="233" textAnchor="middle" fontSize="14" fill="currentColor">Remind</text></g>
        <g className={active===4?s.active:''}><rect x="643" y="24" width="111" height="159" rx="20" fill="var(--color-ink)" stroke="currentColor"/><rect x="678" y="34" width="42" height="5" rx="2" fill="currentColor" opacity=".3"/><circle cx="699" cy="100" r="30" fill="currentColor" opacity=".12"/><path d="m685 100 10 10 21-23" fill="none" stroke="currentColor" strokeWidth="4"/><text x="699" y="150" textAnchor="middle" fontSize="15" fill="currentColor">Parent</text><rect x="628" y="230" width="161" height="95" rx="9" fill="var(--color-ink)" stroke="currentColor"/><path d="m645 296 25-18 20 8 24-24 22 8 34-20" stroke="currentColor" strokeWidth="2" fill="none"/><text x="644" y="252" fontSize="15" fill="currentColor">Family update</text><path d="M692 326V342M664 342H750" stroke="currentColor" strokeWidth="3"/></g>
        <g transform="translate(42 309)"><text x="0" y="20" fill="currentColor" fontSize="14">Voice</text>{[12,22,34,17,28,40,22,12].map((h,i)=><rect key={i} x={60+i*10} y={22-h/2} width="4" height={h} rx="2" fill="currentColor" opacity=".5"/>)}</g>
      </svg>
      </div>
      <span className={s.caption}>Interaction model · illustrated from the product flow</span>
    </div>
    <div className={s.detail}><div>{detail.map(([title,body],i)=><article key={title} aria-hidden={active!==i} style={{visibility:active===i?'visible':'hidden'}}><h3>{title}</h3><p>{body}</p></article>)}</div><button onClick={()=>setActive(i=>(i+1)%names.length)}>Follow the flow ↗</button></div>
  </div>;
}
