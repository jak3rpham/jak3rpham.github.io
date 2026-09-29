# Showreel v3: "The case files" (design as built)

Built 2026-09-28 from `2026-09-28-showreel-v3-brief.md`. Files: `showreel/reel3.html`, `reel3.css`,
`reel3.js`; score `showreel/music/alanajordan-trip-hop-instrumental-08-537244.mp3`; outputs
`showreel/out/reel3-animatic.mp4` (G3) and later `out/tatsuki-reel-2026-30s-v3*` (G4).

## 1. Decisions the owner made (this chat)

| Question | Answer |
|---|---|
| Style | Dark classic noir, "like Spider-Man Noir". Music to match. |
| Concept | **A · Case files**, chosen over a screening room and a noir city. "Execute workflow" dropped: it only fitted PATI and forced the wire and the flights that sank v2. |
| Content | Show every product, each with its own time and showcase: terra and Nhà Mình longest; Video & brand fast ("enough to say I edited it"); both AI films in full; the rest fast or grouped. |
| Music | "Trip-Hop Instrumental 08" (alanajordan, Pixabay), from about 0:30: dark, mysterious. Big Band Agent was the runner-up (too "spy"). He downloaded it himself. |
| Review | He watches the 30 fps animatic before any final render. |
| Length | Not stated; assumed **41.15 s (12 bars)** and told him. Vitalité assumed in the grouped files, told him. |

The brief's "≤ 4 subjects, ≤ 14 shots, 30 s" no longer holds: the owner asked for every product.
The v2 lesson is kept through tiers instead: two long cases, two full AI cases, one fast montage,
one grouped frame, never a flight.

## 2. Look

- A noir office at night: back wall with a window of venetian blinds, rain between the window and
  a street lamp outside, a desk silhouetted against it. The street light is a real shadow-casting
  spot, so the slats fall across the desk, the papers and the phone.
- **The world is black and white; the work is the only colour.** Screens use a `sat` uniform that
  eases 0 → 1 when a case opens, and a coloured spill light takes the work's colour onto the desk.
- Grade: contrast curve, halftone dots in the deepest shadows only, grain at 24 fps, vignette.
- Type: noir comic caption boxes (bone `#eee9dd`, 3 px ink border, hard shadow): Courier Prime
  kicker, Playfair Display headline, Noto Serif JP for 或る男. One box at a time, wiped open in
  0.3 s, held still, gone in 0.18 s.

## 3. The grid

70.00 BPM (fitted on spectral flux, 20–170 s). Beat 0.857 s, bar 3.429 s. Kicks land on beat
index ≡ 2 (mod 4) of the track, so bars start at 1.934 + 3.4286·k s. The reel takes the track from
**29.363 s** (bar k = 8): one bar without hats, the groove on reel bar 1, a one-bar stop at reel
27.43–30.86 s (track 56.79–60.22), the kick back on bar 9. Fade in 0.5 s, fade out the last 1.05 s.

## 4. Shot table (G2)

Beats are reel beats (×0.857 s). Texel ratio = projected screen px ÷ source px, max over the shot
(must be ≤ 1.1). Filled from `window.texels()` after a 0.1 s probe of the whole reel.

| # | Beats | Time (s) | Hold | Shot | Source → screen |
|---|---|---|---|---|---|
| 1 | 0–4 | 0.00–3.43 | 3.43 | Office, blinds, rain; slow push | no work on screen |
| 2 | 4–7 | 3.43–6.00 | 2.57 | terra: publishing-machine photo pinned on the wall, colour bleeds in | see §5 |
| 3 | 7–12 | 6.00–10.29 | 4.29 | terra: front page spins in (0.85 s), holds "12× ORGANIC GROWTH" | canvas 1500×1900 |
| 4 | 12–16 | 10.29–13.71 | 3.43 | Nhà Mình: laptop on the desk, the split-view screen in colour | 2880×1800 |
| 5 | 16–20 | 13.71–17.14 | 3.43 | Nhà Mình: the phone flat on the desk under the slats | 780×1688 |
| 6–9 | 20–24 | 17.14–20.57 | 0.86 each | Video & brand: ARISAQUA silhouette, MR. BROWN drink, ARISAQUA close-up, MR. BROWN cheers, full frame | 1920×1080 at 1:1 |
| 10–13 | 24–32 | 20.57–27.43 | 1.71 each | Aru Otoko in a dark screening room: skyline, vending, close-up, burning | 1376×768 |
| 14 | 32–36 | 27.43–30.86 | 3.43 | Bóng Vespera in the silence: the gate at dawn on a dark wall, colour comes in | 1664×2496 |
| 15 | 36–38 | 30.86–32.57 | 1.71 | Bóng: the path of guardians, on the kick | 1664×2496 |
| 16 | 38–40 | 32.57–34.29 | 1.71 | Bóng: the motion clip | 600×828 |
| 17 | 40–44 | 34.29–37.71 | 3.43 | The other files, top-down on the desk: Vitalité, PATI, IELTS Studio, UpHub, Badminton Club | ≤ 2880 wide |
| 18 | 44–end | 37.71–41.15 | 3.44 | Portrait in black and white under blind shadows | 1100×1375 |

