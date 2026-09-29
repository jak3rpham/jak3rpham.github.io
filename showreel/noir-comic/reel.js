// Reel 2026, "The noir comic" (README.md in this folder). The same intro office, which then turns out to be panel one of a long
// comic page printed in ink. Each case is a cluster of panels inked in on the beat; the camera glides
// along the page. The work stays in colour. seek(t) is a pure function of t.
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

const W = 1920, H = 1080, DUR = 44.58;
const P = p => "../../public/" + p;

// ================================================================ math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, d) => clamp((t - a) / d);
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
  io: cubicBezier(.65, 0, .35, 1),
  in3: x => x * x * x,
};
function rng(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let q = Math.imul(seed ^ (seed >>> 15), 1 | seed); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ================================================================ renderer, post
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030303);
scene.fog = new THREE.FogExp2(0x030303, .04);
const camera = new THREE.PerspectiveCamera(32, W / H, .05, 200);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .12;

class Hook extends Pass { constructor(fn) { super(); this.fn = fn; this.needsSwap = false; } render() { this.fn(); } }
const noDepth = [];
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new Hook(() => noDepth.forEach(o => { o.userData.vis = o.visible; o.visible = false; })));
const bokeh = new BokehPass(scene, camera, { focus: 4, aperture: .002, maxblur: .01 });
composer.addPass(bokeh);
composer.addPass(new Hook(() => noDepth.forEach(o => { o.visible = o.userData.vis; })));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .5, .5, .97);
composer.addPass(bloom);
composer.addPass(new OutputPass());
// Noir grade: contrast curve, halftone dots in the deep shadows only, heavy grain, vignette.
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 1 }, uBars: { value: 0 }, uGrain: { value: .055 }, uVig: { value: .6 }, uCon: { value: .35 }, uDots: { value: .5 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uFade, uBars, uGrain, uVig, uCon, uDots; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    void main(){
      vec2 c = vUv - .5;
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      col = mix(col, col * col * (3.0 - 2.0 * col), uCon);
      float l = dot(col, vec3(.2126, .7152, .0722));
      vec2 px = vUv * vec2(1920.0, 1080.0);
      vec2 g = mat2(.7071, -.7071, .7071, .7071) * px / 7.0;
      float d = length(fract(g) - .5);
      float dotm = smoothstep(.0, .06, sqrt(l * 5.0) * .5 - d);
      float sh = 1.0 - smoothstep(.04, .2, l);
      col = mix(col, col * (.55 + .9 * dotm), uDots * sh);
      col *= 1.0 - uVig * smoothstep(.3, .95, length(c * vec2(1.0, .72)) * 1.35);
      col += (hash(px + floor(uTime * 24.0) * 1.37) - .5) * uGrain;
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
function load(url, maxW = 4096, maxH = 4096, frame = false) {
  let e = TEX.get(url);
  if (!e) { e = { p: decode(url, maxW, maxH).catch(() => { console.warn("missing " + url); return null; }), tex: null, frame, used: 0 }; e.p.then(t => { e.tex = t; }); TEX.set(url, e); }
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
// sat 0 = the black-and-white world, 1 = the work in colour. slat lays blind shadows over a print.
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
uniform float mixv, wipe, opacity, gain, zoom, has2, asp, sat, con, slat, slatAng, slatFreq, slatPhase, scan, ink; uniform vec2 pan;
varying vec2 vUv;
void main(){
  vec2 q = clamp((vUv - .5) / zoom + .5 + pan, 0.0, 1.0);
  vec3 col = texture2D(map, crop.xy + q * crop.zw).rgb;
  if (has2 > .5) {
    vec3 b = texture2D(map2, crop2.xy + q * crop2.zw).rgb;
    if (wipe > .5) { float e = mixv * 1.1 - .05; col = mix(col, b, 1.0 - smoothstep(e - .004, e + .004, vUv.x)); }
    else col = mix(col, b, mixv);
  }
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = mix(vec3(l), col, sat);
  col = mix(col, col * col * (3.0 - 2.0 * col), con);
  vec2 s = vec2((vUv.x - .5) * asp, vUv.y - .5);
  float st = .5 + .5 * sin((dot(s, vec2(sin(slatAng), cos(slatAng))) * slatFreq + slatPhase) * 6.2832);
  col *= mix(1.0, mix(.12, 1.0, smoothstep(.3, .62, st)), slat);
  if (ink > .5) {
    float l2 = dot(col, vec3(.2126, .7152, .0722));
    vec2 g2 = mat2(.7071, -.7071, .7071, .7071) * gl_FragCoord.xy / 7.0;
    float dv = smoothstep(.05, -.05, length(fract(g2) - .5) - sqrt(l2) * .56);
    col = mix(vec3(.05), vec3(.6, .58, .55), dv);
  }
  col *= 1.0 - scan * (.5 + .5 * sin(vUv.y * 900.0)) - scan * .6 * smoothstep(.25, .75, length(vUv - .5));
  gl_FragColor = vec4(col * gain, opacity);
#include <fog_fragment>
}`;
function screenMat() {
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    map: { value: null }, map2: { value: null }, crop: { value: new THREE.Vector4(0, 0, 1, 1) }, crop2: { value: new THREE.Vector4(0, 0, 1, 1) },
    mixv: { value: 0 }, wipe: { value: 0 }, opacity: { value: 1 }, gain: { value: .82 }, zoom: { value: 1 }, has2: { value: 0 }, asp: { value: 1.78 },
    pan: { value: new THREE.Vector2() }, sat: { value: 1 }, con: { value: 0 }, slat: { value: 0 }, slatAng: { value: .35 }, slatFreq: { value: 9 }, slatPhase: { value: 0 }, scan: { value: 0 }, ink: { value: 0 },
  }]);
  return new THREE.ShaderMaterial({ uniforms: u, vertexShader: SCREEN_VS, fragmentShader: SCREEN_FS, fog: true });
}
function cover(texAsp, boxAsp, ax = .5, ay = .5, reg = [0, 0, 1, 1]) {
  const rw = reg[2] - reg[0], rh = reg[3] - reg[1], ra = texAsp * rw / rh;
  let sw = rw, sh = rh;
  if (ra > boxAsp) sw = rw * boxAsp / ra; else sh = rh * ra / boxAsp;
  return new THREE.Vector4(reg[0] + (rw - sw) * ax, reg[1] + (rh - sh) * ay, sw, sh);
}
const geo = new Map();
const rbox = (w, h, d, r) => { const k = [w, h, d, r].join(); if (!geo.has(k)) geo.set(k, new RoundedBoxGeometry(w, h, d, 3, r)); return geo.get(k); };
const PANELS = [];
function panel({ w, h, d = .035, r = .014, inset = .018, frame = 0x0e0f10, rough = .4, metal = .4, map = null, fit = {}, name = "" }) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: frame, roughness: rough, metalness: metal });
  const body = new THREE.Mesh(rbox(w, h, d, r), bodyMat); body.castShadow = body.receiveShadow = true;
  const sw = w - 2 * inset, sh = h - 2 * inset, mat = screenMat();
  mat.uniforms.asp.value = sw / sh;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat);
  scr.position.z = d / 2 + .0015;
  g.add(body, scr);
  g.userData = { body, bodyMat, scr, mat, u: mat.uniforms, sw, sh, d, name };
  if (map) setMap(g, map, fit);
  PANELS.push(g);
  return g;
}
function setMap(p, t, fit = {}, slot = 1) {
  const u = p.userData.u, c = cover(t.userData.asp, p.userData.sw / p.userData.sh, fit.ax ?? .5, fit.ay ?? .5, fit.reg);
  if (slot === 1) { u.map.value = t; u.crop.value.copy(c); } else { u.map2.value = t; u.crop2.value.copy(c); u.has2.value = 1; }
}
const jobs = [];
const shown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
function video(p, url, fit = {}, slot = 1) { if (shown(p)) jobs.push({ p, url, fit, slot }); }
const seqUrl = (base, count, fps, local, loop = true, pad = 4, ext = "jpg") => {
  let i = Math.floor(local * fps + 1e-6);
  i = loop ? ((i % count) + count) % count : clamp(i, 0, count - 1);
  return base + String(i + 1).padStart(pad, "0") + "." + ext;
};

// Resolution guard: projected screen px per source px, per visible panel. Anything past 1.1 is logged.
const UPSCALE = [], MAXR = {};
const corner = V3(0, 0, 0);
function checkTexels(t) {
  for (const p of PANELS) {
    const { scr, u, sw, sh, name } = p.userData, m = u.map.value;
    if (!m || !m.image || !shown(p) || name.startsWith("ink-") || !name) continue;
    const pts = [[-sw / 2, 0], [sw / 2, 0], [0, -sh / 2], [0, sh / 2]].map(([x, y]) => { corner.set(x, y, 0); scr.localToWorld(corner); corner.project(camera); return [(corner.x + 1) * W / 2, (1 - corner.y) * H / 2, corner.z]; });
    if (pts.some(q => q[2] > 1)) continue;
    corner.set(0, 0, 0); scr.localToWorld(corner); corner.project(camera);
    if (corner.z > 1 || Math.abs(corner.x) > 1 || Math.abs(corner.y) > 1) continue;
    const pxW = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), pxH = Math.hypot(pts[3][0] - pts[2][0], pts[3][1] - pts[2][1]);
    const texW = m.image.width * u.crop.value.z / u.zoom.value, texH = m.image.height * u.crop.value.w / u.zoom.value;
    const ratio = Math.max(pxW / texW, pxH / texH);
    if (!(MAXR[name] >= ratio)) MAXR[name] = +ratio.toFixed(3);
    if (ratio > 1.1) { UPSCALE.push({ t: +t.toFixed(3), name, ratio: +ratio.toFixed(2) }); console.warn(`upscale ${name} ${ratio.toFixed(2)}x at ${t.toFixed(3)}`); }
  }
}

// ================================================================ type on canvases
const F = { mono: '"Courier Prime", monospace', serif: '"Playfair Display", serif', jp: '"Noto Serif JP", serif' };
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
const sstep2 = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ================================================================ the grid
// Same score and grid as reel3: 70 BPM from 29.363 s, the silent bar cut out.
const BEAT = 60 / 70, bt = n => n * BEAT;

// ================================================================ camera
const SHOTS = [];
function shot(keys, o = {}) {
  const K = keys.map(k => ({ t: bt(k.b), pos: V3(...k.pos), look: V3(...k.look), fov: k.fov ?? 32, roll: k.roll ?? 0 }));
  SHOTS.push({ t0: K[0].t, t1: o.end != null ? bt(o.end) : K[K.length - 1].t, K, ap: o.ap ?? 0, focus: o.focus, room: !!o.room, ease: o.ease ?? true });
}
function shotAt(t) { for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }
const cr = (p0, p1, p2, p3, s) => {
  const s2 = s * s, s3 = s2 * s;
  return p1.clone().multiplyScalar(2).add(p2.clone().sub(p0).multiplyScalar(s)).add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(s2))
    .add(p3.clone().sub(p0).add(p1.clone().multiplyScalar(3)).sub(p2.clone().multiplyScalar(3)).multiplyScalar(s3)).multiplyScalar(.5);
};
E.io2 = cubicBezier(.45, 0, .55, 1);
function camAt(s, t) {
  const K = s.K, n = K.length;
  if (n === 1) return { pos: K[0].pos, look: K[0].look, fov: K[0].fov, roll: K[0].roll };
  const T0 = K[0].t, T1 = K[n - 1].t, g = clamp((t - T0) / (T1 - T0));
  const tt = T0 + (s.ease ? E.io2(g) : g) * (T1 - T0);
  let i = 0; while (i < n - 2 && tt >= K[i + 1].t) i++;
  const u = clamp((tt - K[i].t) / (K[i + 1].t - K[i].t)), P = j => K[clamp(j, 0, n - 1)];
  return { pos: cr(P(i - 1).pos, P(i).pos, P(i + 1).pos, P(i + 2).pos, u), look: cr(P(i - 1).look, P(i).look, P(i + 1).look, P(i + 2).look, u), fov: lerp(P(i).fov, P(i + 1).fov, u), roll: lerp(P(i).roll, P(i + 1).roll, u) };
}

// ================================================================ build helpers
const hud = document.getElementById("hud");
const world = {};
const upd = [];
const STATIC = [];
function group(name, parent = scene) { const g = new THREE.Group(); parent.add(g); world[name] = g; return g; }
const grey = (c, rough = .8, metal = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal });
function mesh(geom, mat, parent, pos, o = {}) {
  const m = new THREE.Mesh(geom, mat); m.position.set(...pos); if (o.rot) m.rotation.set(...o.rot);
  m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; parent.add(m); return m;
}
function fadeAll(obj, o) {
  obj.traverse(m => {
    if (!m.material) return;
    for (const mt of Array.isArray(m.material) ? m.material : [m.material]) {
      if (mt.userData.o0 == null) mt.userData.o0 = mt.opacity ?? 1;
      if (mt.uniforms?.opacity) mt.uniforms.opacity.value = o; else mt.opacity = mt.userData.o0 * o;
      mt.transparent = o < .999 || mt.userData.o0 < .999 || !!mt.map?.userData?.alpha; mt.depthWrite = o > .5;
    }
  });
  obj.visible = o > .002;
}
// Panels land like a page being inked in: from in front, turned and a touch small, to rest.
function land(obj, t0, o = {}) {
  const p0 = obj.position.clone(), r0 = obj.rotation.clone(), s0 = obj.scale.x, d = o.d ?? .34, lift = o.lift ?? .4, spin = o.spin ?? .1, dx = o.dx ?? 0, dy = o.dy ?? 0;
  upd.push(t => {
    if (t < t0) { obj.visible = false; return; }
    const k = E.out(prog(t, t0, d));
    obj.position.set(p0.x + (1 - k) * dx, p0.y + (1 - k) * dy, p0.z + (1 - k) * lift);
    obj.rotation.set(r0.x, r0.y, r0.z + (1 - k) * spin);
    obj.scale.setScalar(s0 * lerp(.88, 1, k));
    fadeAll(obj, clamp(k * 3));
  });
}
// A comic panel: black outline, bone border, the work inside (a screen panel, so it stays in colour).
function cpanel(w, h, name, o = {}) {
  const g = new THREE.Group();
  const line = new THREE.Mesh(new THREE.PlaneGeometry(w + .03, h + .03), new THREE.MeshBasicMaterial({ color: 0x050505 })); line.position.z = -.003; g.add(line);
  const p = panel({ w, h, d: .004, r: .001, inset: o.inset ?? .02, frame: 0xe9e4d6, rough: 1, metal: 0, map: o.map, fit: o.fit, name });
  g.add(p); g.userData.p = p; return g;
}
function burst(parent, x, y, z, size, t0) {
  const C = canvasTex(1024, 1024), c = C.ctx; C.tex.userData.alpha = true;
  c.translate(512, 512);
  for (let i = 0; i < 140; i++) { const a = i / 140 * Math.PI * 2 + (i % 3) * .01, w = .006 + (i % 5) * .004; c.fillStyle = i % 2 ? "rgba(233,228,214,.9)" : "rgba(10,10,10,.95)"; c.beginPath(); c.moveTo(Math.cos(a) * 150, Math.sin(a) * 150); c.lineTo(Math.cos(a - w) * 720, Math.sin(a - w) * 720); c.lineTo(Math.cos(a + w) * 720, Math.sin(a + w) * 720); c.fill(); }
  C.tex.needsUpdate = true;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: C.tex, transparent: true, depthWrite: false }));
  m.position.set(x, y, z); parent.add(m);
  upd.push(t => { const k = prog(t, t0, .7); m.visible = t >= t0 && k < 1; m.scale.setScalar(lerp(.8, 1.12, E.out(k))); m.material.opacity = 1 - E.in3(k); m.rotation.z = k * .15; });
}

// ================================================================ the intro room (the same office as reel3, rendered into the first panel)
let GLOW;
const ROOM_OFF = V3(0, -40, 0);
function buildRoom() {
  const g = group("office");
  const wall = grey(0x6d6d6d, .92), trim = grey(0x1a1a1a, .7);
  const WX = 1.5, WY0 = 1.0, WY1 = 2.7, Z = -3;
  mesh(new THREE.BoxGeometry(8.4, .1 + WY0, .2), wall, g, [0, WY0 / 2, Z]);
  mesh(new THREE.BoxGeometry(8.4, 3.2 - WY1, .2), wall, g, [0, WY1 + (3.2 - WY1) / 2, Z]);
  mesh(new THREE.BoxGeometry(4.2 - WX, WY1 - WY0, .2), wall, g, [-(WX + (4.2 - WX) / 2), (WY0 + WY1) / 2, Z]);
  mesh(new THREE.BoxGeometry(4.2 - WX, WY1 - WY0, .2), wall, g, [WX + (4.2 - WX) / 2, (WY0 + WY1) / 2, Z]);
  [-WX - .03, WX + .03].forEach(x => mesh(new THREE.BoxGeometry(.06, WY1 - WY0, .22), trim, g, [x, (WY0 + WY1) / 2, Z]));
  mesh(new THREE.BoxGeometry(2 * WX + .16, .08, .3), trim, g, [0, WY0, Z + .02]);
  mesh(new THREE.BoxGeometry(2 * WX + .16, .08, .3), trim, g, [0, WY1, Z + .02]);
  mesh(new THREE.BoxGeometry(.06, WY1 - WY0, .12), trim, g, [0, (WY0 + WY1) / 2, Z - .02]);
  const slatMat = grey(0x9a9a9a, .5, .1);
  for (let y = WY0 + .05; y < WY1 - .03; y += .075) mesh(new THREE.BoxGeometry(2 * WX, .045, .004), slatMat, g, [0, y, Z + .13], { rot: [-.9, 0, 0] });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a })); sky.position.set(0, 2, -9); g.add(sky);
  const lampGlow = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: GLOW, color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lampGlow.position.set(1.8, 3.2, -8.9); g.add(lampGlow);
  const street = new THREE.SpotLight(0xffffff, 700, 0, .46, .25, 2);
  street.position.set(1.4, 3.6, -7.5); street.target.position.set(-.2, 0, .2);
  street.castShadow = true; street.shadow.mapSize.set(4096, 4096); street.shadow.bias = -.0004; street.shadow.radius = 2; g.add(street, street.target);
  const r = rng(11), N = 900;
  const rain = new THREE.InstancedMesh(new THREE.PlaneGeometry(.006, .32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6), transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending }), N);
  const seeds = Array.from({ length: N }, () => ({ x: (r() - .5) * 9, y: r() * 6, z: -3.4 - r() * 5, v: 7 + r() * 3 }));
  g.add(rain); noDepth.push(rain);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, .12)), sc = V3(1, 1, 1), ps = V3(0, 0, 0);
  upd.push(t => { seeds.forEach((s, i) => { const y = ((s.y - s.v * t) % 6 + 6) % 6; ps.set(s.x - y * .12, y - .5, s.z); m4.compose(ps, q, sc); rain.setMatrixAt(i, m4); }); rain.instanceMatrix.needsUpdate = true; });
  const wood = grey(0x2b2b2b, .92, 0);
  mesh(new THREE.BoxGeometry(2.0, .06, .95), wood, g, [0, .76, -1.6]);
  [[-.92, -2.0], [.92, -2.0], [-.92, -1.2], [.92, -1.2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.06, .73, .06), wood, g, [x, .365, z]));
  mesh(new THREE.BoxGeometry(.5, .5, .8), wood, g, [-.7, .5, -1.6]);
  const dark = grey(0x151515, .7);
  mesh(new THREE.BoxGeometry(.56, .7, .08), dark, g, [.1, 1.05, -2.25], { rot: [.08, 0, 0] });
  mesh(new THREE.CylinderGeometry(.08, .1, .02, 24), dark, g, [-.72, .8, -1.85]);
  mesh(new THREE.CylinderGeometry(.012, .012, .36, 12), dark, g, [-.72, .98, -1.85]);
  const shade = mesh(new THREE.CylinderGeometry(.06, .16, .14, 32, 1, true), grey(0x303030, .5, .3), g, [-.72, 1.16, -1.8], { rot: [.35, 0, 0] }); shade.material.side = THREE.DoubleSide;
  const bulb = new THREE.PointLight(0xffffff, .6, 2, 2); bulb.position.set(-.72, 1.1, -1.72); g.add(bulb);
  const paperGrey = grey(0x8c8c8c, .95);
  mesh(new THREE.BoxGeometry(.42, .004, .3), paperGrey, g, [.05, .792, -1.4], { rot: [0, .15, 0] });
  mesh(new THREE.BoxGeometry(.42, .004, .3), paperGrey, g, [.12, .796, -1.45], { rot: [0, -.1, 0] });
  const shader = {
    uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, bg: { value: new THREE.Color(0x050505) }, refl: { value: .35 } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; void main(){ vUv = textureMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bg; uniform float refl; varying vec4 vUv;
      void main(){ vec2 p = vUv.xy / vUv.w; vec3 r = vec3(0.0); for (int i = 0; i < 5; i++) { float a = float(i) * 2.39996; r += texture2D(tDiffuse, p + vec2(cos(a), sin(a)) * .003 * float(i)).rgb; } gl_FragColor = vec4(bg + r / 5.0 * refl, 1.0); }`,
  };
  const fl = new Reflector(new THREE.PlaneGeometry(12, 12), { textureWidth: 960, textureHeight: 540, clipBias: .003, shader }); fl.rotation.x = -Math.PI / 2; g.add(fl);
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .85 })); matte.rotation.x = -Math.PI / 2; matte.position.y = .001; matte.receiveShadow = true; g.add(matte);
  g.position.copy(ROOM_OFF);
  return g;
}
const roomCam = new THREE.PerspectiveCamera(32, W / H, .05, 200);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const INTRO = [{ b: 0, pos: [.35, 1.3, 4.4], look: [0, 1.35, -3] }, { b: 3.65, pos: [.2, 1.25, 3.6], look: [0, 1.4, -3] }];

