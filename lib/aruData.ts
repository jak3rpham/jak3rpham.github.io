/**
 * ある男, the whole case study as data, rebuilt from the real edit.
 *
 * Ground truth this file is built on, verified against the artifacts (not the handover plan):
 *  - 11 raw generations, each 5.04s @ 1248×704, 24fps (ffprobe on the source mp4s).
 *  - The CapCut timeline: every clip is SPEED-RAMPED to fit the music, 2.0X, 1.6X, 1.3X.
 *    The city's frantic pace is manufactured in the edit, not generated. That is the point.
 *  - Track runs 33s at 136 BPM (Tatsuki confirmed the tempo from the project).
 *  - Opens on the skyline (S8), climaxes on the burning city (S10), which the handover
 *    never listed. The profile (S09) is used, the old plan called it "never cut". Both
 *    corrections came from looking at the edit instead of the brief.
 *
 * The 110.5 BPM / "every shot on a downbeat" / "8 shots" model in the old file was fiction
 * inherited from the plan. It is gone.
 */

export const TRACK = {
  title: "ある男",
  titleRomaji: "Aru Otoko",
  gloss: "a man",
  seconds: 33,
  /** Confirmed from the CapCut project. Gemini could only guess (~90, low confidence). */
  bpm: 136,
  audio: "エイハブ ある男 MV.mp3",
  /** The mood/grade reference named on the timeline track, not the render style. */
  styleRef: "Wong Kar-wai",
} as const;

/** Every raw generation, verified by ffprobe: 5.04s, 1248×704, 24fps. Never varies. */
export const GEN_DUR = 5.04;
export const GEN_RES = "1248×704";

// --- the beat grid, COMPUTED from the tempo (not asserted as where cuts land) ----------
export const BEAT = 60 / TRACK.bpm; // 0.441s
export const BAR = BEAT * 4; // 1.765s, one downbeat every four beats, 4/4

/** Downbeat timestamps across the track. Derived from BPM, honest about being a grid the
 *  edit floats over rather than snaps to. */
export function downbeats(seconds: number = TRACK.seconds): number[] {
  const out: number[] = [];
  for (let t = 0; t <= seconds + 1e-6; t += BAR) out.push(Math.round(t * 100) / 100);
  return out;
}

/** The theme, taken from the brief (§Theme) and the on-screen lyric, a man inside the
 *  city's indifferent rush, weary, questioning the path he chose. This, not any claim about
 *  the model, is what the page is about. */
export const THEME =
  "A man inside the city's busy, indifferent rush, worn down, questioning the road he took.";

/** Embedded verbatim at the end of every image prompt, never varied. */
export const STYLE_BLOCK = `Spider-Verse-inspired comic animation style: bold cel shading, thick ink linework, heavy halftone / ben-day dot texture in shadows, subtle chromatic aberration on edges, painterly comic rendering. Dark moody palette, warm charcoal, deep amber, muted brown, dusty off-white highlights. No cold neon, no bright saturated color. 16:9 widescreen horizontal cinematic frame. Clean single frame, no comic panels, no split frames, no text overlay.`;

/** The model has no memory between generations. Consistency had to live in text. */
export const WARDROBE = `young man, mid-20s, short black hair; long dark charcoal-grey wool overcoat, open, over a plain black crew-neck top; dark charcoal tapered trousers; scuffed dark brown leather boots.`;

// --- the 11 source generations ---------------------------------------------------------

export type Source = {
  id: string;
  /** filename label on the timeline, e.g. "S8", "S09" */
  label: string;
  title: string;
  content: string;
  still: string;
  /** YouTube id for the raw, uncut generation. null renders a labelled placeholder. */
  youtube: string | null;
  /** true if this generation appears in the final edit (from the CapCut timeline). */
  usedInEdit: boolean;
  imgPrompt?: string;
  motPrompt?: string;
  note?: string;
};

const S = "/images/aru-otoko/stills";

