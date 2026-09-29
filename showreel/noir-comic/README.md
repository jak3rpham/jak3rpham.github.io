# Reel 2026 · "The noir comic"

A 44.6 s, 1920 × 1080, 60 fps showreel, code-rendered in Three.js. A detective's office at night
(rain behind venetian blinds, a line typed out) turns out to be panel one of a long comic page
printed in ink; the camera glides along the page through six cases, each built from panels that
land on the beat; the last panel is the office again and the reel ends where it began.

Everything in this folder is the source of truth for that reel. Shared tools stay one level up in
`showreel/` (`render.mjs`, `prep.mjs`, `finish.mjs`, `audit.mjs`, `vendor/`, `cache/`, `footage/`).

| File | What it is |
|---|---|
| `index.html`, `reel.css` | the page the renderer opens |
| `reel.js` | the whole reel: engine, page, cases, camera, captions |
| `sfx.mjs` | sound design: real recorded effects from `sfx/`, placed on the beat grid |
| `score.mjs` | cuts the music to length, builds the effects track, mixes both with ducking |
| `music/` | the score, "Trip-Hop Instrumental 08" (alanajordan, Pixabay Content License) |
| `sfx/` | 45 effects from Pixabay (Pixabay Content License, free to use, no attribution) |

`music/` and `sfx/` are not in git (like `footage/`): keep a copy. The track is "Trip-Hop Instrumental 08" on
Pixabay; every effect's source page is the Pixabay search that found it (names in `sfx.mjs` match the files).

History and every decision: `docs/superpowers/specs/2026-09-28-showreel-v3-design.md` (§8 and §9
are the comic), the brief it answered (`…-v3-brief.md`) and the v2 retro (`…-v2-retro.md`).

---

## 1. Commands

Run from `showreel/`.

```bash
node prep.mjs --set v3                                                     # footage → cache/v3/ (needs footage/, not in git)
node render.mjs --page noir-comic/index.html --serve --prefix nc --time --stills 7.5,36.9   # stills → audit/
node render.mjs --page noir-comic/index.html --serve --to 44.58 --fps 30 --sub 1 --out out/nc-animatic-video.mp4   # ~8 min
node render.mjs --page noir-comic/index.html --serve --to 44.58 --out out/nc-video.mp4                             # final, ~45 min
node noir-comic/score.mjs                                                  # out/nc-score.wav, out/nc-sfx.wav, out/nc-mix.wav
node finish.mjs --video nc-video.mp4 --score nc-mix.wav --name tatsuki-reel-2026-noir --poster 18.5   # never plain tatsuki-reel-2026: that is v1
node audit.mjs out/tatsuki-reel-2026-noir.mp4                              # flash audit: ≤ 3 opposing pairs a second
```

`--serve` is required: WebGL will not take textures from `file://`. `?clean` on the page
(`--page "noir-comic/index.html?clean"`) hides every caption; that is how the site's hero loop is made.

## 2. How the engine works

- **A pure function of time.** `seek(t)` sets every object, uniform and texture for `t`, waits for
  the video frames it asked for, renders once. The renderer captures 4 sub-frames per frame across a
  180° shutter and `ffmpeg tmix` blends them into motion blur.
- **Post.** Render → depth of field (Bokeh) → bloom → output → the grade: a contrast curve, halftone
  dots only in the deepest shadows, 24 fps grain, vignette.
- **The world is black and white; the work is in colour.** Screens use `screenMat()`: `sat` (0 = grey),
  `con`, `slat` (blind shadows laid over a print), `ink` (re-screened as coarse halftone at output
  resolution), `scan` (CRT lines).
- **The page.** One 40 × 14 m plane with a world-space halftone shader (`PAGE_FS`): never flat black.
  Each case has its own image behind it printed as ink (`inkArt`).
- **Panels.** `cpanel(w, h, name, {map, fit})` is a comic panel: black outline, bone border, the work
  inside. `land(obj, t0, {lift, spin, dx, dy})` brings anything in from in front of the page, turned
  and 12 % small, easing out in 0.34 s; nothing appears from scale 0. `burst()` is a speed-line burst
  behind a hero panel.
- **Video.** `video(panel, url)` queues a frame; `seek` loads it before rendering. Sequences are JPEG
  or WebP frames in `cache/v3/<id>/` (made by `prep.mjs --set v3`) or in `public/`. `seqUrl(base,
  count, fps, localTime, loop, pad, ext)` picks the frame.
- **Regions.** Each case is a group (`world.terra`, `world.vit`, …). `REGION` lists when each is
  visible, so the page only renders what is near the camera.