// ================================================================ the page
// One long comic page in the XY plane, printed in ink: world-space halftone, never flat black.
const PAGE_VS = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const PAGE_FS = `
varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
void main(){
  vec2 p = vW.xy;
  float tone = .08 + .55 * smoothstep(.35, .9, n(p * .32) * .65 + n(p * 1.4 + 7.0) * .35);
  vec2 g = mat2(.7071, -.7071, .7071, .7071) * p / .03;
  float d = length(fract(g) - .5);
  float dotv = smoothstep(.04, -.04, d - sqrt(tone) * .46);
  vec3 col = mix(vec3(.045), vec3(.42, .41, .39), dotv);
  float grain = h(floor(p * 900.0)) * .03;
  gl_FragColor = vec4(col + grain, 1.0);
}`;
function buildPage() {
  const g = group("page", group("comic"));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), new THREE.ShaderMaterial({ vertexShader: PAGE_VS, fragmentShader: PAGE_FS }));
  m.position.set(14, 0, 0); g.add(m);
  g.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2));
  const d = new THREE.DirectionalLight(0xffffff, 1.2); d.position.set(-2, 3, 5); g.add(d);
  return g;
}
// Ink art behind each case: the case's own image printed as coarse halftone.
function inkArt(parent, url, x, y, w, h, name) {
  const p = panel({ w, h, d: .001, r: .0005, inset: 0, frame: 0x050505, map: tex(url), name: "ink-" + name });
  p.position.set(x, y, .004); p.userData.u.ink.value = 1; p.userData.u.gain.value = 1; parent.add(p); return p;
}