/**
 * Ordered by filename, not by timeline position. `usedInEdit` records what the CapCut
 * timeline actually pulled in; three generations (crowd, crossing, rooftop) were made and
 * left out. Every clip came back 5.04s, the only length the model makes.
 */
export const SOURCES: Source[] = [
  {
    id: "s00",
    label: "S0",
    title: "The walk",
    content: "Knee-down crop: boots on wet asphalt, overcoat hem swaying, amber streetlight.",
    still: `${S}/s00-walk.webp`,
    youtube: "3okAVLvxFUU",
    usedInEdit: true,
    imgPrompt: `Tight low-angle shot cropped knee-down of a young man walking on a wet city sidewalk at dusk: dark charcoal tapered trousers and scuffed dark brown leather boots, long dark charcoal-grey wool overcoat hem swaying at top edge. One boot lifting mid-step, wet asphalt reflecting warm amber streetlight, shallow depth.`,
    motPrompt: `Legs stride forward with firm, purposeful weight, boots hitting wet pavement each step, puddle splashes, overcoat hem swaying. Fast city blur rushing past behind. Camera tracks low alongside, brisk pace. Energetic driving rhythm, fluid motion, no stutter.`,
    note: "The one set piece. Split to 151 frames so scroll drives his footfalls.",
  },
  {
    id: "s01",
    label: "S1",
    title: "Back view",
    content: "Seen from directly behind, walking away down a narrow dusk street.",
    still: `${S}/s01-back.webp`,
    youtube: "W-Eqt_nPQSM",
    usedInEdit: true,
    imgPrompt: `Back view from behind the character, camera directly behind him at street level, we see only his back, face NOT visible. A young man walking away from camera down a narrow city street at dusk, seen entirely from behind: long dark charcoal-grey wool overcoat open, dark charcoal trousers, scuffed dark brown boots, short black hair, hands in overcoat pockets, shoulders slightly hunched. Full body / medium-wide, centered, deep one-point perspective, faint haze, wet asphalt catching warm amber streetlight. No three-quarter angle, no front of body visible.`,
    motPrompt: `He walks forward with steady grounded weight, not slow, overcoat hem trailing. City rushes behind: traffic streaking, pedestrians fast, lights flickering. Camera follows briskly behind. Grounded anchor amid fast urban motion. Fluid motion, no stutter.`,
    note: "Camera angle had to open the prompt or the model drew him front-on.",
  },
  {
    id: "s02",
    label: "S2",
    title: "Crowd",
    content: "Standing sharp among a rush-hour crowd blurred into light streaks.",
    still: `${S}/s02-crowd.webp`,
    youtube: "JJWwjYu7i4w",
    usedInEdit: false,
    imgPrompt: `${WARDROBE} He stands mid-frame among a rush-hour crowd on a city sidewalk, other pedestrians as soft motion-blurred light streaks while he stays sharp and grounded, isolated. Eye-level, shallow depth, warm amber and charcoal tones, faint bloom on distant signage.`,
    motPrompt: `Dense rush-hour crowd streaks past rapidly both directions as fast light trails; traffic and signage blur with speed. He walks forward at a normal steady walking pace, clear deliberate steps, grounded, not slow. Quick handheld camera energy. Fluid motion, no stutter.`,
    note: `Generated, left out of the cut. "Single steady figure in fast flow" first dragged him into slow motion; "normal steady walking pace, grounded, not slow" fixed it.`,
  },
  {
    id: "s03",
    label: "S3",
    title: "Wet crossing",
    content: "Low angle, legs only, crossing a rain-slicked road as headlights approach.",
    still: `${S}/s03-crossing.webp`,
    youtube: "A3qdznRUKxU",
    usedInEdit: false,
    imgPrompt: `Low-angle shot of a young man's legs and lower body walking across a wet city crossing, dark charcoal trousers, scuffed dark brown boots, overcoat hem swaying, same outfit. Reflection stretched on rain-slicked road, streetlight reflections warped in warm amber and deep brown, overhead wires across dark dusk sky.`,
    motPrompt: `Legs stride briskly across a busy wet crossing, overcoat hem swaying, cars rushing past close behind with streaking headlights, reflections rippling fast in wet road, crowds moving quickly. Energetic urban pace. Fast camera tilt following the walk. Fluid motion, no stutter.`,
    note: "Generated, left out. Legs-only, no face, which made it a poor first frame for a chain into S4.",
  },
  {
    id: "s04",
    label: "S4",
    title: "The stop",
    content: "Slowing to a halt on a quiet stretch, the one still point in the rush.",
    still: `${S}/s04-stop.webp`,
    youtube: "zDYz1ZNhWdM",
    usedInEdit: true,
    imgPrompt: `${WARDROBE} He is slowing to a stop on a quiet stretch of sidewalk, slightly high angle, city stretching behind him, warm haze, isolated pool of amber light around him, everything else dim charcoal. Contemplative.`,
    motPrompt: `He slows and stops, the one still point, overcoat settling, while city keeps rushing fast: traffic streaking, steam venting, crowds hurrying past in blur. Camera cranes up briskly. Contrast between his stillness and fast world. Fluid motion, no stutter.`,
    note: "Generated independently, not chained from S3. The transition became the edit's problem.",
  },
  {
    id: "s05",
    label: "S5",
    title: "Rooftop",
    content: "Sitting alone on a rooftop edge, the sprawling city small beneath him.",
    still: `${S}/s05-rooftop.webp`,
    youtube: "U9DaTljXRAY",
    usedInEdit: false,
    imgPrompt: `${WARDROBE} He sits alone on a rooftop edge at dusk, from behind and side (3/4), sprawling warm-amber city below and beyond, dark charcoal sky, wind in hair and overcoat, small against vast city.`,
    motPrompt: `He sits still on rooftop edge while vast city rushes below, fast traffic light-trails streaking, signage flickering, distant trains moving. Wind whips hair and overcoat briskly. Camera pushes in steadily. Stillness against restless city. Fluid motion, no stutter.`,
    note: "Generated, left out of the final cut.",
  },
  {
    id: "s06",
    label: "S6",
    title: "Vending machine",
    content: "A glowing vending machine on a busy corner. No character, the city alone.",
    still: `${S}/s06-vending.webp`,
    youtube: "1fYJUNl1hgc",
    usedInEdit: true,
    imgPrompt: `A city street detail at night, a glowing vending machine on a busy corner, cars and pedestrians rushing past, warm amber glow against deep brown shadow, heavy halftone texture. No main character. Restless urban energy.`,
    motPrompt: `Fast environmental motion, traffic light-trails streak past rapidly, pedestrians hurry through frame in blur, vending-machine glow flickers, signage buzzes, overhead wires sway. Quick camera drift. Busy restless fast. No stutter.`,
    note: "No character at all. The city carries the shot.",
  },
  {
    id: "s07",
    label: "S7",
    title: "Close-up",
    content: "Face filling the frame, eyes lowered, tired and searching.",
    still: `${S}/s07-closeup.webp`,
    youtube: "Q09kCcu7P_g",
    usedInEdit: true,
    imgPrompt: `A young man, mid-20s, short black hair, long dark charcoal-grey wool overcoat over black crew-neck, same person every shot. Close-up 3/4 of face, eyes lowered, tired and searching, warm amber rim light one side, deep charcoal shadow other side with visible halftone dots, faint city-light reflection in eyes, lips slightly parted. Overcoat collar and crew-neck visible at bottom edge. City bokeh softly framing both sides.`,
    motPrompt: `Face still and tired, eyes lowered, calm center. Behind him out-of-focus city lights streak and rush fast, blurred traffic and crowds moving quickly. Steady push-in on face; slow blink; lips part faintly as if exhaling. Stillness against fast blurred motion behind. No stutter.`,
    note: "The hardest shot, and the most regenerated. Identity had to survive a face filling the frame.",
  },
  {
    id: "s08",
    label: "S8",
    title: "Skyline",
    content: "Wide establishing shot of the night skyline. This opens the video.",
    still: `${S}/s08-skyline.webp`,
    youtube: "tw3b34H5KeQ",
    usedInEdit: true,
    imgPrompt: `Static wide establishing shot of a city skyline at night from a low angle, warm amber building lights, dark charcoal sky, quiet and still, calm cinematic composition. Subtle chromatic aberration only on outer edges. No rainbow glow, no lens flare.`,
    motPrompt: `Static wide shot of city skyline at night. Slow steady camera push-in. Distant traffic moves, headlight/taillight trails flowing steadily, scattered windows flicker faintly. Calm restrained. Fluid motion, no stutter, NO flashing, NO bursts of light, NO rainbow effects.`,
    note: "Opens the edit, planned as a late establishing shot, moved to the front by the edit.",
  },
  {
    id: "s09",
    label: "S09",
    title: "Side profile",
    content: "Exact 90° profile, tracked alongside, city bokeh soft behind.",
    still: `${S}/s09-profile.webp`,
    youtube: "HC3I47_PlsQ",
    usedInEdit: true,
    imgPrompt: `Pure side-profile view, young man walking horizontally across frame right to left, body in profile so camera sees only side of head and one cheek, NOT chest or front. Exact 90-degree side angle, like a tracking shot filmed from the sidewalk beside him. Framing shoulders up only, tight head-and-shoulders crop. Short black hair, overcoat collar over black crew-neck at bottom edge. Looks straight ahead in walking direction. Shallow DoF, soft focus falloff, warm amber city bokeh.`,
    motPrompt: `Pure side profile, shoulders up, camera tracks alongside keeping exact side angle. Walks briskly right to left, gaze forward, shoulders bobbing quick steady rhythm, hair bouncing each step. Blurred city rushing behind in soft focus. Locked 90-degree profile. Brisk driving rhythm, fluid motion, no stutter.`,
    note: "A front-facing face reference fought the 90° angle, pulling his head back toward the lens. Lowering reference strength was the only way through.",
  },
  {
    id: "s10",
    label: "S10",
    title: "The city burns",
    content: "One generation that arcs street → firestorm → car interior. The climax, held.",
    still: `${S}/s10-burning.webp`,
    youtube: "90ThrbyEKk8",
    usedInEdit: true,
    note: "Not in the handover at all, it emerged in the build and became the ending. The model rendered 'energy' as buildings erupting in gold light; instead of fighting it, the edit kept it as the turn. The clip morphs on its own from a calm street to fire to a car-interior POV.",
  },
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
);

