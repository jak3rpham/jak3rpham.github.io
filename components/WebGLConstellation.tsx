"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";

/**
 * A living network: glowing nodes drifting in 3D with lines drawn between the
 * pairs that started close. Green, transparent, slowly rotating — an ambient
 * "systems / growth" motif. New, not reused. One WebGL context.
 */
const LINE_VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const LINE_FRAG = /* glsl */ `
precision highp float;
uniform float uOpacity;
void main() { gl_FragColor = vec4(0.56, 0.83, 0.62, uOpacity); }
`;
const PT_VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uSize;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (4.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const PT_FRAG = /* glsl */ `
precision highp float;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(0.62, 0.88, 0.68, a);
}
`;

export function WebGLConstellation({ className = "", count = 46 }: { className?: string; count?: number }) {
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

    const camera = new Camera(gl, { fov: 38 });
    camera.position.set(0, 0, 7.5);
    const scene = new Transform();

    const BX = 4.2, BY = 2.6, BZ = 2.0;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const nodes = Array.from({ length: count }, () => ({
      p: [rnd(-BX, BX), rnd(-BY, BY), rnd(-BZ, BZ)],
      v: [rnd(-0.15, 0.15), rnd(-0.12, 0.12), rnd(-0.1, 0.1)],
    }));

    // fixed edges: pairs that begin within threshold
    const edges: [number, number][] = [];
    const TH = 1.9;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = nodes[i].p[0] - nodes[j].p[0];
        const dy = nodes[i].p[1] - nodes[j].p[1];
        const dz = nodes[i].p[2] - nodes[j].p[2];
        if (dx * dx + dy * dy + dz * dz < TH * TH) edges.push([i, j]);
      }
    }

    const ptData = new Float32Array(count * 3);
    const lineData = new Float32Array(edges.length * 6);
    const ptGeo = new Geometry(gl, { position: { size: 3, data: ptData } });
    const lineGeo = new Geometry(gl, { position: { size: 3, data: lineData } });
    const ptProg = new Program(gl, { vertex: PT_VERT, fragment: PT_FRAG, uniforms: { uSize: { value: 26 } }, transparent: true, depthTest: false });
    const lineProg = new Program(gl, { vertex: LINE_VERT, fragment: LINE_FRAG, uniforms: { uOpacity: { value: 0.16 } }, transparent: true, depthTest: false });
    const points = new Mesh(gl, { geometry: ptGeo, program: ptProg, mode: gl.POINTS });
    const lines = new Mesh(gl, { geometry: lineGeo, program: lineProg, mode: gl.LINES });
    points.setParent(scene);
    lines.setParent(scene);

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
    let last = performance.now();
    const startT = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - startT) / 1000;
      for (const n of nodes) {
        for (let k = 0; k < 3; k++) {
          n.p[k] += n.v[k] * dt;
          const bound = k === 0 ? BX : k === 1 ? BY : BZ;
          if (n.p[k] > bound || n.p[k] < -bound) n.v[k] *= -1;
        }
      }
      for (let i = 0; i < count; i++) {
        ptData[i * 3] = nodes[i].p[0];
        ptData[i * 3 + 1] = nodes[i].p[1];
        ptData[i * 3 + 2] = nodes[i].p[2];
      }
      for (let e = 0; e < edges.length; e++) {
        const [a, b] = edges[e];
        lineData[e * 6] = nodes[a].p[0];
        lineData[e * 6 + 1] = nodes[a].p[1];
        lineData[e * 6 + 2] = nodes[a].p[2];
        lineData[e * 6 + 3] = nodes[b].p[0];
        lineData[e * 6 + 4] = nodes[b].p[1];
        lineData[e * 6 + 5] = nodes[b].p[2];
      }
      ptGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;
      scene.rotation.y = Math.sin(t * 0.1) * 0.25 + t * 0.03;
      scene.rotation.x = Math.sin(t * 0.08) * 0.08;
      renderer.render({ scene, camera });
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting && !document.hidden;
        if (visible && !was) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    io.observe(mount);
    function onVis() {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
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
