"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Square, Sparkles, Sliders } from "lucide-react";

export function MultiLayerShadowTool() {
  const [layers, setLayers] = useState(5);
  const [offsetY, setOffsetY] = useState(24);
  const [blurScale, setBlurScale] = useState(48);
  const [opacity, setOpacity] = useState(0.12);
  const [shadowHex, setShadowHex] = useState("#0f172a");
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const layersId = useId();
  const opacityId = useId();
  const offsetId = useId();
  const blurId = useId();
  const colorId = useId();

  // Convert hex to rgb
  const rgb = useMemo(() => {
    let hex = shadowHex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    if (isNaN(num)) return { r: 15, g: 23, b: 42 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }, [shadowHex]);

  const { boxShadowCss, tailwindShadow, dropShadowCss } = useMemo(() => {
    const list = Array.from({ length: layers }).map((_, i) => {
      const step = (i + 1) / layers;
      const y = Math.round(step * step * offsetY);
      const blur = Math.round(step * blurScale);
      const alpha = (opacity * Math.pow(1 - step * 0.5, 1.3)).toFixed(3);
      return `0px ${y}px ${blur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    });

    const css = list.join(",\n  ");
    const inlineCss = list.join(", ");
    const tw = `shadow-[${inlineCss.replace(/\s+/g, "_")}]`;
    const drop = `filter: drop-shadow(0px ${Math.round(offsetY / 2)}px ${Math.round(blurScale / 2)}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}));`;

    return {
      boxShadowCss: `box-shadow:\n  ${css};`,
      tailwindShadow: tw,
      dropShadowCss: drop,
    };
  }, [layers, offsetY, blurScale, opacity, rgb]);

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
            <Square className="h-5 w-5 text-accent" /> Multi-Layer Ambient Shadow Studio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create ultra-smooth 5-layer Stripe/Apple elevation shadows and CSS drop-shadow filters.
          </p>
        </div>

        <button
          onClick={() => setIsDarkBg(!isDarkBg)}
          className="rounded-full border border-border bg-background px-3 py-1 text-xs font-mono transition-colors hover:border-accent"
        >
          Toggle {isDarkBg ? "Light" : "Dark"} Canvas
        </button>
      </div>

      {/* Controls & Preview Grid */}
      <div className="my-5 grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-background/30 p-4">
          <div>
            <label htmlFor={layersId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between mb-1">
              <span>Shadow Layers ({layers})</span>
            </label>
            <input
              id={layersId}
              type="range"
              min={2}
              max={6}
              value={layers}
              onChange={(e) => setLayers(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <label htmlFor={opacityId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between mb-1">
              <span>Opacity ({Math.round(opacity * 100)}%)</span>
            </label>
            <input
              id={opacityId}
              type="range"
              min={0.02}
              max={0.5}
              step={0.01}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <label htmlFor={offsetId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between mb-1">
              <span>Vertical Distance ({offsetY}px)</span>
            </label>
            <input
              id={offsetId}
              type="range"
              min={4}
              max={64}
              value={offsetY}
              onChange={(e) => setOffsetY(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <label htmlFor={blurId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between mb-1">
              <span>Blur Softness ({blurScale}px)</span>
            </label>
            <input
              id={blurId}
              type="range"
              min={8}
              max={120}
              value={blurScale}
              onChange={(e) => setBlurScale(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor={colorId} className="font-mono text-xs text-muted-foreground">Shadow Tint Color:</label>
            <input
              id={colorId}
              type="color"
              value={shadowHex}
              onChange={(e) => setShadowHex(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <span className="font-mono text-xs uppercase">{shadowHex}</span>
          </div>
        </div>

        {/* Live Interactive Card Preview */}
        <div
          className={
            "flex h-72 w-full items-center justify-center rounded-xl border border-border/70 p-6 transition-colors " +
            (isDarkBg ? "bg-slate-950" : "bg-slate-100")
          }
        >
          <div
            style={{
              boxShadow: boxShadowCss.replace("box-shadow:\n  ", "").replace(";", ""),
            }}
            className="w-64 rounded-2xl bg-white p-6 text-slate-900 transition-all"
          >
            <div className="h-3 w-12 rounded-full bg-blue-500/20 mb-3" />
            <h4 className="font-display font-bold text-base">Elevated Card</h4>
            <p className="text-xs text-slate-500 mt-1">Multi-layered ambient light box-shadow.</p>
          </div>
        </div>
      </div>

      {/* Code Outputs */}
      <div className="space-y-3">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vanilla CSS (Multi-Layer)</span>
            <button
              onClick={() => handleCopy(boxShadowCss, "css")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "css" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{boxShadowCss}</pre>
        </div>
      </div>
    </div>
  );
}
