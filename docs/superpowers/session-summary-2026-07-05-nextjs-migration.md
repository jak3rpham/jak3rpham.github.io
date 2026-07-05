# Session Summary: Next.js + Framer Motion Homepage Migration

**Date:** 2026-07-04 to 2026-07-05
**Status:** Complete and live at https://jak3rpham.github.io

## What happened

1. **Context:** User received a generic "$10K website" guide recommending Next.js + Framer Motion + a component library. Investigation found the actual site (`jak3rpham.github.io`) already had a working, sophisticated static HTML/CSS/JS site using GSAP + ScrollTrigger for animation (scroll-hijack, sticky-stack storytelling, magnetic hover, spotlight-border hover, scramble-on-hover text, canvas particle backgrounds).
2. **Decision:** Rather than blindly follow the guide, brainstormed with the user and confirmed the real motivation was skill-building/practice, not chasing hype. Scoped a **pilot**: migrate only the homepage to Next.js + TypeScript + Tailwind CSS v4 + Framer Motion, keeping `terra.html`, `video.html`, `bong-vespera.html`, and `pati-challenge/` as untouched static HTML served from `public/`.
3. **Design doc:** `docs/superpowers/specs/2026-07-04-nextjs-framer-motion-pilot-design.md` — covers the re-platform-not-redesign philosophy, fidelity tradeoffs (e.g. the Terra sticky-scroll effect is a from-scratch Framer Motion reimplementation of the GSAP pin+scrub effect, not a pixel-perfect port; the hero's 48-frame image-sequence intro was dropped as confirmed-dead code).
4. **Implementation plan:** `docs/superpowers/plans/2026-07-04-nextjs-framer-motion-pilot.md` — 15 bite-sized tasks covering scaffold → design tokens → shared hooks/components → each homepage section → static export config → GitHub Actions deployment.
5. **Execution:** Ran via `superpowers:subagent-driven-development` in an isolated git worktree/branch (`nextjs-framer-motion-pilot`). Each of the 15 tasks got a fresh implementer subagent + a spec-compliance reviewer + a code-quality reviewer, with fix-and-re-review loops where issues surfaced. Notable catches along the way:
   - A Tailwind `--color-amber` token silently shadowing Tailwind's built-in `amber` palette (documented rather than renamed, since 6+ later tasks already depended on the name).
   - A missing exhaustiveness check in `SectionMotif` that would have silently mis-rendered a future 7th motif variant.
   - Several rounds of missing `aria-hidden` on purely decorative elements (canvas, sparkline SVGs, chart SVG, pipeline diagram) as the pattern was established task-by-task.
   - A `useCountUp` test that looked correct but, under mutation testing, didn't actually catch a broken easing formula or dropped rounding — caught and fixed with an exact-value assertion.
   - A missing `title` attribute on the video lightbox `<iframe>` (accessibility gap).
   - A final holistic review (after all 15 tasks) caught one cross-cutting gap no single task's review would see: 9 decorative "browser chrome" dot spans across 3 files missing `aria-hidden`, since each file was reviewed in isolation before the `aria-hidden` convention was fully established.
6. **Deployment:** Merged `nextjs-framer-motion-pilot` into `main`, pushed, switched GitHub Pages source from "Deploy from a branch" to "GitHub Actions" (user did this manually via the GitHub UI), verified the Actions workflow succeeded and the live site + all untouched legacy pages return 200.
7. **Cleanup:** Worktree and branch removed after merge (had to kill 8 orphaned `node.exe` processes first — leftover `npm run dev` instances from subagents that didn't fully release file handles on Windows, which blocked directory deletion).

## Current state of the repo

- Homepage (`app/page.tsx`) is the new Next.js/Framer Motion build, composed of: Hero, StatStrip, About, TerraTeaser (with `TerraStack` sticky-scroll mechanism), BongTeaser, WorkSection, VideoTeaser (+ VideoLightbox), Contact, Footer — plus Nav and FloatingCV mounted in the root layout.
- Shared infra: `lib/motion.ts` (shared Framer Motion variants, extracted mid-plan to avoid repeated TypeScript fixes), `lib/use*.ts` hooks (`useMediaQuery`, `useCountUp`, `useScramble`, `useSpotlight`, `useMagnetic`, `useLiveWhenVisible` — several with unit tests), `components/SpotlightCard.tsx`, `components/SectionMotif.tsx`, `components/HoverScrollShot.tsx`, `components/GrainOverlay.tsx`, `components/Clock.tsx`.
- **Not yet migrated:** `terra.html`, `video.html`, `bong-vespera.html`, `pati-challenge/` — still static HTML, served as-is from `public/`. If continuing this work, these are the natural next pilots — same design-doc → plan → subagent-driven-development pattern should apply.
- Deployment: `next.config.ts` has `output: "export"`; `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`.

## Why it took a while (for context if picking this back up)

This wasn't "just a page" — it was a full re-platform of an animation-heavy site (canvas particle background, GSAP-reimplemented scroll mechanics, SVG draw-in diagrams, magnetic hover physics, modal lightbox) into a different framework/tooling stack, executed with a deliberately thorough process: ~40+ subagent invocations across 15 tasks (implementer + spec reviewer + quality reviewer per task, plus fix loops), each independently re-verifying rather than trusting prior claims. That's the tradeoff for the catches listed above — a faster, less-reviewed pass would have shipped with some of those bugs.
