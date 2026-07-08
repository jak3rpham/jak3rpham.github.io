"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * Flowing aurora curtains — a full-screen fragment effect: domain-warped noise
 * bands drifting and shimmering in the site's green, alpha-composited over the
 * dark page. Always visible regardless of aspect ratio; a distinct ambient motif
 * for a wide section background. New, not reused.
 */
const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
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
  uv.x *= uRes.x / uRes.y; // aspect-correct horizontal
  float t = uTime * 0.08;
  // domain-warped vertical curtains drifting sideways
  float warp = fbm(vec2(uv.x * 1.4 + t * 1.6, uv.y * 1.1 - t));
  float curtain = fbm(vec2(uv.x * 3.0 + warp * 1.6 - t * 2.2, uv.y * 0.7 + warp * 0.4));
  float band = smoothstep(0.32, 0.85, curtain);
  // brighter toward the top, softer at the bottom
  float vert = mix(0.35, 1.0, smoothstep(0.0, 0.85, vUv.y));
  float intensity = band * vert;
  vec3 deep = vec3(0.09, 0.26, 0.16);
  vec3 rim = vec3(0.56, 0.83, 0.62);
  vec3 col = mix(deep, rim, band);
  float alpha = intensity * 0.72;
  gl_FragColor = vec4(col * intensity, alpha);
}
`;

export function WebGLAurora({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] } },
      transparent: true,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w || 1, h || 1];
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      program.uniforms.uTime.value = (now - startT) / 1000;
      renderer.render({ scene: mesh });
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
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className={className} />;
}
