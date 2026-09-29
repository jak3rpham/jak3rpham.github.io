// Reel v2, "Execute workflow". One run of a workflow: a signal leaves the Execute button, runs a
// glowing wire through a node per project, and the camera flies the wire. Every frame is a pure
// function of t: seek(t) sets the camera, every uniform and every texture, then renders.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Pass } from "three/addons/postprocessing/Pass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/addons/objects/Reflector.js";

const W = 1920, H = 1080, DUR = 30;
const P = p => "../public/" + p;

// ================================================================ math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, d) => clamp((t - a) / d);
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = u => ((ax * u + bx) * u + cx) * u, sy = u => ((ay * u + by) * u + cy) * u;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = 1, u = x;
    for (let i = 0; i < 40; i++) { const v = sx(u); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = u; else hi = u; u = (lo + hi) / 2; }
    return sy(u);
  };
}
const E = {
  lin: x => x,
  out: cubicBezier(.23, 1, .32, 1),
  io: cubicBezier(.77, 0, .175, 1),
  in3: x => x * x * x,
  out3: x => 1 - (1 - x) ** 3,
  io3: x => x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2,
};
function rng(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let q = Math.imul(seed ^ (seed >>> 15), 1 | seed); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (o, p) => V3(o[0] + p[0], o[1] + p[1], o[2] + p[2]);
const qbez = (a, c, b, s) => V3(0, 0, 0).addScaledVector(a, (1 - s) ** 2).addScaledVector(c, 2 * s * (1 - s)).addScaledVector(b, s * s);

// ================================================================ renderer, post
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0);
scene.fog = new THREE.FogExp2(0x000000, .05);
const camera = new THREE.PerspectiveCamera(30, W / H, .05, 900);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;

class Hook extends Pass { constructor(fn) { super(); this.fn = fn; this.needsSwap = false; } render() { this.fn(); } }
const noDepth = [];
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new Hook(() => noDepth.forEach(o => { o.userData.vis = o.visible; o.visible = false; })));
const bokeh = new BokehPass(scene, camera, { focus: 4, aperture: .002, maxblur: .01 });
composer.addPass(bokeh);
composer.addPass(new Hook(() => noDepth.forEach(o => { o.visible = o.userData.vis; })));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .8, .55, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 1 }, uBars: { value: 0 }, uCA: { value: .005 }, uGrain: { value: .03 }, uVig: { value: .5 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uFade, uBars, uCA, uGrain, uVig; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    void main(){
      vec2 c = vUv - .5; float d = dot(c, c); vec2 off = c * d * uCA;
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col *= 1.0 - uVig * smoothstep(.35, .95, length(c * vec2(1.0, .72)) * 1.35);
      col += (hash(vUv * vec2(1920.0, 1080.0) + floor(uTime * 60.0) * 1.37) - .5) * uGrain;
      col *= uFade;
      float bh = uBars * .128;
      if (vUv.y < bh || vUv.y > 1.0 - bh) col = vec3(0.0);
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(grade);

// ================================================================ textures
const TEX = new Map();
async function decode(url, maxW, maxH) {
  const blob = await (await fetch(url)).blob();
  let bmp = await createImageBitmap(blob, { imageOrientation: "flipY", premultiplyAlpha: "none" });
  const s = Math.min(1, maxW / bmp.width, maxH / bmp.height);
  if (s < 1) {
    const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s), src = bmp;
    bmp = await createImageBitmap(src, { resizeWidth: w, resizeHeight: h, resizeQuality: "high" }); src.close();
  }
  const tex = new THREE.Texture(bmp);
  tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  tex.userData.asp = bmp.width / bmp.height;
  return tex;
}
let frameNo = 0;
const texKey = (url, maxW) => maxW >= 2048 ? url : `${url}@${maxW}`;
function load(url, maxW = 2048, maxH = 4096, frame = false) {
  const k = texKey(url, maxW);
  let e = TEX.get(k);
  if (!e) { e = { p: decode(url, maxW, maxH).catch(() => { console.warn("missing " + url); return null; }), tex: null, frame, used: 0 }; e.p.then(t => { e.tex = t; }); TEX.set(k, e); }
  e.used = frameNo;
  return e.p;
}
const tex = url => { const e = TEX.get(url); if (!e || !e.tex) throw new Error("not preloaded " + url); return e.tex; };
function evict() {
  const frames = [...TEX.entries()].filter(([, e]) => e.frame && e.tex).sort((a, b) => a[1].used - b[1].used);
  for (let i = 0; i < frames.length - 120; i++) { frames[i][1].tex.image.close?.(); frames[i][1].tex.dispose(); TEX.delete(frames[i][0]); }
}
function canvasTex(w, h) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.asp = w / h;
  return { cv, ctx: cv.getContext("2d"), tex: t };
}
function radialTex(stops, size = 256) {
  const { ctx, tex: t } = canvasTex(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); t.needsUpdate = true;
  return t;
}

// ================================================================ screens and panels
const SCREEN_VS = `
#include <common>
#include <fog_pars_vertex>
varying vec2 vUv;
void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`;
const SCREEN_FS = `
#include <common>
#include <fog_pars_fragment>
uniform sampler2D map; uniform sampler2D map2; uniform vec4 crop; uniform vec4 crop2;
uniform float mixv, wipe, blur, opacity, gain, zoom, has2, edge, asp; uniform vec2 pan; uniform vec3 tint, edgeCol;
varying vec2 vUv;
vec3 samp(sampler2D m, vec4 cr, vec2 q){
  if (blur < .0004) return texture2D(m, cr.xy + q * cr.zw).rgb;
  vec3 s = vec3(0.0);
  for (int i = 0; i < 16; i++) { float fi = float(i); float a = fi * 2.39996; float r = sqrt((fi + .5) / 16.0);
    s += texture2D(m, cr.xy + (q + vec2(cos(a), sin(a) * asp) * r * blur) * cr.zw).rgb; }
  return s / 16.0;
}
void main(){
  vec2 q = clamp((vUv - .5) / zoom + .5 + pan, 0.0, 1.0);
  vec3 col = samp(map, crop, q);
  if (has2 > .5) {
    vec3 b = samp(map2, crop2, q);
    if (wipe > .5) { float e = mixv * 1.1 - .05; float m = 1.0 - smoothstep(e - .012, e + .012, vUv.x); col = mix(col, b, m) + edgeCol * exp(-abs(vUv.x - e) * 160.0) * edge; }
    else col = mix(col, b, mixv);
  }
  gl_FragColor = vec4(col * gain * tint, opacity);
#include <fog_fragment>
}`;
function screenMat() {
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    map: { value: null }, map2: { value: null }, crop: { value: new THREE.Vector4(0, 0, 1, 1) }, crop2: { value: new THREE.Vector4(0, 0, 1, 1) },
    mixv: { value: 0 }, wipe: { value: 0 }, blur: { value: 0 }, opacity: { value: 1 }, gain: { value: .92 }, zoom: { value: 1 }, has2: { value: 0 },
    edge: { value: 0 }, asp: { value: 1.78 }, pan: { value: new THREE.Vector2() }, tint: { value: new THREE.Color(1, 1, 1) }, edgeCol: { value: new THREE.Color(4, 2.2, .7) },
  }]);
  return new THREE.ShaderMaterial({ uniforms: u, vertexShader: SCREEN_VS, fragmentShader: SCREEN_FS, fog: true });
}
/** Crop (offset, scale) that makes a texture cover a box; ay = 1 anchors the top. reg limits the source (u0, v0, u1, v1). */
function cover(texAsp, boxAsp, ax = .5, ay = .5, reg = [0, 0, 1, 1]) {
  const rw = reg[2] - reg[0], rh = reg[3] - reg[1], ra = texAsp * rw / rh;
  let sw = rw, sh = rh;
  if (ra > boxAsp) sw = rw * boxAsp / ra; else sh = rh * ra / boxAsp;
  return new THREE.Vector4(reg[0] + (rw - sw) * ax, reg[1] + (rh - sh) * ay, sw, sh);
}
const geo = new Map();
const rbox = (w, h, d, r) => { const k = [w, h, d, r].join(); if (!geo.has(k)) geo.set(k, new RoundedBoxGeometry(w, h, d, 3, r)); return geo.get(k); };
function panel({ w, h, d = .035, r = .014, inset = .018, frame = 0x0e0f10, rough = .32, metal = .55, map = null, fit = {} }) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: frame, roughness: rough, metalness: metal });
  const body = new THREE.Mesh(rbox(w, h, d, r), bodyMat);
  const sw = w - 2 * inset, sh = h - 2 * inset, mat = screenMat();
  mat.uniforms.asp.value = sw / sh;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat);
  scr.position.z = d / 2 + .0015;
  g.add(body, scr);
  g.userData = { body, bodyMat, scr, mat, u: mat.uniforms, sw, sh, d };
  if (map) setMap(g, map, fit);
  return g;
}
function setMap(p, t, fit = {}, slot = 1) {
  const u = p.userData.u, c = cover(t.userData.asp, p.userData.sw / p.userData.sh, fit.ax ?? .5, fit.ay ?? .5, fit.reg);
  if (slot === 1) { u.map.value = t; u.crop.value.copy(c); } else { u.map2.value = t; u.crop2.value.copy(c); u.has2.value = 1; }
}
function opacity(p, o) {
  const { mat, bodyMat } = p.userData;
  mat.uniforms.opacity.value = o; mat.transparent = o < .999; mat.depthWrite = o > .5;
  bodyMat.opacity = o; bodyMat.transparent = o < .999; bodyMat.depthWrite = o > .5;
  p.visible = o > .002;
}
// Video frames are resolved during seek() and assigned once decoded.
const jobs = [];
const shown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
function video(p, url, fit = {}, slot = 1) { if (shown(p)) jobs.push({ p, url, fit, slot }); }
const seqUrl = (base, count, fps, local, loop = true, pad = 4, ext = "jpg") => {
  let i = Math.floor(local * fps + 1e-6);
  i = loop ? ((i % count) + count) % count : clamp(i, 0, count - 1);
  return base + String(i + 1).padStart(pad, "0") + "." + ext;
};
const CLIPS = {
  "nha-sync": 75, "nha-voice": 90, "nha-vital": 60, "bong-motion": 152,
  "mrbrown-drink": 42, "mrbrown-can": 42, "mrbrown-toast": 30, "aris-pack": 42, "aris-profile": 30, "aris-pink": 30,
  "yl-night": 30, "yl-hand": 30, "loa-walk": 29, "loa-city": 29, "isbe-group": 29, "isbe-dance": 30,
  "mdh-walk": 30, "mdh-reach": 30, "hn-wave": 29, "hn-stage": 30,
};
const clip = (id, local, loop = true) => seqUrl(`cache/v2/${id}/`, CLIPS[id], 30, local, loop);

