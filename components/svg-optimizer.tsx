"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Download, Upload, Sparkles, Code2, RefreshCw, FileCode, CheckCircle2, Percent } from "lucide-react";

const SAMPLE_SVGS = [
  {
    name: "Logo Badge",
    svg: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 25.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
  <style type="text/css">
    .st0{fill:#3B82F6;stroke:#1D4ED8;stroke-width:2.0000001;stroke-miterlimit:10;}
    .st1{fill:#FFFFFF;}
  </style>
  <g id="Group_Badge">
    <circle id="Bg_Circle" class="st0" cx="50.0000000" cy="50.0000000" r="42.5000000"/>
    <path id="Star_Shape" class="st1" d="M50.0000000 22.5000000 L58.4500000 39.6200000 L77.3600000 42.3700000 L63.6800000 55.7000000 L66.9100000 74.5200000 L50.0000000 65.6300000 L33.0900000 74.5200000 L36.3200000 55.7000000 L22.6400000 42.3700000 L41.5500000 39.6200000 Z" fill-rule="evenodd"/>
  </g>
</svg>`,
  },
  {
    name: "Complex Sparkle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="128.000" height="128.000" viewBox="0 0 24.000 24.000" fill="none" stroke="#60A5FA" stroke-width="1.5000" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sparkles">
  <!-- Decorative Sparkle Icon -->
  <path d="M12.0000000 3.0000000 C12.0000000 7.9705627 16.0294373 12.0000000 21.0000000 12.0000000 C16.0294373 12.0000000 12.0000000 16.0294373 12.0000000 21.0000000 C12.0000000 16.0294373 7.9705627 12.0000000 3.0000000 12.0000000 C7.9705627 12.0000000 12.0000000 7.9705627 12.0000000 3.0000000 Z" id="main-sparkle"/>
</svg>`,
  },
  {
    name: "Simple Icon",
    svg: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
</svg>`,
  },
];

export function SvgOptimizer() {
  const [inputSvg, setInputSvg] = useState(SAMPLE_SVGS[0].svg);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeXmlDecl, setRemoveXmlDecl] = useState(true);
  const [removeUnusedAttrs, setRemoveUnusedAttrs] = useState(true);
  const [removeIds, setRemoveIds] = useState(false);
  const [precision, setPrecision] = useState<number>(2);
  const [minify, setMinify] = useState(true);
  const [activeTab, setActiveTab] = useState<"svg" | "react" | "datauri">("svg");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const previewId = useId();

  // Optimization Logic
  const optimized = useMemo(() => {
    let result = inputSvg;
    if (!result.trim()) return { svg: "", react: "", dataUri: "", rawSize: 0, optSize: 0, savings: 0 };

    const rawSize = new Blob([result]).size;

    // 1. Remove XML declaration
    if (removeXmlDecl) {
      result = result.replace(/<\?xml[\s\S]*?\?>/gi, "");
    }

    // 2. Remove DOCTYPE & comments
    if (removeComments) {
      result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
      result = result.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 3. Remove metadata & unused attributes
    if (removeUnusedAttrs) {
      result = result.replace(/\s*(xmlns:xlink|xml:space|version|enable-background|x|y)="[^"]*"/gi, "");
    }

    // 4. Remove IDs if requested
    if (removeIds) {
      result = result.replace(/\s*id="[^"]*"/gi, "");
    }

    // 5. Precision rounding for decimal coordinates
    if (precision >= 0) {
      result = result.replace(/(\d+\.\d+)/g, (match) => {
        const num = parseFloat(match);
        return isNaN(num) ? match : parseFloat(num.toFixed(precision)).toString();
      });
    }

    // 6. Minify whitespace
    if (minify) {
      result = result
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();
    }

    const optSize = new Blob([result]).size;
    const savings = rawSize > 0 ? Math.max(0, Math.round(((rawSize - optSize) / rawSize) * 100)) : 0;

    // React Component Conversion
    let reactCode = result
      .replace(/class=/g, "className=")
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")
      .replace(/stroke-miterlimit=/g, "strokeMiterlimit=")
      .replace(/fill-rule=/g, "fillRule=")
      .replace(/clip-rule=/g, "clipRule=")
      .replace(/clip-path=/g, "clipPath=")
      .replace(/fill-opacity=/g, "fillOpacity=")
      .replace(/stroke-opacity=/g, "strokeOpacity=");

    const reactComponent = `export function Icon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${reactCode.split("\n").join("\n    ")}\n  );\n}`;

    // Data URI conversion
    const encoded = encodeURIComponent(result)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    const dataUri = `data:image/svg+xml,${encoded}`;
    const cssUri = `background-image: url("${dataUri}");`;

    return {
      svg: result,
      react: reactComponent,
      dataUri,
      cssUri,
      rawSize,
      optSize,
      savings,
    };
  }, [inputSvg, removeComments, removeXmlDecl, removeUnusedAttrs, removeIds, precision, minify]);

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([optimized.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setInputSvg(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> SVG Optimizer & Converter
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Clean SVG markup, strip metadata, round coordinates, and convert directly to React JSX components or CSS Data URIs.
          </p>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Presets:</span>
          {SAMPLE_SVGS.map((sample) => (
            <button
              key={sample.name}
              onClick={() => setInputSvg(sample.svg)}
              className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs font-mono transition-colors hover:border-accent hover:text-accent"
            >
              {sample.name}
            </button>
          ))}
          <label className="cursor-pointer rounded-full border border-accent/60 bg-accent/10 px-3 py-1 text-xs font-mono text-accent transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5">
            <Upload className="h-3 w-3" /> Upload SVG
            <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border/60 bg-background/40 p-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Original Size</div>
          <div className="mt-1 font-mono text-base font-semibold">{optimized.rawSize} B</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Optimized Size</div>
          <div className="mt-1 font-mono text-base font-semibold text-accent">{optimized.optSize} B</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Savings</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-500">
            <Percent className="h-3 w-3" /> -{optimized.savings}%
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={handleDownload}
            disabled={!optimized.svg}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3.5 py-2 font-mono text-xs font-medium text-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Download .svg
          </button>
        </div>
      </div>

      {/* Main Grid: Input / Controls / Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input Textarea & Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor={previewId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input Raw SVG Code
            </label>
            <button
              onClick={() => setInputSvg("")}
              className="text-[11px] font-mono text-muted-foreground hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <textarea
            id={previewId}
            value={inputSvg}
            onChange={(e) => setInputSvg(e.target.value)}
            placeholder="Paste your SVG markup here..."
            spellCheck={false}
            className="h-44 w-full rounded-xl border border-border/70 bg-background p-3.5 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-accent"
          />

          {/* Toggles & Options */}
          <div className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Optimization Rules
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeComments}
                  onChange={(e) => setRemoveComments(e.target.checked)}
                  className="rounded border-border bg-background text-accent"
                />
                Strip Comments
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeXmlDecl}
                  onChange={(e) => setRemoveXmlDecl(e.target.checked)}
                  className="rounded border-border bg-background text-accent"
                />
                Strip XML Header
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeUnusedAttrs}
                  onChange={(e) => setRemoveUnusedAttrs(e.target.checked)}
                  className="rounded border-border bg-background text-accent"
                />
                Remove Metadata
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeIds}
                  onChange={(e) => setRemoveIds(e.target.checked)}
                  className="rounded border-border bg-background text-accent"
                />
                Strip id="..." Attrs
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={(e) => setMinify(e.target.checked)}
                  className="rounded border-border bg-background text-accent"
                />
                Minify Whitespace
              </label>

              <div className="flex items-center gap-2">
                <span>Decimal Precision:</span>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  className="rounded border border-border bg-background px-2 py-0.5 text-xs font-mono"
                >
                  <option value={1}>1 dec (12.3)</option>
                  <option value={2}>2 dec (12.34)</option>
                  <option value={3}>3 dec (12.345)</option>
                  <option value={-1}>Off (Exact)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview & Output Tabs */}
        <div className="flex flex-col space-y-4">
          {/* Live Visual Render Preview */}
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Live SVG Render Preview
            </div>
            <div className="flex h-36 w-full items-center justify-center rounded-xl border border-border/70 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] bg-background/60 p-4">
              {optimized.svg ? (
                <div
                  className="max-h-full max-w-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: optimized.svg }}
                />
              ) : (
                <span className="font-mono text-xs text-muted-foreground">No SVG output to display</span>
              )}
            </div>
          </div>

          {/* Output Format Tabs */}
          <div className="flex-1 flex flex-col rounded-xl border border-border/70 bg-background/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2">
              <div className="flex gap-1 font-mono text-xs">
                {(["svg", "react", "datauri"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={
                      "px-3 py-1 rounded-lg uppercase tracking-wider transition-colors " +
                      (activeTab === tab
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {tab === "svg" ? "SVG Code" : tab === "react" ? "React JSX" : "Data URI / CSS"}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    activeTab === "svg"
                      ? optimized.svg
                      : activeTab === "react"
                      ? optimized.react
                      : optimized.cssUri,
                    activeTab
                  )
                }
                disabled={!optimized.svg}
                className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {copiedFormat === activeTab ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-3">
              <pre className="h-40 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
                {activeTab === "svg" && (optimized.svg || "// Paste an SVG above to optimize...")}
                {activeTab === "react" && (optimized.react || "// Paste an SVG above to generate React component...")}
                {activeTab === "datauri" && (
                  <>
                    {/* CSS Background Image */}
                    <span className="text-accent font-semibold">// CSS Background Image:</span>
                    {"\n"}
                    {optimized.cssUri || "// Paste SVG..."}
                    {"\n\n"}
                    <span className="text-accent font-semibold">// Raw Data URI:</span>
                    {"\n"}
                    {optimized.dataUri || "// Paste SVG..."}
                  </>
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
