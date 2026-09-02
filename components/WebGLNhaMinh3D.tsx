"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Geometry, Torus, Sphere, Vec2 } from "ogl";

/**
 * 3D WebGL Emblem for Nhà Mình (Healthcare AI).
 * 
 * Features:
 * 1. Parametric 3D solid Heart with dual-lobed curvature and smooth normal computation.
 * 2. Organic diastolic/systolic heartbeat pulsation ("lub-dub" rhythm).
 * 3. Tilted orbiting telemetry halo representing Google Workspace & real-time synchronization.
 * 4. Dual floating satellite nodes (Parent Mode Emerald & Caregiver Sky Blue).
 * 5. Fresnel rim shader with warm coral glow (#FF6B4B), specular highlights, and mouse/scroll reactivity.
 */

const VERT = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uPulse;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

void main() {
  vec3 p = position * (1.0 + uPulse);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vPos = p;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uRim;
uniform float uGlow;

void main() {
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
  
  // Internal warm core gradient
  float yGrad = clamp((vPos.y + 1.2) / 2.4, 0.0, 1.0);
  vec3 core = mix(uColor * 0.75, uColor * 1.15, yGrad);
  
  // Fresnel edge glow + specular rim
  vec3 col = mix(core, uRim, fresnel * 0.85);
  col += uRim * 0.35 * pow(fresnel, 3.5);
  col += uGlow * 0.08 * sin(uTime * 3.0 + vPos.y * 4.0);
  
  gl_FragColor = vec4(col, 0.95);
}
`;

const RING_VERT = /* glsl */ `
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

const RING_FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uTint;

void main() {
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 1.8);
  vec3 col = uTint * (0.6 + 0.4 * fresnel);
  gl_FragColor = vec4(col, 0.85);
}
`;

/**
 * Builds a smooth parametric 3D Heart geometry.
 */
function createHeartGeometry(gl: WebGLRenderingContext, segU = 48, segV = 32) {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const scale = 0.088;

  function evalHeart(u: number, v: number): [number, number, number] {
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const sinV = Math.sin(v);
    const cosV = Math.cos(v);

    const x = sinU * (15 * sinV - 4 * Math.sin(3 * v)) * scale;
    const y = (15 * cosU - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u) + 6.0) * scale;
    const z = sinU * (15 * cosV - 4 * Math.cos(3 * v)) * scale * 0.52;

    return [x, y, z];
  }

  const eps = 0.008;

  for (let i = 0; i <= segU; i++) {
    const u = (i / segU) * Math.PI;
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * Math.PI * 2;

      const [x, y, z] = evalHeart(u, v);
      pos.push(x, y, z);

      // Numerical normal calculation
      const [xu1, yu1, zu1] = evalHeart(u + eps, v);
      const [xu0, yu0, zu0] = evalHeart(u - eps, v);
      const [xv1, yv1, zv1] = evalHeart(u, v + eps);
      const [xv0, yv0, zv0] = evalHeart(u, v - eps);

      const du: [number, number, number] = [xu1 - xu0, yu1 - yu0, zu1 - zu0];
      const dv: [number, number, number] = [xv1 - xv0, yv1 - yv0, zv1 - zv0];

      let nx = du[1] * dv[2] - du[2] * dv[1];
      let ny = du[2] * dv[0] - du[0] * dv[2];
      let nz = du[0] * dv[1] - du[1] * dv[0];

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      nor.push(nx, ny, nz);
    }
  }

  const row = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      const c = (i + 1) * row + j + 1;
      const d = i * row + j + 1;
      idx.push(a, b, d, b, c, d);
    }
  }

  return new Geometry(gl as never, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nor) },
    index: { data: new Uint16Array(idx) },
  });
}

export function WebGLNhaMinh3D({
  className = "",
  color = [1.0, 0.42, 0.29], // #FF6B4B Coral
  rim = [1.0, 0.72, 0.55],   // Warm peach glow
  haloColor = [1.0, 0.62, 0.45],
  dist = 5.8,
}: {
  className?: string;
  color?: [number, number, number];
  rim?: [number, number, number];
  haloColor?: [number, number, number];
  dist?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: true,
        antialias: true,
      });
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
    const heartRoot = new Transform();
    heartRoot.setParent(scene);

    // 1. Central 3D Parametric Heart Mesh
    const heartGeo = createHeartGeometry(gl);
    const heartProgram = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uColor: { value: color },
        uRim: { value: rim },
        uGlow: { value: 1.0 },
      },
      transparent: true,
    });
    const heartMesh = new Mesh(gl, { geometry: heartGeo, program: heartProgram });
    heartMesh.position.set(0, 0.1, 0);
    heartMesh.setParent(heartRoot);

    // 2. Orbiting Telemetry Halo Ring
    const ringGeo = new Torus(gl, { radius: 1.72, tube: 0.028, radialSegments: 20, tubularSegments: 72 });
    const ringProgram = new Program(gl, {
      vertex: RING_VERT,
      fragment: RING_FRAG,
      uniforms: { uTint: { value: haloColor } },
      transparent: true,
    });
    const ringMesh = new Mesh(gl, { geometry: ringGeo, program: ringProgram });
    ringMesh.rotation.x = Math.PI * 0.38;
    ringMesh.rotation.y = Math.PI * 0.12;
    ringMesh.setParent(scene);

    // 3. Orbiting Multi-Modal Satellite Nodes
    // Satellite 1: Parent Mode (Emerald Green)
    const satGeo = new Sphere(gl, { radius: 0.11, widthSegments: 20, heightSegments: 14 });
    const sat1Prog = new Program(gl, {
      vertex: RING_VERT,
      fragment: RING_FRAG,
      uniforms: { uTint: { value: [0.35, 0.88, 0.62] } }, // Emerald #10B981
    });
    const sat1Mesh = new Mesh(gl, { geometry: satGeo, program: sat1Prog });
    sat1Mesh.setParent(scene);

    // Satellite 2: Caregiver Sync (Sky Blue)
    const sat2Prog = new Program(gl, {
      vertex: RING_VERT,
      fragment: RING_FRAG,
      uniforms: { uTint: { value: [0.22, 0.65, 0.95] } }, // Sky Blue #0284C7
    });
    const sat2Mesh = new Mesh(gl, { geometry: satGeo, program: sat2Prog });
    sat2Mesh.setParent(scene);

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

      // Diastolic / Systolic organic heartbeat rhythm
      const beat1 = Math.pow(Math.max(0, Math.sin(t * 3.4)), 18.0) * 0.08;
      const beat2 = Math.pow(Math.max(0, Math.sin(t * 3.4 - 0.38)), 20.0) * 0.05;
      const pulse = beat1 + beat2;

      heartProgram.uniforms.uTime.value = t;
      heartProgram.uniforms.uPulse.value = pulse;

      mouse.x += (mTarget.x - mouse.x) * 0.06;
      mouse.y += (mTarget.y - mouse.y) * 0.06;

      const scroll = window.scrollY || 0;

      // Gentle continuous sway + interactive mouse tilt & scroll parallax
      heartRoot.rotation.y = Math.sin(t * 0.45) * 0.42 + mouse.x * 0.65 + scroll * 0.0014;
      heartRoot.rotation.x = Math.sin(t * 0.35) * 0.12 + mouse.y * 0.38;

      // Halo ring rotation
      ringMesh.rotation.z = t * 0.3;
      ringMesh.rotation.x = Math.PI * 0.38 + mouse.y * 0.2;
      ringMesh.rotation.y = Math.PI * 0.12 + mouse.x * 0.25;

      // Satellites orbital positioning along halo
      const orbitR = 1.72;
      const angle1 = t * 0.8;
      const angle2 = t * 0.8 + Math.PI;

      // Calculate 3D position rotated with the halo plane
      const calcSatPos = (ang: number): [number, number, number] => {
        const lx = orbitR * Math.cos(ang);
        const ly = orbitR * Math.sin(ang);
        // Apply ring tilt rotations (rotX: 0.38PI, rotY: 0.12PI)
        const cosX = Math.cos(ringMesh.rotation.x);
        const sinX = Math.sin(ringMesh.rotation.x);
        const cosY = Math.cos(ringMesh.rotation.y);
        const sinY = Math.sin(ringMesh.rotation.y);

        const y1 = ly * cosX;
        const z1 = -ly * sinX;

        const x2 = lx * cosY + z1 * sinY;
        const z2 = -lx * sinY + z1 * cosY;

        return [x2, y1, z2];
      };

      const [s1x, s1y, s1z] = calcSatPos(angle1);
      sat1Mesh.position.set(s1x, s1y, s1z);

      const [s2x, s2y, s2z] = calcSatPos(angle2);
      sat2Mesh.position.set(s2x, s2y, s2z);

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
  }, [color, rim, haloColor]);

  return <div ref={mountRef} aria-hidden className={className} />;
}
