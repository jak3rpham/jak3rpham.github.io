"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh } from "ogl";

/**
 * The terra backdrop: a clean wireframe grid that ripples gently and flows toward you.
 *
 * A flat ground plane, displaced by a couple of low sine waves, drawn as a glowing green
 * grid on dark — no fill, no noise, no clutter. The lines are the whole image. The grid
 * travels with scroll (a continuous scroll transition, like the other routes) and the
 * lines pack tighter toward the horizon from perspective alone.
 *
 * A displaced plane, NOT a raymarch: the cost lives in the vertex stage, which keeps
 * mobile FPS healthy. Reuses WaveFieldBackdrop's ogl plumbing (camera, DPR cap, scroll
 * travel, cursor parallax, pause-when-offscreen loop, reduced-motion bail).
 */

const RIM: [number, number, number] = [0.56, 0.83, 0.62]; // forest #8FD49E

const VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScroll;   // travels the grid toward the viewer
varying vec2 vGrid;      // world grid coords, for drawing the lines
varying float vDist;
void main(){
  vec2 g = position.xy + vec2(0.0, uScroll);   // grid flows with scroll
  float t = uTime;
  float e = 0.0;
  e += 0.30 * sin(g.x * 0.30 + t * 0.55);
  e += 0.24 * sin(g.y * 0.26 - t * 0.42);
  e += 0.16 * sin((g.x + g.y) * 0.19 + t * 0.33);
  vGrid = g;
  vec4 mv = modelViewMatrix * vec4(position.xy, e, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vGrid;
varying float vDist;
uniform vec3 uRim;
uniform float uTime;

// distance to the nearest grid line, no derivatives (lines simply pack toward the
// horizon from perspective — clean and cheap).
float gridLine(vec2 coord, float width){
  vec2 d = abs(fract(coord) - 0.5);
  float l = 0.5 - max(d.x, d.y);   // 0 at a line, grows between lines
  return smoothstep(width, 0.0, l);
}

void main(){
  float line = gridLine(vGrid * 0.5, 0.045);   // one line every 2 world units
  float pulse = 0.85 + 0.15 * sin(uTime * 0.6);
  float fog = smoothstep(4.0, 26.0, vDist);
  float a = line * (1.0 - fog);
  vec3 col = uRim * (0.55 + 0.45 * line) * pulse;
  gl_FragColor = vec4(col, a * 0.9);
}
`;

export function GridWaveBackdrop({ className = "" }: { className?: string }) {
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
    const geometry = new Plane(gl, { width: 80, height: 80, widthSegments: 200, heightSegments: 200 });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uRim: { value: RIM },
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
    function onScroll() { scrollTarget = (window.scrollY || 0) * 0.006; }
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
