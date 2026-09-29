// Synthesises the v2 reel's score: 120 BPM, 30 s, C major, every hit on the same grid as the cuts
// in reel2.js. Writes out/score2.wav (48 kHz, 16-bit stereo). No samples, no licensed audio.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 30, N = SR * DUR;
const TAU = Math.PI * 2;
let seed = 23;
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
const saw = ph => 2 * (ph - Math.floor(ph + .5));

// ---------------------------------------------------------------- drums
const kicks = [];
function kick(t, g = 1) {
  kicks.push([t, g]);
  let ph = 0;
  put(drums, t, gen(.45, x => { ph += TAU * (50 + 130 * Math.exp(-x * 34)) / SR; return Math.tanh(1.7 * Math.sin(ph) * Math.exp(-x * 7)) + (x < .003 ? noise() * .7 : 0); }), .95 * g);
}
function clap(t, g = 1, rev = .22) {
  const raw = gen(.3, x => { const burst = [0, .01, .02].some(o => x >= o && x < o + .007) ? 1 : 0; return noise() * (burst ? 1 : Math.exp(-(x - .028) * 20) * (x > .028)); });
  put(drums, t, biquad(raw, "bp", 1600, .9), .72 * g, .05, rev);
}
function snare(t, g = 1, pan = 0) {
  let ph = 0;
  const body = gen(.18, x => { ph += TAU * (185 + 60 * Math.exp(-x * 40)) / SR; return Math.sin(ph) * Math.exp(-x * 22); });
  const wires = biquad(gen(.2, x => noise() * Math.exp(-x * 17)), "bp", 3200, .6);
  put(drums, t, body, .35 * g, pan, .15); put(drums, t, wires, .45 * g, pan, .2);
}
function hat(t, g = 1, open = false, pan = .25) {
  const raw = gen(open ? .26 : .05, x => noise() * Math.exp(-x * (open ? 14 : 75)));
  put(drums, t, biquad(raw, "hp", 8000, .7), (open ? .24 : .16) * g, pan);
}
function shaker(t, g = 1, pan = -.35) {
  const raw = gen(.07, x => noise() * Math.min(1, x / .012) * Math.exp(-x * 45));
  put(drums, t, biquad(raw, "bp", 9500, 1.2), .2 * g, pan);
}
function crash(t, g = 1) {
  const raw = gen(2.4, x => noise() * Math.exp(-x * 1.9) * Math.min(1, x / .002));
  put(fx, t, biquad(raw, "hp", 4800, .6), .34 * g, 0, .35);
}

