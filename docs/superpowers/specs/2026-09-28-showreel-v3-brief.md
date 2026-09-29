# Showreel v3: brief (30 s, remake of v2)

Written 2026-09-28 at the end of the chat that built v2. **v3 is to be built in a new chat**, from
this file. v2 failed on pacing, readability, image quality and music; read why before anything else.

---

## 0. Read this first (for the chat that builds it)

1. Read `docs/superpowers/specs/2026-09-28-showreel-v2-retro.md` in full. Every rule below comes
   from something that went wrong there, with numbers.
2. Also read `docs/superpowers/specs/2026-09-28-showreel-v2-design.md` §4 (asset inventory),
   §8 (traps) and `showreel/README.md`. The asset list and pipeline are still valid; the v2 shot list
   and music plan are **not**.
3. **v1 and v2 stay untouched.** v1 = `reel.*`, `music.mjs`, `out/tatsuki-reel-2026*`. v2 =
   `reel2.*`, `music2.mjs`, `out/tatsuki-reel-2026-30s*`. Build v3 in new files (`reel3.*`) with new
   outputs (`out/tatsuki-reel-2026-30s-v3*`). Reuse `render.mjs`, `prep.mjs`, `finish.mjs`,
   `audit.mjs` and `sheet.mjs` through their options.
4. **Invoke skills first** (repo `CLAUDE.md`, step zero): `superpowers:brainstorming` for the
   direction, `ai-film-production` for the shot list, `emil-design-eng` for motion.
5. Ask the §3 questions in one message, then wait. Do not start building before they are answered.

---

## 1. What the owner wants

- 30 s, 1920 × 1080, 60 fps. A branding piece for the portfolio, not lead-gen.
- **Calmer than v2: fewer things, each one seen.** "Impress" through quality and rhythm, not quantity.
- The realistic, physical look of v2 was liked as a look (panels, depth, light, a reflective floor).
- **Music that matches a cinematic, confident mood.** "Upbeat" means driving, not cheerful.
  v2's score was "cute": major key, bouncy piano, high tinkly lead. Never again.
- Every word on screen must be readable at normal speed. Nothing may look pixelated or broken.
- His face may be used (`public/images/hero-portrait.webp`) for the sign-off.
- Copy rules are unchanged: no senior titles, no sales pitch, claims only if already on the site.

## 2. Hard rules (numbers, not taste)

**Content**
- At most **4 subjects** plus an opening and a sign-off. At most **14 shots** in the whole reel.
- Each subject gets **≥ 4 s**. Each shot is held **≥ 1.5 s**; hero shots **2.5–3 s**.

**Text**
- On screen for at least **0.6 s + 0.3 s per word**, and never under **2 s** for a headline.
- One text element at a time, **≤ 8 words**, still while it is read (the reveal is ≤ 0.4 s in
  total, then it holds).
- Never over busy or moving footage; give it a calm area or a solid band.

**Resolution (the "breaking up" rule)**
- Screen pixels ≤ source pixels. Before approving a shot, compute how many source pixels span the
  frame. If it is enlarged by more than **1.1×**, the shot is rejected.
- Raise the texture cap in `decode()` (v2 capped every texture at 2048 px) so large sources load
  at native size.
- Add a debug check to the engine: per frame, for each visible panel, projected screen px ÷
  texture px; log anything above 1.1.
- Never push into UI screenshots whose content is small in the source (the n8n canvases, the
  Weavy canvas). Show them whole or not at all.

**Motion**
- No camera flights between subjects. Change subjects with a **cut on the beat**, or one motivated
  move per subject.
- Camera moves last **≥ 1.2 s**, eased in-out. At most one whip-pan in the whole reel.
- Nothing appears from scale 0; exits are faster than entrances (emil-design-eng rules still apply).

**Sound**
- Choose the music first, then cut the picture to it.
- Sound effects are few and sit under the music. Master at -14.5 LUFS, ≤ -1.5 dBTP.

## 3. Questions to ask the owner before building (one message)

1. **Music.** Recommended: he supplies a licensed track he likes, or 2–3 reference tracks that
   carry the mood (cinematic, dark or neutral, driving drums and bass, no cute melody); then source a
   royalty-free track that matches and get his approval. Code synthesis is a last resort only
   (retro §4 explains its ceiling). Whatever the choice: BPM and section map first.
2. **The 4 subjects.** Default proposal:
   - terra: growth (the 12× story)
   - one product: **Nhà Mình** or **Vitalité**, his choice
   - Video & brand: the two Top 1 TVCs as real footage
   - one AI film: **Aru Otoko** or **Bóng Vespera**, his choice

   PATI, IELTS Studio, UpHub, Badminton Club and the other AI film are out, or appear only as a
   single held "the rest of the work" frame.
3. **The frame concept.** Keep "Execute workflow" only as the opening (prompt + click) and the
   ending (everything lit, collapsing into the portrait), with straight cuts in between? Or drop it
   for a pure editorial reel in the same realistic look? Recommend the first.
4. **Review gate.** Recommend: a 30 fps animatic sent to him before the final render (a ~7-minute
   render), even if he says "just build it". v2 skipped this, and it would have caught every problem.

## 4. Default timeline (re-grid it to the chosen track)

