"use client";
import { useEffect, useRef } from "react";
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
  vec3 base = vec3(0.06, 0.12, 0.085);
  vec3 col = mix(base, uTint, fres);
  col += uTint * 0.12 * pow(fres, 3.0);
  gl_FragColor = vec4(col, 1.0);
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

export function WebGLLogo3D({ className = "" }: { className?: string }) {
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
    const root = new Transform();
    root.position.y = -1.0;
    // mirror the mark side-to-side so the Terra logo reads the correct way round.
    // normalMatrix (inverse-transpose) keeps the fresnel lighting consistent under
    // the negative scale, so no winding/normal artefacts.
    root.scale.x = -1;

    const makeProgram = (tint: [number, number, number]) =>
      new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: { uTint: { value: tint } } });
    const progGreen = makeProgram([0.56, 0.83, 0.62]);
    const progBanana = makeProgram([0.68, 0.87, 0.36]); // "xanh lá chuối" — light yellow-green
    const progBlue = makeProgram([0.42, 0.68, 0.95]);
    const progOrange = makeProgram([0.95, 0.62, 0.3]);

    const r = 0.17;
    const cylGeo = new Cylinder(gl, { radiusTop: r, radiusBottom: r, height: 1, radialSegments: 28 });
    const capGeo = new Sphere(gl, { radius: r, widthSegments: 24, heightSegments: 16 });
    // dots are the SAME width as a pill (radius r), so they read as pill-caps
    const dotGeo = new Sphere(gl, { radius: r, widthSegments: 32, heightSegments: 24 });

    // the frown ("mặt buồn"): a gentle arc that bulges UP in the middle (∩), so
    // the ends dip down. It doubles as a "hill" the pills stand on — each pill's
    // base rides the curve (higher in the middle, lower at the edges).
    const baseY = -0.55;
    const frownR = 5.0;
    const frownCy = baseY - frownR + 0.25; // center of the big circle
    const hillY = (x: number) => frownCy + Math.sqrt(frownR * frownR - x * x); // top of the hill at x
    const lift = 0.58; // pills float above the hill, never touching it
    const dotGap = 0.52; // gap between a pill and its sphere

    const frownTube = 0.13;
    const frownA0 = Math.PI * 0.4;
    const frownA1 = Math.PI * 0.6;
    const frown = new Mesh(gl, {
      geometry: arcGeometry(gl, frownR, frownTube, frownA0, frownA1, 120, 20),
      program: progGreen,
    });
    frown.position.set(0, frownCy, 0);
    frown.setParent(root);

    // round off the two open ends of the frown with little caps
    const frownCapGeo = new Sphere(gl, { radius: frownTube, widthSegments: 20, heightSegments: 14 });
    for (const a of [frownA0, frownA1]) {
      const cap = new Mesh(gl, { geometry: frownCapGeo, program: progGreen });
      cap.position.set(frownR * Math.cos(a), frownCy + frownR * Math.sin(a), 0);
      cap.setParent(root);
    }

    // five pills, left -> right, each riding the hill. `top`/`bottom` optionally
    // place a colored sphere (same width as the pill) above or below it, with a gap.
    //   1: short, banana-green dot on top      2: tallest      3: 2nd tallest
    //   4: medium, blue dot on top             5: short, orange dot BELOW the pill
    const bars: { x: number; h: number; top?: Program; bottom?: Program }[] = [
      { x: -1.4, h: 1.1, top: progBanana },
      { x: -0.7, h: 2.3 },
      { x: 0.0, h: 1.85 },
      { x: 0.7, h: 1.5, top: progBlue },
      { x: 1.4, h: 1.1, bottom: progOrange },
    ];
    for (const b of bars) {
      const hill = hillY(b.x);
      // a bottom sphere sits on the hill; the pill then starts above it
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
      mouse.x += (mTarget.x - mouse.x) * 0.05;
      mouse.y += (mTarget.y - mouse.y) * 0.05;
      const scroll = window.scrollY || 0;
      // sway rather than full spin, so the mark stays readable
      root.rotation.y = Math.sin(t * 0.35) * 0.45 + mouse.x * 0.7 + scroll * 0.0016;
      root.rotation.x = Math.sin(t * 0.5) * 0.1 + mouse.y * 0.4;
      renderer.render({ scene: root, camera });
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
