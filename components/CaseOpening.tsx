import { WebGLLogo3D } from "./WebGLLogo3D";
import s from "./CaseOpening.module.css";

const cases = {
  terra: { label: "terra / Growth, content & systems", title: "Making growth", accent: "work together.", intro: "22 months connecting strategy, creative and AI-assisted workflows for a B2B HR and payroll brand.", image: "/images/terra-outsourcing-preview.webp", alt: "terra outsourcing website", href: "#systems", cta: "Explore the applications", facts: ["12× organic growth", "978 top-10 keywords", "Digital Marketing Executive · team of 3", "Sep 2024 – Jun 2026"], next: "/nha-minh", nextTitle: "Nhà Mình", nextImage: "/images/nha-minh/01-trang-chao-hero.png" },
  nha: { label: "Nhà Mình / Product & AI direction", title: "Care that feels", accent: "closer to home.", intro: "A family care companion for Vietnamese parents and their children. Two interfaces, one shared sense of reassurance.", image: "/images/nha-minh/01-trang-chao-hero.png", alt: "Nhà Mình desktop welcome interface", href: "#experience", cta: "Watch the product demo", facts: ["AI Riser Vietnam 2026", "Parent + caregiver experiences", "Solo build · concept to live app", "2026"], next: "/ielts-studio", nextTitle: "IELTS Studio", nextImage: "/images/ielts-preview.webp" },
  ielts: { label: "IELTS Studio / Product thinking & AI", title: "Practice with", accent: "a clearer direction.", intro: "An IELTS learning experience that brings practice, original exercises and AI-assisted writing feedback into one place.", image: "/images/ielts-preview.webp", alt: "IELTS Studio learning platform", href: "https://ielts-test-kohl.vercel.app/", cta: "Try IELTS Studio", facts: ["23 question types", "Task-specific writing feedback", "Original practice content", "Solo build · 2026"], next: "/aru-otoko", nextTitle: "Aru Otoko", nextImage: "/images/aru-otoko/poster/poster-horizontal.webp" },
};
export function CaseOpening({ project }: { project: keyof typeof cases }) {
  const item = cases[project];
  return <header id="hero" className={`${s.opening} ${s[project]}`}>
    <a className={s.back} href="/">← Selected work</a>
    <div className={s.titleRow}><div><p className={s.label}>{item.label}</p><h1>{item.title}<br /><em>{item.accent}</em></h1></div><div className={s.intro}><p>{item.intro}</p><a className={s.action} href={item.href}>{item.cta}<span>↗</span></a>{project === "nha" && <a className={s.secondary} href="https://ai-riser-namdosan-fa737.web.app" target="_blank" rel="noreferrer">Open the live app ↗</a>}</div></div>
    <div className={s.showcase}><div className={s.window}><div className={s.bar}><span>● ● ●</span><span>{project === "terra" ? "terra-plat.vn" : project === "nha" ? "Nhà Mình" : "IELTS Studio"}</span></div><img src={item.image} alt={item.alt} fetchPriority="high" /></div>{project === "terra" ? <div className={s.logo}><WebGLLogo3D className="h-full w-full" /></div> : project === "nha" ? <img className={s.phone} src="/images/nha-minh/07-app-bame-hom-nay.png" alt="Nhà Mình parent interface" /> : <div className={s.feedback}><span>Writing, with perspective</span><b>A clearer argument.<br />A stronger next draft.</b><svg viewBox="0 0 240 55" aria-hidden="true"><path d="M0 47L40 38L70 43L105 22L140 29L180 10L240 4" fill="none" stroke="currentColor" strokeWidth="3"/></svg></div>}</div>
    <div className={s.facts}>{item.facts.map(fact => <span key={fact}>{fact}</span>)}</div>
  </header>;
}
export function CaseChapters({ links }: { links: [string, string][] }) {
  return <nav className={s.chapters} aria-label="Case study chapters">{links.map(([href, label], i) => <a href={href} key={href}><small>0{i + 1}</small>{label} ↓</a>)}</nav>;
}
export function NextCase({ project }: { project: keyof typeof cases | "aru" | "bong" | "video" }) {
  const item = project in cases ? cases[project as keyof typeof cases] : project === "aru" ? { next: "/bong-vespera", nextTitle: "Bóng Vespera", nextImage: "/images/vng-demo/stills/kf3-path-of-guardians.webp" } : { next: "/terra", nextTitle: "terra", nextImage: "/images/terra-outsourcing-preview.webp" };
  return <a className={s.next} href={item.next}><div><span className={s.label}>Keep exploring</span><h2>{item.nextTitle} ↗</h2><p>A different project. Another side of the work.</p></div><img src={item.nextImage} alt={`${item.nextTitle} preview`} loading="lazy" /></a>;
}

