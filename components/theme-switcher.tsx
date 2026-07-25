"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "jb-color-mode";
type Mode = "light" | "dark";

export function applyMode(mode: Mode) {
  const html = document.documentElement;
  html.classList.toggle("light", mode === "light");
  html.classList.remove("dark");
  try { localStorage.setItem(KEY, mode); } catch {}
}

export function getSavedMode(): Mode {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const m = getSavedMode();
    setMode(m);
    applyMode(m);
  }, []);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyMode(next);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[60]">
      <button
        onClick={toggle}
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
        className="h-11 w-11 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        style={{ boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--accent) 60%, transparent)" }}
      >
        {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  );
}
