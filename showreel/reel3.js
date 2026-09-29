// Reel v3, "The case files". A noir office at night: rain behind the blinds, a black-and-white
// world, and every project is a case whose work is the only thing in colour. Shots are cuts, each
// with at most one slow move. seek(t) is a pure function of t.
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

const W = 1920, H = 1080, DUR = 41.15;
const P = p => "../public/" + p;

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
uniform float mixv, wipe, opacity, gain, zoom, has2, asp, sat, con, slat, slatAng, slatFreq, slatPhase, scan; uniform vec2 pan;
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
  col *= 1.0 - scan * (.5 + .5 * sin(vUv.y * 900.0)) - scan * .6 * smoothstep(.25, .75, length(vUv - .5));
  gl_FragColor = vec4(col * gain, opacity);
#include <fog_fragment>
}`;
function screenMat() {
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    map: { value: null }, map2: { value: null }, crop: { value: new THREE.Vector4(0, 0, 1, 1) }, crop2: { value: new THREE.Vector4(0, 0, 1, 1) },
    mixv: { value: 0 }, wipe: { value: 0 }, opacity: { value: 1 }, gain: { value: .82 }, zoom: { value: 1 }, has2: { value: 0 }, asp: { value: 1.78 },
    pan: { value: new THREE.Vector2() }, sat: { value: 1 }, con: { value: 0 }, slat: { value: 0 }, slatAng: { value: .35 }, slatFreq: { value: 9 }, slatPhase: { value: 0 }, scan: { value: 0 },
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
    if (!m || !m.image || !shown(p)) continue;
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

// ================================================================ the grid
// The score is "Trip-Hop Instrumental 08" from 29.363 s with the silent bar (56.79–60.22) cut out:
// 70 BPM, a bar of hats-free intro, the groove from bar 1. Every cut sits on a beat.
const BEAT = 60 / 70, bt = n => n * BEAT;

// ================================================================ camera
// A shot is a cut. Inside it the camera runs a Catmull-Rom path through keys (in beats), eased at the
// two ends only, so it never stops between keys. roll is in radians.
const SHOTS = [];
function shot(keys, show, o = {}) {
  const K = keys.map(k => ({ t: bt(k.b), pos: V3(...k.pos), look: V3(...k.look), fov: k.fov ?? 32, roll: k.roll ?? 0 }));
  SHOTS.push({ t0: K[0].t, t1: o.end != null ? bt(o.end) : K[K.length - 1].t, K, show, ap: o.ap ?? 0, focus: o.focus, floor: o.floor ?? true, ease: o.ease ?? true });
}
function shotAt(t) { for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }
const cr = (p0, p1, p2, p3, s) => {
  const s2 = s * s, s3 = s2 * s;
  return p1.clone().multiplyScalar(2).add(p2.clone().sub(p0).multiplyScalar(s)).add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(s2))
    .add(p3.clone().sub(p0).add(p1.clone().multiplyScalar(3)).sub(p2.clone().multiplyScalar(3)).multiplyScalar(s3)).multiplyScalar(.5);
};
function camAt(s, t) {
  const K = s.K, n = K.length;
  if (n === 1) return { pos: K[0].pos, look: K[0].look, fov: K[0].fov, roll: K[0].roll };
  // Map time onto a global parameter, ease the whole run, then find the segment.
  const T0 = K[0].t, T1 = K[n - 1].t, g = clamp((t - T0) / (T1 - T0));
  const ge = s.ease ? E.io2(g) : g, tt = T0 + ge * (T1 - T0);
  let i = 0; while (i < n - 2 && tt >= K[i + 1].t) i++;
  const u = clamp((tt - K[i].t) / (K[i + 1].t - K[i].t));
  const P = j => K[clamp(j, 0, n - 1)];
  return {
    pos: cr(P(i - 1).pos, P(i).pos, P(i + 1).pos, P(i + 2).pos, u), look: cr(P(i - 1).look, P(i).look, P(i + 1).look, P(i + 2).look, u),
    fov: lerp(P(i).fov, P(i + 1).fov, u), roll: lerp(P(i).roll, P(i + 1).roll, u),
  };
}
E.io2 = cubicBezier(.45, 0, .55, 1);

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
// A print takes the room's light and shadows and keeps its own colour.
function print(t, w, h, name, fit = {}) {
  const m = t.clone(); m.needsUpdate = true;
  const c = cover(t.userData.asp, w / h, fit.ax ?? .5, fit.ay ?? .5); m.offset.set(c.x, c.y); m.repeat.set(c.z, c.w);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: m, roughness: .85 }));
  p.receiveShadow = true; p.castShadow = true;
  const g = new THREE.Group(); g.add(p);
  g.userData = { scr: p, u: { map: { value: t }, crop: { value: c }, zoom: { value: 1 } }, sw: w, sh: h, name };
  PANELS.push(g);
  return g;
}
// A polaroid: white card, the print inset, a thicker bottom margin.
function polaroid(t, w, name, fit) {
  const g = new THREE.Group(), h = w * 1.18, iw = w * .88;
  mesh(new THREE.BoxGeometry(w, h, .004), grey(0xe8e5dc, .9), g, [0, 0, 0]);
  const p = print(t, iw, iw, name, fit); p.position.set(0, (h - w) / 2 - .002 + (w - iw) / 2 - (h - w) / 2 + .012, .0025); g.add(p);
  return g;
}
function fadeAll(obj, o) {
  obj.traverse(m => {
    if (!m.material) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mt of mats) {
      if (mt.userData.o0 == null) mt.userData.o0 = mt.opacity ?? 1;
      if (mt.uniforms?.opacity) mt.uniforms.opacity.value = o; else mt.opacity = mt.userData.o0 * o;
      mt.transparent = o < .999 || mt.userData.o0 < .999 || !!mt.map?.userData?.alpha; mt.depthWrite = o > .5;
    }
  });
  obj.visible = o > .002;
}
// Pinned things land: from a little in front of the board, turned and slightly small, to rest.
// Entrances are ease-out and short; nothing starts from scale 0.
function land(obj, t0, o = {}) {
  const p0 = obj.position.clone(), r0 = obj.rotation.clone(), s0 = obj.scale.x, d = o.d ?? .38, lift = o.lift ?? .22, spin = o.spin ?? .12;
  upd.push(t => {
    const k = E.out(prog(t, t0, d));
    if (t < t0) { obj.visible = false; return; }
    obj.position.copy(p0); obj.position.z += (1 - k) * lift;
    obj.rotation.set(r0.x, r0.y, r0.z + (1 - k) * spin);
    obj.scale.setScalar(s0 * lerp(.9, 1, k));
    fadeAll(obj, clamp(k * 3));
  });
}
function stringTube(pts, t0, d, parent = scene) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => V3(...p)), false, "catmullrom", .3);
  const geo = new THREE.TubeGeometry(curve, 160, .0045, 6, false);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color("#b3121b").multiplyScalar(1.2) }));
  parent.add(m); const total = geo.index.count;
  upd.push(t => { const k = E.io(prog(t, t0, d)); m.visible = k > 0; geo.setDrawRange(0, Math.floor(total * k / 6) * 6); });
  return m;
}
function pinHead(parent, x, y, z = .012) { return mesh(new THREE.SphereGeometry(.012, 12, 8), new THREE.MeshStandardMaterial({ color: 0x8e1016, roughness: .35 }), parent, [x, y, z]); }

// ================================================================ the room
// 8 m wide, 7.5 m deep. Back wall: the window (intro, desk). Left wall: the evidence board (terra,
// the portrait). Right wall: the projector screen (video). Back-right: a stack of TVs (Aru Otoko).
// Front: a drying line of prints (Bóng Vespera). One street light through the blinds.
let GLOW, rain, floor;
const FLOORS = [];
const ROOM = { x0: -4, x1: 4, z0: -3, z1: 4.5, h: 3.2 };
function buildRoom() {
  const g = group("office");
  const wall = grey(0x6d6d6d, .92), trim = grey(0x1a1a1a, .7);
  const WX = 1.5, WY0 = 1.0, WY1 = 2.7, Z = -3;
  mesh(new THREE.BoxGeometry(8.4, .1 + WY0, .2), wall, g, [0, WY0 / 2, Z]);
  mesh(new THREE.BoxGeometry(8.4, ROOM.h - WY1, .2), wall, g, [0, WY1 + (ROOM.h - WY1) / 2, Z]);
  mesh(new THREE.BoxGeometry(4.2 - WX, WY1 - WY0, .2), wall, g, [-(WX + (4.2 - WX) / 2), (WY0 + WY1) / 2, Z]);
  mesh(new THREE.BoxGeometry(4.2 - WX, WY1 - WY0, .2), wall, g, [WX + (4.2 - WX) / 2, (WY0 + WY1) / 2, Z]);
  [-WX - .03, WX + .03].forEach(x => mesh(new THREE.BoxGeometry(.06, WY1 - WY0, .22), trim, g, [x, (WY0 + WY1) / 2, Z]));
  mesh(new THREE.BoxGeometry(2 * WX + .16, .08, .3), trim, g, [0, WY0, Z + .02]);
  mesh(new THREE.BoxGeometry(2 * WX + .16, .08, .3), trim, g, [0, WY1, Z + .02]);
  mesh(new THREE.BoxGeometry(.06, WY1 - WY0, .12), trim, g, [0, (WY0 + WY1) / 2, Z - .02]);
  const slatMat = grey(0x9a9a9a, .5, .1);
  for (let y = WY0 + .05; y < WY1 - .03; y += .075) mesh(new THREE.BoxGeometry(2 * WX, .045, .004), slatMat, g, [0, y, Z + .13], { rot: [-.9, 0, 0] });
  // Side and front walls, skirting.
  const side = grey(0x5e5e5e, .95);
  mesh(new THREE.BoxGeometry(.2, ROOM.h, ROOM.z1 - ROOM.z0), side, g, [ROOM.x0 - .1, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2]);
  mesh(new THREE.BoxGeometry(.2, ROOM.h, ROOM.z1 - ROOM.z0), side, g, [ROOM.x1 + .1, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2]);
  mesh(new THREE.BoxGeometry(8.4, ROOM.h, .2), side, g, [0, ROOM.h / 2, ROOM.z1 + .1]);
  const ceil = group("ceiling", g); mesh(new THREE.BoxGeometry(8.4, .1, 7.9), grey(0x3a3a3a, .95), ceil, [0, ROOM.h + .05, (ROOM.z0 + ROOM.z1) / 2]);
  // Outside: night sky, one street lamp glow, rain.
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
  sky.position.set(0, 2, -9); g.add(sky);
  const lampGlow = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: GLOW, color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lampGlow.position.set(1.8, 3.2, -8.9); g.add(lampGlow);
  const street = new THREE.SpotLight(0xffffff, 700, 0, .46, .25, 2);
  street.position.set(1.4, 3.6, -7.5); street.target.position.set(-.2, 0, .2);
  street.castShadow = true; street.shadow.mapSize.set(4096, 4096); street.shadow.bias = -.0004; street.shadow.radius = 2;
  const streetG = new THREE.Group(); streetG.add(street, street.target); g.add(streetG); world.street = streetG;
  const r = rng(11), N = 900;
  rain = new THREE.InstancedMesh(new THREE.PlaneGeometry(.006, .32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.6), transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending }), N);
  rain.userData.seeds = Array.from({ length: N }, () => ({ x: (r() - .5) * 9, y: r() * 6, z: -3.4 - r() * 5, v: 7 + r() * 3 }));
  g.add(rain); noDepth.push(rain);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, .12)), sc = V3(1, 1, 1), ps = V3(0, 0, 0);
  upd.push(t => {
    rain.userData.seeds.forEach((s, i) => { const y = ((s.y - s.v * t) % 6 + 6) % 6; ps.set(s.x - y * .12, y - .5, s.z); m4.compose(ps, q, sc); rain.setMatrixAt(i, m4); });
    rain.instanceMatrix.needsUpdate = true;
  });
  const shaftC = canvasTex(64, 512); { const c = shaftC.ctx; const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    for (let y = 0; y < 512; y += 22) { c.fillStyle = gr; c.fillRect(0, y, 64, 12); } c.globalCompositeOperation = "destination-in"; const fx = c.createLinearGradient(0, 0, 64, 0); fx.addColorStop(0, "rgba(0,0,0,0)"); fx.addColorStop(.3, "#000"); fx.addColorStop(.7, "#000"); fx.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = fx; c.fillRect(0, 0, 64, 512); shaftC.tex.needsUpdate = true; }
  const shafts = group("shafts", g);
  for (let i = 0; i < 3; i++) {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6 + i * .5, 4.4), new THREE.MeshBasicMaterial({ map: shaftC.tex, transparent: true, opacity: .05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    sh.position.set(-.1 + i * .08, 1.2, -1.1 + i * .12); sh.rotation.set(-1.0, 0, .08); shafts.add(sh); noDepth.push(sh);
  }
  // The desk.
  const wood = grey(0x2b2b2b, .92, 0);
  mesh(new THREE.BoxGeometry(2.0, .06, .95), wood, g, [0, .76, -1.6]);
  [[-.92, -2.0], [.92, -2.0], [-.92, -1.2], [.92, -1.2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.06, .73, .06), wood, g, [x, .365, z]));
  mesh(new THREE.BoxGeometry(.5, .5, .8), wood, g, [-.7, .5, -1.6]);
  const dark = grey(0x151515, .7);
  mesh(new THREE.BoxGeometry(.56, .7, .08), dark, g, [.1, 1.05, -2.25], { rot: [.08, 0, 0] });
  const lamp = group("lamp", g);
  mesh(new THREE.CylinderGeometry(.08, .1, .02, 24), dark, lamp, [-.72, .8, -1.85]);
  mesh(new THREE.CylinderGeometry(.012, .012, .36, 12), dark, lamp, [-.72, .98, -1.85]);
  const shade = mesh(new THREE.CylinderGeometry(.06, .16, .14, 32, 1, true), grey(0x303030, .5, .3), lamp, [-.72, 1.16, -1.8], { rot: [.35, 0, 0] });
  shade.material.side = THREE.DoubleSide;
  const bulb = new THREE.PointLight(0xffffff, .6, 2, 2); bulb.position.set(-.72, 1.1, -1.72); lamp.add(bulb);
  const papers = group("papers", g), paperGrey = grey(0x8c8c8c, .95);
  mesh(new THREE.BoxGeometry(.42, .004, .3), paperGrey, papers, [.05, .792, -1.4], { rot: [0, .15, 0] });
  mesh(new THREE.BoxGeometry(.42, .004, .3), paperGrey, papers, [.12, .796, -1.45], { rot: [0, -.1, 0] });
  // A low fill so the far corners read as a room, not a void.
  const fill = new THREE.HemisphereLight(0xffffff, 0x222222, .18); g.add(fill);
  upd.push(t => { fill.intensity = .18 + .9 * (1 - sstep2(bt(45.2), bt(46.3), t)) * (t >= bt(44) ? 1 : 0); });
  return g;
}
function buildFloor() {
  const shader = {
    uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, bg: { value: new THREE.Color(0x050505) }, refl: { value: .35 } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; void main(){ vUv = textureMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bg; uniform float refl; varying vec4 vUv;
      void main(){ vec2 p = vUv.xy / vUv.w; vec3 r = vec3(0.0);
        for (int i = 0; i < 5; i++) { float a = float(i) * 2.39996; r += texture2D(tDiffuse, p + vec2(cos(a), sin(a)) * .003 * float(i)).rgb; }
        gl_FragColor = vec4(bg + r / 5.0 * refl, 1.0); }`,
  };
  floor = new Reflector(new THREE.PlaneGeometry(8.2, 7.8), { textureWidth: 960, textureHeight: 540, clipBias: .003, shader });
  floor.rotation.x = -Math.PI / 2; floor.position.z = .75; scene.add(floor); FLOORS.push(floor);
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 7.8), new THREE.ShadowMaterial({ opacity: .85 }));
  matte.rotation.x = -Math.PI / 2; matte.position.set(0, .001, .75); matte.receiveShadow = true; scene.add(matte); FLOORS.push(matte);
  const lit = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 7.8), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: .9, transparent: true, opacity: .55 }));
  lit.rotation.x = -Math.PI / 2; lit.position.set(0, .0005, .75); lit.receiveShadow = true; scene.add(lit); FLOORS.push(lit);
}

