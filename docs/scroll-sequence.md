# Scroll sequences: AI image to scrubbed frames

How to produce a new scroll-driven image sequence for this site, from an Antigravity image
request through to frames the existing components can play.

The site already runs one of these: the `ある男` walk set piece on `/aru-otoko`, four sequences
of 151 frames each, 7.6 MB total. Everything below matches how that one is built, so a new
sequence drops into the same machinery with no new code.

---

## 0. Where a sequence earns its place

A scroll sequence costs 1.5 to 2.5 MB and a pinned screen of scroll. It is worth it when the
thing being shown **changes over time** and a still cannot carry it. It is not worth it as
decoration.

Ranked by how much they would gain on the homepage:

| Spot | What the sequence would show | Verdict |
| --- | --- | --- |
| Hero | The mark or a portrait resolving out of noise as you enter | Strong. It is the one screen everybody sees, and it currently has no motion beyond the drifting ground. |
| `#systems` | The four pipelines drawing themselves, input to output | Strong. It is the most abstract section and the hardest to read as a still. |
| Between `#terra` and the case studies | A dark-to-light hand off with real imagery inside it | Medium. The theme flow already covers this moment. |
| `#about` lanes | Anything | Skip. It is a list; motion would fight the reading. |

Pick one. Two sequences on the homepage is 5 MB before any other asset loads.

---

## 1. Request the source image from Antigravity

Ask for **one still**, not a sequence. The motion is added afterwards, which keeps the image
consistent frame to frame. Generating frames directly is what caused the coherence failure
documented in the Bóng Vespera case study.

The brief needs to carry the constraints the pipeline imposes, not just the subject:

```
Subject:      [what is in the frame]
Composition:  centred subject, generous empty margin on all four sides, nothing important
              within 12% of any edge (the frame gets cropped and scaled at several breakpoints)
Camera:       locked off, no lens distortion, no vignette
Lighting:     single key, soft falloff, no hard specular highlights
Background:   flat or very soft gradient, no busy texture
              (busy backgrounds cost 3 to 4x the file size once cut into frames)
Palette:      near-black #0D0F0D ground, off-white #F1F3EA, one accent #14796C
              no other saturated colour
Aspect:       16:9
Resolution:   2560x1440 minimum
Format:       PNG, no compression artefacts
Negative:     text, logos, watermarks, film grain, chromatic aberration, motion blur
```

Grain and blur are excluded on purpose: both are noise, both survive into every frame, and both
multiply the encoded size of the whole sequence.

## 2. Turn the still into motion

One shot, 4 to 6 seconds, no cuts. The motion has to be **continuous and loopable in feel**,
because the reader controls the playhead with the scroll wheel and will scrub backwards.

Good motions for this: a slow push in, a parallax drift across depth layers, a subject turning
once, an element assembling. Bad motions: anything with a cut, a flash, or a hard direction
change, because scrubbing backwards over it reads as a glitch.

Keep the output at the source resolution and the highest quality the tool offers. This file is
an intermediate, not a deliverable.

## 3. Cut the video into frames

```bash
ffmpeg -i motion.mp4 -vf "fps=30,scale=1600:-2:flags=lanczos" -c:v libwebp -q:v 72 -compression_level 6 -loop 0 frames/%04d.webp
```

- **`fps=30`** on a 5 second clip gives 150 frames, which is what the existing sequence uses.
  Below about 24 the scrub feels steppy; above 30 the file size grows for motion nobody can
  resolve while scrubbing.
- **`scale=1600`** is the display width to target. The stage is never full bleed, and 1600
  covers a 2x retina render of the box it sits in.
- **`%04d`** matches the `pad = 4` default, giving `0001.webp` through `0150.webp`.
- **`-q:v 72`** lands around 12 KB a frame on a clean background. Check the total before
  committing.

Verify the count and the weight:

```bash
ls frames | wc -l && du -sh frames
```

**Budget: 2.5 MB for the whole directory.** If it is over, in this order: drop to `fps=24`,
lower `-q:v` to 65, then reduce `scale` to 1280. Do not cut frames by trimming the clip; the
motion needs its full arc.

## 4. Place the frames

```
public/images/<route>/frames/<name>/0001.webp
```

Add a poster still as well, at the same aspect, for the fallback path:

```
public/images/<route>/<name>-still.webp
```

## 5. Wire it up

One sequence:

```tsx
<FrameScrub
  dir="/images/home/frames/hero"
  count={150}
  fallback="/images/home/hero-still.webp"
  alt="..."
  heightVh={200}
/>
```

Several sequences sharing one pinned stage and one scroll progress:

```tsx
<MultiScrub
  layers={[
    { dir: "…/hero", count: 150, fallback: "…", alt: "…" },
    { dir: "…/inset", count: 150, fallback: "…", alt: "…", wrapClass: "absolute …", minWidth: 900 },
  ]}
  heightVh={320}
  heightVhMobile={130}
/>
```

`heightVh` is the scrollable track. Lower means fewer vh per frame, so the sequence races. A
150 frame sequence wants roughly 200 to 260; a short one wants a taller track. Tune it by feel
once it is in place.

Companion layers should carry `minWidth` so phones load the still instead of a second frame
set.

## 6. Before it ships

- [ ] Directory total under 2.5 MB
- [ ] Frame count matches the `count` prop exactly; a mismatch shows a blank canvas at the end
- [ ] Fallback still exists and is the same aspect as the frames
- [ ] `prefers-reduced-motion` shows the still and fetches nothing (both components already do
      this; confirm it after wiring)
- [ ] Scrub backwards through the whole sequence and watch for a direction change that reads as
      a glitch
- [ ] Check on a phone: the pinned stage should not exceed the viewport height

## Gotchas already paid for

- **Do not drive the frame from a `scroll` event.** The site runs Lenis, which does not emit a
  native window scroll event for its own programmatic scrolls, so the sequence freezes on frame
  one, worst on mobile. Both components read `getBoundingClientRect` inside an
  IntersectionObserver-gated rAF loop instead. Same reason the nav rails avoid
  IntersectionObserver for their active state.
- **Zero pad to the width you declare.** `pad` defaults to 4. `ffmpeg`'s `%d` without a width
  will produce `1.webp` and the loader will 404 every frame.
- **The fallback is not optional.** It is what a reduced-motion reader, a failed fetch, and the
  first paint all show.
