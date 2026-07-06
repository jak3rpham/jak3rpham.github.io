# Video page — themed per-format sections redesign

Date: 2026-07-06
Status: approved direction (color A + 7-archetype system); building 3 flagship sections first.

## Goal

Replace the uniform 2×2 catalogue grid on `/video` with **7 distinct "worlds"** — each video format gets its own color accent, layout archetype, and motion signature. Keep the dark-cinema base (portfolio ADN); each section shifts accent + texture + lighting only (color direction **A**, user-approved). Maximalist: WebGL/GSAP/scroll/3D throughout. Pagination/load-more for high-count sections. A right-side vertical nav rail tracks the active section and recolors to its accent.

## Build order (user-approved)

Phase 1 (this spec): **3 flagship sections** with maximally-different motion, to lock the feel in the user's real browser:
1. Short Reels — vertical film-strip
2. TVC & Competition — cinematic award stage
3. Communication Campaigns — fanned 3D card deck

Then roll the validated patterns out to the remaining 4 (Project TVCs, Commercial/Explainer, Music Videos, Events).

## Section accents (direction A, near-black base #0c0d0b)

| # | Format | Accent | Archetype |
|---|--------|--------|-----------|
| 01 | TVC & Competition | green `#8FD49E` | Cinematic award stage |
| 02 | Project TVCs | slate-teal `#86b8b0` | Numbered editorial index |
| 03 | Commercial & Explainer | cyan `#7cc7d6` | Device-framed demo |
| 04 | Communication Campaigns | amber `#e0b978` | Fanned card deck |
| 05 | Music Videos | magenta `#e0a3c8` | Immersive cover wall |
| 06 | Events | indigo `#9aa6e0` | Horizontal timeline |
| 07 | Short Reels | violet `#b79ae0` | Vertical film-strip |

## Architecture

- `lib/videoData.ts` — typed data. `type Film = { yt: string; title: string; meta: string; badge?: string; format: FormatKey }`. Exports arrays per format + `SECTIONS` meta (key, label, accent, tag). Single source of truth (mirrors `docs/videos.csv`).
- `components/video/VideoNavRail.tsx` — fixed right-edge vertical dot rail. IntersectionObserver on each `<section id>`; active dot expands + recolors to section accent; click scrolls to section. Hidden on mobile / reduced-motion collapses to static.
- `components/video/sections/ReelsStrip.tsx`
- `components/video/sections/TvcStage.tsx`
- `components/video/sections/CampaignFan.tsx`
- `components/VideoLightbox.tsx` — extend with optional `vertical?: boolean` → 9:16 narrow frame (max-w ~420px) for reels; default stays 16:9.
- `app/video/page.tsx` — compose: `VideoHero` → marquee → `TvcStage` → `CampaignFan` → `ReelsStrip` → (old `VideoReel` kept below a "more formats — redesigning next" divider so nothing goes dark) → `VideoContact` → Footer. Mount `VideoNavRail`.

Each section is self-contained (own state, own scroll refs), communicates only via the shared `openLightbox` callback lifted to the page (or each holds its own lightbox — simpler, chosen: each section owns its lightbox state).

## Section specs

### 07 · Short Reels — vertical film-strip (violet)
- Horizontal-scroll track of **9:16 cards, staggered heights** (alternating ~ +0/-24px offset). Drag-x (framer) + wheel-to-horizontal.
- **Film perforation**: top+bottom strips of repeating holes (repeating-linear-gradient) framing the track like celluloid; track background darker.
- Card: YouTube thumb (`hqdefault`, object-cover in 9:16), violet ring on hover, center ▶, small format tag. Click → vertical lightbox.
- 6 reels. If >N later, "load more" reveals rest. Header: big "Reels" + violet, mono "drag →".

### 01 · TVC & Competition — cinematic award stage (green)
- Full-bleed **stage**: giant vertical rotated wordmark "COMPETITION" on left edge (low-opacity). Two hero **award cards** side-by-side: MR. BROWN (Top 1 · 2023), ARISAQUA (Top 1 · 2024) — each large thumb, laurel SVG framing the badge, `useCountUp` "1" / "TOP 1" telemetry, green glow.
- Below: 2 smaller cards (Young Lions 2022, 2023) as "also competed" row.
- Motion: scroll parallax on the wordmark + cards rise/settle; laurel strokes self-draw (SVG pathLength) on in-view; badge glow pulse.
- Click any → 16:9 lightbox.

### 04 · Communication Campaigns — fanned card deck (amber)
- Cards (Hoa Niên Teaser, Hoa Niên Recap, 1011MHz Insight, CTV Podcast, Social Post) **fanned in 3D** like a hand of cards (rotate + translate around a pivot, perspective). Center card raised.
- Scroll-in: cards spread from a stacked deck to the fan (staggered). Hover a card: lifts + straightens + amber glow; siblings dim. Click: brings to front, opens lightbox.
- Header: amber, tag "SRadio · L.O.M".

## Motion / gotchas to respect (from project memory)
- Headless can't verify this page family → verify via `npm run build` + ask user to look in real browser.
- Use `useMediaQuery("(prefers-reduced-motion: reduce)")`, never framer `useReducedMotion()` in render branches.
- `useScrollTilt`/`useScroll({target})` refs must attach to a real mounted DOM node (split playable vs static).
- No `clip-path` interpolation with mixed units.

## Out of scope (phase 1)
- The other 4 sections (built next, reusing these patterns).
- Real autoplay-on-hover video (thumbnails only for now; lightbox plays).
- CMS/CSV auto-import (data hand-mapped in `lib/videoData.ts`).
