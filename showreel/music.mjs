// Synthesises the reel's score: 120 BPM, 20 s, every hit placed on the same grid as the cuts
// in reel.js. Writes out/score.wav (48 kHz, 16-bit stereo). No samples, no licensed audio.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 20, N = SR * DUR;
const TAU = Math.PI * 2;
let seed = 11;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const midi = n => 440 * 2 ** ((n - 69) / 12);

// ---------------------------------------------------------------- buses
const bus = () => [new Float32Array(N), new Float32Array(N)];
const drums = bus(), music = bus(), fx = bus(), send = bus();
function put(b, t, sig, gain = 1, pan = 0, rev = 0) {
  const i0 = Math.round(t * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < sig.length; i++) {
    const j = i0 + i; if (j < 0 || j >= N) continue;
    b[0][j] += sig[i] * gl; b[1][j] += sig[i] * gr;
    if (rev) { send[0][j] += sig[i] * gl * rev; send[1][j] += sig[i] * gr * rev; }
  }
}
// RBJ biquad; coefficients recomputed per call so sweeps can pass a function of time.
function biquad(sig, type, freqAt, q = .7) {
  const out = new Float32Array(sig.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0, b1, b2, a1, a2;
  for (let i = 0; i < sig.length; i++) {
    if (i % 16 === 0) {
      const f = Math.min(SR * .45, Math.max(20, typeof freqAt === "function" ? freqAt(i / SR) : freqAt));
      const w = TAU * f / SR, al = Math.sin(w) / (2 * q), c = Math.cos(w), a0 = 1 + al;
      if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
      else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
      else { b0 = al; b1 = 0; b2 = -al; }
      b0 /= a0; b1 /= a0; b2 /= a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
    }
    const y = b0 * sig[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = sig[i]; y2 = y1; y1 = y; out[i] = y;
  }
  return out;
}
const gen = (len, fn) => { const s = new Float32Array(Math.round(len * SR)); for (let i = 0; i < s.length; i++) s[i] = fn(i / SR, i); return s; };

// ---------------------------------------------------------------- instruments
const kicks = [];
function kick(t, g = 1) {
  kicks.push(t);
  let ph = 0;
  put(drums, t, gen(.5, x => { ph += TAU * (46 + 120 * Math.exp(-x * 32)) / SR; return Math.tanh(1.6 * Math.sin(ph) * Math.exp(-x * 6.5)) + (x < .003 ? noise() * .6 : 0); }), .95 * g);
}
function clap(t, g = 1, rev = .25) {
  const raw = gen(.35, x => { const burst = [0, .011, .022].some(o => x >= o && x < o + .008) ? 1 : 0; return noise() * (burst ? 1 : Math.exp(-(x - .03) * 18) * (x > .03)); });
  put(drums, t, biquad(raw, "bp", 1500, .9), .75 * g, .05, rev);
}
function hat(t, g = 1, open = false, pan = .25) {
  const raw = gen(open ? .28 : .06, x => noise() * Math.exp(-x * (open ? 13 : 70)));
  put(drums, t, biquad(raw, "hp", 7500, .7), (open ? .22 : .18) * g, pan);
}
function saw(ph) { return 2 * (ph - Math.floor(ph + .5)); }
function supersaw(notes, len, cutoff, g, t, rel = .2, rev = .3, pan = 0) {
  const voices = notes.flatMap(n => [-.18, -.07, 0, .08, .17].map(d => ({ f: midi(n + d * .5), ph: rnd() })));
  const raw = gen(len + rel, x => {
    let s = 0; for (const v of voices) { v.ph += v.f / SR; s += saw(v.ph); }
    const env = Math.min(1, x / .004) * (x < len ? Math.exp(-x * 2.5) : Math.exp(-len * 2.5) * Math.exp(-(x - len) / rel * 4));
    return s / voices.length * env;
  });
  put(music, t, biquad(raw, "lp", typeof cutoff === "function" ? cutoff : x => cutoff * (.35 + .65 * Math.exp(-x * 7)), .9), g, pan, rev);
}
function bass(t, n, len = .2, g = 1) {
  const f = midi(n); let ph = 0;
  const raw = gen(len + .03, x => { ph += f / SR; const env = Math.min(1, x / .003) * (x < len ? 1 : Math.exp(-(x - len) * 120)); return (Math.sin(TAU * ph) * .7 + saw(ph) * .45) * env; });
  put(music, t, biquad(raw, "lp", x => 260 + 900 * Math.exp(-x * 18), 1.1), .4 * g);
}
function pluck(t, n, g = 1, pan = 0) {
  const f = midi(n); let ph = 0;
  put(music, t, gen(.22, x => { ph += f / SR; return (Math.sin(TAU * ph) + .35 * Math.sin(TAU * ph * 2)) * Math.exp(-x * 16); }), .1 * g, pan, .35);
}
function pad(t, notes, len, g = 1, cutoff = 900) {
  const voices = notes.flatMap(n => [-.1, .1].map(d => ({ f: midi(n + d), ph: rnd() })));
  const raw = gen(len, x => { let s = 0; for (const v of voices) { v.ph += v.f / SR; s += saw(v.ph); } return s / voices.length * Math.min(1, x / .35) * Math.min(1, (len - x) / .4); });
  put(music, t, biquad(raw, "lp", cutoff, .7), .32 * g, 0, .5);
}
function ping(t, n, g = 1, pan = 0) {
  const f = midi(n);
  put(fx, t, gen(1.4, x => (Math.sin(TAU * f * x) + .4 * Math.sin(TAU * f * 2.76 * x) * Math.exp(-x * 6) + .2 * Math.sin(TAU * f * 5.4 * x) * Math.exp(-x * 12)) * Math.exp(-x * 3.2) * Math.min(1, x / .002)), .16 * g, pan, .45);
}
function riser(t, len, g = 1, f0 = 300, f1 = 9000) {
  const raw = gen(len, x => noise() * (x / len) ** 2);
  put(fx, t, biquad(raw, "bp", x => f0 * (f1 / f0) ** (x / len), 1.4), .5 * g, 0, .3);
  let ph = 0;
  put(fx, t, gen(len, x => { ph += (180 * 2 ** (2.5 * x / len)) / SR; return Math.sin(TAU * ph) * (x / len) ** 3; }), .06 * g);
}
function whoosh(t, len = .35, g = 1, pan = 0) {
  const raw = gen(len, x => noise() * Math.sin(Math.PI * x / len) ** 2);
  put(fx, t, biquad(raw, "bp", x => 400 * 12 ** Math.sin(Math.PI * x / len), 1.2), .55 * g, pan, .25);
}
function impact(t, g = 1) {
  let ph = 0;
  put(fx, t, gen(1.6, x => { ph += TAU * (32 + 70 * Math.exp(-x * 8)) / SR; return Math.tanh(2 * Math.sin(ph)) * Math.exp(-x * 3.2); }), .45 * g);
  put(fx, t, biquad(gen(.9, x => noise() * Math.exp(-x * 5)), "lp", x => 5000 * Math.exp(-x * 4) + 200), .45 * g, 0, .6);
}
function tick(t, g = 1, pan = 0) {
  put(fx, t, gen(.04, x => (Math.sin(TAU * 2400 * x) * .6 + noise() * .4) * Math.exp(-x * 140)), .22 * g, pan);
}
function braam(t, g = 1) {
  const vs = [33, 45, 52, 57].flatMap(n => [-.08, .08].map(d => ({ f: midi(n + d), ph: rnd() })));
  const raw = gen(2.6, x => { let s = 0; for (const v of vs) { v.ph += v.f / SR; s += saw(v.ph); } return Math.tanh(s / vs.length * 2.2) * Math.min(1, x / .02) * Math.exp(-x * 1.1); });
  put(music, t, biquad(raw, "lp", x => 200 + 1600 * Math.exp(-x * 2.5), .8), .5 * g, 0, .5);
}

// ---------------------------------------------------------------- harmony
// Am F C G through the work; the film sits on F→G; Bóng returns to Am→G; the sign-off lands on C.
const CH = { Am: [57, 60, 64], F: [53, 57, 60], C: [55, 60, 64], G: [55, 59, 62] };
const ROOT = { Am: 33, F: 29, C: 36, G: 31 };
const chordAt = t => t < 2 ? "Am" : t < 12 ? ["Am", "F", "C", "G"][Math.floor((t - 2) / 2) % 4] : t < 13.5 ? "F" : t < 15 ? "G" : t < 16 ? "Am" : t < 17 ? "G" : "C";
const S16 = .125;

// 0 · hero: the dot, then one stab per word, then a clap roll into the drop.
impact(0, .55); ping(0.02, 88, 1.1); ping(0.14, 95, .5, .4);
riser(0, 2, .5, 200, 6000);
[.5, .75, 1.0, 1.25].forEach((t, i) => { supersaw(CH.Am.map(n => n + (i > 1 ? 12 : 0)), .12, 5200, .34, t, .18); kick(t, .8); });
ping(1.5, 93, 1.2);
for (let i = 0; i < 4; i++) clap(1.5 + i * S16, .35 + i * .15, .1);
whoosh(1.72, .3, 1.1);

// 1–4 · the groove (2 – 11.75)
for (let t = 2; t < 11.75; t += .5) kick(t);
for (let t = 2.5; t < 11.75; t += 1) clap(t);
for (let t = 2; t < 11.75; t += S16) {
  const s = Math.round((t - 2) / S16) % 4;
  hat(t, s === 2 ? 1 : s === 0 ? .55 : .75, false, s % 2 ? .3 : -.2);
  if (s === 2) hat(t, .7, true, .35);
}
for (let t = 2; t < 11.75; t += .5) { const c = chordAt(t); bass(t + .25, ROOT[c] + 12 * (Math.round((t - 2) / .5) % 4 === 3 ? 1 : 0)); }
for (let bar = 2; bar < 11.75; bar += 2) [3, 6, 11, 14].forEach(p => supersaw(CH[chordAt(bar)], .1, 4200, .26, bar + p * S16, .15, .25, p % 2 ? .25 : -.25));
for (let t = 3.5; t < 11.75; t += S16) { const c = CH[chordAt(t)], i = Math.round((t - 3.5) / S16); pluck(t, c[i % 3] + 12 + (i % 8 > 3 ? 12 : 0), .8 + .2 * (i % 2), i % 2 ? .45 : -.45); }
// transitions inside the groove
whoosh(5.15, .45, 1);                    // iris into Nhà Mình
tick(6.5, 1.2, -.3); ping(6.52, 84, .8, -.3);   // the tap
ping(7.13, 91, 1, .3); ping(7.25, 96, .5, .3);  // the heart lands
riser(7.4, .6, .8, 400, 9000); impact(8.0, .5); // zoom through the heart
impact(9.0, .35); whoosh(8.9, .2, .8, .4);
tick(9.5, 1, .2); tick(9.75, 1, -.2); whoosh(9.45, .15, .6, .5); whoosh(9.7, .15, .6, -.5);
impact(10.0, .35);
whoosh(10.26, .32, 1);                   // shutters
[10.5, 11.0, 11.5].forEach((t, i) => { tick(t, 1.2, [-.3, .3, 0][i]); whoosh(t - .08, .2, .6, [.5, -.5, .5][i]); });
whoosh(11.72, .3, 1.2);                  // letterbox closes

// 5 · the film (12 – 15): half-time, darker
braam(12.0, 1); impact(12.0, .8);
[12.0, 12.75, 14.0, 14.75].forEach(t => kick(t, .9));
[13.0, 14.0].forEach(t => clap(t, 1.1, .7));
for (let t = 12; t < 14.5; t += .25) hat(t, .45, false, (t * 4) % 2 ? .3 : -.3);
pad(12.0, CH.F.map(n => n - 12), 1.6, 1.1, 700); pad(13.5, CH.G.map(n => n - 12), 1.6, 1.1, 800);
bass(12.0, ROOT.F, 1.4, .8); bass(13.5, ROOT.G, 1.4, .8);
[12.5, 13.0, 13.5, 14.0, 14.25].forEach(t => tick(t, .5));
riser(14.0, 1.0, 1.2, 150, 10000);
put(fx, 14.5, biquad(gen(.5, x => noise() * (x / .5) ** 1.5), "lp", 900), .5); // fire rumble
impact(15.0, .9);

// 6 · Bóng Vespera (15 – 17): the groove returns, lighter and airy
pad(15.0, CH.Am, 1.05, .9, 1400); pad(16.0, CH.G, 1.05, .9, 1600);
for (let t = 15; t < 16.75; t += .5) kick(t, .8);
for (let t = 15.5; t < 16.75; t += 1) clap(t, .7, .4);
for (let t = 15; t < 16.75; t += S16) hat(t, .6, (Math.round((t - 15) / S16) % 4) === 2, (t * 8) % 2 ? .3 : -.3);
for (let t = 15; t < 16.75; t += .5) bass(t + .25, ROOT[chordAt(t)]);
[15.25, 15.625, 16.125, 16.375].forEach((t, i) => ping(t, [81, 88, 86, 83][i], .45, i % 2 ? .6 : -.6));
riser(16.25, .75, 1.1, 300, 10000);
for (let i = 0; i < 6; i++) clap(16.25 + i * S16, .25 + i * .1, .1);
whoosh(16.62, .4, 1.2);

// 7 · sign-off (17 – 20): lands on C
impact(17.0, 1); kick(17.0);
supersaw([48, 55, 60, 64, 67, 72], 1.6, x => 900 + 5000 * Math.exp(-x * 1.5), .38, 17.0, 1.6, .6);
bass(17.0, 36, 1.8, 1);
for (let t = 17.5; t < 19.5; t += .5) kick(t, .75);
for (let t = 17.5; t < 19.5; t += S16) hat(t, .45, false, (t * 8) % 2 ? .3 : -.3);
ping(17.5, 88, 1.1); ping(17.62, 95, .5, .4);
tick(18.0, .8, .4);
supersaw([48, 55, 60, 64, 67, 72], .9, 2600, .22, 19.5, 1.2, .6); kick(19.5, .8);

// ---------------------------------------------------------------- mix
// Sidechain: the music bus ducks under every kick, the house pump.
const duck = new Float32Array(N).fill(1);
for (const t of kicks) { const i0 = Math.round(t * SR); for (let i = 0; i < SR * .3 && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - .55 * Math.exp(-i / SR * 11)); }
// Freeverb-style room on the send bus.
function reverb(inp, off) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map(d => ({ b: new Float32Array(d + off), i: 0, f: 0 }));
  const aps = [556, 441, 341].map(d => ({ b: new Float32Array(d + off), i: 0 }));
  const out = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.f = y * .7 + c.f * .3; c.b[c.i] = inp[n] * .015 + c.f * .84; c.i = (c.i + 1) % c.b.length; s += y; }
    for (const a of aps) { const y = a.b[a.i]; a.b[a.i] = s + y * .5; a.i = (a.i + 1) % a.b.length; s = y - s; }
    out[n] = s;
  }
  return out;
}
const rv = [reverb(send[0], 0), reverb(send[1], 23)];
const L = new Float32Array(N), R = new Float32Array(N);
for (let n = 0; n < N; n++) {
  const t = n / SR, fadeOut = t > 19.5 ? Math.max(0, 1 - (t - 19.5) / .48) ** 1.5 : 1;
  for (const [o, ch] of [[L, 0], [R, 1]]) o[n] = (drums[ch][n] * .9 + music[ch][n] * duck[n] * .8 + fx[ch][n] * .8 + rv[ch][n] * 2.2) * fadeOut;
}
// Gain-stage on RMS, a soft knee instead of hard drive, a 30 Hz high-pass, then peak to -1 dBFS.
let sq = 0;
for (let n = 0; n < N; n++) sq += L[n] * L[n] + R[n] * R[n];
const pre = .2 / Math.sqrt(sq / (2 * N));
const knee = x => x / (1 + Math.abs(x) ** 3) ** (1 / 3);
const HL = biquad(L.map(x => knee(x * pre)), "hp", 30), HR = biquad(R.map(x => knee(x * pre)), "hp", 30);
let peak = 0;
for (let n = 0; n < N; n++) { L[n] = HL[n]; R[n] = HR[n]; peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n])); }
const norm = .89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(L[n] * norm * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(R[n] * norm * 32767), 46 + n * 4); }
mkdirSync(join(here, "out"), { recursive: true });
writeFileSync(join(here, "out", "score.wav"), buf);
console.log(`score.wav written, peak before norm ${peak.toFixed(3)}, kicks ${kicks.length}`);
