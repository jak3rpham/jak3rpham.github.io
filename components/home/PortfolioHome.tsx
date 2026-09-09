"use client";
import { useEffect, useRef, useState } from "react";
import { HomeNavRail } from "../HomeNavRail";
import { ScrollArtwork } from "../visual/ScrollArtwork";
import { WorkflowVisual, CareIllustration } from "./WorkflowVisual";
import { HomeSchematics, HomeRange } from "./RetainedHome";
import { Assembly } from "./Assembly";
import { useShowcase } from "@/lib/useShowcase";
import { onScrollFrame } from "@/lib/scrollTicker";
import { FlowGround, ThemeFlow } from "../ThemeFlow";
import { VideoTeaser } from "../VideoTeaser";
import { Contact } from "../Contact";
import { Footer } from "../Footer";
import s from "./PortfolioHome.module.css";

const chart = "M0,138 L46,130 L92,124 L138,134 L184,137 L230,129 L276,61 L323,30 L369,104 L415,98 L461,55 L508,31 L554,89 L600,12";
const screens = [
  { label: "The experience", src: "/images/nha-minh/12-hai-man-hinh.png", caption: "Two generations. One connected experience." },
  { label: "For parents", src: "/images/nha-minh/07-app-bame-hom-nay.png", caption: "A calmer way to manage everyday care." },
  { label: "For family", src: "/images/nha-minh/01-trang-chao-hero.png", caption: "One place to keep the family in the loop." },
];
function Link({ href, children, quiet = false }: { href: string; children: React.ReactNode; quiet?: boolean }) {
  return <a className={`${s.link} ${quiet ? s.quiet : ""}`} href={href} {...(href.startsWith("https") ? { target: "_blank", rel: "noreferrer" } : {})}><span>{children}</span><span aria-hidden="true">↗</span></a>;
}
function MotionPreview() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <div className={s.motionPreview} onMouseEnter={() => { if (!matchMedia("(prefers-reduced-motion: reduce)").matches) void ref.current?.play().catch(() => {}); }} onMouseLeave={() => ref.current?.pause()}>
    <video ref={ref} muted loop playsInline preload="none" poster="/images/vng-demo/stills/kf3-path-of-guardians.webp" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} src="/images/vng-demo/motion/motion-kf3-to-kf5-seedance.mp4" />
    <button onClick={() => playing ? ref.current?.pause() : void ref.current?.play().catch(() => {})}>{playing ? "Pause motion Ⅱ" : "Play motion ↗"}</button>
  </div>;
}
export function PortfolioHome() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const preview = useShowcase(screens.length);
  const screen = preview.index;
  const setScreen = preview.select;
  const [film, setFilm] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const stop = onScrollFrame((y, vh) => {
      const p = media.matches ? 0 : Math.min(Math.max(y / (vh * .75), 0), 1);
      // The scene travels with the document: no pin, spacer or dead scroll range.
      if (frame.current) {
        frame.current.style.transform = `scale(${1 - p * .09})`;
        frame.current.style.borderRadius = `${p * 36}px`;
      }
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.setAttribute("data-seen", "true"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    root.current?.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    return () => { stop(); observer.disconnect(); };
  }, []);
  return <main ref={root} className={s.home}><FlowGround /><ThemeFlow initial="dark">
    <section id="hero" data-zone="dark" className={s.hero}><div ref={frame} className={s.heroFrame} data-hero-frame>
      <Assembly /><div className={s.heroShade} />
      <div className={s.heroCopy}><p className={s.eyebrow}><span className={s.heroName}>Pham Ngoc Thanh / Tatsuki</span><span>Ho Chi Minh City</span></p><h1>Ideas into<br /><em>actual things.</em></h1><div className={s.heroBottom}><p>I direct AI, connect disciplines,<br />and make things happen.<br /><span>Growth. Products. Creative.</span></p><Link href="#terra">Explore selected work</Link></div></div>
      <div className={s.heroIndex}><span>Independent mind. Many ways to make.</span><span>Scroll to explore ↓</span></div>
    </div></section>
    <section id="terra" data-zone="light" className={`${s.terra} ${s.section}`}>
      <div className={s.sectionTop}><span className={s.eyebrow}>01 / The work behind the growth</span><span className={s.eyebrow}>terra · 2024 to 2026</span></div>
      <div className={s.terraHeading} data-reveal><h2>One brand.<br /><em>Many moving parts.</em></h2><div><p>22 months connecting growth strategy, content, design and AI-assisted workflows for a B2B HR & payroll business.</p><Link href="/terra">Inside the terra work</Link></div></div>
      <div className={s.terraCanvas} data-reveal><div className={s.browser}><div className={s.browserBar}><span>● ● ●</span><span>terra-plat.vn</span><span>Hover to explore ↓</span></div><a href="/terra" aria-label="Explore terra website work" className={s.longShot}><img src="/images/terra-outsourcing-preview.webp" alt="terra outsourcing landing page" loading="lazy" /></a></div><a href="/terra" className={s.socialShot}><img src="/images/terra-social/02-law-update-econtract-vi.webp" alt="terra e-contract editorial design" loading="lazy" /><span>Content & creative direction ↗</span></a></div>
      <div className={s.proof} data-reveal><div><span className={s.eyebrow}>From launch to momentum</span><strong>12×</strong><span>organic growth</span><strong className={s.health}>31.4M</strong><span>search impressions</span></div><div className={s.chart}><div><span>Organic search trajectory</span><span>22 months ↗</span></div><svg viewBox="0 0 600 170" role="img" aria-label="Illustrative trajectory of terra organic search growth"><path d={`${chart} L600,170 L0,170 Z`} fill="currentColor" opacity=".08" /><path className={s.chartLine} d={chart} fill="none" stroke="currentColor" strokeWidth="3" pathLength="1" /></svg><small>Illustrative trend · case study contains the evidence</small></div><div><strong>978</strong><span>keywords in the top 10</span><strong className={s.health}>55 → 90</strong><span>site health score</span></div></div>
      <div id="systems" className={s.workflow} data-reveal><p>More than campaigns.<br /><b>A better way to work.</b></p><WorkflowVisual /><Link href="/terra" quiet>See the workflows</Link></div><ScrollArtwork variant="publishing" compact/><HomeSchematics/>
    </section>
    <section id="work" data-zone="light" className={`${s.products} ${s.section}`}>
      <div className={s.sectionTop}><span className={s.eyebrow}>02 / Ideas you can use</span><span className={s.eyebrow}>Product thinking × AI direction</span></div><h2 data-reveal>What if this<br /><em>actually existed?</em></h2>
      <article id="nhaminh" className={s.nha} data-reveal><div className={s.nhaCopy}><span className={s.eyebrow}>Nhà Mình / Family care</span><h3>A little closer.<br />Even from afar.</h3><p>An AI-assisted care experience designed around Vietnamese parents and the children looking out for them.</p><div className={s.tabs} role="tablist" aria-label="Nhà Mình product previews" onFocusCapture={preview.stop} onKeyDown={e => { const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!delta && e.key !== "Home" && e.key !== "End") return; e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? screens.length - 1 : (screen + delta + screens.length) % screens.length; setScreen(next); document.getElementById(`preview-tab-${next}`)?.focus(); }}>{screens.map((item, i) => <button key={item.label} id={`preview-tab-${i}`} role="tab" tabIndex={screen === i ? 0 : -1} aria-selected={screen === i} aria-controls="nha-preview" onClick={() => setScreen(i)}>{item.label}{screen===i&&<span className={s.tabProgress} style={{animation:"none",transform:`scaleX(${preview.progress})`}} aria-hidden="true"/>}</button>)}</div><button className={s.previewPause} onClick={preview.toggle} aria-pressed={preview.paused} disabled={preview.reduced}>{preview.reduced?"Auto-switch off":preview.paused?"Resume showcase ↗":"Pause showcase Ⅱ"}</button><p className={s.screenCaption}>{screens[screen].caption}</p><Link href="/nha-minh">Explore Nhà Mình</Link></div><div id="nha-preview" role="tabpanel" aria-labelledby={`preview-tab-${screen}`} className={s.nhaScreen}><div ref={preview.ref} className={s.cleanPreview}>{screens.map((item,i)=><img key={item.src} src={item.src} alt={`Nhà Mình · ${item.label} interface`} aria-hidden={screen!==i} style={{gridArea:"1 / 1",opacity:screen===i?1:0,transition:"opacity 240ms ease-out"}} loading="lazy" />)}</div><CareIllustration /></div></article>
      <div className={s.productGrid}>{[{ title: "IELTS Studio", overview: "An IELTS practice platform with AI-assisted feedback and a personal learning path.", tag: "Learning, made more personal", src: "/images/ielts-preview.webp", href: "/ielts-studio" }, { title: "UpHub", overview: "A business website that brings the company, its services and enquiries into one place.", tag: "A clearer digital front door", src: "/images/uphub.webp", href: "https://uphub.vn" }, { title: "Badminton Club", overview: "A club management app that makes organising badminton sessions easier.", tag: "Less organising. More playing.", src: "/images/badminton-preview.webp", href: "https://badminton-app-weld.vercel.app/" }].map((p, i) => <article className={s.product} data-product={p.title} data-reveal key={p.title}><a href={p.href} className={s.productImage} aria-label={`Explore ${p.title}`}><img src={p.src} alt={`${p.title} website preview`} loading="lazy" /><span className={s.openProject}>Explore project ↗</span></a><div className={s.productMeta}><div><span className={s.eyebrow}>0{i + 1} / {p.tag}</span><h3>{p.title}</h3><p className={s.projectOverview}>{p.overview}</p></div><a className={s.roundLink} href={p.href} aria-label={`View ${p.title}`}>↗</a></div></article>)}</div>
    </section>
    <section id="aru" data-zone="dark" className={s.cinema}><div className={s.cinemaHead} data-reveal><span className={s.eyebrow}>03 / The creative side</span><h2>Different medium.<br /><em>Same curiosity.</em></h2></div>
      <div className={s.filmStage}>{film ? <iframe title="Aru Otoko music video" src="https://www.youtube.com/embed/erqSvIsXUpI?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <button className={s.filmPoster} onClick={() => setFilm(true)} aria-label="Play Aru Otoko film"><img src="/images/aru-otoko/poster/poster-horizontal.webp" alt="Aru Otoko · cinematic AI music video" loading="lazy" /><span className={s.play}>▶</span><span className={s.watch}>Watch the film · 33 seconds</span></button>}</div>
      <div className={s.filmInfo}><div><span className={s.eyebrow}>AI film / Creative direction / Editing</span><h3>Aru Otoko<span>或る男</span></h3></div><p>A story shaped through image, rhythm and intention. AI generates the frames. I direct what they become.</p><Link href="/aru-otoko">Behind the film</Link></div>
      <div className={s.filmStills} data-reveal>{["s01-back", "s05-rooftop", "s06-vending"].map((shot, i) => <a href="/aru-otoko" key={shot} aria-label={`Explore Aru Otoko shot ${i + 1}`}><img src={`/images/aru-otoko/stills/${shot}.webp`} alt={`Aru Otoko · directed film still ${i + 1}`} loading="lazy" /></a>)}</div>
      <div id="bong" className={s.bong} data-reveal><div className={s.bongPoster}><img src="/images/vng-demo/final/ad-mockup-final.webp" alt="Bóng Vespera final campaign artwork" loading="lazy" /></div><div className={s.bongStory}><span className={s.eyebrow}>From a visual world to a moving one</span><h3>Bóng<br /><em>Vespera.</em></h3><p>Art direction, image-making and motion. One visual idea carried all the way through.</p><MotionPreview /><Link href="/bong-vespera">Explore the creative process</Link></div></div>
    </section>
    <div data-zone="dark" className={s.archive}><VideoTeaser /></div>
    <section id="about" data-zone="light" className={`${s.about} ${s.section}`}><div className={s.portrait}><img src="/images/hero-portrait.webp" alt="Pham Ngoc Thanh, also known as Tatsuki" loading="lazy" /><dl className={s.portraitFacts}><div><dt>Based in</dt><dd>Ho Chi Minh City</dd></div><div><dt>Education</dt><dd>UEH · ISB<br/>International Business, 2025</dd></div><div><dt>Languages</dt><dd>Vietnamese / English</dd></div></dl></div><div data-reveal><span className={s.eyebrow}>A person, not a single job title</span><h2>Hi, I’m Thanh.<br /><em>Call me Tatsuki.</em></h2><p>I work across growth, products and creative. My role is to connect the idea, the tools and the people, using AI to turn a wider range of ideas into finished work.</p><p>Sometimes that means a growth workflow. Sometimes a useful product. Sometimes a film. The common thread is knowing what to make, and caring how it turns out.</p><HomeRange/><Link href="mailto:pnthanh.work@gmail.com">Let’s talk about your next idea</Link></div></section>
    <div data-zone="dark" className={s.archive}><Contact /><Footer /></div>
  </ThemeFlow><HomeNavRail/></main>;
}