// --- the edit: the CapCut timeline, in order ------------------------------------------

export type Cut = {
  index: number;
  /** source id, or an edit construct */
  source: string;
  /** the filename/label shown on the timeline */
  label: string;
  /** playback speed applied in the edit. 1 = untouched. */
  speed: number;
  /** what it is, one line */
  note: string;
  /** an edit construct rather than a raw generation (compound / effects layer) */
  construct?: boolean;
};

/**
 * Reconstructed from the CapCut timeline screenshot. The SPEED per clip is the load-bearing
 * fact here, read directly off the timeline, and it is the whole craft story: a fixed 5.04s
 * generation is accelerated to make the city move at the song's pace. Two clips are edit
 * constructs (a compound clip and an effects layer) rather than single raw generations.
 *
 * On-screen durations are approximate (the timeline trims frames the screenshot can't show);
 * `screenDur()` derives the nominal length from speed to visualise the compression, not to
 * assert a frame-exact cut.
 */
export const CUTS: Cut[] = [
  { index: 0, source: "s08", label: "S8", speed: 2.0, note: "Skyline. Opens the video, sped to a rush." },
  { index: 1, source: "s00", label: "S0", speed: 2.0, note: "The walk, doubled, boots hammering the pavement." },
  { index: 2, source: "s01", label: "S1", speed: 1.3, note: "Back view, only nudged faster." },
  { index: 3, source: "s09", label: "S09", speed: 1.6, note: "The profile the old plan said never made the cut." },
  { index: 4, source: "compound", label: "Compound clip1", speed: 1.0, note: "A compound clip, sources stacked and treated as one.", construct: true },
  { index: 5, source: "s04", label: "S4", speed: 1.0, note: "The stop. The one beat left at natural speed." },
  { index: 6, source: "s06", label: "S6", speed: 1.0, note: "Vending machine, the city with no one in it." },
  { index: 7, source: "fx", label: "Special effects", speed: 1.0, note: "An effects layer over the turn into the climax.", construct: true },
  { index: 8, source: "s07", label: "S7", speed: 1.6, note: "Close-up, sped so the face still reads as the calm center." },
  { index: 9, source: "s10", label: "S10", speed: 1.0, note: "The city erupts into gold, the climax." },
  { index: 10, source: "s10", label: "S10", speed: 1.0, note: "Held on the burning street as the track resolves." },
];

