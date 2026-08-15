"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Sparkles, Image as ImageIcon, Code2 } from "lucide-react";

const PRESET_RATIOS = [
  { name: "16:9 (Landscape)", w: 16, h: 9 },
  { name: "4:3 (Standard)", w: 4, h: 3 },
  { name: "1:1 (Square)", w: 1, h: 1 },
  { name: "21:9 (Ultrawide)", w: 21, h: 9 },
  { name: "9:16 (Portrait / Story)", w: 9, h: 16 },
  { name: "3:2 (Camera)", w: 3, h: 2 },
];

export function NextImageCalcTool() {
  const [width, setWidth] = useState(1200);
  const [ratioWidth, setRatioWidth] = useState(16);
  const [ratioHeight, setRatioHeight] = useState(9);
  const [altText, setAltText] = useState("Project screenshot");
  const [srcUrl, setSrcUrl] = useState("/images/hero.webp");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const widthId = useId();
  const ratioWId = useId();
  const ratioHId = useId();
  const altId = useId();
  const srcId = useId();

  const { calculatedHeight, paddingBottomPercent, nextJsCode, cssCode } = useMemo(() => {
    const rW = ratioWidth || 1;
    const rH = ratioHeight || 1;
    const h = Math.round((width * rH) / rW);
    const pb = ((rH / rW) * 100).toFixed(2);

    const nextCode = `import Image from "next/image";\n\n<Image\n  src="${srcUrl || "/placeholder.jpg"}"\n  alt="${altText || "Image"}"\n  width={${width}}\n  height={${h}}\n  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n  className="h-auto w-full object-cover"\n/>`;
    const cssStr = `/* CSS Aspect Ratio */\naspect-ratio: ${rW} / ${rH};\n\n/* Legacy Padding Hack */\npadding-bottom: ${pb}%;`;

    return {
      calculatedHeight: h,
      paddingBottomPercent: pb,
      nextJsCode: nextCode,
      cssCode: cssStr,
    };
  }, [width, ratioWidth, ratioHeight, altText, srcUrl]);

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
            <ImageIcon className="h-5 w-5 text-accent" /> Next.js {"<Image />"} & Aspect Ratio Calculator
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Calculate exact image dimensions to eliminate Cumulative Layout Shift (CLS) in Next.js applications.
          </p>
        </div>
      </div>

      {/* Preset Aspect Ratios */}
      <div className="my-5 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Presets:</span>
        {PRESET_RATIOS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setRatioWidth(p.w);
              setRatioHeight(p.h);
            }}
            className={
              "rounded-full border px-3 py-1 text-xs font-mono transition-colors " +
              (ratioWidth === p.w && ratioHeight === p.h
                ? "border-accent bg-accent/10 text-accent font-semibold"
                : "border-border/70 bg-background/50 text-muted-foreground hover:border-accent")
            }
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="my-5 grid gap-4 grid-cols-2 sm:grid-cols-4 rounded-xl border border-border/60 bg-background/40 p-4">
        <div>
          <label htmlFor={widthId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Width (px)
          </label>
          <input
            id={widthId}
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={ratioWId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Ratio Width
          </label>
          <input
            id={ratioWId}
            type="number"
            value={ratioWidth}
            onChange={(e) => setRatioWidth(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor={ratioHId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Ratio Height
          </label>
          <input
            id={ratioHId}
            type="number"
            value={ratioHeight}
            onChange={(e) => setRatioHeight(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Calculated Height</div>
          <div className="rounded-lg border border-border/60 bg-background px-3 py-1.5 font-mono text-xs font-bold text-accent">
            {calculatedHeight} px
          </div>
        </div>
      </div>

      {/* Image Src & Alt */}
      <div className="mb-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <label htmlFor={srcId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Image Src Path
          </label>
          <input
            id={srcId}
            type="text"
            value={srcUrl}
            onChange={(e) => setSrcUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor={altId} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Alt Text
          </label>
          <input
            id={altId}
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Code Outputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Next.js {"<Image />"} Component</span>
            <button
              onClick={() => handleCopy(nextJsCode, "next")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "next" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{nextJsCode}</pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">CSS Aspect Ratio & Padding</span>
            <button
              onClick={() => handleCopy(cssCode, "css")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "css" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
