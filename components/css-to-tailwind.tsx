"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Wand2, ArrowRight, Code2, Sparkles } from "lucide-react";

const SAMPLE_CSS = `/* Card component CSS */
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 420px;
  padding: 24px 32px;
  margin: 16px auto;
  gap: 16px;
  background-color: #0f172a;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.02em;
  border-radius: 16px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  position: relative;
  z-index: 10;
}`;

// Standard Tailwind spacing map (px -> tw number)
const SPACING_MAP: Record<string, string> = {
  "0px": "0", "0": "0",
  "1px": "px",
  "2px": "0.5",
  "4px": "1",
  "6px": "1.5",
  "8px": "2",
  "10px": "2.5",
  "12px": "3",
  "14px": "3.5",
  "16px": "4",
  "20px": "5",
  "24px": "6",
  "28px": "7",
  "32px": "8",
  "36px": "9",
  "40px": "10",
  "44px": "11",
  "48px": "12",
  "56px": "14",
  "64px": "16",
  "80px": "20",
  "96px": "24",
};

const RADIUS_MAP: Record<string, string> = {
  "0px": "none", "0": "none",
  "2px": "sm",
  "4px": "",
  "6px": "md",
  "8px": "lg",
  "12px": "xl",
  "16px": "2xl",
  "24px": "3xl",
  "9999px": "full",
  "50%": "full",
  "100%": "full",
};

const FONT_SIZE_MAP: Record<string, string> = {
  "12px": "xs",
  "14px": "sm",
  "16px": "base",
  "18px": "lg",
  "20px": "xl",
  "24px": "2xl",
  "30px": "3xl",
  "36px": "4xl",
  "48px": "5xl",
  "60px": "6xl",
  "72px": "7xl",
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  "100": "thin",
  "200": "extralight",
  "300": "light",
  "400": "normal",
  "500": "medium",
  "600": "semibold",
  "700": "bold",
  "800": "extrabold",
  "900": "black",
};

function getSpacingToken(val: string): string {
  const clean = val.trim();
  if (SPACING_MAP[clean]) return SPACING_MAP[clean];
  if (clean.endsWith("px")) {
    const num = parseFloat(clean);
    if (!isNaN(num) && num % 4 === 0) return `${num / 4}`;
  }
  return `[${clean.replace(/\s+/g, "_")}]`;
}

