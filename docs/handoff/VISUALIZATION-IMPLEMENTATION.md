# Visualization pass · 2026-09-09

Continued the existing working tree. No commit or deployment.

## Inventory contract carried from the handoff

KEEP: approved page composition, native home hero, all eight real care clips, both full demo embeds, four terra system diagrams, IELTS BOOT/GRADE diagrams, five care boundaries, Bóng pipeline and coverflow, Aru walk and companion layers, compact terra reels and complete video archive.

RE-MECHANISM: care gallery loading and timer, home preview rotation, Aru render lifecycle, care pipeline illustration, terra process illustrations, Bóng and IELTS palette tokens.

CUT: no content or source proof removed. The five-node numbered CareFlow rendering is replaced by the illustrated CareMechanism; the original component remains available.

## Visual map

| Location | Sensation / purpose | Asset | Interaction and trigger | Static fallback |
| --- | --- | --- | --- | --- |
| Home hero | Physical assembly, curiosity | Existing native 3D | Existing scroll shrink | Existing reduced-motion scene |
| Home terra | A repeatable production system | Existing screenshots, workflow, four diagrams | Page hover, diagram reveal | Full screenshots and schematics |
| Home care | Two generations connected | Existing three screenshots; experience first | Visible-only six-second rotation with progress; user selection stops rotation | Manual tabs and welcome screenshot |
| Care feature gallery | Calm, uninterrupted product demonstration | Eight original 1080p clips | Two video buffers; reveal only after loadeddata; eight-second rotation; separate gallery and video pause controls | First decoded frame, manual playback, loading/error state |
| Care pipeline | Follow one record through the system | New SVG prescription, review sheet, clock, parent and caregiver views | Five selectable stages and next-stage action; in-view signal animation | All objects and paths remain visible |
| terra process | See the work changing form | Four new SVGs: layout assembly, bilingual publishing, reporting sources, feedback loop | Hover changes object position; signals run in visible section | Same complete diagrams without movement |
| IELTS grading | Deliberate, editorial learning space | Existing rubric and BOOT/GRADE | Manual task switching; ink/indigo + paper decision | Existing text and diagrams |
| Aru walk | Character anchored in a moving city | Existing shader and image layers | Section gates RAF; viewport-height canvas; existing scroll scrub | Static shader for reduced motion, CSS gradient if WebGL unavailable |
| Bóng | Petrol film world consistent with artwork | Original poster, keyframes and motion clips | Existing coverflow and motion comparison | Poster and keyframes |
| Creative / archive | Range of directed work | Original films, stills and reels | Existing hover, scrubs, players and draggable strip | Posters and original imagery |

## Reference measurements

Sharplink observed in browser at 1280 × 720. Hero is 720px, H1 88px/84.48px, H2 68px/72.08px, H3 32px/37.12px. Measured sections: productivity 893px, propositions 1546px, banner 600px, opportunity 1798px including 120px bottom padding, news 760px, FAQ 694px. Hero video 1282 × 720; other visible media surfaces include 345 × 186 and 494 × 612 canvases, a 420 × 560 video and 1280 × 439 canvas. Nuxt entry observed. Exact animation timing and internal library attribution were not established. No guessed values used to rewrite the approved portfolio layout.

## Root-cause observations

- Home hover reproduction: selected tab stayed “For parents” after 6.7 seconds over the article heading.
- Eight feature selections: desktop preview stayed 516.91px high, while newly mounted video readiness dropped to 0–1. The measured desktop issue was decode readiness, not proven layout shift.
- Aru: 35 WebGL draws in 1.2 seconds while the walk section was offscreen, before the lifecycle fix.

Run `node scripts/check-visualization.cjs` for interaction, rendering lifecycle and screenshots. Output goes to the current 2026-09-09 visualization directory by default; override with QA_OUTPUT.

## Verification completed

- Final production build: all 18 static routes generated, TypeScript passed.
- Unit suite: 4 files / 23 tests passed.
- Targeted ESLint: no errors; one existing-style Next image warning for the static welcome image.
- Browser regression: home hover autoplay, manual stop/resume, all eight decoded care clips, invariant desktop frame height (523.25px) and scrollY (2145px) during selection.
- Visibility-event simulation pauses the gallery timer and videos; keyboard Home selects and focuses the first tab.
- Instrumented WebGL: zero offscreen draws, positive draw count in the walk section, zero after leaving again.
- Seven routes at 1440px and 390px: no horizontal page overflow or runtime errors; screenshots inspected; reduced-motion checks passed.
- Final mobile pass: all eight touch selections retain the same preview height; motion pause also stops rotation; selecting Share brings its objects into the horizontally scrollable illustration viewport.
- Five Project TVC YouTube thumbnails loaded successfully with network access. The blank thumbnails in the restricted-network screenshot pass were environmental.

The preview now uses `node scripts/serve-preview.cjs` at http://127.0.0.1:4322. This server resolves static `.html` routes and supports video byte ranges. Rebuild before inspecting source edits.

New assets are authored SVG illustrations, not generated app screenshots. Existing 3D and films are preserved; no new AI video was generated. The worktree remains uncommitted. Whole-worktree `git diff --check` still reports pre-existing extra blank lines at EOF in several restored source components.
