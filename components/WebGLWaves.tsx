"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh } from "ogl";

/**
 * Full-bleed animated 3D backdrop: a large ground plane whose vertices roll in
 * layered sine waves (mist / undulating hills), lit with green fresnel rim so
 * the far grazing edge glows into a horizon, then fogged into the site's ink so
 * the plane has no visible border. Self-animating; reacts to cursor + scroll.
 * The homepage hero background (replaces the flat 2D shader).
 */
const VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
void main() {
  vec2 p = position.xy;
  float t = uTime;
  float e = 0.0;
  vec2 g = vec2(0.0);
  { vec2 k = vec2(0.35, 0.0);  float a = 0.55; float ph = dot(k, p) + t * 0.60; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.0, 0.32);  float a = 0.45; float ph = dot(k, p) + t * 0.50; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.22, 0.26); float a = 0.40; float ph = dot(k, p) - t * 0.40; e += a * sin(ph); g += a * cos(ph) * k; }
  { vec2 k = vec2(0.50, -0.34);float a = 0.20; float ph = dot(k, p) + t * 0.90; e += a * sin(ph); g += a * cos(ph) * k; }
  vec3 dpos = vec3(position.xy, e);
  vec3 localN = normalize(vec3(-g, 1.0));
  vec4 mv = modelViewMatrix * vec4(dpos, 1.0);
  vNormal = normalize(normalMatrix * localN);
  vView = normalize(-mv.xyz);
  vElev = e;
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vElev;
varying float vDist;
uniform float uTime;
uniform vec3 uRim;
void main() {
  vec3 ink = vec3(0.051, 0.059, 0.051);
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 3.0);
  vec3 base = uRim * 0.045;
  vec3 rim = uRim;
  vec3 col = mix(base, rim, fres * 0.92);
  // crest glow on the wave tops
  col += rim * 0.14 * smoothstep(0.15, 0.95, vElev * 0.5 + 0.5);
  col += rim * 0.04 * sin(uTime * 1.4 + vElev * 3.0);
  // fog the far field into the page ink so the plane edge is invisible
  float fog = smoothstep(7.0, 30.0, vDist);
  col = mix(col, ink, fog);
  float alpha = (1.0 - fog) * 0.96;
  gl_FragColor = vec4(col, alpha);
}
`;

export function WebGLWaves({
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

    const camera = new Camera(gl, { fov: 52 });
    camera.position.set(0, 3.0, 7);
    camera.lookAt([0, -2.0, -16]);

    const scene = new Transform();
    const geometry = new Plane(gl, { width: 72, height: 72, widthSegments: 180, heightSegments: 180 });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uRim: { value: rim } },
      transparent: true,
      cullFace: false,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -1.4, -8);
    mesh.setParent(scene);

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    }
    resize();
    window.addEventListener("resize", resize);

    let mx = 0;
    let mxTarget = 0;
    function onMove(e: MouseEvent) {
      mxTarget = e.clientX / window.innerWidth - 0.5;
    }
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      const t = (now - startT) / 1000;
      program.uniforms.uTime.value = t;
      mx += (mxTarget - mx) * 0.04;
      const scroll = window.scrollY || 0;
      // slow drift + gentle parallax from cursor / scroll
      scene.rotation.y = mx * 0.18;
      scene.position.z = -scroll * 0.004;
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
