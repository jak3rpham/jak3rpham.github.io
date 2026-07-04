# Design: Next.js + Framer Motion Pilot Migration (Homepage)

## Context

The site (`jak3rpham.github.io`) is currently a static HTML/CSS/JS portfolio deployed
directly from the `main` branch root to GitHub Pages. It already has substantial
custom motion built with GSAP + ScrollTrigger (scroll-hijack, pinned stacks, drag
coverflow galleries, magnetic hover, spotlight-border hover, scramble-on-hover text,
parallax).

Goal: migrate the homepage (`index.html`) to Next.js + TypeScript + Tailwind CSS +
Framer Motion, as a deliberate skill-building exercise (leveling up "vibe coding"
practice with a modern React stack), while keeping the other existing static pages
untouched and still reachable at their current URLs. Still deployed to GitHub Pages
under the same user-page domain, no custom domain involved.

This is a **pilot**: only the homepage is migrated in this round. `terra.html`,
`video.html`, `bong-vespera.html`, and `pati-challenge/index.html` continue to be
served as-is as static HTML during and after this migration, to be ported in future
rounds once the Next.js + Framer Motion pipeline is proven out.

## Decisions Locked In (from brainstorming)

- Framework: Next.js, App Router, TypeScript.
- Styling: Tailwind CSS (full rewrite from the current hand-written CSS, not a port).
- Animation: Framer Motion fully replaces GSAP/ScrollTrigger for the migrated page.
  Non-Framer-Motion interactive logic (canvas particle hero, scramble-on-hover text,
  live clock) stays as plain React/JS, since those aren't DOM-animation concerns.
- Deployment target: same repo, same `jak3rpham.github.io` user-page domain, via
  static export (`output: 'export'`) built and published by GitHub Actions.
- Scope: homepage only. Other pages untouched, served from `public/` unchanged.

## Repo Structure After Migration

```
/
├── app/
│   ├── layout.tsx            (root layout: fonts, metadata, GrainOverlay)
│   ├── page.tsx              (assembles homepage section components)
│   └── globals.css           (Tailwind directives + minimal global resets)
├── components/
│   ├── Nav.tsx                (magnetic pill nav + scroll-spy indicator)
│   ├── Hero.tsx                (canvas particle flow, scramble-on-hover name, parallax)
│   ├── Clock.tsx               (HCMC live clock widget)
│   ├── StatStrip.tsx
│   ├── About.tsx
│   ├── TerraTeaser.tsx         (stack-scroll scale/blur)
│   ├── BongTeaser.tsx
│   ├── WorkSection.tsx         (featured + compact cards, spotlight-border hover)
│   ├── VideoTeaser.tsx
│   ├── Contact.tsx
│   ├── VideoLightbox.tsx       (AnimatePresence modal)
│   └── GrainOverlay.tsx
├── public/
│   ├── CV.pdf
│   ├── favicon.ico, favicon-16.png, favicon-32.png, favicon.svg
│   ├── apple-touch-icon.png, icon-192.png, icon-512.png
│   ├── images/                (unchanged)
│   ├── terra.html              (unchanged, untouched)
│   ├── video.html              (unchanged, untouched)
│   ├── bong-vespera.html       (unchanged, untouched)
│   └── pati-challenge/index.html (unchanged, untouched)
├── next.config.ts             (output: 'export', images.unoptimized: true)
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .github/workflows/deploy.yml
```

`index.html` at the root is removed (its content lives on as `app/page.tsx` +
components). All other existing top-level static pages move under `public/` verbatim
so their URLs (`/terra.html`, `/video.html`, `/bong-vespera.html`,
`/pati-challenge/`) resolve identically after static export, since Next copies
`public/` contents as-is into `out/`.

## Animation Mapping (GSAP → Framer Motion)

| Current effect (GSAP) | Framer Motion approach |
| --- | --- |
| Stagger reveal (about, stat strip) | `whileInView` + `staggerChildren` variants |
| Terra stack pin+scrub scale/blur | `useScroll({ target })` + `useTransform`, `position: sticky` for the pin illusion |
| "Systems I built" horizontal scroll-hijack | Sticky container; `useScroll`/`useTransform` maps vertical scroll progress to horizontal `x`. Most technically demanding port — no built-in pin equivalent in Framer Motion. |
| Drag/coverflow gallery | `drag="x"` + `dragConstraints`, or `useMotionValue` with manual per-card offset math |
| Magnetic CTA / spotlight-border hover | `useMotionValue` + `onMouseMove` cursor tracking |
| Scramble-on-hover name, canvas particle flow, live clock | Plain React state/`useEffect`, not a Framer Motion concern |
| Video lightbox open/close | `AnimatePresence` |

Cross-cutting: respect `prefers-reduced-motion` via Framer Motion's
`useReducedMotion()`, and disable scroll-hijack-style effects below the same mobile
breakpoints the current GSAP code uses (768px / 820px), matching existing behavior.

## Deployment

- `next.config.ts` sets `output: 'export'` and `images: { unoptimized: true }`.
- `.github/workflows/deploy.yml`: on push to `main`, `npm ci`, `npm run build`,
  upload the `out/` artifact via `actions/upload-pages-artifact`, deploy via
  `actions/deploy-pages`.
- One-time manual step: repo Settings → Pages → Source must be switched from
  "Deploy from a branch" to "GitHub Actions". (Can be done via `gh api` if the user
  wants it automated, otherwise a manual toggle in the GitHub UI.)
- No `basePath`/`assetPrefix` needed — this is a user page served at the domain
  root, not a project page under a subpath.

## Testing / Verification

1. `next dev` locally; visually compare each section against the current
   `index.html` via the browser preview tool (layout, spacing, content parity).
2. `next build` locally; confirm `out/` is generated without errors, and that the
   untouched static pages (`terra.html`, etc.) are present and load correctly from
   `out/`.
3. Confirm reduced-motion and mobile breakpoint behavior manually (resize
   viewport, toggle reduced-motion emulation).
4. After merge: confirm the GitHub Actions workflow succeeds and the live site at
   `jak3rpham.github.io` serves the new homepage while `/terra.html`, `/video.html`,
   `/bong-vespera.html`, `/pati-challenge/` remain reachable unchanged.

## Out of Scope

- Migrating `terra.html`, `video.html`, `bong-vespera.html`, or `pati-challenge/`
  to Next.js — future pilots.
- Any visual/content redesign beyond what's needed to reimplement the existing
  homepage design in Tailwind + Framer Motion (this is a re-platform, not a
  redesign).
- Custom domain / CNAME changes.
