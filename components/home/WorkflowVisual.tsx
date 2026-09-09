"use client";
import { useState } from "react";
import s from "./PortfolioHome.module.css";

export function WorkflowVisual() {
  const [active, setActive] = useState(1);
  const steps = [
    { name: "Research & insight", tool: "Search Console · GA4", detail: "Turn search and audience signals into a clear brief.", icon: "M15 18h6v18h-6z M27 11h6v25h-6z M39 5h6v31h-6z" },
    { name: "AI-assisted creation", tool: "AI direction · Content tooling", detail: "Guide the output, refine the creative and prepare it to publish.", icon: "M30 4l7 16 17 7-17 7-7 16-7-16-17-7 17-7z" },
    { name: "Publish & measure", tool: "WordPress · Reporting", detail: "Ship the work and bring the results into the next decision.", icon: "M8 10h44v34H8z M8 19h44 M17 28h12 M17 35h23" },
  ];
  return <div className={s.toolVisual}>
    <svg className={s.toolWires} viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 50H600" /><path className={s.signal} d="M0 50H600" /></svg>
    <div className={s.toolNodes}>{steps.map((step, i) => <button key={step.name} aria-pressed={active === i} onClick={() => setActive(i)}><svg viewBox="0 0 60 54" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={step.icon} /></svg><b>{step.name}</b><small>{step.tool}</small></button>)}</div>
    <p aria-live="polite">{steps[active].detail}</p>
  </div>;
}

export function CareIllustration() {
  const [confirmed, setConfirmed] = useState(false);
  return <div className={s.careDemo}>
    <div className={s.careDemoHeading}><span>One small action. A little peace of mind.</span></div>
    <svg viewBox="0 0 580 155" role="img" aria-label={confirmed ? "Parent confirmation connected to the family dashboard" : "Parent and family connected through Nhà Mình"}>
      <defs><linearGradient id="care-pill" x2="1" y2="1"><stop stopColor="#ffb08e"/><stop offset="1" stopColor="#e65335"/></linearGradient></defs>
      <path d="M130 80C230 80 200 42 290 42S360 80 450 80" fill="none" stroke="#ca9d88" strokeWidth="2" strokeDasharray="4 6"/>
      <circle cx="290" cy="42" r="24" fill="#fff9f0" stroke="#e4b49c"/><path d="M279 40c-3-10 10-12 11-4 5-8 17-4 11 5l-11 10z" fill="#eb7856"/>
      <g className={confirmed ? s.careSent : undefined}><circle cx="130" cy="80" r="39" fill="#fff8ef"/><rect x="100" y="66" width="60" height="27" rx="13.5" transform="rotate(-30 130 80)" fill="url(#care-pill)"/><path d="M130 65v29" stroke="#fff4e9" strokeWidth="2" transform="rotate(-30 130 80)"/></g>
      <rect x="414" y="46" width="76" height="64" rx="10" fill="#fff9f1" stroke="#dbb9a6"/><path d="M425 91l12-13 12 5 14-22 14 7" fill="none" stroke="#50886b" strokeWidth="3"/><circle cx="484" cy="49" r="13" fill={confirmed ? "#518567" : "#dfc3af"}/>{confirmed && <path d="m478 49 4 4 7-8" fill="none" stroke="white" strokeWidth="2"/>}
      <text x="130" y="141" textAnchor="middle" fill="#725344" fontSize="12">Parent checks in</text><text x="452" y="141" textAnchor="middle" fill="#725344" fontSize="12">Family stays connected</text>
    </svg>
    <button aria-pressed={confirmed} onClick={() => setConfirmed(!confirmed)}>{confirmed ? "✓ Family updated · Replay" : "Try a check-in ↗"}</button>
  </div>;
}
