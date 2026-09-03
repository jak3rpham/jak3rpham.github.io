"use client";
import { useEffect, useRef, useState } from "react";
import { Renderer, Camera, Transform, Cylinder, Sphere, Program, Mesh, Geometry, Vec2 } from "ogl";

const VERT = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vN;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vN;
varying vec3 vView;
uniform vec3 uTint;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vN), normalize(vView)), 0.0), 2.1);
  // The body reads AS the tint and the fresnel only lifts the edges, rather than the tint
  // being a ceiling the body sits well under. That matters now the mark is a specific brand
  // colour: what is passed in is what shows, so #14796C renders as #14796C.
  vec3 col = uTint * (0.88 + 0.26 * fres);
  col += uTint * 0.12 * pow(fres, 3.0);
  gl_FragColor = vec4(min(col, 1.0), 1.0);
}
`;

// tube swept along a circular arc (the logo's smile)
function arcGeometry(gl: WebGLRenderingContext, R: number, tube: number, a0: number, a1: number, seg: number, tubeSeg: number) {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const u = a0 + (a1 - a0) * (i / seg);
    const cu = Math.cos(u);
    const su = Math.sin(u);
    for (let j = 0; j <= tubeSeg; j++) {
      const v = (j / tubeSeg) * Math.PI * 2;
      const cv = Math.cos(v);
      const sv = Math.sin(v);
      const nx = cu * cv;
      const ny = su * cv;
      const nz = sv;
      pos.push(R * cu + tube * nx, R * su + tube * ny, tube * nz);
      nor.push(nx, ny, nz);
    }
  }
  const row = tubeSeg + 1;
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < tubeSeg; j++) {
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

export function TerraLogoVector({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 200"
      className={`h-full w-full max-h-[260px] max-w-[320px] select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="terra brand mark"
    >
      <defs>
        <filter id="terra-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#14796C" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#terra-glow)">
        {/* The smile/hill curve */}
        <path
          d="M 44 162 C 90 148, 190 148, 236 162"
          stroke="#14796C"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* 5 pills and dots */}
        {/* Pill 1: x = 70, dot on top */}
        <circle cx="70" cy="74" r="7.5" fill="#A5E03D" />
        <rect x="62.5" y="94" width="15" height="46" rx="7.5" fill="#14796C" />

        {/* Pill 2: x = 105, h = 96 (tallest) */}
        <rect x="97.5" y="50" width="15" height="96" rx="7.5" fill="#14796C" />

        {/* Pill 3: x = 140, h = 78 (2nd tallest) */}
        <rect x="132.5" y="68" width="15" height="78" rx="7.5" fill="#14796C" />

        {/* Pill 4: x = 175, h = 64, blue dot on top */}
        <circle cx="175" cy="50" r="7.5" fill="#2FA8F5" />
        <rect x="167.5" y="72" width="15" height="64" rx="7.5" fill="#14796C" />

        {/* Pill 5: x = 210, h = 46, orange dot below */}
        <rect x="202.5" y="94" width="15" height="46" rx="7.5" fill="#14796C" />
        <circle cx="210" cy="154" r="7.5" fill="#FF8B3D" />
      </g>
    </svg>
  );
}

