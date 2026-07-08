"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Triangle, Program, Mesh } from "ogl";

/**
 * One fixed, full-viewport 3D world behind the entire page: an aurora sky plus a
 * rolling 3D mist terrain that flows toward the viewer as you scroll, so every
 * section shares the SAME continuous backdrop with no hard cut between them.
 * Single WebGL context, two draws (aurora behind, terrain in front).
 */

// ---- aurora (full-screen) ----
const AUR_VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;
const AUR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform vec2 uRes;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for(int i = 0; i < 5; i++){ s += a * noise(p); p *= 2.0; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv;
  uv.x *= uRes.x / uRes.y;
  float t = uTime * 0.06;
  float sy = uScroll * 0.15;
  float warp = fbm(vec2(uv.x * 1.3 + t * 1.4, uv.y * 1.0 - t + sy));
  float curtain = fbm(vec2(uv.x * 2.6 + warp * 1.5 - t * 1.8, uv.y * 0.6 + warp * 0.4 + sy));
  float band = smoothstep(0.34, 0.86, curtain);
  float vert = mix(0.15, 1.0, smoothstep(-0.1, 0.95, vUv.y)); // brighter toward the top (sky)
  float intensity = band * vert;
  vec3 deep = vec3(0.05, 0.13, 0.09);
  vec3 rim = vec3(0.45, 0.72, 0.53);
  vec3 col = mix(deep, rim, band);
  gl_FragColor = vec4(col * intensity, intensity * 0.6);
}
`;

// ---- 3D mist terrain ----
const TER_VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
void main(){
  vec2 p = position.xy + vec2(0.0, uScroll); // scroll flows the terrain toward the camera
  float t = uTime;
  float e = 0.0; vec2 g = vec2(0.0);
  { vec2 k = vec2(0.35, 0.0);   float a = 0.55; float ph = dot(k,p) + t*0.6; e += a*sin(ph); g += a*cos(ph)*k; }
  { vec2 k = vec2(0.0, 0.32);   float a = 0.45; float ph = dot(k,p) + t*0.5; e += a*sin(ph); g += a*cos(ph)*k; }
  { vec2 k = vec2(0.22, 0.26);  float a = 0.40; float ph = dot(k,p) - t*0.4; e += a*sin(ph); g += a*cos(ph)*k; }
  { vec2 k = vec2(0.50, -0.34); float a = 0.20; float ph = dot(k,p) + t*0.9; e += a*sin(ph); g += a*cos(ph)*k; }
  vec3 dpos = vec3(position.xy, e);
  vec3 localN = normalize(vec3(-g, 1.0));
  vec4 mv = modelViewMatrix * vec4(dpos, 1.0);
  vNormal = normalize(normalMatrix * localN);
  vView = normalize(-mv.xyz);
  vElev = e; vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
const TER_FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
uniform float uTime;
void main(){
  vec3 ink = vec3(0.051, 0.059, 0.051);
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 3.0);
  vec3 base = vec3(0.02, 0.035, 0.028);
  vec3 rim = vec3(0.56, 0.83, 0.62);
  vec3 col = mix(base, rim, fres * 0.95);
  col += rim * 0.14 * smoothstep(0.15, 0.95, vElev * 0.5 + 0.5);
  float fog = smoothstep(6.0, 26.0, vDist);
  col = mix(col, ink, fog);
  gl_FragColor = vec4(col, (1.0 - fog) * 0.95);
}
`;

export function SceneBackdrop({ className = "" }: { className?: string }) {
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
    renderer.autoClear = false;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    // aurora
    const aurGeo = new Triangle(gl);
    const aurProg = new Program(gl, {
      vertex: AUR_VERT,
      fragment: AUR_FRAG,
      uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: [1, 1] } },
      transparent: true,
      depthTest: false,
    });
    const aurora = new Mesh(gl, { geometry: aurGeo, program: aurProg });

    // terrain
    const camera = new Camera(gl, { fov: 55 });
    camera.position.set(0, 2.4, 6.5);
    camera.lookAt([0, -1.2, -14]);
    const terGeo = new Plane(gl, { width: 80, height: 80, widthSegments: 170, heightSegments: 170 });
    const terProg = new Program(gl, {
      vertex: TER_VERT,
      fragment: TER_FRAG,
      uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
      transparent: true,
      depthTest: false,
    });
    const terrain = new Mesh(gl, { geometry: terGeo, program: terProg });
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -1.6, -10);
    const terScene = new Transform();
    terrain.setParent(terScene);

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      aurProg.uniforms.uRes.value = [w || 1, h || 1];
      camera.perspective({ aspect: w / h });
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    let scroll = 0;
    let scrollTarget = 0;
    function onScroll() {
      scrollTarget = (window.scrollY || 0) * 0.012;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      scroll += (scrollTarget - scroll) * 0.08;
      aurProg.uniforms.uTime.value = t;
      aurProg.uniforms.uScroll.value = scroll;
      terProg.uniforms.uTime.value = t;
      terProg.uniforms.uScroll.value = scroll;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      renderer.render({ scene: aurora });
      renderer.render({ scene: terScene, camera });
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function onVis() {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className={className} />;
}
