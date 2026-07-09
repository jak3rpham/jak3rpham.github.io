"use client";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Sphere, Program, Mesh, Vec2 } from "ogl";

/**
 * The homepage hero showpiece: a high-resolution sphere whose surface flows and
 * ridges via animated fbm simplex noise (a living, molten fresnel orb). Surface
 * normals are rebuilt per-vertex by finite differences so the green rim light
 * stays correct as it morphs. Slowly rotates, reacts to cursor + scroll.
 */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 nrm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= nrm.x; p1 *= nrm.y; p2 *= nrm.z; p3 *= nrm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
float fbm(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<4;i++){ s+=a*snoise(p); p*=2.02; a*=0.5; } return s; }
`;

const VERT = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uRadius;
uniform float uAmp;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${NOISE}
float disp(vec3 dir){ return fbm(dir * uFreq + vec3(0.0, uTime * 0.18, uTime * 0.10)); }
vec3 surf(vec3 dir){ return dir * (uRadius + uAmp * disp(dir)); }
void main() {
  vec3 dir = normalize(position);
  vec3 up = abs(dir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(up, dir));
  vec3 t2 = cross(dir, t1);
  float e = 0.02;
  vec3 P  = surf(dir);
  vec3 Pa = surf(normalize(dir + t1 * e));
  vec3 Pb = surf(normalize(dir + t2 * e));
  vec3 N = normalize(cross(Pa - P, Pb - P));
  if (dot(N, dir) < 0.0) N = -N;
  vec4 mv = modelViewMatrix * vec4(P, 1.0);
  vNormal = normalize(normalMatrix * N);
  vView = normalize(-mv.xyz);
  vDisp = disp(dir);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
uniform float uTime;
uniform vec3 uRim;
uniform vec3 uDeep;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
  vec3 base = uDeep * 0.35;
  vec3 rim  = uRim;
  vec3 deep = uDeep;
  // ridges glow where the surface bulges outward
  vec3 col = mix(base, deep, smoothstep(-0.6, 0.8, vDisp));
  col = mix(col, rim, fres);
  col += rim * 0.10 * pow(fres, 3.0);
  col += rim * 0.05 * sin(uTime * 1.6 + vDisp * 4.0);
  gl_FragColor = vec4(col, 0.94);
}
`;

export function WebGLOrb({
  className = "",
  rim = [0.56, 0.83, 0.62],
  deep = [0.1, 0.2, 0.13],
  dist = 4.7,
  radius = 1.32,
  amp = 0.42,
}: {
  className?: string;
  rim?: [number, number, number];
  deep?: [number, number, number];
  dist?: number;
  radius?: number;
  amp?: number;
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

    const camera = new Camera(gl, { fov: 34 });
    camera.position.set(0, 0, dist);
    const scene = new Transform();
    const geometry = new Sphere(gl, { radius: 1, widthSegments: 128, heightSegments: 96 });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRadius: { value: radius },
        uAmp: { value: amp },
        uFreq: { value: 1.6 },
        uRim: { value: rim },
        uDeep: { value: deep },
      },
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
      mesh.rotation.y = t * 0.12 + mouse.x * 0.6 + scroll * 0.0015;
      mesh.rotation.x = Math.sin(t * 0.18) * 0.06 + mouse.y * 0.35;
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