// ---------------------------------------------------------------- the evidence board (left wall)
// Board-local x runs to screen-right when you face the wall (world -z), y up from 1.55 m.
const BOARD = { x: -3.93, y: 1.55, z: -.5 };
const bw = (lx, ly, lz = 0) => [BOARD.x + lz, BOARD.y + ly, BOARD.z - lx];
let board;
function buildBoard() {
  board = new THREE.Group(); board.position.set(BOARD.x, BOARD.y, BOARD.z); board.rotation.y = Math.PI / 2; world.office.add(board);
  const C = canvasTex(2048, 1024), c = C.ctx, r = rng(5);
  c.fillStyle = "#6a6660"; c.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 90000; i++) { const v = 70 + r() * 80 | 0; c.fillStyle = `rgba(${v},${v - 3},${v - 8},.55)`; c.fillRect(r() * 2048, r() * 1024, 1 + r() * 3, 1 + r() * 3); }
  C.tex.needsUpdate = true;
  const cork = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.9, .03), [grey(0x222222), grey(0x222222), grey(0x222222), grey(0x222222), new THREE.MeshStandardMaterial({ map: C.tex, roughness: .95 }), grey(0x222222)]);
  cork.receiveShadow = true; board.add(cork);
  const frame = grey(0x1b1b1b, .6);
  [[0, .98, 3.9, .07], [0, -.98, 3.9, .07], [-1.93, 0, .07, 2.02], [1.93, 0, .07, 2.02]].forEach(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, .06), frame, board, [x, y, .01]));
  // The board's own light: the blinds thrown across it from the window side.
  const slats = canvasTex(64, 512); { const s = slats.ctx; s.fillStyle = "#262626"; s.fillRect(0, 0, 64, 512); s.fillStyle = "#fff"; for (let y = 0; y < 512; y += 46) s.fillRect(0, y, 64, 28); slats.tex.needsUpdate = true; }
  const key = new THREE.SpotLight(0xffffff, 55, 0, .62, .45, 2); key.position.set(-.6, 3.0, -2.6); key.target = board;
  key.map = slats.tex; key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0005;
  const kg = group("boardLight", world.office); kg.add(key);
  return board;
}

