"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Torus, Program, Mesh, Vec2 } from "ogl";

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
  vec3 p = position;
  p += normal * sin(uTime * 1.2 + position.x * 3.0 + position.y * 2.0) * 0.03;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
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
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.4);
  vec3 base = uRim * 0.11;
  vec3 rim = uRim;
  vec3 col = mix(base, rim, fres);
  col += rim * 0.05 * sin(uTime * 2.0 + vNormal.y * 9.0);
  gl_FragColor = vec4(col, 0.92);
}
`;

export function WebGLObject({
  className = "",
  rim = [0.56, 0.83, 0.62],
  dist = 6,
}: {
  className?: string;
  rim?: [number, number, number];
  dist?: number;
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

    const camera = new Camera(gl, { fov: 32 });
    camera.position.set(0, 0, dist);
    const scene = new Transform();
    const geometry = new Torus(gl, { radius: 1.25, tube: 0.46, radialSegments: 48, tubularSegments: 160 });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uRim: { value: rim } },
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
    const start = performance.now();
    function frame(now: number) {
      const t = (now - start) / 1000;
      program.uniforms.uTime.value = t;
      mouse.x += (mTarget.x - mouse.x) * 0.05;
      mouse.y += (mTarget.y - mouse.y) * 0.05;
      const scroll = window.scrollY || 0;
      mesh.rotation.x = t * 0.15 + mouse.y * 0.6 + scroll * 0.0015;
      mesh.rotation.y = t * 0.22 + mouse.x * 0.8 + scroll * 0.0022;
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
