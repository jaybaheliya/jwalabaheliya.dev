"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Small floating diagnostics panel: FPS, motion mode, smooth-scroll status.
 * Toggle with the button; hidden by default so it doesn't distract.
 */
export function PerfPanel() {
  const [open, setOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [avg, setAvg] = useState(0);
  const rafRef = useRef(0);
  const samplesRef = useRef<number[]>([]);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch =
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const lenisActive = !reducedMotion && !isTouch;

  useEffect(() => {
    if (!open) return;
    let last = performance.now();
    let frames = 0;
    let acc = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      frames++;
      if (acc >= 500) {
        const cur = Math.round((frames * 1000) / acc);
        setFps(cur);
        const s = samplesRef.current;
        s.push(cur);
        if (s.length > 20) s.shift();
        setAvg(Math.round(s.reduce((a, b) => a + b, 0) / s.length));
        acc = 0;
        frames = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  const color =
    fps >= 55 ? "oklch(0.85 0.18 140)" : fps >= 40 ? "oklch(0.85 0.17 85)" : "oklch(0.7 0.22 25)";

  return (
    <div className="fixed bottom-4 right-4 z-[60] hidden font-mono text-[10px] tracking-widest uppercase md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle performance panel"
        aria-expanded={open}
        className="h-11 px-3 rounded-full border border-border bg-background/80 backdrop-blur-md shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: open ? color : "var(--muted-foreground)" }}
        />
        <span>{open ? `${fps} FPS` : "Perf"}</span>
      </button>
      {open && (
        <div className="absolute bottom-14 right-0 bg-background/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-2xl min-w-[220px] space-y-2 normal-case tracking-normal text-xs font-sans">
          <Row label="FPS (now)" value={<span style={{ color }}>{fps}</span>} />
          <Row label="FPS (avg 10s)" value={<span>{avg}</span>} />
          <Row
            label="Reduced motion"
            value={<Badge on={reducedMotion} onLabel="On" offLabel="Off" />}
          />
          <Row
            label="Lenis smooth scroll"
            value={<Badge on={lenisActive} onLabel="Active" offLabel="Off" />}
          />
          <Row
            label="Touch device"
            value={<Badge on={isTouch} onLabel="Yes" offLabel="No" />}
          />
          <div className="pt-2 border-t border-border font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
            Scroll effects rAF-throttled
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Badge({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded border text-[10px]"
      style={{
        borderColor: on ? "var(--accent)" : "var(--border)",
        color: on ? "var(--accent)" : "var(--muted-foreground)",
      }}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}