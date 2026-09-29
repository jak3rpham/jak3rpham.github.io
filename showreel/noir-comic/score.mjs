// Builds the reel's audio: the music cut to the reel's length, the effects track, and the mix.
//   node noir-comic/score.mjs  ->  ../out/nc-score.wav, ../out/nc-sfx.wav, ../out/nc-mix.wav
// The length is read from reel.js (DUR), so making the reel longer only needs this rerun.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)), out = f => join(here, "..", "out", f);
const DUR = +readFileSync(join(here, "reel.js"), "utf8").match(/DUR = ([\d.]+)/)[1];
const TRACK = join(here, "music", "alanajordan-trip-hop-instrumental-08-537244.mp3");
// The track from its hats-free bar at 29.363 s; the silent bar 56.79–60.22 is cut out on the grid
// (the 10 ms either side is the 20 ms crossfade), so the groove never stops.
const START = 29.363, CUT_IN = 56.801, CUT_OUT = 60.210, FADE_OUT = 1.08;
const partA = CUT_IN - START, tailEnd = CUT_OUT + (DUR - partA) + .02;
const ff = (...a) => execFileSync("ffmpeg", ["-y", "-v", "error", ...a], { stdio: "inherit" });

ff("-i", TRACK, "-filter_complex",
  `[0:a]atrim=start=${START}:end=${CUT_IN},asetpts=PTS-STARTPTS[a];[0:a]atrim=start=${CUT_OUT}:end=${tailEnd.toFixed(3)},asetpts=PTS-STARTPTS[b];` +
  `[a][b]acrossfade=d=0.02:c1=tri:c2=tri,atrim=0:${DUR},afade=t=in:st=0:d=0.5,afade=t=out:st=${(DUR - FADE_OUT).toFixed(3)}:d=${FADE_OUT},aresample=48000[o]`,
  "-map", "[o]", "-ac", "2", out("nc-score.wav"));

const sfx = spawnSync("node", [join(here, "sfx.mjs")], { stdio: "inherit" });
if (sfx.status) process.exit(sfx.status);

// Effects about 10 LU under the music; the music ducks under them (sidechain keyed by the effects).
ff("-i", out("nc-score.wav"), "-i", out("nc-sfx.wav"), "-filter_complex",
  "[1:a]volume=2dB,asplit=2[s][k];[0:a][k]sidechaincompress=threshold=0.03:ratio=2.5:attack=5:release=220:makeup=1[m];[m][s]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false[o]",
  "-map", "[o]", "-ar", "48000", out("nc-mix.wav"));
console.log(`nc-score.wav, nc-sfx.wav, nc-mix.wav · ${DUR}s`);