// ---------------------------------------------------------------- 1 · terra on the board (beats 4 – 12)
function terraLogo() {
  const root = new THREE.Group(), s = new THREE.Group(); s.scale.set(-1, 1, 1); root.add(s);
  const M = c => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: .35, metalness: .05, emissive: new THREE.Color(c), emissiveIntensity: .35 });
  const green = M("#14796C"), r = .17;
  const baseY = -.55, fr = 5.0, fcy = baseY - fr + .25, hill = x => fcy + Math.sqrt(fr * fr - x * x), lift = .58, gap = .52;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(fr, .13, 16, 120, Math.PI * .2), green); arc.rotation.z = Math.PI * .4; arc.position.y = fcy; s.add(arc);
  [Math.PI * .4, Math.PI * .6].forEach(a => { const m = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), green); m.position.set(fr * Math.cos(a), fcy + fr * Math.sin(a), 0); s.add(m); });
  [[-1.4, 1.1, "#A5E03D"], [-.7, 2.3], [0, 1.85], [.7, 1.5, "#2FA8F5"], [1.4, 1.1, null, "#FF8B3D"]].forEach(([x, h, top, bot]) => {
    const b0 = bot ? hill(x) + lift + gap : hill(x) + lift;
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 8, 24), green); cap.position.set(x, b0 + h / 2, 0); s.add(cap);
    if (top) { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M(top)); d.position.set(x, b0 + h + gap, 0); s.add(d); }
    if (bot) { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M(bot)); d.position.set(x, hill(x) + lift, 0); s.add(d); }
  });
  root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return root;
}
const CHART = "M0,162.2 L37.5,155.7 L75,148.4 L112.5,136.3 L150,131.7 L187.5,140.4 L225,144.5 L262.5,135.5 L300,63.5 L337.5,35 L375,108.7 L412.5,104.5 L450,57.5 L487.5,32.3 L525,100.1 L562.5,12 L600,128.2"
  .match(/[\d.]+,[\d.]+/g).map(p => p.split(",").map(Number));
