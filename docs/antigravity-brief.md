# Asset brief for Antigravity

Everything in this file is a request for generated assets. Nothing here needs code, and no
knowledge of the site is assumed. Read this file on its own; the engineering that consumes the
output lives in `scroll-sequence.md` and is not your problem.

## What this is for

A personal portfolio site for **Pham Ngoc Thanh (Tatsuki)**: growth and technical marketing,
product builds, AI orchestration, video. The site alternates between a near-black state and a
paper-white state as the reader scrolls, with one accent colour carried through both.

The assets requested here become **scroll-driven sequences**: the reader scrubs through the
frames with the scroll wheel, forwards and backwards, at their own speed.

## The palette, which is not negotiable

| Role | Value |
| --- | --- |
| Near black ground | `#0D0F0D` |
| Off white | `#F1F3EA` |
| Accent, the only saturated colour | `#14796C` |

No other saturated colour anywhere in the frame. This is the whole visual identity of the site
and an asset that introduces a fourth colour cannot be used.

---

## Deliverable 1: "The builder, resolving" — priority

For the opening screen. If only one asset gets made, make this one.

### Step 1a: one still image

```
Subject:      a single figure at a desk seen from three quarters behind, lit by the screen
              in front of them, with faint floating fragments around the workspace: chart
              lines, geometric UI shapes, code glyphs, reading as debris orbiting the work
              rather than as legible interface
State:        the figure and the debris are partly dissolved into fine particles, caught
              mid assembly, as though the image is still resolving into being
Composition:  figure occupies the left third; large empty margin on the right
Camera:       locked off, eye level, 50mm, no lens distortion, no vignette
Lighting:     single cool key from the screen, warm rim from behind, deep falloff to black
Background:   near black, flat, no texture
Palette:      #0D0F0D near black, #F1F3EA off white, #14796C accent, nothing else saturated
Aspect:       16:9
Resolution:   2560x1440 minimum
Format:       PNG, no compression artefacts
Negative:     text, logos, watermarks, film grain, chromatic aberration, motion blur,
              readable UI, brand marks, facial detail
```

**No facial detail.** A generated face that is nearly the person is worse than no face at all.
A silhouette or a back-of-head shot is the intended result.

### Step 1b: turn that still into motion

One continuous shot, **4 to 6 seconds, no cuts**. The particles gather and the figure resolves
from dissolved to solid, with a slow push in. It should end somewhere it could plausibly have
started, because the reader will scrub backwards through it.

---

## Deliverable 2: "The system drawing itself"

For the section about the internal tooling built at a previous role. Second priority.

### Step 2a: one still image

```
Subject:      an isometric node and edge diagram, four parallel tracks running left to right,
              each track made of a small input block, a processing hub, and an output block,
              connected by thin edges
State:        mid construction: some edges drawn only part of the way, some nodes still
              forming out of particles
Composition:  centred, generous empty margin on all four sides
Camera:       locked off isometric, no perspective drift
Lighting:     flat, with the edges self illuminated
Background:   near black, flat
Palette:      #0D0F0D, #F1F3EA, #14796C, nothing else saturated
Aspect:       16:9
Resolution:   2560x1440 minimum
Format:       PNG
Negative:     text, labels, callouts, logos, watermarks, grain, blur, perspective
```

**No labels or text of any kind.** Words baked into the image cannot survive the responsive
scaling and would not be readable to a screen reader. The labels are added as real text over
the top afterwards.

### Step 2b: turn that still into motion

One continuous shot, **4 to 6 seconds, no cuts**. The diagram builds itself from left to right:
edges draw, nodes settle, the four tracks complete. Same rule, it must scrub backwards without
looking broken.

---

## Three rules that decide whether the output is usable

**1. One still first, then motion. Never generate the frames directly.**
Video models hold a scene coherent for roughly five seconds before it drifts. Generating a
sequence directly produces frames that do not match each other, which is a failure already
documented on this site. Lock the image, then animate it.

**2. No film grain, no motion blur, no chromatic aberration.**
All three are noise. Noise survives into every single frame, and the sequence gets cut into
150 of them, so it multiplies the size of the delivered asset by three or four times for an
effect nobody can see while scrubbing.

**3. No cuts, flashes, or hard direction changes in the motion.**
The reader controls the playhead and will drag it backwards. Anything discontinuous reads as a
glitch rather than as an edit.

## What to deliver

For each item:

- the source still, PNG, at full resolution
- the motion clip, MP4, at the source resolution and the highest quality setting available

Name them plainly:

```
builder-still.png     builder-motion.mp4
systems-still.png     systems-motion.mp4
```

Do not resize, compress, trim, or convert anything. Those are all downstream steps with their
own constraints, and doing them early only loses information.
