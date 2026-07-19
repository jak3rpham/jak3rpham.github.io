"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * The BÓNG VESPERA backdrop: warm embers drifting up through a dusk glow.
 *
 * Vespera = evening. A soft ember-orange glow rising from the bottom edge, with sparse
 * sparks drifting upward and flickering — the page's ember re-theme (#e8a24c) turned into
 * atmosphere. Kept minimal and alpha-blended over the page's dark ink, so it reads as a
 * warm haze, not an opaque background.
 *
 * A single fullscreen-triangle fragment shader (procedural embers, no geometry) — cheap
 * enough that mobile FPS is a non-issue. Reuses the light ogl plumbing: DPR cap, scroll
 * drift, pause-when-offscreen loop, reduced-motion bail.
 */

const EMBER: [number, number, number] = [0.91, 0.635, 0.3]; // #e8a24c

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
uniform vec3 uEmber;

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

// one layer of embers rising through the frame
float embers(vec2 uv, float t, float cols, float seed){
  uv.x *= cols;
  float cx = floor(uv.x);
  float fx = fract(uv.x);
  float speed = 0.03 + hash(vec2(cx, seed)) * 0.05;
  float y = uv.y * 4.0 + t * speed * 4.0 + hash(vec2(cx, seed + 3.0)) * 10.0;
  float ry = floor(y);
  float fy = fract(y);
  vec2 id = vec2(cx, ry);
  float on = step(0.62, hash(id + seed + 7.0));
  float px = hash(id + seed);
  vec2 d = vec2(fx - px, fy - 0.5);
  float spark = on * exp(-dot(d, d) * 130.0);
  spark *= 0.55 + 0.45 * sin(t * 5.0 + hash(id) * 20.0);   // flicker
  return spark;
}

void main(){
  vec2 uv = vUv;
  float glow = exp(-uv.y * 2.4) * 0.6;                 // warm rise from the bottom edge
  vec2 e_uv = vec2(uv.x * uAspect, uv.y - uScroll * 0.05);
  float e = embers(e_uv, uTime, 9.0, 1.0);
  e += embers(e_uv * 1.5, uTime * 1.25, 13.0, 5.0) * 0.7;
  vec3 col = uEmber * (glow * 0.5 + e * 1.7);
  float a = clamp(glow * 0.55 + e, 0.0, 1.0);
  gl_FragColor = vec4(col, a * 0.9);
}
`;

export function EmberDuskBackdrop({ className = "" }: { className?: string }) {
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
        uEmber: { value: EMBER },
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
