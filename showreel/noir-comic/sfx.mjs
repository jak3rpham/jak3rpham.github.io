// Sound design for the noir comic: real recorded effects from sfx/ (Pixabay, free to use), layered
// and placed on the picture's beat grid. Writes ../out/nc-sfx.wav (48 kHz stereo); score.mjs mixes it
// under the music. Every event mirrors a land(), burst, cut or caption in reel.js.
//   node noir-comic/sfx.mjs   (score.mjs runs it for you)
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// The length comes from reel.js, so the picture stays the single source of truth.
const DUR = +readFileSync(join(here, "reel.js"), "utf8").match(/DUR = ([\d.]+)/)[1];
const SR = 48000, N = Math.ceil(SR * DUR);
const BEAT = 60 / 70, bt = n => n * BEAT;
const L = new Float32Array(N), R = new Float32Array(N);
const db = d => 10 ** (d / 20);
let seed = 11;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ---------------------------------------------------------------- sources
// Each file is decoded once and peak-normalised to 0 dBFS, so every gain below is relative to its peak.
const cache = new Map();
function src(name) {
  if (cache.has(name)) return cache.get(name);
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", join(here, "sfx", name + ".mp3"), "-ac", "2", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), n = f.length / 2, l = new Float32Array(n), r = new Float32Array(n);
  let pk = 0; for (let i = 0; i < n; i++) { l[i] = f[2 * i]; r[i] = f[2 * i + 1]; pk = Math.max(pk, Math.abs(l[i]), Math.abs(r[i])); }
  for (let i = 0; i < n; i++) { l[i] /= pk; r[i] /= pk; }
  const s = { l, r, n };
  cache.set(name, s); return s;
}
// Place a slice of a file so that its anchor (seconds into the file) lands at time t.
// from/len pick the slice; fades are in seconds; pan -1..1; rate resamples (pitch) for variety.
function put(t, name, gainDb, o = {}) {
  const s = src(name), from = o.from ?? 0, len = Math.min(o.len ?? (s.n / SR - from), s.n / SR - from), anchor = o.anchor ?? from;
  const rate = o.rate ?? 1, fi = o.fadeIn ?? .002, fo = o.fadeOut ?? .03, g = db(gainDb), pan = o.pan ?? 0;
  const gl = g * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = g * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  const outLen = Math.floor(len * SR / rate), start = Math.round((t - (anchor - from) / rate) * SR);
  for (let k = 0; k < outLen; k++) {
    const j = start + k; if (j < 0 || j >= N) continue;
    const p = from * SR + k * rate, i0 = Math.floor(p), fr = p - i0; if (i0 + 1 >= s.n) break;
    const tt = k / SR, e = Math.min(1, tt / fi, (outLen / SR - tt) / fo);
    L[j] += (s.l[i0] * (1 - fr) + s.l[i0 + 1] * fr) * e * gl; R[j] += (s.r[i0] * (1 - fr) + s.r[i0 + 1] * fr) * e * gr;
  }
}
const P = (w = .5) => (rnd() - .5) * w * 2;
const vary = () => .94 + rnd() * .12;