function clippingTex() {
  const C = canvasTex(1200, 980), c = C.ctx;
  c.fillStyle = "#e6e1d4"; c.fillRect(0, 0, 1200, 980);
  c.fillStyle = "#111"; c.textAlign = "center";
  c.font = `700 40px ${F.mono}`; c.fillText("THE EVENING CASE  ·  TERRA", 600, 72); c.fillRect(50, 96, 1100, 5);
  c.font = `900 330px ${F.serif}`; c.fillText("12×", 600, 420);
  c.font = `900 112px ${F.serif}`; c.fillText("ORGANIC GROWTH", 600, 560);
  c.fillRect(50, 600, 1100, 3);
  c.font = `700 44px ${F.mono}`; c.fillText("GROWTH, CONTENT & DESIGN", 600, 672);
  c.fillStyle = "#b9b4a8"; for (let l = 0; l < 6; l++) c.fillRect(60 + (l % 2) * 560, 730 + Math.floor(l / 2) * 64, 520 - (l === 5 ? 160 : 0), 16);
  C.tex.needsUpdate = true; return C.tex;
}
function noteTex(big, small) {
  const C = canvasTex(600, 600), c = C.ctx;
  c.fillStyle = "#d8d3c2"; c.fillRect(0, 0, 600, 600); c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(0, 0, 600, 70);
  c.fillStyle = "#111"; c.textAlign = "center"; c.font = `900 150px ${F.serif}`; c.fillText(big, 300, 330);
  c.font = `700 50px ${F.mono}`; c.fillText(small, 300, 450);
  C.tex.needsUpdate = true; return C;
}
function buildTerra() {
  const g = group("terra", world.office);
  const SOC = ["02-law-update-econtract-vi", "03-culture-appreciation-party", "04-seasonal-womens-day", "05-service-explainer-si-expat", "06-culture-team-photo", "07-event-recap-terra-say-hi"];
  STATIC.push(P("images/terra-outsourcing-preview.webp"), P("images/terra-customers-preview.webp"), P("images/terra1.webp"), ...SOC.map(s => P(`images/terra-social/${s}.webp`)));
  return () => {
    const B = new THREE.Group(); board.add(B); world.terraItems = B;
    const at = (o, x, y, z, rz = 0) => { o.position.set(x, y, z); o.rotation.z = rz; B.add(o); return o; };
    // Beat by beat, the case builds up on the board and each piece lands on the last.
    const logo = terraLogo(); logo.scale.setScalar(.11); at(logo, -1.45, .45, .09);
    const logoCard = at(new THREE.Mesh(new THREE.BoxGeometry(.62, .5, .004), grey(0xe8e5dc, .9)), -1.45, .47, .018, .02); logoCard.receiveShadow = true;
    land(logoCard, bt(4)); land(logo, bt(4) + .08, { lift: .35, spin: .3 });
    upd.push(t => { logo.rotation.y = lerp(-1.4, 0, E.out(prog(t, bt(4) + .08, 1.1))) + Math.sin(t * 1.3) * .12; });
    const lp1 = at(print(tex(P("images/terra-outsourcing-preview.webp")), .44, .6, "terra-lp1", { ay: 1 }), -.8, .3, .02, -.05); land(lp1, bt(4.5));
    const lp2 = at(print(tex(P("images/terra-customers-preview.webp")), .44, .6, "terra-lp2", { ay: 1 }), -.45, .18, .028, .06); land(lp2, bt(5));
    const ph = at(polaroid(tex(P("images/terra1.webp")), .42, "terra-photo"), -1.35, -.42, .03, .05); land(ph, bt(5.5));
    SOC.forEach((s, i) => { const p = at(print(tex(P(`images/terra-social/${s}.webp`)), .27, .27 * .5625 * (i === 2 ? 1.3 : 1), "terra-soc" + i), .12 + (i % 3) * .3, .5 - Math.floor(i / 3) * .26, .02 + i * .002, (i % 2 ? .04 : -.035)); land(p, bt(6) + i * .07); });
    // Red marker: the growth line drawn straight onto the board.
    const MK = canvasTex(1100, 520), mk = MK.ctx; MK.tex.userData.alpha = true;
    const marker = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .52), new THREE.MeshBasicMaterial({ map: MK.tex, transparent: true, depthWrite: false }));
    at(marker, -.75, -.52, .045);
    upd.push(t => {
      if (!g.visible) return;
      const k = E.io(prog(t, bt(7), 1.1)); mk.clearRect(0, 0, 1100, 520);
      if (k <= 0) { MK.tex.needsUpdate = true; return; }
      const pts = CHART.map(([x, y]) => [40 + x * 1.7, 40 + y * 2.5]), upto = k * (pts.length - 1), m = Math.floor(upto), f = upto - m;
      mk.beginPath(); mk.moveTo(...pts[0]); for (let i = 1; i <= m; i++) mk.lineTo(...pts[i]);
      if (m < pts.length - 1) mk.lineTo(lerp(pts[m][0], pts[m + 1][0], f), lerp(pts[m][1], pts[m + 1][1], f));
      mk.strokeStyle = "#c8161f"; mk.lineWidth = 12; mk.lineJoin = mk.lineCap = "round"; mk.stroke();
      if (k > .98) { mk.beginPath(); mk.ellipse(40 + 562.5 * 1.7, 40 + 12 * 2.5, 70, 44, -.2, 0, 7); mk.lineWidth = 8; mk.stroke(); }
      MK.tex.needsUpdate = true;
    });
    // The front page lands on top of everything: the hero of the case.
    const clip = at(new THREE.Group(), -.45, -.08, .06, -.03);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(.62, .506), new THREE.MeshStandardMaterial({ map: clippingTex(), roughness: .9 })); cm.castShadow = cm.receiveShadow = true; clip.add(cm);
    clip.userData = { scr: cm, u: { map: { value: { image: { width: 1200, height: 980 } } }, crop: { value: new THREE.Vector4(0, 0, 1, 1) }, zoom: { value: 1 } }, sw: .62, sh: .506, name: "terra-clipping" }; PANELS.push(clip);
    pinHead(clip, 0, .23, .006); land(clip, bt(8), { lift: .5, spin: -.25, d: .32 });
    // Three stats as notes, counting up as they land.
    [["31.4M", "IMPRESSIONS", 31.4, 1], ["978", "TOP-10 KEYWORDS", 978, 0], ["55 → 90", "SITE HEALTH", 90, 0]].forEach(([big, small, v, dec], i) => {
      const N = noteTex(big, small), n = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshStandardMaterial({ map: N.tex, roughness: .9 }));
      n.castShadow = n.receiveShadow = true; const ng = at(new THREE.Group(), .06 + (i % 2) * .02, .06 - i * .2, .07 + i * .004, (i - 1) * .07); ng.add(n); pinHead(ng, 0, .085, .004);
      const t0 = bt(9) + i * bt(1 / 3); land(ng, t0, { lift: .3 });
      upd.push(t => {
        if (t < t0 || t > t0 + 1) return;
        const kk = E.out(prog(t, t0, .8)), s = i === 0 ? `${(v * kk).toFixed(1)}M` : i === 1 ? `${Math.round(v * kk)}` : `55 → ${Math.round(lerp(55, 90, kk))}`;
        const c = N.ctx; c.fillStyle = "#d8d3c2"; c.fillRect(0, 70, 600, 300); c.fillStyle = "#111"; c.font = `900 150px ${F.serif}`; c.textAlign = "center"; c.fillText(s, 300, 330); N.tex.needsUpdate = true;
      });
    });
  };
}

