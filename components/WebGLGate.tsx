"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Box, Program, Mesh, Vec2 } from "ogl";

/**
 * "The Gate at Dawn" — a Vietnamese-style stone gate (rectangular pillars, a
 * double horizontal beam and a flat capstone; deliberately NOT a curved Japanese
 * torii) rebuilt as real 3D geometry with green fresnel rim light on a
 * transparent background. It sways to reveal depth (architectural, front-facing)
 * rather than spinning. The dark-fantasy hero object for BÓNG VESPERA.
 */

// each part is a unit box scaled + positioned (share one geometry)
type Part = { sx: number; sy: number; sz: number; x: number; y: number; z?: number };
const PARTS: Part[] = [
  { sx: 0.5, sy: 3.2, sz: 0.5, x: -1.65, y: 0 }, // left pillar
  { sx: 0.5, sy: 3.2, sz: 0.5, x: 1.65, y: 0 }, // right pillar
  { sx: 0.32, sy: 3.0, sz: 0.32, x: -1.65, y: 0.05, z: 0.16 }, // left pillar front rib
  { sx: 0.32, sy: 3.0, sz: 0.32, x: 1.65, y: 0.05, z: 0.16 }, // right pillar front rib
  { sx: 4.0, sy: 0.4, sz: 0.6, x: 0, y: 1.15 }, // lower beam
  { sx: 4.6, sy: 0.62, sz: 0.64, x: 0, y: 1.9 }, // main lintel
  { sx: 5.2, sy: 0.3, sz: 0.98, x: 0, y: 2.32 }, // flat capstone (roof)
  { sx: 1.0, sy: 0.44, sz: 0.5, x: 0, y: 2.68 }, // center finial
  { sx: 0.34, sy: 0.9, sz: 0.34, x: 0, y: 0.55 }, // threshold marker post
];

const VERT = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
uniform float uTime;
uniform vec3 uRim;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.3);
  // stone-ish faceted base varying with facing direction
  float facet = 0.5 + 0.5 * dot(normalize(vNormal), vec3(0.3, 0.8, 0.5));
  vec3 base = mix(vec3(0.03, 0.05, 0.04), vec3(0.06, 0.11, 0.08), facet);
  vec3 rim = uRim;
  vec3 col = mix(base, rim, fres);
  col += rim * 0.05 * sin(uTime * 1.5 + vNormal.y * 6.0);
  gl_FragColor = vec4(col, 0.92);
}
`;

export function WebGLGate({
  className = "",
  rim = [0.56, 0.83, 0.62],
}: {
  className?: string;
  rim?: [number, number, number];
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, antialias: true });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const camera = new Camera(gl, { fov: 30 });
    camera.position.set(0, 0, 9.6);
    const scene = new Transform();
    const root = new Transform();
    root.position.y = -0.55;
    root.setParent(scene);

    const geometry = new Box(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uRim: { value: rim } },
      transparent: true,
      cullFace: false,
    });
    for (const p of PARTS) {
      const mesh = new Mesh(gl, { geometry, program });
      mesh.scale.set(p.sx, p.sy, p.sz);
      mesh.position.set(p.x, p.y, p.z ?? 0);
      mesh.setParent(root);
    }

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    }
    resize();
    window.addEventListener("resize", resize);

    const mouse = new Vec2(0, 0);
    const mTarget = new Vec2(0, 0);
    function onMove(e: MouseEvent) {
      mTarget.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      program.uniforms.uTime.value = t;
      mouse.x += (mTarget.x - mouse.x) * 0.05;
      mouse.y += (mTarget.y - mouse.y) * 0.05;
      const scroll = window.scrollY || 0;
      // sway to reveal depth, keep mostly front-facing (architectural)
      root.rotation.y = Math.sin(t * 0.32) * 0.5 + mouse.x * 0.5 + scroll * 0.0012;
      root.rotation.x = Math.sin(t * 0.24) * 0.05 + mouse.y * 0.22 + scroll * 0.0005;
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
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className={className} />;
}