// Contact shadow and floor glow: soft discs laid on the floor.
let SHADOW, GLOW;
function blob(parent, x, z, w, dpt, o = .55) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, dpt), new THREE.MeshBasicMaterial({ map: SHADOW, color: 0x000000, transparent: true, opacity: o, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); parent.add(m); noDepth.push(m); return m;
}
function pool(parent, x, z, r, color, o = .5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: GLOW, color, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); parent.add(m); noDepth.push(m); return m;
}

// ================================================================ type on canvases
const F = { disp: '"Bricolage Grotesque", sans-serif', mono: '"DM Mono", monospace', viet: '"Be Vietnam Pro", sans-serif', jp: '"Noto Serif JP", serif' };
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ================================================================ world layout
// Each project is a set on the studio floor, 26 m apart; the wire runs through a node at each set's
// entry. Sets face +z; the camera works from +z and flies the wire between them.
const ORG = { prompt: [0, 0, 0], terra: [26, 0, -4], pati: [52, 0, 4], nha: [78, 0, -4], vit: [104, 0, 4], trio: [130, 0, -4], video: [156, 0, 4], aru: [184, 0, -4], bong: [212, 0, 4] };
const HUB = [106, 0, 26];
const ORDER = ["terra", "pati", "nha", "vit", "trio", "video", "aru", "bong"];
const ACCENT = { prompt: "#c0e686", terra: "#c9f49b", pati: "#ff6d5a", nha: "#ff5f3d", vit: "#e2405f", trio: "#ec6a22", video: "#ffb35c", aru: "#e9a54b", bong: "#a9d6c8", hub: "#c0e686" };
const LABEL = { terra: "terra", pati: "PATI", nha: "Nhà Mình", vit: "Vitalité", trio: "Studio · UpHub · Club", video: "Video & brand", aru: "Aru Otoko", bong: "Bóng Vespera" };
const EXIT_X = { terra: 8.4, pati: 7.2, nha: 6.4, vit: 9.4, trio: 3.8, video: 4.8, aru: 3.2, bong: 3.2 };
// Camera windows: the camera arrives at a set and leaves it; transits straddle the music's cuts.
const WIN = { terra: [2.45, 5.3], pati: [5.8, 6.85], nha: [7.3, 9.8], vit: [10.3, 12.75], trio: [13.0, 14.3], video: [14.5, 18.7], aru: [19.15, 22.3], bong: [22.75, 25.5] };
const TRANSITS = [[2.0, WIN.terra[0]], ...ORDER.slice(1).map((n, i) => [WIN[ORDER[i]][1], WIN[n][0]])];
const INDEX = { terra: "01", pati: "02", nha: "03", vit: "04", trio: "05", video: "06", aru: "07", bong: "08" };

const LOOKS = {
  prompt: { bg: "#0b0d0b", fog: .06, env: .35, refl: .32, bloom: .8, thr: 1.0, ap: .0024, vig: .55, warm: 0, shake: 0, hud: "#f1f3ea" },
  terra: { bg: "#e2e6d6", fog: .055, env: .7, refl: .16, bloom: .22, thr: 1.05, ap: .0022, vig: .3, warm: 0, shake: .004, hud: "#14170f" },
  pati: { bg: "#1b1c1e", fog: .06, env: .4, refl: .34, bloom: .9, thr: 1.0, ap: .003, vig: .5, warm: 0, shake: .003, hud: "#f1f3ea" },
  nha: { bg: "#f0d3bd", fog: .055, env: .7, refl: .16, bloom: .22, thr: 1.05, ap: .0028, vig: .3, warm: 0, shake: .004, hud: "#352c24" },
  vit: { bg: "#0d0d0d", fog: .06, env: .35, refl: .4, bloom: .8, thr: 1.0, ap: .0024, vig: .5, warm: 0, shake: .004, hud: "#f3f2ee" },
  trio: { bg: "#16130f", fog: .06, env: .45, refl: .34, bloom: .8, thr: 1.0, ap: .0018, vig: .5, warm: 0, shake: .003, hud: "#f3ebdd" },
  video: { bg: "#120b05", fog: .07, env: .4, refl: .4, bloom: .9, thr: 1.0, ap: .0028, vig: .55, warm: .35, shake: .005, hud: "#fff4e6" },
  aru: { bg: "#050505", fog: .05, env: .25, refl: .3, bloom: 1.1, thr: .72, ap: .0016, vig: .6, warm: 1, shake: .003, hud: "#e9a54b" },
  bong: { bg: "#0e2a27", fog: .09, env: .5, refl: .22, bloom: .8, thr: .95, ap: .0028, vig: .5, warm: 0, shake: .003, hud: "#efe6c8" },
  output: { bg: "#06080a", fog: .0025, env: .3, refl: .45, bloom: 1.3, thr: .9, ap: 0, vig: .45, warm: 0, shake: 0, hud: "#f1f3ea" },
  sign: { bg: "#0b0d0b", fog: .05, env: .35, refl: .28, bloom: .7, thr: 1.0, ap: .0016, vig: .5, warm: 0, shake: .002, hud: "#f1f3ea" },
};
const LOOK_KEYS = [[0, "prompt"], [2.05, "prompt"], [2.4, "terra"], [5.35, "terra"], [5.75, "pati"], [6.9, "pati"], [7.25, "nha"], [9.85, "nha"],
  [10.25, "vit"], [12.78, "vit"], [12.98, "trio"], [14.22, "trio"], [14.45, "video"], [18.75, "video"], [19.1, "aru"], [22.35, "aru"],
  [22.7, "bong"], [25.45, "bong"], [25.75, "output"], [27.25, "output"], [27.85, "sign"]];
const LOOK_NUM = ["fog", "env", "refl", "bloom", "thr", "ap", "vig", "warm", "shake"];
function lookAt(t) {
  let i = 0; while (i < LOOK_KEYS.length - 1 && t >= LOOK_KEYS[i + 1][0]) i++;
  const [ta, a] = LOOK_KEYS[i], [tb, b] = LOOK_KEYS[Math.min(i + 1, LOOK_KEYS.length - 1)];
  const k = tb > ta ? E.io3(prog(t, ta, tb - ta)) : 0, A = LOOKS[a], B = LOOKS[b], o = {};
  for (const n of LOOK_NUM) o[n] = lerp(A[n], B[n], k);
  o.bg = new THREE.Color(A.bg).lerp(new THREE.Color(B.bg), k);
  o.hud = k < .5 ? A.hud : B.hud;
  return o;
}

// ================================================================ camera
const KEYS = [];
function key(t, org, pos, look, o = {}) {
  KEYS.push({ t, pos: add(org, pos), look: add(org, look), fov: o.fov, ease: o.ease || E.io, focus: o.focus ? add(org, o.focus) : null,
    posVia: o.posVia ? add(o.viaOrg || org, o.posVia) : null, lookVia: o.lookVia ? add(o.viaOrg || org, o.lookVia) : null, roll: o.roll || 0 });
}
function camAt(t) {
  let i = 0; while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1], s = b.ease(prog(t, a.t, b.t - a.t));
  const pos = b.posVia ? qbez(a.pos, b.posVia, b.pos, s) : a.pos.clone().lerp(b.pos, s);
  const look = b.lookVia ? qbez(a.look, b.lookVia, b.look, s) : a.look.clone().lerp(b.look, s);
  const focus = (a.focus || a.look).clone().lerp(b.focus || b.look, s);
  return { pos, look, focus, fov: lerp(a.fov, b.fov, s), roll: lerp(a.roll, b.roll, s) };
}

// ================================================================ build
const hud = document.getElementById("hud");
const world = {};           // name -> THREE.Group
const upd = [];             // per-frame updaters
let wire, wireMat, head, headGlow, headLight, floor, signal = [], U = {};
const STATIC = [];

function group(name) { const g = new THREE.Group(); g.position.set(...ORG[name] || HUB); g.userData.org = (ORG[name] || HUB).slice(); scene.add(g); world[name] = g; return g; }

function nodeBlock(g, name) {
  const n = new THREE.Group(); n.position.set(-4.6, 0, 1.7); g.add(n);
  const block = new THREE.Mesh(rbox(.44, .4, .44, .07), new THREE.MeshStandardMaterial({ color: 0x1c1f1d, roughness: .42, metalness: .3 }));
  block.position.y = .21; n.add(block);
  const { ctx, tex: t } = canvasTex(256, 232);
  ctx.fillStyle = "#1c1f1d"; ctx.fillRect(0, 0, 256, 232);
  ctx.fillStyle = ACCENT[name]; ctx.font = `500 30px ${F.mono}`; ctx.fillText(INDEX[name], 22, 50);
  ctx.fillStyle = "#f1f3ea"; ctx.font = `700 34px ${F.disp}`;
  const words = LABEL[name].split(" · "); words.forEach((w, i) => ctx.fillText(w, 22, 130 + i * 40));
  t.needsUpdate = true;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.36, .326), new THREE.MeshBasicMaterial({ map: t }));
  face.position.set(0, .21, .222); n.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.36, .012, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(ACCENT[name]) }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .02; n.add(ring);
  const base = new THREE.Color(ACCENT[name]);
  upd.push(t => {
    const at = WIN[name][0] - .05, k = t < at ? .25 : 1.3 + 3.5 * Math.exp(-(t - at) * 4);
    ring.material.color.copy(base).multiplyScalar(k);
  });
  blob(g, -4.6, 1.72, .9, .9, .5);
  return n;
}