// ---------------------------------------------------------------- 0 · the intro, then the room becomes panel one
function buildIntroPanel() {
  const g = world.comic;
  const vh = 2 * 2.2 * Math.tan(THREE.MathUtils.degToRad(16)), vw = vh * W / H;
  const p = panel({ w: vw, h: vh, d: .004, r: .001, inset: 0, frame: 0x000000, name: "intro-panel" });
  p.userData.u.map.value = rt.texture; p.userData.u.gain.value = 1; rt.texture.userData.asp = W / H; p.userData.u.crop.value.set(0, 0, 1, 1);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(vw + .06, vh + .06), new THREE.MeshBasicMaterial({ color: 0xe9e4d6 })); line.position.z = -.003;
  const ip = new THREE.Group(); ip.add(line, p); ip.position.set(0, 0, .02); g.add(ip);
  p.userData.name = "";
  return g;
}

// ---------------------------------------------------------------- 1 · terra (beats 4 – 12), around x = 3.2
function terraLogo() {
  const root = new THREE.Group(), s = new THREE.Group(); s.scale.set(-1, 1, 1); root.add(s);
  const M = c => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: .35, emissive: new THREE.Color(c), emissiveIntensity: .45 });
  const green = M("#14796C"), r = .17, baseY = -.55, fr = 5.0, fcy = baseY - fr + .25, hill = x => fcy + Math.sqrt(fr * fr - x * x), lift = .58, gap = .52;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(fr, .13, 16, 120, Math.PI * .2), green); arc.rotation.z = Math.PI * .4; arc.position.y = fcy; s.add(arc);
  [Math.PI * .4, Math.PI * .6].forEach(a => { const m = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), green); m.position.set(fr * Math.cos(a), fcy + fr * Math.sin(a), 0); s.add(m); });
  [[-1.4, 1.1, "#A5E03D"], [-.7, 2.3], [0, 1.85], [.7, 1.5, "#2FA8F5"], [1.4, 1.1, null, "#FF8B3D"]].forEach(([x, hh, top, bot]) => {
    const b0 = bot ? hill(x) + lift + gap : hill(x) + lift;
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(r, hh, 8, 24), green); cap.position.set(x, b0 + hh / 2, 0); s.add(cap);
    if (top) { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M(top)); d.position.set(x, b0 + hh + gap, 0); s.add(d); }
    if (bot) { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M(bot)); d.position.set(x, hill(x) + lift, 0); s.add(d); }
  });
  return root;
}
const CHART = "M0,162.2 L37.5,155.7 L75,148.4 L112.5,136.3 L150,131.7 L187.5,140.4 L225,144.5 L262.5,135.5 L300,63.5 L337.5,35 L375,108.7 L412.5,104.5 L450,57.5 L487.5,32.3 L525,100.1 L562.5,12 L600,128.2"
  .match(/[\d.]+,[\d.]+/g).map(p => p.split(",").map(Number));