// ---------------------------------------------------------------- tones
function supersaw(notes, len, cutoff, g, t, rel = .2, rev = .3, pan = 0) {
  const voices = notes.flatMap(n => [-.18, -.07, 0, .08, .17].map(d => ({ f: midi(n + d * .5), ph: rnd() })));
  const raw = gen(len + rel, x => {
    let s = 0; for (const v of voices) { v.ph += v.f / SR; s += saw(v.ph); }
    const env = Math.min(1, x / .004) * (x < len ? Math.exp(-x * 2) : Math.exp(-len * 2) * Math.exp(-(x - len) / rel * 4));
    return s / voices.length * env;
  });
  put(music, t, biquad(raw, "lp", typeof cutoff === "function" ? cutoff : x => cutoff * (.4 + .6 * Math.exp(-x * 6)), .9), g, pan, rev);
}
/** House piano: additive partials, each decaying faster than the last, slightly stretched. */
function piano(t, notes, len = .2, g = 1, pan = 0, rev = .28) {
  for (const n of notes) {
    const f = midi(n);
    const raw = gen(len + .3, x => {
      let s = 0;
      for (let k = 1; k <= 7; k++) s += Math.sin(TAU * f * k * (1 + .0005 * k * k) * x) * Math.exp(-x * (2.5 + k * 2.2)) / k ** 1.25;
      return s * Math.min(1, x / .0015) * (x < len ? 1 : Math.exp(-(x - len) * 22));
    });
    put(music, t, raw, .11 * g, pan, rev);
  }
}
function bass(t, n, len = .18, g = 1) {
  const f = midi(n); let ph = 0;
  const raw = gen(len + .03, x => { ph += f / SR; const env = Math.min(1, x / .003) * (x < len ? 1 : Math.exp(-(x - len) * 120)); return (Math.sin(TAU * ph) * .75 + saw(ph) * .4) * env; });
  put(music, t, biquad(raw, "lp", x => 300 + 1100 * Math.exp(-x * 16), 1.2), .42 * g);
}
function pluck(t, n, g = 1, pan = 0) {
  const f = midi(n); let ph = 0;
  put(music, t, gen(.2, x => { ph += f / SR; return (Math.sin(TAU * ph) + .45 * Math.sin(TAU * ph * 2) + .2 * Math.sin(TAU * ph * 3)) * Math.exp(-x * 18); }), .09 * g, pan, .35);
}
/** Lead: detuned pulse and saw with delayed vibrato, the hook voice. */
function lead(t, n, len, g = 1, pan = 0) {
  const f = midi(n); let p1 = 0, p2 = 0;
  const raw = gen(len + .12, x => {
    const vib = 1 + .005 * Math.sin(TAU * 5.6 * x) * Math.min(1, Math.max(0, x - .12) / .2);
    p1 += f * vib / SR; p2 += f * 1.006 * vib / SR;
    const env = Math.min(1, x / .006) * (x < len ? 1 - .25 * Math.min(1, x / .4) : .75 * Math.exp(-(x - len) * 30));
    return ((p1 % 1 < .32 ? .5 : -.5) + saw(p2) * .5) * env;
  });
  put(music, t, biquad(raw, "lp", x => 2600 + 2400 * Math.exp(-x * 8), .8), .12 * g, pan, .32);
}
function pad(t, notes, len, g = 1, cutoff = 1200) {
  const voices = notes.flatMap(n => [-.1, .1].map(d => ({ f: midi(n + d), ph: rnd() })));
  const raw = gen(len, x => { let s = 0; for (const v of voices) { v.ph += v.f / SR; s += saw(v.ph); } return s / voices.length * Math.min(1, x / .3) * Math.min(1, (len - x) / .35); });
  put(music, t, biquad(raw, "lp", cutoff, .7), .3 * g, 0, .5);
}
function ping(t, n, g = 1, pan = 0) {
  const f = midi(n);
  put(fx, t, gen(1.3, x => (Math.sin(TAU * f * x) + .4 * Math.sin(TAU * f * 2.76 * x) * Math.exp(-x * 6) + .2 * Math.sin(TAU * f * 5.4 * x) * Math.exp(-x * 12)) * Math.exp(-x * 3.4) * Math.min(1, x / .002)), .15 * g, pan, .45);
}
function riser(t, len, g = 1, f0 = 300, f1 = 9000) {
  put(fx, t, biquad(gen(len, x => noise() * (x / len) ** 2), "bp", x => f0 * (f1 / f0) ** (x / len), 1.4), .5 * g, 0, .3);
  let ph = 0;
  put(fx, t, gen(len, x => { ph += (220 * 2 ** (2.5 * x / len)) / SR; return Math.sin(TAU * ph) * (x / len) ** 3; }), .06 * g);
}
function whoosh(t, len = .35, g = 1, pan = 0) {
  put(fx, t, biquad(gen(len, x => noise() * Math.sin(Math.PI * x / len) ** 2), "bp", x => 400 * 12 ** Math.sin(Math.PI * x / len), 1.2), .5 * g, pan, .25);
}
function impact(t, g = 1) {
  let ph = 0;
  put(fx, t, gen(1.5, x => { ph += TAU * (34 + 70 * Math.exp(-x * 8)) / SR; return Math.tanh(2 * Math.sin(ph)) * Math.exp(-x * 3.4); }), .42 * g);
  put(fx, t, biquad(gen(.9, x => noise() * Math.exp(-x * 5)), "lp", x => 5000 * Math.exp(-x * 4) + 200), .4 * g, 0, .6);
}
/** A mechanical key: a click, a tiny thock underneath. */
function key(t, g = 1, pan = 0) {
  let ph = 0;
  put(fx, t, gen(.05, x => { ph += TAU * 2600 / SR; return (Math.sin(ph) * .5 + noise() * .5) * Math.exp(-x * 160); }), .2 * g, pan);
  put(fx, t, gen(.06, x => Math.sin(TAU * 170 * x) * Math.exp(-x * 70)), .16 * g, pan);
}
function tick(t, g = 1, pan = 0) {
  put(fx, t, gen(.04, x => (Math.sin(TAU * 2400 * x) * .6 + noise() * .4) * Math.exp(-x * 140)), .22 * g, pan);
}
function braam(t, g = 1) {
  const vs = [33, 45, 52, 57].flatMap(n => [-.08, .08].map(d => ({ f: midi(n + d), ph: rnd() })));
  const raw = gen(2.6, x => { let s = 0; for (const v of vs) { v.ph += v.f / SR; s += saw(v.ph); } return Math.tanh(s / vs.length * 2.2) * Math.min(1, x / .02) * Math.exp(-x * 1.1); });
  put(music, t, biquad(raw, "lp", x => 200 + 1600 * Math.exp(-x * 2.5), .8), .45 * g, 0, .5);
}

