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

---

## Addendum (2026-07-03, v2): layout rework after first-pass feedback

The first pass (Tasks 1-8, merged to `main`) added motion on top of the existing layout under "Preserve" mode. Owner feedback after seeing it live: not enough visible difference, and three concrete regressions/pre-existing issues that a real design pass should have caught:

1. **Terra live-site frame reads as tiny.** Root cause found in code: `.shot-win{height:380px}` is a fixed pixel height, but the element now stretches to the full width of its container (previously it sat in a 2-up grid at ~48% width). A 380px-tall frame at full container width renders as a squat, letterboxed strip rather than a proportioned browser window.
2. **Sticky-stack transition is illegible.** The outgoing card only drops to `opacity:.55/scale:.92` - not enough separation from the incoming card, so both compete visually mid-scroll. This was never actually eyeballed for legibility during Task 7, only checked programmatically (pin fires, scale value changes).
3. **Bong Vespera ad mockup is disproportionate.** `.mock-body{aspect-ratio:2/3}` sitting in a `1fr 1.2fr` grid next to a short 4-line stat block, `align-items:center` - the portrait-oriented mockup ends up far taller than its sibling column. Pre-existing, not part of the first pass, but now in scope.
4. **Root cause of "not different enough":** nearly every section on the page uses the same layout family - an asymmetric two-column split (hero 1.5:1, `about-grid` 1.5:1, `terra-cols` 1.4:1, `bong-foot` 1:1.2, `work-feat` 1:1 repeated identically for **three consecutive** projects). Motion was added on top of this repeated skeleton, which is why the page reads as unchanged. This directly violates the taste-skill's section-layout-repetition rule.

**Mode change:** owner has now approved moving from Preserve to a bigger layout pass ("đổi layout toàn trang, mạnh tay hơn") - specifically for the Selected Work section's repetition. Other sections (hero, about, video, contact) are not being restructured in this addendum; only the four items below are in scope.

### Fixes (validated via before/after browser mockups, user-approved with calibration notes)

| # | Item | Before (current) | After (approved direction) | Calibration from feedback |
|---|---|---|---|---|
| 1 | Terra live-site frame | `.shot-win{height:380px}` fixed px, full container width -> squat/letterboxed | Cap the `.shot` component's width (don't stretch to full stack width) and size the screenshot window by `aspect-ratio` instead of a fixed px height, so it reads as a properly-proportioned browser window | "Vừa phải thôi, không cần full width" - moderate, centered, NOT edge-to-edge full-bleed |
| 2 | Sticky-stack legibility | Outgoing card: `opacity:.55, scale:.92` - competes with incoming card | Outgoing (receding) card dims/scales further (moderate - not extreme fade-to-nothing) with a touch of blur; incoming (active) card stays fully opaque with a real lift shadow so it unambiguously reads as "in front" | "Layer sau visible một tí cũng hay" (the receded layer can still peek through a little - don't hide it completely) "nhưng cái chính đằng trước vẫn coi rõ được" (but the front one must stay clearly readable) - so dial back from the demo's `opacity:.22 + blur:3px` to something gentler, e.g. `opacity:.35-.4`, `blur:1.5-2px`, while keeping the incoming card's shadow/full-opacity treatment as-is |
| 3 | Bong Vespera ad mockup | `.mock-body{aspect-ratio:2/3}` fills its full `1.2fr` grid column height | Cap the mockup to a moderate max-size (not stretched to fill the column, not shrunk tiny) | "Vừa phải là được, không bị bự mà cũng không quá nhỏ" - moderate, e.g. constrain by `max-height` relative to viewport rather than letting the grid column dictate its size |
| 4 | Selected Work repetition | 3 consecutive `work-feat` rows (uphub.vn, Badminton, IELTS Studio), all identical image+text split | uphub.vn becomes a featured, full-width highlight; Badminton and IELTS Studio become compact side-by-side cards in a different layout family | Approved as-is, no calibration needed |

### Explicitly out of scope for this addendum

- No changes to hero, about, video, or contact section layouts (only their motion, from the first pass, stands).
- No further visual-mockup rounds needed for these four items - directions are approved with the calibration notes above; implementation should apply the calibration values directly rather than re-brainstorming.