function headlineTex() {
  const C = canvasTex(1600, 1160), c = C.ctx;
  c.fillStyle = "#e9e4d6"; c.fillRect(0, 0, 1600, 1160); c.fillStyle = "#0b0b0b"; c.textAlign = "center";
  c.font = `700 56px ${F.mono}`; c.fillText("TERRA · GROWTH, CONTENT & DESIGN", 800, 110); c.fillRect(70, 145, 1460, 7);
  c.font = `900 470px ${F.serif}`; c.fillText("12×", 800, 600);
  c.font = `900 150px ${F.serif}`; c.fillText("ORGANIC GROWTH", 800, 790);
  c.fillRect(70, 850, 1460, 4);
  c.font = `700 60px ${F.mono}`; c.fillText("22 MONTHS OF ORGANIC SEARCH", 800, 960);
  C.tex.needsUpdate = true; return C.tex;
}
function statTex(big, small) {
  const C = canvasTex(800, 460), c = C.ctx;
  const draw = s => { c.fillStyle = "#e9e4d6"; c.fillRect(0, 0, 800, 460); c.fillStyle = "#0b0b0b"; c.textAlign = "center"; c.font = `900 190px ${F.serif}`; c.fillText(s, 400, 250); c.font = `700 62px ${F.mono}`; c.fillText(small, 400, 370); C.tex.needsUpdate = true; };
  draw(big); return { tex: C.tex, draw };
}
function buildTerra() {
  const g = group("terra", world.comic);
  const SOC = ["02-law-update-econtract-vi", "03-culture-appreciation-party", "06-culture-team-photo", "07-event-recap-terra-say-hi", "04-seasonal-womens-day", "05-service-explainer-si-expat"];
  STATIC.push(P("images/visuals/publishing-machine.webp"), P("images/terra-outsourcing-preview.webp"), P("images/terra-customers-preview.webp"), ...SOC.map(s => P(`images/terra-social/${s}.webp`)));
  return () => {
    inkArt(g, P("images/visuals/publishing-machine.webp"), 3.1, .1, 4.4, 2.93, "terra");
    const add = (o, x, y, z, rz = 0) => { o.position.set(x, y, z); o.rotation.z = rz; g.add(o); return o; };
    const BONE = canvasTex(64, 64); BONE.ctx.fillStyle = "#e9e4d6"; BONE.ctx.fillRect(0, 0, 64, 64); BONE.tex.needsUpdate = true;
    const logoP = add(cpanel(.86, .66, "", { map: BONE.tex, inset: .02 }), 1.55, .5, .03, -.02);
    const logo = terraLogo(); logo.scale.setScalar(.095); add(logo, 1.55, .47, .12);
    land(logoP, bt(4), { dx: -.4 }); land(logo, bt(4) + .1, { lift: .6, spin: .35 });
    upd.push(t => { logo.rotation.y = lerp(-1.6, 0, E.out(prog(t, bt(4) + .1, 1.2))) + Math.sin(t * 1.4) * .15; });
    land(add(cpanel(.5, .8, "terra-lp1", { map: tex(P("images/terra-outsourcing-preview.webp")), fit: { ay: 1 } }), 2.3, .55, .05, .03), bt(4.5), { dy: .5 });
    land(add(cpanel(.5, .8, "terra-lp2", { map: tex(P("images/terra-customers-preview.webp")), fit: { ay: 1 } }), 2.85, .42, .07, -.04), bt(5), { dy: .5 });
    SOC.slice(0, 4).forEach((s, i) => land(add(cpanel(.4, .225, "terra-soc" + i, { map: tex(P(`images/terra-social/${s}.webp`)) }), 3.45 + (i % 2) * .44, .8 - Math.floor(i / 2) * .27, .05 + i * .004, (i % 2 ? .03 : -.03)), bt(6) + i * .07, { dx: .3 }));
    // The chart panel: a growth line inked across it.
    const CC = canvasTex(1400, 760), cc = CC.ctx;
    const chartP = add(cpanel(1.05, .57, "terra-chart", { map: CC.tex }), 1.85, -.4, .05, .02); land(chartP, bt(6.8), { dx: -.4 });
    upd.push(t => {
      if (!g.visible || t < bt(6.8)) return;
      const k = E.io(prog(t, bt(7), 1.2)); cc.fillStyle = "#e9e4d6"; cc.fillRect(0, 0, 1400, 760);
      cc.fillStyle = "#0b0b0b"; cc.font = `700 56px ${F.mono}`; cc.fillText("ORGANIC SEARCH ↗", 60, 90);
      const pts = CHART.map(([x, y]) => [80 + x * 2.1, 160 + y * 3.4]), upto = k * (pts.length - 1), m = Math.floor(upto), f = upto - m;
      cc.beginPath(); cc.moveTo(...pts[0]); for (let i = 1; i <= m; i++) cc.lineTo(...pts[i]);
      if (m < pts.length - 1) cc.lineTo(lerp(pts[m][0], pts[m + 1][0], f), lerp(pts[m][1], pts[m + 1][1], f));
      cc.strokeStyle = "#14796C"; cc.lineWidth = 16; cc.lineJoin = cc.lineCap = "round"; cc.stroke(); CC.tex.needsUpdate = true;
    });
    // The hero: the headline panel slams in with a burst behind it.
    burst(g, 3.15, -.25, .06, 2.6, bt(8));
    land(add(cpanel(1.12, .81, "terra-headline", { map: headlineTex() }), 3.15, -.25, .12, -.025), bt(8), { lift: .9, spin: -.3, d: .3 });
    [["31.4M", "IMPRESSIONS", v => `${(31.4 * v).toFixed(1)}M`], ["978", "TOP-10 KEYWORDS", v => `${Math.round(978 * v)}`], ["55 → 90", "SITE HEALTH", v => `55 → ${Math.round(lerp(55, 90, v))}`]].forEach(([b, s, f], i) => {
      const S = statTex(b, s), sp = add(cpanel(.46, .265, "terra-stat" + i, { map: S.tex }), 4.12, .02 - i * .3, .1 + i * .005, (i - 1) * -.03);
      const t0 = bt(9) + i * bt(1 / 3); land(sp, t0, { dx: .4 });
      upd.push(t => { if (t >= t0 && t < t0 + 1) S.draw(f(E.out(prog(t, t0, .8)))); });
    });
  };
}

