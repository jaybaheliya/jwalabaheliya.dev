"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Layout, Sparkles, Grid3x3, Sliders } from "lucide-react";

type BentoPreset = {
  name: string;
  cols: string;
  cards: { title: string; subtitle: string; span: string; bg: string }[];
};

const BENTO_PRESETS: BentoPreset[] = [
  {
    name: "Apple / Vercel Bento 4-Box",
    cols: "grid-cols-1 md:grid-cols-3",
    cards: [
      { title: "⚡ Lightning Fast Engine", subtitle: "Built for instant page loads & 100/100 Lighthouse performance.", span: "md:col-span-2 md:row-span-2", bg: "from-blue-500/15 via-indigo-500/5 to-transparent" },
      { title: "🔒 Enterprise Security", subtitle: "End-to-end encryption & SOC2 compliance.", span: "md:col-span-1", bg: "from-emerald-500/15 via-teal-500/5 to-transparent" },
      { title: "🌐 Global Edge Network", subtitle: "Deployed across 300+ edge locations globally.", span: "md:col-span-1", bg: "from-purple-500/15 via-pink-500/5 to-transparent" },
      { title: "📊 Live Analytics", subtitle: "Real-time user engagement insights.", span: "md:col-span-3", bg: "from-amber-500/15 via-orange-500/5 to-transparent" },
    ],
  },
  {
    name: "Dashboard 3-Column Grid",
    cols: "grid-cols-1 md:grid-cols-4",
    cards: [
      { title: "📈 Revenue Overview", subtitle: "$128,450 ARR (+24% this month)", span: "md:col-span-2", bg: "from-emerald-500/15 via-teal-500/5 to-transparent" },
      { title: "👥 Active Users", subtitle: "42,890 monthly active sessions", span: "md:col-span-1", bg: "from-blue-500/15 via-sky-500/5 to-transparent" },
      { title: "⚡ Server Load", subtitle: "99.99% uptime · 14ms latency", span: "md:col-span-1", bg: "from-purple-500/15 via-violet-500/5 to-transparent" },
      { title: "📋 Activity Feed", subtitle: "Live user transactions & audit logs", span: "md:col-span-4", bg: "from-slate-500/15 via-zinc-500/5 to-transparent" },
    ],
  },
  {
    name: "Hero Feature Grid",
    cols: "grid-cols-1 md:grid-cols-2",
    cards: [
      { title: "🚀 Launch Products Faster", subtitle: "Pre-built accessible UI components & tokens.", span: "md:col-span-1 md:row-span-2", bg: "from-sky-500/20 via-cyan-500/5 to-transparent" },
      { title: "🎨 Design System Integration", subtitle: "Tokens synced directly from Figma.", span: "md:col-span-1", bg: "from-rose-500/15 via-pink-500/5 to-transparent" },
      { title: "📱 Responsive Out-of-the-Box", subtitle: "Flawless rendering on desktop, tablet & mobile.", span: "md:col-span-1", bg: "from-amber-500/15 via-orange-500/5 to-transparent" },
    ],
  },
];

export function BentoGridStudio() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [gap, setGap] = useState<"gap-3" | "gap-4" | "gap-6">("gap-4");
  const [rounded, setRounded] = useState<"rounded-xl" | "rounded-2xl" | "rounded-3xl">("rounded-2xl");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const preset = BENTO_PRESETS[selectedPresetIndex];

  const { tailwindCode, cssCode } = useMemo(() => {
    const cardsJsx = preset.cards
      .map(
        (c) =>
          `  <div className="${rounded} border border-border/70 bg-card p-6 shadow-md ${c.span}">\n    <h4 className="text-lg font-bold">${c.title}</h4>\n    <p className="mt-1 text-sm text-muted-foreground">${c.subtitle}</p>\n  </div>`
      )
      .join("\n\n");

    const tw = `<div className="grid ${preset.cols} ${gap}">\n${cardsJsx}\n</div>`;
    const css = `.bento-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: ${gap === "gap-3" ? "12px" : gap === "gap-4" ? "16px" : "24px"};\n}`;

    return { tailwindCode: tw, cssCode: css };
  }, [preset, gap, rounded]);

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
            <Layout className="h-5 w-5 text-accent" /> Bento Grid & Flexbox Layout Studio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Build modern Apple / Vercel-style bento box grids with live component preview & Tailwind code export.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Layout Presets:</span>
          {BENTO_PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => setSelectedPresetIndex(idx)}
              className={
                "rounded-full border px-3 py-1 text-xs font-mono transition-colors " +
                (selectedPresetIndex === idx
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:border-accent")
              }
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="my-5 flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span>Gap:</span>
          {(["gap-3", "gap-4", "gap-6"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGap(g)}
              className={
                "px-2.5 py-1 rounded-md border text-xs transition-colors " +
                (gap === g ? "border-accent bg-accent text-accent-foreground font-semibold" : "border-border bg-background text-muted-foreground")
              }
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Border Radius:</span>
          {(["rounded-xl", "rounded-2xl", "rounded-3xl"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRounded(r)}
              className={
                "px-2.5 py-1 rounded-md border text-xs transition-colors " +
                (rounded === r ? "border-accent bg-accent text-accent-foreground font-semibold" : "border-border bg-background text-muted-foreground")
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Live Bento Render Canvas */}
      <div className="mb-6 rounded-xl border border-border/70 bg-background/60 p-5 overflow-hidden">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Live Interactive Bento Grid Preview
        </div>

        <div className={`grid ${preset.cols} ${gap}`}>
          {preset.cards.map((card, i) => (
            <div
              key={i}
              className={`${rounded} border border-border/70 bg-gradient-to-br ${card.bg} bg-card p-6 shadow-md backdrop-blur-md transition-all hover:scale-[1.01] hover:border-accent/50 ${card.span}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Card 0{i + 1}</span>
                <Sparkles className="h-4 w-4 text-accent/60" />
              </div>
              <h4 className="font-display font-bold text-lg text-foreground mt-3">{card.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code Export */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tailwind CSS Grid Code</span>
            <button
              onClick={() => handleCopy(tailwindCode, "tw")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "tw" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{tailwindCode}</pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vanilla CSS Grid Code</span>
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
