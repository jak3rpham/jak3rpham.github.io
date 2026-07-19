"use client";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Minimal custom cursor: a single small ring that follows the pointer directly.
 *
 * Deliberately cheap. No springs, no trailing dot, no mix-blend-difference (all of which the
 * previous version paid for on every frame). One rAF-batched transform per move, and hover
 * state is a class toggled on the DOM node, so React never re-renders on mouse movement.
 */
export function CursorFollower() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    if (!wrap.current) return;
    const el: HTMLDivElement = wrap.current;

    document.documentElement.classList.add("cursor-hidden");
    let raf = 0;
    let x = -100;
    let y = -100;

    function apply() {
      raf = 0;
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
    function move(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
      const t = e.target as HTMLElement | null;
      el.classList.toggle("is-hover", Boolean(t?.closest("a, button, [data-cursor]")));
    }
    const dn = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);
    return () => {
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <div ref={wrap} aria-hidden className="cursor-ring pointer-events-none fixed left-0 top-0 z-[300]">
      <span />
    </div>
  );
}