/** Nominal on-screen seconds for a raw sped clip: 5.04s ÷ speed. Illustrative, not frame-exact. */
export function screenDur(cut: Cut): number {
  if (cut.construct) return GEN_DUR / 1; // constructs: shown at ~a source length, unknown trim
  return Math.round((GEN_DUR / cut.speed) * 100) / 100;
}

/** The set of speed multipliers actually used, fastest first. */
export const SPEEDS_USED = [2.0, 1.6, 1.3, 1.0] as const;

// --- S00 scroll set piece --------------------------------------------------------------

export const ASSET_S00 = {
  id: "s00",
  label: "S0",
  title: "The walk",
  still: `${S}/s00-walk.webp`,
  frameDir: "/images/aru-otoko/frames/s00",
  frameCount: 151,
  note: "Generated as one 5.04s clip, split to 151 frames so scrolling drives the footfalls.",
} as const;

// --- references, pipeline, tooling -----------------------------------------------------

export const REFERENCES = [
  {
    src: "/images/aru-otoko/references/ref-01-skyline-amber.webp",
    label: "Colour + city",
    note: "Amber dusk skyline. Fixed the palette before a single shot was generated.",
  },
  {
    src: "/images/aru-otoko/references/ref-02-street-corner.webp",
    label: "Linework + halftone",
    note: "Ben-day shadow texture and ink weight, straight from the source.",
  },
  {
    src: "/images/aru-otoko/references/ref-03-street-canyon.webp",
    label: "Street depth",
    note: "Signage density and canyon perspective for the wide shots.",
  },
];

