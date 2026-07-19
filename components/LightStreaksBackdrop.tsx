"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * The video backdrop: soft horizontal light streaks drifting across a dark frame.
 *
 * Long-exposure light trails / a projector's throw — the cinematic language of the reel,
 * kept minimal: a few glowing cream bands that drift and pulse, framed by soft letterbox
 * falloff. Neutral cream so it never fights the section accents.
 *
 * A single fullscreen-triangle fragment shader (no geometry, no marching) — trivially
 * cheap, so mobile FPS is a non-issue. Reuses the light ogl plumbing: DPR cap, scroll
 * drift, pause-when-offscreen loop, reduced-motion bail.
 */

const TINT: [number, number, number] = [0.86, 0.85, 0.79]; // neutral cream

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform vec3 uTint;

float band(float y, float cy, float w){ float d = (y - cy) / w; return exp(-d * d); }

void main(){
  vec2 uv = vUv;
  float y = fract(uv.y + uScroll * 0.08);   // scroll drifts the streaks vertically
  float streak = 0.0;
  for (int i = 0; i < 6; i++){
    float fi = float(i);
    float cy = fract(0.11 + fi * 0.167);
    float w  = 0.004 + 0.006 * fract(fi * 0.37);
    float xmod = 0.55 + 0.45 * sin(uv.x * 3.0 - uTime * (0.35 + fi * 0.12) + fi);
    streak += band(y, cy, w) * xmod * (0.45 + 0.55 * fract(fi * 0.61));
  }
  float edge = smoothstep(0.0, 0.16, uv.x) * smoothstep(1.0, 0.84, uv.x);
  streak *= mix(0.45, 1.0, edge);
  float letterbox = smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
  gl_FragColor = vec4(uTint * streak, streak * 0.55 * letterbox);
}
`;

export function LightStreaksBackdrop({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.75), alpha: true });
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
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uTint: { value: TINT },
      },
      transparent: true,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      renderer.setSize(mount!.clientWidth, mount!.clientHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    let scroll = 0, scrollTarget = 0;
    function onScroll() { scrollTarget = (window.scrollY || 0) * 0.004; }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      scroll += (scrollTarget - scroll) * 0.08;
      program.uniforms.uTime.value = t;
      program.uniforms.uScroll.value = scroll;
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
