"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";

/**
 * A drifting field of small faceted fresnel crystals (shards) on a transparent
 * background — a low-key ambient 3D backdrop for a section. Shards bob and
 * tumble independently. One WebGL context, many meshes sharing one geometry.
 */
function icosa(scale = 1) {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [(v[0] / l) * scale, (v[1] / l) * scale, (v[2] / l) * scale] as const;
  });
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const position: number[] = [];
  const normal: number[] = [];
  for (const [a, b, c] of faces) {
    const va = raw[a], vb = raw[b], vc = raw[c];
    const ux = vb[0] - va[0], uy = vb[1] - va[1], uz = vb[2] - va[2];
    const wx = vc[0] - va[0], wy = vc[1] - va[1], wz = vc[2] - va[2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    for (const v of [va, vb, vc]) {
      position.push(v[0], v[1], v[2]);
      normal.push(nx, ny, nz);
    }
  }
  return { position: new Float32Array(position), normal: new Float32Array(normal) };
}

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
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
  float facet = 0.5 + 0.5 * dot(normalize(vNormal), vec3(0.35, 0.75, 0.55));
  vec3 base = mix(vec3(0.03, 0.05, 0.04), vec3(0.06, 0.11, 0.08), facet);
  vec3 rim = vec3(0.56, 0.83, 0.62);
  vec3 col = mix(base, rim, fres);
  gl_FragColor = vec4(col, 0.85);
}
`;

export function WebGLShardField({ className = "", count = 9 }: { className?: string; count?: number }) {
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

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 7);
    const scene = new Transform();
    const data = icosa(1);
    const geometry = new Geometry(gl, {
      position: { size: 3, data: data.position },
      normal: { size: 3, data: data.normal },
    });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {},
      transparent: true,
      cullFace: false,
    });

    const shards = Array.from({ length: count }, (_, i) => {
      const mesh = new Mesh(gl, { geometry, program });
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const s = rnd(0.22, 0.6);
      mesh.scale.set(s, s, s);
      mesh.position.set(rnd(-3.6, 3.6), rnd(-2.4, 2.4), rnd(-2.5, 1.2));
      mesh.setParent(scene);
      return {
        mesh,
        baseY: mesh.position.y,
        rx: rnd(0.05, 0.25) * (Math.random() < 0.5 ? -1 : 1),
        ry: rnd(0.05, 0.25) * (Math.random() < 0.5 ? -1 : 1),
        bob: rnd(0.1, 0.35),
        spd: rnd(0.2, 0.6),
        ph: rnd(0, Math.PI * 2),
      };
    });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      const scroll = window.scrollY || 0;
      for (const sh of shards) {
        sh.mesh.rotation.x = t * sh.rx + sh.ph;
        sh.mesh.rotation.y = t * sh.ry;
        sh.mesh.position.y = sh.baseY + Math.sin(t * sh.spd + sh.ph) * sh.bob;
      }
      scene.rotation.y = scroll * 0.0004;
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
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, [count]);

  return <div ref={mountRef} aria-hidden className={className} />;
}
