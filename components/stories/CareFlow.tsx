"use client";
import {useState} from "react";
import {s} from "./StoryKit";
const steps=[
 ["Capture","Start with a photo or a voice question.","A familiar input keeps the first step accessible. The original record stays available for review."],
 ["Structure","Turn an image into a readable record.","Gemini extracts medication information into fields the family can review before using it."],
 ["Review","Make the limits visible.","Prescription details need confirmation. The assistant supports understanding and organisation, with boundaries around diagnosis and dosage."],
 ["Organise","Connect reminders to the day.","Calendar and Tasks bring care routines into the tools the family already uses."],
 ["Share","Give each person the right view.","Parents see a simple check-in. Caregivers see updates and context in the shared dashboard."]
];
export function CareFlow(){const [active,setActive]=useState(0);return <div className={s.careFlow}><div className={s.featureTabs}>{steps.map(([name],i)=><button key={name} aria-pressed={active===i} onClick={()=>setActive(i)}><span>0{i+1}</span>{name}</button>)}</div><div className={s.split}><svg viewBox="0 0 500 160" role="img" aria-label={`Care workflow: ${steps[active][0]}`}><path d="M50 80H450" stroke="var(--color-rule)" strokeWidth="3"/>{steps.map(([name],i)=><g key={name}><circle cx={50+i*100} cy="80" r={active===i?30:20} fill={active===i?"var(--color-forest)":"var(--color-panel)"} stroke="var(--color-forest)"/><text x={50+i*100} y="86" textAnchor="middle" fontSize="17" fill={active===i?"var(--color-ink)":"var(--color-cream)"}>{i+1}</text></g>)}</svg><div aria-live="polite"><h3>{steps[active][1]}</h3><p>{steps[active][2]}</p></div></div></div>}
