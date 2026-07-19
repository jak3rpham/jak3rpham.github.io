# aru-otoko — asset manifest

**webp only in this folder. No mp4, no png.** Every clip lives on YouTube; the page shows a
thumbnail and only loads the iframe on click — the pattern `VideoLightbox` + `ytThumb`
already implement for the video page.

**Names are load-bearing** — code reads these paths literally. Drop files in, keep the names.
Missing files render a labelled placeholder, so nothing breaks while you fill this in.

---

## 1 · stills/ — keyframes, one per shot

16:9. Export **1600×900**, webp q80.

| File | Shot | In | Cut | Note |
|---|---|---|---|---|
| `s00-walking-legs.webp` | S00 | — | asset | knee-down crop, own CapCut panel |
| `s01-back-view.webp` | S01 | 0:00.0 | 4.4s | back only, face not visible |
| `s02-crowd-streaks.webp` | S02 | 0:04.4 | 4.3s | crowd as light streaks |
| `s03-wet-crossing.webp` | S03 | 0:08.7 | 4.4s | no face |
| `s04-the-stop.webp` | S04 | 0:13.1 | 4.4s | independent gen, no chain |
| `s05-rooftop.webp` | S05 | 0:17.5 | 4.3s | vocal in |
| `s06-vending-machine.webp` | S06 | 0:21.8 | 4.4s | no character |
| `s07-close-up.webp` | S07 | 0:26.2 | 4.3s | hardest shot, most regens |
| `s08-skyline.webp` | S08 | 0:30.5 | 2.5s | ends unresolved on the 32.7 hit |

Optional, only if you actually used them:

    s-profile.webp        the extra 90° side-profile shot
    broll-train.webp      B2
    broll-shoes.webp      B4

## 2 · references/ — what anchored the generations

800px wide, webp q80. Three images total.

    ref-01-<what-it-is>.webp
    ref-02-<what-it-is>.webp
    ref-03-<what-it-is>.webp

Final names depend on what the three actually are (face refs vs the Spider-Verse style ref) —
assigned on sight, not guessed.

## 3 · workflow/ — the node canvas

Screenshot, so legibility beats file size. **2000px wide**, webp q88.

    weavy-canvas-full.webp

## 4 · frames/s00/ — the scroll-scrub sequence

The one set piece: scroll drives his footfalls. Extract from your local `s00.mp4` — the clip
does not go in the repo, only these frames do.

    frames/s00/0001.webp … 0070.webp

**960px wide, q72, ~70 frames, budget ~5MB total.** Do not exceed. This is the single
heaviest thing on the page, and halftone art compresses badly.

## 5 · poster/ — hand-made, two orientations

YouTube serves a thumbnail for every clip, so these only need to exist for the two places
worth controlling by hand: the hero and the vertical section.

    poster-horizontal.webp     1600×900    hero
    poster-vertical.webp        900×1600   the 9:16 section

Both fall back to the YouTube thumbnail if absent.

---

## 6 · YouTube — paste full links, I will sort them

Send whatever order you like. Label the three finals so I can tell them apart; the nine raw
gens I can order from the filename or from you saying "s03".

| Slot | What |
|---|---|
| hero | MV 16:9, 33s |
| vertical | 9:16 cut |
| reels | you talking through the process |
| raw s00 … s08 | the untouched 5s Seedance gens |

The raw gens are **evidence, not artwork**: they exist to show the model emits a fixed 5s
chunk no matter what the music asks for. That contrast — `genDur` always 5, `editDur` ranging
2.5→4.4 — is the argument the page is built on.

---

## Commands

Stills → webp:

```bash
for f in *.png; do
  ffmpeg -i "$f" -vf "scale=1600:-1" -c:v libwebp -q:v 80 "${f%.png}.webp"
done
```

Scrub frames out of your local S00 clip (5s → 70 frames at 14fps):

```bash
mkdir -p frames/s00
ffmpeg -i /path/to/s00.mp4 -vf "fps=14,scale=960:-1" -c:v libwebp -q:v 72 frames/s00/%04d.webp
du -sh frames/s00        # must land under ~5MB
```

Over budget? Drop to `-q:v 65` before dropping frames. Fewer frames makes the walk stutter,
and the walk landing on the beat is the entire reason that set piece exists.

---

## Backdrop settings (locked)

The WebGL halftone-city variant ships with these. Measured, not eyeballed: `exp` sits at 1.8
because the ben-day gaps swallow ~58% of the light, and 1.8 lands the mean back at the
un-halftoned 28.9/255.

    dot=3.5  halftone=0.7  exp=1.8  sky=1.0  facade=1.0  win=1.0
    car=1.0  lamp=1.0  sign=1.0  wet=0.75  den=0.72  spd=1.0  ref=on

Measured on RX 5500M: 720p ~108fps · 1080p ~75fps · 1440p ~57fps.
Weaker GPUs get a reduced render scale; mobile falls back to static.