// ---------------------------------------------------------------- 2 · Nhà Mình on the desk (beats 12 – 20)
function buildNha() {
  const g = group("nha", world.office), gp = group("nhaPhone", world.office);
  STATIC.push(P("images/nha-minh/09-app-bame-chau-bi.png"), P("images/nha-minh/02-app-con-tong-quan.png"), P("images/nha-minh/04-app-con-chi-so.png"), P("images/nha-minh/07-app-bame-hom-nay.png"));
  return () => {
    const alu = new THREE.MeshStandardMaterial({ color: 0x8e8e90, metalness: .85, roughness: .3 });
    mesh(rbox(1.0, .022, .68, .01), alu, g, [.15, .8, -1.45]);
    const hinge = new THREE.Group(); hinge.position.set(.15, .81, -1.79); hinge.rotation.x = -.22; g.add(hinge);
    const lid = panel({ w: 1.0, h: .64, d: .014, r: .01, inset: .022, frame: 0x151515, metal: .6, name: "nha-laptop" });
    lid.position.y = .32; hinge.add(lid);
    const phone = panel({ w: .2, h: .42, d: .018, r: .025, inset: .009, frame: 0x111111, metal: .7, rough: .25, map: tex(P("images/nha-minh/09-app-bame-chau-bi.png")), fit: { ay: 1 }, name: "nha-phone" });
    phone.position.set(.66, .81, -1.22); phone.rotation.set(-Math.PI / 2, 0, -.25); gp.add(phone);
    const spill = new THREE.PointLight(0xff8a5c, 0, 2.2, 2); spill.position.set(.15, 1.05, -1.2); g.add(spill);
    // Polaroids of the other screens fall onto the desk around it.
    const pol = [["02-app-con-tong-quan", -.55, -1.28, .35, 12.5], ["04-app-con-chi-so", -.3, -1.12, -.2, 13], ["07-app-bame-hom-nay", .95, -1.02, .25, 13.5]].map(([n, x, z, rz, b]) => {
      const p = polaroid(tex(P(`images/nha-minh/${n}.png`)), .24, "nha-pol-" + n, { ay: 1 });
      const hold = new THREE.Group(); hold.position.set(x, .8, z); hold.rotation.set(-Math.PI / 2, 0, rz); gp.add(hold); hold.add(p);
      land(p, bt(b), { lift: .25, spin: .4 }); return p;
    });
    upd.push(t => {
      const k = E.io(prog(t, bt(12) + .2, .8));
      lid.userData.u.sat.value = k; phone.userData.u.sat.value = k; spill.intensity = 1.4 * k;
      if (g.visible) video(lid, seqUrl("cache/v3/nha-sync/", 105, 30, (t - bt(12)) * 1.0, true));
    });
  };
}