export const REFERENCE_CREDIT =
  "Style references: Spider-Man: Into the Spider-Verse / Across the Spider-Verse © Sony Pictures Animation. Grade / mood reference: the films of Wong Kar-wai. Reproduced here to document generation input.";

export const PIPELINE = [
  { label: "TRACK", sub: "33s cut", note: "The only fixed constraint. 136 BPM. Everything downstream bends to it." },
  { label: "ANALYSIS", sub: "Gemini", note: "Structure, vocal entry, feel. Audio is a layer I cannot read by eye." },
  { label: "SHOT SPEC", sub: "by hand", note: "Prompts written per shot, image + motion, two per generation." },
  { label: "KEYFRAME", sub: "Nano Banana 2", note: "Gemini 3.1 Flash. Multi-reference: 3 face photos + Spider-Verse style refs." },
  { label: "MOTION", sub: "Seedance V1.0", note: "Image-to-video. Every clip comes back 5.04s, no matter the prompt." },
  { label: "EDIT", sub: "CapCut", note: "Speed-ramp each clip (2.0X / 1.6X / 1.3X) to the music, one grade over everything." },
];

export const TOOLING = {
  canvas: "Weavy → Figma Weave",
  canvasNote: "A manual node canvas, not an agent. Every wire placed by hand.",
  spend: "$24 starter pack · 1500 credits · one-time, no subscription",
  screenshot: "/images/aru-otoko/workflow/weavy-canvas-full.webp",
};

