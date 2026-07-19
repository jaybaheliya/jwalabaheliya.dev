"use client";
import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Matrix-style scramble reveal. Runs once on mount and on hover.
 */
export function TextScramble({
  text,
  className,
  as: Tag = "span",
  duration = 900,
}: {
  text: string;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  duration?: number;
}) {
  const [display, setDisplay] = useState(text);
  const raf = useRef(0);
  const running = useRef(false);

  const scramble = () => {
    if (running.current) return;
    running.current = true;
    const start = performance.now();
    const chars = text.split("");
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const out = chars
        .map((c, i) => {
          if (c === " ") return " ";
          const revealAt = i / chars.length;
          if (p >= revealAt + 0.15) return c;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setDisplay(out);
      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
        running.current = false;
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scramble();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const Comp = Tag as any;
  return (
    <Comp className={className} onMouseEnter={scramble}>
      {display}
    </Comp>
  );
}