function parseCssProperty(prop: string, val: string): string[] {
  const p = prop.trim().toLowerCase();
  const v = val.trim().toLowerCase();
  const rawV = val.trim();

  if (!p || !v) return [];

  // Display & Flex
  if (p === "display") {
    if (v === "flex") return ["flex"];
    if (v === "inline-flex") return ["inline-flex"];
    if (v === "grid") return ["grid"];
    if (v === "inline-grid") return ["inline-grid"];
    if (v === "block") return ["block"];
    if (v === "inline-block") return ["inline-block"];
    if (v === "none") return ["hidden"];
    if (v === "contents") return ["contents"];
    if (v === "table") return ["table"];
    return [`[display:${v}]`];
  }

  if (p === "flex-direction") {
    if (v === "column") return ["flex-col"];
    if (v === "row") return ["flex-row"];
    if (v === "column-reverse") return ["flex-col-reverse"];
    if (v === "row-reverse") return ["flex-row-reverse"];
  }

  if (p === "flex-wrap") {
    if (v === "wrap") return ["flex-wrap"];
    if (v === "nowrap") return ["flex-nowrap"];
    if (v === "wrap-reverse") return ["flex-wrap-reverse"];
  }

  if (p === "flex") {
    if (v === "1" || v === "1 1 0%") return ["flex-1"];
    if (v === "auto" || v === "1 1 auto") return ["flex-auto"];
    if (v === "none" || v === "0 0 auto") return ["flex-none"];
    return [`flex-[${v.replace(/\s+/g, "_")}]`];
  }

  if (p === "flex-grow") return v === "1" ? ["grow"] : v === "0" ? ["grow-0"] : [`grow-[${v}]`];
  if (p === "flex-shrink") return v === "1" ? ["shrink"] : v === "0" ? ["shrink-0"] : [`shrink-[${v}]`];

  // Align & Justify
  if (p === "align-items") {
    if (v === "center") return ["items-center"];
    if (v === "flex-start" || v === "start") return ["items-start"];
    if (v === "flex-end" || v === "end") return ["items-end"];
    if (v === "stretch") return ["items-stretch"];
    if (v === "baseline") return ["items-baseline"];
  }

  if (p === "justify-content") {
    if (v === "center") return ["justify-center"];
    if (v === "space-between") return ["justify-between"];
    if (v === "space-around") return ["justify-around"];
    if (v === "space-evenly") return ["justify-evenly"];
    if (v === "flex-start" || v === "start") return ["justify-start"];
    if (v === "flex-end" || v === "end") return ["justify-end"];
  }

  if (p === "align-self") {
    if (v === "center") return ["self-center"];
    if (v === "flex-start" || v === "start") return ["self-start"];
    if (v === "flex-end" || v === "end") return ["self-end"];
    if (v === "stretch") return ["self-stretch"];
  }

  // Gap
  if (p === "gap") {
    const parts = v.split(/\s+/);
    if (parts.length === 1) return [`gap-${getSpacingToken(parts[0])}`];
    if (parts.length === 2) return [`gap-y-${getSpacingToken(parts[0])}`, `gap-x-${getSpacingToken(parts[1])}`];
  }
  if (p === "row-gap") return [`gap-y-${getSpacingToken(v)}`];
  if (p === "column-gap") return [`gap-x-${getSpacingToken(v)}`];

  // Positioning
  if (p === "position") {
    if (["relative", "absolute", "fixed", "sticky", "static"].includes(v)) return [v];
  }
  if (p === "top") return v === "0" ? ["top-0"] : [`top-[${rawV}]`];
  if (p === "right") return v === "0" ? ["right-0"] : [`right-[${rawV}]`];
  if (p === "bottom") return v === "0" ? ["bottom-0"] : [`bottom-[${rawV}]`];
  if (p === "left") return v === "0" ? ["left-0"] : [`left-[${rawV}]`];
  if (p === "z-index") return ["10", "20", "30", "40", "50", "0", "auto"].includes(v) ? [`z-${v}`] : [`z-[${v}]`];

  // Sizing
  if (p === "width") {
    if (v === "100%") return ["w-full"];
    if (v === "100vw") return ["w-screen"];
    if (v === "auto") return ["w-auto"];
    return [`w-${getSpacingToken(v)}`];
  }
  if (p === "height") {
    if (v === "100%") return ["h-full"];
    if (v === "100vh") return ["h-screen"];
    if (v === "auto") return ["h-auto"];
    return [`h-${getSpacingToken(v)}`];
  }
  if (p === "max-width") {
    if (v === "100%") return ["max-w-full"];
    if (v === "640px") return ["max-w-sm"];
    if (v === "768px") return ["max-w-md"];
    if (v === "1024px") return ["max-w-lg"];
    if (v === "1280px") return ["max-w-xl"];
    if (v === "1400px") return ["max-w-[1400px]"];
    return [`max-w-[${rawV}]`];
  }
  if (p === "max-height") return v === "100%" ? ["max-h-full"] : v === "100vh" ? ["max-h-screen"] : [`max-h-[${rawV}]`];
  if (p === "min-width") return v === "0" ? ["min-w-0"] : v === "100%" ? ["min-w-full"] : [`min-w-[${rawV}]`];
  if (p === "min-height") return v === "0" ? ["min-h-0"] : v === "100vh" ? ["min-h-screen"] : v === "100%" ? ["min-h-full"] : [`min-h-[${rawV}]`];

  // Spacing: Padding
  if (p === "padding") {
    const parts = v.split(/\s+/);
    if (parts.length === 1) return [`p-${getSpacingToken(parts[0])}`];
    if (parts.length === 2) return [`py-${getSpacingToken(parts[0])}`, `px-${getSpacingToken(parts[1])}`];
    if (parts.length === 3) return [`pt-${getSpacingToken(parts[0])}`, `px-${getSpacingToken(parts[1])}`, `pb-${getSpacingToken(parts[2])}`];
    if (parts.length === 4) return [`pt-${getSpacingToken(parts[0])}`, `pr-${getSpacingToken(parts[1])}`, `pb-${getSpacingToken(parts[2])}`, `pl-${getSpacingToken(parts[3])}`];
  }
  if (p === "padding-top") return [`pt-${getSpacingToken(v)}`];
  if (p === "padding-right") return [`pr-${getSpacingToken(v)}`];
  if (p === "padding-bottom") return [`pb-${getSpacingToken(v)}`];
  if (p === "padding-left") return [`pl-${getSpacingToken(v)}`];

  // Spacing: Margin
  if (p === "margin") {
    const parts = v.split(/\s+/);
    if (parts.length === 1) return v === "auto" ? ["m-auto"] : [`m-${getSpacingToken(parts[0])}`];
    if (parts.length === 2) return [parts[0] === "auto" ? "my-auto" : `my-${getSpacingToken(parts[0])}`, parts[1] === "auto" ? "mx-auto" : `px-${getSpacingToken(parts[1])}`];
    if (parts.length === 4) return [`mt-${getSpacingToken(parts[0])}`, `mr-${getSpacingToken(parts[1])}`, `mb-${getSpacingToken(parts[2])}`, `ml-${getSpacingToken(parts[3])}`];
  }
  if (p === "margin-top") return v === "auto" ? ["mt-auto"] : [`mt-${getSpacingToken(v)}`];
  if (p === "margin-right") return v === "auto" ? ["mr-auto"] : [`mr-${getSpacingToken(v)}`];
  if (p === "margin-bottom") return v === "auto" ? ["mb-auto"] : [`mb-${getSpacingToken(v)}`];
  if (p === "margin-left") return v === "auto" ? ["ml-auto"] : [`ml-${getSpacingToken(v)}`];

  // Typography
  if (p === "font-size") return FONT_SIZE_MAP[v] ? [`text-${FONT_SIZE_MAP[v]}`] : [`text-[${rawV}]`];
  if (p === "font-weight") return FONT_WEIGHT_MAP[v] ? [`font-${FONT_WEIGHT_MAP[v]}`] : [`font-[${v}]`];
  if (p === "text-align") return ["left", "center", "right", "justify"].includes(v) ? [`text-${v}`] : [];
  if (p === "color") {
    if (v === "white") return ["text-white"];
    if (v === "black") return ["text-black"];
    if (v === "transparent") return ["text-transparent"];
    return [`text-[${rawV}]`];
  }
  if (p === "line-height") {
    if (v === "1") return ["leading-none"];
    if (v === "1.25") return ["leading-tight"];
    if (v === "1.375") return ["leading-snug"];
    if (v === "1.5") return ["leading-normal"];
    if (v === "1.625") return ["leading-relaxed"];
    if (v === "2") return ["leading-loose"];
    return [`leading-[${rawV}]`];
  }
  if (p === "letter-spacing") {
    if (v === "-0.05em") return ["tracking-tighter"];
    if (v === "-0.025em" || v === "-0.02em") return ["tracking-tight"];
    if (v === "0" || v === "0em") return ["tracking-normal"];
    if (v === "0.025em" || v === "0.02em") return ["tracking-wide"];
    if (v === "0.05em") return ["tracking-wider"];
    if (v === "0.1em") return ["tracking-widest"];
    return [`tracking-[${rawV}]`];
  }
  if (p === "text-transform") return ["uppercase", "lowercase", "capitalize"].includes(v) ? [v] : v === "none" ? ["normal-case"] : [];
  if (p === "text-decoration") return ["underline", "line-through"].includes(v) ? [v] : v === "none" ? ["no-underline"] : [];
  if (p === "white-space") return ["nowrap", "pre", "pre-wrap", "pre-line"].includes(v) ? [`whitespace-${v}`] : [];

  // Background
  if (p === "background-color" || p === "background") {
    if (v === "white") return ["bg-white"];
    if (v === "black") return ["bg-black"];
    if (v === "transparent") return ["bg-transparent"];
    if (v.startsWith("linear-gradient") || v.startsWith("radial-gradient")) return [`bg-[${rawV.replace(/\s+/g, "_")}]`];
    return [`bg-[${rawV}]`];
  }

  // Border & Radius
  if (p === "border-radius") {
    if (RADIUS_MAP[v] !== undefined) return RADIUS_MAP[v] ? [`rounded-${RADIUS_MAP[v]}`] : ["rounded"];
    return [`rounded-[${rawV}]`];
  }
  if (p === "border") {
    if (v === "none" || v === "0") return ["border-none"];
    const parts = rawV.split(/\s+/);
    const classes = ["border"];
    parts.forEach((pt) => {
      if (["solid", "dashed", "dotted", "double"].includes(pt.toLowerCase())) classes.push(`border-${pt.toLowerCase()}`);
      else if (pt.endsWith("px")) {
        const num = parseInt(pt, 10);
        if (num > 1) classes.push(`border-${num}`);
      } else if (pt.startsWith("#") || pt.startsWith("rgb") || pt.startsWith("hsl") || ["white", "black", "transparent"].includes(pt.toLowerCase())) {
        classes.push(`border-[${pt}]`);
      }
    });
    return classes;
  }
  if (p === "border-width") return v === "1px" ? ["border"] : v === "2px" ? ["border-2"] : v === "4px" ? ["border-4"] : [`border-[${rawV}]`];
  if (p === "border-style") return ["solid", "dashed", "dotted", "none"].includes(v) ? [`border-${v}`] : [];
  if (p === "border-color") return [`border-[${rawV}]`];

  // Effects & Interactivity
  if (p === "box-shadow") {
    if (v === "none") return ["shadow-none"];
    return [`shadow-[${rawV.replace(/\s+/g, "_")}]`];
  }
  if (p === "opacity") {
    const num = parseFloat(v);
    if (!isNaN(num)) return [`opacity-${Math.round(num * 100)}`];
    return [`opacity-[${v}]`];
  }
  if (p === "cursor") return ["pointer", "default", "not-allowed", "grab", "move", "wait", "text"].includes(v) ? [`cursor-${v}`] : [];
  if (p === "overflow") return ["hidden", "auto", "scroll", "visible"].includes(v) ? [`overflow-${v}`] : [];
  if (p === "overflow-x") return ["hidden", "auto", "scroll"].includes(v) ? [`overflow-x-${v}`] : [];
  if (p === "overflow-y") return ["hidden", "auto", "scroll"].includes(v) ? [`overflow-y-${v}`] : [];
  if (p === "object-fit") return ["cover", "contain", "fill", "none"].includes(v) ? [`object-${v}`] : [];
  if (p === "pointer-events") return ["none", "auto"].includes(v) ? [`pointer-events-${v}`] : [];
  if (p === "user-select") return v === "none" ? ["select-none"] : [];

  // Fallback: Arbitrary Tailwind property syntax
  return [`[${p}:${rawV.replace(/\s+/g, "_")}]`];
}

