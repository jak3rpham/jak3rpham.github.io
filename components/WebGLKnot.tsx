"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Geometry, Program, Mesh, Vec2 } from "ogl";

/**
 * A (2,3) torus knot (trefoil) rebuilt as a swept tube with green fresnel rim
 * light on a transparent background — the homepage hero's fresnel showpiece,
 * a sibling of WebGLObject / WebGLGate. Rotates slowly, reacting to scroll +
 * cursor. Uses a rotation-minimising (parallel-transport) frame so the tube
 * doesn't pinch or twist.
 */
function torusKnotGeometry(
  gl: Renderer["gl"],
  { tube = 0.34, steps = 260, ring = 18, p = 2, q = 3, scale = 0.62 } = {}
) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = Math.cos(q * t) + 2;
    pts.push([scale * r * Math.cos(p * t), scale * r * Math.sin(p * t), scale * -Math.sin(q * t)]);
  }
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const norm = (a: number[]) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // tangents (central difference, wrapped)
  const T = pts.map((_, i) => norm(sub(pts[(i + 1) % steps], pts[(i - 1 + steps) % steps])));

  // parallel-transport a normal along the curve
  const N: number[][] = [];
  let ref: number[] = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  N[0] = norm(cross(ref, T[0]));
  for (let i = 1; i < steps; i++) {
    const axis = cross(T[i - 1], T[i]);
    const al = Math.hypot(axis[0], axis[1], axis[2]);
    let n = N[i - 1];
    if (al > 1e-6) {
      const a = norm(axis);
      const ang = Math.acos(Math.max(-1, Math.min(1, dot(T[i - 1], T[i]))));
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      // rotate N around axis a by ang (Rodrigues)
      n = [
        n[0] * c + cross(a, n)[0] * s + a[0] * dot(a, n) * (1 - c),
        n[1] * c + cross(a, n)[1] * s + a[1] * dot(a, n) * (1 - c),
        n[2] * c + cross(a, n)[2] * s + a[2] * dot(a, n) * (1 - c),
      ];
    }
    N[i] = norm(n);
  }

  const position: number[] = [];
  const normal: number[] = [];
  for (let i = 0; i < steps; i++) {
    const B = cross(T[i], N[i]);
    for (let j = 0; j < ring; j++) {
      const a = (j / ring) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const off = [N[i][0] * ca + B[0] * sa, N[i][1] * ca + B[1] * sa, N[i][2] * ca + B[2] * sa];
      position.push(pts[i][0] + tube * off[0], pts[i][1] + tube * off[1], pts[i][2] + tube * off[2]);
      normal.push(off[0], off[1], off[2]);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < steps; i++) {
    const ni = (i + 1) % steps;
    for (let j = 0; j < ring; j++) {
      const nj = (j + 1) % ring;
      const a = i * ring + j;
      const b = ni * ring + j;
      const c = ni * ring + nj;
      const d = i * ring + nj;
      index.push(a, b, d, b, c, d);
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(position) },
    normal: { size: 3, data: new Float32Array(normal) },
    index: { data: new Uint16Array(index) },
  });
}

const VERT = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 pos = position;
  pos += normal * sin(uTime * 1.1 + position.x * 2.4 + position.z * 2.0) * 0.02;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
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
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.3);
  vec3 base = vec3(0.05, 0.085, 0.062);
  vec3 rim = vec3(0.56, 0.83, 0.62);
  vec3 col = mix(base, rim, fres);
  col += rim * 0.06 * sin(uTime * 2.0 + vNormal.y * 8.0);
  gl_FragColor = vec4(col, 0.92);
}
`;

export function WebGLKnot({ className = "" }: { className?: string }) {
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

    const camera = new Camera(gl, { fov: 32 });
    camera.position.set(0, 0, 7);
    const scene = new Transform();
    const geometry = torusKnotGeometry(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      cullFace: false,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

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
      mesh.rotation.x = t * 0.12 + mouse.y * 0.5 + scroll * 0.0012;
      mesh.rotation.y = t * 0.2 + mouse.x * 0.7 + scroll * 0.0018;
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
