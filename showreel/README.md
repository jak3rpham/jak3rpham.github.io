# Reel 2026

A 20-second, 1920×1080, 60 fps showreel that is code-rendered from the portfolio's own work and palettes.

| Time | Chapter | Palette | Transition out |
|---|---|---|---|
| 0.0 – 2.0 | Hero, "Ideas into actual things." | ink / lime | the site's hero scale-and-radius, then a whip up |
| 2.0 – 5.5 | terra | sage / forest / lime | the chart's head swells into a peach iris |
| 5.5 – 8.0 | Nhà Mình | peach / terracotta | zoom through the heart |
| 8.0 – 10.5 | Vitalité | black / bone / graffiti pink | horizontal shutters |
| 10.5 – 12.0 | IELTS Studio · UpHub · Badminton Club | cream · orange · court green | letterbox closes |
| 12.0 – 15.0 | Aru Otoko | night / gold | burns out to white |
| 15.0 – 17.0 | Bóng Vespera | jade mist / red leaves | palette stripes, one per chapter |
| 17.0 – 20.0 | Sign-off | ink / lime | fade to black, so the reel loops |

The score is synthesised in `music.mjs` (120 BPM, A minor resolving to C). Every hit sits on the
same beat grid as the cuts: one beat is 0.5 s, and a chapter lasts a whole number of beats.

## Render

```bash
node prep.mjs      # extract frames from the footage clips into cache/
node music.mjs     # out/score.wav
node render.mjs    # out/reel-video.mp4 (about 18 min: 4 sub-frames per frame for motion blur)
node finish.mjs    # master, web version and poster
```

`node render.mjs --stills 3.2,8.6` writes single frames to `audit/`. `node render.mjs --fps 30 --sub 1`
renders a fast draft. `reel.html` opens in Chrome as a static preview of frame 0; call `seek(t)` in
the console to scrub.

# Reel 2026 · 30 s, "Execute workflow"

v2 is a Three.js scene, not DOM: one studio floor (a real planar mirror), nine project sets 26 m apart,
and one glowing wire from the **Execute workflow** button through a node per set. The camera flies the
wire; the signal executes each node; the ending cranes out to the whole graph and collapses it into
the portrait. Spec: `docs/superpowers/specs/2026-09-28-showreel-v2-design.md`.

| Time | Set | Transit in |
|---|---|---|
| 0.0 – 2.0 | Prompt: "ideas into actual things", the click at 1.75 | fade from black |
| 2.0 – 5.5 | terra: machine, landing-page deck, social grid, 12× stats | the drop, along the wire |
| 5.5 – 7.0 | PATI: both n8n canvases execute node by node | truck |
| 7.0 – 10.0 | Nhà Mình: shared-care match-cuts to the app, then laptop and phone | truck |
| 10.0 – 13.0 | Vitalité: 0823 sequence, lookbook cuts, tee stop-motion, storefront | truck, whip-pans |
| 13.0 – 14.5 | IELTS Studio · UpHub · Badminton Club slam in on the beat | truck |
| 14.5 – 19.0 | Video & brand: both Top 1 TVCs full frame, then a wall of the filmed work | lands inside a screen |
| 19.0 – 22.5 | Aru Otoko: dive into the Weavy node, ref → frame wipes, scope bars | dive |
| 22.5 – 25.5 | Bóng Vespera: dolly through kf1 → kf5, the motion clip, the poster | fog |
| 25.5 – 27.0 | The whole graph lit (second drop) | crane-out |
| 27.0 – 30.0 | The graph collapses into the portrait; sign-off; black by 29.95 | collapse |

The score is `music2.mjs`: 120 BPM, C major (C G Am F), piano-house stabs on a 3-3-2, a lead hook,
breakdown for Aru, riser into the second drop.

```bash
node prep.mjs --set v2   # footage segments into cache/v2/ (needs showreel/footage/, not in git)
node music2.mjs          # out/score2.wav
node render.mjs --page reel2.html --serve --to 30 --out out/reel2-video.mp4    # ~1 h, 4 sub-frames
node finish.mjs --video reel2-video.mp4 --score score2.wav --name tatsuki-reel-2026-30s --poster 28.6
node audit.mjs out/tatsuki-reel-2026-30s.mp4
```

`--serve` puts the page on a local HTTP server: WebGL will not take textures from `file://`.
`node render.mjs --page reel2.html --serve --stills 4.3,20.8 --prefix v2 --time` writes stills and
timings. `vendor/three` is three.js 0.186.1, unpacked from npm so the site's `package.json` is untouched.
`footage/` holds the owner's own YouTube uploads (downloaded with his approval, not committed).

# Reel 2026 · "The noir comic" (the current reel)

Everything about it lives in `noir-comic/`: see `noir-comic/README.md` for how it is built, how to
render and master it, how the sound is layered, and how to add a case or make it longer. Deliverables:
`out/tatsuki-reel-2026-noir.mp4` (+ `-web.mp4`, `-poster.jpg`); the site copies are in
`public/videos/reel/`. `reel3.*` is the "room" version that was not picked.
