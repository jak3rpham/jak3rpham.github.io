# ある男 — AI music video case study

Route: `/aru-otoko` · Status: **built**, uncommitted, awaiting YouTube ids + a copy review

Built 2026-07-17. Typecheck, lint and 20 tests pass; `/aru-otoko` prerenders static. Every
video slot is a labelled placeholder until the ids land — no code change needed to fill them.

**Not committed.** Tatsuki deploys in batches and reviews before pushing; that stands.

---

## 1 · What this page sells

**Thesis: the model cannot hear the song.**

Generative video models have no concept of time. They emit fixed 5s chunks, they do not count
beats, and they lose coherence after roughly 5–6 seconds. Timing is not generated — it is
imposed, later, at the edit. The page is an account of imposing it.

### Why not the obvious framing

The handover doc pitched this as an orchestration story: one person routing a brief across
Gemini → Nano-Banana → Seedance → CapCut, with "The Pipeline" as the headline section.

That framing is already taken. `/bong-vespera` is a case study about orchestrating four AI
models, with a "model selection by task" section and a learnings list whose third entry is
literally "Process over output". A second page making the same argument in the same shape does
not add a second proof — it dilutes the first, and a reader hits it thinking "this again".

So the axis moved from **tooling** to **time**. Time is what bóng cannot claim: it is built
from static frame pairs and has no temporal dimension at all. Beat-sync is native here and
nowhere else.

### Why comic is the right skin, and why that is not decoration

In comics the gutter *is* time — the white space between panels is where duration happens.
Comics are the medium invented to encode time in still frames. That is the exact problem the
model failed at. So the page borrows the medium that solved it: **gutter rhythm carries the
beat grid**, panel width tracks shot duration.

This also resolves the quality problem honestly. The video is, by its author's own assessment,
fine and not something he is proud of — it stopped because it burned credits, not because it
was finished. Under this framing the page is not selling the video. **The page is the artifact;
the MV is the material.** The craft on display is the craft of the page.

### Claim accuracy — non-negotiable

Use *orchestrated*, *AI-directed*, *prototyped*. Never *developed*, *engineered*, or *produced*
in the professional-video-production sense. Confident about process, honestly modest about
output. Nothing on the page may imply the MV is a finished commercial piece.

---

## 2 · Spine

| # | Section | Carries |
|---|---|---|
| 1 | **Hero** | `ある男` in Noto Serif JP, YouTube embed, thesis line: *"The model cannot hear the song."* |
| 2 | **33 seconds** | The beat grid as an artifact: 33s, 110.5 BPM, 16 downbeats, 8 shots. States the problem. |
| 3 | **S00 · The Walk** | The scrub set piece. Scroll drives his footfalls onto downbeats. |
| 4 | **The Panels** | 8 shots as comic panels on gutter rhythm. Keyframe + raw gen + prompt. |
| 5 | **The Pipeline** | Demoted from #2. Weavy canvas, tool chain. Kept short — bóng owns this. |
| 6 | **Vertical** | The 9:16 cut, its own section. |
| 7 | **The Reels** | Him talking through the orchestration. Strongest first-person evidence. |
| 8 | **What I learned** | Time lessons lead. |

**The Walk sits at #3 deliberately** — the argument gets made physically before the reader
tires, and it is the page's second-read moment.

**Panel width ∝ `editDur`.** S08 is 2.5s so its panel is visibly narrow: the reader sees the
track end unresolved without being told.

---

## 3 · Architecture

```
app/aru-otoko/page.tsx          route, metadata, palette override
lib/aruData.ts                  beat grid, shots, prompts, learnings
lib/aruData.test.ts
components/aru/AruHero.tsx
components/aru/AruThirtyThree.tsx
components/aru/AruWalk.tsx
components/aru/AruPanels.tsx
components/aru/AruPipeline.tsx
components/aru/AruVertical.tsx
components/aru/AruReels.tsx
components/aru/AruLearnings.tsx
components/FrameScrub.tsx       new · reusable
components/Halftone.tsx         new · reusable
components/HalftoneCityBackdrop.tsx   new · the WebGL variant
```