18 shots. Every cut is on a beat; every move spans its whole shot with an in-out ease.

Measured max texel ratio over the whole reel (0.1 s probe plus every shot's first and last frame):
terra photo 0.83 · newspaper 0.52 · Nhà Mình laptop 0.46 · phone 0.62 · footage 1.00 · Aru film 0.98 ·
Bóng keyframe 0.70 · Bóng motion 0.97 · desk files 0.13–0.30 · portrait 0.60. Nothing above 1.1.
Flash audit on the animatic: 0 opposing pairs (limit 3).

## 5. Text (hold rule: ≥ 0.6 s + 0.3 s per word, headlines ≥ 2 s)

| On | Off | Text | Words | Needs | Has |
|---|---|---|---|---|---|
| 0.30 | 3.20 | Ideas into actual things. (typed by 1.53) | 4 | 1.8 | 1.67 complete, 2.9 total |
| 3.63 | 5.75 | Case 01 / terra | 3 | 2.0 | 2.12 |
| 10.54 | 13.46 | Case 02 · family care, solo build / Nhà Mình | 7 | 2.7 | 2.92 |
| 14.01 | 16.89 | A little closer. Even from afar. | 6 | 2.4 | 2.88 |
| 17.29 | 20.37 | Case 03 · Video & brand / Two-time Top 1 TVC | 8 | 3.0 | 3.08 |
| 20.87 | 23.80 | Case 04 · AI film / Aru Otoko 或る男 | 7 | 2.7 | 2.93 |
| 27.83 | 30.61 | Case 05 · art direction & motion / Bóng Vespera | 7 | 2.7 | 2.78 |
| 38.06 | 40.80 | Hi, I'm Thanh. / Call me Tatsuki. / jak3rpham.github.io | 7 | 2.7 | 2.74 |

All copy is from the site (the Nhà Mình line is the homepage headline). The newspaper's stats are
the terra figures v2 already used.

## 6. Deviations from the brief, stated

- Video & brand clips hold one beat (0.86 s), under the 1.5 s floor: the owner asked for it fast.
  They are full frame at 1:1, no zoom, subtitle-free, and carry one caption box.
- The newspaper and the five folder tabs put more than one piece of text on screen at once. They are
  props, sized to read (≥ ~20 px on screen); the caption boxes still come one at a time.
- 41 s and 18 shots instead of 30 s and ≤ 14, per §1.

## 7. Gates

1. G1 music: done (track chosen by the owner; grid in §3).
2. G2 shot table: §4 and §5, shown to him with the animatic.
3. G3 animatic: `node render.mjs --page reel3.html --serve --to 41.15 --fps 30 --sub 1 --out out/reel3-animatic-video.mp4`,
   muxed with `out/score3.wav`. Waiting for his OK.
4. G4 final: `--to 41.15` at 60 fps × 4, then `finish.mjs --video reel3-video.mp4 --score score3.wav --name tatsuki-reel-2026-30s-v3`
   (the brief's name; the reel is now 41 s, rename if he prefers), `audit.mjs`, loudness check.

---

## 8. Round 2 (2026-09-29): two versions after the owner's feedback on animatic 1

Feedback on `out/reel3-animatic.mp4`: the music mutes midway; every scene needs a background (no
black-only frames); far more motion and motion graphics, "elements appearing and stacking", clues
spread on a board; Video & brand as many videos at once (grid, film strip); terra too plain; add the
**terra logo**; the AI films need real video, not stills; the ending was weak. He loved the intro.
He then asked for a real 3D space with a moving camera (chose "B · one room, every corner a case"),
and before sleeping asked for **two clearly different versions** as 30 fps animatics.

Shared changes:
- Music: the silent bar (track 56.79–60.22) is cut out with a 20 ms crossfade; the grid is unchanged
  and the groove never stops. `out/score3.wav`.
- Footage: his Aru Otoko MV (`erqSvIsXUpI`, 1912×1080) and 11 raw generations (850×480) downloaded
  with his approval into `showreel/footage/aru/`; nine filmed works cut to 2.4 s grid clips at 960 px;
  the Bóng multi-frame motion (watermark cropped); the Nhà Mình dual-screen UI clip. All in `prep.mjs --set v3`.
- The terra logo is rebuilt in 3D from `components/WebGLLogo3D.tsx` (same geometry, mirrored like the site).
- Intro unchanged in both.

**Version 1 · "The room"** (`reel3.html/js`, `out/reel3-room-animatic.mp4`): one detective office in
3D. The camera runs a continuous Catmull-Rom path per shot. Evidence board on the left wall (terra:
3D logo, landing pages, social posts, red-marker chart, the "12×" front page slammed on top, stat
notes counting up), the desk (Nhà Mình UI video on the laptop, polaroids landing, the phone top-down),
a projector corner (nine works on a 3×3 projected grid, a film strip scrolling through the foreground),
a stack of seven CRTs (the MV and six raw generations), a drying line of prints (Bóng keyframes, two
of which start moving), the other five cases landing as folders on the desk, and a crane from above
the room down to the portrait pinned where every red string ends. One whip-pan (intro → board).

**Version 2 · "The noir comic"** (`reel3b.html/js`, `out/reel3-comic-animatic.mp4`): the intro room
is rendered into a texture; at beat 3.65 the camera pulls back and the room turns out to be panel one
of a 30 m comic page printed in ink (world-space halftone shader, never flat black). Each case is a
cluster of panels that land on the beat, over the case's own image printed as coarse halftone:
terra (logo panel, pages, posts, an inked growth chart, the "12×" headline with a speed-line burst,
counting stats), Nhà Mình (UI video, phones, screens), Video & brand (an irregular grid of nine
works plus two film strips crossing it), Aru Otoko (widescreen panels stacked down the page, the
camera craning down, 或る男 lettered in the gutter), Bóng Vespera (five tall panels, two come alive),
the other cases as labelled panels, then a pull-back over the whole page and a push onto the portrait.

Rule notes for both: the brief's "no camera flights" is relaxed at the owner's request for motion;
moves stay eased and continuous, the one whip-pan is v1's. Texel guard skips the halftone ink art in
v2 (it is re-screened at output resolution, so it cannot look pixelated). One-beat holds exist on the
landing panels by design; every caption still meets the hold rule.

## 9. Round 3 (2026-09-29): the comic version is the one

The owner picked **v2 · the noir comic**. Changes: his face is gone from the ending (it felt out of
place); the pull-back over the whole page is gone (it only showed "a long layout of what we just
saw"); **Vitalité is promoted to its own case** ("case 06 · fashion e-commerce", beats 40–46): the
0823 campaign sequence runs down its concrete corridor to the wordmark wall as the hero panel, four
lookbook shots pasted round it, a tee panel cycling all 18 prints at 8 fps, a pink graffiti swash.
PATI, IELTS Studio, UpHub and Badminton Club land in beats 46–48. The last panel on the page is the
office again: the camera goes in through it and the reel ends at the window, typed
"Hi, I'm Thanh. Call me Tatsuki." + url. Length is now 13 bars, **44.58 s**; the score is
`out/score3b.wav` (same cut, run 3.4 s longer). Max texel ratio 1.05, flash audit clean, every caption
2.65–2.97 s. Animatic: `out/reel3-comic-animatic.mp4` (review copy `-review.mp4`).

## 10. Final (2026-09-29)

Approved. Rendered at 60 fps × 4 sub-frames (43 min): `showreel/out/tatsuki-reel-2026-noir.mp4`,
2671 frames, 44.58 s, 48 kHz, −14.5 LUFS integrated, −2.1 dBTP, flash audit 0 pairs. Sound: 33 real
effects from Pixabay layered on the beat grid, ducking the music (`noir-comic/sfx.mjs`, `score.mjs`).
The reel now lives in its own folder, `showreel/noir-comic/`, with a README for extending it.

On the site (not committed yet): the homepage hero plays a caption-free 35 s loop of the reel behind
the headline instead of the 3D `Assembly` (kept, not deleted); "Watch the reel · 0:45" opens the full
cut; `/video` shows it after its hero. AV1 files with H.264 fallbacks in `public/videos/reel/` (63 MB).
`scripts/check-homepage.mjs` updated and passing at 1440 and 390 px and with reduced motion.
