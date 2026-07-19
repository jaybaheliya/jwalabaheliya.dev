"use client";
import { useEffect } from "react";

/**
 * Lightweight canvas cursor trail — subtle glowing dots that follow the cursor.
 * Auto-disabled on touch / reduced motion. Mount once inside a container with `relative`.
 */
export function CursorTrail() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:5;mix-blend-mode:screen;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const dots: { x: number; y: number; life: number }[] = [];
    const onMove = (e: MouseEvent) => {
      dots.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (dots.length > 40) dots.shift();
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "255,180,0";
    // Try to parse oklch/hex → fallback to warm amber
    const stroke = accent.startsWith("oklch") ? "255,180,60" : "255,180,60";

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.life *= 0.92;
        const r = 8 * d.life;
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 3);
        g.addColorStop(0, `rgba(${stroke},${0.35 * d.life})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      canvas.remove();
    };
  }, []);

  return null;
}