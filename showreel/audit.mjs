// node audit.mjs out/reel-video.mp4
// Per-frame mean luma, then every frame-to-frame jump big enough to read as a flash. WCAG 2.3.1
// allows at most three flashes (an opposing pair of changes) in any one-second window.
import { execFileSync } from "node:child_process";

const file = process.argv[2];
const log = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
const y = [...log.matchAll(/YAVG=([\d.]+)/g)].map(m => +m[1]);
const fps = 60, JUMP = 40; // of 255: roughly a 16% swing in mean luma
const jumps = [];
for (let i = 1; i < y.length; i++) if (Math.abs(y[i] - y[i - 1]) > JUMP) jumps.push({ t: i / fps, d: +(y[i] - y[i - 1]).toFixed(1) });
let worst = 0, at = 0;
for (const j of jumps) {
  const inWin = jumps.filter(k => k.t >= j.t && k.t < j.t + 1);
  let pairs = 0;
  for (let i = 1; i < inWin.length; i++) if (Math.sign(inWin[i].d) !== Math.sign(inWin[i - 1].d)) pairs++;
  if (pairs > worst) { worst = pairs; at = j.t; }
}
console.log(`frames ${y.length}, luma first ${y[0].toFixed(1)} last ${y[y.length - 1].toFixed(1)}`);
console.log(`jumps > ${JUMP}:`, jumps.map(j => `${j.t.toFixed(2)}s(${j.d})`).join(" ") || "none");
console.log(`worst window: ${worst} opposing pairs starting ${at.toFixed(2)}s (limit 3)`);
