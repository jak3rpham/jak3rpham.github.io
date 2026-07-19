"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh } from "ogl";

/**
 * Full-width flowing wave surface behind a page — a big ground plane that recedes
 * to a horizon, its vertices rolling in layered waves. The whole field TRAVELS
 * with the scroll (scroll offsets the wave coordinate), so the background clearly
 * moves up/down WITH the user — a continuous scroll transition, not a static
 * object. Fresnel rim + fog to the horizon. Idle animation + scroll flow + a
 * gentle cursor parallax. Each route passes a `variant` (colour + wave feel).
 */

type RGB = [number, number, number];
type Variant = { rim: RGB; base: RGB; scale: number; flow: number; amp: number };

// Only `home` still uses the wave — terra/video/bong/aru each have their own scene now
// (see SceneBackdrop). An unknown variant falls back to `home` via the `?? VARIANTS.home`.
const VARIANTS: Record<string, Variant> = {
  // broad neutral bone swells (matches the homepage's neutral accent), flowing toward you
  home: { rim: [0.78, 0.725, 0.631], base: [0.032, 0.031, 0.028], scale: 1.0, flow: 3.4, amp: 1.0 },
};

const VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uScroll;   // flows the field with scroll
uniform float uScale;
uniform float uFlow;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
void main(){
  vec2 p = position.xy * uScale + vec2(0.0, uScroll * uFlow); // scroll travels the surface
  float t = uTime;
  float e = 0.0;
  vec2 g = vec2(0.0);
  { vec2 k = vec2(0.35, 0.05); float a = 0.55; float ph = dot(k, p) + t * 0.60; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.03, 0.34); float a = 0.45; float ph = dot(k, p) + t * 0.50; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.22, 0.26); float a = 0.40; float ph = dot(k, p) - t * 0.40; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.50, -0.30);float a = 0.20; float ph = dot(k, p) + t * 0.90; e += a * sin(ph); g += a * cos(ph) * k; }
  e *= uAmp; g *= uAmp * uScale;
  vec3 dpos = vec3(position.xy, e);
  vec3 localN = normalize(vec3(-g, 1.0));
  vec4 mv = modelViewMatrix * vec4(dpos, 1.0);
  vNormal = normalize(normalMatrix * localN);
  vView = normalize(-mv.xyz);
  vElev = e;
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
uniform float uTime;
uniform vec3 uRim;
uniform vec3 uBase;
void main(){
  vec3 ink = vec3(0.051, 0.059, 0.051);
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.6);
  vec3 col = mix(uBase, uRim, fres);
  col += uRim * 0.16 * smoothstep(0.1, 0.95, vElev * 0.5 + 0.5);   // crest glow
  col += uRim * 0.05 * sin(uTime * 1.4 + vElev * 3.0);
  float fog = smoothstep(7.0, 30.0, vDist);
  col = mix(col, ink, fog);
  gl_FragColor = vec4(col, (1.0 - fog) * 0.95);
}
`;

export function WaveFieldBackdrop({
  className = "",
  variant = "home",
}: {
  className?: string;
  variant?: keyof typeof VARIANTS;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cfg = VARIANTS[variant] ?? VARIANTS.home;

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
        uScale: { value: cfg.scale },
        uFlow: { value: cfg.flow },
        uAmp: { value: cfg.amp },
        uRim: { value: cfg.rim },
        uBase: { value: cfg.base },
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
    function onScroll() { scrollTarget = (window.scrollY || 0) * 0.01; }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      scroll += (scrollTarget - scroll) * 0.08;
      mx += (mxTarget - mx) * 0.04;
      program.uniforms.uTime.value = t;
      program.uniforms.uScroll.value = scroll;
      scene.rotation.y = mx * 0.14;      // gentle cursor parallax
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
  }, [variant]);

  return <div ref={mountRef} aria-hidden className={className} />;
}