Reused untouched: `Reveal`, `Footer`, `VideoLightbox`, `lib/motion`, `SmoothScroll`.

**`SceneBackdrop` routing.** Today it is a thin pass-through: every variant delegates to
`WaveFieldBackdrop`. Aru is not a wave variant — it is a different scene. So `SceneBackdrop`
becomes a real switch:

```tsx
export type BackdropVariant = "home" | "terra" | "video" | "bong" | "aru";

export function SceneBackdrop({ className, variant = "home" }) {
  if (variant === "aru") return <HalftoneCityBackdrop className={className} />;
  return <WaveFieldBackdrop className={className} variant={variant} />;
}
```

`"aru"` joins the union so callers stay uniform, but it must **not** reach
`WaveFieldBackdrop`. That component does `VARIANTS[variant] ?? VARIANTS.home`
(`WaveFieldBackdrop.tsx:97`), so an unknown variant does not throw — it silently renders
**home's green waves**. Miss the switch branch and the aru page gets the homepage backdrop
with no type error and no console warning. The switch is the only thing preventing that.

### Two things must not look like bóng

Flagged by Tatsuki, and he was right — both would have leaked visible sameness:

1. **Backdrop.** Bóng uses `WaveFieldBackdrop` with an ember variant. Reusing the wave field
   with a new colour would read as siblings on sight. Aru gets its own WebGL scene entirely
   (§5), not a wave variant.
2. **Section headers.** Bóng uses a rule line + `01 / Pipeline` numeral. Aru's markers are
   comic panel tabs. Numbering is legitimate here — the shots genuinely are an ordered
   sequence locked to a music timeline, not decorative counting.

### Data, not JSX

```ts
export const TRACK = { seconds: 33, bpm: 110.5, hit: 32.7 };
export const DOWNBEATS = [0, 2.2, 4.4, 6.5, 8.7, 10.9, 13.1, 15.3,
                          17.5, 19.6, 21.8, 24.0, 26.2, 28.4, 30.5, 32.7];

export type Shot = {
  id: string;
  in: number;
  editDur: number;
  genDur: 5;          // always 5. the type states the thesis.
  title: string;
  note?: string;
  still: string;
  youtube?: string;   // raw gen, click-to-load
  imgPrompt: string;
  motPrompt: string;
};
```

The prompts are long; inlining them in JSX makes the components unreadable. Layout derives
from `editDur` rather than hardcoded widths, so timing corrections propagate.

`genDur` fixed at 5 while `editDur` ranges 2.5→4.4 **is the argument, encoded in the type.**
Panels surface both numbers.

### Tests

Following the repo's convention of testing logic, not components:

- every `shot.in` lands on a downbeat — catches beat drift at build time, not by eye
- shot timings terminate at 32.7
- panel layout math: S08 (2.5s) is narrower than S01 (4.4s)

---

## 4 · The Walk (scrub set piece)

`FrameScrub` — canvas image sequence, GSAP ScrollTrigger, pinned. Props: `dir`, `count`,
`aspect`. Nothing aru-specific; reusable.

**Why S00 and only S00.** Walking is rhythm made physical; the footfalls land on downbeats,
so scrolling *is* keeping time. It opens the MV, and B4 (shoes) closes the same motif.

**Why not a second one.** S07 was considered. One set piece is a set piece; two is an effect.
S07 also argues against itself — the shot is about a face holding still while the city blurs;
scrubbing it does the opposite of what it depicts.

**Budget: ~70 frames, 960px, q72, ~5MB, lazy-loaded.** Scrubbing the full 33s would need ~400
frames ≈ 40MB. Not shippable, and halftone art compresses badly — high-frequency dots are
the worst case for webp. Rejected.

Fallbacks: no frames → static `stills/s00-walking-legs.webp`. `prefers-reduced-motion` → no
scrub, static frame.

---

## 5 · Backdrop — WebGL halftone city

**Spider-Verse's actual technique is 3D geometry rendered through a ben-day shader.** Halftone
is a rendering method, not an overlay. So the backdrop is a raymarched city put through a
halftone shader — using the method, not imitating the look.