// ---------------------------------------------------------------- harmony
// C G Am F through the work (I V vi IV); the peak doubles the harmonic rhythm; Aru sits on
// Am F G; Bóng climbs F G Am G into the second drop; the sign-off lands on C.
const CH = { C: [60, 64, 67, 72], G: [59, 62, 67, 71], Am: [57, 60, 64, 69], F: [57, 60, 65, 69] };
const ROOT = { C: 36, G: 31, Am: 33, F: 29 };
const TIMELINE = [
  [0, "F"], [1, "G"],
  [2, "C"], [4, "G"], [6, "Am"], [8, "F"], [10, "C"], [12, "G"], [13, "Am"], [13.5, "F"], [14, "G"],
  [14.5, "C"], [15.5, "G"], [16.5, "Am"], [17.5, "F"], [18.5, "G"],
  [19, "Am"], [20.5, "F"], [21.5, "G"],
  [22.5, "F"], [23.5, "G"], [24.5, "Am"], [25, "G"],
  [25.5, "C"], [26, "G"], [26.5, "F"], [27, "C"],
];
const chordAt = t => { let c = TIMELINE[0][1]; for (const [s, n] of TIMELINE) if (t + 1e-6 >= s) c = n; return c; };
const S16 = .125;
const range = (a, b, step) => { const r = []; for (let t = a; t < b - 1e-6; t += step) r.push(+t.toFixed(4)); return r; };
const offbeat = t => Math.round(t * 2) % 2 === 1;

/** The groove: kick, clap on 2 and 4, open hat on the off, shaker 16ths, bouncing bass. */
function groove(a, b, g = 1) {
  for (const t of range(a, b, .5)) {
    kick(t, g);
    if (offbeat(t)) clap(t, g);
    hat(t + .25, .9 * g, true, .3);
    const r = ROOT[chordAt(t)];
    bass(t + .25, r, .16, g);
    bass(t + .375, r + 12, .09, .55 * g);
  }
  for (const t of range(a, b, S16)) shaker(t, (Math.round(t / S16) % 2 ? 1 : .55) * g, (Math.round(t / S16) % 4 < 2 ? -.35 : .35));
}
/** Piano house stabs on a 3-3-2 tresillo inside every half bar. */
function stabs(a, b, g = 1) {
  for (const t of range(a, b, 1)) [0, 3, 6].forEach((p, i) => {
    const at = t + p * S16; if (at >= b) return;
    piano(at, CH[chordAt(at)], i === 2 ? .14 : .2, (i === 0 ? 1 : .85) * g, i === 1 ? .2 : -.1);
  });
}
// The hook, one bar per chord: eighth-note steps, null holds the previous note.
const HOOK = {
  C: [76, null, 79, null, 81, 79, null, 76],
  G: [74, null, 74, 76, null, 74, 71, null],
  Am: [72, null, 76, null, 79, 76, null, 72],
  F: [72, null, 72, 74, null, 72, 69, 67],
};
function hook(a, b, g = 1, oct = 0) {
  const steps = range(a, b, .25);
  const noteAt = t => HOOK[chordAt(t)][Math.round((t - a) / .25) % 8];
  steps.forEach((t, i) => {
    const n = noteAt(t);
    if (n == null) return;
    let len = .25;
    for (let j = i + 1; j < steps.length && noteAt(steps[j]) == null && chordAt(steps[j]) === chordAt(t); j++) len += .25;
    lead(t, n + oct, len * .92, g, 0);
  });
}
/** 16th arpeggio over the current chord: the "nodes executing" figure. */
function arp(a, b, g = 1, up = 12) {
  range(a, b, S16).forEach((t, i) => { const c = CH[chordAt(t)]; pluck(t, c[[0, 1, 2, 3, 2, 1][i % 6]] + up, (i % 2 ? .75 : 1) * g, i % 2 ? .45 : -.45); });
}

