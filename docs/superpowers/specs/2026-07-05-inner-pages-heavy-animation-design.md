# Inner Pages — Heavy-Animation Redesign (Next.js routes)

**Date:** 2026-07-05
**Scope:** Convert the static `terra.html` / `video.html` / `bong-vespera.html` into Next.js routes on the homepage's maximalist motion system, each section getting a distinct heavy animation. One page at a time. **Terra first.**

## Shared architecture

- New routes: `app/terra/page.tsx`, later `app/video/page.tsx`, `app/bong-vespera/page.tsx`. Section components under `components/terra/*` etc.
- Reuse the homepage motion system already in the root layout: `SmoothScroll` (Lenis + GSAP ticker), `Preloader`, `ScrollProgress`, `CursorFollower`, `GrainOverlay`, plus components `HeroShader`, `Reveal`, `VelocityMarquee`, hooks `useTilt`, `useCountUp`, `useScramble`, `useMagnetic`, `useMediaQuery`.
- Design tokens unchanged: warm near-black + single solid green `#8FD49E` (no gradient text), Bricolage Grotesque display, kanji 達樹, DM Mono for data.
- **Nav becomes pathname-aware** (`usePathname`): on `/` show the section pills (About/Work/Contact); on any inner route show `← Home · Live site ↗ · CV`. Homepage links change `/terra.html`→`/terra`, `/video.html`→`/video`, `/bong-vespera.html`→`/bong-vespera`.
- Content, copy, numbers, and image paths are preserved verbatim from the static HTML. SEO: same page exists at the same slug family; the static `.html` files stay in `public/` until the routes replace them, then the homepage links flip.
- Reduced-motion + hydration discipline from the homepage applies: never branch a component's rendered tree on framer `useReducedMotion()`; use `useMediaQuery("(prefers-reduced-motion: reduce)")`. Never animate `clip-path` with mixed `0`/`100%` units (use transform masks).

## Terra — section → signature effect (each section a different motion family)

1. **Hero** — `HeroShader` WebGL background; `terra-plat.vn` revealed per-letter; 4 telemetry `useCountUp` counters (12×, 978, 31.4M, 55→90); site screenshot (`terra1.webp`) in a 3D-parallax frame; scroll parallax on the block.
2. **Context & role** — editorial two-column. Lead is a word-reveal. The spec panel (Company/Role/Team/Duration/Audience/Stack) animates as a staggered "data readout" (each row wipes in, mono). Giant faint `01` backdrop.
3. **Systems I built** (showpiece) — GSAP **horizontal scroll-hijack**: 4 system panels (Page Publisher, HR Column Publisher, Marketing data hub, Whitepaper + CRM hub). When a panel centers, its SVG process diagram **self-draws** (stroke-dashoffset draw of edges + staggered node pulse). Foundation pills follow as a `VelocityMarquee` or reveal row.
4. **Recent page launches** — 3D **coverflow** (drag + wheel + scroll) of the 4 page screenshots with `rotateY` depth by distance from center; hover-scroll long screenshots. Mobile falls back to a snap carousel / stack.
5. **The numbers** — 6 KPI cards with `useCountUp` + 3D tilt; the GSC line chart **draws on scroll-scrub** (path length tied to section `scrollYProgress`); readnote; CTAs (Visit terra-plat.vn ↗ / ← Back to all work, magnetic).

## Reusable set-pieces to extract (used again on video / bong-vespera)

- `DrawDiagram` — SVG whose edges draw + nodes pulse when in view / active (systems, pipelines).
- `Coverflow` — 3D drag/wheel coverflow of cards.
- `ScrubChart` — an SVG path whose `pathLength` follows a scroll progress value.
- `DataReadout` — staggered mono spec rows.

These generalize: bong-vespera's `pipeline` reuses `DrawDiagram`; its `keyframes`/`concept` reuse `Coverflow`; video's `work` grid reuses tilt + lightbox.

## Verification note

This page family is animation-heavy: headless screenshot tools hang (infinite rAF from shader/Lenis/marquee break virtual-time; `whileInView` needs real scroll). Verify via `next build` + a real-client hydration check (Edge `--dump-dom`, grep dev log for `[browser]` errors) + the user's own browser pass. Don't claim visual correctness from headless.
