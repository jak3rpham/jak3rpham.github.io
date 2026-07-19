"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh } from "ogl";

/**
 * The terra backdrop: a living topographic terrain read by glowing contour lines.
 *
 * terra = earth. A displaced heightfield (FBM hills) stands in for the land, and
 * bright isolines drawn from its world height are the "measured" layer — the same
 * up-and-to-the-right story the case study tells (12× organic growth), made literal:
 * scroll down and the land RISES (amplitude compounds), so more contour bands surface
 * as you read. A slow scan line sweeps the terrain like an analytics read.
 *
 * A displaced plane, NOT a raymarch, on purpose. The city backdrop (HalftoneCity) is
 * fragment-bound and fill-rate heavy; a heightfield pushes the cost into the vertex
 * stage (25k verts) and keeps mobile FPS healthy — the real budget lever here. It
 * reuses WaveFieldBackdrop's exact ogl plumbing (camera, DPR cap, scroll travel,
 * cursor parallax, pause-when-offscreen loop, reduced-motion bail).
 */

const RIM: [number, number, number] = [0.56, 0.83, 0.62]; // forest #8FD49E
const BASE: [number, number, number] = [0.02, 0.045, 0.03];

const VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uScroll;  // travels the terrain toward the viewer
uniform float uRise;    // 0..1 down the page — the land compounds upward
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDepth;   // world depth along the travel axis, for the scan line
varying float vDist;

// value noise + fbm — cheap, smooth hills. gradient is taken numerically below.
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.02 + 3.1; a *= 0.5; }
  return s;
}

void main(){
  vec2 p = position.xy * 0.14 + vec2(0.0, uScroll);   // slower, broader than the wave
  float amp = 1.35 * (1.0 + 0.75 * uRise);            // land rises as you scroll
  float e = (fbm(p) - 0.5) * amp;

  // numerical gradient for the normal (2 extra fbm taps)
  float ex = ((fbm(p + vec2(0.06, 0.0)) - 0.5) * amp - e);
  float ey = ((fbm(p + vec2(0.0, 0.06)) - 0.5) * amp - e);
  vec3 localN = normalize(vec3(-ex, -ey, 0.06));

  vec3 dpos = vec3(position.xy, e);
  vec4 mv = modelViewMatrix * vec4(dpos, 1.0);
  vNormal = normalize(normalMatrix * localN);
  vView = normalize(-mv.xyz);
  vElev = e;
  vDepth = position.y;
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDepth;
varying float vDist;
uniform float uTime;
uniform vec3 uRim;
uniform vec3 uBase;

void main(){
  vec3 ink = vec3(0.045, 0.058, 0.048);
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);

  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
  float slope = 1.0 - n.z;                       // steeper faces read brighter
  vec3 col = mix(uBase, uRim, fres * 0.7 + slope * 0.25);
  col += uRim * 0.10 * smoothstep(0.0, 0.9, vElev + 0.5);   // sunlit crests

  // contour isolines — the measured layer, drawn straight from world height.
  // no derivatives: lines naturally bunch on steep slopes, like a real topo map.
  float bands = vElev * 6.0;
  float d = abs(fract(bands - 0.5) - 0.5);
  float line = smoothstep(0.06, 0.0, d);
  col += uRim * line * 0.9;

  // scan line: a soft bright sweep travelling along the depth axis
  float scanPos = fract(uTime * 0.03);
  float sd = abs(fract(vDepth * 0.0125 - scanPos) - 0.5);
  float scan = smoothstep(0.5, 0.46, sd);
  col += uRim * scan * 0.18;

  float fog = smoothstep(6.0, 30.0, vDist);
  col = mix(col, ink, fog);
  gl_FragColor = vec4(col, (1.0 - fog) * 0.96);
}
`;

export function ContourTerrainBackdrop({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.75), alpha: true, antialias: true });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const camera = new Camera(gl, { fov: 55 });
    camera.position.set(0, 2.6, 6.6);
    camera.lookAt([0, -1.4, -16]);

    const scene = new Transform();
    const geometry = new Plane(gl, { width: 80, height: 80, widthSegments: 160, heightSegments: 160 });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uRise: { value: 0 },
        uRim: { value: RIM },
        uBase: { value: BASE },
      },
      transparent: true,
      cullFace: false,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -1.5, -9);
    mesh.setParent(scene);

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    }
    resize();
    window.addEventListener("resize", resize);

    let mx = 0, mxTarget = 0;
    function onMove(e: MouseEvent) { mxTarget = e.clientX / window.innerWidth - 0.5; }
    window.addEventListener("mousemove", onMove);

    let scroll = 0, scrollTarget = 0;
    let rise = 0, riseTarget = 0;
    function onScroll() {
      const y = window.scrollY || 0;
      scrollTarget = y * 0.006;
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      riseTarget = Math.min(1, y / max);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      scroll += (scrollTarget - scroll) * 0.08;
      rise += (riseTarget - rise) * 0.06;
      mx += (mxTarget - mx) * 0.04;
      program.uniforms.uTime.value = t;
      program.uniforms.uScroll.value = scroll;
      program.uniforms.uRise.value = rise;
      scene.rotation.y = mx * 0.12;   // gentle cursor parallax
      renderer.render({ scene, camera });
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting && !document.hidden;
        if (visible && !was) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(mount);
    function onVis() {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className={className} />;
}