| Time | Subject | Shots | Readable text (held) |
|---|---|---|---|
| 0 – 3 | Opening | prompt types "ideas into actual things" at a readable pace; the Execute click | the prompt itself, ≥ 1.5 s complete |
| 3 – 9 | terra | 2 shots: publishing-machine visual → the 12× stat panel | "12× organic growth", ≥ 2.5 s |
| 9 – 14.5 | Nhà Mình *or* Vitalité | 2 shots: one hero screen at native size, one device shot with a slow move | one line, ≥ 2 s |
| 14.5 – 21 | Video & brand | 3–4 native 1080p clips, ~1.5 s each, cut on the beat | "Two-time Top 1 TVC · Business Challenge", ≥ 2.5 s |
| 21 – 26 | Aru Otoko *or* Bóng Vespera | 2–3 stills or clips at ≤ native size, 1.5–2 s each | name (+ 或る男 if Aru), ≥ 2 s |
| 26 – 30 | Sign-off | graph lit → portrait | "Hi, I'm Thanh. Call me Tatsuki." + url, ≥ 2.5 s; black by 29.95 |

That is 12–14 shots, against about 40 in v2.

## 5. Resolution budget (native size → largest honest on-screen size at 1920 × 1080)

| Asset | Native | Max on screen |
|---|---|---|
| TVC / MV footage (`showreel/footage/*.mp4`, YouTube-compressed) | 1920 × 1080 | full frame at 1:1 only. No crop-and-scale: v2's subtitle crops (1600 px → 1920) enlarged it. Pick subtitle-free moments or cover subtitles with a band |
| Nhà Mình screens `images/nha-minh/*.png` | 2880 × 1800 (desktop), 780 × 1688 (phone) | full frame (desktop); phone ≤ 1688 px tall |
| Vitalité storefront `images/vitalite/*.webp` | 2880 × 1800 (crop the DEMO strip) | full frame |
| Vitalité lookbook `…/gallery/0x-model.webp` | 1050 × 1400 | ≤ 1050 px wide |
| terra stat panel (drawn in code) | any | full frame |
| `images/visuals/publishing-machine.webp` | 1536 × 1024 | ≤ 1536 px wide |
| terra social posts | 800 × 450 | ≤ 800 px wide |
| Aru stills `aru-otoko/stills/*.webp` | 1376 × 768 | ≤ 1376 px wide |
| Aru refs `references/*.webp` | 800 × 450 | ≤ 800 px wide |
| Aru walk `frames/s00` | 960 × 542 | ≤ 960 px wide |
| Bóng keyframes `vng-demo/stills/*.webp` | 1664 × 2496 | full height is fine |
| Bóng motion clip | 600 × 828 (after the watermark crop) | ≤ 828 px tall |
| Portrait `hero-portrait.webp` | 1100 × 1375 | full height is fine |
| n8n and Weavy canvases | 2880 × 1800 / 2000 × 2000, content tiny | whole canvas only, never macro |

## 6. Build and review gates

1. **G1 Music:** the track is approved, and its BPM and section map are written down.
2. **G2 Shot table:** every shot's hold, source px → screen px ratio and text durations are
   written down and approved.
3. **G3 Animatic:** `render.mjs --fps 30 --sub 1`. **Watch it yourself at real time** (not contact
   sheets: retro §5), then send it to the owner with the music. Continue only on his OK.
4. **G4 Final:** 60 fps × 4 sub-frames (~35 min for v2's complexity; v3 should be lighter), then
   `finish.mjs`, `audit.mjs`, and a loudness check.

## 7. Reuse from v2 (`showreel/reel2.js`)

Keep: `panel()` + `ScreenMaterial` (crop, blur, wipe, zoom), the mirror floor (`buildFloor`), post
chain (Bokeh → Bloom → Output → grade with grain, vignette, CA, letterbox), `seek()` with async
frame jobs and LRU eviction (limit 120), the wire shader for the opening and ending, portrait
sign-off, HUD caption engine (retime it: holds, not word-by-word ripples).
Drop: the 26 m-apart set layout and transit/chase camera, the video wall, and pass-through gates.

Commands:

```bash
node prep.mjs --set v2                                   # footage segments (extend with a v3 set)
node render.mjs --page reel3.html --serve --prefix v3 --time --stills 4,12
node render.mjs --page reel3.html --serve --to 30 --fps 30 --sub 1 --out out/reel3-animatic.mp4
node render.mjs --page reel3.html --serve --to 30 --out out/reel3-video.mp4
node finish.mjs --video reel3-video.mp4 --score <track>.wav --name tatsuki-reel-2026-30s-v3 --poster 28.6
node audit.mjs out/tatsuki-reel-2026-30s-v3.mp4
```

Traps: see v2 retro §7 (PowerShell codepage 1258, `--serve`, GPU-memory hang, and footage
timestamp drift).

## 8. Done means

- `out/tatsuki-reel-2026-30s-v3.mp4` + `-web.mp4` + `-poster.jpg`: 1800 frames, 30.000 s,
  1920 × 1080, 60 fps, 48 kHz stereo, -14.5 LUFS, ≤ -1.5 dBTP, flash audit ≤ 3 pairs per second.
- Every text element meets the §2 hold rule (list them with times).
- No shot enlarges its source by more than 1.1× (the engine's debug log is clean).
- The owner has seen and approved the animatic before the final render.
- v1 and v2 files untouched. Nothing committed or wired into the site without asking.
