"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Sparkles, Sliders, RefreshCw, Zap } from "lucide-react";

const ANIMATION_PRESETS = [
  {
    name: "Floating Bounce",
    duration: 2,
    easing: "ease-in-out",
    k0: { y: 0, scale: 1, rotate: 0, opacity: 1 },
    k50: { y: -16, scale: 1.05, rotate: 2, opacity: 0.9 },
    k100: { y: 0, scale: 1, rotate: 0, opacity: 1 },
  },
  {
    name: "Soft Glow Pulse",
    duration: 1.8,
    easing: "ease-in-out",
    k0: { y: 0, scale: 1, rotate: 0, opacity: 0.8 },
    k50: { y: 0, scale: 1.08, rotate: 0, opacity: 1 },
    k100: { y: 0, scale: 1, rotate: 0, opacity: 0.8 },
  },
  {
    name: "Attention Shake",
    duration: 0.8,
    easing: "ease-in-out",
    k0: { y: 0, scale: 1, rotate: 0, opacity: 1 },
    k50: { y: 0, scale: 1, rotate: -6, opacity: 1 },
    k100: { y: 0, scale: 1, rotate: 0, opacity: 1 },
  },
  {
    name: "Pop Scale",
    duration: 1.2,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    k0: { y: 0, scale: 0.9, rotate: 0, opacity: 0.6 },
    k50: { y: -4, scale: 1.12, rotate: 0, opacity: 1 },
    k100: { y: 0, scale: 1, rotate: 0, opacity: 1 },
  },
];

