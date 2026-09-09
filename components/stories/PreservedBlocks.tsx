"use client";
import { useState } from "react";
import { LEARNINGS as IELTS_LEARNINGS } from "../ielts/IeltsLearnings";
import { CONSTRAINTS } from "../ielts/IeltsWhy";
import { DrawDiagram } from "../DrawDiagram";
import { SYSTEMS } from "../terra/TerraSystems";
import { CARDS, CREATIVE } from "../terra/TerraScope";
import { BOOT, GRADE, TABLES, OPS } from "../ielts/IeltsSystem";
import { DECISIONS, TRAPS } from "../ielts/IeltsGrading";
import { NODES, EDGES } from "../bong/BongPipeline";
import { ROWS } from "../bong/BongReflection";
import { PROJECT_TVC, COMMERCIAL, REELS } from "@/lib/videoData";
import { YouTubeEmbed } from "./InlineMedia";
import { Notes, s } from "./StoryKit";

export function TerraDiagrams() {
  return <div data-preserved="terra-system-diagrams" className={s.diagramList}>{SYSTEMS.map(system=><article key={system.title}><div><span className={s.label}>{system.tag.replace("//","")}</span><h3>{system.title}</h3><p>{system.desc}</p><small>{system.impact}</small></div><DrawDiagram nodes={system.nodes} edges={system.edges}/></article>)}</div>;
}
export function TerraScopeDetails() {
  return <div data-preserved="terra-scope"><Notes rows={CARDS.map(card=>[card.title,card.body])}/><p className={s.caption}>Creative production included: {CREATIVE.join(" · ")}</p></div>;
}
export function TerraFilms() {
  const landscape=[...PROJECT_TVC,...COMMERCIAL].filter(f=>f.meta.toLowerCase().includes("terra"));
  const portrait=REELS.filter(f=>f.meta.toLowerCase().includes("terra"));
  return <div data-preserved="terra-films"><div className={s.duo}>{landscape.map(f=><article key={f.yt}><YouTubeEmbed id={f.yt} title={f.title}/><p>{f.title}</p></article>)}</div><h3 className={s.wide}>Short-form work</h3><div className={`${s.verticalGallery} ${s.wide}`}>{portrait.map(f=><article key={f.yt}><YouTubeEmbed id={f.yt} title={f.title} vertical/><p className={s.caption}>{f.title}</p></article>)}</div></div>;
}
export function IeltsDiagrams() {
  return <div data-preserved="ielts-diagrams"><div className={s.duo}>{[["A usable app in either mode",BOOT],["From essay to structured feedback",GRADE]].map(([title,data])=><article key={title as string}><h3>{title as string}</h3><DrawDiagram {...data as typeof BOOT}/></article>)}</div><Notes rows={TABLES.map(t=>[t.name,`${t.shape}. ${t.note}`])}/><Notes rows={OPS}/><Notes rows={DECISIONS.map(d=>[d.title,`${d.chose} ${d.because}`])}/><h3 className={s.wide}>The craft of the questions</h3><Notes rows={TRAPS}/><Notes rows={CONSTRAINTS.map(c=>[c.t,c.d])}/><Notes rows={IELTS_LEARNINGS.map(item=>[item.title,item.body])}/></div>;
}
export function BongDiagram() {
  return <div data-preserved="bong-pipeline"><div className={s.diagramScroll}><DrawDiagram nodes={NODES} edges={EDGES} width={900} height={110}/></div><Notes visible rows={ROWS.map(([stage,tool,reason])=>[`${stage} · ${tool}`,reason])}/></div>;
}
const boundaries=[
  ["Diagnosis","The assistant is designed to explain recorded medication information and guide the user back to appropriate human care. It does not independently diagnose symptoms."],
  ["Dosage","The prescribed regimen is treated as immutable. A model response must not change the recorded dose or timing."],
  ["Interactions","Food and medication checks are handled as a separate rule-based part of the product, rather than relying on model confidence."],
  ["Health indicators","Recorded indicators are compared against configured thresholds. The family sees the information and escalation flow."],
  ["Privacy","The design separates patient identity from the information sent for AI processing."],
];
export function CareBoundaries() {
  const [active,setActive]=useState(0);
  return <div className={s.safetyStudy} data-preserved="nha-five-boundaries"><h3>Five boundaries, built into the experience.</h3><div className={s.tabs}>{boundaries.map(([title],i)=><button key={title} aria-pressed={active===i} onClick={()=>setActive(i)}>{title}</button>)}</div><div className={s.split}><svg viewBox="0 0 400 190" role="img" aria-label={`${boundaries[active][0]} protection illustration`}><path d="M200 18 270 45v50q0 48-70 76-70-28-70-76V45z" fill="var(--color-panel)" stroke="var(--color-forest)" strokeWidth="2"/><path d="m174 93 18 18 35-43" fill="none" stroke="var(--color-forest)" strokeWidth="6"/><path d="M15 95h95m180 0h95" stroke="var(--color-forest)" strokeDasharray="5 6"/><circle cx="30" cy="95" r="9" fill="var(--color-forest)"/><circle cx="370" cy="95" r="9" fill="var(--color-forest)"/></svg><div aria-live="polite"><h3>{boundaries[active][0]}</h3><p>{boundaries[active][1]}</p><small>Project design boundaries, not a claim of clinical validation.</small></div></div></div>;
}

