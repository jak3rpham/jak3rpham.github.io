# Showreel v2 — "Execute workflow" (30 s, realistic)

Design brief for a second, longer showreel. Written 2026-09-28 at the end of the chat that built v1;
**the video itself is to be made in a new chat.** Everything that chat needs is in this file.

---

## 0. Read this first (for the chat that builds it)

1. **Ask before you build.** Three things are still the owner's call, not yours (§9). Ask them in
   one message, then wait. The owner's global rules require a confirmation before heavy work.
2. **v1 is finished and must not change.** It lives in `showreel/` (`reel.html`, `reel.css`,
   `reel.js`, `music.mjs`, `render.mjs`, `finish.mjs`), with outputs in `showreel/out/`
   (`tatsuki-reel-2026*.mp4`, `-poster.jpg`). Build v2 in **new files** (`reel2.*`, `music2.mjs`) and
   write to new output names (`tatsuki-reel-2026-30s*`). Reuse `render.mjs`, `sheet.mjs`, `audit.mjs`
   and `prep.mjs` by parameterising them, not by editing v1's behaviour.
3. **Invoke the skills** before designing motion: `ai-film-production` (direction and shot list),
   `emil-design-eng` (easing and choreography), `animation-vocabulary` if an effect needs naming.
   This repo's `CLAUDE.md` makes a skill call step zero for anything that looks or moves.
4. Read `showreel/README.md` for the v1 pipeline. §8 below lists every trap v1 hit.

---

## 1. What the owner asked for

- 30 seconds, horizontal, 1920×1080, 60 fps, for the portfolio (a branding piece, not lead-gen).
- Use what v1 left out, **especially the videos and all the motion material** (§4).
- "Impress me even more": a stronger concept and real cinematography, not a longer carousel.
- **Style somewhat realistic**: physical light, depth and lenses, not flat motion graphics (§3).
- **His face may be used** (the portrait, §4.9).
- Each section keeps its own colour world, as in v1. Not brown all the way through.
- Upbeat.