// ---------------------------------------------------------------- 3 · Video & brand at the projector (beats 20 – 24)
// Nine filmed works projected as a grid on the right wall, and a strip of film running through the
// foreground with the same works in its frames.
const GRID = ["g-mb-drink", "g-aris-sil", "g-yl-night", "g-isbe", "g-mb-cheers", "g-loa", "g-aris-close", "g-hn", "g-mdh"];
const GRID_N = { "g-loa": 71 };
const SCREEN = { x: 3.93, y: 1.62, z: .55 };
function buildVideo() {
  const g = group("video", world.office);
  return () => {
    const scr = new THREE.Group(); scr.position.set(SCREEN.x, SCREEN.y, SCREEN.z); scr.rotation.y = -Math.PI / 2; g.add(scr);
    mesh(new THREE.PlaneGeometry(2.72, 1.62), grey(0xd9d9d9, .95), scr, [0, 0, -.004], { cast: false });
    const tiles = GRID.map((id, i) => {
      const p = panel({ w: .84, h: .4725, d: .002, r: .0005, inset: 0, frame: 0x000000, name: "vb-" + id });
      p.position.set((i % 3 - 1) * .87, (1 - Math.floor(i / 3)) * .5, 0); p.userData.u.gain.value = .9; scr.add(p);
      const t0 = bt(20) + .12 + i * .06;
      upd.push(t => {
        const k = E.out(prog(t, t0, .3)); p.visible = t >= t0; p.userData.u.opacity.value = k; p.userData.mat.transparent = k < 1; p.scale.setScalar(lerp(.94, 1, k));
        if (g.visible && p.visible) video(p, seqUrl(`cache/v3/${id}/`, GRID_N[id] || 72, 30, t - t0 + i * .2, true));
      });
      return p;
    });
    // The projector, its reels turning, and the beam.
    const proj = new THREE.Group(); proj.position.set(1.35, .92, 1.05); g.add(proj);
    const pm = grey(0x1d1d1d, .5, .5);
    mesh(new THREE.BoxGeometry(.46, .26, .3), pm, proj, [0, 0, 0]);
    mesh(new THREE.CylinderGeometry(.055, .065, .16, 24), pm, proj, [.3, .02, 0], { rot: [0, 0, Math.PI / 2] });
    mesh(new THREE.BoxGeometry(.5, .04, .4), grey(0x2a2a2a, .8), proj, [0, -.35, 0]);
    mesh(new THREE.CylinderGeometry(.02, .02, .55, 8), grey(0x2a2a2a, .8), proj, [0, -.62, 0]);
    const reelM = grey(0x3a3a3a, .4, .7), reels = [[-.12, .3], [.14, .3]].map(([x, y]) => { const r = mesh(new THREE.CylinderGeometry(.14, .14, .025, 6, 1), reelM, proj, [x, y, 0], { rot: [Math.PI / 2, 0, 0] }); return r; });
    upd.push(t => reels.forEach((r, i) => { r.rotation.y = t * (i ? 3.2 : 2.6); }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.06, 1.25, 2.55, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, map: GLOW, transparent: true, opacity: .07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    beam.position.set(1.35 + .38 + 1.27, .95 + .35, 1.05 - .25); beam.lookAt(SCREEN.x, SCREEN.y, SCREEN.z); beam.rotateX(Math.PI / 2); g.add(beam); noDepth.push(beam);
    const pl = new THREE.PointLight(0xffffff, 2.5, 5, 2); pl.position.set(3.2, 1.6, .6); g.add(pl);
    // The film strip: black base with sprocket holes, a frame of footage every 0.27 m, scrolling.
    const SB = canvasTex(64, 512), sb = SB.ctx; sb.fillStyle = "#0b0b0b"; sb.fillRect(0, 0, 64, 512); sb.fillStyle = "#d8d8d8";
    for (let y = 8; y < 512; y += 32) { sb.fillRect(6, y, 10, 16); sb.fillRect(48, y, 10, 16); } SB.tex.wrapT = THREE.RepeatWrapping; SB.tex.needsUpdate = true;
    const strip = new THREE.Group(); strip.position.set(2.95, 1.18, 1.25); strip.rotation.set(0, -.93, -.08); g.add(strip);
    const L = 3.8, base = new THREE.Mesh(new THREE.PlaneGeometry(.3, L), new THREE.MeshStandardMaterial({ map: SB.tex, roughness: .5, metalness: .3 }));
    base.rotation.z = Math.PI / 2; SB.tex.repeat.set(1, L / .3 * .5); strip.add(base);
    const frames = Array.from({ length: 14 }, (_, i) => { const p = panel({ w: .24, h: .135, d: .001, r: .0003, inset: 0, frame: 0x000000, name: "vb-strip" }); p.position.z = .002; strip.add(p); return p; });
    upd.push(t => {
      if (!g.visible) return;
      const off = (t - bt(20)) * .32;
      SB.tex.offset.y = -off / .3 * .5;
      frames.forEach((p, i) => {
        let x = ((i * .27 - off) % L + L) % L - L / 2; p.position.x = x;
        const edge = 1 - sstep2(L / 2 - .3, L / 2, Math.abs(x)); p.userData.u.opacity.value = edge; p.userData.mat.transparent = true;
        const id = GRID[(i * 4) % GRID.length]; video(p, seqUrl(`cache/v3/${id}/`, GRID_N[id] || 72, 30, t + i * .3, true));
      });
    });
  };
}
const sstep2 = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ---------------------------------------------------------------- 4 · Aru Otoko on a stack of TVs (beats 24 – 32)
const TVS = [[2.9, .86, 1, "aru-mv"], [2.14, .72, 0, "aru-g0"], [3.66, .72, 0, "aru-g1"], [2.14, 1.17, 0, "aru-g2"], [3.66, 1.17, 0, "aru-g3"], [2.58, 1.51, 0, "aru-g4"], [3.22, 1.51, 0, "aru-g5"]];
function buildAru() {
  const g = group("aru", world.office);
  return () => {
    const Z = -2.62;
    mesh(new THREE.BoxGeometry(2.1, .5, .55), grey(0x222222, .7), g, [2.9, .25, Z]);
    TVS.forEach(([x, y, big, id], i) => {
      const bw_ = big ? .92 : .56, bh = big ? .72 : .44, sw = big ? .74 : .44, sh = sw * .75;
      const tv = new THREE.Group(); tv.position.set(x, y, Z); g.add(tv);
      mesh(rbox(bw_, bh, big ? .55 : .4, .03), grey(i % 2 ? 0x2c2c2c : 0x383634, .55, .15), tv, [0, 0, 0]);
      const p = panel({ w: sw, h: sh, d: .004, r: .02, inset: .008, frame: 0x050505, name: "aru-" + id });
      p.position.set(big ? -.05 : -.03, 0, (big ? .55 : .4) / 2 + .004); p.userData.u.scan.value = .08; tv.add(p);
      if (big) { [[.36, .14], [.36, .02]].forEach(([kx, ky]) => mesh(new THREE.CylinderGeometry(.025, .025, .02, 16), grey(0x111111, .4, .5), tv, [kx, ky, .285], { rot: [Math.PI / 2, 0, 0] })); }
      const t0 = bt(24) + .1 + i * .07, n = big ? 222 : 72;
      upd.push(t => {
        const on = E.out(prog(t, t0, .25)); p.userData.u.gain.value = .9 * on; p.userData.u.zoom.value = lerp(1.0, 1, on); p.scale.y = lerp(.06, 1, on);
        if (g.visible) video(p, seqUrl(`cache/v3/${id}/`, n, 30, big ? (t - bt(24)) : t + i * .4, !big));
      });
    });
    const glow = new THREE.PointLight(0xffe2c0, 3, 4, 2); glow.position.set(2.9, 1.0, -1.6); g.add(glow);
  };
}

// ---------------------------------------------------------------- 5 · Bóng Vespera on the drying line (beats 32 – 40)
const KF = ["kf1-the-gate-at-dawn", "kf2-the-wanderer-enters", "kf3-path-of-guardians", "kf4-the-kneeling-moment", "kf5-after-the-recognition"];
function buildBong() {
  const g = group("bong", world.office);
  STATIC.push(...KF.map(k => P(`images/vng-demo/stills/${k}.webp`)));
  return () => {
    const Z = 3.3, Y = 2.1, X0 = -3.2, X1 = .4;
    const sag = x => Y - .09 * Math.sin(Math.PI * (x - X0) / (X1 - X0));
    const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => { const x = lerp(X0, X1, i / 11); return V3(x, sag(x), Z); })), 60, .003, 5), grey(0xbbbbbb, .5));
    g.add(line);
    const XS = [-2.9, -2.2, -1.5, -.8, -.1];
    const prints = KF.map((k, i) => {
      const hang = new THREE.Group(); hang.position.set(XS[i], sag(XS[i]) - .005, Z); hang.rotation.y = Math.PI; g.add(hang);
      const pr = i === 2 || i === 3 ? panel({ w: .42, h: .63, d: .003, r: .001, inset: .012, frame: 0xe8e4da, rough: .9, metal: 0, map: tex(P(`images/vng-demo/stills/${k}.webp`)), name: "bong-" + i })
        : print(tex(P(`images/vng-demo/stills/${k}.webp`)), .42, .63, "bong-" + i);
      pr.position.y = -.33; hang.add(pr);
      mesh(new THREE.BoxGeometry(.018, .06, .02), grey(0xcfc4a8, .8), hang, [-.1, -.01, 0]); mesh(new THREE.BoxGeometry(.018, .06, .02), grey(0xcfc4a8, .8), hang, [.1, -.01, 0]);
      const t0 = bt(32) + i * bt(.5);
      upd.push(t => {
        const k = E.out(prog(t, t0, .45));
        hang.visible = t >= t0; hang.rotation.x = (1 - k) * -.6 + Math.sin(t * 1.4 + i) * .025; hang.rotation.z = Math.sin(t * .9 + i * 2) * .02;
        fadeAll(pr, clamp(k * 3));
      });
      return pr;
    });
    // At beat 36 two of the prints come alive: the story's own motion.
    upd.push(t => {
      if (!g.visible || t < bt(36)) return;
      video(prints[2], seqUrl("cache/v3/bong-mf/", 362, 30, (t - bt(36)) * 1.25, false));
      video(prints[3], seqUrl("cache/v2/bong-motion/", 152, 30, .6 + (t - bt(36)), false));
    });
    const key = new THREE.SpotLight(0xffffff, 30, 0, .7, .6, 2); key.position.set(-1.4, 3.0, 1.2); key.target.position.set(-1.4, 1.6, Z); g.add(key, key.target);
  };
}