// ---------------------------------------------------------------- 2 · Nhà Mình (beats 12 – 20), around x = 7.6
function buildNha() {
  const g = group("nha", world.comic);
  STATIC.push(P("images/visuals/shared-care.webp"), P("images/nha-minh/09-app-bame-chau-bi.png"), P("images/nha-minh/07-app-bame-hom-nay.png"), P("images/nha-minh/02-app-con-tong-quan.png"), P("images/nha-minh/04-app-con-chi-so.png"), P("images/nha-minh/03-app-con-don-thuoc.png"));
  return () => {
    inkArt(g, P("images/visuals/shared-care.webp"), 7.6, 0, 4.2, 2.8, "nha");
    const add = (o, x, y, z, rz = 0) => { o.position.set(x, y, z); o.rotation.z = rz; g.add(o); return o; };
    const main = add(cpanel(1.36, .765, "nha-video"), 7.05, .22, .06, -.015); land(main, bt(12), { dx: -.5 });
    upd.push(t => { if (g.visible && t >= bt(12)) video(main.userData.p, seqUrl("../cache/v3/nha-sync/", 105, 30, t - bt(12), true)); });
    land(add(cpanel(.36, .78, "nha-phone1", { map: tex(P("images/nha-minh/09-app-bame-chau-bi.png")), fit: { ay: 1 } }), 8.12, .12, .09, .03), bt(12.5), { dy: -.6 });
    [["02-app-con-tong-quan", 6.35, -.55], ["04-app-con-chi-so", 7.2, -.6], ["03-app-con-don-thuoc", 8.95, -.5]].forEach(([n, x, y], i) =>
      land(add(cpanel(.6, .375, "nha-" + n, { map: tex(P(`images/nha-minh/${n}.png`)), fit: { ay: 1 } }), x, y, .08 + i * .01, (i - 1) * .03), bt(13) + i * bt(.5), { dy: -.4 }));
    burst(g, 8.7, .3, .07, 1.6, bt(14.5));
    land(add(cpanel(.3, .65, "nha-phone2", { map: tex(P("images/nha-minh/07-app-bame-hom-nay.png")), fit: { ay: 1 } }), 8.72, .33, .12, -.05), bt(14.5), { lift: .8, spin: .3 });
  };
}

// ---------------------------------------------------------------- 3 · Video & brand (beats 20 – 24), around x = 12
const GRID = ["g-mb-drink", "g-aris-sil", "g-yl-night", "g-isbe", "g-mb-cheers", "g-loa", "g-aris-close", "g-hn", "g-mdh"];
const GRID_N = { "g-loa": 71 };
function filmStrip(parent, y, L, speed, frames, name, rz = 0) {
  const SB = canvasTex(64, 512), sb = SB.ctx; sb.fillStyle = "#0b0b0b"; sb.fillRect(0, 0, 64, 512); sb.fillStyle = "#e9e4d6";
  for (let yy = 8; yy < 512; yy += 32) { sb.fillRect(6, yy, 10, 16); sb.fillRect(48, yy, 10, 16); } SB.tex.wrapT = THREE.RepeatWrapping; SB.tex.needsUpdate = true;
  const strip = new THREE.Group(); strip.position.set(12, y, .16); strip.rotation.z = rz; parent.add(strip);
  const base = new THREE.Mesh(new THREE.PlaneGeometry(.3, L), new THREE.MeshBasicMaterial({ map: SB.tex })); base.rotation.z = Math.PI / 2; SB.tex.repeat.set(1, L / .3 * .5); strip.add(base);
  const fr = Array.from({ length: frames }, () => { const p = panel({ w: .24, h: .135, d: .001, r: .0003, inset: 0, frame: 0x000000, name }); p.position.z = .002; strip.add(p); return p; });
  upd.push(t => {
    if (!parent.visible) return;
    const off = (t - bt(20)) * speed; SB.tex.offset.y = -off / .3 * .5;
    fr.forEach((p, i) => { p.position.x = ((i * .27 - off) % L + L) % L - L / 2; const id = GRID[(i * 2 + (speed > 0 ? 0 : 5)) % 9]; video(p, seqUrl(`../cache/v3/${id}/`, GRID_N[id] || 72, 30, t + i * .3, true)); });
  });
  return strip;
}
function buildVideo() {
  const g = group("video", world.comic);
  return () => {
    // An irregular comic grid: nine works on at once, each panel landing on the next quarter-beat.
    const L = [[10.95, .38, .9, .5], [11.9, .38, .9, .5], [12.85, .45, .9, .5], [11.05, -.18, 1.1, .5], [12.2, -.2, 1.1, .5], [13.1, -.12, .6, .34],
      [10.8, -.72, .7, .4], [11.62, -.74, .84, .47], [12.62, -.7, 1.0, .5]];
    GRID.forEach((id, i) => {
      const [x, y, w, h] = L[i], c = cpanel(w, h, "vb-" + id, { inset: .015 }); c.position.set(x, y, .06 + (i % 3) * .01); c.rotation.z = ((i * 7) % 5 - 2) * .008; g.add(c);
      const t0 = bt(20) + i * bt(.25); land(c, t0, { dx: (i % 2 ? .5 : -.5), dy: (i % 3 - 1) * .3 });
      upd.push(t => { if (g.visible && t >= t0) video(c.userData.p, seqUrl(`../cache/v3/${id}/`, GRID_N[id] || 72, 30, t - t0 + i * .2, true)); });
    });
    filmStrip(g, .5, 3.8, .45, 14, "vb-strip", .09);
    filmStrip(g, -.58, 3.8, -.38, 14, "vb-strip", -.07);
  };
}

// ---------------------------------------------------------------- 4 · Aru Otoko (beats 24 – 32), around x = 16.6
function buildAru() {
  const g = group("aru", world.comic);
  STATIC.push(P("images/aru-otoko/stills/s08-skyline.webp"));
  return () => {
    inkArt(g, P("images/aru-otoko/stills/s08-skyline.webp"), 16.6, -.1, 4.2, 2.35, "aru");
    // Widescreen panels stacked down the page; the camera cranes down through them.
    const rows = [[16.45, .95, 1.5, .5, "aru-mv", 222, 24], [16.08, .36, .74, .42, "aru-g0", 72, 25], [16.84, .36, .74, .42, "aru-g1", 72, 25.4],
      [16.45, -.22, 1.5, .5, "aru-mv", 222, 26.5], [16.08, -.8, .74, .42, "aru-g2", 72, 28], [16.84, -.8, .74, .42, "aru-g3", 72, 28.4],
      [16.08, -1.34, .74, .42, "aru-g4", 72, 29.5], [16.84, -1.34, .74, .42, "aru-g5", 72, 29.9]];
    rows.forEach(([x, y, w, h, id, n, b], i) => {
      const c = cpanel(w, h, "aru-" + id + i, { inset: .015 }); c.position.set(x, y, .06 + i * .004); g.add(c);
      land(c, bt(b), { dx: i % 2 ? .4 : -.4 });
      const off = id === "aru-mv" && i === 3 ? 3.6 : 0;
      upd.push(t => { if (g.visible && t >= bt(b)) video(c.userData.p, seqUrl(`../cache/v3/${id}/`, n, 30, id === "aru-mv" ? off + (t - bt(b)) : t + i * .4, id !== "aru-mv")); });
    });
    // The title as vertical lettering in the gutter.
    const JC = canvasTex(256, 1024), jc = JC.ctx; JC.tex.userData.alpha = true;
    jc.fillStyle = "#e9e4d6"; jc.font = `700 220px ${F.jp}`; jc.textAlign = "center"; ["或", "る", "男"].forEach((ch, i) => jc.fillText(ch, 128, 250 + i * 290)); JC.tex.needsUpdate = true;
    const jp = new THREE.Mesh(new THREE.PlaneGeometry(.26, 1.04), new THREE.MeshBasicMaterial({ map: JC.tex, transparent: true, depthWrite: false })); jp.position.set(17.62, .35, .08); g.add(jp);
    land(jp, bt(24.6), { dy: .3 });
  };
}

