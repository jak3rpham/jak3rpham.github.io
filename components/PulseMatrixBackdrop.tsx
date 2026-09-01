"use client";
import { useEffect, useRef } from "react";

export function PulseMatrixBackdrop({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;
    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "rgba(255, 107, 75, ",   // Coral Orange
      "rgba(2, 132, 199, ",    // Sky Blue
      "rgba(5, 150, 105, ",    // Emerald Green
      "rgba(217, 119, 6, ",    // Amber Gold
    ];

    const nodes = Array.from({ length: 36 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.35 + 0.15,
    }));

    let raf = 0;
    let visible = true;
    let scrollY = 0;
    let targetScroll = 0;

    function onScroll() {
      targetScroll = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function render(time: number) {
      scrollY += (targetScroll - scrollY) * 0.08;
      ctx!.clearRect(0, 0, w, h);

      const t = time * 0.001;

      // Warm radial gradients in light theme
      const grad1 = ctx!.createRadialGradient(w * 0.85, h * 0.15 - scrollY * 0.1, 0, w * 0.85, h * 0.15 - scrollY * 0.1, w * 0.5);
      grad1.addColorStop(0, "rgba(255, 107, 75, 0.09)");
      grad1.addColorStop(1, "transparent");
      ctx!.fillStyle = grad1;
      ctx!.fillRect(0, 0, w, h);

      const grad2 = ctx!.createRadialGradient(w * 0.15, h * 0.45 - scrollY * 0.12, 0, w * 0.15, h * 0.45 - scrollY * 0.12, w * 0.5);
      grad2.addColorStop(0, "rgba(2, 132, 199, 0.07)");
      grad2.addColorStop(1, "transparent");
      ctx!.fillStyle = grad2;
      ctx!.fillRect(0, 0, w, h);

      const grad3 = ctx!.createRadialGradient(w * 0.5, h * 0.8 - scrollY * 0.15, 0, w * 0.5, h * 0.8 - scrollY * 0.15, w * 0.45);
      grad3.addColorStop(0, "rgba(245, 158, 11, 0.06)");
      grad3.addColorStop(1, "transparent");
      ctx!.fillStyle = grad3;
      ctx!.fillRect(0, 0, w, h);

      // Subtle light grid lines
      const gridSize = 72;
      ctx!.strokeStyle = "rgba(255, 107, 75, 0.035)";
      ctx!.lineWidth = 1;

      const yOffset = (-scrollY * 0.15) % gridSize;
      for (let y = yOffset; y < h; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }
      for (let x = 0; x < w; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }

      // Draw floating nodes & connecting telemetry lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = w;
        if (n.x > w) n.x = 0;
        if (n.y < 0) n.y = h;
        if (n.y > h) n.y = 0;

        const pulse = n.alpha * (0.7 + 0.3 * Math.sin(t * 2 + i));
        ctx!.fillStyle = `${n.color}${pulse})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx!.strokeStyle = `rgba(255, 107, 75, ${(1 - dist / 130) * 0.08})`;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(n.x, n.y);
            ctx!.lineTo(n2.x, n2.y);
            ctx!.stroke();
          }
        }
      }

      if (visible) raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) raf = requestAnimationFrame(render);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
