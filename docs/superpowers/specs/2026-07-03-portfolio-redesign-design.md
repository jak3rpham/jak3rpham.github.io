# Portfolio Redesign Design Doc

Date: 2026-07-03
Scope: `index.html` only (other pages - terra.html, bong-vespera.html, video.html, pati-challenge/index.html - follow later, once the system proves out on the main page)

## Motivation

Current site (forest-dark theme, blob backgrounds, marquee, glass panels) is directionally good but under-polished: motion feels gimmicky rather than tasteful, and execution doesn't reflect the owner's current skill level. Goal is not a new aesthetic, it's the same identity executed with real craft.

## Design Read

Portfolio for a digital marketing / creative professional (Pham Ngoc Thanh, "Tatsuki"), audience is recruiters and B2B SaaS clients evaluating growth/marketing work. Redesign mode: **Preserve** (per design-taste-frontend Section 11) - keep brand colors, fonts, and information architecture; modernize execution and motion layer.

Dials: `DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 7` · `VISUAL_DENSITY: 3`

## What stays unchanged

- Color tokens (`--bg #0F140F`, `--cream`, `--tan`, `--sand`, `--forest`, `--amber`, gradient accent)
- Fonts: Outfit (body/display), Noto Serif JP (accent/brand), DM Mono (labels/mono UI)
- Page structure / section order: hero → about → terra case study → bong vespera → selected work → video → contact
- Section anchor IDs (`#hero`, `#about`, `#terra`, `#bong`, `#work`, `#video`, `#contact`) - unchanged for nav links
- Copy content is flexible: may be tightened or reordered within a section if it serves the design, but no wholesale rewrite

## Motion system (validated via interactive browser mockups, user-approved)

Every effect below was demoed live (not a static mock) and explicitly approved. Rule: each effect earns its place with a clear purpose (per Emil Kowalski's animation framework: hierarchy / feedback / storytelling / state-transition) - no decoration-only motion, no infinite loops without reason.

| Effect | Where | Purpose | Implementation notes |
|---|---|---|---|
| Magnetic pull | Nav pills, primary CTA buttons | Feedback on hover proximity | Spring-lerp toward cursor, `translate` only, reset to 0 on mouseleave |
| Spotlight border | Project/case-study cards (terra, bong-vespera, selected work) | Draws attention on hover, replaces flat `:hover` border | CSS `radial-gradient` mask tracking `--x/--y`, updated via `mousemove`, GPU-cheap |
| Text scramble | Hero name "Thanh" (hover only, not on load) | One signature delight moment, used once | Character-swap decode over ~15-20 frames, triggered on `mouseenter`, never on page load or scroll |
| Parallax depth (spring-lerp) | Hero only | Adds dimensionality without hard cursor-lock | Multiple layers (portrait, name, stat chip) at different depth multipliers, position smoothed via `lerp` toward target each frame, not raw mouse coordinates |
| Ambient blob | Background of hero + section transitions | Light/mood, no longer a focal shape | Blur increased, animation slowed, opacity reduced versus current implementation so it reads as ambient light, not a cartoon character |
| Sticky-stack scroll (GSAP ScrollTrigger, `start: "top top"`, `pin: true`) | Terra case-study section only | Storytelling: each growth metric/proof point pins then hands off to the next, dramatizing the "before to after" arc | Canonical skeleton from design-taste-frontend Section 5.A; must respect `prefers-reduced-motion` (collapses to normal stacked scroll) |
| Stagger reveal on scroll | About specs/stack rows, selected-work cards | Standard entrance, replaces current instant `.fu.vis` toggle with proper stagger | 30-80ms delay between siblings, `IntersectionObserver`/`whileInView`-equivalent |

### Explicitly removed / changed from current implementation

- **Marquee ticker strip removed.** Taste-skill rule: max one marquee per page, and it read as filler. Replaced with a static stat row that stagger-reveals on scroll instead.
- **Blob morph animation toned down.** Currently the blob is the dominant visual event on load; it becomes ambient background light only (slower, blurrier, lower opacity).
- Video and Contact sections keep motion minimal (simple reveal only) - video content and the final CTA don't need competing effects.

## Section-by-section plan (index.html)

1. **Nav** - magnetic pill-style active indicator (bug from the prototype where the indicator overshot due to double-counting the container's padding in the offset math is a known fix: compute indicator position from `getBoundingClientRect()` deltas, not raw `offsetLeft` added on top of a pre-set `left`).
2. **Hero** - parallax depth layers + scramble-on-hover name + ambient (non-morphing-focal) blob. Remove marquee.
3. **About** - spotlight-border panel(s), stagger-reveal rows, layout unchanged.
4. **Terra case study** - sticky-stack scroll storytelling moment (the one "wow" section per user approval).
5. **Bong Vespera / Selected work** - spotlight-border + subtle tilt on project cards, lazy-fade images.
6. **Video** - reveal-only, no new effects.
7. **Contact** - magnetic CTA button, otherwise minimal.

## Cross-cutting polish

- One consistent corner-radius system (replace ad hoc blob-shaped `border-radius` on images with one deliberate scale).
- Grain overlay opacity reduced toward near-invisible (ambient texture, not a visible effect).
- All motion above the "reduced" threshold wrapped in `prefers-reduced-motion` fallbacks (collapses to static/instant).
- Animate only `transform` and `opacity` for hardware acceleration; no `window.addEventListener('scroll')` for parallax (use `requestAnimationFrame` lerp loop or IntersectionObserver as appropriate, matching what was prototyped).

## Out of scope for this pass

- terra.html, bong-vespera.html, video.html, pati-challenge/index.html - not touched in this iteration.
- No copy/content rewrite beyond what's needed to fit new layout/motion (owner has flagged flexibility here but no rewrite was requested).
- No new design system / library (site stays plain HTML/CSS/vanilla JS, no build step, consistent with current stack).
