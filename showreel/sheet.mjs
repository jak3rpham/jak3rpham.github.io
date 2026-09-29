// node sheet.mjs <name> <png> <png> ...  -> audit/<name>.png, a 3-wide grid of 640x360 tiles
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [name, ...files] = process.argv.slice(2);
const cols = 3, rows = Math.ceil(files.length / cols);
const inputs = files.flatMap(f => ["-i", f]);
const scaled = files.map((_, i) => `[${i}:v]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x222222[v${i}]`).join(";");
const layout = files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join("|");
const graph = `${scaled};${files.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=black`;
execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", graph, "-frames:v", "1", join(here, "audit", name + ".png")]);
console.log("wrote", name, `${cols}x${rows}`);