// ---------------------------------------------------------------- 0 · prompt (0 – 2)
const TYPE0 = .125, TYPE_STEP = .0625, PROMPT = "ideas into actual things";
function buildPrompt() {
  const g = group("prompt");
  const card = panel({ w: 2.6, h: 1.1, d: .06, r: .03, inset: .03, frame: 0x121412, metal: .35, rough: .25 });
  card.position.set(0, 1.3, 0); g.add(card);
  const P1 = canvasTex(1600, 640); setMap(card, P1.tex);
  const btn = new THREE.Group(); btn.position.set(0, .95, .03); g.add(btn);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xe8503a, roughness: .35, metalness: .1, emissive: new THREE.Color("#ff5a3c"), emissiveIntensity: .15 });
  const bb = new THREE.Mesh(rbox(.64, .15, .04, .03), btnMat); bb.position.z = .02; btn.add(bb);
  const L = canvasTex(640, 150);
  L.ctx.fillStyle = "#fff"; L.ctx.font = `600 54px ${F.viet}`; L.ctx.textAlign = "center"; L.ctx.textBaseline = "middle";
  L.ctx.fillText("⚡ Execute workflow", 320, 78); L.tex.needsUpdate = true;
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(.6, .14), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true }));
  lab.position.z = .0415; btn.add(lab);
  blob(g, 0, .05, 3.2, 1.1, .7);
  const lamp = new THREE.PointLight(0xc0e686, 1.2, 5, 2); lamp.position.set(-1.2, 2.2, 1.6); g.add(lamp);
  const { ctx } = P1;
  upd.push(t => {
    ctx.fillStyle = "#15171a"; ctx.fillRect(0, 0, 1600, 640);
    ctx.fillStyle = "#2a2e2c"; ctx.fillRect(0, 0, 1600, 70);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(40 + i * 30, 35, 9, 0, 7); ctx.fill(); });
    ctx.fillStyle = "#9aa39a"; ctx.font = `400 26px ${F.mono}`; ctx.fillText("tatsuki  /  workflow", 150, 44);
    ctx.fillStyle = "#c0e686"; rr(ctx, 70, 120, 238, 46, 23); ctx.fill();
    ctx.fillStyle = "#14170f"; ctx.font = `500 24px ${F.mono}`; ctx.fillText("PROMPT", 104, 151);
    ctx.strokeStyle = "#3a403c"; ctx.lineWidth = 3; rr(ctx, 70, 196, 1460, 170, 22); ctx.stroke();
    const n = clamp(Math.floor((t - TYPE0) / TYPE_STEP) + 1, 0, PROMPT.length), typed = PROMPT.slice(0, n);
    ctx.fillStyle = "#c0e686"; ctx.font = `500 58px ${F.mono}`; ctx.fillText("›", 104, 300);
    ctx.fillStyle = "#f1f3ea"; ctx.font = `500 76px ${F.disp}`; ctx.fillText(typed, 160, 306);
    const cx = 160 + ctx.measureText(typed).width + 8, typing = t > TYPE0 && n < PROMPT.length;
    if (typing || Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = "#c0e686"; ctx.fillRect(cx, 238, 6, 84); }
    P1.tex.needsUpdate = true;
    const press = t >= 1.75 ? E.out(prog(t, 1.75, .12)) * (1 - E.out(prog(t, 1.87, .2))) : 0;
    btn.position.z = .03 - press * .014; btn.scale.setScalar(1 - press * .03);
    btnMat.emissiveIntensity = t < 1.75 ? .15 : .15 + .9 * Math.exp(-(t - 1.75) * 4);
  });
  key(0, ORG.prompt, [-.5, 1.42, 3.45], [0, 1.25, 0], { fov: 30 });
  key(1.45, ORG.prompt, [-.22, 1.35, 2.75], [0, 1.24, 0], { fov: 30, ease: E.io });
  key(1.72, ORG.prompt, [.13, 1.05, .74], [0, .95, .05], { fov: 30, focus: [0, .95, .05] });
  key(2.0, ORG.prompt, [.03, .99, .36], [0, .95, 0], { fov: 30, ease: E.in3, focus: [0, .95, .05] });
}

// ---------------------------------------------------------------- 1 · terra (2 – 5.5)
const CHART = "M0,162.2 L37.5,155.7 L75,148.4 L112.5,136.3 L150,131.7 L187.5,140.4 L225,144.5 L262.5,135.5 L300,63.5 L337.5,35 L375,108.7 L412.5,104.5 L450,57.5 L487.5,32.3 L525,100.1 L562.5,12 L600,128.2"
  .match(/[\d.]+,[\d.]+/g).map(p => p.split(",").map(Number));
function buildTerra() {
  const g = group("terra"), o = ORG.terra; nodeBlock(g, "terra");
  STATIC.push(P("images/visuals/publishing-machine.webp"), P("images/terra-outsourcing-preview.webp"), P("images/terra-compliance-preview.webp"),
    P("images/terra-customers-preview.webp"), P("images/terra-hrsystem-preview.webp"),
    ...["02-law-update-econtract-vi", "03-culture-appreciation-party", "04-seasonal-womens-day", "05-service-explainer-si-expat", "06-culture-team-photo", "07-event-recap-terra-say-hi"].map(s => P(`images/terra-social/${s}.webp`)));
  return () => {
    const machine = panel({ w: 4.2, h: 2.8, d: .04, inset: .06, frame: 0xf6f6f1, rough: .6, metal: 0, map: tex(P("images/visuals/publishing-machine.webp")) });
    machine.position.set(.2, 1.44, -2.4); g.add(machine); blob(g, .2, -2.3, 4.8, 1.2, .35);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.7, .34, .8), new THREE.MeshStandardMaterial({ color: 0xcfd4c1, roughness: .8 }));
    plinth.position.set(-.5, .17, -.7); g.add(plinth); blob(g, -.5, -.7, 2.2, 1.3, .45);
    const pages = ["terra-outsourcing-preview", "terra-compliance-preview", "terra-customers-preview", "terra-hrsystem-preview"];
    const cards = pages.map((n, i) => {
      const pivot = new THREE.Group(); pivot.position.set(-.5, .34, -.62 + i * .012); g.add(pivot);
      const c = panel({ w: .95, h: 1.4, d: .012, r: .006, inset: .012, frame: 0xffffff, rough: .7, metal: 0, map: tex(P(`images/${n}.webp`)), fit: { ay: 1 } });
      c.position.y = .7; pivot.add(c); return pivot;
    });
    const posts = ["02-law-update-econtract-vi", "03-culture-appreciation-party", "04-seasonal-womens-day", "05-service-explainer-si-expat", "06-culture-team-photo", "07-event-recap-terra-say-hi"].map((n, i) => {
      const c = panel({ w: .78, h: .44, d: .014, r: .006, inset: .01, frame: 0xffffff, rough: .7, metal: 0, map: tex(P(`images/terra-social/${n}.webp`)) });
      g.add(c); return c;
    });
    const stats = panel({ w: 3.2, h: 1.8, d: .05, inset: .03, frame: 0x123f27, rough: .4, metal: .2 });
    stats.position.set(6.3, 1.12, -.9); g.add(stats); blob(g, 6.3, -.85, 3.6, 1.0, .4);
    const post = new THREE.Mesh(new THREE.BoxGeometry(.08, .22, .08), new THREE.MeshStandardMaterial({ color: 0x123f27 })); post.position.set(6.3, .11, -.9); g.add(post);
    const S = canvasTex(1920, 1080); setMap(stats, S.tex);
    upd.push(t => {
      const fan = [-21, -7, 7, 21];
      cards.forEach((c, i) => { const k = E.out(prog(t, 2.3 + i * .05, .6)); c.rotation.z = THREE.MathUtils.degToRad(lerp(i * .6 - .9, -fan[i], k)); c.position.x = -.5 + lerp(0, (i - 1.5) * .34, k); });
      posts.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3), k = E.out(prog(t, 2.95 + i * .06, .4));
        const from = V3(1.1, .5, 1.1), to = V3(2.25 + col * .84, 1.62 - row * .5, -.85);
        c.position.lerpVectors(from, to, k); c.position.y += Math.sin(Math.PI * k) * .35;
        c.rotation.set(lerp(-1.2, 0, k), lerp(.5, 0, k), lerp(-.3, 0, k));
        opacity(c, clamp(k * 4));
      });
      drawStats(S, t);
    });
  };
}
function drawStats({ ctx, tex: t }, time) {
  const g = ctx.createLinearGradient(0, 0, 1920, 1080); g.addColorStop(0, "#1e6e42"); g.addColorStop(1, "#123f27");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = "#c9f49b"; ctx.font = `500 34px ${F.mono}`; ctx.fillText("FROM LAUNCH TO MOMENTUM", 100, 130);
  const k = E.out(prog(time, 3.95, .7)), n = Math.max(1, Math.round(lerp(1, 12, k)));
  ctx.font = `700 330px ${F.disp}`; ctx.fillText(`${n}×`, 88, 470);
  ctx.fillStyle = "#eef0e6"; ctx.font = `500 50px ${F.disp}`; ctx.fillText("organic growth", 104, 560);
  const x0 = 900, y0 = 170, sx = 1.6, sy = 2.4, pk = E.io(prog(time, 3.9, 1.1)), pts = CHART.map(([x, y]) => [x0 + x * sx, y0 + y * sy]);
  const upto = pk * (pts.length - 1), m = Math.floor(upto), f = upto - m;
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i <= m; i++) ctx.lineTo(...pts[i]);
  const hx = m < pts.length - 1 ? lerp(pts[m][0], pts[m + 1][0], f) : pts[m][0], hy = m < pts.length - 1 ? lerp(pts[m][1], pts[m + 1][1], f) : pts[m][1];
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = "#c9f49b"; ctx.lineWidth = 9; ctx.lineJoin = "round"; ctx.shadowColor = "#c9f49b"; ctx.shadowBlur = 24; ctx.stroke(); ctx.shadowBlur = 0;
  if (pk > 0) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx, hy, 14, 0, 7); ctx.fill(); }
  ctx.fillStyle = "rgba(238,240,230,.55)"; ctx.font = `400 26px ${F.mono}`; ctx.fillText("ORGANIC SEARCH · 22 MONTHS ↗", x0, 690);
  const cols = [["31.4M", "search impressions", 31.4, 1], ["978", "keywords in the top 10", 978, 0], ["55 → 90", "site health score", 90, 0]];
  cols.forEach(([big, small, v, dec], i) => {
    const kk = E.out(prog(time, 4.25 + i * .06, .6)), x = 100 + i * 600;
    let s = big;
    if (i === 0) s = `${(v * kk).toFixed(1)}M`; else if (i === 1) s = `${Math.round(v * kk)}`; else s = `55 → ${Math.round(lerp(55, 90, kk))}`;
    ctx.globalAlpha = clamp(kk * 3);
    ctx.fillStyle = "#f1f3ea"; ctx.font = `700 110px ${F.disp}`; ctx.fillText(s, x, 900);
    ctx.fillStyle = "#c9f49b"; ctx.font = `500 34px ${F.mono}`; ctx.fillText(small.toUpperCase(), x + 4, 960);
    ctx.globalAlpha = 1;
  });
  t.needsUpdate = true;
}
function camTerra() {
  const o = ORG.terra;
  key(2.45, o, [-2.6, 1.35, 3.9], [-.6, 1.05, -.6], { fov: 32, ease: E.out, focus: [-.5, 1.05, -.62], posVia: [-14, .5, 4.5], lookVia: [-6, .5, 1.5] });
  key(3.0, o, [.2, 1.3, 3.4], [1.4, 1.1, -.7], { fov: 32, focus: [-.4, 1.05, -.62] });
  key(3.85, o, [2.7, 1.3, 2.95], [3.1, 1.3, -.85], { fov: 32, focus: [3.1, 1.3, -.85] });
  key(4.6, o, [4.3, 1.3, 3.0], [5.8, 1.15, -.9], { fov: 32, focus: [6.3, 1.12, -.9] });
  key(5.3, o, [5.55, 1.2, 2.35], [6.3, 1.12, -.9], { fov: 32, focus: [6.3, 1.12, -.9] });
}

