"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
varying vec2 vUv;

vec2 hash(vec2 p){ p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3))); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(dot(hash(i+vec2(0.0,0.0)), f-vec2(0.0,0.0)), dot(hash(i+vec2(1.0,0.0)), f-vec2(1.0,0.0)), u.x),
             mix(dot(hash(i+vec2(0.0,1.0)), f-vec2(0.0,1.0)), dot(hash(i+vec2(1.0,1.0)), f-vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uResolution.x/uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * asp;
  float t = uTime * 0.05;
  vec2 m = (uMouse - 0.5) * asp;

  vec2 q = vec2(fbm(p*1.5 + t), fbm(p*1.5 + vec2(3.2,1.7) - t));
  float f = fbm(p*1.8 + q*1.2 + m*0.25);
  f = smoothstep(-0.4, 0.75, f);

  vec3 ink   = vec3(0.050, 0.060, 0.050);
  vec3 deep  = vec3(0.090, 0.210, 0.130);
  vec3 green = vec3(0.560, 0.830, 0.620);

  vec3 col = mix(ink, deep, f);
  col = mix(col, green, pow(f, 3.0) * 0.45);

  float d = length(p - m);
  col += green * 0.10 * exp(-d * 2.8);

  col *= 1.0 - 0.45 * length(uv - 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function HeroShader() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });
    } catch {
      return; // no WebGL: Hero's CSS gradient remains as fallback
    }
    const gl = renderer.gl;
    gl.clearColor(0.05, 0.06, 0.05, 1);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.5) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    const target = new Vec2(0.5, 0.5);
    function onMove(e: MouseEvent) {
      target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    let visible = true;
    const start = performance.now();
    function frame(now: number) {
      // ease mouse toward target for a soft trail
      const m = program.uniforms.uMouse.value as Vec2;
      m.x += (target.x - m.x) * 0.05;
      m.y += (target.y - m.y) * 0.05;
      program.uniforms.uTime.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function onVis() {
      visible = !document.hidden;
      if (visible) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className="absolute inset-0 z-0" />;
}
