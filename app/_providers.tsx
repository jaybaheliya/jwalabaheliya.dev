"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export function LenisScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const shouldPreventLenis = (node: HTMLElement) => {
      return Boolean(
        node.closest(
          [
            "[data-lenis-prevent]",
            "[data-lenis-prevent-wheel]",
            "[data-radix-scroll-area-viewport]",
            "[data-radix-popper-content-wrapper]",
            "[role='dialog']",
            "[role='listbox']",
            "[cmdk-list]",
          ].join(","),
        ),
      );
    };

    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 1,
      allowNestedScroll: true,
      prevent: shouldPreventLenis,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let raf = 0;
    const tick = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return null;
}