// ---------------------------------------------------------------- 6 · the other files (beats 40 – 44)
const REST = [["Vitalité", "images/vitalite/home-hero.webp"], ["PATI", "images/pati-challenge/case02-research-pipeline.webp"], ["IELTS Studio", "images/ielts-preview.webp"], ["UpHub", "images/uphub.webp"], ["Badminton Club", "images/badminton-preview.webp"]];
function buildRest() {
  const g = group("rest", world.office);
  STATIC.push(...REST.map(([, s]) => P(s)));
  return () => {
    const spots = [[-.62, -1.8, .05], [0, -1.83, -.04], [.62, -1.79, .03], [-.31, -1.36, -.03], [.33, -1.37, .05]];
    REST.forEach(([name, src], i) => {
      const [x, z, rz] = spots[i], hold = new THREE.Group(); hold.position.set(x, .795 + i * .003, z); hold.rotation.set(-Math.PI / 2, 0, rz); g.add(hold);
      const f = new THREE.Group(); hold.add(f);
      const L = canvasTex(1024, 720), c = L.ctx;
      c.font = `700 70px ${F.mono}`; const tw = c.measureText(name.toUpperCase()).width;
      c.fillStyle = "#cfc8b6"; c.fillRect(0, 96, 1024, 624); rr(c, 40, 0, tw + 72, 120, 18); c.fill();
      c.fillStyle = "#1a1a1a"; c.fillText(name.toUpperCase(), 76, 82); L.tex.needsUpdate = true;
      const folder = new THREE.Mesh(new THREE.PlaneGeometry(.52, .366), new THREE.MeshStandardMaterial({ map: L.tex, transparent: true, roughness: .9 }));
      folder.receiveShadow = true; f.add(folder);
      const p = print(tex(P(src)), .44, .275, "rest-" + name); p.position.set(0, -.03, .001); f.add(p);
      land(f, bt(40) + i * bt(.5), { lift: .35, spin: .5 });
    });
    const slats = canvasTex(64, 512); { const c = slats.ctx; c.fillStyle = "#1a1a1a"; c.fillRect(0, 0, 64, 512); c.fillStyle = "#fff"; for (let y = 0; y < 512; y += 48) c.fillRect(0, y, 64, 30); slats.tex.needsUpdate = true; }
    const key = new THREE.SpotLight(0xffffff, 24, 0, .55, .5, 2); key.position.set(1.2, 3.4, -.4); key.target.position.set(0, .78, -1.6);
    key.map = slats.tex; key.castShadow = true; key.shadow.mapSize.set(2048, 2048); g.add(key, key.target);
  };
}

// ---------------------------------------------------------------- 7 · the portrait: every string ends here (beats 44 – end)
const PORTRAIT = [1.3, .08];
function buildSign() {
  STATIC.push(P("images/hero-portrait.webp"));
  return () => {
    const g = new THREE.Group(); board.add(g); world.portrait = g;
    const portrait = panel({ w: .56, h: .7, d: .004, r: .001, inset: .018, frame: 0xe8e5dc, rough: .9, metal: 0, map: tex(P("images/hero-portrait.webp")), name: "portrait" });
    portrait.position.set(PORTRAIT[0], PORTRAIT[1], .03); portrait.rotation.z = .02; g.add(portrait); pinHead(g, PORTRAIT[0], PORTRAIT[1] + .32, .04);
    const u = portrait.userData.u; u.sat.value = 0; u.con.value = .5; u.slat.value = .6; u.slatAng.value = -.42; u.slatFreq.value = 6.5;
    upd.push(t => { u.slatPhase.value = t * .05; });
    // Red string from each case to the portrait, each drawn when its case opens.
    const P0 = bw(PORTRAIT[0], PORTRAIT[1] + .32, .05);
    stringTube([bw(-.45, .15, .08), bw(.4, .35, .12), bw(1.0, .4, .08), P0], bt(10.2), 1.2);
    stringTube([P0, [-2.6, 2.3, -2.2], [-.6, 2.0, -2.2], [.15, 1.45, -1.95]], bt(11.5), 1.4);
    stringTube([P0, [-1.5, 2.6, -2.7], [1.2, 2.5, -2.8], [2.9, 1.3, -2.33]], bt(24), 1.2);
    stringTube([P0, [-1.0, 2.9, -1.0], [2.5, 2.8, .4], [3.9, 2.25, .55]], bt(20), 1.0);
    stringTube([P0, [-3.6, 2.6, 1.4], [-2.4, 2.3, 3.0], [-1.5, 2.08, 3.3]], bt(32), 1.2);
  };
}

// ---------------------------------------------------------------- shots
function cams() {
  const IN = ["office", "papers", "lamp", "street", "shafts", "ceiling", "boardLight"];
  // 0 · intro, then the one whip-pan in the reel onto the board, landing on the groove.
  shot([{ b: 0, pos: [.35, 1.3, 4.4], look: [0, 1.35, -3] }, { b: 3.65, pos: [.2, 1.25, 3.6], look: [0, 1.4, -3] }], IN, { focus: [0, 1.1, -1.6], ap: .0012, end: 3.65 });
  shot([{ b: 3.65, pos: [.2, 1.3, 3.5], look: [0, 1.4, -3] }, { b: 4, pos: [.05, 1.35, 3.2], look: bw(-.9, .05) }], [...IN, "terra", "terraItems", "portrait"], { ease: false });
  // 1 · terra: dolly toward the board as the case builds, push in on the front page, then follow the
  // new red string to the desk.
  shot([
    { b: 4, pos: [.05, 1.35, 3.2], look: bw(-.9, .05) },
    { b: 6, pos: bw(-1.05, .05, 2.2), look: bw(-.85, .05) },
    { b: 8, pos: bw(-.55, -.02, 1.75), look: bw(-.4, -.06) },
    { b: 10, pos: bw(-.32, -.08, 1.2), look: bw(-.3, -.1), roll: .03 },
    { b: 12, pos: [-1.35, 1.3, -.15], look: [.15, 1.05, -1.75] },
  ], [...IN, "terra", "terraItems", "portrait", "nha", "nhaPhone"], { ap: .0009, focus: bw(-.4, -.05) });
  // 2 · Nhà Mình: orbit the desk, then top-down on the phone and the polaroids.
  shot([
    { b: 12, pos: [-1.35, 1.3, -.15], look: [.15, 1.05, -1.75] },
    { b: 14, pos: [-.4, 1.22, -.2], look: [.15, 1.06, -1.75] },
    { b: 16, pos: [.85, 1.24, -.35], look: [.2, 1.02, -1.7] },
  ], [...IN, "nha", "nhaPhone", "terraItems", "portrait"], { ap: .0012, focus: [.15, 1.1, -1.75], ease: false });
  shot([{ b: 16, pos: [.62, 1.7, -1.02], look: [.62, .81, -1.22], roll: -.1 }, { b: 20, pos: [.6, 1.52, -1.08], look: [.6, .81, -1.22], roll: .08 }], [...IN, "nhaPhone"], { ap: .0012, focus: [.62, .81, -1.22] });
  // 3 · Video & brand: truck past the projector and through the strip toward the grid.
  shot([{ b: 20, pos: [.85, 1.35, 2.7], look: [3.9, 1.55, .6] }, { b: 22, pos: [1.45, 1.4, 2.35], look: [3.9, 1.6, .55] }, { b: 24, pos: [2.05, 1.46, 1.95], look: [3.9, 1.62, .5] }], [...IN, "video", "portrait"], { ap: .0014, focus: [3.9, 1.6, .55] });
  // 4 · Aru Otoko: push in on the stack, then a low orbit from the right.
  shot([{ b: 24, pos: [1.55, 1.3, .35], look: [2.9, 1.05, -2.6] }, { b: 28, pos: [2.12, 1.05, -.45], look: [2.9, .98, -2.6] }], [...IN, "aru"], { ap: .0014, focus: [2.9, .9, -2.3] });
  shot([{ b: 28, pos: [3.8, .62, -.72], look: [2.7, 1.12, -2.6], roll: .05 }, { b: 32, pos: [2.1, .72, -.8], look: [2.95, 1.1, -2.6], roll: -.03 }], [...IN, "aru"], { ap: .0014, focus: [2.9, 1.0, -2.3] });
  // 5 · Bóng Vespera: track the drying line as the prints drop in, then two of them move.
  shot([{ b: 32, pos: [-3.05, 1.72, 1.95], look: [-2.9, 1.68, 3.3] }, { b: 36, pos: [-1.3, 1.74, 1.95], look: [-1.15, 1.7, 3.3] }, { b: 40, pos: [-.7, 1.7, 1.9], look: [-1.05, 1.72, 3.3], roll: .02 }], [...IN, "bong", "portrait"], { ap: .0012, focus: [-1.15, 1.72, 3.3] });
  // 6 · the other files land on the desk, top-down, turning slowly.
  shot([{ b: 40, pos: [0, 3.12, -1.28], look: [0, .78, -1.6], roll: -.06 }, { b: 44, pos: [0, 2.9, -1.3], look: [0, .78, -1.6], roll: .1 }], ["office", "rest"], { floor: false });
  // 7 · crane down from above the room to the portrait at the end of every string.
  shot([
    { b: 44, pos: [.5, 5.8, 2.4], look: [-1.2, .3, -.6], fov: 44 },
    { b: 46.3, pos: bw(1.45, .1, 1.75), look: bw(1.55, .08), fov: 32 },
    { b: 48.1, pos: bw(1.5, .08, 1.45), look: bw(1.58, .08), fov: 32 },
  ], ["office", "papers", "lamp", "street", "shafts", "boardLight", "terra", "terraItems", "portrait", "nha", "nhaPhone", "video", "aru", "bong"], { focus: bw(1.3, .08), ap: 0 });
}

