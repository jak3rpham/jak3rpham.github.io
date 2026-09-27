"use client";
import { useEffect, useRef, useState } from "react";
import v from "./VitaliteShowcase.module.css";

const DEMO = "/vitalite/demo/";
const ASSET = DEMO + "theme/assets/";
const PRODUCT = DEMO + "theme/products/";
const HOME_STOPS = [
  ["Campaign", "#vt-hero"], ["T-shirts", ".vt-grid--featured"],
  ["The Moments", ".vt-collection"], ["Street gallery", ".vt-gallery-section"],
  ["Metallic banner", ".vt-iri"], ["Footer", ".vt-footer"],
];
const ABOUT_STOPS = [["Opening", "0"], ["Weight", ".35"], ["Fit", ".62"], ["Silhouette", ".88"], ["The story", "story"]];

export function SiteWindow({ page, title, about = false }: { page: string; title: string; about?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    // A slow external resource must not hide an already interactive document.
    const timer = window.setInterval(() => {
      const doc = frame.current?.contentDocument;
      if (doc && doc.URL !== "about:blank" && doc.readyState !== "loading") {
        setLoaded(true);
        window.clearInterval(timer);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [page]);
  const stops = about ? ABOUT_STOPS : page === "index.html" ? HOME_STOPS : [];
  function jump(index: number) {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!win || !doc) return;
    const value = stops[index][1];
    let top = 0;
    if (about && value !== "story") {
      const sequence = doc.querySelector<HTMLElement>("[data-seq-count]");
      if (sequence) top = sequence.getBoundingClientRect().top + win.scrollY + Number(value) * (sequence.offsetHeight - win.innerHeight);
    } else {
      const el = doc.querySelector(about ? ".vta-body" : value);
      if (el) top = el.getBoundingClientRect().top + win.scrollY - 65;
    }
    win.scrollTo({ top, behavior: "instant" });
    setActive(index);
  }
  return <div className={v.liveWindow}>
    <div className={v.browserBar}><span>● ● ●</span><span>{title}</span><a href={DEMO + page} aria-label={`Open ${title} in full page`}>↗</a></div>
    {stops.length > 0 && <div className={v.stopNav} role="group" aria-label={`${title} sections`}>{stops.map(([label], i) => <button key={label} type="button" disabled={!loaded} aria-pressed={active === i} onClick={() => jump(i)}>{label}</button>)}</div>}
    <div className={v.frameViewport} data-enabled={enabled}>
      <iframe ref={frame} src={DEMO + page} title={title} loading="lazy" inert={!enabled} tabIndex={enabled ? 0 : -1} onLoad={() => { setLoaded(true); setActive(0); }} />
      {!loaded && <span className={v.frameLoading}>Loading the storefront…</span>}
    </div>
    <div className={v.windowControls}><span>{about ? "CGI sequence · original About page" : "Static storefront demo"}</span><button type="button" disabled={!loaded} aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>{enabled ? "Exit interaction ↑" : "Interact with the page ↗"}</button></div>
  </div>;
}

export function CollectionScene() {
  return <section data-zone="dark" className={v.collectionScene} aria-labelledby="moments-title">
    <div className={v.collectionCopy}><span className={v.eyebrow}>03 / COLLECTION SPOTLIGHT</span><h2 id="moments-title">The<br /><em>Moments.</em></h2><p>Oversized type meets full-height imagery.</p><a href={DEMO}>View it on the homepage ↗</a><span className={v.collectionIndex} aria-hidden="true">V / 03</span></div>
    <img className={v.collectionPhoto} src={ASSET + "collection-01.webp"} alt="Vitalité collection photography used in The Moments homepage section" width="1050" height="1400" loading="lazy" />
    <div className={v.campaignFilm}><video controls playsInline preload="none" poster={ASSET + "hero-poster.webp"} aria-label="Play Vitalité homepage campaign film"><source src={DEMO + "theme/video/hero-1280.webm"} type="video/webm" /><source src={DEMO + "theme/video/hero-1280.mp4"} type="video/mp4" /></video><span>CAMPAIGN IN MOTION / HOMEPAGE FILM</span></div>
  </section>;
}

export function StreetGallery() {
  return <section data-zone="dark" className={v.street} aria-labelledby="street-title">
    <div className={v.streetHeading}><span className={v.eyebrow}>04 / LIFESTYLE GALLERY</span><h2 id="street-title">On the<br /><em>street.</em></h2><span>#VITALITEDAILY</span></div>
    <div className={v.streetGrid}>{[1,2,3,4,5].map((n) => <figure key={n}><img src={ASSET + `gallery/0${n}-model.webp`} alt={`Vitalité lifestyle photography, gallery image ${n}`} loading="lazy" width="900" height="1200" /></figure>)}</div>
    <div className={v.caption}><span>Supplied brand imagery, arranged in an asymmetric storefront gallery.</span><a href={DEMO}>Explore the gallery in context ↗</a></div>
  </section>;
}

export function ShopDetails() {
  const [back, setBack] = useState(false);
  return <section data-zone="dark" className={v.shopDetails} aria-labelledby="shop-detail-title">
    <div className={v.sectionTop}><span>05 / SHOP & DISCOVERY</span><h2 id="shop-detail-title">Two sides.<br />One piece.</h2></div>
    <div className={v.flipLayout}><div className={v.flipProduct}><div className={v.flipImages}>{["front","back"].map(side => <img key={side} src={PRODUCT + `pink-graffiti-black-${side}.webp`} alt={side === (back ? "back" : "front") ? `Pink Graffiti black t-shirt, ${side} view` : ""} aria-hidden={side !== (back ? "back" : "front")} data-active={side === (back ? "back" : "front")} width="1000" height="1000" loading="lazy" />)}</div><button type="button" aria-pressed={back} onClick={() => setBack(!back)}>{back ? "Show front ↻" : "Turn it around ↻"}</button></div>
      <div className={v.shopScreen}><img src="/images/vitalite/shop-grid.webp" alt="Complete desktop shop showing product names, prices and colour swatches" width="1440" height="900" loading="lazy" /><div className={v.shopNotes}><span>Colour swatches</span><span>Front / back views</span><span>Direct size links</span></div><a href={DEMO + "shop.html"}>Browse the shop ↗</a></div></div>
  </section>;
}

export function VisualSystem() {
  return <section data-zone="dark" className={v.visualSystem} aria-labelledby="system-title">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=JetBrains+Mono:wght@400;700&display=swap" />
    <div className={v.sectionTop}><span>08 / WEBSITE VISUAL SYSTEM</span><h2 id="system-title">Type. Space.<br /><em>Identity.</em></h2></div>
    <div className={v.systemGrid}>
      <figure className={v.logoPlate}><img src={ASSET + "vitalite-wordmark-trim.png"} alt="Supplied Vitalité wordmark" width="617" height="137" loading="lazy" /><figcaption>Supplied brand identity</figcaption></figure>
      <figure className={v.markPlate}><img src={ASSET + "vitalite-mark-trim.png"} alt="Vitalité brand symbol" width="512" height="645" loading="lazy" /><figcaption>Symbol / detail</figcaption></figure>
      <div className={v.typePlate}><span className={v.eyebrow}>ARCHIVO / DISPLAY</span><strong>ALIVE.</strong><span className={v.monoSpec}>JETBRAINS MONO<br />Aa Bb Cc — 0123456789</span></div>
      <div className={v.palettePlate}><div><span style={{background:'#0A0A0A'}} /><span style={{background:'#FFFFFF'}} /><span style={{background:'#E4E4E6'}} /></div><p>Ink / Paper / Hairline</p><span className={v.eyebrow}>WEBSITE PALETTE</span></div>
    </div>
    <div className={v.metalStrip}><span>FINDING HARMONY<br />WITHIN CHAOS.</span><small>Metallic surfaces / editorial moments</small></div>
    <div className={v.caption}><span>Typography and layout choices for the website. Brand marks and photography supplied by Vitalité.</span></div>
  </section>;
}

export function SupportingPages() {
  const [page, setPage] = useState("size-guide.html");
  const choices = [["size-guide.html","Size guide"],["contact.html","Contact"],["shipping.html","Shipping"],["cart.html","Cart"]];
  return <section data-zone="dark" className={v.supporting} aria-labelledby="support-title"><div className={v.sectionTop}><span>THE REST OF THE EXPERIENCE</span><h2 id="support-title">Beyond the<br />shop window.</h2></div><div className={v.supportLayout}><div className={v.pageIndex} role="group" aria-label="Supporting page previews">{choices.map(([file,label],i)=><button key={file} type="button" aria-pressed={page===file} onClick={()=>setPage(file)}><span>0{i+1}</span>{label}<span>↗</span></button>)}<p>Practical pages in the same visual language.</p></div><SiteWindow key={page} page={page} title={choices.find(([file])=>file===page)![1]} /></div></section>;
}
