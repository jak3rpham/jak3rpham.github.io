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

---

## Addendum (2026-07-03, v3): terra.html - heavier motion pass

`index.html` is considered finished for now (owner: "làm quài cũng thế không tốt hơn được" - further iteration on it has diminishing returns). Work now moves page-by-page to the rest of the site, starting with `terra.html`. `bong-vespera.html` and `video.html` follow later as their own addenda/specs. `pati-challenge/index.html` is explicitly **out of scope** - it uses a completely different design system (light mode, Fraunces/Manrope/JetBrains Mono, no shared classes with the rest of the site) because it was built for a specific external submission, not as a portfolio subpage, and stays as-is.

### Design read

`terra.html` shares `index.html`'s color-token structure and component classes (`.panel`, `.pill`, `.btn-fill`, `.shot`, `.sec-title`, the `.m-*` motif system) but with its own accent hue (warm brown/amber vs. index's forest green) - that per-page accent identity is preserved. Mode is still **Preserve** for color/type/IA, but the owner has explicitly asked for **more motion complexity** than `index.html` got, since they installed `design-taste-frontend` and `emil-design-eng` specifically to push further once the home page pattern was proven. Dial change from the first pass: `MOTION_INTENSITY: 8` (up from 7), `DESIGN_VARIANCE: 8`.

### What carries over from index.html as-is (already validated, no re-brainstorming needed)

- Nav: magnetic pill bar + scroll-spy indicator (same component, same fix for the offset bug).
- Hero: parallax depth (spring-lerp) on name/portrait-equivalent (terra.html's hero has a `.hero-shot` browser-frame instead of a portrait photo - same depth-layer treatment applies to it), scramble-on-hover on the `terra-plat.vn` hero name.
- Spotlight-border on `.panel` / `.shot` cards.
- Magnetic CTA on the closing "Visit terra-plat.vn" button.
- `prefers-reduced-motion` and mobile (`<768px`/`<820px`) fallback discipline, same pattern as the first pass.

### New, heavier effects for this page (owner-approved)

| Section | Current state | New treatment | Why |
|---|---|---|---|
| Systems I built | 4 `.sysrow` blocks, alternating image-left/right (`.rev`) split, identical layout family repeated 4x - each already has a hand-built SVG process diagram (`.sysfig`) with dash-draw/halo-pulse/bar-grow animations gated on `.sec.live` (whole-section visibility) | Horizontal scroll-hijack: vertical scroll drives horizontal pan through the 4 systems like a filmstrip (GSAP ScrollTrigger horizontal-pan, canonical skeleton per design-taste-frontend Section 5.B: pinned wrapper, `start:"top top"`, `end:"+=${distance}"`, `scrub`). Each system's existing SVG diagram animation is rewired to fire when that system becomes the *active* panel (not on whole-section visibility), so the diagrams draw in sequence as the user scrolls, matching the horizontal storytelling beat instead of all firing at once. | Directly fixes the repeated-layout-family problem (4x identical zigzag) and gives this page its own signature moment distinct from index.html's Terra sticky-stack, while reusing content (diagrams) that already exists |
| Recent page launches | `.shots-grid`, static 2x2 grid of 4 screenshot cards with a hover-to-scroll reveal on each | Coverflow/drag gallery: cards arranged in a horizontal row, center card upright and largest, side cards rotated in 3D (`rotateY`) and scaled down, drag/swipe (pointer events) or scroll-snap to bring a card to center, existing hover-to-scroll-reveal behavior preserved on the active/center card only | Different layout family from the horizontal-pan Systems section (drag-driven, not scroll-driven) and from Terra's sticky-stack on index.html - keeps the page from feeling like one repeated trick |
| The numbers (KPI + chart) | KPI grid (6 cells) + one chart panel, `.fu` reveal only | Stagger-reveal on the KPI grid cells (30-80ms cascade, matching the index.html pattern) + spotlight-border on the chart panel (reuse, not new) | Deliberately the "quiet" section after two heavy effects - per taste-skill motion-must-be-motivated rule, not every section needs a new trick |

### Technical notes

- `terra.html` is a standalone HTML file (no shared build/bundle with `index.html`), so it needs its own GSAP + ScrollTrigger CDN `<script>` tags added, same CDN URLs as `index.html` uses.
- Horizontal-pan and coverflow are both **desktop/tablet only** (`≥820px`, matching this file's existing tablet breakpoint) - below that they collapse to normal vertical stacking (Systems: the 4 `.sysrow` blocks stack normally, diagrams animate on individual scroll-into-view same as before) and a normal 1-column scroll list (page launches), consistent with the mobile-collapse rule already applied on `index.html`.
- Coverflow drag must support both pointer drag and scroll-wheel/trackpad horizontal scroll, and must not block page scroll when the gallery is not the target of the gesture.

### Explicitly out of scope for this addendum

- `bong-vespera.html`, `video.html`, `pati-challenge/index.html` - separate addenda later.
- No content/copy rewrite on `terra.html` beyond what the new layouts require structurally (e.g. wrapping markup for the horizontal-pan track) - the existing copy for all 4 systems and 4 page launches stays as-is.