/** Wall-clock, hands on keys. */
export const TIMESPAN = [
  { k: "Generation", v: "3 hours", note: "From brief to the full set of source clips, prompting, generating, regenerating, on the canvas." },
  { k: "Edit", v: "2 hours", note: "Both cuts, the 16:9 and the 9:16, speed-ramped, graded, and lyric-captioned in CapCut." },
];

// --- learnings -------------------------------------------------------------------------

export type Learning = { k: string; title: string; body: string };

/** Craft learnings from touching every edge of this pipeline, the real limits of the
 *  tools, not a thesis. The fixed-clip lesson leads; speed-matching is a plain edit note. */
export const LEARNINGS: Learning[] = [
  {
    k: "一",
    title: "The model only makes about five seconds",
    body: "Seedance returns a fixed ~5.04-second clip every time. Ask for 2, ask for 8, it returns five. Length is never yours to choose at generation, the long beats are built by compounding downstream, the short ones by trimming.",
  },
  {
    k: "二",
    title: "Consistency has to survive time, not just a frame",
    body: "Each generation is a new person matching a description. Holding one man together across the shots took a wardrobe canon in text, three face photographs as anchors, and a single grade over everything. Absolute consistency is not available today; close enough that the eye accepts it is, and chasing better burns credits for nothing.",
  },
  {
    k: "三",
    title: "Camera angle goes first, or it gets ignored",
    body: `"Seen from behind" mid-sentence sinks and the model draws him front-on. It has to open the prompt, and it needs explicit negatives, "face not visible", "no three-quarter angle".`,
  },
  {
    k: "四",
    title: "A face reference fights the angle you asked for",
    body: "Front-facing reference photos drag profile and from-behind shots back toward the lens. On the side profile, lowering reference strength was the only way to hold the 90° angle the shot needed.",
  },
  {
    k: "五",
    title: "The model's mistakes can be the best shots",
    body: `Abstract words, "energy", "about to break", render as blown highlights and rainbow bloom. That failure produced S10: a street erupting into gold light. Instead of prompting it away, the edit kept it as the climax. Knowing which errors to keep is part of the craft.`,
  },
  {
    k: "六",
    title: "Approve the cheap thing before buying the expensive one",
    body: "Stills cost a fraction of video. Almost every credit lost went to animating a keyframe that was not right yet.",
  },
  {
    k: "七",
    title: "Last-frame chaining needs a shared setting",
    body: "S3→S4 was planned as a chain and dropped. S3 is legs-only with no face, a poor first frame for S4. The node takes images, not video, as first/last frame. S4 was generated independently and the transition became the edit's problem, where it belonged.",
  },
  {
    k: "八",
    title: "Beat-matching lives in the edit, not the prompt",
    body: "The clips come back at one speed; syncing a cut to the song's beat is just a timeline decision, nudging some clips faster (2.0×, 1.6×, 1.3×) so each change lands where the music wants it. Minor craft, not something the model could ever do for you.",
  },
];

// --- video ids + posters ---------------------------------------------------------------

/** YouTube ids. null renders a labelled placeholder, no code change when they land. */
export const YT: {
  hero: string | null;
  vertical: string | null;
} = {
  hero: "erqSvIsXUpI", // Horizontal MV, 16:9
  vertical: "EaRZVVc109c", // Vertical MV, YouTube Short 9:16
};

/** The behind-the-process reel. Opened from a dark on-theme card into an IG lightbox iframe. */
export const REELS_IG = {
  permalink: "https://www.instagram.com/reel/Da12Zg4vTeQ/",
  handle: "@tatsuki.ddd",
};

export const POSTER = {
  horizontal: "/images/aru-otoko/poster/poster-horizontal.webp",
  vertical: "/images/aru-otoko/poster/poster-vertical.webp",
};

// --- derived ---------------------------------------------------------------------------

export function totalGenerated(): number {
  return Math.round(SOURCES.length * GEN_DUR * 10) / 10;
}

export function usedCount(): number {
  return SOURCES.filter((s) => s.usedInEdit).length;
}

export function unusedSources(): Source[] {
  return SOURCES.filter((s) => !s.usedInEdit);
}