export function KeyframeAnimationBuilder() {
  const [duration, setDuration] = useState(2);
  const [easing, setEasing] = useState("ease-in-out");
  const [infinite, setInfinite] = useState(true);

  // Keyframe stages
  const [k0Y, setK0Y] = useState(0);
  const [k0Scale, setK0Scale] = useState(1);
  const [k0Rotate, setK0Rotate] = useState(0);
  const [k0Opacity, setK0Opacity] = useState(1);

  const [k50Y, setK50Y] = useState(-16);
  const [k50Scale, setK50Scale] = useState(1.05);
  const [k50Rotate, setK50Rotate] = useState(2);
  const [k50Opacity, setK50Opacity] = useState(0.9);

  const [k100Y, setK100Y] = useState(0);
  const [k100Scale, setK100Scale] = useState(1);
  const [k100Rotate, setK100Rotate] = useState(0);
  const [k100Opacity, setK100Opacity] = useState(1);

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const durationId = useId();
  const easingId = useId();

  const applyPreset = (preset: (typeof ANIMATION_PRESETS)[0]) => {
    setDuration(preset.duration);
    setEasing(preset.easing);
    setK0Y(preset.k0.y);
    setK0Scale(preset.k0.scale);
    setK0Rotate(preset.k0.rotate);
    setK0Opacity(preset.k0.opacity);

    setK50Y(preset.k50.y);
    setK50Scale(preset.k50.scale);
    setK50Rotate(preset.k50.rotate);
    setK50Opacity(preset.k50.opacity);

    setK100Y(preset.k100.y);
    setK100Scale(preset.k100.scale);
    setK100Rotate(preset.k100.rotate);
    setK100Opacity(preset.k100.opacity);
  };

  const { cssKeyframes, tailwindConfig } = useMemo(() => {
    const keyframesName = "customFloat";
    const className = "custom-animated";

    const transformStr = (y: number, scale: number, rotate: number) => {
      const parts = [];
      if (y !== 0) parts.push(`translateY(${y}px)`);
      if (scale !== 1) parts.push(`scale(${scale})`);
      if (rotate !== 0) parts.push(`rotate(${rotate}deg)`);
      return parts.length ? parts.join(" ") : "none";
    };

    const k0Transform = transformStr(k0Y, k0Scale, k0Rotate);
    const k50Transform = transformStr(k50Y, k50Scale, k50Rotate);
    const k100Transform = transformStr(k100Y, k100Scale, k100Rotate);

    const css = `@keyframes ${keyframesName} {
  0% {
    transform: ${k0Transform};
    opacity: ${k0Opacity};
  }
  50% {
    transform: ${k50Transform};
    opacity: ${k50Opacity};
  }
  100% {
    transform: ${k100Transform};
    opacity: ${k100Opacity};
  }
}

.${className} {
  animation: ${keyframesName} ${duration}s ${easing} ${infinite ? "infinite" : "1"};
}`;

    const twConfig = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        ${keyframesName}: {
          '0%': { transform: '${k0Transform}', opacity: '${k0Opacity}' },
          '50%': { transform: '${k50Transform}', opacity: '${k50Opacity}' },
          '100%': { transform: '${k100Transform}', opacity: '${k100Opacity}' },
        },
      },
      animation: {
        'custom-float': '${keyframesName} ${duration}s ${easing} ${infinite ? "infinite" : "1"}',
      },
    },
  },
};`;

    return {
      cssKeyframes: css,
      tailwindConfig: twConfig,
    };
  }, [
    duration,
    easing,
    infinite,
    k0Y,
    k0Scale,
    k0Rotate,
    k0Opacity,
    k50Y,
    k50Scale,
    k50Rotate,
    k50Opacity,
    k100Y,
    k100Scale,
    k100Rotate,
    k100Opacity,
  ]);

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
            <Zap className="h-5 w-5 text-accent" /> Keyframe Micro-Interaction Studio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Build custom keyframe animations with live component preview and Tailwind CSS config export.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Presets:</span>
          {ANIMATION_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs font-mono transition-colors hover:border-accent hover:text-accent"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Controls & Preview */}
      <div className="my-5 grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-background/30 p-4">
            <div>
              <label htmlFor={durationId} className="font-mono text-xs text-muted-foreground block mb-1">
                Duration: {duration}s
              </label>
              <input
                id={durationId}
                type="range"
                min={0.2}
                max={5}
                step={0.1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label htmlFor={easingId} className="font-mono text-xs text-muted-foreground block mb-1">
                Easing
              </label>
              <select
                id={easingId}
                value={easing}
                onChange={(e) => setEasing(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs"
              >
                <option value="ease-in-out">ease-in-out</option>
                <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">bounce (cubic-bezier)</option>
                <option value="linear">linear</option>
                <option value="ease-in">ease-in</option>
                <option value="ease-out">ease-out</option>
              </select>
            </div>
          </div>

          {/* Keyframe Stages */}
          <div className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Keyframe 50% Mid-Point Controls
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span>TranslateY ({k50Y}px)</span>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={k50Y}
                  onChange={(e) => setK50Y(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div>
                <span>Scale ({k50Scale})</span>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  value={k50Scale}
                  onChange={(e) => setK50Scale(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div>
                <span>Rotate ({k50Rotate}deg)</span>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  value={k50Rotate}
                  onChange={(e) => setK50Rotate(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div>
                <span>Opacity ({k50Opacity})</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={k50Opacity}
                  onChange={(e) => setK50Opacity(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Element */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-background/50 p-8 min-h-[240px]">
          <style>{cssKeyframes}</style>
          <div className="custom-animated rounded-2xl border border-accent/40 bg-accent/10 px-8 py-6 text-center shadow-lg backdrop-blur">
            <Sparkles className="mx-auto h-8 w-8 text-accent mb-2" />
            <h4 className="font-display font-bold text-lg text-foreground">Interactive Motion</h4>
            <p className="font-mono text-xs text-muted-foreground mt-1">Live `@keyframes` preview</p>
          </div>
        </div>
      </div>

      {/* Code Outputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vanilla CSS `@keyframes`</span>
            <button
              onClick={() => handleCopy(cssKeyframes, "css")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "css" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{cssKeyframes}</pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tailwind Config Extension</span>
            <button
              onClick={() => handleCopy(tailwindConfig, "tw")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "tw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{tailwindConfig}</pre>
        </div>
      </div>
    </div>
  );
}
