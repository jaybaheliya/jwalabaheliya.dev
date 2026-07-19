"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SEQUENCE = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export function Konami() {
  const [crt, setCrt] = useState(false);

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQUENCE[idx]) {
        idx++;
        if (idx === SEQUENCE.length) {
          idx = 0;
          setCrt((c) => {
            const next = !c;
            toast(next ? "🕹️ CRT mode engaged" : "CRT mode off", {
              description: next ? "You found the easter egg." : undefined,
            });
            return next;
          });
        }
      } else {
        idx = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("crt", crt);
    return () => document.documentElement.classList.remove("crt");
  }, [crt]);

  if (!crt) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] mix-blend-overlay"
      style={{
        background:
          "repeating-linear-gradient(0deg, rgba(0,255,140,0.06) 0px, rgba(0,255,140,0.06) 1px, transparent 1px, transparent 3px)",
      }}
    />
  );
}