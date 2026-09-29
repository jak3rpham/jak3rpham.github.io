// Muxes the render with the score and writes the deliverables:
//   out/tatsuki-reel-2026.mp4      master: 1080p60 H.264 CRF 14 + AAC 320k, -14.5 LUFS / -1.5 dBTP, linear gain only
//   out/tatsuki-reel-2026-web.mp4  for the site: CRF 23, AAC 160k, faststart
//   out/tatsuki-reel-2026-poster.jpg
// v2: node finish.mjs --video reel2-video.mp4 --score score2.wav --name tatsuki-reel-2026-30s --poster 28.6
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const video = arg("video", "reel-video.mp4"), score = arg("score", "score.wav"), name = arg("name", "tatsuki-reel-2026"), posterAt = arg("poster", "18.4");
const o = f => join(here, "out", f);
const ff = (...a) => execFileSync("ffmpeg", ["-y", "-v", "error", ...a], { stdio: "inherit" });

// Two-pass loudnorm: measure, then apply linearly so the mix is not re-compressed.
const probe = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", o(score), "-af", "loudnorm=I=-14.5:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const m = JSON.parse(probe.slice(probe.lastIndexOf("{"), probe.lastIndexOf("}") + 1));
const ln = `loudnorm=I=-14.5:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;

ff("-i", o(video), "-i", o(score), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", o(`${name}.mp4`));
ff("-i", o(`${name}.mp4`), "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", o(`${name}-web.mp4`));
ff("-ss", posterAt, "-i", o(video), "-frames:v", "1", "-q:v", "2", o(`${name}-poster.jpg`));
console.log("done");
