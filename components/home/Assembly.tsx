"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Geometry, Mesh, Program, Renderer, Transform } from "ogl";
import styles from "./Assembly.module.css";

const vertex = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-p.xyz);
  gl_Position = projectionMatrix * p;
}`;

const fragment = `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uColor;
uniform float uMetal;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  vec3 r = reflect(-v, n);
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float key = max(dot(n, normalize(vec3(-0.6, 1.0, 1.7))), 0.0);
  float strip = smoothstep(0.68, 0.78, r.y) * (1.0 - smoothstep(0.86, 0.98, r.y));
  float side = pow(max(dot(r, normalize(vec3(-1.0, 0.3, 0.8))), 0.0), 26.0);
  float lower = smoothstep(-0.16, 0.12, r.y);
  vec3 studio = mix(vec3(0.10, 0.14, 0.11), vec3(0.78, 0.85, 0.77), lower);
  studio = mix(studio, vec3(0.05, 0.07, 0.055), smoothstep(0.22, 0.29, r.y) * (1.0 - smoothstep(0.39, 0.50, r.y)));
  studio += strip * 0.68 + side * 0.55;
  vec3 diffuse = uColor * (0.42 + key * 0.58);
  vec3 color = mix(diffuse, studio * uColor, uMetal);
  color += fresnel * vec3(0.23, 0.29, 0.21);
  color = pow(max(color, vec3(0.0)), vec3(0.88));
  gl_FragColor = vec4(color, 1.0);
}`;

// A rounded square swept with a circular profile. No model or texture downloads.
function makeFrame(gl: Renderer["gl"]) {
  const segments = 160;
  const sides = 16;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const radius = 1.1;
  const tube = 0.17;
  const center = (t: number) => {
    const c = Math.cos(t);
    const s = Math.sin(t);
    return [radius * Math.sign(c) * Math.pow(Math.abs(c), 0.55), radius * Math.sign(s) * Math.pow(Math.abs(s), 0.55)];
  };
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const [x, y] = center(t);
    const before = center(t - 0.001);
    const after = center(t + 0.001);
    const tx = after[0] - before[0];
    const ty = after[1] - before[1];
    const len = Math.hypot(tx, ty);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const nx = (ty / len) * Math.cos(a);
      const ny = (-tx / len) * Math.cos(a);
      const nz = Math.sin(a);
      positions.push(x + nx * tube, y + ny * tube, nz * tube);
      normals.push(nx, ny, nz);
      if (i < segments && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(k, k + 1, k + sides + 1, k + 1, k + sides + 2, k + sides + 1);
      }
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    index: { data: new Uint16Array(indices) },
  });
}

export function Assembly() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controller = useRef<((pause: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 1.5), powerPreference: "low-power" });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.setAttribute("aria-hidden", "true");
    mount.appendChild(gl.canvas);
    const camera = new Camera(gl, { fov: 36 });
    camera.position.set(0, 0, 7.9);
    const scene = new Transform();
    const sculpture = new Transform();
    sculpture.setParent(scene);
    const geometry = makeFrame(gl);
    const colors = [[0.94, 0.98, 0.93], [0.65, 0.83, 0.40], [0.92, 0.96, 0.91]];
    const programs = colors.map((color, i) => new Program(gl, {
      vertex, fragment, cullFace: false,
      uniforms: { uColor: { value: color }, uMetal: { value: i === 1 ? 0.25 : 0.96 } },
    }));
    const meshes = Array.from({ length: 11 }, (_, i) => {
      const program = programs[i % programs.length];
      const mesh = new Mesh(gl, { geometry, program });
      mesh.position.z = i < 3 ? (i - 1) * 0.72 : -1.5 - (i - 3) * 0.6;
      mesh.position.x = i < 3 ? 1.5 : 0;
      mesh.scale.set(i < 3 ? 1.0 : 2.5 + (i - 3) * 0.62);
      mesh.setParent(sculpture);
      return mesh;
    });
    let raf = 0;
    let inView = true;
    let manuallyPaused = false;
    let lost = false;
    let time = 0;
    let previous = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let scroll = 0;
    let rect = mount.getBoundingClientRect();
    let documentTop = rect.top + window.scrollY;

    const canAnimate = () => inView && !document.hidden && !media.matches && !manuallyPaused && !lost;
    const paint = () => {
      currentX += (pointerX - currentX) * 0.045;
      currentY += (pointerY - currentY) * 0.045;
      sculpture.rotation.set(-0.32 + currentY * 0.24, -0.55 + currentX * 0.32 + scroll * 0.23, -0.27);
      meshes.forEach((mesh, i) => {
        mesh.rotation.z = Math.sin(time * 0.23 + i * 0.65) * 0.2 + i * (i < 3 ? 0.52 : 0.12);
        mesh.rotation.y = Math.sin(time * 0.21 + i) * 0.19;
        mesh.position.y = Math.sin(time * 0.4 + i * 0.6) * 0.045;
      });
      renderer.render({ scene, camera });
    };
    const frame = (now: number) => {
      raf = 0;
      if (!canAnimate()) return;
      time += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      paint();
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
      mount.dataset.animating = String(canAnimate());
      if (canAnimate()) raf = requestAnimationFrame(frame);
    };
    const resize = () => {
      rect = mount.getBoundingClientRect();
      documentTop = rect.top + window.scrollY;
      // Measure layout size, not the scroll-scaled screen rectangle. Otherwise a
      // resize while the hero is shrunk leaves an undersized canvas on return.
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height || lost) return;
      renderer.setSize(width, height);
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      camera.perspective({ aspect: width / height });
      paint();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !canAnimate()) return;
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY + window.scrollY - documentTop) / rect.height - 0.5) * 2;
    };
    const leave = () => { pointerX = 0; pointerY = 0; };
    const onScroll = () => {
      scroll = Math.min(window.scrollY / window.innerHeight, 1);
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      sync();
      setReady(false);
    };
    controller.current = (pause) => { manuallyPaused = pause; sync(); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(mount);
    resizeObserver.observe(mount);
    const pointerTarget = window;
    pointerTarget.addEventListener("pointermove", move as EventListener);
    mount.addEventListener("pointerleave", leave);
    gl.canvas.addEventListener("webglcontextlost", onLost);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    resize();
    // Keep the fallback until the browser has had a frame to present the scene.
    const readyFrame = requestAnimationFrame(() => setReady(true));
    sync();
    return () => {
      cancelAnimationFrame(readyFrame);
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      pointerTarget.removeEventListener("pointermove", move as EventListener);
      mount.removeEventListener("pointerleave", leave);
      gl.canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      geometry.remove();
      programs.forEach(program => program.remove());
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
      controller.current = null;
    };
  }, []);

  return (
    <div className={`${styles.assembly} ${styles.immersive}`}>
      <div className={styles.fallback} aria-hidden="true" hidden={ready}>
        <span /><span /><span />
      </div>
      <div ref={mountRef} className={styles.canvas} data-ready={ready} />
      {ready && <button
        type="button"
        className={styles.motionButton}
        aria-label={paused ? "Resume 3D motion" : "Pause 3D motion"}
        aria-pressed={paused}
        onClick={() => { controller.current?.(!paused); setPaused(!paused); }}
      >{paused ? "Play motion ↗" : "Pause motion Ⅱ"}</button>}
    </div>
  );
}
