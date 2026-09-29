# Showreel v2: retro

v2 (`showreel/reel2.*`, `music2.mjs`, output `showreel/out/tatsuki-reel-2026-30s*`) was built on
2026-09-28 from `2026-09-28-showreel-v2-design.md`. It passed every technical check (1800 frames,
-14.5 LUFS, no flash pairs) and still failed as a film. The owner's verdict, in his words:

> The music feels cute. The motion is too fast, probably because too much is crammed in, so there's no time to see anything. Things zoom in and break up, so they stop looking good. Text goes by too fast to read. The music doesn't fit the mood and style of the video; maybe the sound choice was wrong.

Keep v2 as a reference only. Do not iterate on it.

---

## 1. Too much content: the spec's fault first

The v2 shot list asked for **9 projects in 28 s**, and each project was then split into 3–7 beats.

| Measure | v2 |
|---|---|
| Projects | 9 (terra, PATI, Nhà Mình, Vitalité, IELTS · UpHub · Badminton, Video & brand, Aru Otoko, Bóng Vespera, plus prompt and sign-off) |
| Distinct shots or image changes | about 40, so a new picture every ~0.7 s |
| Time spent flying between sets | 3.25 s of camera transits, plus 1.4 s crane and 0.85 s collapse, ~5.5 s of 30 |
| Shortest holds | lookbook cuts 0.25 s, Bóng gates 0.25 s each, trio monitors 0.5 s |
| Camera speed in transits | ~26 m in 0.2–0.5 s, whip-pans of 0.15 s |

Contact sheets looked rich because each still was full. At speed, the eye had no time to land.

**Lesson:** 30 s holds 4–5 subjects, not 9. A hero shot needs at least 1.5–2 s of stillness to be
seen. Every flight between subjects is time taken from the work. Cutting is cheaper than flying.

## 2. Text too fast to read

| Caption | On screen |
|---|---|
| IELTS Studio / UpHub / Badminton headlines | 0.24–0.36 s each |
| PATI, "Three problems. Three workflow architectures." (5 words) | 0.8 s |
| terra, "One brand. Many moving parts." | 1.55 s |

The captions also rose word by word with a stagger, which ate part of the hold, and they sat over
moving footage and panels.

**Lesson:** a line needs about **0.6 s + 0.3 s per word**, and never less than 2 s for a headline.
Show one text element at a time, at most 6–8 words, never over busy footage, and fully still
while it is being read.

## 3. "Breaking up": sources shown bigger than their pixels

The camera pushed into images far past their native resolution. Worst offenders, measured:

| Moment | Source pixels in frame → screen | Upscale |
|---|---|---|
| Dive into the Weavy canvas node (Aru, 19.6 s) | ~220 px of a 2000 px canvas → 1920 px | ~9× |
| PATI macro truck along the n8n canvas | ~940 px (texture capped at 2048) → 1920 px | ~2× |
| Aru refs `ref-0x` full frame | 800 × 450 → 1920 × 1080 | 2.4× |
| Aru walk sequence `frames/s00` | 960 × 542 → full frame | 2× |
| Wall of screens | decoded at 800 px, then pushed in close | up to ~2× |
| terra social posts | 800 × 450 sources, shown large | ~1.5–2× |
| Bóng gates at the pass-through | 1664 px wide, camera inside 1 m of the panel | 1.5–3× |

A second cause is in code: `decode()` in `reel2.js` capped **every** texture at 2048 px wide, so
even 2880 px screenshots were softened before the camera pushed in. The YouTube footage is also
already recompressed, so any enlargement shows its blocks.

**Lesson:** screen pixels must not exceed source pixels (texel ratio ≥ 1). Before a shot is
approved, compute how many source pixels will be spread across the frame. Small sources stay
small on screen. Never macro a UI screenshot whose content is tiny in the source.

## 4. Music that sounded cute

"Upbeat" was read as *cheerful*, which was the wrong reading. `music2.mjs` used:
- C major, I–V–vi–IV: the most "happy pop" progression there is.
- Additive "piano" stabs on a 3-3-2 bounce, a pulse-wave lead hook in G4–A5, pluck arpeggios up to
  two octaves higher, and FM bell pings on every accent.

A high, tinkly, bouncy top line over thin synthesised timbres reads as a game or children's
jingle. It fights a dark, cinematic, realistic picture.

Synthesising in JavaScript also has a hard quality ceiling. There are no real instruments, no
mixing engineer and no real sound design. v1's score passed a technical check, but no one judged
it *against the picture*.

**Lesson:** upbeat means *driving and confident*, not *happy*. Drive comes from drums, bass and
momentum, not from a bright melody. Pick the music first, from references the owner chooses, and
cut the picture to it. Prefer a real licensed track over code synthesis for anything that has to
feel premium.

## 5. Process failures (mine)

- **Stills are not pacing.** I reviewed via contact sheets. Stills cannot show speed or readability.
  I never watched the draft at real time before the final render.
- **The gate I skipped.** The spec asked for a ~2 s spike shown to the owner before building. When
  he said "just build the completed video", I read that as permission to skip every review. A
  30 fps animatic sent to him before the 34-minute final would have caught all four problems in
  5 minutes.
- **Style of "rich" over "clear".** Every section got more mechanism (fans, deals, wipes,
  pass-throughs). Craft effort went into choreography, not into letting a frame breathe.

## 6. What worked (keep)

- The Three.js engine in `reel2.js`: textured panels with bezels, the `ScreenMaterial` (crop,
  blur, wipe, zoom), the planar-mirror floor, bloom, depth of field, grain, and 4-sub-frame
  motion blur. It reads as physical and real.
- The concept of "Execute workflow" and the glowing wire, as an *idea*.
- TVC footage full frame on a downbeat: the strongest moments in v2 were the MR. BROWN and
  ARISAQUA packshots, which were real footage at native size.
- The portrait sign-off.
- Pipeline: `render.mjs --page … --serve`, `prep.mjs --set`, `finish.mjs --video/--score/--name`,
  `audit.mjs`, and the 60 s per-frame watchdog.

## 7. Technical traps hit in v2 (in addition to spec §8)

- PowerShell 5.1 here uses ANSI codepage **1258**. `Get-Content -Raw` / `Set-Content` round trips
  double-encode UTF-8 (Vietnamese, `·`, `⚡`, `或る男`). Edit such files with the Edit tool or node only.
- WebGL will not take textures from `file://`. Use `render.mjs --serve`.
- A frame cache of 260 decoded 1280 px video frames plus statics exhausted GPU memory and hung
  Chrome silently at 16 s. The cache is now 120, and `render.mjs` has a 60 s watchdog per seek.
- A 28-screen video wall costs ~0.5 s per seek at 30 fps. The full 60 fps × 4 sub-frame render took
  34 min on the RX 5500M.
- Headless Chrome uses the real GPU by default (ANGLE D3D11); no flags are needed.
- YouTube contact-sheet timestamps drift by 1–2 s. Verify every in-point with a fine scan
  (`-ss <start> -vf fps=1/0.5,tile`) before extracting.
- `0823` has 96 frames (see its `manifest.json`), not 100.
- Fading a panel over ~3 frames when the camera passes through it produced a flash pair per gate.
  A fade of ~9 frames fixed it.
