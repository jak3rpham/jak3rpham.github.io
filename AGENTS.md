# Working rules for this repo

Portfolio site for Pham Ngoc Thanh / Tatsuki (Next.js static export, Tailwind + CSS modules,
Lenis smooth scroll, OGL/WebGL backdrops). It is a **branding piece, not a lead-gen site**.

## Step zero: invoke the design skill

Any request that touches how something LOOKS or MOVES — layout, type, colour, spacing, hero,
motion, a redesign, "make it nicer", a reference URL — starts with a `Skill` call, before any
proposal and before any code. Announce which one.

| Situation | Skill |
|---|---|
| Changing an existing page here | `redesign-existing-projects` (audit-first) |
| A brand-new page or section | `design-taste-frontend` |
| "Make it feel expensive / premium" | `design-taste-frontend` — it absorbed `high-end-visual-design` on 2026-09-09 |
| Motion craft, easing, transitions | `emil-design-eng` |
| Reviewing motion code | `review-animations` (user-invoked) |
| Naming an effect before building it | `animation-vocabulary` |
| Design references as images, then code | `imagegen-frontend-web` (absorbed `image-to-code`) |
| A new creative direction, nothing decided yet | `superpowers:brainstorming` |

Two could apply → ask, do not guess (per the user's global AGENTS.md).

**Why this rule exists:** on 2026-09-09 a Codex rebuild of the homepage beat Codex's. The gap
was not coding — Codex's machinery was more sophisticated (300-frame sequences, pinned
choreography). Codex read these same installed skills; Codex invoked none of them.

## The method

1. **Audit before designing.** Name each existing element's *sensation* before touching it.
2. **Lock an inventory contract** — every element/effect marked `KEEP / RE-MECHANISM / CUT`,
   approved by the user. Never delete a `KEEP`. Separating WHAT from HOW is the whole trick:
   with the inventory frozen, the only lever left is compressing the mechanism, and that
   constraint produces taste. See `docs/superpowers/specs/2026-09-08-homepage-restoration.md`
   for the two-list form (`Restored:` / `Changed:`) that worked.
3. **Keep the sensation, swap the mechanism for the cheapest one that gives it.** Worked example:
   `clip-path` + sticky pin + 100vh spacer → `transform: scale()` + `border-radius` travelling
   with the document. Same feeling, no pin, no dead scroll, GPU-cheap.
4. **A reference URL is measured, not paraphrased.** Open it in the browser tool and produce a
   table — hero height, actual type-scale px, container max-width, section rhythm, hero object,
   libraries, motion timings — for approval BEFORE writing CSS. "Cinematic and spacious" is not
   a reference.
5. **One type scale per page, in one file.** No per-component `text-[clamp(...)]` invented on the
   spot. See `components/home/PortfolioHome.module.css`.

## Before saying it is done

Look at the page. Run a Playwright screenshot pass (`scripts/check-homepage.mjs` is the pattern:
1440 + 390, several scroll positions, asserts for overflow / hover / tabs / theme) and read the
images. The in-app preview tab throttles rAF, so canvas motion needs DOM/JS probes instead — that
is a reason to check differently, never a reason to skip checking.

## Bans

- No prose comments defending a visual decision. Needing an essay means reopen the decision.
  (The old `app/page.tsx` had ~45 lines of it; `HeroStage.tsx` ~60. That is the smell.)
- No sales-pitch copy, CV download, or third-party signup widgets — this is branding.
- No senior-job-title claims in the copy; describe capability instead.
- Do not "fix" the scroll rails to use IntersectionObserver — they use a scroll listener plus
  `getBoundingClientRect` on purpose, because IO does not fire reliably under Lenis.

Longer-lived context lives in
`C:\Users\jaker\.Codex\projects\D--code-jak3rpham-github-io\memory\MEMORY.md`.