It also enacts the MV's own stated thesis: *the character is the anchor; the city is always
rushing.* Scroll rushes the city; the panels never move.

Composition:
- buildings on a hashed grid with setbacks, roof tanks, antenna masts
- traffic in two counter-running lanes, emissive, glow accumulated along the march
- streetlights, vertical shop signs, overhead wires
- wet asphalt: a second reflection march, ripple-perturbed
- facade detail (floor slabs, mullions, recessed panes) done **in shading only** — zero march cost
- distant skyline: **analytic, never marched**

Halftone screens each channel at its own angle (15°/45°/75°), which is real CMYK practice.
Chromatic fringing falls out of that for free rather than being faked on top — and the STYLE
BLOCK asked for subtle chromatic aberration anyway.

Locked settings (see the asset README). `exp=1.8` is measured, not eyeballed: ben-day gaps
swallow ~58% of the light, and 1.8 returns the mean to the un-halftoned 28.9/255.

### Three bugs found and fixed

Every one of them fails *silently* — a blank or wrong backdrop with nothing in the console.
That is what makes them worth writing down.

1. **The canvas can never get sized** — found twice, because the first fix was wrong.

   Sizing off `innerWidth` at mount breaks when the canvas mounts into a container that is
   not laid out yet: it measures zero and no resize event ever follows. First fix was a
   `ResizeObserver` on the element plus a zero-guard.

   That was not enough. RO delivery rides the rendering lifecycle and **does not fire at all
   while a tab is hidden** — and in that same state `innerWidth` reads 0, so the synchronous
   first call legitimately measures nothing too. Both failing together pins the canvas at its
   300×150 default forever. Real fix: retry on rAF until the element reports a real size, so
   the backdrop does not depend on RO firing in order to exist.

2. **Skyline stamped over the road.** Fog mixed geometry toward a sky value that already had
   silhouettes painted into it, so the far skyline printed itself onto the road and the near
   buildings. Fixed by splitting `skyHaze()` (fog target, no silhouettes) from `sky()`
   (composited only where the ray hit nothing). Verified by toggling `uSky` and asserting
   **zero** changed pixels in the road band — with halftone off, since the dot grid masks the
   diff and hands back a flattering number.

3. **`loseContext()` in cleanup vs StrictMode.** Dev runs effects mount→cleanup→mount, and
   `getContext()` hands back the *same*, now-dead context on the second mount: shaders fail to
   compile and the backdrop never appears — in dev only, which is exactly where it would go
   unnoticed. Removed; the context is collected with the canvas anyway.

### Performance

Measured on RX 5500M, pessimistic (includes readPixels sync): 720p ~108fps · 1080p ~75fps ·
1440p ~57fps. The reflection bounce costs only **7%** — an early assumption that it was the
expensive part was wrong; the cost is the 84-step main march, and it scales with pixel count.

A recruiter on an Intel iGPU or a phone will not get these numbers. Mitigation: reduced render
scale on weak GPUs, static fallback on mobile and under `prefers-reduced-motion`.

---

## 6 · Assets

Full manifest: `public/images/aru-otoko/README.md`.

**webp only in the repo.** All clips live on YouTube — the finals and the nine raw 5s gens.
Nine inline iframes would be ruinous, so panels use the existing thumbnail → click → lightbox
pattern (`VideoLightbox` + `ytThumb`), which loads no iframe until clicked.

Every slot renders a labelled placeholder when its file is missing, so the page can be built
and reviewed before the assets land.

---

## 7 · What I learned — edited

Ten flat items means none of them land. The three about time lead, because they are what
bóng-vespera cannot say:

1. **Prompts cannot set BPM.** The model generates fixed chunks and does not count. Beat-sync
   is an edit-stage problem — cutting on the grid, speed-ramping to 110.5.
2. **Shot length is decided by the music, not the prompt.** Generation is always 5s. The 8.7s
   intro had to split at a downbeat because coherence dies after ~5–6s.
