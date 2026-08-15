"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Ruler, Sparkles, Sliders } from "lucide-react";

export function FluidClampTool() {
  const [minSize, setMinSize] = useState(16);
  const [maxSize, setMaxSize] = useState(36);
  const [minVw, setMinVw] = useState(320);
  const [maxVw, setMaxVw] = useState(1440);
  const [remBase, setRemBase] = useState(16);
  const [testViewport, setTestViewport] = useState(768);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const minSizeId = useId();
  const maxSizeId = useId();
  const minVwId = useId();
  const maxVwId = useId();
  const remBaseId = useId();
  const testViewportId = useId();

  const { clampCss, tailwindCss, calculatedAtViewport, minRem, maxRem, slopeVw, yRem } = useMemo(() => {
    const minR = minSize / remBase;
    const maxR = maxSize / remBase;

    const slope = (maxSize - minSize) / (maxVw - minVw);
    const yIntersection = -minVw * slope + minSize;
    const yR = yIntersection / remBase;
    const sVw = slope * 100;

    const sign = yR < 0 ? "-" : "+";
    const absYR = Math.abs(yR);

    const preferredStr = `${sVw.toFixed(4)}vw ${sign} ${absYR.toFixed(4)}rem`;
    const css = `clamp(${minR.toFixed(4)}rem, ${preferredStr}, ${maxR.toFixed(4)}rem)`;
    const tw = `text-[clamp(${minR.toFixed(4)}rem,${sVw.toFixed(4)}vw${sign}${absYR.toFixed(4)}rem,${maxR.toFixed(4)}rem)]`;

    // Live calculation at test viewport
    let currentPx = minVw === maxVw ? minSize : minSize + (testViewport - minVw) * slope;
    currentPx = Math.max(minSize, Math.min(maxSize, currentPx));

    return {
      clampCss: css,
      tailwindCss: tw,
      calculatedAtViewport: currentPx.toFixed(2),
      minRem: minR,
      maxRem: maxR,
      slopeVw: sVw,
      yRem: yR,
    };
  }, [minSize, maxSize, minVw, maxVw, remBase, testViewport]);

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-accent" /> Modern CSS `clamp()` Fluid Formula Builder
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Build smooth fluid typography & spacing formulas that scale fluidly between mobile and desktop viewports.
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="my-5 grid gap-4 grid-cols-2 sm:grid-cols-5 rounded-xl border border-border/60 bg-background/40 p-4">
        <div>
          <label htmlFor={minSizeId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Min Size (px)
          </label>
          <input
            id={minSizeId}
            type="number"
            value={minSize}
            onChange={(e) => setMinSize(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={maxSizeId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Max Size (px)
          </label>
          <input
            id={maxSizeId}
            type="number"
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={minVwId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Min Viewport (px)
          </label>
          <input
            id={minVwId}
            type="number"
            value={minVw}
            onChange={(e) => setMinVw(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={maxVwId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Max Viewport (px)
          </label>
          <input
            id={maxVwId}
            type="number"
            value={maxVw}
            onChange={(e) => setMaxVw(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={remBaseId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            REM Base (px)
          </label>
          <input
            id={remBaseId}
            type="number"
            value={remBase}
            onChange={(e) => setRemBase(Number(e.target.value) || 16)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Live Viewport Simulator Slider */}
      <div className="mb-6 rounded-xl border border-border/60 bg-background/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor={testViewportId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-accent" /> Live Viewport Simulator:
            <span className="text-foreground font-bold">{testViewport}px</span>
          </label>
          <div className="font-mono text-xs">
            Calculated Output: <span className="font-bold text-accent">{calculatedAtViewport}px</span>
          </div>
        </div>

        <input
          id={testViewportId}
          type="range"
          min={320}
          max={1920}
          value={testViewport}
          onChange={(e) => setTestViewport(Number(e.target.value))}
          className="w-full accent-accent"
        />

        {/* Live Font & Box Size Preview */}
        <div className="mt-4 rounded-xl border border-border/70 bg-card p-6 text-center overflow-hidden">
          <p
            style={{ fontSize: `${calculatedAtViewport}px`, lineHeight: 1.2 }}
            className="font-display font-bold transition-all text-foreground"
          >
            Fluid Responsive Text
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Rendering at {calculatedAtViewport}px on a {testViewport}px screen
          </p>
        </div>
      </div>

      {/* Code Outputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vanilla CSS</span>
            <button
              onClick={() => handleCopy(`font-size: ${clampCss};`, "css")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "css" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">
            font-size: {clampCss};
          </pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tailwind CSS Arbitrary</span>
            <button
              onClick={() => handleCopy(tailwindCss, "tw")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "tw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">
            {tailwindCss}
          </pre>
        </div>
      </div>
    </div>
  );
}
