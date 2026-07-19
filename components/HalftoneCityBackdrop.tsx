"use client";
import { useEffect, useRef } from "react";
import { onVideoPlaybackChange } from "@/lib/videoPlayback";

/**
 * The ある男 backdrop: a raymarched city rendered through a ben-day halftone shader.
 *
 * Spider-Verse's actual technique is 3D geometry screened into halftone dots — the
 * dots are how it is rendered, not a texture laid over it. So this uses the method
 * rather than imitating the look, and the material comes from the project itself.
 *
 * It also enacts the MV's own thesis: the character is the anchor, the city never
 * stops rushing. Scroll drives the city forward; the panels above never move.
 *
 * Raw WebGL rather than ogl (which `WaveFieldBackdrop` uses) because this is a single
 * fullscreen triangle — ogl's scene graph buys nothing here and the shader was
 * validated standalone in this exact form.
 *
 * Settings are measured, not eyeballed. `EXP = 1.8` because the ben-day gaps swallow
 * ~58% of the light; 1.8 lands the mean back at the un-halftoned 28.9/255.
 */

const P = {
  dot: 3.5,
  mix: 0.7,
  exp: 1.8,
  sky: 1.0,
  facade: 1.0,
  win: 1.0,
  car: 1.0,
  lamp: 1.0,
  sign: 1.0,
  wet: 0.75,
  den: 0.72,
  spd: 1.0,
} as const;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.0,1.0); }`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime, uZ, uDot, uMix, uExp, uWin, uCar, uWet, uDen;
uniform float uSky, uFac, uLamp, uSign, uRef;

const float GY = -6.0;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float hash1(float n){ return fract(sin(n*78.233) * 43758.5453); }

float sdBox(vec3 p, vec3 b){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x, max(q.y,q.z)), 0.0);
}

// mat: 0 building · 1 ground · 2 car · 3 wire · 4 lamp · 5 sign · 6 clutter
float map(vec3 p, out float mat){
  mat = 1.0;
  float d = p.y - GY;

  vec2 cell = vec2(11.0, 13.0);
  vec2 id = floor((p.xz + cell*0.5) / cell);
  vec3 q = p;
  q.xz = mod(p.xz + cell*0.5, cell) - cell*0.5;

  float lane = step(1.0, abs(id.x));
  float rnd  = hash(id);
  float present = step(1.0 - uDen, rnd) * lane;

  if (present > 0.5) {
    float h  = 5.0 + rnd * 20.0;
    float bw = 3.0 + hash(id + 7.0) * 1.6;
    float bd = 3.0 + hash(id + 13.0) * 1.6;
    float b1 = sdBox(q - vec3(0.0, h + GY, 0.0), vec3(bw, h, bd));
    float h2 = h * (0.28 + hash(id + 3.3) * 0.34);
    float b2 = sdBox(q - vec3(0.0, 2.0*h + h2 + GY, 0.0), vec3(bw*0.62, h2, bd*0.62));
    float b  = min(b1, b2);
    if (b < d) { d = b; mat = 0.0; }

    float roofY = 2.0*h + 2.0*h2 + GY;
    if (hash(id + 21.0) > 0.45) {
      float tank = sdBox(q - vec3(bw*0.25, roofY + 0.55, bd*0.2), vec3(0.5, 0.55, 0.5));
      if (tank < d) { d = tank; mat = 6.0; }
    }
    if (hash(id + 31.0) > 0.55) {
      float mast = sdBox(q - vec3(-bw*0.3, roofY + 1.9, 0.0), vec3(0.05, 1.9, 0.05));
      if (mast < d) { d = mast; mat = 6.0; }
    }
    if (hash(id + 47.0) > 0.5) {
      float sgn = sdBox(q - vec3(sign(id.x) * -bw, GY + 4.2 + hash(id+5.0)*3.0, bd*0.5),
                        vec3(0.09, 1.5, 0.42));
      if (sgn < d) { d = sgn; mat = 5.0; }
    }
  }

  float side = p.x > 0.0 ? 1.0 : -1.0;
  vec3 tp = p;
  tp.x = abs(p.x) - 3.1;
  tp.z = mod(p.z + uTime*11.0*side, 15.0) - 7.5;
  tp.y = p.y - (GY + 0.55);
  float car = sdBox(tp, vec3(0.42, 0.32, 1.25));
  if (car < d) { d = car; mat = 2.0; }

  vec3 lp = p;
  lp.x = abs(p.x) - 4.8;
  lp.z = mod(p.z + 6.0, 12.0) - 6.0;
  float pole = sdBox(lp - vec3(0.0, GY + 2.6, 0.0), vec3(0.055, 2.6, 0.055));
  if (pole < d) { d = pole; mat = 6.0; }
  float lamp = sdBox(lp - vec3(-0.3, GY + 5.15, 0.0), vec3(0.36, 0.07, 0.13));
  if (lamp < d) { d = lamp; mat = 4.0; }

  vec3 wp = p;
  wp.z = mod(p.z + 4.0, 9.0) - 4.5;
  float wire = max(abs(wp.y - (GY + 13.0)) - 0.035, abs(wp.z) - 0.035);
  wire = max(wire, abs(p.x) - 9.0);
  if (wire < d) { d = wire; mat = 3.0; }

  return d;
}
float mapD(vec3 p){ float m; return map(p, m); }

vec3 normal(vec3 p){
  vec2 e = vec2(0.0025, 0.0);
  return normalize(vec3(
    mapD(p+e.xyy) - mapD(p-e.xyy),
    mapD(p+e.yxy) - mapD(p-e.yxy),
    mapD(p+e.yyx) - mapD(p-e.yyx)));
}

const vec3 amber = vec3(0.878, 0.627, 0.353);
const vec3 base  = vec3(0.052, 0.041, 0.032);
const vec3 horiz = vec3(0.145, 0.105, 0.075);

// facade detail in shading only — floor slabs, mullions, panes. costs no march steps,
// which is the only reason the city can afford this much detail.
float facade(vec3 p, vec3 n, out float winLit){
  vec2 uv = abs(n.x) > 0.5 ? p.zy : p.xy;
  vec2 g  = vec2(uv.x * 1.05, uv.y * 0.85);
  vec2 c  = floor(g);
  vec2 f  = fract(g);

  float pane = step(0.16, f.x) * step(f.x, 0.8) * step(0.2, f.y) * step(f.y, 0.72);
  float lit  = step(0.52, hash(c + floor(p.z*0.02)));
  float flick = step(0.93, hash(c + 41.0));
  lit *= mix(1.0, 0.3 + 0.7*step(0.5, fract(uTime*0.7 + hash(c))), flick);
  winLit = lit * pane;

  float slab = smoothstep(0.0, 0.055, f.y) * smoothstep(0.13, 0.06, f.y);
  float mull = smoothstep(0.0, 0.05, f.x) * smoothstep(0.11, 0.05, f.x);
  return clamp(slab + mull, 0.0, 1.0);
}

vec3 shade(vec3 p, vec3 rd, float mat){
  vec3 n = normal(p);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.3);
  float key  = max(dot(n, normalize(vec3(0.4,0.7,-0.3))), 0.0);
  vec3 col = base + amber*(fres*0.8 + key*0.14);

  if (mat < 0.5){
    float winLit;
    float lines = facade(p, n, winLit);
    col += amber * winLit * uWin * 0.75;
    col *= 1.0 - lines * 0.55 * uFac;
  } else if (mat > 1.5 && mat < 2.5){
    col = amber * 1.7 * uCar;
  } else if (mat > 2.5 && mat < 3.5){
    col = base * 0.5;
  } else if (mat > 3.5 && mat < 4.5){
    col = amber * 2.1 * uLamp;
  } else if (mat > 4.5 && mat < 5.5){
    col = amber * 1.5 * uSign;
  } else if (mat > 5.5){
    col = base * 0.75 + amber*fres*0.35;
  }
  return col;
}

// Haze only. MUST NOT contain the skyline: fogging geometry toward a sky that already
// has silhouettes painted into it stamps those silhouettes onto the road.
vec3 skyHaze(vec3 rd){
  float t = clamp(rd.y*2.2 + 0.35, 0.0, 1.0);
  return mix(horiz, vec3(0.055,0.045,0.045), t);
}

// Distant skyline, analytic — the far city is a silhouette, never marched. Only ever
// composited where the ray hit nothing, so real geometry always occludes it.
vec3 sky(vec3 rd, vec2 uv, float z){
  vec3 c = skyHaze(rd);
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float scale = 5.0 + fi*7.0;
    float drift = z * (0.004 + fi*0.003);
    float x = uv.x*scale + drift + fi*17.0;
    float k = floor(x);
    float hgt = (0.018 + hash1(k + fi*31.0)*0.075) * (1.0 - fi*0.22);
    float top = hgt - 0.012*fi;
    float on = step(uv.y, top) * step(-0.16, uv.y);
    vec3 band = mix(horiz*0.55, base, fi*0.3);
    float w = step(0.86, hash1(k*3.1 + floor(uv.y*160.0)));
    band += amber * w * 0.25 * (1.0 - fi*0.3);
    c = mix(c, band, on * uSky);
  }
  return c;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;

  vec3 ro = vec3(0.0, -1.6 + sin(uTime*0.4)*0.12, uZ);
  vec3 rd = normalize(vec3(uv, 1.3));
  float sway = sin(uTime*0.23)*0.028;
  rd = normalize(rd + vec3(sway, sway*0.35, 0.0));

  float t=0.0, mat=1.0, hit=0.0, glow=0.0;
  for (int i=0;i<84;i++){
    vec3 p = ro + rd*t;
    float m; float d = map(p, m);
    if (m > 1.5 && m < 2.5) glow += exp(-abs(d)*2.4)*0.03;
    if (m > 3.5 && m < 4.5) glow += exp(-abs(d)*3.0)*0.02;
    if (d < 0.004*t){ hit=1.0; mat=m; break; }
    t += d*0.85;
    if (t > 78.0) break;
  }

  vec3 haze = skyHaze(rd);
  vec3 col  = sky(rd, uv, uZ);

  if (hit > 0.5){
    vec3 p = ro + rd*t;
    col = shade(p, rd, mat);

    if (mat > 0.5 && mat < 1.5 && uRef > 0.5){
      vec3 n = vec3(0.0,1.0,0.0);
      n.x += sin(p.z*2.6 + uTime*1.1)*0.035;
      n.z += cos(p.x*3.1 - uTime*0.8)*0.035;
      n = normalize(n);
      vec3 r  = reflect(rd, n);
      vec3 rp = p + n*0.02;
      float rt=0.0, rhit=0.0, rmat=0.0;
      for (int j=0;j<28;j++){
        vec3 q2 = rp + r*rt;
        float m2; float d2 = map(q2, m2);
        if (d2 < 0.012*rt){ rhit=1.0; rmat=m2; break; }
        rt += d2*0.9;
        if (rt > 38.0) break;
      }
      vec3 refl = rhit > 0.5 ? shade(rp + r*rt, r, rmat) : skyHaze(r);
      refl = mix(horiz*0.6, refl, exp(-rt*0.05));
      float gz = pow(1.0 - max(dot(n,-rd),0.0), 3.0);
      col = mix(col, refl*amber*1.25, uWet*clamp(gz*1.3, 0.0, 0.85));
    }
    float fog = 1.0 - exp(-t*0.05);
    col = mix(col, haze, fog);
  }

  col += amber*glow*uCar;
  col *= 1.0 - 0.45*dot(uv,uv);
  col *= uExp;

  // Ben-day, one screen angle per channel (15°/45°/75°) — real CMYK practice.
  // Colour fringing falls out of the differing angles instead of being faked.
  float dotSize = max(uDot, 1.5);
  vec3 outc;
  for (int c=0;c<3;c++){
    float ang = c==0 ? 0.262 : (c==1 ? 0.785 : 1.309);
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 hp = rot * (gl_FragCoord.xy / dotSize);
    float dd = length(fract(hp) - 0.5);
    float lv = c==0 ? col.r : (c==1 ? col.g : col.b);
    float radius = sqrt(clamp(lv,0.0,1.0))*0.58;
    float dm = smoothstep(radius, radius-0.11, dd);
    float v = mix(lv, dm*lv*1.45, uMix);
    if (c==0) outc.r=v; else if (c==1) outc.g=v; else outc.b=v;
  }
  gl_FragColor = vec4(outc, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("HalftoneCityBackdrop shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function HalftoneCityBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cvs = canvas;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // quality ladder. phones and reduced-motion get one still frame and no loop at all.
    // Cap desktop render scale at 1.25: the raymarcher is fragment-bound, so on a 1440p+
    // screen every extra 0.25 of scale is real cost for little visible gain through halftone.
    let scale = coarse ? 0.55 : Math.min(window.devicePixelRatio || 1, 1.25);
    const still = reduced;

    // GL objects live in `let`s because they are ALL invalidated by a WebGL context loss
    // and rebuilt by initGL() on restore. A playing video can push a GPU to drop this
    // canvas's context; without webglcontextlost handling that loss is permanent and the
    // canvas blanks to opaque black — the "black box behind the video" bug. See the
    // context-loss handlers below.
    let gl: WebGLRenderingContext | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let raf = 0;
    let sizeRaf = 0;
    let sizeTries = 0;
    let z = 0;
    let slowFrames = 0;
    let lastT = performance.now();
    let t0 = lastT;
    let contextLost = false;
    let paused = false;
    // Frame-cap the backdrop to ~33fps. This halves its GPU cost versus running at 60fps with
    // NO loss of detail (same render resolution, same march steps) — the city drifts slowly
    // enough that the cap is invisible. This is the "less lag, same look" lever.
    const CAP_MS = 1000 / 33;

    function setUniforms(time: number, zz: number) {
      if (!gl) return;
      gl.uniform2f(u.res, cvs.width, cvs.height);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.z, zz);
      gl.uniform1f(u.dot, P.dot); gl.uniform1f(u.mix, P.mix); gl.uniform1f(u.exp, P.exp);
      gl.uniform1f(u.win, P.win); gl.uniform1f(u.car, P.car); gl.uniform1f(u.wet, P.wet);
      gl.uniform1f(u.den, P.den); gl.uniform1f(u.sky, P.sky); gl.uniform1f(u.fac, P.facade);
      gl.uniform1f(u.lamp, P.lamp); gl.uniform1f(u.sign, P.sign);
      gl.uniform1f(u.ref, coarse ? 0 : 1); // drop the reflection bounce on phones
    }
    function drawOnce() {
      if (!gl) return;
      setUniforms(2.0, 6.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Sizing at mount is not reliable: the canvas can be measured before it is laid
    // out, and in some embeddings window.innerWidth is 0 that early too — so the
    // first call legitimately measures nothing. ResizeObserver normally rescues that,
    // but RO delivery rides the rendering lifecycle and does not fire at all while a
    // tab is hidden. Both failing together leaves a permanently 300x150 canvas, i.e.
    // a blank backdrop with no error anywhere. Hence: observe, listen, AND retry.
    function resize() {
      if (!gl) return false;
      const r = cvs.getBoundingClientRect();
      const w = Math.round((r.width || window.innerWidth) * scale);
      const h = Math.round((r.height || window.innerHeight) * scale);
      if (w < 1 || h < 1) return false;
      if (cvs.width === w && cvs.height === h) return true;
      cvs.width = w;
      cvs.height = h;
      gl.viewport(0, 0, w, h);
      if (still) drawOnce();
      return true;
    }
    function ensureSized() {
      if (resize() || ++sizeTries > 60) return;
      sizeRaf = requestAnimationFrame(ensureSized);
    }

    function frame() {
      if (!gl || paused || contextLost) return;
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = now - lastT;
      if (dt < CAP_MS) return; // throttle: skip this rAF tick, stay near the cap
      lastT = now;

      // Sustained inability to hold even ~18fps: step render scale down (repeatably, 0.4 floor).
      if (dt > 55) {
        if (++slowFrames > 20 && scale > 0.4) {
          scale = Math.max(0.4, scale * 0.7);
          resize();
          slowFrames = 0;
        }
      } else if (dt < CAP_MS * 1.4) {
        slowFrames = Math.max(0, slowFrames - 1);
      }

      const time = (now - t0) / 1000;
      const target = window.scrollY * 0.05 * P.spd + time * 0.6;
      z += (target - z) * 0.15; // larger lerp: we run at ~half the frame rate now

      setUniforms(time, z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // (Re)build every GL object. Runs at mount and again on webglcontextrestored, because a
    // context loss invalidates the program, buffer and every uniform location.
    function initGL(): boolean {
      const ctx = cvs.getContext("webgl", { antialias: false, alpha: false, depth: false });
      if (!ctx) return false; // no WebGL: the CSS gradient underneath stands in
      gl = ctx;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("HalftoneCityBackdrop link:", gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const g = gl;
      const U = (n: string) => g.getUniformLocation(prog, n);
      u = {
        res: U("uRes"), time: U("uTime"), z: U("uZ"), dot: U("uDot"), mix: U("uMix"),
        exp: U("uExp"), win: U("uWin"), car: U("uCar"), wet: U("uWet"), den: U("uDen"),
        sky: U("uSky"), fac: U("uFac"), lamp: U("uLamp"), sign: U("uSign"), ref: U("uRef"),
      };
      return true;
    }

    function startRender() {
      cvs.width = 0; // force resize() to re-apply size + viewport after a fresh context
      cvs.height = 0;
      sizeTries = 0;
      ensureSized();
      if (still) {
        drawOnce();
        return;
      }
      lastT = performance.now();
      t0 = lastT;
      if (!paused && !contextLost) raf = requestAnimationFrame(frame);
    }

    if (!initGL()) return; // no WebGL / build failed: the CSS gradient underneath stands in
    startRender();

    const ro = new ResizeObserver(() => resize());
    ro.observe(cvs);
    window.addEventListener("resize", resize);

    // Without preventDefault() a lost context is permanent, and an alpha:false canvas blanks
    // to opaque BLACK — the fixed backdrop then reads as a black box sitting behind the page
    // that scrolls with the background, not the video that triggered it. Instead: stop the
    // dead loop, reveal the dark gradient underneath (never black), and let the browser hand
    // the context back. The warn lets a viewer confirm this is what they hit.
    function onContextLost(e: Event) {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sizeRaf);
      cvs.style.opacity = "0";
      console.warn("[HalftoneCityBackdrop] WebGL context lost — showing gradient, awaiting restore");
    }
    function onContextRestored() {
      contextLost = false;
      if (initGL()) {
        cvs.style.opacity = "";
        startRender();
        console.info("[HalftoneCityBackdrop] WebGL context restored");
      }
    }
    cvs.addEventListener("webglcontextlost", onContextLost);
    cvs.addEventListener("webglcontextrestored", onContextRestored);

    // A video decoding on the same GPU is what tends to trigger the loss above. While one is
    // playing over this backdrop, pause the shader loop: it removes the contention (making the
    // loss far less likely) and freezes the city on its last frame rather than dropping it.
    function setPaused(p: boolean) {
      if (p === paused) return;
      paused = p;
      if (p) {
        cancelAnimationFrame(raf);
      } else if (!contextLost && !still) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    const offPlayback = onVideoPlaybackChange(setPaused);

    // hidden tabs pause rAF anyway; this keeps the clock from lurching on return
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!paused && !contextLost && !still) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sizeRaf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      cvs.removeEventListener("webglcontextlost", onContextLost);
      cvs.removeEventListener("webglcontextrestored", onContextRestored);
      offPlayback();
      // NOT loseContext(): StrictMode runs mount→cleanup→mount, and getContext() hands
      // back the same (now dead) context on the second mount, so the shader fails to
      // compile and the backdrop silently never appears in dev. Stopping the loop is
      // what actually matters; the context is collected with the canvas.
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      {/* stands in if WebGL is unavailable, and stops a white flash before first paint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,#2A211A,#14100D_72%)]" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