// ---------------------------------------------------------------- 5 · Bóng Vespera (beats 32 – 40), around x = 21
const KF = ["kf1-the-gate-at-dawn", "kf2-the-wanderer-enters", "kf3-path-of-guardians", "kf4-the-kneeling-moment", "kf5-after-the-recognition"];
function buildBong() {
  const g = group("bong", world.comic);
  STATIC.push(...KF.map(k => P(`images/vng-demo/stills/${k}.webp`)), P("images/vng-demo/final/ad-mockup-final.webp"));
  return () => {
    inkArt(g, P("images/vng-demo/final/ad-mockup-final.webp"), 21.1, 0, 2.0, 3.0, "bong");
    const XS = [19.95, 20.53, 21.11, 21.69, 22.27], YS = [.08, -.04, .06, -.06, .04];
    const ps = KF.map((k, i) => {
      const c = cpanel(.5, .75, "bong-" + i, { map: tex(P(`images/vng-demo/stills/${k}.webp`)), inset: .015 }); c.position.set(XS[i], YS[i], .07 + i * .004); g.add(c);
      land(c, bt(32) + i * bt(.5), { dy: i % 2 ? -.5 : .5 }); return c;
    });
    burst(g, XS[2], YS[2], .06, 1.7, bt(36));
    upd.push(t => {
      if (!g.visible || t < bt(36)) return;
      video(ps[2].userData.p, seqUrl("../cache/v3/bong-mf/", 362, 30, (t - bt(36)) * 1.25, false));
      video(ps[3].userData.p, seqUrl("../cache/v2/bong-motion/", 152, 30, .6 + (t - bt(36)), false));
    });
  };
}

// ---------------------------------------------------------------- 6 · Vitalité (beats 40 – 46), around x = 25.3
// The storefront first, page by page as a shopper would click through it (home, shop, product, cart,
// phone), then the campaign sequence running down its corridor to the wordmark wall, the site's hero
// film, the lookbook pasted round it, a tee changing print every frame, and a pink swash.
const VIT = s => P(`vitalite/demo/theme/${s}`);
const VIT_LOOK = ["assets/collection-01.webp", "assets/editorial-01.webp"];
const VIT_UI = [["home-hero", 23.35, .33, .92, .575, -.02, 40], ["shop-grid", 23.72, .02, .92, .575, .025, 40.5], ["pdp-grey", 23.4, -.4, .92, .575, -.015, 41], ["cart", 24.05, -.66, .8, .5, .03, 41.5]];
function buildVitalite() {
  const g = group("vit", world.comic);
  STATIC.push(VIT("assets/cb-poster.webp"), ...VIT_LOOK.map(VIT), ...Array.from({ length: 18 }, (_, i) => VIT(`mockups/${i + 1}.webp`)),
    ...VIT_UI.map(([n]) => P(`images/vitalite/${n}.webp`)), P("images/vitalite/shop-mobile.webp"));
  return () => {
    inkArt(g, VIT("assets/cb-poster.webp"), 25.3, .05, 5.2, 2.74, "vit");
    const add = (o, x, y, z, rz = 0) => { o.position.set(x, y, z); o.rotation.z = rz; g.add(o); return o; };
    // The storefront, cropped above its orange DEMO strip.
    VIT_UI.forEach(([n, x, y, w, h, rz, b], i) =>
      land(add(cpanel(w, h, "vit-ui-" + n, { map: tex(P(`images/vitalite/${n}.webp`)), fit: { reg: [0, .035, 1, 1], ay: 1 }, inset: .014 }), x, y, .06 + i * .006, rz), bt(b), { dx: -.5, spin: rz * 4 }));
    land(add(cpanel(.26, .56, "vit-ui-mobile", { map: tex(P("images/vitalite/shop-mobile.webp")), fit: { reg: [0, .035, 1, 1], ay: 1 }, inset: .012 }), 24.28, .22, .1, .05), bt(41.75), { dy: .5, spin: .3 });
    // A cursor clicks through the pages as they land.
    const CU = canvasTex(64, 96), cu = CU.ctx; CU.tex.userData.alpha = true;
    cu.fillStyle = "#0b0b0b"; cu.strokeStyle = "#e9e4d6"; cu.lineWidth = 5; cu.beginPath(); cu.moveTo(6, 4); cu.lineTo(6, 78); cu.lineTo(24, 60); cu.lineTo(38, 90); cu.lineTo(50, 84); cu.lineTo(36, 55); cu.lineTo(60, 55); cu.closePath(); cu.stroke(); cu.fill(); CU.tex.needsUpdate = true;
    const cursor = add(new THREE.Mesh(new THREE.PlaneGeometry(.045, .0675), new THREE.MeshBasicMaterial({ map: CU.tex, transparent: true, depthWrite: false })), 0, 0, .14);
    const clicks = [[40.1, 23.62, .35], [40.6, 23.95, -.02], [41.1, 23.62, -.44], [41.6, 24.2, -.7], [41.85, 24.3, .2]].map(([b, x, y]) => [bt(b), x, y]);
    upd.push(t => {
      cursor.visible = g.visible && t >= clicks[0][0] - .2 && t < bt(42.4);
      let i = 0; while (i < clicks.length - 1 && t >= clicks[i + 1][0] - .22) i++;
      const [t1, x1, y1] = clicks[i], [, x0, y0] = clicks[Math.max(0, i - 1)], k = E.io(prog(t, t1 - .22, .2));
      cursor.position.set(lerp(x0, x1, k), lerp(y0, y1, k) - .03, .14); cursor.scale.setScalar(t >= t1 && t < t1 + .08 ? .85 : 1);
    });
    // The campaign sequence: the hero of the case.
    const hero = add(cpanel(1.6, .9, "vit-0823", { inset: .018 }), 25.45, .12, .07, -.01);
    land(hero, bt(42), { lift: .7, spin: -.12 });
    upd.push(t => { if (g.visible && t >= bt(42)) video(hero.userData.p, seqUrl(P("vitalite/demo/wp-content/uploads/seq/0823/"), 96, 1, E.io(prog(t, bt(42.1), bt(3.4))) * 95, false, 3, "webp")); });
    // The site's own hero film: the sky jump, then the tee forming out of the orange.
    const film = add(cpanel(.74, .39, "vit-film", { inset: .012 }), 26.62, .44, .1, .04);
    land(film, bt(42.6), { dx: .5, spin: .2 });
    upd.push(t => {
      if (!g.visible || t < bt(42.6)) return;
      const l = t - bt(42.6);
      video(film.userData.p, l < 1.0 ? seqUrl("../cache/v3/vit-sky/", 29, 30, l, false) : seqUrl("../cache/v3/vit-tee/", 74, 30, l - 1.0, false));
    });
    [[26.98, -.02, .05, 43.3], [26.72, -.55, -.04, 43.7]].forEach(([x, y, rz, b], i) => {
      const [w, h] = i ? [.36, .45] : [.36, .48];
      land(add(cpanel(w, h, "vit-look" + i, { map: tex(VIT(VIT_LOOK[i])), inset: .012 }), x, y, .11 + i * .005, rz), bt(b), { dx: .5, spin: rz * 3 });
    });
    const tee = add(cpanel(.42, .42, "vit-tee", { map: tex(VIT("mockups/1.webp")), inset: .014 }), 26.2, -.52, .13, .04);
    land(tee, bt(42.9), { lift: .6, spin: .3 });
    upd.push(t => { if (t >= bt(42.9)) setMap(tee.userData.p, tex(VIT(`mockups/${1 + Math.floor((t - bt(42.9)) * 8) % 18}.webp`))); });
    const SW = canvasTex(2048, 360), sw = SW.ctx, rn = rng(3); SW.tex.userData.alpha = true;
    for (let i = 0; i < 9; i++) { sw.strokeStyle = `rgba(226,64,95,${.5 + rn() * .5})`; sw.lineWidth = 8 + rn() * 30; sw.lineCap = "round"; sw.beginPath(); const y = 180 + (rn() - .5) * 150; sw.moveTo(40 + rn() * 60, y); sw.bezierCurveTo(600, y - 90 + rn() * 60, 1300, y + 80 - rn() * 60, 1990 - rn() * 80, y + (rn() - .5) * 60); sw.stroke(); }
    SW.tex.needsUpdate = true;
    const swash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SW.tex, transparent: true, depthWrite: false }));
    const swg = add(new THREE.Group(), 24.75, -.5, .115, .05); swg.add(swash);
    upd.push(t => {
      const k = Math.max(.001, E.out(prog(t, bt(43.2), .45))); swg.visible = g.visible && t >= bt(43.2);
      swash.scale.set(1.7 * k, .3, 1); swash.position.x = .85 * k; SW.tex.repeat.set(k, 1);
    });
  };
}