// ---------------------------------------------------------------- HUD: noir caption boxes
// One box at a time: it wipes open in 0.3 s, holds still, and leaves in 0.18 s.
const caps = [];
function h(tag, cls, parent, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; parent.appendChild(e); return e; }
function cap(o) {
  const el = h("div", "box", hud); el.style.cssText += o.css || "";
  o.lines.forEach(([cls, text]) => { const ln = h("div", cls, el); if (cls.includes("type")) { o.typeEl = ln; o.typeText = text; } else ln.innerHTML = text; });
  o.el = el; caps.push(o);
}
const CAPS = [];
function buildHud() {
  const BL = "left:120px; bottom:120px;", BR = "right:120px; bottom:120px;";
  const C = (t0, t1, lines, o = {}) => { cap({ t0, t1, lines, css: o.css || BL, type: o.type }); CAPS.push({ t0, t1, text: lines.map(l => l[1].replace(/<[^>]+>/g, "")).join(" / ") }); };
  C(.3, 2.95, [["type", "Ideas into actual things."]], { type: [.1, .045] });
  C(bt(4) + .3, bt(7.6), [["k", "Case 01 · growth, content & design"], ["h", "terra"]], { css: BR });
  C(bt(12) + .3, bt(15.7), [["k", "Case 02 · family care, solo build"], ["h", "Nhà Mình"]]);
  C(bt(16) + .3, bt(19.7), [["h it", "A little closer. Even from afar."]]);
  C(bt(20) + .25, bt(23.75), [["k", "Case 03 · Video & brand"], ["h", "Two-time Top 1 TVC"]]);
  C(bt(24) + .3, bt(27.7), [["k", "Case 04 · AI film"], ["h", `Aru Otoko <span class="jp">或る男</span>`]]);
  C(bt(32) + .3, bt(35.7), [["k", "Case 05 · art direction & motion"], ["h", "Bóng Vespera"]], { css: BR });
  C(bt(44.5), DUR - .35, [["h", "Hi, I'm Thanh."], ["h", "Call me Tatsuki."], ["s", "jak3rpham.github.io"]], { css: "right:150px; top:380px;" });
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
const TOGGLE = ["terra", "terraItems", "portrait", "nha", "nhaPhone", "video", "aru", "bong", "rest", "papers", "lamp", "street", "shafts", "ceiling", "boardLight"];
function frame(t) {
  frameNo++;
  const s = shotAt(t);
  for (const n of TOGGLE) if (world[n]) world[n].visible = s.show.includes(n);
  world.office.visible = true;
  FLOORS.forEach(f => { f.visible = s.floor; });
  for (const f of upd) f(t);
  // upd may hide groups (land() before its beat); re-apply the shot's own visibility on top.
  for (const n of TOGGLE) if (world[n] && !s.show.includes(n)) world[n].visible = false;
  const c = camAt(s, t), sh = .006, n1 = Math.sin(t * 1.7) * .6 + Math.sin(t * 3.1 + 1) * .4, n2 = Math.sin(t * 1.3 + 2) * .6 + Math.sin(t * 2.7 + 4) * .4;
  camera.position.copy(c.pos).add(V3(n1 * sh, n2 * sh, 0));
  camera.fov = c.fov; camera.updateProjectionMatrix();
  camera.up.set(0, 1, 0); camera.lookAt(c.look.clone().add(V3(n2 * sh * .5, n1 * sh * .5, 0))); camera.rotateZ(c.roll);
  camera.updateMatrixWorld();
  const fv = (s.focus ? V3(...s.focus) : c.look).clone().applyMatrix4(camera.matrixWorldInverse);
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
  checkTexels(t);
  composer.render();
  evict();
  await new Promise(r => requestAnimationFrame(() => r()));
}

async function init() {
  await document.fonts.ready;
  await Promise.all([`700 64px "Courier Prime"`, `400 32px "Courier Prime"`, `700 64px "Playfair Display"`, `900 64px "Playfair Display"`, `italic 700 64px "Playfair Display"`]
    .map(f => document.fonts.load(f, "Nhà Mình Bóng Vitalité ×→·")));
  await document.fonts.load(`700 64px "Noto Serif JP"`, "或る男");
  GLOW = radialTex([[0, "rgba(255,255,255,1)"], [.2, "rgba(255,255,255,.4)"], [.55, "rgba(255,255,255,.06)"], [1, "rgba(255,255,255,0)"]]);
  buildFloor();
  buildRoom();
  buildBoard();
  const later = [buildTerra(), buildNha(), buildVideo(), buildAru(), buildBong(), buildRest(), buildSign()];
  await Promise.all(STATIC.map(u => load(u)));
  later.forEach(f => f());
  cams();
  SHOTS.sort((a, b) => a.t0 - b.t0);
  buildHud();
  await seek(0);
  return { shots: SHOTS.length, textures: TEX.size, dur: DUR };
}
window.seek = seek;
window.upscale = () => UPSCALE;
window.texels = () => MAXR;
window.captions = () => CAPS;
window.shots = () => SHOTS.map(s => ({ t0: +s.t0.toFixed(3), t1: +Math.min(s.t1, DUR).toFixed(3), show: s.show.join("+") }));
window.ready = init();