// ---------------------------------------------------------------- 2 · PATI (5.5 – 7)
const PATI_A = [[.089, .497], [.148, .497], [.208, .497], [.266, .497], [.326, .497], [.387, .497], [.448, .497], [.505, .497], [.566, .497], [.627, .436], [.688, .497], [.748, .497], [.807, .497], [.868, .497], [.929, .497]];
const PATI_B = [[.118, .475], [.196, .47], [.269, .311], [.269, .417], [.269, .514], [.269, .611], [.347, .463], [.424, .463], [.5, .463], [.569, .463], [.646, .463], [.722, .463], [.799, .463], [.87, .403], [.87, .522], [.944, .463]];
function buildPati() {
  const g = group("pati"); nodeBlock(g, "pati");
  STATIC.push(P("images/pati-challenge/case02-research-pipeline.webp"), P("images/pati-challenge/case03-weekly-report.webp"));
  return () => {
    const C = canvasTex(128, 128); const c = C.ctx;
    c.fillStyle = "#2bb673"; c.beginPath(); c.arc(64, 64, 56, 0, 7); c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = 14; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(38, 66); c.lineTo(56, 84); c.lineTo(90, 46); c.stroke(); C.tex.needsUpdate = true;
    const glowT = radialTex([[0, "rgba(120,255,170,1)"], [.4, "rgba(60,220,120,.35)"], [1, "rgba(0,0,0,0)"]]);
    [["case02-research-pipeline", 0, PATI_A, 5.9], ["case03-weekly-report", 4.3, PATI_B, 6.36]].forEach(([n, x, nodes, t0]) => {
      const p = panel({ w: 3.6, h: 2.25, d: .05, inset: .02, frame: 0x0b0b0c, map: tex(P(`images/pati-challenge/${n}.webp`)) });
      p.position.set(x, 1.45, -.8); g.add(p);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(.1, .33, .1), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: .7, roughness: .3 }));
      stand.position.set(x, .165, -.8); g.add(stand); blob(g, x, -.75, 4, 1, .6);
      const { sw, sh } = p.userData;
      nodes.forEach(([u, v], i) => {
        const at = t0 + i * .03;
        const chk = new THREE.Mesh(new THREE.PlaneGeometry(.075, .075), new THREE.MeshBasicMaterial({ map: C.tex, transparent: true, depthWrite: false }));
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(.28, .28), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        const px = x - sw / 2 + u * sw, py = 1.45 + sh / 2 - v * sh;
        chk.position.set(px + .045, py + .05, -.8 + .03); gl.position.set(px, py, -.8 + .028);
        g.add(chk, gl); noDepth.push(chk, gl);
        upd.push(t => {
          const k = E.out(prog(t, at, .2));
          chk.visible = gl.visible = t >= at;
          chk.material.opacity = k; chk.scale.setScalar(.88 + .12 * k);
          gl.material.opacity = .35 + 1.4 * Math.exp(-(t - at) * 6);
        });
      });
    });
  };
}
function camPati() {
  const o = ORG.pati;
  key(5.8, o, [-1.3, 1.47, 1.05], [-1.0, 1.45, -.8], { fov: 28, lookVia: [-9, .8, 2], posVia: [-8, .8, 3] });
  key(6.3, o, [.8, 1.47, 1.1], [1.1, 1.45, -.8], { fov: 28 });
  key(6.85, o, [5.3, 1.5, 1.5], [5.2, 1.45, -.8], { fov: 28 });
}

// ---------------------------------------------------------------- 3 · Nhà Mình (7 – 10)
function buildNha() {
  const g = group("nha"); nodeBlock(g, "nha");
  STATIC.push(P("images/visuals/shared-care.webp"), P("images/nha-minh/12-hai-man-hinh.png"), P("images/nha-minh/09-app-bame-chau-bi.png"));
  return () => {
    const big = panel({ w: 3.6, h: 2.4, d: .04, inset: .05, frame: 0xf7efe6, rough: .6, metal: 0, map: tex(P("images/visuals/shared-care.webp")) });
    big.position.set(0, 1.5, -1.0); g.add(big); blob(g, 0, -.95, 4.2, 1.1, .35);
    setMap(big, tex(P("images/nha-minh/12-hai-man-hinh.png")), {}, 2);
    const plinth = new THREE.Mesh(rbox(2.8, .72, 1.3, .03), new THREE.MeshStandardMaterial({ color: 0xc4664b, roughness: .75 }));
    plinth.position.set(3.95, .36, -.05); g.add(plinth); blob(g, 3.95, -.05, 3.4, 1.9, .45);
    const alu = new THREE.MeshStandardMaterial({ color: 0xd4d5d8, metalness: .85, roughness: .28 });
    const base = new THREE.Mesh(rbox(1.25, .03, .85, .012), alu); base.position.set(3.5, .735, -.15); g.add(base);
    const hinge = new THREE.Group(); hinge.position.set(3.5, .75, -.575); hinge.rotation.x = -.2; g.add(hinge);
    const lid = panel({ w: 1.25, h: .8, d: .018, r: .012, inset: .03, frame: 0x1b1b1d, metal: .6 }); lid.position.y = .4; hinge.add(lid);
    const phone = panel({ w: .39, h: .82, d: .03, r: .05, inset: .016, frame: 0x121212, metal: .7, rough: .25, map: tex(P("images/nha-minh/09-app-bame-chau-bi.png")), fit: { ay: 1 } });
    phone.position.set(4.75, 1.16, .25); phone.rotation.set(-.12, -.35, 0); g.add(phone);
    const lamp = new THREE.PointLight(0xff5f3d, 3, 6, 2); lamp.position.set(5.6, 2.0, 1.2); g.add(lamp);
    upd.push(t => {
      const k = E.io(prog(t, 7.66, .26));
      big.userData.u.mixv.value = k; big.userData.u.blur.value = Math.sin(Math.PI * k) * .012;
      if (t >= 8.0) { big.userData.u.has2.value = 0; video(big, clip("nha-sync", (t - 8.0) * 1.1, false)); }
      else { big.userData.u.has2.value = 1; setMap(big, tex(P("images/visuals/shared-care.webp"))); }
      video(lid, clip("nha-vital", t - 8.2));
      phone.userData.u.pan.value.y = -.05 * E.io(prog(t, 8.6, 1.2));
    });
  };
}
function camNha() {
  const o = ORG.nha, C = [3.95, 1.02, -.05], R = 2.3;
  const orb = (a, y = .3, r = R) => [C[0] + r * Math.sin(a), C[1] + y, C[2] + r * Math.cos(a)];
  const a0 = THREE.MathUtils.degToRad(-42), a1 = THREE.MathUtils.degToRad(30), am = (a0 + a1) / 2;
  key(7.3, o, [-1.2, 1.5, 3.8], [0, 1.5, -1], { fov: 32, posVia: [-9, .9, 4], lookVia: [-8, 1, 0] });
  key(7.95, o, [-.25, 1.5, 2.75], [0, 1.5, -1], { fov: 32 });
  key(8.45, o, orb(a0), C, { fov: 30, focus: [4.75, 1.16, .25] });
  key(9.8, o, orb(a1, .26), C, { fov: 30, focus: [3.5, 1.12, -.35], posVia: orb(am, .28, R / Math.cos((a1 - a0) / 2)) });
}

