"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { onScrollFrame } from "@/lib/scrollTicker";
import { Story, Action, s } from "./StoryKit";
import v from "./VitaliteShowcase.module.css";
import { SiteWindow, CollectionScene, StreetGallery, ShopDetails, VisualSystem, SupportingPages } from "./VitaliteMaterials";

const IMG = "/images/vitalite";
const DEMO = "/vitalite/demo/";

export function VitaliteStory() {
  const stage = useRef<HTMLAnchorElement>(null);
  const [colour, setColour] = useState("grey");
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let top = 0;
    return onScrollFrame((y, h) => {
      const p = Math.max(0, Math.min(1, (y + h - top) / h));
      el.style.transform = reduced.matches || window.innerWidth < 760 ? "none" : `scale(${.88 + .12 * p})`;
    }, () => { top = el.getBoundingClientRect().top + window.scrollY; });
  }, []);

  return <Story next="video">
    <div className={v.showcase}>
      <section data-zone="dark" className={`${s.cinematicHero} ${v.hero}`} id="hero">
        <img src={`${IMG}/hero.webp`} alt="Model wearing a Vitalité hoodie" fetchPriority="high" width="1440" height="900" />
        <div>
          <Link href="/" className={s.label}>← Selected work / Fashion e-commerce</Link>
          <h1>VITALITÉ.</h1>
          <p>A digital storefront for a Saigon streetwear label.</p>
          <Action href={DEMO}>Explore the demo</Action>
        </div>
        <span className={v.heroFoot}>DESIGN & DEVELOPMENT <span>SCROLL TO EXPLORE ↓</span></span>
      </section>

      <section data-zone="dark" className={v.opening} aria-label="Project overview">
        <div className={v.meta}><span>SOLO PROJECT</span><span>UX / UI · CUSTOM THEME</span><span>WORDPRESS + WOOCOMMERCE</span></div>
        <div className={v.intro}><h2>Streetwear.<br /><em>On screen.</em></h2><p>Designed and built an English-first storefront for the label’s international audience, with Vietnamese alongside.</p></div>
        <a ref={stage} className={v.homeStage} href={DEMO} aria-label="Explore the Vitalité homepage demo">
          <span className={v.browserBar}><span>● ● ●</span> VITALITÉ / HOMEPAGE <span>↗</span></span>
          <img src={`${IMG}/home-hero.webp`} alt="Vitalité homepage with full-width campaign photography" width="1440" height="900" loading="lazy" />
        </a>
        <div className={v.caption}><span>Full-bleed imagery. Room for the clothes.</span><span>01 / STOREFRONT</span></div>
        <div className={v.overviewIntro}><span className={v.eyebrow}>02 / THE COMPLETE HOMEPAGE</span><h3>From the first frame<br />to the final link.</h3><p>Explore every section of the storefront.</p></div>
        <SiteWindow page="index.html" title="Complete Vitalité homepage" />
      </section>

      <CollectionScene />
      <StreetGallery />
      <ShopDetails />

      <section data-zone="dark" className={v.product} aria-labelledby="product-title">
        <div className={v.productHeading}><div><span className={v.eyebrow}>06 / PRODUCT DETAILS</span><h2 id="product-title">Same fit.<br /><em>Different mood.</em></h2></div>
          <div className={v.controls}><span>Try a colour</span><div role="group" aria-label="Product colour preview">{["grey", "white"].map(c => <button key={c} type="button" aria-label={`Show ${c} colourway`} aria-pressed={colour === c} onClick={() => setColour(c)} className={c === "grey" ? v.grey : v.white} />)}</div><span aria-live="polite">{colour === "grey" ? "Grey" : "Pure white"}</span></div>
        </div>
        <div className={v.productScreen}>{["grey", "white"].map(c => <img key={c} src={`${IMG}/pdp-${c}.webp`} alt={c === colour ? `Product page displaying the ${c} colourway` : ""} aria-hidden={c !== colour} data-active={c === colour} width="1440" height="900" loading="lazy" />)}</div>
        <div className={v.caption}><span>Colour swatches → matching imagery → size selection.</span><a href={`${DEMO}product.html`}>Try the product page ↗</a></div>
      </section>

      <section data-zone="dark" className={v.motion} aria-labelledby="motion-title">
        <div className={v.sectionTop}><span>07 / THE ABOUT EXPERIENCE</span><h2 id="motion-title">Words move.<br /><em>The story unfolds.</em></h2></div>
        <SiteWindow page="about.html" title="About — editorial scroll experience" about />
        <div className={v.caption}><span>Original page layout, scroll-driven type and a 96-frame CGI sequence.</span><a href={DEMO + "about.html"}>Open About ↗</a></div>
      </section>
      <VisualSystem />
      <section data-zone="dark" className={v.catalogue} aria-labelledby="mobile-title">
        <div className={v.sectionTop}><span>09 / MOBILE</span><h2 id="mobile-title">Made for the small screen.</h2></div>
        <div className={v.catalogueGrid}>
          <figure className={v.desktop}><img src={`${IMG}/home-grid.webp`} alt="Three-column desktop product grid" width="1440" height="900" loading="lazy" /><figcaption>Edge-to-edge product grid</figcaption></figure>
          <figure className={v.phone}><img src={`${IMG}/shop-mobile.webp`} alt="Mobile storefront with a two-column product grid" width="390" height="844" loading="lazy" /><figcaption>The same store, pocket-sized.</figcaption></figure>
          <span className={v.giantWord} aria-hidden="true">WEAR<br />IT YOUR<br />WAY.</span>
        </div>
      </section>

      <SupportingPages />

      <section data-zone="dark" className={v.finish} aria-label="Explore the project">
        <div><span className={v.eyebrow}>10 / EXPLORE THE BUILD</span><h2>Take it<br /><em>for a scroll.</em></h2><Action href={DEMO}>Explore the demo</Action><p>Interactive storefront preview. Checkout and payments are not live.</p></div>
        <a href={`${DEMO}cart.html`} className={v.cart} aria-label="Explore the cart demo"><img src={`${IMG}/cart.webp`} alt="Vitalité cart layout with products and order summary" width="1440" height="900" loading="lazy" /></a>
      </section>
    </div>
  </Story>;
}
