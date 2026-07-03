# terra.html Motion Redesign Design Doc

Date: 2026-07-03
Scope: `terra.html` only. `bong-vespera.html`, `video.html` follow later as their own spec/plan cycles. `pati-challenge/index.html` is explicitly out of scope (separate design system, built for an external submission, not part of the portfolio's visual identity).

## Motivation

`terra.html` shares its design tokens, component classes, and base motion library with `index.html` but predates the `index.html` motion-redesign work (nav is still the old `<ul class="nav-links">`, no magnetic/spotlight/parallax effects). Owner has explicitly asked for **heavier, more complex motion** on this pass than what `index.html` got, since `index.html` is considered "done" and further iteration there has diminishing returns.

## Design Read

Same audience/brand as `index.html` (Redesign - Preserve for color/fonts/IA), but this page's content is unusually well-suited to bigger set-piece motion: "Systems I built" already has 4 hand-built SVG process diagrams sitting in a repeated zigzag two-column split (the same repetition problem `index.html` had), and "Recent page launches" is a 4-item screenshot gallery in a static 2x2 grid. Both are named, approved targets for the taste-skill's scroll-hijack and coverflow patterns (Section 10 vocabulary).

Dials: `DESIGN_VARIANCE: 8` · `MOTION_INTENSITY: 8` · `VISUAL_DENSITY: 3` (higher than `index.html`'s `7/7/3`, per explicit request for more complex effects).

## What stays unchanged

- Color tokens, fonts, and terra.html's own warm-brown accent variant (`--earth: #C08A56`, `--bg: #140D07` etc. - distinct per-page accent hue is an existing, intentional pattern across the case-study pages, not something to unify).
- Page structure/section order: hero → Context & role → Systems I built → Recent page launches → The numbers → footer.
- Section anchor IDs (`#hero`, `#ctx`, `#systems`, `#pages`, `#results`) and all existing content/copy.
- The 4 existing hand-built SVG process diagrams (`.fig` markup in each `sysrow`) - reused as-is inside the new horizontal-pan slides, not redrawn.

## Section-by-section plan

### Nav + Hero
Bring to parity with `index.html`'s validated pattern: replace `<ul class="nav-links">` with the magnetic pill nav + scroll-spy indicator (same CSS/JS, adapted anchor targets: `#ctx`, `#systems`, `#results`); add hero parallax depth (main text + hero-shot at different depth multipliers) and scramble-on-hover on the `<h1>`. This is direct reuse of already-shipped, already-verified code from `index.html`, not new design work.

### Context & role
No layout change - this is the only 2-column split on the page, so it doesn't trigger the repetition problem. Add spotlight-border to the `.panel` (same CSS pattern as `index.html`'s `.panel.feature-screen`/`.stack-card` spotlight).

### Systems I built - horizontal scroll-hijack (signature moment)
Replace the 4 vertically-stacked, alternating `sysrow` blocks with a pinned horizontal-pan track (canonical GSAP `ScrollTrigger` horizontal-pan skeleton: wrapper pinned at `start:"top top"`, inner track translated by scroll distance, `scrub:true`). Each system becomes one full-viewport-width slide containing its existing text block (`.systxt`) and existing SVG diagram (`.sysfig`) side by side (reusing the current internal layout of each row, just as a slide instead of a stacked block).

The diagrams' existing `.live`-triggered animations (`fig-flow`, `fig-halo`, `fig-bar` - dash-offset flow, halo pulse, bar grow) currently key off section-level visibility. They're re-keyed to fire when a slide becomes the *active* slide in the horizontal pan (tracked via the pan's scroll progress, not a separate IntersectionObserver), so the diagram animates in exactly when its slide is centered, not all four firing together on section entry.

Mobile (`<768px`, same threshold as `index.html`'s Terra stack) and `prefers-reduced-motion`: collapse to the original vertical zigzag stack, unchanged from current behavior - no pin, no horizontal pan.

### Recent page launches - coverflow drag gallery
Replace the static 2x2 `.shots-grid` with a horizontally scrollable coverflow: cards arranged in a single row inside an `overflow-x:auto` + `scroll-snap-type:x mandatory` track (native touch/trackpad scrolling works for free), plus pointer-drag-to-scroll for mouse users (pointerdown/pointermove/pointerup translating drag delta to `scrollLeft`, matching the "moderate, not over-engineered" calibration from the `index.html` feedback round - no momentum/physics simulation, just direct 1:1 drag). A scroll-position listener (rAF-throttled, reads `scrollLeft` once per frame - not a raw `scroll` listener per Section 5.D's ban) computes each card's distance from the track's center and applies a subtle `rotateY`/`scale`/`opacity` falloff so off-center cards tilt and recede, center card reads flat and full-scale. The existing hover-to-scroll screenshot reveal (`.shot-win` translateY trick) is preserved per-card, unchanged.

Mobile: same drag/snap mechanics work natively via touch scrolling; no separate mobile fallback needed (this pattern degrades gracefully by design, unlike the pinned horizontal-pan above).

### The numbers
No layout change (KPI grid + chart panel is already distinct from the split-column pattern). Add spotlight-border to `.panel.feature-screen` (same reused pattern), stagger-reveal on the KPI grid cells (same `.fu` + staggered `data-d`/sibling-delay pattern already used elsewhere), and `.magnetic` on the closing `Visit terra-plat.vn` CTA.

## Cross-cutting

- GSAP + ScrollTrigger: add the same CDN `<script>` tags `index.html` uses (this page currently has no GSAP).
- All new effects respect `prefers-reduced-motion` (collapse to static/instant) and the `matchMedia('(hover:hover) and (pointer:fine)')` gate for hover-only interactions, matching `index.html`'s established conventions.
- Reuse, don't reinvent: nav pill/magnetic/spotlight/parallax/scramble CSS and JS are copied from `index.html`'s already-shipped implementation, not redesigned.

## Out of scope for this pass

- `bong-vespera.html`, `video.html`, `pati-challenge/index.html` - separate specs.
- No copy/content changes beyond what the new layouts require structurally (no text rewrites).
- No changes to the terra-plat.vn live site itself (screenshots/data are static content).
