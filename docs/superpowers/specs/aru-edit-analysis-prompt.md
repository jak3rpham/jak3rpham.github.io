# Prompt for Gemini — extract the REAL edit structure of ある男

Paste this with the **final horizontal cut** (the 33s video) attached.

Everything the case study page shows is derived from these numbers, so guessing is worse
than saying "unclear". Where the analysis is unsure, it must say so rather than round to a
tidy number.

---

## PROMPT — copy from here

You are analysing the edit of a 33-second music video. I need the **actual cut structure as
edited**, not a plan and not an idealised grid. A page is being built from your output, so an
invented number is worse than an admitted gap.

Return **JSON only**, no prose around it.

### 1. Audio

- `bpm`: measured tempo (one decimal)
- `downbeats`: array of downbeat timestamps in seconds
- `vocalIn`: when the vocal first enters
- `hits`: any notable accent/hit points
- `confidence`: "high" | "medium" | "low" — how sure are you about the grid

### 2. Cuts — the important part

List **every visible cut**, in order. A cut is any hard change of image, including cuts back
to a shot already used.

For each:
- `index`: 0-based
- `in`: start time, seconds, two decimals
- `out`: end time, seconds, two decimals
- `duration`: out − in
- `landsOnDownbeat`: true/false — is `in` within ±0.08s of a downbeat
- `description`: one short line of what is on screen (e.g. "legs walking, wet pavement,
  knee-down crop")
- `hasFace`: true/false
- `isRepeatOfEarlierCut`: null, or the `index` of the earlier cut it returns to
- `motion`: "static" | "slow" | "brisk" | "fast"

### 3. Distinct source shots

Several cuts may come from the same generated clip. Group them:

- `shotId`: your own label, e.g. "A", "B", "C"
- `description`: what it is
- `cutIndices`: which cuts in section 2 use this source
- `totalScreenTime`: summed seconds
- `appearances`: how many separate times it appears

### 4. Structure

- `totalCuts`
- `averageCutDuration`
- `shortestCut` / `longestCut` (duration + index)
- `cutsOnDownbeat` / `cutsOffDownbeat` (counts)
- `isEvenlyCut`: true/false — are cuts roughly uniform, or does the pacing vary
- `pacingDescription`: one sentence on how cutting rhythm changes across the 33s
- `compositedSections`: any stretch that is clearly layered/composited (split panels,
  overlays, picture-in-picture, lyric text) rather than a single full-frame clip, with
  timestamps

### 5. Honesty block

- `uncertainties`: array of strings — anything you could not determine confidently
- `whereIGuessed`: array of strings — any field where you interpolated rather than observed

## END OF PROMPT

---

## Why each part is here

- **Section 2 must list repeats.** The current page assumes eight shots, each appearing once,
  in order. If a shot returns later, that model is wrong, not just imprecise.
- **`landsOnDownbeat` is the load-bearing claim.** The page renders shots as sitting on the
  beat grid. If most cuts are off-grid, that visualisation has to go — not get adjusted.
- **`compositedSections` matters** because S00 was composited as its own panel. If there are
  more layered stretches, "one shot = one panel" is the wrong shape for the breakdown.
- **`isEvenlyCut`** directly tests what the handover's timing table implied and what the page
  currently draws.

## What happens to the page depending on the answer

| Result | Consequence |
|---|---|
| Cuts land on downbeats, ~8 shots, no repeats | Current grid is correct. Replace planned numbers with measured ones. |
| Cuts land on downbeats but there are more of them / repeats | Grid survives; `SHOTS` becomes a cut list, and panels stop being 1:1 with shots. |
| Many cuts off-grid, or heavy compositing | The beat-grid visualisation is a claim the edit does not support. It gets rebuilt around what is actually there, or removed. |

The third outcome is a real possibility and is fine. It is much cheaper than shipping a page
that asserts a grid the video does not have.