3. **Last-frame chaining only works when consecutive shots share a setting.** S03→S04 was
   planned as a chain and abandoned: S03 is legs-only, so it makes a poor first frame for S04.
   S04 became an independent gen; the transition became CapCut's problem.

Second tier — real, but adjacent to bóng's territory: camera angle must open the prompt
("seen from behind" mid-sentence gets ignored); a front-facing face reference drags
three-quarter and profile shots back toward the camera.

**Reframed, not cut:** character consistency. Bóng covers consistency, but not *across time* —
holding one person together over 8 shots is a different problem from matching a frame pair.
That temporal angle stays.

**Compressed to one line each:** abstract words causing errors (≈ bóng's vocabulary lesson);
approve cheap stills before expensive video (≈ bóng's credit conservation).

**Cut:** "group node ≠ merged input". Tool trivia, the weakest item, earns nothing.

Framing: this is not a bug list. It is a map of a current AI pipeline's limits, drawn by
touching every one of them. That is a capability, not a weakness.

---

## 8 · Integration

- `app/page.tsx` — a teaser card, following `TerraTeaser` / `BongTeaser` / `VideoTeaser`
- `app/video/page.tsx` — the MV joins `MusicWall`, linking through to the case study

Backlog note: the handover listed About→past-tense and the open-to-work status as pending.
**Both already shipped** (commit `3ab9530`); `About.tsx` reads "Sep 2024 to Jun 2026" and
`Contact.tsx` carries "Open to full-time & freelance". Do not redo.

Deploy in one batch, and only when Tatsuki says so. Do not commit or push on his behalf —
this doc included.

---

## 9 · Quality floor

Silent, not advertised: responsive to mobile, visible keyboard focus, `prefers-reduced-motion`
honoured (backdrop static, scrub static, panels unpinned), panels readable without JS.

---

## 10 · Open — decisions deliberately left to Tatsuki

These were not decided while he was away, because they are his to make. Each is in its
default state, not a guess:

1. **"The character is me."** The workflow canvas shows the face anchors are three phone
   photos of Tatsuki (`IMG_5278/5279/5280.jpg`). That is a stronger beat than "detailed
   wardrobe canon in text" and it sharpens learning 四 — image anchors image, and the
   image is his own face. **Not on the page.** Putting his face into the story is his call.
2. **His personal photos ship publicly.** The canvas screenshot renders those three photos
   legibly at 2000px, filenames included. Probably fine — his face is on the About page —
   but it should be a decision, not a leak. Options: leave, blur that node, crop it out.
   **Currently: left as-is.**
3. **Copy.** §1 and §7 are unreviewed. The tagline *"The model cannot hear the song."* and
   *"the page is the artifact; the MV is the material"* are both mine, not his — the second
   is my paraphrase of something he said and may misrepresent him.
4. **Featured slot on the video page.** `ある男` sits in the music grid, not the hero cover.
   Promoting an AI prototype above a theme song with 800+ participants reorders what the
   portfolio leads with. **Left in the grid.**

Still needed from him:

- YouTube ids — 3 finals + 9 raw gens. He is sending full links to be sorted here.
- `frames/s00/0001–0070.webp` for the scrub. Until they exist, `FrameScrub` probes frame 1,
  finds nothing, and stays on the static still — no 404 storm, no layout shift.

### Corrections the source material forced

- **Assets are 1376×768 (ar 1.792), not 16:9.** The manifest's original "export at 1600×900"
  would have upscaled — inventing detail — and distorted the aspect. They ship native.
- **S00 has no timeline slot.** It is an asset composited as its own panel. An earlier draft
  of `aruData` gave it `in: 0, editDur: 4.4`, duplicating S01 — a fabricated position on a
  grid this page's entire argument claims is real. It is now `ASSET_S00`, and a test asserts
  it never appears in `SHOTS`.
- **Model names.** The canvas says *Gemini 3.1 Flash (Nano Banana 2)* and *Seedance V1.0*;
  the handover only said "Nano-Banana"/"Seedance".
- **Face refs exist.** The handover's learnings 1 and 5 depend on them and are therefore
  real, which the asset drop alone did not show — the canvas did.