// ---------------------------------------------------------------- 4 · Vitalité (10 – 13)
const SEQ0823 = i => P(`vitalite/demo/wp-content/uploads/seq/0823/${String(i).padStart(3, "0")}.webp`);
function buildVit() {
  const g = group("vit"); nodeBlock(g, "vit");
  STATIC.push(...["01", "02", "04"].map(n => P(`vitalite/demo/theme/assets/gallery/${n}-model.webp`)), P("images/vitalite/home-grid.webp"),
    ...Array.from({ length: 18 }, (_, i) => P(`vitalite/demo/theme/mockups/${i + 1}.webp`)));
  return () => {
    const wall = panel({ w: 4.8, h: 2.7, d: .06, inset: .02, frame: 0x050505 }); wall.position.set(0, 1.4, -1.6); g.add(wall); blob(g, 0, -1.55, 5.4, 1.2, .7);
    const look = panel({ w: 1.2, h: 1.6, d: .03, inset: .035, frame: 0xf3f2ee, rough: .6, metal: 0 }); look.position.set(2.7, .82, -.3); g.add(look); blob(g, 2.7, -.28, 1.6, .8, .7);
    const tee = panel({ w: 1.2, h: 1.2, d: .03, inset: .035, frame: 0xf3f2ee, rough: .6, metal: 0 }); tee.position.set(4.9, .62, -.5); g.add(tee); blob(g, 4.9, -.48, 1.6, .8, .7);
    const shop = panel({ w: 3.2, h: 2.05, d: .05, inset: .02, frame: 0x1a1a1a, map: tex(P("images/vitalite/home-grid.webp")), fit: { reg: [0, .035, 1, 1] } });
    shop.position.set(7.6, 1.1, -1.0); g.add(shop); blob(g, 7.6, -.95, 3.6, 1.0, .7);
    const pink = new THREE.PointLight(0xe2405f, 6, 9, 2); pink.position.set(2.2, 2.3, .9); g.add(pink);
    upd.push(t => {
      video(wall, SEQ0823(1 + Math.floor(E.io3(prog(t, 10.3, .75)) * 95)));
      setMap(look, tex(P(`vitalite/demo/theme/assets/gallery/${t < 11.0 ? "01" : t < 11.25 ? "02" : "04"}-model.webp`)), { ay: .7 });
      setMap(tee, tex(P(`vitalite/demo/theme/mockups/${1 + (Math.max(0, Math.floor((t - 11.5) * 12)) % 18)}.webp`)));
    });
  };
}
function camVit() {
  const o = ORG.vit;
  key(10.3, o, [-1.3, 1.45, 3.8], [0, 1.4, -1.6], { fov: 32, posVia: [-9, .9, 4], lookVia: [-8, 1, 0] });
  key(10.72, o, [-.75, 1.45, 3.2], [0, 1.4, -1.6], { fov: 32 });
  key(10.88, o, [2.0, 1.0, 1.95], [2.7, .95, -.3], { fov: 32, roll: .04 });
  key(11.45, o, [2.15, 1.0, 1.7], [2.7, .95, -.3], { fov: 32, ease: E.lin });
  key(11.6, o, [4.35, .82, 1.5], [4.9, .66, -.5], { fov: 32, roll: -.03 });
  key(12.2, o, [4.45, .82, 1.3], [4.9, .66, -.5], { fov: 32, ease: E.lin });
  key(12.36, o, [6.8, 1.2, 2.6], [7.6, 1.1, -1.0], { fov: 32 });
  key(12.75, o, [6.95, 1.2, 2.35], [7.6, 1.1, -1.0], { fov: 32, ease: E.lin });
}

// ---------------------------------------------------------------- 5 · IELTS Studio · UpHub · Badminton Club (13 – 14.5)
function buildTrio() {
  const g = group("trio"); nodeBlock(g, "trio");
  STATIC.push(P("images/ielts-preview.webp"), P("images/uphub.webp"), P("images/badminton-preview.webp"));
  return () => {
    [["ielts-preview", "#f3ebdd", 13.0], ["uphub", "#ec6a22", 13.5], ["badminton-preview", "#1d6b4c", 14.0]].forEach(([n, col, ts], i) => {
      const x = (i - 1) * 2.5, m = new THREE.Group(); m.position.set(x, 0, 0); g.add(m);
      const p = panel({ w: 2.0, h: 1.125, d: .045, inset: .022, frame: 0x0d0d0d, map: tex(P(`images/${n}.webp`)), fit: { ay: 1 } }); p.position.y = 1.3; m.add(p);
      const post = new THREE.Mesh(new THREE.BoxGeometry(.05, .76, .05), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: .7, roughness: .3 })); post.position.set(0, .38, -.03); m.add(post);
      const foot = new THREE.Mesh(rbox(.5, .02, .3, .008), post.material); foot.position.set(0, .01, -.03); m.add(foot);
      blob(g, x, .02, 1.8, .7, .6); const pl = pool(g, x, .3, 1.3, new THREE.Color(col), .0);
      upd.push(t => {
        const k = E.out(prog(t, ts, .26));
        m.visible = t >= ts - .001;
        m.position.y = (1 - k) * 1.3; m.rotation.z = (1 - k) * (i - 1) * .06;
        pl.material.opacity = t >= ts ? .55 + .6 * Math.exp(-(t - ts) * 5) : 0;
      });
    });
  };
}
function camTrio() {
  const o = ORG.trio;
  key(13.0, o, [-3.0, 1.32, 2.7], [-2.5, 1.28, 0], { fov: 34, posVia: [-9, 1, 3.5], lookVia: [-7, 1, 0] });
  key(14.3, o, [3.0, 1.32, 2.7], [2.5, 1.28, 0], { fov: 34 });
}

// ---------------------------------------------------------------- 6 · Video & brand (14.5 – 19)
const WALL = ["mrbrown-drink", "yl-night", "isbe-group", "aris-pack", "mdh-walk", "hn-wave", "loa-city", "mrbrown-toast", "aris-pink", "isbe-dance", "yl-hand", "mdh-reach", "loa-walk", "hn-stage", "aris-profile", "mrbrown-can"];
const wallPos = (c, r) => { const x = (c - 3) * 1.12; return [x, .5 + r * .68, -1.0 + .045 * x * x, Math.atan2(-.09 * x, 1)]; };
function buildVideo() {
  const g = group("video"); nodeBlock(g, "video");
  return () => {
    const screens = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const [x, y, z, ry] = wallPos(c, r);
      const p = panel({ w: 1.0, h: .5625, d: .03, r: .01, inset: .012, frame: 0x080808 });
      p.position.set(x, y, z); p.rotation.y = ry; g.add(p); screens.push({ p, c, r, k: r * 7 + c });
    }
    blob(g, 0, -.7, 8.5, 1.4, .6);
    [[-2, 2.6, 1.6], [2, 2.6, 1.6]].forEach(([x, y, z]) => { const l = new THREE.PointLight(0xffb35c, 4, 8, 2); l.position.set(x, y, z); g.add(l); });
    upd.push(t => {
      for (const s of screens) {
        let id, local;
        const phase = ((s.c + s.r * 2) % 4) * .25, slot = Math.floor((t - 14.0 + phase) / 1.0);
        id = WALL[((s.k * 5 + slot) % WALL.length + WALL.length) % WALL.length]; local = t + s.k * .37;
        let max = 800;
        if (s.c === 3 && s.r === 2 && t < 15.5) { id = t < 15.0 ? "mrbrown-can" : "mrbrown-toast"; local = t < 15.0 ? t - 14.4 : t - 15.0; max = 2048; }
        if (s.c === 5 && s.r === 1 && t >= 15.2 && t < 16.6) { id = t < 16.0 ? "aris-pack" : "aris-profile"; local = t < 16.0 ? t - 15.4 : t - 16.0; max = 2048; }
        video(s.p, clip(id, local), { max });
      }
    });
  };
}
function camVideo() {
  const o = ORG.video, [hx, hy, hz, hr] = wallPos(5, 1), n = [Math.sin(hr), 0, Math.cos(hr)];
  const H2 = [hx, hy, hz], ff = d => [hx + n[0] * d, hy, hz + n[2] * d];
  key(14.5, o, [0, 1.86, -.02], [0, 1.86, -1.0], { fov: 30, posVia: [-6, 1.6, 3.5], lookVia: [-4, 1.7, -1] });
  key(14.98, o, [0, 1.86, -.09], [0, 1.86, -1.0], { fov: 30, ease: E.lin });
  key(15.5, o, ff(.98), H2, { fov: 30, posVia: [1.0, 1.6, 2.2] });
  key(16.35, o, ff(.9), H2, { fov: 30, ease: E.lin });
  key(16.7, o, [-2.7, 1.3, 1.1], [-2.1, 1.25, -.9], { fov: 32, focus: [-2.1, 1.25, -.8] });
  key(18.7, o, [2.8, 1.3, 1.1], [3.4, 1.25, -.7], { fov: 32, ease: E.lin, focus: [3.2, 1.25, -.6] });
}

