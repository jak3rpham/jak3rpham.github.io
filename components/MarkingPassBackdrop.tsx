"use client";
import { useEffect, useRef } from "react";
import { Renderer, Triangle, Program, Mesh } from "ogl";

/**
 * The /ielts-studio backdrop: "the marking pass".
 *
 * Two ragged columns of procedural text — dashes on ruled rows, short last lines, the odd
 * blank row for a paragraph break — drifting upward and travelling with scroll. A soft band
 * sweeps down the page, and as it crosses a line the ink warms from sand to forest; a few
 * rows carry an underline that brightens under the band. It is the page being graded, which
 * is what the case study is about.
 *
 * A fullscreen fragment pass, NOT a raymarch: roughly thirty arithmetic ops per pixel with no
 * loops, so it costs about what GridWaveBackdrop's grid costs and needs neither the frame cap
 * nor the video-playback pause the HalftoneCityBackdrop raymarcher required. Same plumbing as
 * the other routes: DPR cap, scroll travel, cursor parallax, pause when offscreen or hidden,
 * reduced-motion bail, context cleanup.
 */

const INK: [number, number, number] = [0.55, 0.52, 0.47]; // sand #8C8578
const MARK: [number, number, number] = [0.56, 0.83, 0.62]; // forest #8FD49E

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uParallax;
uniform vec3 uInk;
uniform vec3 uMark;

float hash(float n){ return fract(sin(n * 78.233) * 43758.5453); }

void main(){
  vec2 st = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float x = st.x * aspect + uParallax;

  // --- ruled rows, drifting up and travelling with scroll -------------------
  const float ROWS = 26.0;
  float y   = st.y * ROWS - uTime * 0.35 - uScroll;
  float row = floor(y);
  float fy  = fract(y);

  float h1 = hash(row);
  float h2 = hash(row + 91.7);

  // every so often a blank row, so the block reads as paragraphs rather than a screen of text
  float blank = step(0.86, hash(row * 0.37 + 4.2));

  // --- two columns with a gutter -------------------------------------------
  // derive the column width from the margins so the right margin always equals the left,
  // at any aspect — hard-coding a width let the second column run off a wide viewport
  float margin = aspect * 0.055;
  float gut    = aspect * 0.09;
  float colW   = (aspect - 2.0 * margin - gut) * 0.5;
  float x1     = margin;
  float x2     = margin + colW + gut;

  float inCol1 = step(x1, x) * step(x, x1 + colW);
  float inCol2 = step(x2, x) * step(x, x2 + colW);
  float col    = max(inCol1, inCol2);

  // position within whichever column we are in, 0..1
  float lx = inCol1 > 0.5 ? (x - x1) / colW : (x - x2) / colW;

  // ragged right edge — a paragraph's last line stops short
  float lineLen = mix(0.55, 1.0, h1);
  float inLine  = step(0.0, lx) * step(lx, lineLen);

  // --- the glyph run --------------------------------------------------------
  float dashes = step(0.36, fract(lx * (26.0 + h2 * 12.0)));
  float band   = 1.0 - smoothstep(0.06, 0.145, abs(fy - 0.5));
  float ink    = dashes * band * inLine * col * (1.0 - blank);

  // --- the marking pass sweeping down --------------------------------------
  float scan = fract(uTime * 0.05);
  float d    = abs(st.y - (1.0 - scan));
  float glow = exp(-d * 16.0);

  // a handful of rows are marked; the underline sits just below the text
  float marked = step(0.78, hash(row + 13.0));
  float under  = (1.0 - smoothstep(0.018, 0.05, abs(fy - 0.23)))
               * inLine * col * marked * (1.0 - blank);

  float a = ink * (0.26 + 0.62 * glow) + under * (0.12 + 0.70 * glow);
  vec3  c = mix(uInk, uMark, clamp(glow * 1.35, 0.0, 1.0));

  // keep it a backdrop: fade top and bottom so it never competes with the copy
  float vig = smoothstep(0.0, 0.30, st.y) * (1.0 - smoothstep(0.70, 1.0, st.y));
  vig = mix(0.5, 1.0, vig);

  gl_FragColor = vec4(c, a * vig * 0.9);
}
`;

export function MarkingPassBackdrop({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // a touch device is usually also a weaker GPU; a fullscreen pass scales with pixels,
    // so the DPR cap is the lever that matters most here
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.75);

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr, alpha: true, antialias: false });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    mount.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uParallax: { value: 0 },
        uInk: { value: INK },
        uMark: { value: MARK },
      },
      transparent: true,
      depthTest: false,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w * dpr, h * dpr];
    }
    resize();
    window.addEventListener("resize", resize);

    let mx = 0;
    let mxTarget = 0;
    function onMove(e: MouseEvent) {
      mxTarget = e.clientX / window.innerWidth - 0.5;
    }
    window.addEventListener("mousemove", onMove);

    let scroll = 0;
    let scrollTarget = 0;
    function onScroll() {
      scrollTarget = (window.scrollY || 0) * 0.004;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let visible = true;
    const startT = performance.now();
    function frame(now: number) {
      scroll += (scrollTarget - scroll) * 0.08;
      mx += (mxTarget - mx) * 0.04;
      program.uniforms.uTime.value = (now - startT) / 1000;
      program.uniforms.uScroll.value = scroll;
      program.uniforms.uParallax.value = mx * 0.06;
      renderer.render({ scene: mesh });
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting && !document.hidden;
        if (visible && !was) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 },
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
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className={className} />;
}