export function WebGLLogo3D({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

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
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    if (!gl) return;

    try {
      gl.clearColor(0, 0, 0, 0);
      const canvas = gl.canvas as HTMLCanvasElement;
      mount.appendChild(canvas);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 0.6s ease-out";

      const camera = new Camera(gl, { fov: 30 });
      camera.position.set(0, 0, 9.6);
      const root = new Transform();
      root.position.y = -1.0;
      root.scale.x = -1;

      const makeProgram = (tint: [number, number, number]) =>
        new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: { uTint: { value: tint } } });

      const progGreen = makeProgram([0.078, 0.475, 0.424]); // #14796C brand
      const progBanana = makeProgram([0.647, 0.878, 0.239]); // #A5E03D
      const progBlue = makeProgram([0.184, 0.659, 0.961]); // #2FA8F5
      const progOrange = makeProgram([1.0, 0.545, 0.239]); // #FF8B3D

      const r = 0.17;
      const cylGeo = new Cylinder(gl, { radiusTop: r, radiusBottom: r, height: 1, radialSegments: 28 });
      const capGeo = new Sphere(gl, { radius: r, widthSegments: 24, heightSegments: 16 });
      const dotGeo = new Sphere(gl, { radius: r, widthSegments: 32, heightSegments: 24 });

      const baseY = -0.55;
      const frownR = 5.0;
      const frownCy = baseY - frownR + 0.25;
      const hillY = (x: number) => frownCy + Math.sqrt(frownR * frownR - x * x);
      const lift = 0.58;
      const dotGap = 0.52;

      const frownTube = 0.13;
      const frownA0 = Math.PI * 0.4;
      const frownA1 = Math.PI * 0.6;
      const frown = new Mesh(gl, {
        geometry: arcGeometry(gl, frownR, frownTube, frownA0, frownA1, 120, 20),
        program: progGreen,
      });
      frown.position.set(0, frownCy, 0);
      frown.setParent(root);

      const frownCapGeo = new Sphere(gl, { radius: frownTube, widthSegments: 20, heightSegments: 14 });
      for (const a of [frownA0, frownA1]) {
        const cap = new Mesh(gl, { geometry: frownCapGeo, program: progGreen });
        cap.position.set(frownR * Math.cos(a), frownCy + frownR * Math.sin(a), 0);
        cap.setParent(root);
      }

      const bars: { x: number; h: number; top?: Program; bottom?: Program }[] = [
        { x: -1.4, h: 1.1, top: progBanana },
        { x: -0.7, h: 2.3 },
        { x: 0.0, h: 1.85 },
        { x: 0.7, h: 1.5, top: progBlue },
        { x: 1.4, h: 1.1, bottom: progOrange },
      ];
      for (const b of bars) {
        const hill = hillY(b.x);
        const pillBottom = b.bottom ? hill + lift + dotGap : hill + lift;
        const cyl = new Mesh(gl, { geometry: cylGeo, program: progGreen });
        cyl.position.set(b.x, pillBottom + b.h / 2, 0);
        cyl.scale.y = b.h;
        cyl.setParent(root);
        const capTop = new Mesh(gl, { geometry: capGeo, program: progGreen });
        capTop.position.set(b.x, pillBottom + b.h, 0);
        capTop.setParent(root);
        const capBot = new Mesh(gl, { geometry: capGeo, program: progGreen });
        capBot.position.set(b.x, pillBottom, 0);
        capBot.setParent(root);

        if (b.top) {
          const s = new Mesh(gl, { geometry: dotGeo, program: b.top });
          s.position.set(b.x, pillBottom + b.h + dotGap, 0);
          s.setParent(root);
        }
        if (b.bottom) {
          const s = new Mesh(gl, { geometry: dotGeo, program: b.bottom });
          s.position.set(b.x, hill + lift, 0);
          s.setParent(root);
        }
      }

      function resize() {
        if (!mount) return;
        const w = mount.clientWidth || 320;
        const h = mount.clientHeight || 240;
        if (w <= 0 || h <= 0) return;
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
      let firstRender = true;
      const start = performance.now();
      function frame(now: number) {
        const t = (now - start) / 1000;
        mouse.x += (mTarget.x - mouse.x) * 0.05;
        mouse.y += (mTarget.y - mouse.y) * 0.05;
        const scroll = window.scrollY || 0;
        root.rotation.y = Math.sin(t * 0.35) * 0.45 + mouse.x * 0.7 + scroll * 0.0016;
        root.rotation.x = Math.sin(t * 0.5) * 0.1 + mouse.y * 0.4;
        try {
          renderer.render({ scene: root, camera });
          if (firstRender) {
            firstRender = false;
            canvas.style.opacity = "1";
            setReady(true);
          }
        } catch {
          // If render fails, visible fallback remains displayed
          return;
        }
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
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    } catch (err) {
      console.warn("WebGL initialization failed, falling back to SVG brand mark:", err);
    }
  }, []);

  return (
    <div ref={mountRef} aria-hidden className={`relative flex items-center justify-center ${className}`}>
      <div
        className={`flex h-full w-full items-center justify-center transition-opacity duration-700 ${
          ready ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <TerraLogoVector />
      </div>
    </div>
  );
}