// ---------------------------------------------------------------- 7 · the other cases (beats 46 – 48), around x = 29.6
const REST = [["PATI", "images/pati-challenge/case02-research-pipeline.webp"], ["IELTS Studio", "images/ielts-preview.webp"], ["UpHub", "images/uphub.webp"], ["Badminton Club", "images/badminton-preview.webp"]];
function labelTex(s) {
  const C = canvasTex(1024, 150), c = C.ctx; c.font = `700 78px ${F.mono}`; const w = c.measureText(s.toUpperCase()).width;
  c.fillStyle = "#e9e4d6"; c.fillRect(0, 0, w + 80, 150); c.strokeStyle = "#0b0b0b"; c.lineWidth = 8; c.strokeRect(4, 4, w + 72, 142);
  c.fillStyle = "#0b0b0b"; c.fillText(s.toUpperCase(), 40, 105); C.tex.userData.alpha = true; C.tex.needsUpdate = true; return C.tex;
}
function buildRest() {
  const g = group("rest", world.comic);
  STATIC.push(...REST.map(([, s]) => P(s)));
  return () => {
    const spots = [[28.95, .36, -.04], [29.8, .42, .03], [29.25, -.4, .03], [30.15, -.36, -.03]];
    REST.forEach(([name, src], i) => {
      const [x, y, rz] = spots[i], c = cpanel(.74, .46, "rest-" + name, { map: tex(P(src)), fit: { ay: 1 }, inset: .015 }); c.position.set(x, y, .06 + i * .005); c.rotation.z = rz; g.add(c);
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(.52, .076), new THREE.MeshBasicMaterial({ map: labelTex(name), transparent: true, depthWrite: false }));
      lb.position.set(-.11, -.25, .01); c.add(lb);
      land(c, bt(46) + i * bt(.4), { lift: .7, spin: (i % 2 ? .4 : -.4) });
    });
  };
}

// ---------------------------------------------------------------- 8 · back into the room (beats 48 – end)
// The last panel on the page is the office again; the camera goes in through it and the reel closes
// where it opened.
const END_X = 32.6;
function buildEndPanel() {
  const g = group("endp", world.comic);
  return () => {
    const vh = 2 * 2.2 * Math.tan(THREE.MathUtils.degToRad(16)), vw = vh * W / H;
    const p = panel({ w: vw, h: vh, d: .004, r: .001, inset: 0, frame: 0x000000, name: "" });
    p.userData.u.map.value = rt.texture; p.userData.u.gain.value = 1; p.userData.u.crop.value.set(0, 0, 1, 1);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(vw + .06, vh + .06), new THREE.MeshBasicMaterial({ color: 0xe9e4d6 })); line.position.z = -.003;
    const ep = new THREE.Group(); ep.add(line, p); ep.position.set(END_X, 0, .02); g.add(ep);
    land(ep, bt(47.2), { lift: .5, spin: .08 });
  };
}

// ---------------------------------------------------------------- shots
function cams() {
  // 0 · the intro in the room; at 3.65 beats the room is already on the page as panel one.
  shot(INTRO, { room: true, focus: [0, 1.1, -1.6], ap: .0012, end: 3.65 });
  shot([
    { b: 3.65, pos: [0, 0, 2.2], look: [0, 0, 0] },
    { b: 4.6, pos: [1.0, -.1, 4.0], look: [1.6, 0, 0], roll: -.04 },
    { b: 6.2, pos: [2.55, .42, 2.45], look: [2.7, .42, 0], roll: -.05 },
    { b: 8, pos: [3.05, -.12, 2.05], look: [3.1, -.2, 0], roll: .02 },
    { b: 10, pos: [3.2, -.25, 1.45], look: [3.18, -.25, 0], roll: .03 },
    { b: 11.2, pos: [4.6, -.1, 2.7], look: [5.4, 0, 0], roll: -.02 },
    { b: 12, pos: [6.55, .12, 2.6], look: [6.9, .1, 0], roll: .06 },
    { b: 14, pos: [7.4, 0, 2.35], look: [7.6, 0, 0], roll: 0 },
    { b: 16, pos: [8.3, .1, 2.2], look: [8.3, .1, 0], roll: -.05 },
    { b: 18, pos: [8.2, .12, 1.55], look: [8.15, .12, 0], roll: -.02 },
    { b: 20, pos: [10.7, .0, 2.55], look: [11.0, 0, 0], roll: .03 },
    { b: 22, pos: [11.8, -.05, 2.35], look: [11.9, -.05, 0], roll: -.02 },
    { b: 24, pos: [13.3, 0, 2.3], look: [13.2, 0, 0], roll: .02 },
  ], { ease: false });
  shot([
    { b: 24, pos: [16.5, 1.25, 2.35], look: [16.5, 1.1, 0] },
    { b: 28, pos: [16.5, .05, 2.4], look: [16.5, .05, 0], roll: .02 },
    { b: 32, pos: [16.55, -1.05, 2.3], look: [16.5, -1.05, 0], roll: -.02 },
  ], { ease: false });
  shot([
    { b: 32, pos: [19.8, .05, 2.3], look: [20.0, .02, 0], roll: -.03 },
    { b: 36, pos: [21.15, .04, 2.2], look: [21.1, .02, 0], roll: .02 },
    { b: 40, pos: [21.4, .02, 1.65], look: [21.4, .02, 0], roll: -.01 },
  ], { ease: false });
  shot([
    { b: 40, pos: [21.4, .02, 1.65], look: [21.4, .02, 0], roll: -.01 },
    { b: 41, pos: [23.55, .02, 2.25], look: [23.7, 0, 0], roll: .04 },
    { b: 42.2, pos: [24.4, .02, 2.45], look: [24.7, 0, 0], roll: -.02 },
    { b: 43.6, pos: [25.75, .02, 2.4], look: [25.85, .0, 0], roll: -.03 },
    { b: 44.7, pos: [25.55, .08, 1.95], look: [25.5, .08, 0], roll: -.01 },
    { b: 45.5, pos: [25.5, .14, 1.55], look: [25.45, .13, 0], roll: 0 },
    { b: 46.3, pos: [28.0, .05, 2.4], look: [28.5, .02, 0], roll: .04 },
    { b: 48, pos: [30.2, 0, 2.6], look: [30.3, 0, 0], roll: -.02 },
  ], { ease: false });
  shot([{ b: 48, pos: [30.2, 0, 2.6], look: [30.3, 0, 0], roll: -.02 }, { b: 49, pos: [END_X, 0, 2.2], look: [END_X, 0, 0], roll: 0 }]);
  shot(END_ROOM, { room: true, focus: [0, 1.1, -1.6], ap: .0012 });
}
const END_ROOM = [{ b: 49, pos: [.2, 1.25, 3.6], look: [0, 1.4, -3] }, { b: 52.2, pos: [.1, 1.22, 2.75], look: [0, 1.42, -3] }];