// ================================================================ 0 · prompt (0 – 2)
// One key per character of the prompt on a 32nd grid; reel2.js types on the same grid.
const TYPE0 = .125, TYPE_STEP = .0625, PROMPT = "ideas into actual things";
[...PROMPT].forEach((c, i) => key(TYPE0 + i * TYPE_STEP, c === " " ? .5 : .75 + .25 * rnd(), (rnd() - .5) * .5));
pad(0, CH.F.map(n => n - 12), 1.05, .7, 900); pad(1, CH.G.map(n => n - 12), 1.0, .8, 1500);
riser(.5, 1.5, .8, 250, 8000);
for (const t of range(1.0, 1.75, S16)) snare(t, .25 + (t - 1) * .8, (t * 8) % 2 ? .2 : -.2);
piano(1.0, CH.G, .3, .5); piano(1.375, CH.G, .2, .6);
key(1.75, 1.6); tick(1.75, 1.4); ping(1.76, 91, 1.1); // Execute workflow
whoosh(1.78, .22, 1.1);

// ================================================================ 1 · the groove (2 – 14.5)
impact(2, .8); crash(2, 1);
groove(2, 13);
stabs(2, 13);
arp(5.5, 7, .9);                                           // PATI: nodes execute
range(5.5, 7, .25).forEach((t, i) => ping(t, [84, 86, 88, 91, 93, 96][i % 6], .35, i % 2 ? .5 : -.5));
whoosh(5.3, .25, .9); whoosh(6.8, .3, .9, -.3);
hook(7, 13, 1);                                            // Nhà Mình and Vitalité carry the hook
crash(10, .6); whoosh(9.8, .22, .9, .4);
[10.75, 11.5, 12.25].forEach((t, i) => whoosh(t - .1, .16, .7, i % 2 ? .5 : -.5));
// triptych: three slams, one per screen
[13, 13.5, 14].forEach((t, i) => { kick(t, 1); impact(t, .45); piano(t, CH[chordAt(t)].map(n => n + (i === 2 ? 12 : 0)), .35, 1.2); tick(t, 1.2, [-.4, .4, 0][i]); bass(t, ROOT[chordAt(t)], .35, 1); });
hat(13.25, .8, true); hat(13.75, .8, true);
for (const t of range(14, 14.5, S16 / 2)) snare(t, .35 + (t - 14) * 1.2, (t * 16) % 2 ? .25 : -.25);

// ================================================================ 2 · Video & brand (14.5 – 19): peak
impact(14.5, 1); crash(14.5, 1.1);
groove(14.5, 18.75, 1.05);
for (const t of range(14.5, 18.75, .5)) supersaw(CH[chordAt(t + .25)], .16, 5200, .24, t + .25, .12, .22);
stabs(14.5, 18.75, .9);
hook(14.5, 18.75, 1.1, 0); hook(14.5, 18.75, .5, 12);
arp(16.5, 18.75, .6, 24);
[15.5, 16.5, 17.5].forEach(t => crash(t, .35));
for (const t of range(18.75, 19, S16 / 2)) snare(t, .5 + (t - 18.75) * 2, 0);
whoosh(18.7, .3, 1.1);

