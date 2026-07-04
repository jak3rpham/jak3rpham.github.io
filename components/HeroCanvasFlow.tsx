"use client";
import { useEffect, useRef } from "react";

const LINES = 28;

export function HeroCanvasFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let t = 0;
    let visible = true;
    let raf = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = hero!.clientWidth;
      height = hero!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < LINES; i++) {
        const f = i / (LINES - 1);
        const yBase = height * f;
        ctx!.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y =
            yBase +
            Math.sin(x * 0.0042 + t + i * 0.55) * 26 * Math.sin(t * 0.25 + i * 0.3) +
            Math.cos(x * 0.0021 - t * 0.6 + i) * 15;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${Math.round(150 - 58 * f)},${Math.round(206 - 44 * f)},${Math.round(150 - 52 * f)},0.2)`;
        ctx!.lineWidth = 1.1;
        ctx!.stroke();
      }
      t += 0.01;
      if (!reduceMotion && visible) raf = requestAnimationFrame(frame);
    }
    if (!reduceMotion) raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(
      ([entry]) => {
        const was = visible;
        visible = entry.isIntersecting && !document.hidden;
        if (visible && !was && !reduceMotion) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(hero);

    function onVisibilityChange() {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was && !reduceMotion) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}