// ---------------------------------------------------------------- layers
// Single keystrokes cut out of a real typewriter take (onsets measured), a bell when a line is done.
const KEYS = [.19, .55, .68, .76, .87, 1.06, 1.35, 1.55, 1.85, 2.17, 2.27, 2.53, 2.67, 2.75];
let key = 0;
function type(t0, text, step) {
  [...text].forEach((c, i) => { if (c !== " ") put(t0 + i * step, "type-writing", -15 + P(2), { from: KEYS[key % KEYS.length] - .006, len: .085, anchor: KEYS[key++ % KEYS.length], rate: vary(), pan: P(.3) }); });
}
// A panel landing: a short air swoosh just before, a paper slap on the beat.
const SLAPS = [["paper-slaps", .04], ["paper-slaps", .23], ["paper-slaps", 1.48], ["paper-slaps", 1.86], ["paper-slaps", 2.24], ["paper-stack-drop", .05]];
const SWISH = [["swoosh-fast", .13], ["swoosh-14", .29], ["swoosh-15", .5]];
let sl = 0, sw = 0;
function land(t, v = 0, pan = P(.4)) {
  const [f, a] = SLAPS[sl++ % SLAPS.length], [g, b] = SWISH[sw++ % SWISH.length];
  put(t, f, (f === "paper-stack-drop" ? -19 : -13) + v, { from: Math.max(0, a - .01), len: .32, anchor: a, rate: vary(), pan, fadeOut: .08 });
  put(t - .04, g, -24 + v, { anchor: b, pan: -pan, fadeOut: .1 });
}
function move(t, name = "whoosh-cine2", anchor = .89, v = 0) { put(t, name, -19 + v, { anchor, fadeOut: .25 }); }
// A bed loops its file with half-second crossfades when the stretch is longer than the recording.
function bed(name, t0, t1, gainDb, from = 0, fade = .7) {
  const avail = src(name).n / SR - from; let t = t0, first = true;
  while (t < t1 - .05) {
    const len = Math.min(avail, t1 - t), last = t + len >= t1 - .05;
    put(t, name, gainDb, { from, len, fadeIn: first ? fade : .5, fadeOut: last ? fade : .5 });
    if (last) break;
    t += len - .5; first = false;
  }
}