- **Camera.** `shot(keys, opts)`: keys are `{ b, pos, look, fov, roll }` with `b` in beats. Inside a
  shot the camera runs a Catmull-Rom path through the keys, never stopping between them; a new
  `shot()` is a cut. A long jump into a key that must land exactly (the end panel) goes in its own
  shot with ease, or the spline overshoots.
- **The room.** The intro office is built at y = −40 and filmed by `roomCam`. During the intro it
  is the main camera; afterwards it renders into a render target shown on panel one, and again on
  the end panel, so the page can "contain" the room.
- **Captions.** DOM caption boxes (`buildHud`): one at a time, wiped open in 0.3 s, held still, gone
  in 0.18 s. `type` lines are typed at 45 ms a character.
- **The resolution guard.** `checkTexels()` projects every visible panel and logs any shot that shows
  a source larger than its pixels (ratio > 1.1). `window.texels()` returns the maximum per panel.

## 3. The grid

70.00 BPM: a beat is 0.857 s, a bar 3.429 s. `bt(n)` converts beats to seconds. The score takes the
track from 29.363 s (a bar without hats, then the groove), cuts the silent bar at 56.79–60.22 with a
20 ms crossfade, and runs to 44.58 s = 52 beats = 13 bars.

| Beats | Seconds | Case | What happens |
|---|---|---|---|
| 0 – 3.65 | 0 – 3.1 | Intro | office, rain, "Ideas into actual things." typed |
| 3.65 – 12 | 3.1 – 10.3 | 01 terra (x ≈ 3) | the room pulls back into panel one; 3D logo, pages, posts, inked growth chart, "12×" headline with burst, stats counting |
| 12 – 20 | 10.3 – 17.1 | 02 Nhà Mình (x ≈ 7.6) | real UI video, phones, screens; "A little closer. Even from afar." |
| 20 – 24 | 17.1 – 20.6 | 03 Video & brand (x ≈ 12) | nine filmed works in an irregular grid, two film strips across it |
| 24 – 32 | 20.6 – 27.4 | 04 Aru Otoko (x ≈ 16.6) | widescreen panels of the MV and raw generations, camera craning down, 或る男 in the gutter |
| 32 – 40 | 27.4 – 34.3 | 05 Bóng Vespera (x ≈ 21) | five keyframes as tall panels, two come alive on beat 36 |
| 40 – 46 | 34.3 – 39.4 | 06 Vitalité (x ≈ 25) | storefront clicked through (home, shop, product, cart, phone), the 0823 campaign sequence to the wordmark wall, hero film, lookbook, stop-motion tee, pink swash |
| 46 – 48 | 39.4 – 41.1 | other cases (x ≈ 29.6) | PATI, IELTS Studio, UpHub, Badminton Club |
| 48 – 52 | 41.1 – 44.6 | Outro (x = 32.6) | the end panel is the office; camera goes in; "Hi, I'm Thanh. Call me Tatsuki." typed |

## 4. Sound

`sfx.mjs` loads each file once, peak-normalises it and places slices with `put(t, file, dB, {from,
len, anchor, rate, pan})`: `anchor` is the moment inside the file (a whoosh's peak, a keystroke's
onset) that lands on `t`. Layers:

- beds: film crackle under everything; rain in the intro, under Aru Otoko and in the outro;
- foley: real typewriter keystrokes cut one by one (onsets measured), bells, paper slaps, page flips,
  the 35 mm projector, mouse clicks, camera shutters, spray can;
- cinematic: whooshes on every camera move (peak on the move), impacts, stamp, sub drops, a dark
  braam for Vitalité, a Burmese bell and a temple bell for Bóng Vespera.

`land(t)` in `sfx.mjs` is the sound twin of `land()` in `reel.js`: a short swoosh just before, a
paper slap on the beat. `score.mjs` mixes the effects about 10 LU under the music and ducks the music
with a sidechain compressor keyed by the effects; `finish.mjs` then normalises to −14.5 LUFS, ≤ −1.5 dBTP.

To add a sound: find the moment's beat in `reel.js`, add a `put()` or `land()` at the same `bt()`,
run `node noir-comic/score.mjs`, and remux. No picture render is needed.

## 5. Extending it

**Add a case.**
1. Put its footage in `prep.mjs` (`v3` set) if it moves; run `prep.mjs --set v3`.
2. Write `buildX()` in `reel.js` next to the others: `const g = group("x", world.comic)`, an `inkArt`
   behind, `cpanel`s placed around a centre x, each with `land(…, bt(beat))`.
3. Add it to `REGION`, to `later` in `init()`, a caption in `buildHud()`.
4. Move the camera: add keys to the shot that passes it (or a new `shot()` for a cut).
5. Add its sounds in `sfx.mjs`.