// ---------------------------------------------------------------- 7 · Aru Otoko (19 – 22.5)
const ARU = s => P(`images/aru-otoko/${s}.webp`);
function buildAru() {
  const g = group("aru"); nodeBlock(g, "aru");
  STATIC.push(ARU("workflow/weavy-canvas-full"), ARU("references/ref-01-skyline-amber"), ARU("references/ref-02-street-corner"), ARU("stills/s08-skyline"),
    ARU("stills/s06-vending"), ARU("stills/s07-closeup"), ARU("stills/s05-rooftop"), ARU("stills/s10-burning"));
  return () => {
    const weavy = panel({ w: 3.0, h: 3.0, d: .04, inset: .02, frame: 0x0a0a0a, map: tex(ARU("workflow/weavy-canvas-full")) });
    weavy.position.set(0, 1.6, -1.5); g.add(weavy); blob(g, 0, -1.45, 3.6, 1, .7);
    const film = panel({ w: 4.4, h: 2.475, d: .05, inset: .0, frame: 0x000000 }); film.position.set(0, 1.6, -8.0); g.add(film);
    const gold = new THREE.PointLight(0xe9a54b, 3, 7, 2); gold.position.set(0, 2.6, -4.5); g.add(gold);
    const skyReg = { reg: [0, .1, 1, .86] };
    upd.push(t => {
      const cz = camera.position.z - ORG.aru[2];
      opacity(weavy, sstep(.06, .42, cz + 1.48));
      const u = film.userData.u; u.wipe.value = 0; u.has2.value = 0; u.edge.value = 0; u.zoom.value = 1;
      if (t < 20.25) {
        setMap(film, tex(ARU("references/ref-01-skyline-amber"))); setMap(film, tex(ARU("stills/s08-skyline")), skyReg, 2);
        u.wipe.value = 1; u.mixv.value = E.io(prog(t, 19.85, .25)); u.edge.value = Math.sin(Math.PI * u.mixv.value) * 1.2;
      } else if (t < 20.5) {
        setMap(film, tex(ARU("references/ref-02-street-corner"))); setMap(film, tex(ARU("stills/s06-vending")), {}, 2);
        u.wipe.value = 1; u.mixv.value = E.io(prog(t, 20.3, .18)); u.edge.value = Math.sin(Math.PI * u.mixv.value) * 1.2;
      } else if (t < 21.0) {
        video(film, seqUrl(P("images/aru-otoko/frames/s00/"), 151, 24, t - 20.5, false, 4, "webp"));
      } else {
        const s = t < 21.5 ? "s07-closeup" : t < 22.0 ? "s05-rooftop" : "s10-burning", t0 = t < 21.5 ? 21 : t < 22 ? 21.5 : 22;
        setMap(film, tex(ARU(`stills/${s}`)), s === "s08-skyline" ? skyReg : {}); u.zoom.value = 1 + .05 * prog(t, t0, .6);
      }
    });
  };
}
function camAru() {
  const o = ORG.aru;
  key(19.15, o, [.3, 1.62, 2.7], [0, 1.6, -1.5], { fov: 32, posVia: [-10, 1.8, 4], lookVia: [-6, 1.6, -1] });
  key(19.6, o, [-.207, 1.689, -1.12], [-.207, 1.689, -1.5], { fov: 30, ease: E.in3 });
  key(19.78, o, [0, 1.6, -3.38], [0, 1.6, -8], { fov: 30, ease: E.out, focus: [0, 1.6, -8] });
  key(22.3, o, [0, 1.6, -3.95], [0, 1.6, -8], { fov: 30, ease: E.lin, focus: [0, 1.6, -8] });
}

// ---------------------------------------------------------------- 8 · Bóng Vespera (22.5 – 25.5)
const KF = ["kf1-the-gate-at-dawn", "kf2-the-wanderer-enters", "kf3-path-of-guardians", "kf4-the-kneeling-moment", "kf5-after-the-recognition"];
function buildBong() {
  const g = group("bong"); nodeBlock(g, "bong");
  STATIC.push(...KF.map(k => P(`images/vng-demo/stills/${k}.webp`)), P("images/vng-demo/final/ad-mockup-final.webp"));
  return () => {
    const kfs = KF.map((k, i) => { const p = panel({ w: 1.3, h: 1.95, d: .02, r: .008, inset: .01, frame: 0x0c1f1c, map: tex(P(`images/vng-demo/stills/${k}.webp`)) }); p.position.set(0, 1.3, -1 - 1.6 * i); g.add(p); return p; });
    const motion = panel({ w: 1.35, h: 1.86, d: .03, inset: .015, frame: 0x0c1f1c }); motion.position.set(0, 1.22, -12); g.add(motion);
    const poster = panel({ w: 1.3, h: 1.95, d: .03, inset: .015, frame: 0x0c1f1c, map: tex(P("images/vng-demo/final/ad-mockup-final.webp")) });
    poster.position.set(2.3, 1.25, -12.3); poster.rotation.y = -.45; g.add(poster);
    blob(g, 0, -12, 1.8, .8, .5); blob(g, 2.3, -12.3, 1.8, .8, .5);
    const r = rng(7);
    const mistC = canvasTex(512, 256); const mc = mistC.ctx;
    for (let i = 0; i < 40; i++) { const x = 60 + r() * 392, y = 70 + r() * 116, rad = 40 + r() * 70, gr = mc.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); mc.fillStyle = gr; mc.fillRect(0, 0, 512, 256); }
    mc.globalCompositeOperation = "destination-in";
    const fx = mc.createLinearGradient(0, 0, 512, 0); fx.addColorStop(0, "rgba(0,0,0,0)"); fx.addColorStop(.25, "#000"); fx.addColorStop(.75, "#000"); fx.addColorStop(1, "rgba(0,0,0,0)");
    mc.fillStyle = fx; mc.fillRect(0, 0, 512, 256);
    const fy = mc.createLinearGradient(0, 0, 0, 256); fy.addColorStop(0, "rgba(0,0,0,0)"); fy.addColorStop(.3, "#000"); fy.addColorStop(.7, "#000"); fy.addColorStop(1, "rgba(0,0,0,0)");
    mc.fillStyle = fy; mc.fillRect(0, 0, 512, 256); mc.globalCompositeOperation = "source-over";
    mistC.tex.needsUpdate = true;
    const mists = [.6, -1.8, -4.2, -6.6, -9.0, -11.2].map((z, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: mistC.tex, color: 0xa9d6c8, transparent: true, opacity: .5, depthWrite: false }));
      m.position.set(0, 1.3, z - .8); g.add(m); noDepth.push(m); return { m, sp: (i % 2 ? 1 : -1) * (.2 + .05 * i), x0: (r() - .5) * 2 };
    });
    const leafC = canvasTex(64, 64); const lc = leafC.ctx;
    lc.fillStyle = "#d2381f"; lc.beginPath(); lc.moveTo(32, 4); lc.quadraticCurveTo(58, 30, 32, 60); lc.quadraticCurveTo(6, 30, 32, 4); lc.fill(); leafC.tex.needsUpdate = true;
    const N = 70, leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(.07, .07), new THREE.MeshBasicMaterial({ map: leafC.tex, transparent: true, alphaTest: .4, side: THREE.DoubleSide }), N);
    g.add(leaves); noDepth.push(leaves);
    const seeds = Array.from({ length: N }, () => ({ x: (r() - .5) * 4, y: r() * 3.2, z: 1.5 - r() * 14, v: .25 + r() * .25, w: r() * 6, s: .6 + r() * .8 }));
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V3(1, 1, 1), ps = V3(0, 0, 0);
    upd.push(t => {
      const cz = camera.position.z - ORG.bong[2];
      kfs.forEach((p, i) => { const dz = cz - p.position.z, o = dz < 0 ? 0 : sstep(.05, 1.0, dz); opacity(p, o); p.userData.u.blur.value = (1 - o) * .008; });
      video(motion, clip("bong-motion", 1.3 + Math.max(0, t - 24.2) * 2.2, false));
      mists.forEach(({ m, sp, x0 }) => { m.position.x = x0 + sp * (t - 22.5); const dz = cz - m.position.z; m.material.opacity = dz < 0 ? 0 : .3 * sstep(.2, 1.2, dz); });
      seeds.forEach((s, i) => {
        const y = ((s.y - s.v * t) % 3.2 + 3.2) % 3.2;
        ps.set(s.x + Math.sin(t * 1.3 + s.w) * .25, y, s.z); e.set(t * 1.7 + s.w, t * 1.1 + s.w * 2, t * .9); q.setFromEuler(e); sc.setScalar(s.s);
        m4.compose(ps, q, sc); leaves.setMatrixAt(i, m4);
      });
      leaves.instanceMatrix.needsUpdate = true;
    });
  };
}
function camBong() {
  const o = ORG.bong, pn = [Math.sin(-.45), 0, Math.cos(-.45)], ps = [2.3, 1.25, -12.3];
  const pf = d => [ps[0] + pn[0] * d, 1.25, ps[2] + pn[2] * d];
  key(22.75, o, [0, 1.3, 2.2], [0, 1.3, -2], { fov: 30, posVia: [-8, 1.3, 4], lookVia: [-5, 1.3, 0] });
  key(24.25, o, [0, 1.3, -7.4], [0, 1.3, -11], { fov: 30, ease: E.lin });
  key(24.62, o, [0, 1.24, -8.6], [0, 1.22, -12], { fov: 30, ease: E.out, focus: [0, 1.22, -12] });
  key(24.95, o, [0, 1.24, -8.8], [0, 1.22, -12], { fov: 30, ease: E.lin, focus: [0, 1.22, -12] });
  key(25.2, o, pf(3.5), ps, { fov: 28, focus: ps });
  key(25.5, o, pf(3.3), ps, { fov: 26, ease: E.lin, focus: ps });
}

// ---------------------------------------------------------------- output, sign-off (25.5 – 30)
let portrait, backGlow;
function buildHub() {
  const g = group("hub");
  STATIC.push(P("images/hero-portrait.webp"));
  return () => {
    portrait = panel({ w: 1.6, h: 2.0, d: .03, r: .01, inset: 0, frame: 0x0b0d0b, map: tex(P("images/hero-portrait.webp")) });
    portrait.position.set(0, 1.13, 0); g.add(portrait);
    backGlow = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: GLOW, color: new THREE.Color("#c0e686").multiplyScalar(.35), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    backGlow.position.set(0, 1.3, -.6); g.add(backGlow); noDepth.push(backGlow);
    blob(g, 0, .05, 2.2, .9, .8);
    upd.push(t => {
      const k = E.out(prog(t, 27.25, .6));
      opacity(portrait, k); portrait.scale.setScalar(.94 + .06 * k);
      portrait.userData.u.blur.value = (1 - k) * .01; portrait.userData.u.gain.value = lerp(.7, .95, E.out(prog(t, 27.4, 1.4)));
      backGlow.material.opacity = k; backGlow.visible = t > 27.2;
    });
  };
}
function camEnd() {
  key(26.9, [0, 0, 0], [108, 58, 96], [108, 0, 8], { fov: 50, ease: E.out, posVia: [200, 16, 34], lookVia: [212, 0, -6] });
  key(27.0, [0, 0, 0], [108, 57.6, 95.6], [108, 0, 8], { fov: 50, ease: E.lin });
  key(27.85, HUB, [.75, 1.25, 3.9], [.75, 1.15, 0], { fov: 30, posVia: [.5, 24, 40], lookVia: [.5, .5, 0], focus: [0, 1.25, 0] });
  key(29.95, HUB, [.72, 1.22, 3.35], [.72, 1.13, 0], { fov: 30, ease: E.lin, focus: [0, 1.25, 0] });
  key(30.5, HUB, [.72, 1.22, 3.3], [.72, 1.13, 0], { fov: 30, ease: E.lin, focus: [0, 1.25, 0] });
}