// ---------------------------------------------------------------- HUD: noir caption boxes
const caps = [];
function h(tag, cls, parent, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; parent.appendChild(e); return e; }
function cap(o) {
  const el = h("div", "box", hud); el.style.cssText += o.css || "";
  o.lines.forEach(([cls, text]) => { const ln = h("div", cls, el); if (cls.includes("type")) { o.typeEl = ln; o.typeText = text; } else ln.innerHTML = text; });
  o.el = el; caps.push(o);
}
const CAPS = [];
function buildHud() {
  const BL = "left:120px; bottom:110px;", BR = "right:120px; bottom:110px;", TL = "left:120px; top:100px;";
  const C = (t0, t1, lines, o = {}) => { cap({ t0, t1, lines, css: o.css || BL, type: o.type }); CAPS.push({ t0, t1, text: lines.map(l => l[1].replace(/<[^>]+>/g, "")).join(" / ") }); };
  C(.3, 2.95, [["type", "Ideas into actual things."]], { type: [.1, .045] });
  C(bt(4.6), bt(7.8), [["k", "Case 01 · growth, content & design"], ["h", "terra"]], { css: TL });
  C(bt(12.3), bt(15.7), [["k", "Case 02 · family care, solo build"], ["h", "Nhà Mình"]], { css: TL });
  C(bt(16.3), bt(19.6), [["h it", "A little closer. Even from afar."]]);
  C(bt(20.3), bt(23.75), [["k", "Case 03 · Video & brand"], ["h", "Two-time Top 1 TVC"]], { css: TL });
  C(bt(24.3), bt(27.7), [["k", "Case 04 · AI film"], ["h", "Aru Otoko"]], { css: TL });
  C(bt(32.3), bt(35.7), [["k", "Case 05 · art direction & motion"], ["h", "Bóng Vespera"]], { css: TL });
  C(bt(40.3), bt(43.7), [["k", "Case 06 · fashion e-commerce"], ["h", "Vitalité"]], { css: TL });
  C(bt(48.2), DUR - .3, [["type", "Hi, I'm Thanh. Call me Tatsuki."], ["s", "jak3rpham.github.io"]], { type: [.1, .045], css: "left:120px; bottom:120px;" });
}
function hudAt(t) {
  for (const c of caps) {
    const on = t >= c.t0 && t < c.t1 + .2;
    c.el.style.display = on ? "block" : "none";
    if (!on) continue;
    const kin = E.out(prog(t, c.t0, .3)), kout = E.in3(prog(t, c.t1, .18));
    c.el.style.clipPath = `inset(0 ${((1 - kin) * 100).toFixed(2)}% 0 0)`;
    c.el.style.opacity = String(1 - kout);
    if (c.typeEl) {
      const [start, step] = c.type, n = clamp(Math.floor((t - c.t0 - start + step) / step), 0, c.typeText.length);
      const typing = n < c.typeText.length, blink = Math.floor(t * 2.5) % 2 === 0;
      c.typeEl.innerHTML = c.typeText.slice(0, n) + `<span class="caret" style="opacity:${typing || blink ? 1 : 0}"></span>`;
    }
  }
}

// ================================================================ frame
const REGION = { terra: [bt(3.6), bt(13)], nha: [bt(10.5), bt(21)], video: [bt(18.5), bt(24.5)], aru: [bt(22.5), bt(32.2)], bong: [bt(30), bt(41.5)], vit: [bt(38.5), bt(47.2)], rest: [bt(44.8), bt(49.1)], endp: [bt(46.5), 99] };
function frame(t) {
  frameNo++;
  const s = shotAt(t);
  // Regions only render near their beats, except in the pull-back where the whole page shows.
  for (const [n, [a, b]] of Object.entries(REGION)) world[n].visible = t >= a && t <= b;
  world.office.visible = t < bt(8) || t >= bt(46.5);
  world.comic.visible = !s.room;
  for (const f of upd) f(t);
  // The room renders on its own camera: directly during the intro, into panel one afterwards.
  const endRoom = SHOTS[SHOTS.length - 1], rk = t >= bt(30) ? camAt(endRoom, Math.max(t, endRoom.t0)) : camAt(SHOTS[0], Math.min(t, SHOTS[0].t1 - .001));
  roomCam.position.copy(rk.pos).add(ROOM_OFF); roomCam.up.set(0, 1, 0); roomCam.lookAt(rk.look.clone().add(ROOM_OFF)); roomCam.updateMatrixWorld();
  const c = camAt(s, t), sh = .005, n1 = Math.sin(t * 1.7) * .6 + Math.sin(t * 3.1 + 1) * .4, n2 = Math.sin(t * 1.3 + 2) * .6 + Math.sin(t * 2.7 + 4) * .4;
  const off = s.room ? ROOM_OFF : V3(0, 0, 0);
  camera.position.copy(c.pos).add(off).add(V3(n1 * sh, n2 * sh, 0));
  camera.fov = c.fov; camera.updateProjectionMatrix();
  camera.up.set(0, 1, 0); camera.lookAt(c.look.clone().add(off)); camera.rotateZ(c.roll); camera.updateMatrixWorld();
  const fv = (s.focus ? V3(...s.focus).add(off) : c.look.clone().add(off)).applyMatrix4(camera.matrixWorldInverse);
  bokeh.uniforms.focus.value = Math.max(.1, -fv.z); bokeh.uniforms.aperture.value = s.ap; bokeh.uniforms.maxblur.value = .01;
  grade.uniforms.uTime.value = t;
  grade.uniforms.uFade.value = E.out(prog(t, 0, .6)) * (1 - E.io(prog(t, DUR - .62, .6)));
  hudAt(t);
}

async function seek(t) {
  jobs.length = 0;
  frame(t);
  const need = jobs.slice();
  await Promise.all(need.map(j => load(j.url, j.fit.max || 4096, 4096, true)));
  for (const j of need) { const e = TEX.get(j.url); if (e && e.tex) setMap(j.p, e.tex, j.fit, j.slot); }
  if (world.office.visible && !shotAt(t).room) {
    const vis = world.comic.visible; world.comic.visible = false;
    renderer.setRenderTarget(rt); renderer.render(scene, roomCam); renderer.setRenderTarget(null);
    world.comic.visible = vis;
  }
  checkTexels(t);
  composer.render();
  evict();
  await new Promise(r => requestAnimationFrame(() => r()));
}

async function init() {
  await document.fonts.ready;
  await Promise.all([`700 64px "Courier Prime"`, `400 32px "Courier Prime"`, `700 64px "Playfair Display"`, `900 64px "Playfair Display"`, `italic 700 64px "Playfair Display"`]
    .map(f => document.fonts.load(f, "Nhà Mình Bóng Vitalité ×→·↗")));
  await document.fonts.load(`700 64px "Noto Serif JP"`, "或る男");
  GLOW = radialTex([[0, "rgba(255,255,255,1)"], [.2, "rgba(255,255,255,.4)"], [.55, "rgba(255,255,255,.06)"], [1, "rgba(255,255,255,0)"]]);
  buildRoom();
  buildPage();
  buildIntroPanel();
  const later = [buildTerra(), buildNha(), buildVideo(), buildAru(), buildBong(), buildVitalite(), buildRest(), buildEndPanel()];
  await Promise.all(STATIC.map(u => load(u)));
  later.forEach(f => f());
  cams();
  SHOTS.sort((a, b) => a.t0 - b.t0);
  buildHud();
  // ?clean renders the page without captions (the site's hero background loop).
  if (new URLSearchParams(location.search).has("clean")) hud.style.display = "none";
  await seek(0);
  return { shots: SHOTS.length, textures: TEX.size, dur: DUR };
}
window.seek = seek;
window.upscale = () => UPSCALE;
window.texels = () => MAXR;
window.captions = () => CAPS;
window.shots = () => SHOTS.map(s => ({ t0: +s.t0.toFixed(3), t1: +Math.min(s.t1, DUR).toFixed(3) }));
window.ready = init();
