"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * The video backdrop: film strips scrolling sideways.
 *
 * Line-art film stock — sprocket holes and frame dividers drawn as thin cream outlines
 * on dark, a few strips stacked and drifting in alternating directions for a gentle
 * parallax. Unmistakably a reel, kept minimal. Neutral cream so it never fights the
 * section accents; page scroll nudges the drift.
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
uniform float uAspect;
uniform vec3 uTint;

// signed distance to a rounded box, for the sprocket-hole outlines
float rbox(vec2 p, vec2 b, float r){
  vec2 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

void main(){
  const float ROWS = 3.0;
  vec2 uv = vUv;
  float row = floor(uv.y * ROWS);
  float ry = fract(uv.y * ROWS);                     // 0..1 within a strip
  float dir = mod(row, 2.0) * 2.0 - 1.0;             // alternate scroll direction
  float sx = uv.x * uAspect * 1.6 + dir * (uTime * 0.04 + uScroll * 0.25);

  // frame band inner edges (two horizontal lines per strip)
  float h1 = smoothstep(0.012, 0.0, abs(ry - 0.28));
  float h2 = smoothstep(0.012, 0.0, abs(ry - 0.72));

  // vertical frame dividers, only between the inner edges
  float mid = step(0.28, ry) * step(ry, 0.72);
  float fx = abs(fract(sx * 3.0) - 0.5);
  float vlin = smoothstep(0.006, 0.0, fx) * mid;

  // sprocket-hole outlines, offset half a frame from the dividers
  float hxc = fract(sx * 3.0 + 0.5) - 0.5;
  float top = rbox(vec2(hxc * 0.9, ry - 0.14), vec2(0.11, 0.045), 0.02);
  float bot = rbox(vec2(hxc * 0.9, ry - 0.86), vec2(0.11, 0.045), 0.02);
  float holes = smoothstep(0.012, 0.0, abs(top)) + smoothstep(0.012, 0.0, abs(bot));

  float ink = clamp(h1 + h2 + vlin + holes, 0.0, 1.0);
  float edge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);  // soften L/R
  ink *= mix(0.6, 1.0, edge);

  gl_FragColor = vec4(uTint * ink, ink * 0.5);
}
`;

export function FilmStripBackdrop({ className = "" }: { className?: string }) {
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
        uAspect: { value: 1 },
        uTint: { value: TINT },
      },
      transparent: true,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uAspect.value = h > 0 ? w / h : 1;
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