// ---------------------------------------------------------------- the wire
function buildWire() {
  const pts = [], mark = {};
  const w = (name, p) => { const v = V3(...p); pts.push(v); if (name) mark[name] = v; };
  w("btn", [.33, .95, .05]); w(null, [.62, .86, .3]); w(null, [1.05, .32, .9]); w(null, [1.8, .03, 1.5]); w("x_prompt", [3.4, .03, 1.8]);
  const names = ["prompt", ...ORDER];
  for (let i = 0; i < ORDER.length; i++) {
    const n = ORDER[i], o = ORG[n], prev = names[i], po = ORG[prev] || [0, 0, 0];
    const ex = mark["x_" + prev], ent = V3(o[0] - 4.6, .03, o[2] + 1.7);
    const mid = V3((ex.x + ent.x) / 2, .03, (ex.z + ent.z) / 2 + (i % 2 ? -2.2 : 2.2));
    w(null, [ex.x + 2.5, .03, ex.z]); w(null, [mid.x, .03, mid.z]); w(null, [ent.x - 2.5, .03, ent.z]);
    w("e_" + n, [ent.x, .03, ent.z]);
    const xx = o[0] + EXIT_X[n];
    w(null, [lerp(ent.x, xx, .33), .03, ent.z]); w(null, [lerp(ent.x, xx, .66), .03, ent.z]);
    w("x_" + n, [xx, .03, ent.z]);
  }
  const bx = mark.x_bong;
  w(null, [bx.x + 4, .03, bx.z + 3]); w(null, [bx.x - 6, .03, 38]); w(null, [HUB[0] + 40, .03, 42]); w(null, [HUB[0] + 8, .03, HUB[2] + 6]); w("hub", [HUB[0] + .9, .03, HUB[2] + .4]);
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", .5);
  const len = curve.getLength(), N = 8000, samp = curve.getSpacedPoints(N);
  for (const [k, v] of Object.entries(mark)) { let bi = 0, bd = 1e9; samp.forEach((s, i) => { const d = s.distanceToSquared(v); if (d < bd) { bd = d; bi = i; } }); U[k] = bi / N; }
  // Palette along the wire: each stretch takes the accent of the set it leads into.
  const pal = new Uint8Array(512 * 4), stops = [["btn", "prompt"], ...ORDER.map(n => ["e_" + n, n]), ["x_bong", "hub"]];
  for (let i = 0; i < 512; i++) {
    const u = i / 511; let c = new THREE.Color(ACCENT.prompt);
    for (let s = 0; s < stops.length; s++) {
      const u0 = U[stops[s][0]], c0 = new THREE.Color(ACCENT[stops[s][1]]);
      if (u >= u0 - .01) { const next = stops[s + 1]; c = c0; if (next && u > U[next[0]] - .012) c = c0.clone().lerp(new THREE.Color(ACCENT[next[1]]), sstep(U[next[0]] - .012, U[next[0]], u)); }
    }
    c.convertLinearToSRGB(); pal.set([c.r * 255, c.g * 255, c.b * 255, 255], i * 4);
  }
  const palTex = new THREE.DataTexture(pal, 512, 1); palTex.colorSpace = THREE.SRGBColorSpace; palTex.magFilter = palTex.minFilter = THREE.LinearFilter; palTex.needsUpdate = true;
  wireMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uHead: { value: 0 }, uAll: { value: 0 }, uSpark: { value: 0 }, uLen: { value: len }, uPal: { value: null } }]),
    vertexShader: SCREEN_VS,
    fragmentShader: `
      #include <common>
      #include <fog_pars_fragment>
      uniform float uHead, uAll, uSpark, uLen; uniform sampler2D uPal; varying vec2 vUv;
      void main(){
        float x = vUv.x, dm = (uHead - x) * uLen;
        vec3 pc = texture2D(uPal, vec2(x, .5)).rgb;
        float behind = step(0.0, dm), lit = max(behind * (.55 + .8 * exp(-dm / 3.0)), uAll * 1.2);
        vec3 col = pc * (.05 + lit * 1.4) + vec3(1.0) * exp(-abs(dm) / .09) * 7.0 * uSpark * step(uAll, .99);
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }`,
    fog: true,
  });
  wireMat.uniforms.uPal.value = palTex;
  wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 9000, .012, 6, false), wireMat);
  scene.add(wire);
  head = new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) }));
  headGlow = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.2, 1.2, 1.2) }));
  headLight = new THREE.PointLight(0xffffff, 2.5, 4, 2);
  scene.add(head, headGlow, headLight); noDepth.push(headGlow);
  // Signal schedule: [time, marker, ease into it].
  signal = [[0, "btn", E.lin], [2.0, "btn", E.lin]];
  ORDER.forEach(n => { signal.push([WIN[n][0] - .05, "e_" + n, E.io3], [WIN[n][1], "x_" + n, E.lin]); });
  signal.push([27.0, "hub", E.io]);
  return curve;
}
let CURVE;
function signalU(t) {
  let i = 0; while (i < signal.length - 2 && t >= signal[i + 1][0]) i++;
  const [ta, ma] = signal[i], [tb, mb, e] = signal[i + 1];
  return lerp(U[ma], U[mb], e(prog(t, ta, tb - ta)));
}