// ---------------------------------------------------------------- the reel
// Texture under everything: film-print crackle.
bed("vinyl", 0, DUR, -33, 1.5, 1.2);
// 0 · intro: rain on the window, a line typed out, the bell; the room turns into panel one.
bed("rain-heavy", 0, bt(4.6), -24, 2, .6);
const intro = "Ideas into actual things.", outro = "Hi, I'm Thanh. Call me Tatsuki.";
type(.4, intro, .045);
put(.4 + intro.length * .045 + .1, "type-bell", -21, { from: .09, len: 1.6, anchor: .1, fadeOut: .6 });
put(bt(3.65), "riser-swoosh", -17, { anchor: .43 });
put(bt(3.95), "page-flip2", -16, { anchor: .7 });
move(bt(4.25), "whoosh-cine2", .89, -1);
// 1 · terra: panels land; a marker draws the curve; the front page hits; stats count up.
[4, 4.5, 5, 6.8].forEach(b => land(bt(b)));
[0, 1, 2, 3].forEach(i => land(bt(6) + i * .07, -4, (i % 2 ? .35 : -.35)));
put(bt(7), "marker-letter", -17, { from: .1, len: 1.25, fadeOut: .15, pan: -.2 });
put(bt(8), "whoosh-reverse", -18, { anchor: 1.56, from: .6, fadeOut: .05 });
put(bt(8), "impact-hit", -13, { anchor: .17 });
put(bt(8), "stamp2", -15, { from: .5, anchor: .54, len: .6 });
put(bt(8), "sub-drop", -16, { anchor: .1, len: 2.2, fadeOut: .5 });
[0, 1, 2].forEach(i => { const t0 = bt(9) + i * bt(1 / 3); land(t0, -2); for (let k = 0; k < 10; k++) put(t0 + .06 + k * .06 * (1 + k / 12), "type-writing", -27, { from: KEYS[(k + i) % KEYS.length] - .004, len: .05, anchor: KEYS[(k + i) % KEYS.length], rate: 1.3, pan: .35 }); });
move(bt(11.5), "whoosh-simple", 1.23, -1);
// 2 · Nhà Mình
[12, 12.5, 13, 13.5, 14].forEach(b => land(bt(b)));
put(bt(14.5), "impact-boom3", -17, { anchor: .12 }); land(bt(14.5), 1);
move(bt(19.6), "air-swoosh", .87, 1);
// 3 · Video & brand: the projector spins up and runs; nine tiles land on quarter-beats.
bed("projector-start", bt(19.8), bt(24.3), -19, .15, .25);
for (let i = 0; i < 9; i++) land(bt(20) + i * bt(.25), -6, (i % 3 - 1) * .5);
// 4 · Aru Otoko: rain on a night street under it all; the cut lands with a low boom.
move(bt(24), "whoosh-cine1", .47, -2);
put(bt(24), "impact-boom5", -20, { anchor: .08, len: .9, fadeOut: .3 });
bed("rain-gentle", bt(24), bt(32.3), -21, 30, .6);
[24, 25, 25.4, 26.5, 28, 28.4, 29.5, 29.9].forEach(b => land(bt(b), -3));
// 5 · Bóng Vespera: a deep bell at the gate; a temple bell when two prints come alive.
move(bt(31.8), "whoosh-simple", 1.23, -1);
put(bt(32), "bell-burmese", -19, { from: 0, len: 5.5, anchor: .03, fadeOut: 2 });
[32, 32.5, 33, 33.5, 34].forEach(b => land(bt(b), -3));
put(bt(36), "bell-temple", -14, { anchor: .05, len: 4, fadeOut: 1.5 });
put(bt(36), "sub-drop", -22, { anchor: .1, len: 1.8, fadeOut: .5 });
// 6 · Vitalité: clicks through the store, a dark braam as the campaign lands, a shutter burst for the
// stop-motion tee, shutters for the lookbook, the can rattled and sprayed.
move(bt(40), "air-swoosh", .87, -1);
[40, 40.5, 41, 41.5, 41.75].forEach(b => land(bt(b), -2, -.3));
[40.1, 40.6, 41.1, 41.6, 41.85].forEach(b => put(bt(b), "mouse2", -17, { from: .12, anchor: .14, len: .3, pan: -.2 }));
put(bt(42), "braam-dark", -16, { anchor: .32, len: 3.5, fadeOut: 1.2 });
move(bt(42), "whoosh-cine1", .47, -3);
land(bt(42.6), -1, .3); land(bt(42.9), -1, .2);
put(bt(42.9) + .2, "shutter2", -22, { from: .05, len: 1.9, fadeOut: .3, pan: .3 });
[43.3, 43.7].forEach(b => { put(bt(b), "shutter1", -16, { anchor: .06, pan: .4 }); land(bt(b), -3, .4); });
put(bt(43.2) - .5, "spray-rattle", -24, { from: .35, len: .45, pan: -.35, fadeOut: .1 });
put(bt(43.2), "spray", -15, { from: .18, anchor: .22, len: .8, pan: -.35, fadeOut: .2 });
// 7 · the other cases, then back into the room: the page flips, a reverse whoosh pulls us in, the rain
// returns, the last line is typed and the carriage returns.
move(bt(45.9), "swoosh-15", .5, 2);
[46, 46.4, 46.8, 47.2].forEach(b => land(bt(b)));
put(bt(47.2), "page-flip2", -17, { anchor: .7 });
put(bt(49), "whoosh-reverse", -16, { anchor: 1.56, from: .3, fadeOut: .05 });
put(bt(49), "impact-boom3", -24, { anchor: .12, len: 1.4, fadeOut: .5 });
bed("rain-heavy", bt(48.7), DUR, -24, 12, .5);
type(bt(48.2) + .1, outro, .045);
put(bt(48.2) + .1 + outro.length * .045 + .08, "type-bell-carriage", -19, { from: 1.2, anchor: 2.41, len: 1.7, fadeOut: .4 });

// ---------------------------------------------------------------- write
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = peak > .89 ? .89 / peak : 1;
const out = Buffer.alloc(44 + N * 4);
out.write("RIFF", 0); out.writeUInt32LE(36 + N * 4, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
mkdirSync(join(here, "..", "out"), { recursive: true });
writeFileSync(join(here, "..", "out", "nc-sfx.wav"), out);
console.log(`nc-sfx.wav ${DUR}s, peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS${g < 1 ? ` (scaled by ${(20 * Math.log10(g)).toFixed(1)} dB)` : ""}, ${cache.size} sources`);
