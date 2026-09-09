# Creative Workbench Implementation Plan

**Superseded after user review.** The reduced homepage was rejected. Its height target and one-canvas criterion are no longer requirements. Current acceptance is preservation of the original interactions, visual evidence for every project, clear CTAs, full-background 3D, no frame-sequence downloads, and mobile readability. The verification results below describe the rejected iteration only.

> Implement task-by-task in this session using the existing stack and verify the final result.

**Goal:** Deliver a concise, dimensional portfolio homepage led by Terra and relevant to growth, AI and creative recruiters.

**Architecture:** Server-rendered homepage sections, a small client-side 3D scene and media interaction. Route-aware site chrome preserves inner-page behavior. Homepage-specific styles avoid altering existing case studies.

**Tech Stack:** Next.js 16, React 19, CSS modules, OGL, existing font configuration.

**Spec:** `docs/superpowers/specs/2026-09-08-creative-workbench-design.md`

## Global constraints

- Terra first; describe AI direction rather than deep coding expertise.
- No new dependencies, no image sequences on the homepage, preserve case-study routes.
- Native scrolling and readable reduced-motion/WebGL fallback.
- Local trial only; no publishing.

## Tasks

- [x] Add browser regression checks for sequence requests, page height, overflow, navigation and video behavior; confirm old page fails the new performance criteria.
- [x] Create the original 3D assembly with bounded rendering, pause control and fallback.
- [x] Build the responsive homepage: hero, Terra, AI products, creative, about and contact.
- [x] Integrate route-aware chrome and update positioning metadata without changing inner-page behavior.
- [x] Run production build, existing tests and browser checks; inspect desktop/mobile screenshots and correct material issues.
- [x] Open the completed local preview and document measured results.

## Verification results

Production export built successfully (18 static pages). Existing Vitest suite: 4 files, 23 tests passed. Targeted ESLint and `git diff --check` passed.

Production browser checks at 1440x900, 768x900 and 390x900 passed. Desktop document height fell from 14,844px to 5,102px (about 66% shorter); mobile height is 5,881px. All sizes had zero sequence requests, no horizontal overflow and no initial video iframes. The old page failed the new regression check with 150 initial sequence requests.

Confirmed Terra-first DOM order, one canvas, animation frame callbacks stopping on pause and offscreen, reduced-motion static scene, no-JavaScript content readability, mobile menu closing on navigation, film dialog opening/closing via Escape and returning focus, and homepage -> Terra/Nha Minh -> homepage navigation without runtime errors. Video checks cover the player interaction and embed lifecycle, not remote streaming quality.

Reviewed desktop full-page and desktop/mobile hero screenshots. Measurements are local browser observations, not production CWV/FPS benchmarks. Local production preview: http://127.0.0.1:4322. No deployment or commit was performed.