// ================================================================ 3 · Aru Otoko (19 – 22.5): breakdown
braam(19, 1); impact(19, .9);
pad(19, CH.Am.map(n => n - 12), 1.55, 1, 800); pad(20.5, CH.F.map(n => n - 12), 1.05, 1, 1000); pad(21.5, CH.G.map(n => n - 12), 1.05, 1, 1300);
bass(19, ROOT.Am, 1.4, .8); bass(20.5, ROOT.F, .95, .8); bass(21.5, ROOT.G, .95, .8);
[20, 21, 22].forEach(t => clap(t, 1, .6));
[20.5, 21, 21.5, 22].forEach(t => kick(t, .7));
range(20.5, 22.5, .25).forEach(t => hat(t, .4, false, (t * 4) % 2 ? .3 : -.3));
[19.5, 20.25, 21.0, 21.75].forEach((t, i) => piano(t, CH[chordAt(t)].map(n => n + 12), .4, .45, i % 2 ? .4 : -.4, .6));
[20.5, 21, 21.5, 22].forEach(t => tick(t, .5));
whoosh(22.2, .3, 1);

// ================================================================ 4 · Bóng Vespera (22.5 – 25.5): airy build
pad(22.5, CH.F, 1.05, .9, 1800); pad(23.5, CH.G, 1.05, .9, 2200); pad(24.5, CH.Am, .55, .9, 2800); pad(25, CH.G, .45, .9, 3600);
for (const t of range(22.5, 25.25, .5)) { kick(t, .45 + (t - 22.5) * .15); bass(t + .25, ROOT[chordAt(t)], .16, .7); }
for (const t of range(23.5, 25.25, .5)) hat(t + .25, .7, true);
[22.625, 23.0, 23.375, 23.875, 24.25, 24.625].forEach((t, i) => ping(t, [81, 84, 88, 86, 91, 93][i], .5, i % 2 ? .6 : -.6));
arp(23.5, 25.25, .6, 12);
riser(23.5, 2, 1.2, 200, 11000);
for (const t of range(24.5, 25, S16)) snare(t, .35);
for (const t of range(25, 25.375, S16 / 2)) snare(t, .5 + (t - 25) * 1.4);
whoosh(25.2, .3, 1.2);

// ================================================================ 5 · Output (25.5 – 27): second drop
impact(25.5, 1.1); crash(25.5, 1.2);
groove(25.5, 27, 1.1);
for (const t of range(25.5, 27, .5)) supersaw(CH[chordAt(t + .25)], .16, 6000, .26, t + .25, .12, .22);
supersaw(CH.C.map(n => n - 12), .5, 6500, .22, 25.5, .3, .4);
stabs(25.5, 27, 1);
hook(25.5, 27, 1.1); hook(25.5, 27, .5, 12);
arp(25.5, 27, .6, 24);

// ================================================================ 6 · sign-off (27 – 30): lands on C
impact(27, .9); crash(27, .9); kick(27, 1);
supersaw([48, 55, 60, 64, 67, 72, 76], 1.8, x => 900 + 5200 * Math.exp(-x * 1.4), .34, 27, 1.4, .6);
bass(27, 36, 1.9, 1);
for (const t of range(27.5, 29, .5)) { kick(t, .7); hat(t + .25, .6, true); }
for (const t of range(27.5, 29, S16)) shaker(t, .6);
[27.5, 27.875, 28.25, 28.5].forEach((t, i) => piano(t, CH.C.map(n => n + (i === 3 ? 12 : 0)), .2, .75, i % 2 ? .3 : -.3));
ping(27.5, 88, 1); ping(27.62, 91, .6, .4); ping(27.75, 96, .45, -.4);
piano(29, [48, 55, 60, 64, 67, 72, 76], .6, .9, 0, .6); kick(29, .6);

// ---------------------------------------------------------------- mix
// Sidechain: the music bus ducks under every kick, lighter than v1 so the groove bounces.
const duck = new Float32Array(N).fill(1);
for (const [t, g] of kicks) { const i0 = Math.round(t * SR), d = .42 * Math.min(1, g); for (let i = 0; i < SR * .28 && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - d * Math.exp(-i / SR * 12)); }
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
  const t = n / SR, fadeOut = t > 29.3 ? Math.max(0, 1 - (t - 29.3) / .65) ** 1.5 : 1;
  for (const [o, ch] of [[L, 0], [R, 1]]) o[n] = (drums[ch][n] * .9 + music[ch][n] * duck[n] * .85 + fx[ch][n] * .8 + rv[ch][n] * 2.2) * fadeOut;
}
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
writeFileSync(join(here, "out", "score2.wav"), buf);
console.log(`score2.wav written, peak before norm ${peak.toFixed(3)}, kicks ${kicks.length}`);