export function CssToTailwindTool() {
  const [cssInput, setCssInput] = useState(SAMPLE_CSS);
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const { tailwindClasses, count } = useMemo(() => {
    if (!cssInput.trim()) return { tailwindClasses: "", count: 0 };

    // Strip comments & selectors like .card { ... }
    let cleaned = cssInput.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (cleaned.includes("{") && cleaned.includes("}")) {
      const match = cleaned.match(/\{([\s\S]*?)\}/);
      if (match) cleaned = match[1];
    }

    const lines = cleaned.split(";").map((l) => l.trim()).filter(Boolean);
    const classesSet = new Set<string>();

    lines.forEach((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return;
      const prop = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();

      const tokens = parseCssProperty(prop, val);
      tokens.forEach((t) => classesSet.add(t));
    });

    const classesArray = Array.from(classesSet);
    return {
      tailwindClasses: classesArray.join(" "),
      count: classesArray.length,
    };
  }, [cssInput]);

  const handleCopy = () => {
    if (!tailwindClasses) return;
    navigator.clipboard.writeText(tailwindClasses);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-accent" /> CSS to Tailwind Converter
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Convert standard CSS declarations or rule blocks into clean, optimized Tailwind utility classes.
          </p>
        </div>

        {count > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-mono text-xs font-semibold text-accent border border-accent/30">
            <Sparkles className="h-3.5 w-3.5" /> {count} Tailwind classes generated
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* Left: Input CSS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input CSS Styles / Rules
            </label>
            <button
              onClick={() => setCssInput("")}
              className="text-[11px] font-mono text-muted-foreground hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <textarea
            id={inputId}
            value={cssInput}
            onChange={(e) => setCssInput(e.target.value)}
            placeholder="Paste your CSS styles or rule block here..."
            spellCheck={false}
            className="h-80 w-full rounded-xl border border-border/70 bg-background p-3.5 font-mono text-xs leading-relaxed outline-none focus:border-accent"
          />
        </div>

        {/* Right: Output Tailwind */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Generated Tailwind Classes
            </span>

            <button
              onClick={handleCopy}
              disabled={!tailwindClasses}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1 font-mono text-xs font-medium text-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Classes
                </>
              )}
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-border/70 bg-background/50 p-4 font-mono text-xs overflow-auto min-h-[240px]">
            {tailwindClasses ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-accent font-semibold leading-relaxed break-words">
                  {tailwindClasses}
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">JSX Usage Example:</p>
                  <code className="block rounded bg-background p-2 text-foreground/90 font-mono text-xs overflow-x-auto">
                    {`<div className="${tailwindClasses}">Content</div>`}
                  </code>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">// Paste CSS styles on the left to generate Tailwind classes...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