Copy rules (from the owner's memory and repo `CLAUDE.md`): no senior job titles; describe what he
did ("Full scope · camera & edit"). No sales pitch. No labels that only name the medium. Claims must
already be on the site: "Two-time Top 1 TVC at Business Challenge", "12× organic growth", "31.4M
search impressions", "978 keywords in the top 10", "site health 55 → 90".

---

## 2. Concept

**The reel is one run of a workflow.** His positioning ("I direct AI, connect disciplines, and make
things happen") is literally a node graph, and the portfolio contains real ones: the Weavy canvases
behind both AI films and the PATI n8n pipelines. The reel opens on a prompt and an **Execute
workflow** button. A signal travels a glowing wire across a dark space. Each project is a node; when
the signal arrives, the camera dives into the node and the frame floods with that project's world.

Every project is shown as **input → output**: reference → frame, sketch → screen, still → motion,
illustration → product. That is the site's thesis, "Ideas into actual things."

The ending is a pull-back: the camera cranes out until the whole graph is visible at once, every
node lit, his body of work as one constellation. The graph then collapses into his portrait.

---

## 3. Look: "somewhat realistic"

v1 was flat 2D DOM motion graphics. v2 should read as a **physical space filmed by a real camera.**

**Recommended approach: a Three.js scene**, rendered deterministically and captured with the
existing Playwright → ffmpeg pipeline.
- **World.** A dark studio with a faintly reflective floor (MeshStandardMaterial, low roughness).
  Screens and panels stand in 3D like monoliths or float at depth. `RoomEnvironment` (or a small
  HDR) supplies reflections, with ACES filmic tone mapping.
- **Screens.** Every image and video is a textured plane, or a device: a laptop, a phone, a
  browser window as a thin slab with bevelled edges, glass, and emissive screen content. Video
  sources become frame sequences (as `prep.mjs` does) mapped as textures per frame.
- **The wire.** A tube or line along a CatmullRom curve with an emissive gradient. The signal is a
  bright head with bloom and a trail; nodes glow when reached.
- **Camera.** A physical camera move per shot (dolly, truck, crane, orbit, whip-pan), with a
  focal-length change for the pull-back. Speed ramps come from custom easing (§6).
- **Post** (EffectComposer). Bloom (UnrealBloomPass), depth of field (BokehPass) for rack
  focus, film grain, vignette, a light chromatic aberration, and anamorphic letterbox only for the
  film chapters.
- **Motion blur.** Keep v1's method: 4 sub-frames across a 180° shutter, averaged in ffmpeg.
- **Determinism.** No clock and no runtime randomness. Seeded PRNG, `seek(t)` sets every uniform,
  camera and material from `t` alone. Use `preserveDrawingBuffer: true`; capture after
  `renderer.render`.

Type stays in the site's system: Bricolage Grotesque (display), DM Mono (labels), plus Noto
Serif JP and Be Vietnam Pro where needed. It can live in world space (on the floor, on panels) or
as a restrained screen-space HUD, as in v1.

**Fallback if Three.js post-processing proves too slow or brittle:** v1's DOM engine with a
"realistic layer": real drop shadows under panels, 3D-transformed device frames with glass
highlights, blurred foreground and background copies for fake depth of field, light leaks and
bloom as blended gradients. Decide after a one-shot spike (one node plus the wire, ~2 s). Keep the
decision explicit.

---

## 4. Asset inventory (all paths under `public/`)

### 4.1 Filmed work: the "Video & brand" archive, **not in the repo**
Listed in `lib/videoData.ts` as YouTube IDs; the site only embeds them. Highlights:
- **Business Challenge 2023 · MR. BROWN**, Top 1 TVC (`0HXLuL7nbKc`), full scope · edit & voice-over
- **Business Challenge 2024 · ARISAQUA**, Top 1 TVC (`Nr8vCC5JWCQ`), full scope · edit & voice-over
- Young Lions TVC 2022 / 2023 (`JTaEF48J9gY`, `jzCHLv6p8v0`), camera & edit
- Let's On Air · Sống Thay Xô Bồ (`1cJGz4wwduA`), camera & edit
- ISBe Yourself theme song (`jg-vycQAOIE`), Hoa Niên Liên Khấu recap (`OEbzDYj6SGk`),
  Miền Đất Hứa visualizer (`X0R0k4jnAkw`), Chìm Show and Until I Found You remakes, terra explainers
  and reels, SRadio reels (vertical)

**Getting the footage is question 1 in §9.** Preferred: the owner drops local masters into
`showreel/footage/`. Alternative: download his own uploads with yt-dlp, but only after he
explicitly approves the download in chat. Never fall back silently to YouTube thumbnails
(`i.ytimg.com`); that is a download too, and they are low resolution.

### 4.2 Motion already in the repo
| Source | Spec | Content |
|---|---|---|
| `videos/nha-minh/01…08_*_RealUI_1080p.mp4` | 1920×1080 30 fps, 2–4 s each | real UI: dual-screen sync, schedule, Châu Bi AI voice, in-app call, vital line chart, profile switcher, Google ecosystem, Gemini Vision OCR |
| `videos/nha-minh/demo.mp4` | 1280×720 24 fps, 88.6 s | full product demo; pull short beats from it |
| `images/vng-demo/motion/motion-kf3-to-kf5-seedance.mp4` | 720×960 30 fps, 5.1 s | Bóng Vespera motion (**"Ai" watermark at top-left: crop `[60,52,660,880]`**) |
| `images/vng-demo/motion/motion-multiframes-experimental.mp4` | 720×960 30 fps, 12.1 s | Bóng Vespera multi-frame motion (check for the same watermark) |
| `vitalite/demo/theme/video/hero-1280.mp4` | 1280×676 24 fps, 8 s | 0–1.7 s sky jump (clean); **~1.7 s on strobes and inverts: failed the flash test in v1, do not use** |
| `vitalite/demo/wp-content/uploads/seq/0823/001…` | 100 frames, 2560×1440 | Vitalité campaign scroll sequence |
| `images/home/builder-motion.mp4`, `systems-motion.mp4` | 1920×1080 24 fps, 6 s | homepage hero motion (silhouette at desk; glowing systems) |
| `images/home/frames/hero/`, `…/systems/` | 150 frames each, 1920×1080 | the same as scroll-scrub sequences |
| `images/aru-otoko/frames/s00` | 151 frames, 960×542 | Aru Otoko walk (the only sharp one) |
| `images/aru-otoko/frames/s01, s03, s09` | 50 frames each, **560×316** | too soft to go full frame; use small, or use the matching stills |

### 4.3 Stills by project
- **terra**: `images/terra-outsourcing-preview.webp` (1406×8000 full page), `terra-compliance-preview`,
  `terra-customers-preview`, `terra-hrsystem-preview`, `terra1`, `terra2`, six social posts in
  `images/terra-social/`, and the chart path in `components/home/PortfolioHome.tsx` (`const chart`).
  Stats as in §1.
- **Workflow illustrations** (`images/visuals/`, photoreal 3D, perfect for this style):
  `publishing-machine` (green rollers turning paper into books: terra's content system),
  `draft-to-clarity` (crumpled paper → clean ribbon through a lens), `shared-care` (two homes
  joined by a bridge: Nhà Mình).
- **PATI "Workflow Architect Challenge"** (`pati-challenge/index.html`, headline "Three problems.
  Three workflow…"): `images/pati-challenge/case02-research-pipeline.webp`,
  `case03-weekly-report.webp`, real n8n canvases with an **Execute workflow** button. This is where
  the concept comes from.
- **Nhà Mình**: 12 screens in `images/nha-minh/` (01…12), `landing-hero.webp`; palette peach
  `#ffe3c9→#ebae90`, terracotta `#b7472c`, coral `#ff5f3d`.
- **Vitalité**: `images/vitalite/` (hero, home-grid, shop-grid, pdp-grey, pdp-white, shop-mobile,
  about-sequence), `vitalite/demo/theme/assets/gallery/01…05-model.webp` (lookbook),
  `06…08-product`, `mockups/1…18.webp` (tee graphics), `products/*-front/back.webp` (16 garments),
  `vitalite-wordmark*.png`, `vitalite-mark*.png`. The storefront screenshots carry an orange
  **"DEMO" strip at the bottom (~3.5%): crop it.** Palette black, bone `#f3f2ee`, graffiti pink `#e2405f`.
- **IELTS Studio / UpHub / Badminton Club**: `images/ielts-preview.webp`, `uphub.webp`,
  `badminton-preview.webp`.
- **Aru Otoko** (或る男): 12 stills in `images/aru-otoko/stills/`,
  `references/ref-01…03` (the **inputs**: pair them with the matching stills for reference →
  frame), `workflow/weavy-canvas-full.webp` (the node graph), `poster/poster-horizontal`,
  `poster-vertical`. Night and gold palette.
- **Bóng Vespera**: `images/vng-demo/stills/kf1-the-gate-at-dawn` → `kf2-the-wanderer-enters` →
  `kf3-path-of-guardians` → `kf4-the-kneeling-moment` → `kf5-after-the-recognition` (a
  five-keyframe story, 2:3 portrait), `workflow/weave-canvas-full.webp`, `final/ad-mockup-final.webp`
  (poster). Jade mist, cream serif, red leaves.

### 4.4 The owner (face approved)
`images/hero-portrait.webp` (1100×1375, studio, brown polo, arms crossed: **use for the sign-off**),
`photo1.webp` (studio profile, black club polo), `photo2.webp` (candid at an event, same
polo), `photo3.webp` (graduation: personal, leave out unless he asks). Facts from the site: Ho Chi Minh City · UEH · ISB, International Business 2025 ·
Vietnamese / English · "Hi, I'm Thanh. Call me Tatsuki." · `jak3rpham.github.io`.

---

## 5. Shot list (30 s = 60 beats at 120 BPM; 1 beat = 0.5 s; cuts on the grid)

| Time | Node | Input → output | Camera / cinematography | Palette |
|---|---|---|---|---|
| 0–2 | **Prompt** | blinking cursor; "ideas into actual things" typed; the red **Execute workflow** button pressed on 1.75 | locked-off, macro on the button, then a hard push-in on the click; the drop at 2.0 | ink `#0b0d0b`, lime `#c0e686`, n8n red |
| 2–5.5 | **terra** | publishing-machine rollers → the four landing pages fanned as a physical deck → six social posts dealt into a grid → the chart draws and **becomes the wire** | dolly along the wire, parallax depth, rack focus from deck to stats | sage `#eef0e6`, forest `#1e6e42`, lime `#c9f49b` |
| 5.5–7 | **PATI** | the research and weekly-report pipelines execute node by node, green checks racing | fast truck with speed ramps; macro on a node | n8n dark, red accent |
| 7–10 | **Nhà Mình** | shared-care (two homes and a bridge) **match-cuts** to the two-screen app; Châu Bi voice and vital-chart clips on a phone and a laptop as physical devices | orbit round the devices, shallow depth of field | peach, terracotta, coral |
| 10–13 | **Vitalité** | the 0823 sequence scrubs; lookbook models on hard cuts; tee mockups as stop-motion; storefront | whip-pans, frame-within-frame, flash-free cuts | black, bone, pink |
| 13–14.5 | **IELTS · UpHub · Badminton** | one beat each, three screens slamming into a triptych | three monitors, a lateral truck | cream / orange `#ec6a22` / court green `#1d6b4c` |
| 14.5–19 | **Video & brand** | the filmed work (§4.1): Top 1 TVCs on the downbeats, then TVCs, MVs and recaps on 8th-note cuts inside a wall of screens; one line of type, "Two-time Top 1 TVC · Business Challenge" | the camera moves through a wall of screens, hero clips take the full frame; the highest-energy section | tungsten amber and white (or taken from the footage) |
| 19–22.5 | **Aru Otoko** | the Weavy canvas zooms into one node; `ref-0x` wipes into its still; then the film on beat cuts; 或る男 vertical | anamorphic letterbox, halation, speed ramp; the music breaks down | night `#050505`, gold `#e9a54b` |
| 22.5–25.5 | **Bóng Vespera** | kf1 → kf5 as dolly-in **match cuts through the gate arch**, then the motion clip, then the poster | slow push through fog layers, red leaves in the foreground | jade `#0e2a27`, mist `#a9d6c8`, cream serif |
| 25.5–27 | **Output** | crane-out to the whole graph, every node lit, one constellation (second drop) | the god shot: long lens to wide, bloom peaks | all palettes on the wire |
| 27–30 | **Sign-off** | the graph collapses into the portrait; "Hi, I'm Thanh. Call me Tatsuki." · "Growth · Products · Creative" · `jak3rpham.github.io ↗`; fade to black by 29.95 for a seamless loop | slow push on the portrait, soft key light, hold at least 2 s of readable text | ink, lime |

Pacing: each project's hero moment gets at least one uninterrupted beat to read. The
"Video & brand" section should show the most real footage; that is his filmed work, and v1 had none.

---

## 6. Motion rules (from `emil-design-eng`, adapted to film)

- Custom curves only: strong out `cubic-bezier(0.23,1,0.32,1)`, in-out `cubic-bezier(0.77,0,0.175,1)`.
  Entrances ease out, on-screen moves ease in-out, loops are linear.
- Nothing appears from `scale(0)`: start near 0.9 with opacity. v1's dot and stamp popped from 0; don't repeat that.
- Exits are faster than entrances. Staggers 30–80 ms.
- Use blur (under 20 px) to bridge any crossfade that shows two overlapping states.
- Every transition is motivated: a match cut, a wire hand-off or a camera move. No generic dissolves.

---

## 7. Sound

A 30 s arrangement at 120 BPM with every hit on the cut grid: keyboard clicks on the prompt; the
button click, then the first drop at 2.0; a groove through 14.5; the Video & brand section at peak
energy; a cinematic breakdown for Aru (19–22.5) with a braam; an airy build through Bóng with a
riser; the **second drop at 25.5** on the crane-out; resolve to C major for the sign-off; tail out
by 30.0.

v1 synthesised its score in `showreel/music.mjs`. It checks out technically, but **no one has
listened to it yet** (question 2 in §9). Master to about -14 LUFS, -1.5 dBTP, with a linear loudnorm
gain (see §8).

---

## 8. Lessons from v1 (don't pay for these twice)

Environment (Windows, this machine):
- The Bash tool's safety classifier failed intermittently; **PowerShell was reliable**.
- `Remove-Item` with a wildcard is blocked by a path guard: overwrite files instead of deleting them.
- **PowerShell `.Replace()` mangled a JS template literal** (the backtick) and broke `reel.js`.
  Use the Edit tool for any line containing backticks, and run `node --check` after every scripted edit.
- ffmpeg here has **no fontconfig**, so `drawtext` crashes. Label contact sheets another way.
- `ffmpeg -ss <t> -i` returned the wrong frame on H.264. For audits, select by frame number:
  `-vf "select=eq(n\,N)" -fps_mode passthrough` (not `-vsync`).
- Chrome via `playwright-core` with `channel: "chrome"` works headless. PNG capture through CDP
  runs about 4.3 fps, so 30 s × 60 fps × 4 sub-frames ≈ 28 min. Use `--fps 30 --sub 1` drafts for iteration.

Engine bugs v1 hit:
- A `.abs` class with `left:0` defeated `right:` anchoring. Set `left:auto` on right-anchored text.
- A child set to `visibility:visible` shows through a hidden parent: hide HUDs with `display:none`.
- SVG `pathLength` plus `vector-effect: non-scaling-stroke` desynced the dash from `getPointAtLength`.
  Pre-scale paths into pixels.
- A visibility toggle placed after an early `return` never ran.
- Sub-frames must **start** at the frame time (`t + j/sub · 0.5/fps`), and the ffmpeg side is
  `tmix=frames=4,select=eq(mod(n\,4)\,3),setpts=N/(60*TB)`. Otherwise cuts bleed across frames.
- Pale type on light footage vanished (Vitalité sky). Check contrast on every text-over-footage frame.

Audio:
- A `tanh` soft-clip drove the first mix to -11 LUFS with 1.4 LU of range. Gain-stage on RMS, use a
  soft knee, and high-pass at 30 Hz.
- `loudnorm` prints its JSON to **stderr**, and at -14 LUFS with a hot mix it **silently falls back
  to dynamic mode**. Target -14.5, or leave more true-peak headroom, so `linear=true` holds.

Safety:
- Run `showreel/audit.mjs` (per-frame luma jumps, WCAG 2.3.1: no more than 3 flash pairs per second).
  v1's first pass failed at 6 because of a strobe inside the source footage. Filmed TVCs and MVs in
  §4.1 may contain strobes: audit them.

---

## 9. Questions to ask the owner before building (one message)

1. **Video & brand footage.** Drop local masters into `showreel/footage/`, or approve
   downloading his own YouTube uploads with yt-dlp? Which 6–10 pieces matter most? (Default
   picks: the two Top 1 TVCs, Young Lions 2023, Let's On Air, ISBe Yourself, Miền Đất Hứa,
   Hoa Niên Liên Khấu recap.)
2. **Music.** Keep synthesising the score (royalty-free, already beat-locked), or use a licensed
   track he supplies? If a track, get its BPM and re-grid §5 to it. Also, has he listened to v1's score?
3. **Realism approach.** Approve Three.js with post-processing (§3), and a ~2 s spike first to
   prove the look and the render speed.

---

## 10. Done means

- `showreel/out/tatsuki-reel-2026-30s.mp4` (master) plus `-web.mp4` (CRF ≈ 23, AAC 160k, faststart)
  plus `-poster.jpg`. Exactly 30.000 s, 1800 frames, 1920×1080, 60 fps, 48 kHz stereo.
- Loudness about -14 LUFS, true peak ≤ -1.5 dBTP. Flash audit: at most 3 pairs in every second.
- Frame-accurate contact sheets covering every shot and every transition, read and fixed. Last
  frame black, first frame dark, so it loops.
- v1 files untouched. `showreel/README.md` gains a v2 section. Nothing committed or wired into the
  site without asking.