// ---------------------------------------------------------------- floor
function buildFloor() {
  const shader = {
    uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, bg: { value: new THREE.Color() }, refl: { value: .3 }, fogCol: { value: new THREE.Color() }, fogDen: { value: .05 } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying float vDepth;
      void main(){ vUv = textureMatrix * vec4(position, 1.0); vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bg, fogCol; uniform float refl, fogDen; varying vec4 vUv; varying float vDepth;
      void main(){
        vec2 p = vUv.xy / vUv.w; vec3 r = vec3(0.0);
        for (int i = 0; i < 5; i++) { float a = float(i) * 2.39996; r += texture2D(tDiffuse, p + vec2(cos(a), sin(a)) * .0022 * float(i)).rgb; }
        vec3 col = bg * .9 + r / 5.0 * refl;
        float f = 1.0 - exp(-fogDen * fogDen * vDepth * vDepth);
        gl_FragColor = vec4(mix(col, fogCol, f), 1.0);
      }`,
  };
  floor = new Reflector(new THREE.PlaneGeometry(700, 420), { textureWidth: 960, textureHeight: 540, clipBias: .003, shader });
  floor.rotation.x = -Math.PI / 2; floor.position.set(120, 0, 20);
  scene.add(floor);
}

// ---------------------------------------------------------------- HUD
const caps = [];
function h(tag, cls, parent, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; parent.appendChild(e); return e; }
function cap(o) {
  const el = h("div", "cap", hud); if (o.css) el.style.cssText += o.css;
  o.lines.forEach(l => {
    const ln = h("div", "ln " + l.cls, el); if (l.color) ln.style.color = l.color;
    l.parts = l.text.split(" ").map((w, i, a) => { const m = h("span", "mask", ln); const s = h("span", w === "↗" ? "url" : "", m, w); if (i < a.length - 1) ln.appendChild(document.createTextNode(" ")); return s; });
  });
  o.el = el; caps.push(o);
}
function buildHud() {
  const C = (s, e, idx, head, extra = {}) => cap({ start: s, end: e, lines: [{ cls: "idx", text: idx }, { cls: "head" + (extra.serif ? " serif" : ""), text: head }], ...extra });
  C(2.55, 5.25, "01 · terra · growth, content & design", "One brand. Many moving parts.");
  C(5.92, 6.7, "02 · PATI · Workflow Architect Challenge", "Three problems. Three workflow architectures.");
  C(7.45, 9.75, "03 · Nhà Mình · family care, solo build", "A little closer. Even from afar.");
  C(10.45, 12.55, "04 · Vitalité · design & development", "Streetwear. On screen.");
  C(13.04, 13.4, "05 · IELTS Studio", "Learning, made more personal.");
  C(13.54, 13.9, "05 · UpHub", "A clearer digital front door.");
  C(14.04, 14.28, "05 · Badminton Club", "Less organising. More playing.");
  const tag = "left:auto; right:96px; bottom:auto; top:66px; text-align:right";
  cap({ start: 14.56, end: 15.3, css: tag, lines: [{ cls: "idx", text: "Top 1 TVC · Business Challenge 2023" }, { cls: "sub", text: "MR. BROWN · full scope, edit & voice-over" }] });
  cap({ start: 15.56, end: 16.3, css: tag, lines: [{ cls: "idx", text: "Top 1 TVC · Business Challenge 2024" }, { cls: "sub", text: "ARISAQUA · full scope, edit & voice-over" }] });
  C(16.62, 18.55, "06 · Video & brand · camera, edit & voice-over", "Two-time Top 1 TVC · Business Challenge");
  C(20.55, 22.25, "07 · Aru Otoko · AI film, direction & edit", "AI generates the frames. I direct what they become.", { css: "bottom:30px" });
  C(23.0, 25.15, "08 · Bóng Vespera · art direction & motion", "One visual idea, carried all the way through.", { serif: true });
  cap({ start: 27.95, end: 29.4, css: "left:1010px; bottom:auto; top:360px", lines: [
    { cls: "head", text: "Hi, I'm Thanh." }, { cls: "head", text: "Call me Tatsuki." },
    { cls: "sub", text: "Growth · Products · Creative", color: "#c9d4bf" }, { cls: "sub", text: "jak3rpham.github.io ↗", color: "#c0e686" }] });
  const st = h("div", "", hud); st.id = "status"; st.innerHTML = `<i></i><span></span><b></b>`;
  const jp = h("div", "", hud, "或る男"); jp.id = "jp";
  const big = h("div", "", hud); big.id = "big"; big.innerHTML = `Ideas into <em>actual things.</em>`;
}
function hudAt(t, look) {
  for (const c of caps) {
    const on = t >= c.start - .01 && t < c.end + .45;
    c.el.style.display = on ? "block" : "none";
    if (!on) continue;
    c.el.style.color = c.color || (c.start > 27 ? "#f1f3ea" : c.start > 20 && c.start < 22 ? "#e9a54b" : look.hud);
    let w = 0;
    c.lines.forEach(l => l.parts.forEach(p => {
      const kin = E.out(prog(t, c.start + w * .045, .55)), kout = E.in3(prog(t, c.end + w * .015, .22));
      p.style.transform = `translateY(${((1 - kin) * 110 - kout * 110).toFixed(2)}%)`;
      w++;
    }));
  }
  const st = document.getElementById("status"), run = t >= 2.1 && t < 25.45, done = t >= 25.5 && t < 26.95;
  st.style.display = run || done ? "block" : "none";
  if (run || done) {
    let n = 0; ORDER.forEach((k, i) => { if (t >= WIN[k][0] - .05) n = i + 1; });
    st.style.color = look.hud;
    st.querySelector("i").style.background = done ? "#c0e686" : `rgba(255,109,90,${(.45 + .55 * (Math.floor(t * 4) % 2)).toFixed(2)})`;
    st.querySelector("span").textContent = done ? "Workflow executed" : "Executing workflow";
    st.querySelector("b").textContent = done ? "08 / 08 ✓" : `${String(Math.max(n, 1)).padStart(2, "0")} / 08`;
    st.style.opacity = String(Math.min(E.out(prog(t, 2.1, .3)), done ? 1 - E.in3(prog(t, 26.7, .25)) : 1));
  }
  const jp = document.getElementById("jp"), jk = E.out(prog(t, 19.9, .6)) * (1 - E.in3(prog(t, 22.15, .2)));
  jp.style.display = jk > .001 && t < 22.4 ? "block" : "none";
  jp.style.opacity = jk.toFixed(3); jp.style.transform = `translateY(${((1 - jk) * 24).toFixed(1)}px)`; jp.style.filter = `blur(${((1 - jk) * 8).toFixed(1)}px)`;
  const big = document.getElementById("big"), bk = E.out(prog(t, 25.85, .6)) * (1 - E.in3(prog(t, 26.75, .25)));
  big.style.display = bk > .001 ? "block" : "none";
  big.style.opacity = bk.toFixed(3); big.style.transform = `translateY(${((1 - bk) * 30).toFixed(1)}px) scale(${(.96 + .04 * bk).toFixed(4)})`; big.style.filter = `blur(${((1 - bk) * 10).toFixed(1)}px)`;
  hud.style.opacity = String(1 - E.io(prog(t, 29.35, .55)));
}

// ================================================================ frame
const SHOW = { prompt: [-1, 2.7], terra: [1.8, 6.0], pati: [5.0, 7.6], nha: [6.6, 10.5], vit: [9.5, 13.4], trio: [12.5, 14.9], video: [13.9, 19.5], aru: [18.4, 22.9], bong: [21.9, 25.8] };
function frame(t) {
  frameNo++;
  const look = lookAt(t);
  scene.background.copy(look.bg); scene.fog.color.copy(look.bg); scene.fog.density = look.fog; scene.environmentIntensity = look.env;
  floor.material.uniforms.bg.value.copy(look.bg); floor.material.uniforms.fogCol.value.copy(look.bg); floor.material.uniforms.fogDen.value = look.fog; floor.material.uniforms.refl.value = look.refl;
  bloom.strength = look.bloom; bloom.threshold = look.thr;
  const warm = new THREE.Vector3(1, 1, 1).lerp(new THREE.Vector3(1.25, .95, .7), look.warm);
  bloom.bloomTintColors.forEach(v => v.copy(warm));
  grade.uniforms.uVig.value = look.vig;

  const god = t >= 25.35 && t < 27.75, collapse = E.in3(prog(t, 27.0, .62));
  for (const [n, g] of Object.entries(world)) {
    if (n === "hub") { g.visible = t > 26.8; continue; }
    const [a, b] = SHOW[n];
    g.visible = (t >= a && t < b) || (god && collapse < .999);
    const s = lerp(1, .015, collapse), o = g.userData.org;
    g.position.set(HUB[0] + (o[0] - HUB[0]) * s, 0, HUB[2] + (o[2] - HUB[2]) * s); g.scale.setScalar(s);
  }
  const ws = lerp(1, .015, collapse);
  wire.scale.setScalar(ws); wire.position.set(HUB[0] * (1 - ws), 0, HUB[2] * (1 - ws)); wire.visible = collapse < .999;

  const c = camAt(t), sh = look.shake;
  // Transits ride the wire: mid-flight the camera swoops in behind the signal head, then lands.
  const u0 = signalU(t);
  for (const [a, b] of TRANSITS) {
    if (t <= a || t >= b) continue;
    const w = Math.sin(Math.PI * prog(t, a, b - a)) ** 1.4 * .9, len = CURVE.getLength();
    const hp0 = CURVE.getPointAt(clamp(u0)), tg = CURVE.getTangentAt(clamp(u0));
    const chase = hp0.clone().addScaledVector(tg, -1.5).add(V3(0, .42, 0));
    const ahead = CURVE.getPointAt(clamp(u0 + 4 / len)).add(V3(0, .12, 0));
    c.pos.lerp(chase, w); c.look.lerp(ahead, w); c.focus.lerp(hp0, w);
  }
  const n1 = Math.sin(t * 1.7) * .6 + Math.sin(t * 3.1 + 1) * .4, n2 = Math.sin(t * 1.3 + 2) * .6 + Math.sin(t * 2.7 + 4) * .4;
  camera.position.copy(c.pos).add(V3(n1 * sh, n2 * sh, 0));
  camera.fov = c.fov; camera.updateProjectionMatrix();
  camera.up.set(Math.sin(c.roll), Math.cos(c.roll), 0);
  camera.lookAt(c.look.clone().add(V3(n2 * sh * .6, n1 * sh * .6, 0)));
  camera.updateMatrixWorld();
  const fv = c.focus.clone().applyMatrix4(camera.matrixWorldInverse);
  bokeh.uniforms.focus.value = Math.max(.1, -fv.z); bokeh.uniforms.aperture.value = look.ap; bokeh.uniforms.maxblur.value = .011;

  const u = signalU(t), hp = CURVE.getPointAt(clamp(u, 0, 1)).multiplyScalar(ws).add(V3(HUB[0] * (1 - ws), 0, HUB[2] * (1 - ws)));
  wireMat.uniforms.uHead.value = u; wireMat.uniforms.uSpark.value = t < 1.98 ? 0 : 1; wireMat.uniforms.uAll.value = E.io(prog(t, 25.45, .7));
  const hv = t >= 1.98 && collapse < .98;
  head.visible = headGlow.visible = headLight.visible = hv;
  head.position.copy(hp); headGlow.position.copy(hp); headLight.position.copy(hp).add(V3(0, .15, 0));
  headGlow.quaternion.copy(camera.quaternion); headGlow.scale.setScalar(lerp(.15, 1, E.out(prog(t, 2.0, .3))));

  for (const f of upd) f(t);
  grade.uniforms.uTime.value = t;
  grade.uniforms.uFade.value = E.out(prog(t, 0, .35)) * (1 - E.io(prog(t, 29.3, .65)));
  grade.uniforms.uBars.value = E.out(prog(t, 19.6, .22)) * (1 - E.io(prog(t, 22.3, .25)));
  hudAt(t, look);
}

async function seek(t) {
  jobs.length = 0;
  frame(t);
  const need = jobs.slice();
  await Promise.all(need.map(j => load(j.url, j.fit.max || 2048, 2048, true)));
  for (const j of need) { const e = TEX.get(texKey(j.url, j.fit.max || 2048)); if (e && e.tex) setMap(j.p, e.tex, j.fit, j.slot); }
  composer.render();
  evict();
  await new Promise(r => requestAnimationFrame(() => r()));
}

async function init() {
  await document.fonts.ready;
  await Promise.all([`700 64px "Bricolage Grotesque"`, `500 64px "Bricolage Grotesque"`, `400 32px "DM Mono"`, `500 32px "DM Mono"`, `600 32px "Be Vietnam Pro"`]
    .map(f => document.fonts.load(f, "Nhà Mình Bóng Vitalité ⚡ ×→↗")));
  await document.fonts.load(`700 64px "Noto Serif JP"`, "或る男 Bóng Vespera");
  SHADOW = radialTex([[0, "rgba(255,255,255,1)"], [.55, "rgba(255,255,255,.45)"], [1, "rgba(255,255,255,0)"]]);
  GLOW = radialTex([[0, "rgba(255,255,255,1)"], [.25, "rgba(255,255,255,.45)"], [.6, "rgba(255,255,255,.08)"], [1, "rgba(255,255,255,0)"]]);
  buildFloor();
  CURVE = buildWire();
  buildPrompt();
  const later = [buildTerra(), buildPati(), buildNha(), buildVit(), buildTrio(), buildVideo(), buildAru(), buildBong(), buildHub()];
  await Promise.all(STATIC.map(u => load(u, 2048, 4096)));
  later.forEach(f => f());
  camTerra(); camPati(); camNha(); camVit(); camTrio(); camVideo(); camAru(); camBong(); camEnd();
  KEYS.sort((a, b) => a.t - b.t);
  for (let i = 0; i < KEYS.length; i++) if (KEYS[i].fov == null) KEYS[i].fov = KEYS[i - 1]?.fov ?? 30;
  const godPools = ORDER.map(n => pool(world[n], 1.5, -.5, 10, new THREE.Color(ACCENT[n]), 0));
  upd.push(t => godPools.forEach(p => { p.material.opacity = .5 * E.io(prog(t, 25.45, .8)); }));
  buildHud();
  await seek(0);
  return { keys: KEYS.length, textures: TEX.size, wire: +CURVE.getLength().toFixed(1) };
}
window.seek = seek;
window.ready = init();