**Make it longer.** Add whole bars (4 beats) so cuts stay on the grid. Then: raise `DUR` in `reel.js`
(and `sfx.mjs`), shift everything after the insertion by the added beats (keys, `REGION`, `land`
beats, captions, `END_X`/`END_ROOM`, sound events), and run `score.mjs`: it reads `DUR` from `reel.js`
and cuts the music to match. The track runs to 3:00, so there is room.

**Before calling it done** (the rules the owner set, with numbers):
- no source shown larger than 1.1× its pixels (`window.texels()`, or the probe below);
- every caption on screen ≥ 0.6 s + 0.3 s a word, headlines ≥ 2 s, one caption at a time;
- flash audit ≤ 3 opposing pairs a second (`audit.mjs`);
- copy only from the site, no senior titles, no sales pitch;
- watch the 30 fps animatic at real time before the final render.

## 6. Traps already paid for

- PowerShell here is codepage 1258: `Get-Content`/`Set-Content` mangle UTF-8 (Vietnamese, `·`, 或る男).
  Edit with the Edit tool or node. Site files are CRLF, `showreel/` files LF.
- Shell heredocs mangle some JS; write patch scripts to a file and run them with node.
- `public/vitalite/demo/theme/video/hero-1280.mp4` strobes between 1.3 and 5 s: only 0.1–1.1 and
  5.1–7.6 are used. The 0823 sequence has 96 frames.
- YouTube contact-sheet timestamps drift 1–2 s: check in-points on a 0.5 s scan.
- The `REGION` visibility must be set before the updaters run, or a panel's first video frame is
  never requested.
- A texture cache over ~120 decoded video frames can hang Chrome; `evict()` keeps it there, and the
  renderer has a 60 s watchdog per seek.

## 7. On the site

Made from the master with:

```bash
D=../public/videos/reel
ffmpeg -i out/tatsuki-reel-2026-noir.mp4 -c:v libsvtav1 -preset 5 -crf 45 -pix_fmt yuv420p10le -svtav1-params film-grain=0 -c:a aac -b:a 160k -movflags +faststart $D/tatsuki-reel-2026.av1.mp4   # ~33 MB
ffmpeg -i out/tatsuki-reel-2026-noir.mp4 -vf scale=1280:-2 -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $D/tatsuki-reel-2026.mp4   # ~21 MB, H.264 fallback
ffmpeg -ss 18.5 -i out/tatsuki-reel-2026-noir.mp4 -frames:v 1 -c:v libwebp -quality 82 $D/tatsuki-reel-2026-poster.webp
# hero loop: caption-free, terra to Vitalité, 30 fps, the last 0.6 s crossfaded into the first
node render.mjs --page "noir-comic/index.html?clean" --serve --from 3.94 --to 39.26 --fps 30 --sub 2 --out out/nc-hero-loop-src.mp4
ffmpeg -i out/nc-hero-loop-src.mp4 -filter_complex "[0:v]split[a][b];[a]trim=start=0.6,setpts=PTS-STARTPTS[m];[b]trim=0:0.6,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=0.6:offset=34.133,scale=1280:720:flags=lanczos,format=yuv420p[v]" -map "[v]" -c:v libx264 -crf 16 out/nc-hero-loop.mp4
ffmpeg -i out/nc-hero-loop.mp4 -an -c:v libsvtav1 -preset 5 -crf 50 -pix_fmt yuv420p10le -movflags +faststart $D/hero-loop.av1.mp4   # ~5 MB
ffmpeg -i out/nc-hero-loop.mp4 -an -vf scale=960:540 -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart $D/hero-loop.mp4   # ~5 MB
ffmpeg -i out/nc-hero-loop.mp4 -frames:v 1 -c:v libwebp -quality 80 $D/hero-loop-poster.webp
```

The AV1 files go first in each <video>; browsers without AV1 (older Safari, most iPhones) take the
H.264 file. Heavy grain and halftone compress badly in H.264: that is why the AV1 files exist.

`public/videos/reel/`: `tatsuki-reel-2026.mp4` (the full cut, web encode) with its poster, and
`hero-loop.mp4` (the caption-free glide from terra to Vitalité), each also as `.av1.mp4`, with posters.
The homepage hero plays the loop behind the headline (`components/home/HeroReel.tsx`: plays in view,
pauses off screen or behind an open player, stays on its poster for reduced motion or Save-Data; the
3D `Assembly` is set aside, not deleted: put `<Assembly />` back in `PortfolioHome.tsx` to restore it).
"Watch the reel · 0:45" opens the full cut in `VideoLightbox` (which now takes `sources` as well as
YouTube ids). `/video` shows the full cut right after its hero. `scripts/check-homepage.mjs` covers all
of it.
