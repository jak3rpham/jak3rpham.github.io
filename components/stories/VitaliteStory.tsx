"use client";
import { CaseChapters } from "../CaseOpening";
import { Story, Chapter, Heading, Action, Picture, Process, Notes, s } from "./StoryKit";

const IMG = "/images/vitalite";
const DEMO = "/vitalite/demo/";

export function VitaliteStory() {
  return <Story next="video">
    <section data-zone="dark" className={s.cinematicHero} id="hero">
      <img src={`${IMG}/hero.webp`} alt="" fetchPriority="high" />
      <div>
        <a href="/" className={s.label}>← Selected work / E-commerce build, WordPress and WooCommerce</a>
        <h1>VITALITÉ.</h1>
        <p>Shopee already sells. The site exists for the audience Shopee cannot reach.</p>
        <Action href={DEMO}>Open the working demo</Action>
      </div>
    </section>

    <CaseChapters links={[
      ["#why", "Why a site at all"],
      ["#constraints", "The real constraints"],
      ["#interface", "Interface decisions"],
      ["#weight", "Weight and speed"],
      ["#facts", "What I would not invent"],
    ]} />

    <Chapter id="why">
      <Heading n="01 / The question that had to be answered first" title="For a Vietnamese buyer," accent="the site loses.">
        <p>
          Voucher stacking, 973 reviews, cash on delivery, four years of seller history. A new domain
          beats none of that, and pretending otherwise would have shaped the whole build wrong.
        </p>
      </Heading>
      <div className={`${s.split} ${s.wide}`}>
        <p className={s.quote}>The site is not a second Shopee. It is the only door for everyone Shopee locks out.</p>
        <div>
          <h3>The evidence was already in the brand&rsquo;s own accounts.</h3>
          <p>
            Instagram carries 7,001 followers against 2,900 on Shopee. The bio reads worldwide shipping.
            Recent captions are written in English and shot on Western models. None of those people can
            complete a purchase on Shopee.vn.
          </p>
          <p>
            That single reading decided the rest: English first with Vietnamese alongside, prices in one
            currency, and a shipping page that describes how orders actually reach the United States
            rather than quoting courier rates that do not apply.
          </p>
        </div>
      </div>
      <Notes visible rows={[
        ["Channel", "Four years on Shopee, 4.9 stars, 973 reviews, 10 listings"],
        ["Audience gap", "7,001 followers on Instagram against 2,900 on Shopee"],
        ["Stack", "WordPress, WooCommerce, custom child theme, bilingual routing"],
        ["Scope", "Solo. Research, build and content operations"],
      ]} />
      <a className={s.browser} href={DEMO} aria-label="Open the VITALITÉ demo storefront">
        <img src={`${IMG}/shop-grid.webp`} alt="VITALITÉ shop page showing four products with colour swatches" loading="lazy" />
      </a>
      <p className={s.caption}>
        The demo runs the real catalogue. Four products, two colourways each, prices read from the live
        Shopee listings. Nothing on it was invented to fill a slot.
      </p>
      <Notes rows={[
        ["Orders to the US are carried, not couriered", "Stock moves to the United States in batches and is distributed domestically from there. International per-parcel pricing was never the model, so the shipping page does not name a carrier for that leg. Writing one in would have been a confident sentence that happened to be false."],
        ["The marketplace conflict is named, not hidden", "Shopee offers 15 day free returns backed by the platform. The site offers 5 days with the customer paying shipping both ways. That is a worse promise at exactly the moment a buyer hesitates, and it belongs in the plan as a known cost rather than a surprise after launch."],
        ["What the site does not try to win", "Discount depth, review volume and delivery speed inside Vietnam are Shopee's to keep. The site competes on being reachable, on the brand reading in English, and on the product pages carrying information a marketplace listing cannot hold."],
      ]} />
    </Chapter>

    <Chapter id="constraints" light>
      <Heading n="02 / Building inside what actually exists" title="Shared hosting." accent="No shell access.">
        <p>
          cPanel, LiteSpeed, PHP 8.3, one person. Every deploy is a zip upload through a browser. That
          rules out a build pipeline, so the architecture had to stay legible without one.
        </p>
      </Heading>
      <Process steps={[
        ["Templates in PHP", "Header and footer are theme templates, not Elementor Theme Builder. A page builder that owns the chrome makes every future edit depend on the builder staying installed and licensed."],
        ["Layout locked, content open", "The theme owns structure. An admin panel owns the homepage gallery and the three hero slides, pulling from the Media Library."],
        ["The panel refuses layout edits", "Deliberately. Give a content panel layout powers and the homepage stops matching the design within a month, with nobody able to say when it drifted."],
        ["Static preview before deploy", "The whole site regenerates as flat HTML from the real theme stylesheet, so layout is reviewed before anything reaches the server."],
      ]} />
      <Picture
        src={`${IMG}/home-grid.webp`}
        alt="VITALITÉ homepage product grid with three t-shirts filling the row"
        caption="The grid sizes itself to the number of products. With a four item catalogue a fixed four column grid left a quarter of one row and three quarters of another standing empty."
      />
    </Chapter>

    <Chapter id="interface">
      <Heading n="03 / Where clothing shopping actually breaks" title="Colour first," accent="then size.">
        <p>
          A dropdown reading Black, White forces the shopper to imagine the garment. Every colour on
          this build is a swatch, and choosing one changes the picture rather than the label.
        </p>
      </Heading>
      <div className={s.browserGrid}>
        <a className={s.browser} href={DEMO + "product.html"} aria-label="Open the product page in the demo">
          <img src={`${IMG}/pdp-grey.webp`} alt="Product page showing the hoodie in grey with a thumbnail strip" loading="lazy" />
        </a>
        <a className={s.browser} href={DEMO + "product.html"} aria-label="Open the product page in the demo">
          <img src={`${IMG}/pdp-white.webp`} alt="The same product page after selecting pure white" loading="lazy" />
        </a>
      </div>
      <p className={s.caption}>
        Selecting a colour swaps the main image and filters the thumbnail strip to that colourway, with a
        hairline separating one colour group from the next. Sizes are buttons, and a size that is gone is
        struck through instead of silently missing.
      </p>
      <Notes rows={[
        ["The same decision on the grid", "Product cards carry colour dots too. Hovering one swaps the card image without a page load, so a shopper can rule a colourway out before committing to a click."],
        ["Front and back, by convention", "The product image is the front and the first gallery image is the back, so hovering any card flips the garment. Products without a second image simply do not flip, rather than erroring."],
        ["No mini cart drawer", "A drawer that slides over the page adds a state to maintain and a place for checkout to break. The cart is an icon with a count that hides itself when empty."],
      ]} />
    </Chapter>

    <Chapter id="weight" light>
      <Heading n="04 / Fashion sites die of image weight" title="117 MB of hero footage." accent="2.3 MB shipped.">
        <p>
          The brand supplied broadcast masters. Serving those would have buried the homepage on the mobile
          connections most of this audience browses on.
        </p>
      </Heading>
      <div className={s.stats}>
        {[["117 MB", "Master footage"], ["2.32 MB", "Hero video shipped"], ["96", "Frames in the About sequence"], ["2.5s", "Mobile LCP budget"]].map(([v, l]) =>
          <div key={l}><strong>{v}</strong><span>{l}</span></div>)}
      </div>
      <Picture
        src={`${IMG}/home-hero.webp`}
        alt="VITALITÉ homepage hero, first slide, carrying the compressed video"
        caption="Slide one of three. This is the only slide that carries video, and on a phone the element never loads, so the heaviest asset on the site costs mobile visitors nothing."
      />
      <Picture
        src={`${IMG}/about-sequence.webp`}
        alt="About page frame sequence showing a model in the heavyweight hoodie"
        caption="The About page runs a 96 frame scroll sequence at 10.6 MB. The garment in those frames is CGI, recorded as such in the project notes so nobody later mistakes it for product photography."
      />
      <Notes rows={[
        ["Video plays on one slide, never on phones", "The hero runs three cross-fading slides and only the first carries video. On mobile the video element never loads at all, so the largest asset on the site costs phone users nothing."],
        ["Compression, measured", "x264 at CRF 30 for the MP4 and VP9 at CRF 46 for the WebM, both eight seconds, no audio track, with the metadata moved to the front so playback can start before the file finishes arriving."],
        ["Cache busting on the stylesheet", "The preview links its stylesheet with a version string taken from the file timestamp. Without it a rebuilt page serves cached CSS and reviewers measure a layout that no longer exists."],
      ]} />
    </Chapter>

    <Chapter id="facts">
      <Heading n="05 / The discipline the project actually needed" title="Twelve pages published." accent="Nothing invented.">
        <p>
          Size charts, delivery windows and return terms are not copy. They are commitments, and in
          clothing a wrong measurement is a return and a legal exposure at the same time.
        </p>
      </Heading>
      <div className={`${s.split} ${s.wide}`}>
        <p className={s.quote}>Where a fact was missing, the sentence came out. Not a placeholder, and not a guess.</p>
        <div>
          <h3>Twelve static pages went live carrying no placeholder boxes.</h3>
          <p>
            The outerwear measurements did not exist, so the hoodie page carries no size table at all, which
            is what the live template does for anything outside t-shirts. Complaint handling times were never
            supplied, so that line is absent rather than approximate.
          </p>
          <p>
            Each removal is recorded with the file and the line to edit once the fact arrives, so the gaps
            are recoverable instead of forgotten.
          </p>
        </div>
      </div>
      <Notes rows={[
        ["The prices are the ones Shopee shows", "276,100 to 599,100 dong, read from the live listings. Shopee also displays a discount percentage, but the original price behind it was never readable. Dividing back out of the percentage produces a number no one ever set, so the demo shows a single price."],
        ["The static preview caught a real bug", "Rebuilding the site with the actual four product catalogue exposed a grid that left three quarters of a row empty. That is what production would have rendered on import day. It was a stylesheet fix, made before anyone saw it."],
        ["Where the project stands", "The theme is live and both language routes resolve. Products are not imported and no payment method is configured yet, so this is a build in progress rather than a launched store with numbers to report."],
      ]} />
      <div className={s.duo}>
        <Picture
          src={`${IMG}/cart.webp`}
          alt="Cart screen with two line items and a total"
          caption="The cart arithmetic is checked, not decorative. Two lines at real prices, and a total that adds up."
        />
        <Picture
          src={`${IMG}/shop-mobile.webp`}
          alt="The shop page at phone width showing a two column product grid"
          portrait
          caption="Phone width, two columns, no horizontal overflow. Reviewed on the same HTML the demo serves."
        />
      </div>
      <Action href={DEMO}>Open the working demo</Action>
    </Chapter>
  </Story>;
}
