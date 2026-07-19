# Homepage refresh + aru-otoko mobile fixes

Date: 2026-07-19
Owner: Pham Ngoc Thanh (Tatsuki)
Status: design, awaiting review

## Context

Follow-up work after the ある男 AI music-video case study shipped. Four scoped
changes, split across the aru-otoko case-study page and the homepage. Build order,
decided with the user: mobile aru fixes first (visible bugs), then the homepage
redesign items.

The site is Next.js App Router, static export, Tailwind v4, Framer Motion, Lenis
smooth scroll, OGL WebGL backdrops. Every section already shares the container
convention `px-[var(--pad)]` with an inner `mx-auto max-w-[1400px]`. Headless
cannot visually verify this page family (infinite rAF, IntersectionObserver, WebGL);
the user verifies in his own browser. A DOM overflow scan at a fixed width is data,
not visual, so it is a valid headless check.

## Goals

1. aru-otoko mobile: kill the horizontal overflow and fix the walk set piece.
2. Homepage navigation: make every section discoverable.
3. Homepage Terra teaser: fix the odd spacing/layout without dropping content.
4. Homepage AI-video teaser: a poster that reads as a real video, with inline play
   and a distinct case-study CTA; fix the left padding.

Non-goals: no content rewrites, no new case studies, no change to the video (/video)
route, no re-theming, no touching pati-challenge.

---

## D. aru-otoko mobile (build first)

### D1. Horizontal overflow

Symptom: on a phone, scrolling sideways reveals extra width on the right; the culprit
element is unknown to the user.

Root cause (confirmed by reading, to be re-confirmed live): `body` has
`overflow-x: hidden`, but the overflow still leaks (the effective scroller is `html`
/ Lenis, not `body`). In `components/aru/AruWalk.tsx`, `<Halftone>` renders
`position: absolute; inset: -40%` rotated 45deg inside a wrapper
(`<div className="relative px-[var(--pad)] pt-[...]">`) that does NOT clip. The
oversized rotated field extends past the right edge and enlarges the scrollable
width. `AruHero` does not have this bug because its Halftone sits inside an
`overflow-hidden` header.

Fix:
- Add `overflow-hidden` (or `overflow-x-clip`) to the AruWalk Halftone wrapper so the
  field is clipped at source, matching AruHero.
- Add `overflow-x: clip` to `html` in `app/globals.css` as a belt-and-suspenders.
  Use `clip`, not `hidden`: `hidden` on an ancestor turns it into the scroll
  container and breaks the `position: sticky` the walk relies on; `clip` does not.
- Verification: run the dev server, load `/aru-otoko` at 375px in the preview
  browser, and run a DOM scan listing every element whose right edge exceeds
  `document.documentElement.clientWidth`. Fix any remaining contributor. Expected
  clean result: no element wider than the viewport.

### D2. Walk set piece (`MultiScrub` in `AruWalk`)

Two symptoms, both mobile:
- Scroll is too long: the section is `heightVh={320}` (320vh) for a single clip on a
  phone, so it feels like scrolling through empty space.
- Frames do not scrub: as the user scrolls, the walking frames do not advance; only
  the static fallback still is visible.

Fix:
- Length: make `heightVh` responsive, roughly ~180vh under `md` and 320vh at `md+`.
  Pass a resolved number to `MultiScrub` (measured once on mount via matchMedia, with
  a resize listener) rather than a hard 320.
- Scrub: this is a real bug to diagnose, not guess. Use systematic-debugging.
  Reproduce at 375px, then check, in order: (a) do the s00 frames actually load on
  mobile (network + the `activeLayer` flag), (b) does the `window` `scroll` listener
  fire under Lenis on touch (Lenis may not emit native scroll on touch, or
  `smoothTouch` may be off), (c) is `progress()` returning a changing value, (d) is
  the canvas sized > 0. Land the fix at the confirmed cause. Likely candidates: bind
  the scrub to Lenis's scroll callback instead of the raw `window` scroll event, or
  drive it off `requestAnimationFrame` reading `getBoundingClientRect` each frame.
- Do not regress desktop, where the walk currently works.

---

## A. Homepage navigation (options 1 + 3)

The current `Nav` shows only `About · Work · Video · Contact` pills on home and does
not surface the case studies (Terra, AI Video, Bong). Two additions:

### A1. Header Work dropdown

Replace the flat home pills with `About · Work ▾ · Video · Contact`. `Work ▾` opens a
small panel listing the three case studies with their accent-coloured labels:
- Terra growth -> `#terra`
- ある男 AI video -> `#aru`
- Bong Vespera -> `#bong`

Each item smooth-scrolls to the matching homepage section (they are anchors, not
routes; the full case studies are still reachable from each section's own CTA). Panel
opens on hover (pointer) and click/focus (keyboard + touch), closes on outside click
and Escape. Keep the existing pill-indicator motion for About/Contact active states.

### A2. Vertical dot-rail (lg+ only)

A fixed right-edge rail, one dot per homepage section, reusing the `VideoNavRail`
pattern from the /video route. Sections, in order: Hero, About, Terra, AI Video, Bong,
Work, Video, Contact. Hover a dot to reveal its label; click to smooth-scroll; the
active dot is driven by IntersectionObserver (or a scroll-position listener matching
VideoNavRail, which proved more reliable there). Hidden below `lg`; on mobile the Work
dropdown covers discovery.

### A3. Section id hygiene

Ensure the homepage sections carry stable ids the rail and dropdown target:
`hero, about, terra, aru, bong, work, video, contact`. Audit the existing components
and add any missing ids. This is a prerequisite for A1/A2 and is why nav-related work
touches several files.

---

## B. Terra teaser regrid (keep all content)

Keep every element: heading + intro, WebGL logo, browser shot, GSC chart card, the 4
telemetry cells, 3 bullets, tags, and both CTAs.

The "weird spacing" comes from nested max-widths and a lopsided column split:
- The section is `max-w-[1400px]`, but the visual block inside is re-constrained to
  `max-w-[1120px]`, and the logo/shot row uses
  `md:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)]`, which squeezes the logo column and
  makes the block float inset from the section's own edges.

Fix:
- Drop the inner `max-w-[1120px]`; align all blocks to the single `max-w-[1400px]`
  container edge.
- Rebuild the grid rhythm so edges line up and vertical gaps are on one consistent
  scale (one `mt` step between blocks, not the current mix of `mt-14 / mt-12 / mt-10`).
- Re-balance the logo + browser-shot row (even columns, or logo tucked as a smaller
  accent) and let the GSC chart card run full container width with the telemetry row
  reading as its footer. Bullets + tags/CTA as a balanced two-column block.
- No new data, no copy changes.

---

## C. AI-video teaser (poster reads as video)

Rework `components/AruTeaser.tsx` so the feature reads as a real video player:
- Use `public/images/aru-otoko/poster/poster-horizontal.webp` as a large 16:9 feature
  with a centered play button. Click swaps the poster for an inline YouTube embed in
  the same box (reuse the thumbnail-first inline pattern from `components/aru/AruVideo.tsx`
  and `lib/videoPlayback.ts`; pause the backdrop during playback as that component does).
- Keep a distinct `Full case study ->` CTA (to `/aru-otoko`) separate from the play
  affordance, so both jobs are covered: watch here, or read the case study.
- Fix the "too close to the left edge": the title/hook overlay uses `inset-x-5` (20px),
  tighter than the section's `--pad`; align the overlay inset to match the other
  sections so it does not sit against the viewport edge. The section container itself
  already matches (`px-[var(--pad)] max-w-[1400px]`); the perceived tightness is the
  overlay, plus the full-bleed poster.
- Keep the side filmstrip, stats, and tags.

---

## Risks / watch-outs

- `overflow-x: clip` vs `sticky`: verify the walk still pins after the html change.
- Lenis + scrub: if we rebind the walk to Lenis, confirm desktop still scrubs and
  reduced-motion still shows stills only.
- Dot-rail must not overlap the Work dropdown or content on mid-size screens; gate to
  `lg` and test at `lg` boundary.
- Inline YouTube on the homepage teaser must stay thumbnail-first (no player bundle
  until click) to keep the homepage light.

## Verification

Per this repo's gotchas: `npm run build` (static export) + `npm test` must pass; load
the dev server in the preview browser and, for the mobile items, drive it at 375px
(overflow scan, walk scrub check). Final visual sign-off is the user in his own
browser.
