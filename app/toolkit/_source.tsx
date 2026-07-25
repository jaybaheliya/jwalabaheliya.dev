"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveToolkitId } from "@/lib/toolkit-content";
import {
  ArrowLeft, Copy, Check, Search, Star, X, Palette, Type, Square, Smartphone,
  Code2, Ruler, Wand2, Gauge, Hash, Sparkles, Layout, Zap, Component, Waves,
  Grid3x3, Shapes, Timer, KeyRound, QrCode, FileJson, Link2, Braces,
} from "lucide-react";
import { Loader2, FileText, Image as ImageIcon, Terminal, Lock, Tag, ScrollText, Percent } from "lucide-react";
import { SnippetsGallery } from "@/components/toolkit-snippets-extra";



type Category =
  | "CSS" | "Layout" | "JavaScript" | "Color" | "Typography"
  | "Responsive" | "Utilities" | "Components" | "Wow";

type Tool = {
  id: string;
  name: string;
  category: Category;
  keywords?: string;
  icon: React.ComponentType<{ className?: string }>;
  render: () => React.ReactNode;
};

function ToolkitPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All" | "Favorites" | "Recent">("All");
  const [favs, setFavs] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [spotlightId, setSpotlightId] = useState("flex");

  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem("tk:favs") || "[]"));
      setRecent(JSON.parse(localStorage.getItem("tk:recent") || "[]"));
    } catch {}
  }, []);

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem("tk:favs", JSON.stringify(next));
  };
  const markRecent = (id: string) => {
    const next = [id, ...recent.filter((r) => r !== id)].slice(0, 8);
    setRecent(next);
    localStorage.setItem("tk:recent", JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (cat === "Favorites") return favs.includes(tool.id);
      if (cat === "Recent") return recent.includes(tool.id);
      if (cat !== "All" && tool.category !== cat) return false;
      if (!t) return true;
      return (tool.name + " " + tool.category + " " + (tool.keywords ?? "")).toLowerCase().includes(t);
    });
  }, [q, cat, favs, recent]);

  const categoryCounts = useMemo(() => {
    return TOOLS.reduce<Record<string, number>>((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault(); searchRef.current?.focus();
      }
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const openTool = TOOLS.find((t) => t.id === openId);
  const spotlightTool = TOOLS.find((tool) => tool.id === spotlightId) ?? filtered[0] ?? TOOLS[0];
  const spotlightTags = (spotlightTool.keywords || `${spotlightTool.category.toLowerCase()} live preview copy ready`)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  const featuredTools = ["flex", "grid-overlay", "json-types", "img-placeholder"]
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => Boolean(tool));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 md:px-8 py-3">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="hidden md:block font-display text-lg font-bold tracking-tight">
            Toolkit<span className="text-accent">.</span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…  press /"
              className="w-full rounded-full border border-border bg-card/60 pl-9 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <a href="mailto:jaybaheliya@gmail.com" className="hidden sm:inline-flex min-h-9 items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">Hire me</a>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 md:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {(["All", "Favorites", "Recent", "CSS", "Layout", "JavaScript", "Color", "Typography", "Responsive", "Utilities", "Components", "Wow"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={"shrink-0 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-widest transition " + (cat === c ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {c === "Favorites" ? "★ Favs (" + favs.length + ")" : c === "Recent" ? "Recent (" + recent.length + ")" : c}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-4 md:px-8 pt-10 pb-4">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Frontend toolkit · v2</div>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2 leading-[1.05]">
          Tools. Live previews. <span className="text-accent">Copy‑ready.</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm md:text-base">
          Everything I reach for daily — CSS generators, JavaScript snippets, color and typography helpers, responsive checker and a components library. No sign‑ups, no backend.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-8 pb-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)]">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(245,158,11,0.14),transparent_26%),linear-gradient(180deg,rgba(127,127,127,0.05),transparent)]" />
            <div className="relative">
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Interactive Spotlight</div>
              <div className="mt-3 max-w-3xl font-display text-3xl font-bold leading-[1.06] md:text-5xl">
                Explore the toolkit like a <span className="text-accent">preview-driven lab</span>, not just a tool list.
              </div>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
                Hover any tool card below and this spotlight updates instantly. It makes the page feel more alive and helps people understand the route, category, and value before opening a tool.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Tool Count</div>
                  <div className="mt-2 text-3xl font-semibold">{TOOLS.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">live utilities in the toolkit</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">JavaScript</div>
                  <div className="mt-2 text-3xl font-semibold">{categoryCounts.JavaScript || 0}</div>
                  <div className="mt-1 text-xs text-muted-foreground">code and conversion focused tools</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Favorites</div>
                  <div className="mt-2 text-3xl font-semibold">{favs.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">saved for quick return visits</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-5 md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,rgba(127,127,127,0.05),transparent)]" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Live Spotlight</div>
                  <div className="mt-2 text-2xl font-semibold">{spotlightTool.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{spotlightTool.category} · route preview</div>
                </div>
                <Link href={`/toolkit/${spotlightTool.id}`} className="rounded-full border border-border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide text-muted-foreground transition hover:border-accent hover:text-accent">
                  /toolkit/{spotlightTool.id}
                </Link>
              </div>

              <div className="rounded-[28px] border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
                          <spotlightTool.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-display text-lg font-semibold">{spotlightTool.name}</div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{spotlightTool.category}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {spotlightTags.map((tag) => (
                          <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-dashed border-border bg-card p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Preview</div>
                        <div className="mt-2 text-sm text-foreground">Live controls</div>
                      </div>
                      <div className="rounded-2xl border border-dashed border-border bg-card p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Output</div>
                        <div className="mt-2 text-sm text-foreground">Copy-ready result</div>
                      </div>
                      <div className="rounded-2xl border border-dashed border-border bg-card p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Docs</div>
                        <div className="mt-2 text-sm text-foreground">Shareable route</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border bg-[linear-gradient(180deg,rgba(127,127,127,0.08),transparent)] p-4">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-3">
                        <div className="h-3 w-20 rounded-full bg-accent/40" />
                        <div className="mt-3 h-10 rounded-2xl bg-foreground/10" />
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="h-16 rounded-2xl bg-accent/20" />
                          <div className="h-16 rounded-2xl bg-foreground/10" />
                          <div className="h-16 rounded-2xl bg-accent/15" />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-card p-3">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Hint</div>
                        <div className="mt-2 text-sm text-muted-foreground">Move across the grid below and the spotlight refreshes instantly.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-8 pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No tools match “{q}”. Try a different keyword.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => {
              const Icon = t.icon;
              const isFav = favs.includes(t.id);
              return (
                <Link
                  key={t.id}
                  href={`/toolkit/${t.id}`}
                  onClick={() => { markRecent(t.id); }}
                  onMouseEnter={() => setSpotlightId(t.id)}
                  onFocus={() => setSpotlightId(t.id)}
                  className={"group relative text-left rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 " + (spotlightTool.id === t.id ? "border-accent/70 shadow-[0_0_0_1px_rgba(59,130,246,0.16)]" : "border-border hover:border-accent/60")}
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(t.id); }}
                      className={"h-8 w-8 grid place-items-center rounded-full border border-transparent hover:border-border transition " + (isFav ? "text-accent" : "text-muted-foreground/60")}
                      aria-label="favorite"
                      role="button"
                    >
                      <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                    </span>
                  </div>
                  <div className="mt-3 font-display text-base font-semibold">{t.name}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.category}</div>
                  <div className="mt-3 text-xs text-accent opacity-0 group-hover:opacity-100 transition font-mono">Open →</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {openTool && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="relative w-full sm:max-w-5xl max-h-[92vh] overflow-auto rounded-t-3xl sm:rounded-3xl border border-border bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent grid place-items-center shrink-0">
                  <openTool.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold truncate">{openTool.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{openTool.category}</div>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="h-9 w-9 grid place-items-center rounded-full border border-border hover:border-accent hover:text-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {openTool.render()}
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border/60 py-8 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Built by Jwala Baheliya · <Link href="/" className="hover:text-accent">Portfolio</Link> · <Link href="/tools" className="hover:text-accent">Recruiter tools</Link>
      </footer>
    </div>
  );
}

/* ---------- helpers ---------- */
function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider hover:border-accent hover:text-accent transition"
    >
      {ok ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {ok ? "Copied" : label}
    </button>
  );
}
function CodeBlock({ code, lang = "css" }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-black/60 text-white font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="uppercase tracking-widest text-[10px] text-white/60">{lang}</span>
        <CopyBtn value={code} />
      </div>
      <pre className="p-3 overflow-auto max-h-72 whitespace-pre-wrap break-all leading-relaxed">{code}</pre>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs font-mono">
      <span className="uppercase tracking-widest text-muted-foreground w-24">{label}</span>
      {children}
    </label>
  );
}
function SliderInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-[color:var(--accent)]" />
      <span className="tabular-nums w-10 text-right">{value}</span>
    </>
  );
}
function Slider({ label, v, on, min, max, step = 1 }: { label: string; v: number; on: (n: number) => void; min: number; max: number; step?: number }) {
  return <Row label={label}><SliderInput value={v} onChange={on} min={min} max={max} step={step} /></Row>;
}
function SelectControl({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-xs font-mono">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}
function Preview({ children, dark = true, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={"rounded-xl border border-border grid place-items-center min-h-[220px] p-6 " + (dark ? "bg-neutral-900" : "bg-neutral-100 text-neutral-900") + " " + className}>
      {children}
    </div>
  );
}
function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 };
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function relLum({ r, g, b }: { r: number; g: number; b: number }) {
  const a = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(a: string, b: string) {
  const L1 = relLum(hexToRgb(a)), L2 = relLum(hexToRgb(b));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- CSS Tools ---------- */
function BoxShadow() {
  const [x, setX] = useState(0), [y, setY] = useState(20), [b, setB] = useState(40), [s, setS] = useState(-10);
  const [c, setC] = useState("#000000"), [o, setO] = useState(30), [inset, setInset] = useState(false);
  const rgb = hexToRgb(c);
  const css = "box-shadow: " + (inset ? "inset " : "") + x + "px " + y + "px " + b + "px " + s + "px rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + (o / 100).toFixed(2) + ");";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="X"><SliderInput value={x} onChange={setX} min={-50} max={50} /></Row>
        <Row label="Y"><SliderInput value={y} onChange={setY} min={-50} max={50} /></Row>
        <Row label="Blur"><SliderInput value={b} onChange={setB} min={0} max={150} /></Row>
        <Row label="Spread"><SliderInput value={s} onChange={setS} min={-50} max={50} /></Row>
        <Row label="Opacity"><SliderInput value={o} onChange={setO} min={0} max={100} /></Row>
        <div className="flex items-center gap-3 text-xs font-mono">
          <label className="flex items-center gap-2"><input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} /> Inset</label>
          <label className="flex items-center gap-2">Color <input type="color" value={c} onChange={(e) => setC(e.target.value)} className="h-6 w-10" /></label>
        </div>
        <CodeBlock code={css} />
      </div>
      <Preview><div className="h-40 w-40 rounded-2xl bg-white" style={{ boxShadow: (inset ? "inset " : "") + x + "px " + y + "px " + b + "px " + s + "px rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + o / 100 + ")" }} /></Preview>
    </div>
  );
}

function Gradient() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [c1, setC1] = useState("#f59e0b"), [c2, setC2] = useState("#ef4444"), [angle, setAngle] = useState(135);
  const css = type === "linear"
    ? "background: linear-gradient(" + angle + "deg, " + c1 + ", " + c2 + ");"
    : "background: radial-gradient(circle at center, " + c1 + ", " + c2 + ");";
  const bg = type === "linear" ? "linear-gradient(" + angle + "deg, " + c1 + ", " + c2 + ")" : "radial-gradient(circle at center, " + c1 + ", " + c2 + ")";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
          {(["linear", "radial"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={"px-3 py-1 rounded-full uppercase " + (type === t ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{t}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-mono">From <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-8 w-14" /></label>
        <label className="flex items-center gap-2 text-xs font-mono">To <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-8 w-14" /></label>
        {type === "linear" && <Row label="Angle"><SliderInput value={angle} onChange={setAngle} min={0} max={360} /></Row>}
        <CodeBlock code={css} />
      </div>
      <div className="rounded-xl border border-border min-h-[220px]" style={{ background: bg }} />
    </div>
  );
}

function BorderRadius() {
  const [tl, setTl] = useState(24), [tr, setTr] = useState(24), [br, setBr] = useState(24), [bl, setBl] = useState(24);
  const css = "border-radius: " + tl + "px " + tr + "px " + br + "px " + bl + "px;";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Top L"><SliderInput value={tl} onChange={setTl} min={0} max={200} /></Row>
        <Row label="Top R"><SliderInput value={tr} onChange={setTr} min={0} max={200} /></Row>
        <Row label="Bot R"><SliderInput value={br} onChange={setBr} min={0} max={200} /></Row>
        <Row label="Bot L"><SliderInput value={bl} onChange={setBl} min={0} max={200} /></Row>
        <CodeBlock code={css} />
      </div>
      <Preview><div className="h-40 w-40 bg-gradient-to-br from-amber-400 to-rose-500" style={{ borderRadius: tl + "px " + tr + "px " + br + "px " + bl + "px" }} /></Preview>
    </div>
  );
}

function Glassmorphism() {
  const [blur, setBlur] = useState(16), [op, setOp] = useState(20), [rad, setRad] = useState(20), [border, setBorder] = useState(true);
  const css = "background: rgba(255,255,255," + (op / 100).toFixed(2) + ");\nbackdrop-filter: blur(" + blur + "px) saturate(150%);\nborder-radius: " + rad + "px;" + (border ? "\nborder: 1px solid rgba(255,255,255,0.25);" : "");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Blur"><SliderInput value={blur} onChange={setBlur} min={0} max={40} /></Row>
        <Row label="Opacity"><SliderInput value={op} onChange={setOp} min={0} max={100} /></Row>
        <Row label="Radius"><SliderInput value={rad} onChange={setRad} min={0} max={60} /></Row>
        <label className="text-xs font-mono flex items-center gap-2"><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /> Border</label>
        <CodeBlock code={css} />
      </div>
      <div className="rounded-xl min-h-[220px] p-6 grid place-items-center" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6)" }}>
        <div className="h-40 w-56" style={{ background: "rgba(255,255,255," + op / 100 + ")", backdropFilter: "blur(" + blur + "px) saturate(150%)", borderRadius: rad, border: border ? "1px solid rgba(255,255,255,0.25)" : undefined }} />
      </div>
    </div>
  );
}

function Neumorphism() {
  const [size, setSize] = useState(20), [dist, setDist] = useState(20), [intensity, setIntensity] = useState(15), [bg, setBg] = useState("#e0e5ec");
  const rgb = hexToRgb(bg);
  const dark = "rgba(" + Math.max(rgb.r - 40, 0) + "," + Math.max(rgb.g - 40, 0) + "," + Math.max(rgb.b - 40, 0) + "," + intensity / 100 + ")";
  const light = "rgba(255,255,255," + (intensity + 30) / 100 + ")";
  const css = "background: " + bg + ";\nborder-radius: " + size + "px;\nbox-shadow: " + dist + "px " + dist + "px " + dist * 2 + "px " + dark + ", -" + dist + "px -" + dist + "px " + dist * 2 + "px " + light + ";";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Radius"><SliderInput value={size} onChange={setSize} min={0} max={60} /></Row>
        <Row label="Distance"><SliderInput value={dist} onChange={setDist} min={5} max={40} /></Row>
        <Row label="Intensity"><SliderInput value={intensity} onChange={setIntensity} min={5} max={40} /></Row>
        <label className="text-xs font-mono flex items-center gap-2">BG <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-6 w-12" /></label>
        <CodeBlock code={css} />
      </div>
      <div className="rounded-xl min-h-[240px] grid place-items-center" style={{ background: bg }}>
        <div className="h-32 w-32" style={{ background: bg, borderRadius: size, boxShadow: dist + "px " + dist + "px " + dist * 2 + "px " + dark + ", -" + dist + "px -" + dist + "px " + dist * 2 + "px " + light }} />
      </div>
    </div>
  );
}

function CssGrid() {
  const [mode, setMode] = useState<"fixed" | "auto-fit">("fixed");
  const [cols, setCols] = useState(3), [rows, setRows] = useState(2), [gap, setGap] = useState(12);
  const [minCol, setMinCol] = useState(160), [rowHeight, setRowHeight] = useState(80);
  const [justify, setJustify] = useState("stretch"), [align, setAlign] = useState("stretch");
  const [selected, setSelected] = useState(1), [colSpan, setColSpan] = useState(2), [rowSpan, setRowSpan] = useState(1);
  const total = mode === "fixed" ? cols * rows : 8;
  const gridTemplateColumns = mode === "fixed" ? "repeat(" + cols + ", minmax(0, 1fr))" : "repeat(auto-fit, minmax(" + minCol + "px, 1fr))";
  const gridTemplateRows = mode === "fixed" ? "repeat(" + rows + ", minmax(" + rowHeight + "px, auto))" : "auto";
  const css = "display: grid;\n" +
    "grid-template-columns: " + gridTemplateColumns + ";\n" +
    (mode === "fixed" ? "grid-template-rows: " + gridTemplateRows + ";\n" : "") +
    "gap: " + gap + "px;\n" +
    "justify-items: " + justify + ";\n" +
    "align-items: " + align + ";";
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
          {(["fixed", "auto-fit"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={"rounded-full px-3 py-1 uppercase " + (mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{m}</button>)}
        </div>
        {mode === "fixed" ? (
          <>
            <Row label="Columns"><SliderInput value={cols} onChange={setCols} min={1} max={12} /></Row>
            <Row label="Rows"><SliderInput value={rows} onChange={setRows} min={1} max={8} /></Row>
          </>
        ) : (
          <Row label="Min col"><SliderInput value={minCol} onChange={setMinCol} min={100} max={280} step={10} /></Row>
        )}
        <Row label="Row size"><SliderInput value={rowHeight} onChange={setRowHeight} min={48} max={180} step={4} /></Row>
        <Row label="Gap"><SliderInput value={gap} onChange={setGap} min={0} max={60} /></Row>
        <div className="grid gap-3 md:grid-cols-2 text-xs font-mono">
          <div className="flex items-center gap-2"><span className="w-24 uppercase text-muted-foreground">justify</span><SelectControl value={justify} onChange={setJustify} options={["stretch", "start", "center", "end"]} /></div>
          <div className="flex items-center gap-2"><span className="w-24 uppercase text-muted-foreground">align</span><SelectControl value={align} onChange={setAlign} options={["stretch", "start", "center", "end"]} /></div>
        </div>
        <CodeBlock code={css} />
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="font-display text-base font-semibold">Selected item</div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2 text-xs font-mono"><span className="w-16 uppercase text-muted-foreground">item</span><SelectControl value={String(selected)} onChange={(v) => setSelected(Number(v))} options={Array.from({ length: Math.min(total, 9) }, (_, i) => String(i + 1))} /></div>
            <Row label="Col span"><SliderInput value={colSpan} onChange={setColSpan} min={1} max={Math.max(mode === "fixed" ? cols : 4, 1)} /></Row>
            <Row label="Row span"><SliderInput value={rowSpan} onChange={setRowSpan} min={1} max={4} /></Row>
          </div>
        </div>
      </div>
      <Preview>
        <div style={{ display: "grid", gridTemplateColumns, gridTemplateRows, justifyItems: justify as React.CSSProperties["justifyItems"], alignItems: align as React.CSSProperties["alignItems"], gap, width: "100%", minHeight: 260 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={i + 1 === selected ? { gridColumn: "span " + colSpan, gridRow: "span " + rowSpan } : undefined}
              className={"rounded-md border grid place-items-center text-xs font-mono transition-all " + (i + 1 === selected ? "bg-accent text-accent-foreground border-accent" : "bg-accent/20 border-accent/40 text-accent")}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </Preview>
    </div>
  );
}

function FlexPlay() {
  const [dir, setDir] = useState<"row" | "row-reverse" | "column" | "column-reverse">("row");
  const [jc, setJc] = useState("flex-start");
  const [ai, setAi] = useState("stretch");
  const [ac, setAc] = useState("stretch");
  const [wrap, setWrap] = useState(false);
  const [gap, setGap] = useState(8), [pad, setPad] = useState(12);
  const [selected, setSelected] = useState(2), [grow, setGrow] = useState(1), [shrink, setShrink] = useState(1), [basis, setBasis] = useState(140), [order, setOrder] = useState(0), [itemAlign, setItemAlign] = useState("auto");
  const css = "display: flex;\nflex-direction: " + dir + ";\njustify-content: " + jc + ";\nalign-items: " + ai + ";\nalign-content: " + ac + ";\nflex-wrap: " + (wrap ? "wrap" : "nowrap") + ";\ngap: " + gap + "px;\npadding: " + pad + "px;";
  const itemCss = ".item-" + selected + " {\n  order: " + order + ";\n  flex: " + grow + " " + shrink + " " + basis + "px;\n  align-self: " + itemAlign + ";\n}";
  const isColumn = dir.includes("column");
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4 text-xs font-mono">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">container controls</div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">direction</div>
              <SelectControl value={dir} onChange={(value) => setDir(value as typeof dir)} options={["row", "row-reverse", "column", "column-reverse"]} />
            </div>
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">justify</div>
              <SelectControl value={jc} onChange={setJc} options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} />
            </div>
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">align items</div>
              <SelectControl value={ai} onChange={setAi} options={["stretch", "flex-start", "center", "flex-end", "baseline"]} />
            </div>
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">align content</div>
              <SelectControl value={ac} onChange={setAc} options={["stretch", "flex-start", "center", "flex-end", "space-between", "space-around"]} />
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"><input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} /> wrap items</label>
          <Row label="Gap"><SliderInput value={gap} onChange={setGap} min={0} max={60} /></Row>
          <Row label="Padding"><SliderInput value={pad} onChange={setPad} min={0} max={40} /></Row>
          <CodeBlock code={css} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="font-display text-base font-semibold">Selected item</div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">item</div>
              <SelectControl value={String(selected)} onChange={(v) => setSelected(Number(v))} options={["1", "2", "3", "4", "5"]} />
            </div>
            <div className="space-y-1">
              <div className="uppercase tracking-widest text-muted-foreground">align self</div>
              <SelectControl value={itemAlign} onChange={setItemAlign} options={["auto", "stretch", "flex-start", "center", "flex-end", "baseline"]} />
            </div>
            <Row label="Grow"><SliderInput value={grow} onChange={setGrow} min={0} max={4} /></Row>
            <Row label="Shrink"><SliderInput value={shrink} onChange={setShrink} min={0} max={4} /></Row>
            <Row label="Basis"><SliderInput value={basis} onChange={setBasis} min={40} max={220} step={10} /></Row>
            <Row label="Order"><SliderInput value={order} onChange={setOrder} min={-3} max={5} /></Row>
          </div>
          <CodeBlock code={itemCss} lang="css" />
        </div>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">main axis</div>
            <div className="mt-1 text-sm font-semibold">{isColumn ? "vertical" : "horizontal"}</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">cross axis</div>
            <div className="mt-1 text-sm font-semibold">{isColumn ? "horizontal" : "vertical"}</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">selected flex</div>
            <div className="mt-1 text-sm font-semibold">{grow} {shrink} {basis}px</div>
          </div>
        </div>
        <Preview className="overflow-hidden">
          <div style={{ display: "flex", flexDirection: dir, justifyContent: jc, alignItems: ai, alignContent: ac as React.CSSProperties["alignContent"], flexWrap: wrap ? "wrap" : "nowrap", gap, padding: pad, width: "100%", minHeight: isColumn ? 420 : 300, minWidth: 0 }}>
            {[110, 150, 90, 130, 100].map((w, i) => <div key={i} style={i + 1 === selected ? { width: isColumn ? "100%" : w, minWidth: isColumn ? undefined : w, minHeight: isColumn ? basis : undefined, order, flex: grow + " " + shrink + " " + basis + "px", alignSelf: itemAlign as React.CSSProperties["alignSelf"] } : { width: isColumn ? "100%" : w, minWidth: isColumn ? undefined : w, minHeight: isColumn ? Math.max(72, w) : undefined }} className={"rounded-xl border grid place-items-center px-3 text-xs transition-all " + (isColumn ? "h-auto" : "h-14") + " " + (i + 1 === selected ? "bg-accent text-accent-foreground border-accent" : "bg-accent/35 border-accent/60 text-foreground")}>{i + 1}</div>)}
          </div>
        </Preview>
      </div>
    </div>
  );
}

function ClampFont() {
  const [minV, setMinV] = useState(16), [maxV, setMaxV] = useState(48), [minVw, setMinVw] = useState(320), [maxVw, setMaxVw] = useState(1280);
  const slope = (maxV - minV) / (maxVw - minVw);
  const yInt = -minVw * slope + minV;
  const pref = yInt.toFixed(3) + "px + " + (slope * 100).toFixed(3) + "vw";
  const css = "font-size: clamp(" + minV + "px, " + pref + ", " + maxV + "px);";
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Row label="Min size"><SliderInput value={minV} onChange={setMinV} min={8} max={80} /></Row>
        <Row label="Max size"><SliderInput value={maxV} onChange={setMaxV} min={12} max={200} /></Row>
        <Row label="Min vw"><SliderInput value={minVw} onChange={setMinVw} min={280} max={800} /></Row>
        <Row label="Max vw"><SliderInput value={maxVw} onChange={setMaxVw} min={800} max={2000} /></Row>
      </div>
      <CodeBlock code={css} />
      <Preview><div style={{ fontSize: "clamp(" + minV + "px, " + pref + ", " + maxV + "px)" }} className="font-display font-bold text-center">Fluid Typography</div></Preview>
    </div>
  );
}

function AspectRatio() {
  const [w, setW] = useState(16), [h, setH] = useState(9);
  const css = "aspect-ratio: " + w + " / " + h + ";";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Width"><SliderInput value={w} onChange={setW} min={1} max={32} /></Row>
        <Row label="Height"><SliderInput value={h} onChange={setH} min={1} max={32} /></Row>
        <CodeBlock code={css} />
      </div>
      <Preview><div className="bg-accent/30 border border-accent/50 rounded-md w-full max-w-sm grid place-items-center font-mono text-sm" style={{ aspectRatio: w + "/" + h }}>{w}:{h}</div></Preview>
    </div>
  );
}

function CssTriangle() {
  const [size, setSize] = useState(60), [color, setColor] = useState("#f59e0b"), [dir, setDir] = useState<"up" | "down" | "left" | "right">("up");
  const map: Record<string, string> = {
    up: "border-left: " + size + "px solid transparent; border-right: " + size + "px solid transparent; border-bottom: " + size + "px solid " + color + ";",
    down: "border-left: " + size + "px solid transparent; border-right: " + size + "px solid transparent; border-top: " + size + "px solid " + color + ";",
    left: "border-top: " + size + "px solid transparent; border-bottom: " + size + "px solid transparent; border-right: " + size + "px solid " + color + ";",
    right: "border-top: " + size + "px solid transparent; border-bottom: " + size + "px solid transparent; border-left: " + size + "px solid " + color + ";",
  };
  const css = "width: 0;\nheight: 0;\n" + map[dir];
  const styleFor = () => {
    const s: React.CSSProperties = { width: 0, height: 0 };
    if (dir === "up") { s.borderLeft = size + "px solid transparent"; s.borderRight = size + "px solid transparent"; s.borderBottom = size + "px solid " + color; }
    if (dir === "down") { s.borderLeft = size + "px solid transparent"; s.borderRight = size + "px solid transparent"; s.borderTop = size + "px solid " + color; }
    if (dir === "left") { s.borderTop = size + "px solid transparent"; s.borderBottom = size + "px solid transparent"; s.borderRight = size + "px solid " + color; }
    if (dir === "right") { s.borderTop = size + "px solid transparent"; s.borderBottom = size + "px solid transparent"; s.borderLeft = size + "px solid " + color; }
    return s;
  };
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Size"><SliderInput value={size} onChange={setSize} min={10} max={200} /></Row>
        <label className="text-xs font-mono flex items-center gap-2">Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-6 w-12" /></label>
        <div className="flex gap-2 text-xs font-mono">
          {(["up", "down", "left", "right"] as const).map((d) => (
            <button key={d} onClick={() => setDir(d)} className={"px-3 py-1 rounded-full border " + (dir === d ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{d}</button>
          ))}
        </div>
        <CodeBlock code={css} />
      </div>
      <Preview><div style={styleFor()} /></Preview>
    </div>
  );
}

function CssFilter() {
  const [blur, setBlur] = useState(0), [bright, setBright] = useState(100), [contrast, setContrast] = useState(100), [gray, setGray] = useState(0), [hue, setHue] = useState(0), [sat, setSat] = useState(100), [sepia, setSepia] = useState(0), [invert, setInvert] = useState(0);
  const filter = "blur(" + blur + "px) brightness(" + bright + "%) contrast(" + contrast + "%) grayscale(" + gray + "%) hue-rotate(" + hue + "deg) saturate(" + sat + "%) sepia(" + sepia + "%) invert(" + invert + "%)";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <Row label="Blur"><SliderInput value={blur} onChange={setBlur} min={0} max={20} /></Row>
        <Row label="Bright"><SliderInput value={bright} onChange={setBright} min={0} max={200} /></Row>
        <Row label="Contrast"><SliderInput value={contrast} onChange={setContrast} min={0} max={200} /></Row>
        <Row label="Grayscale"><SliderInput value={gray} onChange={setGray} min={0} max={100} /></Row>
        <Row label="Hue"><SliderInput value={hue} onChange={setHue} min={0} max={360} /></Row>
        <Row label="Saturate"><SliderInput value={sat} onChange={setSat} min={0} max={200} /></Row>
        <Row label="Sepia"><SliderInput value={sepia} onChange={setSepia} min={0} max={100} /></Row>
        <Row label="Invert"><SliderInput value={invert} onChange={setInvert} min={0} max={100} /></Row>
        <CodeBlock code={"filter: " + filter + ";"} />
      </div>
      <Preview>
        <img src="https://images.unsplash.com/photo-1503264116251-35a269479413?w=600" alt="preview" className="rounded-lg max-h-56" style={{ filter }} />
      </Preview>
    </div>
  );
}

function TransformPlay() {
  const [rot, setRot] = useState(0), [sc, setSc] = useState(100), [skx, setSkx] = useState(0), [sky, setSky] = useState(0), [tx, setTx] = useState(0), [ty, setTy] = useState(0);
  const t = "rotate(" + rot + "deg) scale(" + sc / 100 + ") skew(" + skx + "deg," + sky + "deg) translate(" + tx + "px," + ty + "px)";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Rotate"><SliderInput value={rot} onChange={setRot} min={-180} max={180} /></Row>
        <Row label="Scale %"><SliderInput value={sc} onChange={setSc} min={10} max={200} /></Row>
        <Row label="Skew X"><SliderInput value={skx} onChange={setSkx} min={-45} max={45} /></Row>
        <Row label="Skew Y"><SliderInput value={sky} onChange={setSky} min={-45} max={45} /></Row>
        <Row label="Trans X"><SliderInput value={tx} onChange={setTx} min={-100} max={100} /></Row>
        <Row label="Trans Y"><SliderInput value={ty} onChange={setTy} min={-100} max={100} /></Row>
        <CodeBlock code={"transform: " + t + ";"} />
      </div>
      <Preview><div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center text-white font-bold" style={{ transform: t, transition: "transform .2s" }}>JB</div></Preview>
    </div>
  );
}

function Keyframes() {
  const [name, setName] = useState("pulse"), [dur, setDur] = useState(2), [ease, setEase] = useState("ease-in-out");
  const presets: Record<string, string> = {
    pulse: "@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: .7; } }",
    bounce: "@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }",
    spin: "@keyframes spin { to { transform: rotate(360deg); } }",
    shake: "@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }",
  };
  const css = presets[name] + "\n\n.element { animation: " + name + " " + dur + "s " + ease + " infinite; }";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3 text-xs font-mono">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(presets).map((k) => (
            <button key={k} onClick={() => setName(k)} className={"px-3 py-1 rounded-full border " + (name === k ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{k}</button>
          ))}
        </div>
        <Row label="Duration"><SliderInput value={dur} onChange={setDur} min={0.2} max={6} step={0.1} /></Row>
        <div className="flex gap-2 items-center"><span className="w-24 uppercase text-muted-foreground">easing</span>
          <select value={ease} onChange={(e) => setEase(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1">
            {["linear", "ease", "ease-in", "ease-out", "ease-in-out"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <CodeBlock code={css} />
      </div>
      <Preview>
        <style>{presets[name]}</style>
        <div className="h-24 w-24 rounded-2xl bg-accent" style={{ animation: name + " " + dur + "s " + ease + " infinite" }} />
      </Preview>
    </div>
  );
}

function ClipPath() {
  const shapes: Record<string, string> = {
    triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
    hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    circle: "circle(50% at 50% 50%)",
    ellipse: "ellipse(40% 50% at 50% 50%)",
    chevron: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)",
  };
  const [k, setK] = useState("hexagon");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {Object.keys(shapes).map((s) => (
            <button key={s} onClick={() => setK(s)} className={"px-3 py-1 rounded-full border " + (k === s ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{s}</button>
          ))}
        </div>
        <CodeBlock code={"clip-path: " + shapes[k] + ";"} />
      </div>
      <Preview><div className="h-40 w-40 bg-gradient-to-br from-amber-400 to-rose-500" style={{ clipPath: shapes[k] }} /></Preview>
    </div>
  );
}

function mulberry(seed: number) {
  return function () { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function BlobShape() {
  const [seed, setSeed] = useState(1);
  const path = useMemo(() => {
    const n = 6, r = 100, cx = 150, cy = 150;
    const rand = mulberry(seed);
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (0.75 + rand() * 0.5);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });
    return "M" + pts.map((p) => p.join(",")).join(" L") + " Z";
  }, [seed]);
  const svg = '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><path d="' + path + '" fill="#f59e0b"/></svg>';
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <button onClick={() => setSeed((s) => s + 1)} className="rounded-full bg-accent px-4 py-1.5 text-xs font-mono uppercase text-accent-foreground">Regenerate</button>
        <CodeBlock code={svg} lang="svg" />
      </div>
      <Preview><svg viewBox="0 0 300 300" className="h-56 w-56"><path d={path} fill="#f59e0b" /></svg></Preview>
    </div>
  );
}

function SvgWave() {
  const [amp, setAmp] = useState(40), [freq, setFreq] = useState(2), [color, setColor] = useState("#f59e0b");
  const w = 1440, h = 200;
  const points: string[] = [];
  for (let x = 0; x <= w; x += 20) {
    const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * freq) * amp;
    points.push(x + "," + y.toFixed(1));
  }
  const d = "M0," + h + " L" + points.join(" L") + " L" + w + "," + h + " Z";
  const svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg"><path d="' + d + '" fill="' + color + '"/></svg>';
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Row label="Amplitude"><SliderInput value={amp} onChange={setAmp} min={5} max={100} /></Row>
        <Row label="Frequency"><SliderInput value={freq} onChange={setFreq} min={1} max={8} /></Row>
        <label className="text-xs font-mono flex items-center gap-2">Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-6 w-12" /></label>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-neutral-900">
        <svg viewBox={"0 0 " + w + " " + h} className="w-full"><path d={d} fill={color} /></svg>
      </div>
      <CodeBlock code={svg} lang="svg" />
    </div>
  );
}

/* ---------- Color ---------- */
function ColorPicker() {
  const [c, setC] = useState("#f59e0b");
  const rgb = hexToRgb(c); const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const shades = Array.from({ length: 10 }, (_, i) => {
    const t = (i - 4.5) / 5;
    const mix = t < 0 ? { c: [0, 0, 0], w: -t } : { c: [255, 255, 255], w: t };
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v, k) => Math.round(v * (1 - mix.w) + mix.c[k] * mix.w));
    return rgbToHex(r, g, b);
  });
  const rows: [string, string][] = [["HEX", c.toUpperCase()], ["RGB", "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")"], ["HSL", "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)"]];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <input type="color" value={c} onChange={(e) => setC(e.target.value)} className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-10 h-10 rounded-lg overflow-hidden">
          {shades.map((s) => <button key={s} title={s} onClick={() => setC(s)} style={{ background: s }} />)}
        </div>
        <div className="space-y-1 text-xs font-mono">
          {rows.map(([l, v]) => (
            <div key={l} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span><span className="text-muted-foreground mr-2">{l}</span>{v}</span><CopyBtn value={v} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-6 grid gap-3" style={{ background: c }}>
        <div className="rounded-lg bg-black/80 text-white p-4"><div className="text-[10px] font-mono uppercase opacity-70">Dark</div><div className="font-display text-2xl font-bold">Aa Bb 123</div></div>
        <div className="rounded-lg bg-white text-black p-4"><div className="text-[10px] font-mono uppercase opacity-70">Light</div><div className="font-display text-2xl font-bold" style={{ color: c }}>Aa Bb 123</div></div>
      </div>
    </div>
  );
}

function ContrastChecker() {
  const [fg, setFg] = useState("#ffffff"), [bg, setBg] = useState("#f59e0b");
  const ratio = contrastRatio(fg, bg);
  const badge = (label: string, ok: boolean) => (
    <span className={"rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " + (ok ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>{label} {ok ? "PASS" : "FAIL"}</span>
  );
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3 text-xs font-mono">
        <div className="flex gap-4">
          <label>FG <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="ml-2 h-8 w-14" /></label>
          <label>BG <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="ml-2 h-8 w-14" /></label>
        </div>
        <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between">Ratio<span className="font-bold text-lg">{ratio.toFixed(2)}:1</span></div>
        <div className="flex flex-wrap gap-2">
          {badge("AA normal", ratio >= 4.5)}
          {badge("AA large", ratio >= 3)}
          {badge("AAA normal", ratio >= 7)}
          {badge("AAA large", ratio >= 4.5)}
        </div>
      </div>
      <div className="rounded-xl grid place-items-center min-h-[220px] p-6" style={{ background: bg }}>
        <div style={{ color: fg }} className="text-center">
          <div className="font-display text-4xl font-bold">Aa Bb Cc</div>
          <div className="mt-2 text-sm">The quick brown fox jumps over the lazy dog.</div>
        </div>
      </div>
    </div>
  );
}

function TailwindPalette() {
  const palette: Record<string, string[]> = {
    slate: ["#f8fafc", "#e2e8f0", "#94a3b8", "#475569", "#0f172a"],
    red: ["#fee2e2", "#fca5a5", "#ef4444", "#b91c1c", "#7f1d1d"],
    amber: ["#fef3c7", "#fcd34d", "#f59e0b", "#b45309", "#78350f"],
    emerald: ["#d1fae5", "#6ee7b7", "#10b981", "#047857", "#064e3b"],
    sky: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
    violet: ["#ede9fe", "#c4b5fd", "#8b5cf6", "#6d28d9", "#3b0764"],
    rose: ["#ffe4e6", "#fda4af", "#f43f5e", "#be123c", "#4c0519"],
  };
  return (
    <div className="grid gap-3">
      {Object.entries(palette).map(([k, cs]) => (
        <div key={k} className="rounded-xl border border-border p-3">
          <div className="font-mono text-xs uppercase text-muted-foreground mb-2">{k}</div>
          <div className="grid grid-cols-5 gap-2">
            {cs.map((c, i) => (
              <button key={c} onClick={() => navigator.clipboard.writeText(c)} className="rounded-lg h-14 flex items-end p-1 text-[10px] font-mono" style={{ background: c, color: i < 2 ? "#111" : "#fff" }} title={"Click to copy " + c}>{c}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FontPair() {
  const pairs = [
    { h: "Playfair Display", b: "Inter" },
    { h: "Bricolage Grotesque", b: "Inter" },
    { h: "Space Grotesk", b: "Space Mono" },
    { h: "DM Serif Display", b: "DM Sans" },
    { h: "Instrument Serif", b: "JetBrains Mono" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pairs.map((p) => (
        <div key={p.h} className="rounded-xl border border-border p-5 space-y-2">
          <div style={{ fontFamily: p.h }} className="text-3xl font-bold">Beautiful Portfolios</div>
          <p style={{ fontFamily: p.b }} className="text-sm text-muted-foreground">The quick brown fox jumps over the lazy dog. — {p.b}</p>
          <div className="font-mono text-[10px] uppercase text-muted-foreground flex items-center justify-between">{p.h} + {p.b}<CopyBtn value={"font-family: '" + p.h + "', serif;\nfont-family: '" + p.b + "', sans-serif;"} /></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Utilities ---------- */
function JsonFormatter() {
  const [v, setV] = useState('{"name":"Jwala","skills":["react","tailwind"]}');
  const parsed = useMemo(() => {
    try {
      return { error: "", pretty: JSON.stringify(JSON.parse(v), null, 2) };
    } catch (error) {
      return { error: (error as Error).message, pretty: v };
    }
  }, [v]);
  const err = parsed.error;
  const pretty = parsed.pretty;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <textarea value={v} onChange={(e) => setV(e.target.value)} className="min-h-[300px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      <div className="space-y-2">
        {err ? <div className="rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs font-mono p-2">{err}</div> : <div className="text-emerald-400 text-xs font-mono">✓ Valid JSON</div>}
        <CodeBlock code={pretty} lang="json" />
      </div>
    </div>
  );
}

function Base64Tool() {
  const ENCODE_SAMPLE = "Hello, world!";
  const DECODE_SAMPLE = "SGVsbG8sIHdvcmxkIQ==";
  const [v, setV] = useState("Hello, world!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  let out = "";
  try {
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(v);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      out = btoa(binary);
    } else {
      const normalized = v.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
      if (!normalized || /[^A-Za-z0-9+/=]/.test(normalized)) throw new Error("invalid");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      out = new TextDecoder().decode(bytes);
    }
  } catch {
    out = "Invalid input";
  }
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
        {(["encode", "decode"] as const).map((m) => <button key={m} onClick={() => { setMode(m); setV((current) => current === (m === "decode" ? ENCODE_SAMPLE : DECODE_SAMPLE) ? (m === "decode" ? DECODE_SAMPLE : ENCODE_SAMPLE) : current); }} className={"px-3 py-1 rounded-full uppercase " + (mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{m}</button>)}
      </div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} placeholder={mode === "encode" ? "Type text to convert into Base64" : "Paste Base64 here, for example SGVsbG8sIHdvcmxkIQ=="} className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      <p className="text-xs text-muted-foreground font-mono">
        {mode === "encode" ? "Encoding converts plain text into Base64." : "Decoding expects Base64 input, not plain text."}
      </p>
      <CodeBlock code={out} lang="text" />
    </div>
  );
}

function UrlTool() {
  const [v, setV] = useState("https://example.com/?q=hello world&x=1");
  const dec = (() => { try { return decodeURIComponent(v); } catch { return "Invalid"; } })();
  return (
    <div className="space-y-3">
      <textarea value={v} onChange={(e) => setV(e.target.value)} className="w-full min-h-[80px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      <div className="grid gap-2 md:grid-cols-2">
        <CodeBlock code={encodeURIComponent(v)} lang="encoded" />
        <CodeBlock code={dec} lang="decoded" />
      </div>
    </div>
  );
}

function SvgToCssTool() {
  const [svg, setSvg] = useState(`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="24" fill="#18181b"/>
  <path d="M28 60c10-16 22-24 36-24s26 8 36 24c-10 16-22 24-36 24S38 76 28 60Z" fill="#f59e0b"/>
</svg>`);

  const parsed = useMemo(() => {
    const trimmed = svg.trim();
    if (!trimmed) return { error: "Paste SVG markup to generate CSS.", dataUri: "", css: "", previewSvg: "" };

    try {
      const doc = new DOMParser().parseFromString(trimmed, "image/svg+xml");
      if (doc.querySelector("parsererror")) {
        return { error: "Invalid SVG markup. Check the tags and attributes.", dataUri: "", css: "", previewSvg: "" };
      }

      const svgEl = doc.documentElement;
      svgEl.removeAttribute("width");
      svgEl.removeAttribute("height");
      svgEl.removeAttribute("style");
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "100%");
      svgEl.setAttribute("preserveAspectRatio", svgEl.getAttribute("preserveAspectRatio") || "xMidYMid meet");

      const compact = trimmed.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ");
      const encoded = encodeURIComponent(compact)
        .replace(/%0A/g, "")
        .replace(/%20/g, " ")
        .replace(/%3D/g, "=")
        .replace(/%3A/g, ":")
        .replace(/%2F/g, "/");
      const dataUri = `data:image/svg+xml,${encoded}`;
      const css = `.element {\n  background-image: url("${dataUri}");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: contain;\n}`;
      const previewSvg = svgEl.outerHTML;

      return { error: "", dataUri, css, previewSvg };
    } catch {
      return { error: "Could not parse that SVG.", dataUri: "", css: "", previewSvg: "" };
    }
  }, [svg]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="text-xs font-mono text-muted-foreground">Paste raw SVG markup and get a CSS-ready background-image Data URI.</div>
        <textarea value={svg} onChange={(e) => setSvg(e.target.value)} rows={14} className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" />
        {parsed.error
          ? <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-xs font-mono text-rose-400">{parsed.error}</div>
          : <CodeBlock code={parsed.dataUri} lang="data-uri" />}
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SVG Preview</div>
            <div className="grid min-h-[180px] place-items-center overflow-hidden rounded-lg border border-dashed border-border bg-white p-4 text-black">
              <div
                className="flex h-full max-h-[180px] w-full max-w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: parsed.error ? "" : parsed.previewSvg }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">CSS Background</div>
            <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-border bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_55%),linear-gradient(135deg,_#111827,_#020617)] p-4">
              <div
                className="h-32 w-32 rounded-2xl border border-white/10 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: parsed.error ? "none" : `url("${parsed.dataUri}")` }}
              />
            </div>
          </div>
        </div>
        <CodeBlock code={parsed.css} lang="css" />
      </div>
    </div>
  );
}

function RegexTester() {
  const [pat, setPat] = useState("\\b\\w+@\\w+\\.[a-z]+\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Reach me at jaybaheliya@gmail.com or hello@example.com.");
  let matches: string[] = []; let err = "";
  try { const re = new RegExp(pat, flags); matches = text.match(re) || []; } catch (e) { err = (e as Error).message; }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs font-mono items-center">
        <span>/</span>
        <input value={pat} onChange={(e) => setPat(e.target.value)} className="flex-1 rounded-md border border-border bg-background px-2 py-1" />
        <span>/</span>
        <input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gi" className="w-16 rounded-md border border-border bg-background px-2 py-1" />
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs font-mono text-muted-foreground">
        Flags change how the regex behaves. <span className="text-foreground">g</span> = find all matches, <span className="text-foreground">i</span> = ignore uppercase/lowercase, <span className="text-foreground">m</span> = treat each line separately. Example: <span className="text-foreground">gi</span> finds all matches and ignores case.
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      {err ? <div className="rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs p-2 font-mono">{err}</div>
        : <div className="rounded-md border border-border p-3 font-mono text-xs">{matches.length} match{matches.length !== 1 && "es"}: {matches.map((m, i) => <span key={i} className="mr-2 text-accent">{m}</span>)}</div>}
    </div>
  );
}

function UuidGen() {
  const [ids, setIds] = useState<string[]>([]);
  const gen = () => setIds(Array.from({ length: 5 }, () => (crypto as Crypto).randomUUID()));
  useEffect(() => { gen(); }, []);
  return (
    <div className="space-y-3">
      <button onClick={gen} className="rounded-full bg-accent px-4 py-1.5 text-xs font-mono uppercase text-accent-foreground">Regenerate</button>
      <div className="space-y-2 font-mono text-xs">
        {ids.map((id) => (
          <div key={id} className="flex items-center justify-between rounded-md border border-border px-3 py-2"><span>{id}</span><CopyBtn value={id} /></div>
        ))}
      </div>
    </div>
  );
}

function SlugGen() {
  const [v, setV] = useState("Hello World! My awesome Post");
  const slug = v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (
    <div className="space-y-3">
      <input value={v} onChange={(e) => setV(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 font-mono text-sm"><span>{slug || "—"}</span><CopyBtn value={slug} /></div>
    </div>
  );
}

function CaseConvert() {
  const [v, setV] = useState("hello world example text");
  const cases: Record<string, string> = {
    UPPER: v.toUpperCase(),
    lower: v.toLowerCase(),
    Title: v.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
    Sentence: v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
    camelCase: v.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    PascalCase: v.toLowerCase().replace(/(^|[^a-z0-9])(.)/g, (_, __, c) => c.toUpperCase()),
    snake_case: v.toLowerCase().replace(/\s+/g, "_"),
    "kebab-case": v.toLowerCase().replace(/\s+/g, "-"),
  };
  return (
    <div className="space-y-3">
      <textarea value={v} onChange={(e) => setV(e.target.value)} className="w-full min-h-[80px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(cases).map(([k, val]) => (
          <div key={k} className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-2 font-mono text-xs">
            <span className="text-muted-foreground w-24 shrink-0">{k}</span>
            <span className="truncate flex-1">{val}</span>
            <CopyBtn value={val} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordGen() {
  const [len, setLen] = useState(16), [up, setUp] = useState(true), [num, setNum] = useState(true), [sym, setSym] = useState(true);
  const gen = () => {
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (up) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (num) chars += "0123456789";
    if (sym) chars += "!@#$%^&*()-_=+[]{}";
    const arr = new Uint32Array(len); crypto.getRandomValues(arr);
    return Array.from(arr, (n) => chars[n % chars.length]).join("");
  };
  const [pw, setPw] = useState(""); useEffect(() => setPw(gen()), []);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
        <label>Length <input type="number" value={len} min={4} max={64} onChange={(e) => setLen(+e.target.value)} className="ml-2 w-16 rounded-md border border-border bg-background px-2 py-1" /></label>
        <label><input type="checkbox" checked={up} onChange={(e) => setUp(e.target.checked)} /> A-Z</label>
        <label><input type="checkbox" checked={num} onChange={(e) => setNum(e.target.checked)} /> 0-9</label>
        <label><input type="checkbox" checked={sym} onChange={(e) => setSym(e.target.checked)} /> Symbols</label>
        <button onClick={() => setPw(gen())} className="rounded-full bg-accent px-4 py-1.5 uppercase text-accent-foreground">Generate</button>
      </div>
      <div className="rounded-xl border border-border p-4 font-mono text-lg flex items-center justify-between gap-2 break-all"><span>{pw}</span><CopyBtn value={pw} /></div>
    </div>
  );
}

function TimestampConv() {
  const [v, setV] = useState(Math.floor(Date.now() / 1000));
  const d = new Date(v * 1000);
  const rows: [string, string][] = [["ISO", d.toISOString()], ["Local", d.toString()], ["UTC", d.toUTCString()], ["ms", String(v * 1000)]];
  return (
    <div className="space-y-3 text-xs font-mono">
      <input type="number" value={v} onChange={(e) => setV(+e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
      <div className="space-y-2">
        {rows.map(([l, v2]) => (
          <div key={l} className="flex items-center justify-between rounded-md border border-border px-3 py-2"><span><span className="text-muted-foreground mr-2">{l}</span>{v2}</span><CopyBtn value={v2} /></div>
        ))}
        <button onClick={() => setV(Math.floor(Date.now() / 1000))} className="rounded-full bg-accent px-4 py-1.5 uppercase text-accent-foreground">Now</button>
      </div>
    </div>
  );
}

function LoremGen() {
  const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" ");
  const [n, setN] = useState(3), [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const s = () => { const k = 8 + Math.floor(Math.random() * 12); const t = Array.from({ length: k }, () => LOREM[Math.floor(Math.random() * LOREM.length)]).join(" "); return t[0].toUpperCase() + t.slice(1) + "."; };
  const out = useMemo(() => {
    if (type === "words") return Array.from({ length: n }, () => LOREM[Math.floor(Math.random() * LOREM.length)]).join(" ");
    if (type === "sentences") return Array.from({ length: n }, s).join(" ");
    return Array.from({ length: n }, () => Array.from({ length: 4 }, s).join(" ")).join("\n\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, type]);
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center text-xs font-mono flex-wrap">
        <label>Count <input type="number" value={n} onChange={(e) => setN(+e.target.value)} min={1} max={30} className="ml-2 w-16 rounded-md border border-border bg-background px-2 py-1" /></label>
        {(["paragraphs", "sentences", "words"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={"px-3 py-1 rounded-full border " + (type === t ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{t}</button>
        ))}
      </div>
      <div className="rounded-xl border border-border p-4 whitespace-pre-wrap text-sm">{out}</div>
      <CopyBtn value={out} label="Copy text" />
    </div>
  );
}

function QrCodeTool() {
  const [v, setV] = useState("https://jwalabaheliya.dev");
  const url = "https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=" + encodeURIComponent(v);
  return (
    <div className="grid gap-4 md:grid-cols-2 items-center">
      <div className="space-y-2">
        <textarea value={v} onChange={(e) => setV(e.target.value)} className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
        <a href={url} download="qr.png" className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-mono uppercase text-accent-foreground">Download PNG</a>
      </div>
      <div className="rounded-xl border border-border bg-white p-4 grid place-items-center"><img src={url} alt="QR" className="max-w-[280px]" /></div>
    </div>
  );
}

function UnitConv() {
  const [base, setBase] = useState(16), [px, setPx] = useState(24);
  const rows: [string, string][] = [
    ["REM", (px / base).toFixed(4) + "rem"],
    ["EM", (px / base).toFixed(4) + "em"],
    ["PT", (px * 0.75).toFixed(2) + "pt"],
    ["%", ((px / base) * 100).toFixed(2) + "%"],
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 text-xs font-mono">
      <div className="space-y-2">
        <label className="block">Root px <input type="number" value={base} onChange={(e) => setBase(+e.target.value || 16)} className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1" /></label>
        <label className="block">Pixels <input type="number" value={px} onChange={(e) => setPx(+e.target.value)} className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1" /></label>
      </div>
      <div className="space-y-2">
        {rows.map(([l, v]) => (
          <div key={l} className="flex items-center justify-between rounded-md border border-border px-3 py-2"><span><span className="text-muted-foreground mr-2">{l}</span>{v}</span><CopyBtn value={v} /></div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Responsive ---------- */
function ResponsiveChecker() {
  const [url, setUrl] = useState("https://jwalabaheliya.dev/");
  const [input, setInput] = useState(url);
  const [viewMode, setViewMode] = useState<"single" | "compare" | "grid">("compare");
  const [selectedDevice, setSelectedDevice] = useState("iPhone 15");
  const devices = [
    { name: "iPhone SE", w: 375, h: 667 },
    { name: "iPhone 15", w: 393, h: 852 },
    { name: "iPad", w: 768, h: 1024 },
    { name: "Laptop", w: 1280, h: 800 },
    { name: "Desktop", w: 1440, h: 900 },
  ];
  const visibleDevices = useMemo(() => {
    if (viewMode === "single") return devices.filter((device) => device.name === selectedDevice);
    if (viewMode === "compare") return devices.filter((device) => ["iPhone 15", "iPad", "Laptop"].includes(device.name));
    return devices;
  }, [selectedDevice, viewMode]);
  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); setUrl(input); }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm" />
        <button className="rounded-full bg-accent px-5 py-2 text-xs font-mono uppercase text-accent-foreground">Preview</button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        {(["single", "compare", "grid"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={"rounded-full border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide transition " + (viewMode === mode ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {mode}
          </button>
        ))}
        {viewMode === "single" && (
          <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-mono uppercase tracking-wide">
            {devices.map((device) => (
              <option key={device.name} value={device.name}>{device.name}</option>
            ))}
          </select>
        )}
      </div>
      <Preview dark={false} className="items-start justify-start text-left">
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {visibleDevices.map((device) => (
            <div key={device.name} className="rounded-2xl border border-border bg-background px-3 py-3">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{device.name}</div>
              <div className="mt-1 font-display text-lg font-semibold">{device.w}px</div>
              <div className="text-xs text-muted-foreground">{device.h}px height viewport</div>
            </div>
          ))}
        </div>
      </Preview>
      <div className={"grid gap-4 " + (viewMode === "single" ? "md:grid-cols-1" : viewMode === "compare" ? "xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3")}>
        {visibleDevices.map((d) => (
          <div key={d.name} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase text-muted-foreground mb-2"><span>{d.name}</span><span>{d.w}×{d.h}</span></div>
            <div className="overflow-hidden rounded-lg border border-border bg-white" style={{ height: viewMode === "single" ? 420 : 300 }}>
              <iframe src={url} title={d.name} style={{ width: d.w, height: d.h, transform: `scale(${Math.min((viewMode === "single" ? 620 : 320) / d.w, (viewMode === "single" ? 420 : 300) / d.h)})`, transformOrigin: "top left", border: 0 }} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-mono uppercase tracking-wide text-muted-foreground">
              <span>{viewMode === "single" ? "Focused preview" : "Compare view"}</span>
              <span>{Math.round(Math.min((viewMode === "single" ? 620 : 320) / d.w, (viewMode === "single" ? 420 : 300) / d.h) * 100)}% scale</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaQueryGen() {
  const presets = [
    { label: "Mobile S", width: 320 },
    { label: "Mobile", width: 375 },
    { label: "Tablet", width: 768 },
    { label: "Laptop", width: 1024 },
    { label: "Desktop", width: 1280 },
    { label: "Wide", width: 1440 },
  ];
  const [mode, setMode] = useState<"min" | "max" | "range">("min");
  const [mediaType, setMediaType] = useState<"screen" | "all" | "print">("screen");
  const [minWidth, setMinWidth] = useState(768);
  const [maxWidth, setMaxWidth] = useState(1280);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [orientation, setOrientation] = useState<"any" | "portrait" | "landscape">("any");
  const [scheme, setScheme] = useState<"any" | "light" | "dark">("any");
  const [motion, setMotion] = useState<"any" | "reduce" | "no-preference">("any");
  const [hover, setHover] = useState<"any" | "hover" | "none">("any");
  const [pointer, setPointer] = useState<"any" | "fine" | "coarse">("any");
  const [selector, setSelector] = useState(".component");
  const sampleDevices = [
    { name: "Phone", width: 390, height: 844, hover: "none", pointer: "coarse" },
    { name: "Tablet", width: 768, height: 1024, hover: "none", pointer: "coarse" },
    { name: "Laptop", width: 1280, height: 800, hover: "hover", pointer: "fine" },
    { name: "Desktop", width: 1440, height: 900, hover: "hover", pointer: "fine" },
  ] as const;

  const clampRange = (nextMin: number, nextMax: number) => {
    setMinWidth(Math.min(nextMin, nextMax));
    setMaxWidth(Math.max(nextMin, nextMax));
  };

  const features = useMemo(() => {
    const list: string[] = [];

    if (mode === "min") list.push(`(min-width: ${minWidth}px)`);
    if (mode === "max") list.push(`(max-width: ${maxWidth}px)`);
    if (mode === "range") {
      list.push(`(min-width: ${minWidth}px)`);
      list.push(`(max-width: ${maxWidth}px)`);
    }
    if (minHeight > 0) list.push(`(min-height: ${minHeight}px)`);
    if (maxHeight > 0) list.push(`(max-height: ${maxHeight}px)`);
    if (orientation !== "any") list.push(`(orientation: ${orientation})`);
    if (scheme !== "any") list.push(`(prefers-color-scheme: ${scheme})`);
    if (motion !== "any") list.push(`(prefers-reduced-motion: ${motion})`);
    if (hover !== "any") list.push(`(hover: ${hover})`);
    if (pointer !== "any") list.push(`(pointer: ${pointer})`);

    return list;
  }, [hover, maxHeight, maxWidth, mediaType, minHeight, minWidth, mode, motion, orientation, pointer, scheme]);

  const query = useMemo(() => {
    const rule = features.join(" and ");
    return `@media ${mediaType}${rule ? ` and ${rule}` : ""}`;
  }, [features, mediaType]);

  const css = useMemo(() => {
    const cleanSelector = selector.trim() || ".component";
    return `${query} {\n  ${cleanSelector} {\n    /* responsive styles */\n  }\n}`;
  }, [query, selector]);

  const jsMatchMedia = useMemo(() => {
    const jsQuery = `${mediaType}${features.length ? ` and ${features.join(" and ")}` : ""}`;
    return `const mediaQuery = window.matchMedia("${jsQuery}");\n\nconst handleChange = (event) => {\n  if (event.matches) {\n    console.log("Media query matched");\n  }\n};\n\nhandleChange(mediaQuery);\nmediaQuery.addEventListener("change", handleChange);`;
  }, [features, mediaType]);

  const tailwindNote = useMemo(() => {
    if (mode === "min") return `Tailwind-style breakpoint idea: @media (min-width: ${minWidth}px)`;
    if (mode === "max") return `Down breakpoint idea: @media (max-width: ${maxWidth}px)`;
    return `Range breakpoint idea: ${minWidth}px to ${maxWidth}px`;
  }, [maxWidth, minWidth, mode]);

  const matchResults = useMemo(() => {
    return sampleDevices.map((device) => {
      let matches = true;

      if (mode === "min") matches = matches && device.width >= minWidth;
      if (mode === "max") matches = matches && device.width <= maxWidth;
      if (mode === "range") matches = matches && device.width >= minWidth && device.width <= maxWidth;
      if (minHeight > 0) matches = matches && device.height >= minHeight;
      if (maxHeight > 0) matches = matches && device.height <= maxHeight;
      if (orientation !== "any") {
        const deviceOrientation = device.width > device.height ? "landscape" : "portrait";
        matches = matches && deviceOrientation === orientation;
      }
      if (hover !== "any") matches = matches && device.hover === hover;
      if (pointer !== "any") matches = matches && device.pointer === pointer;

      return { ...device, matches };
    });
  }, [hover, maxHeight, maxWidth, minHeight, minWidth, mode, orientation, pointer, sampleDevices]);

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Quick Presets</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (mode === "max") setMaxWidth(preset.width);
                else if (mode === "range") clampRange(preset.width, preset.width + 255);
                else setMinWidth(preset.width);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide transition hover:border-accent hover:text-accent"
            >
              {preset.label} {preset.width}px
            </button>
          ))}
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-full border border-border p-1 text-[11px] font-mono">
        {(["min", "max", "range"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={"rounded-full px-3 py-1 uppercase transition " + (mode === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
          >
            {item === "range" ? "between" : `${item}-width`}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border p-4">
          {mode !== "max" && <Row label={mode === "range" ? "Min Width" : "Width"}><SliderInput value={minWidth} onChange={(value) => mode === "range" ? clampRange(value, maxWidth) : setMinWidth(value)} min={320} max={1920} /></Row>}
          {mode !== "min" && <Row label={mode === "range" ? "Max Width" : "Width"}><SliderInput value={maxWidth} onChange={(value) => mode === "range" ? clampRange(minWidth, value) : setMaxWidth(value)} min={320} max={1920} /></Row>}
          <Row label="Min Height"><SliderInput value={minHeight} onChange={setMinHeight} min={0} max={1400} step={10} /></Row>
          <Row label="Max Height"><SliderInput value={maxHeight} onChange={setMaxHeight} min={0} max={1400} step={10} /></Row>
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Selector</span>
            <input
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder=".component"
            />
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Media Type</span>
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value as "screen" | "all" | "print")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="screen">screen</option>
              <option value="all">all</option>
              <option value="print">print</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Orientation</span>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as "any" | "portrait" | "landscape")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="any">any</option>
              <option value="portrait">portrait</option>
              <option value="landscape">landscape</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Color Scheme</span>
            <select value={scheme} onChange={(e) => setScheme(e.target.value as "any" | "light" | "dark")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="any">any</option>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Reduced Motion</span>
            <select value={motion} onChange={(e) => setMotion(e.target.value as "any" | "reduce" | "no-preference")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="any">any</option>
              <option value="reduce">reduce</option>
              <option value="no-preference">no-preference</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Hover</span>
              <select value={hover} onChange={(e) => setHover(e.target.value as "any" | "hover" | "none")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="any">any</option>
                <option value="hover">hover</option>
                <option value="none">none</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Pointer</span>
              <select value={pointer} onChange={(e) => setPointer(e.target.value as "any" | "fine" | "coarse")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="any">any</option>
                <option value="fine">fine</option>
                <option value="coarse">coarse</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <Preview dark={false} className="items-start justify-start text-left">
        <div className="grid gap-3 w-full">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Generated Query</div>
            <div className="mt-1 rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm">{query}</div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              `Width mode: ${mode === "range" ? `${minWidth}px - ${maxWidth}px` : mode === "min" ? `>= ${minWidth}px` : `<= ${maxWidth}px`}`,
              `Orientation: ${orientation}`,
              `Color scheme: ${scheme}`,
              `Input style: hover ${hover}, pointer ${pointer}`,
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 px-3 py-2 text-xs font-mono text-accent">
            {tailwindNote}
          </div>
        </div>
      </Preview>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {matchResults.map((device) => (
          <div
            key={device.name}
            className={"rounded-2xl border p-4 transition " + (device.matches ? "border-emerald-500/50 bg-emerald-500/10" : "border-border bg-card")}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-semibold">{device.name}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{device.width} x {device.height}</div>
              </div>
              <div className={"rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest " + (device.matches ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground")}>
                {device.matches ? "matches" : "skips"}
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs font-mono text-muted-foreground">
              <div>hover: {device.hover}</div>
              <div>pointer: {device.pointer}</div>
              <div>orientation: {device.width > device.height ? "landscape" : "portrait"}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CodeBlock code={css} />
        <CodeBlock code={jsMatchMedia} lang="js" />
      </div>
    </div>
  );
}

type InterviewTopic = "All" | "Closures" | "Async" | "Arrays" | "Objects" | "Functions" | "Strings" | "DOM";
type InterviewQuestion = {
  id: string;
  topic: Exclude<InterviewTopic, "All">;
  title: string;
  prompt: string;
  code: string;
  options: string[];
  answer: number;
  explain: string;
  takeaway: string;
};

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "loop-closure",
    topic: "Closures",
    title: "Loop closure with var",
    prompt: "What logs after the loop finishes?",
    code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
    options: ["0 1 2", "3 3 3", "undefined undefined undefined", "It throws an error"],
    answer: 1,
    explain: "`var` is function-scoped, so each callback closes over the same `i`. By the time timers run, the loop has completed and `i` is `3`.",
    takeaway: "Use `let` in loops when each callback should keep its own iteration value.",
  },
  {
    id: "event-loop-order",
    topic: "Async",
    title: "Microtasks vs macrotasks",
    prompt: "Which output order is correct?",
    code: "console.log('start');\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\nconsole.log('end');",
    options: ["start, timeout, promise, end", "start, end, promise, timeout", "promise, start, end, timeout", "start, end, timeout, promise"],
    answer: 1,
    explain: "Synchronous code runs first. Promise callbacks run in the microtask queue before `setTimeout`, which goes into the macrotask queue.",
    takeaway: "A very common interview check is whether you know promises run before zero-delay timers.",
  },
  {
    id: "map-parse-int",
    topic: "Arrays",
    title: "The parseInt map gotcha",
    prompt: "What is the result of this expression?",
    code: "['1', '2', '3'].map(parseInt)",
    options: ["[1, 2, 3]", "[1, NaN, NaN]", "['1', '2', '3']", "It throws a TypeError"],
    answer: 1,
    explain: "`map` passes `(value, index)`. `parseInt('2', 1)` and `parseInt('3', 2)` are invalid because the second argument is treated as radix.",
    takeaway: "Prefer `array.map((value) => Number.parseInt(value, 10))` when converting strings to integers.",
  },
  {
    id: "array-reference",
    topic: "Arrays",
    title: "Reference equality",
    prompt: "What does the comparison return?",
    code: "[] === []",
    options: ["true", "false", "undefined", "It depends on strict mode"],
    answer: 1,
    explain: "Arrays are objects, and strict equality compares references. Two separate array literals never point to the same object.",
    takeaway: "In interviews, be ready to explain value equality vs reference equality.",
  },
  {
    id: "dom-delegation",
    topic: "DOM",
    title: "Event delegation",
    prompt: "Why is delegation useful on a large dynamic list?",
    code: "list.addEventListener('click', (event) => {\n  const button = event.target.closest('[data-action]');\n  if (!button) return;\n  console.log(button.dataset.action);\n});",
    options: ["It makes every item render faster in CSS", "It attaches one listener to handle many current and future children", "It automatically debounces clicks", "It prevents all bubbling"],
    answer: 1,
    explain: "Delegation lets one parent listener handle interactions for many children, including nodes inserted later.",
    takeaway: "This is a strong answer when interviewers ask about performance or dynamic DOM structures.",
  },
  {
    id: "this-arrow",
    topic: "Closures",
    title: "Arrow function and this",
    prompt: "What happens here?",
    code: "const user = {\n  name: 'Jwala',\n  greet: () => console.log(this.name),\n};\nuser.greet();",
    options: ["It logs 'Jwala'", "It logs undefined in most module/browser contexts", "It throws immediately", "It logs the whole user object"],
    answer: 1,
    explain: "Arrow functions do not bind their own `this`. They capture `this` from the surrounding scope, not from the object method call.",
    takeaway: "Use method syntax or a normal function when you want `this` to refer to the object.",
  },
  {
    id: "closure-private-state",
    topic: "Closures",
    title: "Private state in a closure",
    prompt: "What does this log?",
    code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = makeCounter();\nconsole.log(counter(), counter(), counter());",
    options: ["1 2 3", "0 1 2", "1 1 1", "It throws because `count` is private"],
    answer: 0,
    explain: "The returned function closes over `count`, so that single variable persists between calls and increments each time.",
    takeaway: "Closures are often used in interviews to show how functions can preserve private state.",
  },
  {
    id: "async-await-order",
    topic: "Async",
    title: "Async function scheduling",
    prompt: "Which order is printed?",
    code: "async function run() {\n  console.log('A');\n  await Promise.resolve();\n  console.log('B');\n}\nrun();\nconsole.log('C');",
    options: ["A, B, C", "A, C, B", "C, A, B", "B, A, C"],
    answer: 1,
    explain: "`A` logs synchronously. After `await`, execution resumes in a microtask, so `C` prints before `B`.",
    takeaway: "Treat code after `await` like promise continuation work that runs after current synchronous code finishes.",
  },
  {
    id: "promise-all-reject",
    topic: "Async",
    title: "Promise.all behavior",
    prompt: "How does `Promise.all` behave here?",
    code: "Promise.all([\n  Promise.resolve('ok'),\n  Promise.reject('fail'),\n  Promise.resolve('later'),\n]).then(console.log).catch(console.log);",
    options: ["It logs `['ok', 'fail', 'later']`", "It logs only `fail` in the catch handler", "It waits for every promise, then logs both success and failure values", "It throws a syntax error"],
    answer: 1,
    explain: "`Promise.all` rejects as soon as one input promise rejects, so the catch handler receives the rejection reason.",
    takeaway: "Use `Promise.allSettled` when the interviewer wants results from every promise regardless of failures.",
  },
  {
    id: "filter-boolean",
    topic: "Arrays",
    title: "Truthy filtering shortcut",
    prompt: "What is the result of this expression?",
    code: "[0, 1, false, 2, '', 3].filter(Boolean)",
    options: ["[0, 1, false, 2, '', 3]", "[1, 2, 3]", "[0, false, '']", "It removes only empty strings"],
    answer: 1,
    explain: "`filter(Boolean)` keeps only truthy values. `0`, `false`, and an empty string are falsy, so they are removed.",
    takeaway: "This is a handy shorthand, but mention in interviews that it also removes valid falsy values like `0`.",
  },
  {
    id: "reduce-flatten",
    topic: "Arrays",
    title: "Flatten with reduce",
    prompt: "What does this return?",
    code: "[[1, 2], [3], [4, 5]].reduce((acc, item) => acc.concat(item), [])",
    options: ["[1, 2, 3, 4, 5]", "[[1, 2], [3], [4, 5]]", "[15]", "It throws because `concat` cannot merge arrays"],
    answer: 0,
    explain: "The reducer starts with an empty array and concatenates each nested array onto it, producing one flat array.",
    takeaway: "Reduce questions are often less about memorization and more about whether you can track the accumulator cleanly.",
  },
  {
    id: "event-target-currenttarget",
    topic: "DOM",
    title: "target vs currentTarget",
    prompt: "If the button inside the card is clicked, what do these refer to?",
    code: "<div id=\"card\">\n  <button id=\"save\">Save</button>\n</div>\n\ncard.addEventListener('click', (event) => {\n  console.log(event.target.id, event.currentTarget.id);\n});",
    options: ["`card save`", "`save card`", "`save save`", "`card card`"],
    answer: 1,
    explain: "`event.target` is the element that was actually clicked, while `event.currentTarget` is the element the listener is attached to.",
    takeaway: "This distinction comes up a lot in delegation and bubbling interview questions.",
  },
  {
    id: "stop-propagation",
    topic: "DOM",
    title: "Stopping bubbling",
    prompt: "What changes if `event.stopPropagation()` runs inside the button click handler?",
    code: "parent.addEventListener('click', () => console.log('parent'));\nbutton.addEventListener('click', (event) => {\n  event.stopPropagation();\n  console.log('button');\n});",
    options: ["Both `button` and `parent` still log", "Only `parent` logs", "Only `button` logs", "Nothing logs"],
    answer: 2,
    explain: "`stopPropagation()` prevents the event from continuing up the DOM tree, so the parent listener does not run.",
    takeaway: "Explain clearly that it stops propagation, not the current handler itself.",
  },
  {
    id: "array-slice-splice",
    topic: "Arrays",
    title: "slice vs splice",
    prompt: "What does this log?",
    code: "const items = [1, 2, 3, 4];\nconst out = items.slice(1, 3);\nconsole.log(out, items);",
    options: ["[2, 3] and [1, 2, 3, 4]", "[2, 3] and [1, 4]", "[1, 2] and [3, 4]", "It mutates both arrays"],
    answer: 0,
    explain: "`slice` returns a shallow copy of the selected range and does not mutate the original array.",
    takeaway: "Interviewers often use `slice` and `splice` to test mutation awareness.",
  },
  {
    id: "array-find-index",
    topic: "Arrays",
    title: "findIndex miss",
    prompt: "What is returned here?",
    code: "[10, 20, 30].findIndex((n) => n > 50)",
    options: ["undefined", "null", "-1", "0"],
    answer: 2,
    explain: "`findIndex` returns `-1` when nothing matches.",
    takeaway: "Know the different miss values: `find` gives `undefined`, `findIndex` gives `-1`.",
  },
  {
    id: "array-sort-default",
    topic: "Arrays",
    title: "Default sort behavior",
    prompt: "What is the result?",
    code: "[1, 30, 4, 21].sort()",
    options: ["[1, 4, 21, 30]", "[1, 21, 30, 4]", "[1, 30, 21, 4]", "It throws without a compare function"],
    answer: 1,
    explain: "Without a compare function, `sort` converts values to strings and sorts lexicographically.",
    takeaway: "Mention a numeric compare callback in interviews: `(a, b) => a - b`.",
  },
  {
    id: "array-destructure-rest",
    topic: "Arrays",
    title: "Destructuring with rest",
    prompt: "What does this produce?",
    code: "const [first, ...rest] = [5, 6, 7];\nconsole.log(first, rest);",
    options: ["5 and [6, 7]", "[5] and [6, 7]", "5 and 6", "undefined and [5, 6, 7]"],
    answer: 0,
    explain: "The first element is assigned to `first`, and the remaining elements go into the `rest` array.",
    takeaway: "Rest syntax is a common shorthand interviewers expect you to read comfortably.",
  },
  {
    id: "array-every-some",
    topic: "Arrays",
    title: "every vs some",
    prompt: "What is logged?",
    code: "console.log([2, 4, 6].every((n) => n % 2 === 0), [2, 4, 5].some((n) => n % 2 !== 0));",
    options: ["true true", "true false", "false true", "false false"],
    answer: 0,
    explain: "`every` checks whether all items pass. `some` checks whether at least one item passes.",
    takeaway: "These methods are nice interview signals that you know intent-driven array APIs.",
  },
  {
    id: "array-flat-depth",
    topic: "Arrays",
    title: "flat depth",
    prompt: "What is the result?",
    code: "[1, [2, [3]]].flat()",
    options: ["[1, 2, 3]", "[1, [2], [3]]", "[1, 2, [3]]", "It stays unchanged"],
    answer: 2,
    explain: "The default depth for `flat()` is `1`, so only one nesting level is removed.",
    takeaway: "If you need full flattening, say `flat(Infinity)` explicitly.",
  },
  {
    id: "array-fill-reference",
    topic: "Arrays",
    title: "fill object reference trap",
    prompt: "What happens after the mutation?",
    code: "const rows = Array(3).fill({ done: false });\nrows[0].done = true;\nconsole.log(rows[1].done);",
    options: ["false", "true", "undefined", "It throws"],
    answer: 1,
    explain: "`fill` uses the same object reference for each slot, so mutating one affects them all.",
    takeaway: "When interviews ask about initialization, be alert for shared object references.",
  },
  {
    id: "array-from-set",
    topic: "Arrays",
    title: "Remove duplicates",
    prompt: "What does this expression return?",
    code: "Array.from(new Set([1, 2, 2, 3]))",
    options: ["[1, 2, 2, 3]", "[1, 2, 3]", "{1, 2, 3}", "A Map"],
    answer: 1,
    explain: "`Set` keeps unique values only, and `Array.from` converts the set back into an array.",
    takeaway: "This is a common concise answer for array deduplication questions.",
  },
  {
    id: "array-at-negative",
    topic: "Arrays",
    title: "Negative indexing with at",
    prompt: "What is returned?",
    code: "['a', 'b', 'c'].at(-1)",
    options: ["'a'", "'b'", "'c'", "undefined"],
    answer: 2,
    explain: "`at(-1)` reads the last item from the array.",
    takeaway: "This is cleaner than manual `arr[arr.length - 1]` when you want the last item.",
  },
  {
    id: "array-copy-with-spread",
    topic: "Arrays",
    title: "Spread copy depth",
    prompt: "What gets logged?",
    code: "const original = [{ n: 1 }];\nconst copy = [...original];\ncopy[0].n = 9;\nconsole.log(original[0].n);",
    options: ["1", "9", "undefined", "It throws because spread freezes objects"],
    answer: 1,
    explain: "Spread makes a shallow copy of the array, not deep copies of the nested objects.",
    takeaway: "Shallow vs deep copy shows up constantly in frontend interviews.",
  },
  {
    id: "object-keys-order",
    topic: "Objects",
    title: "Object.keys output",
    prompt: "What is returned here?",
    code: "Object.keys({ a: 1, b: 2 })",
    options: ["['a', 'b']", "[1, 2]", "{ a: 1, b: 2 }", "A Set of keys"],
    answer: 0,
    explain: "`Object.keys` returns an array of the object's own enumerable property names.",
    takeaway: "Be ready to contrast `Object.keys`, `Object.values`, and `Object.entries`.",
  },
  {
    id: "object-assign-shallow",
    topic: "Objects",
    title: "Object.assign depth",
    prompt: "What is logged?",
    code: "const source = { profile: { city: 'Delhi' } };\nconst copy = Object.assign({}, source);\ncopy.profile.city = 'Pune';\nconsole.log(source.profile.city);",
    options: ["Delhi", "Pune", "undefined", "It throws"],
    answer: 1,
    explain: "`Object.assign` creates a shallow copy, so nested objects are still shared references.",
    takeaway: "Any copy question is a chance to call out shallow cloning clearly.",
  },
  {
    id: "object-hasown",
    topic: "Objects",
    title: "Checking own properties",
    prompt: "Which expression safely checks whether `name` is an own property?",
    code: "const user = Object.create({ role: 'admin' });\nuser.name = 'Jwala';",
    options: ["'name' in user", "Object.hasOwn(user, 'name')", "user.name !== undefined", "user.includes('name')"],
    answer: 1,
    explain: "`Object.hasOwn` checks only own properties and avoids prototype-chain confusion.",
    takeaway: "The `in` operator includes inherited properties, which is a common interview distinction.",
  },
  {
    id: "object-destructure-rename",
    topic: "Objects",
    title: "Destructuring rename",
    prompt: "What does this log?",
    code: "const user = { name: 'Jwala', age: 24 };\nconst { name: fullName } = user;\nconsole.log(fullName);",
    options: ["name", "Jwala", "undefined", "24"],
    answer: 1,
    explain: "The `name` property is extracted and stored in a new variable called `fullName`.",
    takeaway: "Renaming during destructuring is a useful pattern in React and API handling.",
  },
  {
    id: "object-freeze",
    topic: "Objects",
    title: "Frozen object behavior",
    prompt: "What is true about this object?",
    code: "const settings = Object.freeze({ theme: 'light' });",
    options: ["New top-level properties cannot be added or changed", "Nested objects also become deeply frozen automatically", "It becomes an array", "It can only be read inside strict mode"],
    answer: 0,
    explain: "`Object.freeze` prevents top-level mutation, but it is not deep by default.",
    takeaway: "If a question mentions immutability, clarify whether it is shallow or deep.",
  },
  {
    id: "object-spread-override",
    topic: "Objects",
    title: "Spread override order",
    prompt: "What is the resulting object?",
    code: "const result = { a: 1, ...{ a: 2, b: 3 } };",
    options: ["{ a: 1, b: 3 }", "{ a: 2, b: 3 }", "{ a: [1, 2], b: 3 }", "It throws for duplicate keys"],
    answer: 1,
    explain: "Later properties overwrite earlier ones when spreading objects.",
    takeaway: "Order matters in object spread, especially when merging config or props.",
  },
  {
    id: "object-entries-map",
    topic: "Objects",
    title: "Object.entries shape",
    prompt: "What does this return?",
    code: "Object.entries({ x: 1, y: 2 })",
    options: ["['x', 'y']", "[[1, 'x'], [2, 'y']]", "[['x', 1], ['y', 2]]", "{ x: 1, y: 2 }"],
    answer: 2,
    explain: "`Object.entries` returns an array of `[key, value]` pairs.",
    takeaway: "This is useful when transforming objects with array methods.",
  },
  {
    id: "object-json-drop",
    topic: "Objects",
    title: "JSON serialization omission",
    prompt: "What is the result?",
    code: "JSON.stringify({ a: 1, b: undefined, c: () => 1 })",
    options: ["'{\"a\":1,\"b\":undefined,\"c\":null}'", "'{\"a\":1}'", "'{\"a\":1,\"b\":null}'", "It throws for functions"],
    answer: 1,
    explain: "When serializing objects, `undefined` and function properties are omitted.",
    takeaway: "JSON questions often test what gets dropped or transformed during serialization.",
  },
  {
    id: "object-reference-compare",
    topic: "Objects",
    title: "Object equality",
    prompt: "What is the result?",
    code: "({ a: 1 }) === ({ a: 1 })",
    options: ["true", "false", "undefined", "It depends on the engine"],
    answer: 1,
    explain: "Objects are compared by reference, not by shape or content.",
    takeaway: "This is the object version of the array reference-equality interview classic.",
  },
  {
    id: "object-create-null",
    topic: "Objects",
    title: "Prototype-free object",
    prompt: "What is special about this object?",
    code: "const dict = Object.create(null);",
    options: ["It has no prototype", "It is deeply frozen", "It behaves like a Map", "It cannot store strings as keys"],
    answer: 0,
    explain: "`Object.create(null)` makes an object with no inherited prototype methods or properties.",
    takeaway: "This is useful when you want a pure dictionary with no prototype collisions.",
  },
  {
    id: "function-hoisting-declaration",
    topic: "Functions",
    title: "Function declaration hoisting",
    prompt: "What happens here?",
    code: "sayHi();\nfunction sayHi() {\n  console.log('hi');\n}",
    options: ["It logs 'hi'", "It throws because the function is defined later", "It logs undefined", "Nothing happens"],
    answer: 0,
    explain: "Function declarations are hoisted, so they can be called before their position in the source.",
    takeaway: "Contrast this with function expressions, which often behave differently.",
  },
  {
    id: "function-expression-hoisting",
    topic: "Functions",
    title: "Function expression timing",
    prompt: "What happens here?",
    code: "sayHi();\nconst sayHi = function () {\n  console.log('hi');\n};",
    options: ["It logs 'hi'", "It throws due to the temporal dead zone", "It logs undefined", "It silently skips"],
    answer: 1,
    explain: "The `const` binding exists but cannot be accessed before initialization, so calling it early throws.",
    takeaway: "This is a great interview example for hoisting plus the temporal dead zone.",
  },
  {
    id: "function-default-params",
    topic: "Functions",
    title: "Default parameter value",
    prompt: "What does this return?",
    code: "function greet(name = 'friend') {\n  return `Hi ${name}`;\n}\ngreet();",
    options: ["'Hi friend'", "'Hi undefined'", "undefined", "It throws"],
    answer: 0,
    explain: "Default parameters are used when an argument is missing or explicitly `undefined`.",
    takeaway: "Mention that `null` does not trigger the default, but `undefined` does.",
  },
  {
    id: "function-rest-args",
    topic: "Functions",
    title: "Rest parameters",
    prompt: "What is logged?",
    code: "function count(...items) {\n  return items.length;\n}\nconsole.log(count(1, 2, 3));",
    options: ["1", "2", "3", "undefined"],
    answer: 2,
    explain: "Rest parameters gather all remaining arguments into an array.",
    takeaway: "Rest parameters are cleaner and more explicit than the old `arguments` object.",
  },
  {
    id: "function-bind",
    topic: "Functions",
    title: "bind return value",
    prompt: "What does `bind` do here?",
    code: "const user = { name: 'Jwala' };\nfunction greet() { return this.name; }\nconst bound = greet.bind(user);",
    options: ["It calls `greet` immediately", "It returns a new function with `this` fixed", "It mutates `greet` permanently", "It converts the function into an arrow function"],
    answer: 1,
    explain: "`bind` returns a new function whose `this` is permanently set to the provided object.",
    takeaway: "A quick bind question often appears alongside `call` and `apply` comparisons.",
  },
  {
    id: "function-arrow-arguments",
    topic: "Functions",
    title: "Arrow function and arguments",
    prompt: "Which statement is correct?",
    code: "const add = () => arguments[0] + arguments[1];",
    options: ["Arrow functions have their own `arguments` object", "Arrow functions capture `arguments` from the outer scope", "This always works the same as a normal function", "Arrow functions convert `arguments` into an array"],
    answer: 1,
    explain: "Arrow functions do not have their own `arguments`; they use the surrounding scope's `arguments` if available.",
    takeaway: "Prefer rest parameters instead of relying on `arguments` in modern code.",
  },
  {
    id: "function-higher-order",
    topic: "Functions",
    title: "Higher-order function",
    prompt: "Why is this a higher-order function?",
    code: "function repeat(fn, times) {\n  for (let i = 0; i < times; i++) fn(i);\n}",
    options: ["Because it returns a number", "Because it takes another function as an argument", "Because it uses a loop", "Because it is recursive"],
    answer: 1,
    explain: "A higher-order function either takes a function as input, returns a function, or both.",
    takeaway: "Interviewers often expect you to recognize higher-order functions instantly in callbacks-heavy code.",
  },
  {
    id: "function-pure",
    topic: "Functions",
    title: "Pure function idea",
    prompt: "Which description best matches a pure function?",
    code: "function add(a, b) {\n  return a + b;\n}",
    options: ["It always returns the same output for the same input and has no side effects", "It can access any global state safely", "It must use recursion", "It can only return primitives"],
    answer: 0,
    explain: "Pure functions are deterministic and do not cause observable side effects.",
    takeaway: "Purity comes up often in React, state management, and functional programming interviews.",
  },
  {
    id: "function-currying",
    topic: "Functions",
    title: "Currying result",
    prompt: "What does this return?",
    code: "const multiply = (a) => (b) => a * b;\nmultiply(3)(4)",
    options: ["7", "12", "34", "A syntax error"],
    answer: 1,
    explain: "The first function returns another function that remembers `a`, then multiplies it by `b`.",
    takeaway: "Currying questions often overlap with closures and partial application.",
  },
  {
    id: "function-call-apply",
    topic: "Functions",
    title: "call vs apply",
    prompt: "What is the main difference?",
    code: "fn.call(obj, 1, 2);\nfn.apply(obj, [1, 2]);",
    options: ["`call` is async and `apply` is sync", "`call` takes arguments individually, `apply` takes them as an array", "`apply` only works on arrow functions", "There is no difference at all"],
    answer: 1,
    explain: "Both set `this`, but `call` takes positional arguments while `apply` takes an array-like list.",
    takeaway: "This is basic but still shows up in interviews surprisingly often.",
  },
  {
    id: "string-trim",
    topic: "Strings",
    title: "Whitespace trimming",
    prompt: "What is returned?",
    code: "'  hello  '.trim()",
    options: ["'  hello  '", "'hello'", "'hello  '", "'  hello'"],
    answer: 1,
    explain: "`trim()` removes whitespace from both ends of the string.",
    takeaway: "String utility methods are common quick warm-up interview questions.",
  },
  {
    id: "string-split-join",
    topic: "Strings",
    title: "Split and join",
    prompt: "What is the result?",
    code: "'a-b-c'.split('-').join(':')",
    options: ["'a-b-c'", "'a:b:c'", "['a', 'b', 'c']", "'abc'"],
    answer: 1,
    explain: "`split` creates an array, then `join` combines it with the new separator.",
    takeaway: "This is a simple transformation pattern that often appears in coding rounds.",
  },
  {
    id: "string-includes",
    topic: "Strings",
    title: "Case sensitivity",
    prompt: "What does this return?",
    code: "'JavaScript'.includes('script')",
    options: ["true", "false", "undefined", "It depends on locale"],
    answer: 1,
    explain: "`includes` is case-sensitive, so `'script'` does not match `'Script'`.",
    takeaway: "When a string check fails unexpectedly, case sensitivity is often the reason.",
  },
  {
    id: "string-template-literal",
    topic: "Strings",
    title: "Template literal interpolation",
    prompt: "What is logged?",
    code: "const name = 'Jwala';\nconsole.log(`Hi ${name}`);",
    options: ["Hi ${name}", "Hi Jwala", "name", "undefined"],
    answer: 1,
    explain: "Template literals evaluate expressions inside `${...}` and insert the result into the string.",
    takeaway: "Template literals are especially worth knowing well for JSX and message formatting.",
  },
  {
    id: "string-repeat",
    topic: "Strings",
    title: "String repeat",
    prompt: "What is returned?",
    code: "'ha'.repeat(3)",
    options: ["'hahaha'", "'ha3'", "'ha ha ha'", "['ha', 'ha', 'ha']"],
    answer: 0,
    explain: "`repeat(3)` concatenates the string to itself three times.",
    takeaway: "Small API methods like this can be handy in live coding without manual loops.",
  },
  {
    id: "string-replace-once",
    topic: "Strings",
    title: "replace default behavior",
    prompt: "What is the result?",
    code: "'foo foo'.replace('foo', 'bar')",
    options: ["'bar bar'", "'foo bar'", "'bar foo'", "It replaces nothing"],
    answer: 2,
    explain: "With a plain string pattern, `replace` changes only the first occurrence.",
    takeaway: "Use a global regex if you want every occurrence replaced.",
  },
  {
    id: "string-padstart",
    topic: "Strings",
    title: "Left padding",
    prompt: "What does this return?",
    code: "'7'.padStart(3, '0')",
    options: ["'700'", "'007'", "'0007'", "'7'"],
    answer: 1,
    explain: "`padStart` adds characters to the beginning until the string reaches the target length.",
    takeaway: "This is useful for clocks, invoice numbers, and fixed-width formatting.",
  },
  {
    id: "string-char-at",
    topic: "Strings",
    title: "Index lookup",
    prompt: "What is returned?",
    code: "'hello'.charAt(1)",
    options: ["'h'", "'e'", "'l'", "undefined"],
    answer: 1,
    explain: "Strings are zero-indexed, so index `1` is the second character.",
    takeaway: "Off-by-one mistakes are tiny, but interviews often plant them intentionally.",
  },
  {
    id: "async-promise-race",
    topic: "Async",
    title: "Promise.race result",
    prompt: "Which value wins?",
    code: "Promise.race([\n  new Promise((resolve) => setTimeout(() => resolve('slow'), 50)),\n  Promise.resolve('fast'),\n]).then(console.log);",
    options: ["slow", "fast", "Both values", "It always rejects"],
    answer: 1,
    explain: "`Promise.race` settles with the first promise that resolves or rejects.",
    takeaway: "This often comes up when discussing timeouts or fastest-response wins.",
  },
  {
    id: "async-finally",
    topic: "Async",
    title: "finally behavior",
    prompt: "What is `finally` mainly used for?",
    code: "fetchData()\n  .then(handle)\n  .catch(handleError)\n  .finally(cleanup);",
    options: ["Transforming the fulfilled value only", "Running cleanup regardless of success or failure", "Catching syntax errors only", "Retrying automatically"],
    answer: 1,
    explain: "`finally` runs after the promise settles, whether it fulfilled or rejected.",
    takeaway: "Great place to mention spinners, loading flags, and resource cleanup.",
  },
  {
    id: "async-await-return",
    topic: "Async",
    title: "Async return type",
    prompt: "What does an `async` function always return?",
    code: "async function getValue() {\n  return 42;\n}",
    options: ["A plain number", "A promise", "undefined", "A callback"],
    answer: 1,
    explain: "Even when you `return 42`, an `async` function wraps it in a resolved promise.",
    takeaway: "This is a foundational async concept and a very fair interview question.",
  },
  {
    id: "async-await-loop",
    topic: "Async",
    title: "await inside forEach",
    prompt: "What is the common issue with this pattern?",
    code: "items.forEach(async (item) => {\n  await save(item);\n});",
    options: ["`forEach` waits for each async callback automatically", "The outer flow does not wait for the async callbacks to finish", "It only works for arrays of strings", "It becomes synchronous"],
    answer: 1,
    explain: "`forEach` does not understand promises, so surrounding code will not wait for those async callbacks.",
    takeaway: "Mention `for...of` or `Promise.all(items.map(...))` as better alternatives.",
  },
  {
    id: "async-catch-await",
    topic: "Async",
    title: "Catching await errors",
    prompt: "Which pattern correctly catches a rejected awaited promise?",
    code: "async function load() {\n  // ...\n}",
    options: ["Wrap the `await` in `try/catch`", "Use `if (await x)`", "Use `console.error` after the call", "Use `finally` only"],
    answer: 0,
    explain: "Inside an async function, `try/catch` is the normal way to handle rejected awaited promises.",
    takeaway: "Interviewers often want to hear both `try/catch` and promise-chain `.catch` as valid options.",
  },
  {
    id: "async-settimeout-return",
    topic: "Async",
    title: "setTimeout return value",
    prompt: "What does `setTimeout` return in browser code?",
    code: "const id = setTimeout(() => {}, 1000);",
    options: ["A promise", "A timer ID", "The callback result", "undefined"],
    answer: 1,
    explain: "`setTimeout` returns an identifier that can be used with `clearTimeout`.",
    takeaway: "Small runtime API details like this can matter in debugging and interviews.",
  },
  {
    id: "closure-factory",
    topic: "Closures",
    title: "Function factory",
    prompt: "What does this log?",
    code: "function makeAdder(x) {\n  return function (y) {\n    return x + y;\n  };\n}\nconsole.log(makeAdder(5)(2));",
    options: ["5", "2", "7", "52"],
    answer: 2,
    explain: "The inner function remembers `x` from the outer scope and adds it to `y`.",
    takeaway: "Closures are easiest to explain when you describe what values stay alive after the outer call ends.",
  },
  {
    id: "closure-shadowing",
    topic: "Closures",
    title: "Variable shadowing",
    prompt: "What is logged?",
    code: "const value = 1;\nfunction outer() {\n  const value = 2;\n  return function inner() {\n    console.log(value);\n  };\n}\nouter()();",
    options: ["1", "2", "undefined", "It throws"],
    answer: 1,
    explain: "The inner function closes over the nearest `value`, which is the one inside `outer`.",
    takeaway: "Shadowing is worth calling out explicitly when reading nested scopes out loud.",
  },
  {
    id: "closure-module-pattern",
    topic: "Closures",
    title: "Module pattern idea",
    prompt: "Why is this pattern useful?",
    code: "function createStore() {\n  let secret = 0;\n  return {\n    inc() { secret += 1; },\n    get() { return secret; },\n  };\n}",
    options: ["It exposes private state through controlled methods", "It deep-freezes state automatically", "It avoids all memory usage", "It disables reassignment globally"],
    answer: 0,
    explain: "The closure keeps `secret` private while the returned methods can still access and update it.",
    takeaway: "This is a classic way to explain encapsulation in plain JavaScript.",
  },
  {
    id: "closure-timeout-let",
    topic: "Closures",
    title: "Loop closure with let",
    prompt: "What logs here?",
    code: "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
    options: ["0 1 2", "3 3 3", "undefined undefined undefined", "It throws"],
    answer: 0,
    explain: "`let` creates a new block-scoped binding for each iteration, so each callback gets its own `i`.",
    takeaway: "This is the natural companion question to the classic `var` loop closure bug.",
  },
  {
    id: "dom-queryselectorall",
    topic: "DOM",
    title: "querySelectorAll return type",
    prompt: "What does `document.querySelectorAll('.item')` return?",
    code: "const nodes = document.querySelectorAll('.item');",
    options: ["A live HTMLCollection", "A NodeList", "A plain array", "A single element"],
    answer: 1,
    explain: "`querySelectorAll` returns a `NodeList` of matching elements.",
    takeaway: "Be ready to compare `NodeList`, `HTMLCollection`, and arrays in DOM interviews.",
  },
  {
    id: "dom-classlist-toggle",
    topic: "DOM",
    title: "classList.toggle",
    prompt: "What does this do?",
    code: "element.classList.toggle('active');",
    options: ["Adds `active` every time", "Removes `active` every time", "Adds it if missing and removes it if present", "Clears all classes"],
    answer: 2,
    explain: "`toggle` switches the class on or off depending on its current presence.",
    takeaway: "Tiny DOM APIs like `classList` are very common in quick UI interview tasks.",
  },
  {
    id: "dom-dataset",
    topic: "DOM",
    title: "Reading data attributes",
    prompt: "How do you read `data-id=\"42\"` from an element?",
    code: "<button data-id=\"42\"></button>",
    options: ["element.data.id", "element.dataset.id", "element.attr.id", "element.value.id"],
    answer: 1,
    explain: "Custom `data-*` attributes are exposed through the `dataset` object.",
    takeaway: "This pairs nicely with delegation questions because `dataset` is often how actions are stored.",
  },
  {
    id: "dom-remove-listener",
    topic: "DOM",
    title: "Removing listeners",
    prompt: "What is required for `removeEventListener` to work?",
    code: "element.addEventListener('click', handle);\nelement.removeEventListener('click', handle);",
    options: ["A different callback each time", "The same event type and same handler reference", "Only the same event type", "Nothing, it removes all listeners"],
    answer: 1,
    explain: "You must pass the same handler reference used during registration.",
    takeaway: "Anonymous inline callbacks are harder to remove later for this reason.",
  },
  {
    id: "dom-innerhtml-risk",
    topic: "DOM",
    title: "innerHTML caution",
    prompt: "Why should `innerHTML` be used carefully with user input?",
    code: "element.innerHTML = userContent;",
    options: ["It always crashes on mobile", "It can introduce XSS if content is not sanitized", "It only works once per element", "It removes CSS support"],
    answer: 1,
    explain: "Injecting unsanitized HTML can allow unwanted scripts or markup, creating security issues like XSS.",
    takeaway: "Security awareness is a strong signal even in frontend-focused interviews.",
  },
  {
    id: "dom-prevent-default",
    topic: "DOM",
    title: "preventDefault meaning",
    prompt: "What does `event.preventDefault()` do on a link click?",
    code: "link.addEventListener('click', (event) => {\n  event.preventDefault();\n});",
    options: ["Stops bubbling only", "Blocks the browser's default action, like navigation", "Removes the link element", "Pauses JavaScript execution"],
    answer: 1,
    explain: "`preventDefault` stops the browser's built-in behavior for that event, such as following a link or submitting a form.",
    takeaway: "Differentiate `preventDefault` from `stopPropagation`; interviewers love that comparison.",
  },
  {
    id: "dom-ready",
    topic: "DOM",
    title: "DOMContentLoaded timing",
    prompt: "When does `DOMContentLoaded` fire?",
    code: "document.addEventListener('DOMContentLoaded', init);",
    options: ["After the full page including images loads", "When the initial HTML is parsed and the DOM is ready", "Before any HTML is parsed", "Only after CSS animations finish"],
    answer: 1,
    explain: "`DOMContentLoaded` fires when the DOM has been parsed, without waiting for all images and other assets.",
    takeaway: "This is a good browser-lifecycle detail to know for practical frontend work.",
  },
];

function InteractiveInterviewLab() {
  const topics: InterviewTopic[] = ["All", "Closures", "Async", "Arrays", "Objects", "Functions", "Strings", "DOM"];
  const [topic, setTopic] = useState<InterviewTopic>("All");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [stopInnerBubble, setStopInnerBubble] = useState(false);
  const [stopMiddleCapture, setStopMiddleCapture] = useState(false);
  const [preventButtonDefault, setPreventButtonDefault] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const questions = useMemo(() => {
    if (topic === "All") return INTERVIEW_QUESTIONS;
    return INTERVIEW_QUESTIONS.filter((question) => question.topic === topic);
  }, [topic]);

  const current = questions[index] ?? questions[0];

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
  }, [topic]);

  const handlePick = (optionIndex: number) => {
    if (!current || revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    if (!answered.includes(current.id)) {
      setAnswered((prev) => [...prev, current.id]);
      if (optionIndex === current.answer) {
        setCorrect((value) => value + 1);
      }
    }
  };

  const nextQuestion = () => {
    if (!questions.length) return;
    setIndex((value) => (value + 1) % questions.length);
    setSelected(null);
    setRevealed(false);
  };

  const resetQuiz = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswered([]);
    setCorrect(0);
  };

  const pushLog = (message: string) => {
    setLogs((prev) => [`${prev.length + 1}. ${message}`, ...prev].slice(0, 12));
  };

  const phaseLabel = (phase: number) => (phase === 1 ? "capture" : phase === 2 ? "target" : phase === 3 ? "bubble" : "unknown");

  const pushEventLog = (label: string, event: React.MouseEvent<HTMLElement>) => {
    const target = event.target instanceof HTMLElement ? event.target.dataset.flowLabel || event.target.tagName.toLowerCase() : "unknown";
    const currentTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget.dataset.flowLabel || event.currentTarget.tagName.toLowerCase() : "unknown";
    pushLog(`${label} [phase: ${phaseLabel(event.eventPhase)} | target: ${target} | current: ${currentTarget}]`);
  };

  const scoreLabel = `${correct}/${answered.length || 0}`;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-xl font-semibold">Interactive Interview Lab</div>
              <p className="mt-1 text-sm text-muted-foreground">Practice output prediction, explain the why, then test DOM event flow live.</p>
            </div>
            <div className="rounded-full border border-border px-3 py-1 text-xs font-mono uppercase tracking-widest text-accent">
              Score {scoreLabel}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {topics.map((item) => (
              <button
                key={item}
                onClick={() => setTopic(item)}
                className={"rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-widest transition " + (topic === item ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
              >
                {item}
              </button>
            ))}
          </div>

          {current && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-3">
                <div>
                  <div className="font-display text-lg font-semibold">{current.title}</div>
                  <div className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">{current.topic} · Question {index + 1} of {questions.length}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={resetQuiz} className="rounded-full border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-accent hover:text-accent">Reset</button>
                  <button onClick={nextQuestion} className="rounded-full bg-accent px-4 py-1.5 text-xs font-mono uppercase tracking-wide text-accent-foreground">Next</button>
                </div>
              </div>

              <div className="text-sm text-foreground">{current.prompt}</div>
              <CodeBlock code={current.code} lang="js" />

              <div className="grid gap-3 sm:grid-cols-2">
                {current.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === current.answer;
                  const isPicked = optionIndex === selected;
                  const stateClass = revealed
                    ? isCorrect
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                      : isPicked
                        ? "border-red-500/60 bg-red-500/10 text-red-300"
                        : "border-border text-muted-foreground"
                    : "border-border hover:border-accent hover:text-foreground";

                  return (
                    <button
                      key={option}
                      onClick={() => handlePick(optionIndex)}
                      className={"rounded-2xl border p-3 text-left text-sm transition " + stateClass}
                    >
                      <div className="text-[11px] font-mono uppercase tracking-widest opacity-70">Option {optionIndex + 1}</div>
                      <div className="mt-2">{option}</div>
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="grid gap-3 rounded-2xl border border-border bg-background p-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Why</div>
                    <p className="mt-1 text-sm text-foreground">{current.explain}</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 px-3 py-2 text-sm text-accent">
                    {current.takeaway}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <div className="font-display text-lg font-semibold">Event Flow Playground</div>
            <p className="mt-1 text-sm text-muted-foreground">Click different layers and watch capture, target, bubble, propagation, and default behavior update in real time.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStopInnerBubble((value) => !value)}
              className={"rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition " + (stopInnerBubble ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {stopInnerBubble ? "Inner bubble stop: on" : "Inner bubble stop: off"}
            </button>
            <button
              onClick={() => setStopMiddleCapture((value) => !value)}
              className={"rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition " + (stopMiddleCapture ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {stopMiddleCapture ? "Middle capture stop: on" : "Middle capture stop: off"}
            </button>
            <button
              onClick={() => setPreventButtonDefault((value) => !value)}
              className={"rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition " + (preventButtonDefault ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {preventButtonDefault ? "Button default blocked" : "Button default allowed"}
            </button>
            <button onClick={() => setLogs([])} className="rounded-full border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-accent hover:text-accent">
              Clear log
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3 text-xs font-mono text-muted-foreground">
            `capture` runs from outer to inner, `target` runs on the clicked element, and `bubble` runs back out. Try clicking the outer card, middle card, inner card, and the button to compare the order.
          </div>

          <div
            data-flow-label="outer"
            onClickCapture={(event) => pushEventLog("Outer capture", event)}
            onClick={(event) => pushEventLog("Outer bubble", event)}
            className="rounded-[28px] border border-sky-500/40 bg-sky-500/10 p-5"
          >
            <div className="mb-2 text-xs font-mono uppercase tracking-widest text-sky-300">Outer</div>
            <div
              data-flow-label="middle"
              onClickCapture={(event) => {
                pushEventLog("Middle capture", event);
                if (stopMiddleCapture) {
                  event.stopPropagation();
                  pushLog("Propagation stopped at middle capture");
                }
              }}
              onClick={(event) => pushEventLog("Middle bubble", event)}
              className="rounded-[24px] border border-violet-500/40 bg-violet-500/10 p-5"
            >
              <div className="mb-2 text-xs font-mono uppercase tracking-widest text-violet-300">Middle</div>
              <div
                data-flow-label="inner"
                onClickCapture={(event) => pushEventLog("Inner capture", event)}
                onClick={(event) => {
                  pushEventLog("Inner bubble", event);
                  if (stopInnerBubble) {
                    event.stopPropagation();
                    pushLog("Propagation stopped at inner bubble");
                  }
                }}
                className="rounded-[20px] border border-amber-500/40 bg-amber-500/10 p-5"
              >
                <div className="mb-3 text-xs font-mono uppercase tracking-widest text-amber-300">Inner</div>
                <a
                  href="#event-flow-playground"
                  data-flow-label="button"
                  onClick={(event) => {
                    pushEventLog("Button target", event);
                    if (preventButtonDefault) {
                      event.preventDefault();
                      pushLog("Default link jump prevented");
                    } else {
                      pushLog("Default link jump allowed");
                    }
                  }}
                  className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                >
                  Click me
                </a>
              </div>
            </div>
          </div>

          <CodeBlock
            lang="js"
            code={`outer.addEventListener('click', () => log('Outer bubble'));\nouter.addEventListener('click', () => log('Outer capture'), true);\n\nmiddle.addEventListener('click', (event) => {\n  log('Middle capture');\n  if (${stopMiddleCapture}) event.stopPropagation();\n}, true);\n\nbutton.addEventListener('click', (event) => {\n  log('Button target');\n  if (${preventButtonDefault}) event.preventDefault();\n});\n\ninner.addEventListener('click', (event) => {\n  log('Inner bubble');\n  if (${stopInnerBubble}) event.stopPropagation();\n});`}
          />

          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Live log</div>
              <div className="text-xs font-mono text-muted-foreground">{logs.length} entries</div>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-muted-foreground">Click the nested button to see event order.</div>
              ) : (
                logs.map((log) => (
                  <div key={log} className="rounded-lg border border-border px-3 py-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- JS Snippets ---------- */
type Snippet = { title: string; explain: string; code: string; demo: () => React.ReactNode };

function DebounceDemo() {
  const [v, setV] = useState(""); const [out, setOut] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <div>
      <input value={v} onChange={(e) => { setV(e.target.value); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOut(e.target.value), 400); }} placeholder="Type…" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <div className="mt-2 text-xs font-mono text-accent">debounced: {out}</div>
    </div>
  );
}
function CountdownDemo() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const target = +new Date("2027-01-01"); const diff = target - now;
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  return <div className="font-mono text-lg text-accent">{d}d {h}h {m}m {s}s</div>;
}
function ClockDemo() {
  const [t, setT] = useState("");
  useEffect(() => { const i = setInterval(() => setT(new Date().toLocaleTimeString()), 1000); return () => clearInterval(i); }, []);
  return <div className="font-mono text-2xl text-accent">{t || "--:--:--"}</div>;
}
function TypingDemo() {
  const text = "Hello, I'm Jwala — frontend developer.";
  const [n, setN] = useState(0);
  useEffect(() => { const i = setInterval(() => setN((v) => (v < text.length ? v + 1 : 0)), 80); return () => clearInterval(i); }, []);
  return <div className="font-mono">{text.slice(0, n)}<span className="animate-pulse">|</span></div>;
}
function CountUpDemo() {
  const [n, setN] = useState(0);
  useEffect(() => { let x = 0; const i = setInterval(() => { x += 2; setN(x); if (x >= 250) clearInterval(i); }, 15); return () => clearInterval(i); }, []);
  return <div className="font-display text-4xl font-bold text-accent">{n}+</div>;
}
function QuoteDemo() {
  const quotes = ["Ship it.", "Details matter.", "Less, but better.", "Design in the browser.", "Constraints breed creativity."];
  const [q, setQ] = useState(quotes[0]);
  return <div className="space-y-2 text-center"><div className="italic">“{q}”</div><button onClick={() => setQ(quotes[Math.floor(Math.random() * quotes.length)])} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">New</button></div>;
}

const SNIPPETS: Snippet[] = [
  { title: "Smooth scroll to top", explain: "Native smooth scrolling.", code: "window.scrollTo({ top: 0, behavior: 'smooth' });", demo: () => <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Scroll to top</button> },
  { title: "Debounce", explain: "Delays function until N ms after last call.", code: "function debounce(fn, wait = 300) {\n  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };\n}", demo: () => <DebounceDemo /> },
  { title: "Throttle", explain: "Runs at most once every N ms.", code: "function throttle(fn, wait = 300) {\n  let last = 0; return (...a) => {\n    const now = Date.now(); if (now - last >= wait) { last = now; fn(...a); }\n  };\n}", demo: () => <div className="text-xs font-mono text-muted-foreground">Applied to scroll listeners.</div> },
  { title: "Clipboard copy", explain: "Native async clipboard API.", code: "await navigator.clipboard.writeText(text);", demo: () => <CopyBtn value="Copied from toolkit" label="Copy demo text" /> },
  { title: "Countdown timer", explain: "Counts down to a target date.", code: "setInterval(() => {\n  const diff = target - Date.now();\n  // format d/h/m/s\n}, 1000);", demo: () => <CountdownDemo /> },
  { title: "Digital clock", explain: "Live time each second.", code: "setInterval(() => el.textContent = new Date().toLocaleTimeString(), 1000);", demo: () => <ClockDemo /> },
  { title: "Typing effect", explain: "Reveals text one character at a time.", code: "let i = 0; setInterval(() => el.textContent = text.slice(0, ++i), 80);", demo: () => <TypingDemo /> },
  { title: "Count up animation", explain: "Animate number 0 → target.", code: "let n = 0; const id = setInterval(() => { el.textContent = ++n; if (n === target) clearInterval(id); }, 15);", demo: () => <CountUpDemo /> },
  { title: "Random quote", explain: "Picks random string on click.", code: "el.textContent = quotes[Math.floor(Math.random() * quotes.length)];", demo: () => <QuoteDemo /> },
  { title: "Toast notification", explain: "Show a small message via sonner.", code: "import { toast } from 'sonner';\ntoast.success('Saved!');", demo: () => <button onClick={async () => { const { toast } = await import("sonner"); toast.success("Toast from the toolkit ✨"); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Show toast</button> },
  { title: "Copy on click", explain: "Copy any element's text.", code: "el.addEventListener('click', () => navigator.clipboard.writeText(el.innerText));", demo: () => <span onClick={(e) => { navigator.clipboard.writeText((e.target as HTMLElement).innerText); }} className="cursor-pointer rounded border border-dashed border-accent px-3 py-1 text-xs">Click to copy me</span> },
  { title: "Dark mode toggle", explain: "Toggle a `dark` class on html.", code: "document.documentElement.classList.toggle('dark');\nlocalStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');", demo: () => <button onClick={() => document.documentElement.classList.toggle('dark')} className="rounded-full border border-border px-3 py-1 text-xs">Toggle</button> },
  { title: "Detect scroll direction", explain: "Track up/down scroll.", code: "let last = 0;\naddEventListener('scroll', () => {\n  const y = scrollY; console.log(y > last ? 'down' : 'up'); last = y;\n});", demo: () => <ScrollDirDemo /> },
  { title: "Intersection reveal", explain: "Fade elements on scroll into view.", code: "const io = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && e.target.classList.add('in')));\ndocument.querySelectorAll('.reveal').forEach(el => io.observe(el));", demo: () => <RevealDemo /> },
  { title: "Random hex color", explain: "One-liner random color.", code: "'#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');", demo: () => <RandomColorDemo /> },
  { title: "Copy image to clipboard", explain: "Modern clipboard API for images.", code: "const blob = await (await fetch(url)).blob();\nawait navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);", demo: () => <div className="text-xs font-mono text-muted-foreground">Requires https + user gesture.</div> },
  { title: "Download text as file", explain: "Trigger a download in-browser.", code: "const a = document.createElement('a');\na.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));\na.download = 'file.txt'; a.click();", demo: () => <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(["Hello from toolkit"], { type: 'text/plain' })); a.download = 'hello.txt'; a.click(); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Download hello.txt</button> },
  { title: "Read a file (drop / input)", explain: "FileReader → text.", code: "const r = new FileReader();\nr.onload = () => console.log(r.result);\nr.readAsText(file);", demo: () => <FileReadDemo /> },
  { title: "Fetch with timeout", explain: "AbortController with setTimeout.", code: "const c = new AbortController();\nconst id = setTimeout(() => c.abort(), 5000);\nconst r = await fetch(url, { signal: c.signal });\nclearTimeout(id);", demo: () => <div className="text-xs font-mono text-muted-foreground">Aborts after 5s.</div> },
  { title: "LocalStorage helper", explain: "Get/set with JSON parsing.", code: "const store = {\n  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },\n  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),\n};", demo: () => <div className="text-xs font-mono text-muted-foreground">store.set('user', {'{ name: "JB" }'})</div> },
  { title: "Shuffle array", explain: "Fisher–Yates.", code: "function shuffle(a) {\n  for (let i = a.length - 1; i > 0; i--) {\n    const j = Math.floor(Math.random() * (i + 1));\n    [a[i], a[j]] = [a[j], a[i]];\n  } return a;\n}", demo: () => <ShuffleDemo /> },
  { title: "Deep clone", explain: "Native structuredClone.", code: "const copy = structuredClone(obj);", demo: () => <div className="text-xs font-mono text-muted-foreground">Handles Dates, Maps, Sets…</div> },
  { title: "Format currency", explain: "Intl.NumberFormat.", code: "new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(125000);", demo: () => <div className="font-display text-xl text-accent">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(125000)}</div> },
  { title: "Relative time", explain: "Intl.RelativeTimeFormat.", code: "new Intl.RelativeTimeFormat('en').format(-3, 'day'); // '3 days ago'", demo: () => <div className="font-mono text-sm text-accent">{new Intl.RelativeTimeFormat('en').format(-3, 'day')}</div> },
  { title: "Copy current URL", explain: "Share the page.", code: "navigator.clipboard.writeText(location.href);", demo: () => <button onClick={async () => { await navigator.clipboard.writeText(location.href); const { toast } = await import('sonner'); toast.success('URL copied'); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Copy URL</button> },
  { title: "Web share API", explain: "Native share sheet on mobile.", code: "await navigator.share({ title, text, url });", demo: () => <button onClick={async () => { try { await (navigator as Navigator & { share?: (d: unknown) => Promise<void> }).share?.({ title: 'Toolkit', url: location.href }); } catch {} }} className="rounded-full border border-border px-4 py-2 text-sm">Share</button> },
  { title: "Vibrate on tap", explain: "Haptic feedback on mobile.", code: "navigator.vibrate?.(50);", demo: () => <button onClick={() => (navigator as Navigator & { vibrate?: (p: number) => boolean }).vibrate?.(50)} className="rounded-full border border-border px-4 py-2 text-sm">Buzz</button> },
  { title: "Battery status", explain: "Read battery level.", code: "const b = await navigator.getBattery?.();\nconsole.log(b?.level);", demo: () => <BatteryDemo /> },
  { title: "Detect online / offline", explain: "Listen to network events.", code: "addEventListener('online', () => …);\naddEventListener('offline', () => …);", demo: () => <OnlineDemo /> },
  { title: "Copy to clipboard fallback", explain: "Older browsers.", code: "const ta = document.createElement('textarea');\nta.value = text; document.body.append(ta);\nta.select(); document.execCommand('copy'); ta.remove();", demo: () => <div className="text-xs font-mono text-muted-foreground">Use only when Clipboard API unavailable.</div> },
  { title: "Sleep / wait", explain: "Await a delay.", code: "const sleep = (ms) => new Promise(r => setTimeout(r, ms));\nawait sleep(500);", demo: () => <div className="text-xs font-mono text-muted-foreground">await sleep(500)</div> },
  { title: "Group by key", explain: "Native Object.groupBy.", code: "Object.groupBy(items, (x) => x.category);", demo: () => <div className="text-xs font-mono text-muted-foreground">ES2024 — polyfill for older.</div> },
  { title: "Truncate text", explain: "Ellipsis with word boundary.", code: "const t = s.length > n ? s.slice(0, n).trim() + '…' : s;", demo: () => <div className="text-sm">This is a long sentence…</div> },
  { title: "Number → words counter", explain: "Locale-aware number format.", code: "new Intl.NumberFormat('en').format(1234567);", demo: () => <div className="font-mono text-accent">{new Intl.NumberFormat('en').format(1234567)}</div> },
  { title: "Detect device", explain: "Touch vs pointer.", code: "const isTouch = matchMedia('(hover: none)').matches;", demo: () => <DeviceDemo /> },
  { title: "Fullscreen toggle", explain: "Fullscreen API.", code: "document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();", demo: () => <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()} className="rounded-full border border-border px-4 py-2 text-sm">Toggle fullscreen</button> },
  { title: "Prefers reduced motion", explain: "Respect user setting.", code: "matchMedia('(prefers-reduced-motion: reduce)').matches;", demo: () => <div className="font-mono text-xs text-accent">Currently: {typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'}</div> },
  { title: "Scroll progress bar", explain: "Track page scroll %.", code: "addEventListener('scroll', () => {\n  const p = scrollY / (document.body.scrollHeight - innerHeight);\n  bar.style.width = (p * 100) + '%';\n});", demo: () => <ScrollProgressDemo /> },
  { title: "Confetti burst", explain: "Tiny DOM confetti.", code: "for (let i = 0; i < 40; i++) { /* spawn colored dot with random velocity */ }", demo: () => <ConfettiDemo /> },
  { title: "Text to speech", explain: "SpeechSynthesis API.", code: "speechSynthesis.speak(new SpeechSynthesisUtterance('Hi there'));", demo: () => <button onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance('Hello from Jwala'))} className="rounded-full border border-border px-4 py-2 text-sm">Speak</button> },
  { title: "Copy rich HTML", explain: "Copy formatted HTML to clipboard.", code: "const item = new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) });\nawait navigator.clipboard.write([item]);", demo: () => <div className="text-xs font-mono text-muted-foreground">Paste keeps formatting.</div> },
];

function ScrollDirDemo() {
  const [dir, setDir] = useState("—"); const last = useRef(0);
  useEffect(() => { const on = () => { const y = window.scrollY; setDir(y > last.current ? "↓ down" : "↑ up"); last.current = y; }; addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on); }, []);
  return <div className="font-mono text-accent">{dir}</div>;
}
function RevealDemo() {
  const [on, setOn] = useState(false);
  return <div><button onClick={() => setOn((v) => !v)} className="rounded-full border border-border px-3 py-1 text-xs mb-2">Toggle</button><div className={"h-10 rounded bg-accent transition-all duration-500 " + (on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")} /></div>;
}
function RandomColorDemo() {
  const [c, setC] = useState("#4ade80");
  return <div className="flex items-center gap-2"><div className="h-8 w-8 rounded" style={{ background: c }} /><button onClick={() => setC('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'))} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Random</button><code className="text-xs font-mono">{c}</code></div>;
}
function FileReadDemo() {
  const [t, setT] = useState("");
  return <label className="cursor-pointer rounded-full border border-border px-3 py-1 text-xs">Pick file<input type="file" accept="text/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setT(String(r.result).slice(0, 60)); r.readAsText(f); }} /><div className="mt-2 font-mono text-[10px] text-muted-foreground">{t}</div></label>;
}
function ShuffleDemo() {
  const [a, setA] = useState([1, 2, 3, 4, 5]);
  return <div className="space-y-2 text-center"><div className="font-mono">[{a.join(", ")}]</div><button onClick={() => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } setA(b); }} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Shuffle</button></div>;
}
function BatteryDemo() {
  const [lvl, setLvl] = useState<string>("checking…");
  useEffect(() => { const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }; nav.getBattery?.().then((b) => setLvl(Math.round(b.level * 100) + "%")).catch(() => setLvl("unsupported")); }, []);
  return <div className="font-mono text-accent">{lvl}</div>;
}
function OnlineDemo() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(navigator.onLine); const u = () => setOn(true), d = () => setOn(false); addEventListener("online", u); addEventListener("offline", d); return () => { removeEventListener("online", u); removeEventListener("offline", d); }; }, []);
  return <div className={"font-mono " + (on ? "text-emerald-400" : "text-rose-400")}>{on ? "● online" : "● offline"}</div>;
}
function DeviceDemo() {
  const [d, setD] = useState("—");
  useEffect(() => { setD(matchMedia("(hover: none)").matches ? "touch" : "pointer"); }, []);
  return <div className="font-mono text-accent">{d}</div>;
}
function ScrollProgressDemo() {
  const [p, setP] = useState(0);
  useEffect(() => { const on = () => setP(window.scrollY / (document.body.scrollHeight - innerHeight) * 100); on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on); }, []);
  return <div className="w-full space-y-1"><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: p + "%" }} /></div><div className="font-mono text-xs text-muted-foreground">{p.toFixed(0)}%</div></div>;
}
function ConfettiDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const burst = () => { const host = ref.current; if (!host) return; const colors = ["#f43f5e", "#f59e0b", "#22d3ee", "#a78bfa", "#4ade80"]; for (let i = 0; i < 30; i++) { const d = document.createElement("div"); d.style.cssText = `position:absolute;width:6px;height:10px;left:50%;top:50%;background:${colors[i % colors.length]};border-radius:1px;pointer-events:none;transition:transform 900ms cubic-bezier(.2,.7,.1,1),opacity 900ms`; host.appendChild(d); requestAnimationFrame(() => { d.style.transform = `translate(${(Math.random() - 0.5) * 220}px, ${(Math.random() - 0.5) * 160}px) rotate(${Math.random() * 720}deg)`; d.style.opacity = "0"; }); setTimeout(() => d.remove(), 950); } };
  return <div className="relative w-full grid place-items-center" ref={ref}><button onClick={burst} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">🎉 Pop</button></div>;
}

/* ---------- Extra tools ---------- */
function TextShadowGen() {
  const [x, setX] = useState(2), [y, setY] = useState(2), [b, setB] = useState(4), [c, setC] = useState("#f59e0b");
  const css = `text-shadow: ${x}px ${y}px ${b}px ${c};`;
  return <div className="grid gap-4 lg:grid-cols-2"><div className="grid place-items-center rounded-xl border border-border bg-background p-8"><div className="text-4xl font-bold" style={{ textShadow: `${x}px ${y}px ${b}px ${c}` }}>Frontend</div></div><div className="space-y-3"><Slider label="X" v={x} on={setX} min={-20} max={20} /><Slider label="Y" v={y} on={setY} min={-20} max={20} /><Slider label="Blur" v={b} on={setB} min={0} max={40} /><label className="flex items-center gap-2 text-xs font-mono"><span className="w-16">Color</span><input type="color" value={c} onChange={(e) => setC(e.target.value)} className="h-8 w-14 rounded border border-border bg-transparent" /></label><CodeBlock code={css} /></div></div>;
}
function CubicBezierTool() {
  const [p1, setP1] = useState(0.4), [p2, setP2] = useState(0), [p3, setP3] = useState(0.2), [p4, setP4] = useState(1);
  const easing = `cubic-bezier(${p1}, ${p2}, ${p3}, ${p4})`;
  const [go, setGo] = useState(false);
  return <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-border bg-background p-6 space-y-4"><div className="relative h-14 w-full rounded-full bg-muted"><div className="absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-accent" style={{ left: go ? "calc(100% - 40px)" : "0", transition: `left 1400ms ${easing}` }} /></div><button onClick={() => setGo((v) => !v)} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Play</button></div><div className="space-y-2"><Slider label="p1" v={p1} on={setP1} min={0} max={1} step={0.01} /><Slider label="p2" v={p2} on={setP2} min={-1} max={2} step={0.01} /><Slider label="p3" v={p3} on={setP3} min={0} max={1} step={0.01} /><Slider label="p4" v={p4} on={setP4} min={-1} max={2} step={0.01} /><CodeBlock code={`transition-timing-function: ${easing};`} /></div></div>;
}
function MetaTagsGen() {
  const [title, setTitle] = useState("Jwala Baheliya — Senior Frontend Developer");
  const [desc, setDesc] = useState("8+ years building premium interfaces.");
  const [url, setUrl] = useState("https://example.com");
  const [img, setImg] = useState("https://example.com/og.jpg");
  const html = `<title>${title}</title>\n<meta name="description" content="${desc}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:image" content="${img}" />\n<meta property="og:type" content="website" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${img}" />`;
  return <div className="grid gap-4 lg:grid-cols-2"><div className="space-y-2">{([["Title", title, setTitle], ["Description", desc, setDesc], ["URL", url, setUrl], ["Image URL", img, setImg]] as const).map(([l, v, s]) => <label key={l} className="block text-xs font-mono"><span className="text-muted-foreground">{l}</span><input value={v} onChange={(e) => s(e.target.value)} className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5" /></label>)}</div><CodeBlock code={html} lang="html" /></div>;
}
function HtmlEntities() {
  const [t, setT] = useState('<div class="foo">Hello & welcome</div>');
  const enc = t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  const dec = t.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e as string]!));
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={6} className="rounded-lg border border-border bg-background p-3 font-mono text-xs" /><div className="space-y-2"><div className="text-[11px] font-mono uppercase text-muted-foreground">Encoded</div><CodeBlock code={enc} /><div className="text-[11px] font-mono uppercase text-muted-foreground">Decoded</div><CodeBlock code={dec} /></div></div>;
}
function TextStats() {
  const [t, setT] = useState("Paste your text here.");
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const chars = t.length, noSpaces = t.replace(/\s/g, "").length;
  const sentences = (t.match(/[.!?]+/g) || []).length;
  const read = Math.max(1, Math.ceil(words / 200));
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={10} className="rounded-lg border border-border bg-background p-3 text-sm" /><div className="grid grid-cols-2 gap-3">{([["Words", words], ["Characters", chars], ["No spaces", noSpaces], ["Sentences", sentences], ["Reading", read + " min"], ["Lines", t.split("\n").length]] as const).map(([l, v]) => <div key={l} className="rounded-xl border border-border bg-card p-4"><div className="text-[10px] font-mono uppercase text-muted-foreground">{l}</div><div className="mt-1 font-display text-2xl text-accent">{v}</div></div>)}</div></div>;
}
function JwtDecoder() {
  const [t, setT] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpCIn0.abc");
  const parts = t.split(".");
  const dec = (s: string) => { try { return JSON.stringify(JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/"))), null, 2); } catch { return "invalid"; } };
  return <div className="space-y-3"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" /><div className="grid gap-3 md:grid-cols-3"><div><div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Header</div><CodeBlock code={parts[0] ? dec(parts[0]) : ""} /></div><div><div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Payload</div><CodeBlock code={parts[1] ? dec(parts[1]) : ""} /></div><div><div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Signature</div><CodeBlock code={parts[2] || ""} /></div></div></div>;
}
function MarkdownPreview() {
  const [t, setT] = useState("# Hello\n\n**Bold** and *italic* and [link](https://jb.dev)\n\n- one\n- two\n- three\n\n> A quote\n\n`inline code`");
  const html = useMemo(() => {
    let h = t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
    h = h.replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>");
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
    h = h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline">$1</a>');
    h = h.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");
    h = h.replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    h = h.split(/\n{2,}/).map((p) => p.startsWith("<") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
    return h;
  }, [t]);
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={14} className="rounded-lg border border-border bg-background p-3 font-mono text-xs" /><div className="rounded-xl border border-border bg-card p-4 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} /></div>;
}
function ImageToBase64() {
  const [out, setOut] = useState("");
  return <div className="space-y-3"><label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer"><ImageIcon className="h-4 w-4" /> Pick image<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setOut(String(r.result)); r.readAsDataURL(f); }} /></label>{out && <><img src={out} alt="preview" className="max-h-40 rounded-lg border border-border" /><CodeBlock code={out.slice(0, 400) + (out.length > 400 ? "…" : "")} /></>}</div>;
}
function ImageConverterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<Array<{
    id: string;
    fileName: string;
    inputType: string;
    inputSize: number;
    width: number;
    height: number;
    sourceUrl: string;
    outputUrl: string;
    outputSize: number | null;
    outputBlob: Blob | null;
    error: string;
  }>>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("webp");
  const [quality, setQuality] = useState(0.9);

  useEffect(() => () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.sourceUrl);
      URL.revokeObjectURL(item.outputUrl);
    });
  }, [items]);

  const fmtLabel = { png: "PNG", jpeg: "JPEG", webp: "WebP" } as const;
  const mime = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;
  const showQuality = format === "jpeg" || format === "webp";
  const prettySize = (bytes: number | null) => bytes == null ? "-" : bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  const totalOriginal = items.reduce((sum, item) => sum + item.inputSize, 0);
  const totalConverted = items.reduce((sum, item) => sum + (item.outputSize ?? 0), 0);
  const hasOutput = items.some((item) => item.outputUrl);
  const convertedCount = items.filter((item) => item.outputUrl && !item.error).length;

  const convertOne = async (nextFile: File, nextFormat: "png" | "jpeg" | "webp", nextQuality: number) => {
    const sourceUrl = URL.createObjectURL(nextFile);
    const fallback = {
      id: `${nextFile.name}-${nextFile.size}-${nextFile.lastModified}`,
      fileName: nextFile.name,
      inputType: nextFile.type || "image file",
      inputSize: nextFile.size,
      width: 0,
      height: 0,
      sourceUrl,
      outputUrl: "",
      outputSize: null,
      outputBlob: null,
      error: "",
    };

    let objectUrl = "";
    setBusy(true);
    try {
      objectUrl = URL.createObjectURL(nextFile);
      const img = new Image();
      img.decoding = "async";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load this image."));
        img.src = objectUrl;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");

      if (nextFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime[nextFormat], nextQuality));
      if (!blob) throw new Error("Conversion failed for the selected format.");

      return {
        ...fallback,
        width,
        height,
        outputUrl: URL.createObjectURL(blob),
        outputSize: blob.size,
        outputBlob: blob,
      };
    } catch (err) {
      return {
        ...fallback,
        error: err instanceof Error ? err.message : "Conversion failed.",
      };
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const rebuildItems = async (nextFiles: File[], nextFormat: "png" | "jpeg" | "webp", nextQuality: number) => {
    if (nextFiles.length === 0) {
      setItems((prev) => {
        prev.forEach((item) => {
          URL.revokeObjectURL(item.sourceUrl);
          URL.revokeObjectURL(item.outputUrl);
        });
        return [];
      });
      return;
    }

    setBusy(true);
    setError("");
    const nextItems = [];
    for (const nextFile of nextFiles) {
      nextItems.push(await convertOne(nextFile, nextFormat, nextQuality));
    }
    setItems((prev) => {
      prev.forEach((item) => {
        URL.revokeObjectURL(item.sourceUrl);
        URL.revokeObjectURL(item.outputUrl);
      });
      return nextItems;
    });
    setBusy(false);
  };

  const handlePick = async (pickedList: FileList | null) => {
    const picked = Array.from(pickedList || []).filter((file) => file.type.startsWith("image/"));
    if (picked.length === 0) return;
    setFiles(picked);
    await rebuildItems(picked, format, quality);
  };

  const updateFormat = async (nextFormat: "png" | "jpeg" | "webp") => {
    setFormat(nextFormat);
    if (files.length) await rebuildItems(files, nextFormat, quality);
  };

  const updateQuality = async (nextQuality: number) => {
    setQuality(nextQuality);
    if (files.length) await rebuildItems(files, format, nextQuality);
  };

  const downloadItem = (item: { fileName: string; outputUrl: string }) => {
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = (item.fileName.replace(/\.[^.]+$/, "") || "converted-image") + "." + format;
    a.click();
  };

  const downloadAll = () => {
    items.filter((item) => item.outputUrl).forEach((item, index) => {
      window.setTimeout(() => downloadItem(item), index * 120);
    });
  };

  const downloadZip = async () => {
    const ready = items.filter((item) => item.outputBlob);
    if (ready.length === 0) return;
    setZipBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      ready.forEach((item) => {
        zip.file((item.fileName.replace(/\.[^.]+$/, "") || "converted-image") + "." + format, item.outputBlob as Blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted-images-${format}.zip`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Could not generate ZIP download.");
    } finally {
      setZipBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
          <ImageIcon className="h-4 w-4" /> Pick images
          <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/*" className="hidden" onChange={(e) => void handlePick(e.target.files)} />
        </label>
        <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
          {(["png", "jpeg", "webp"] as const).map((f) => (
            <button key={f} onClick={() => void updateFormat(f)} className={"rounded-full px-3 py-1 uppercase " + (format === f ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
              {fmtLabel[f]}
            </button>
          ))}
        </div>
        {showQuality && (
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-border px-4 py-2">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Quality</span>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => void updateQuality(+e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
            <span className="w-10 text-right text-xs font-mono">{Math.round(quality * 100)}</span>
          </div>
        )}
        {hasOutput && (
          <>
            <button onClick={downloadAll} className="rounded-full border border-border px-4 py-2 text-xs font-mono uppercase hover:border-accent hover:text-accent">
              Download all
            </button>
            <button onClick={() => void downloadZip()} disabled={zipBusy} className="rounded-full bg-accent px-4 py-2 text-xs font-mono uppercase text-accent-foreground disabled:opacity-60">
              {zipBusy ? "Zipping..." : "Download ZIP"}
            </button>
          </>
        )}
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Upload one or many images to convert them between PNG, JPEG, and WebP right in the browser.
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Files</div>
              <div className="mt-2 font-display text-2xl">{items.length}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Converted</div>
              <div className="mt-2 font-display text-2xl">{convertedCount}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Original Total</div>
              <div className="mt-2 font-display text-2xl">{prettySize(totalOriginal)}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Converted Total</div>
              <div className="mt-2 font-display text-2xl">{prettySize(totalConverted)}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-semibold">{item.fileName}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{item.inputType}</div>
                  </div>
                  {item.outputUrl && (
                    <button onClick={() => downloadItem(item)} className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-[11px] font-mono uppercase text-accent-foreground">
                      Download
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Original</div>
                    <div className="grid min-h-[160px] place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-3">
                      <img src={item.sourceUrl} alt={`${item.fileName} original preview`} className="max-h-[150px] max-w-full rounded-lg object-contain" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Converted</div>
                    <div className="grid min-h-[160px] place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-3">
                      {item.outputUrl
                        ? <img src={item.outputUrl} alt={`${item.fileName} converted preview`} className="max-h-[150px] max-w-full rounded-lg object-contain" />
                        : <div className="text-xs font-mono text-muted-foreground">{item.error || "No output"}</div>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span>Dimensions</span>
                    <span>{item.width && item.height ? `${item.width} x ${item.height}` : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span>Original</span>
                    <span>{prettySize(item.inputSize)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span>Converted</span>
                    <span>{prettySize(item.outputSize)}</span>
                  </div>
                </div>
                {item.error && <div className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-xs font-mono text-rose-400">{item.error}</div>}
              </div>
            ))}
          </div>

          {format === "jpeg" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300">
              JPEG does not support transparency, so transparent areas are flattened onto white.
            </div>
          )}
          {busy && <div className="text-xs font-mono text-muted-foreground">Converting files...</div>}
          {error && <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-xs font-mono text-rose-400">{error}</div>}
        </>
      )}
    </div>
  );
}

function CurlToFetch() {
  const [t, setT] = useState(`curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{"name":"JB"}'`);
  const conv = useMemo(() => {
    const urlMatch = t.match(/curl\s+(?:-X\s+\w+\s+)?['"]?([^'"\s]+)['"]?/);
    const method = (t.match(/-X\s+(\w+)/)?.[1] || "GET").toUpperCase();
    const headers: Record<string, string> = {};
    t.replace(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g, (_, k: string, v: string) => { headers[k.trim()] = v.trim(); return ""; });
    const body = t.match(/-d\s+['"](.+?)['"]/s)?.[1];
    const opts: Record<string, unknown> = { method };
    if (Object.keys(headers).length) opts.headers = headers;
    if (body) opts.body = body;
    return `await fetch(${JSON.stringify(urlMatch?.[1] || "")}, ${JSON.stringify(opts, null, 2)});`;
  }, [t]);
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={t} onChange={(e) => setT(e.target.value)} rows={8} className="rounded-lg border border-border bg-background p-3 font-mono text-xs" /><CodeBlock code={conv} lang="js" /></div>;
}
function SvgLoaders() {
  const spinners = [
    { name: "Dual ring", svg: `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="60 40"><animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/></circle></svg>` },
    { name: "Dots", svg: `<svg width="60" height="20"><circle cx="10" cy="10" r="4" fill="currentColor"><animate attributeName="opacity" values="1;.2;1" dur="1s" repeatCount="indefinite"/></circle><circle cx="30" cy="10" r="4" fill="currentColor"><animate attributeName="opacity" values="1;.2;1" dur="1s" begin=".2s" repeatCount="indefinite"/></circle><circle cx="50" cy="10" r="4" fill="currentColor"><animate attributeName="opacity" values="1;.2;1" dur="1s" begin=".4s" repeatCount="indefinite"/></circle></svg>` },
    { name: "Pulse", svg: `<svg width="40" height="40"><circle cx="20" cy="20" r="4" fill="currentColor"><animate attributeName="r" values="4;18" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite"/></circle></svg>` },
    { name: "Bars", svg: `<svg width="40" height="40">${[0, 12, 24].map((x, i) => `<rect x="${x + 4}" y="10" width="6" height="20" fill="currentColor"><animate attributeName="height" values="20;8;20" dur="1s" begin="${i * 0.15}s" repeatCount="indefinite"/><animate attributeName="y" values="10;16;10" dur="1s" begin="${i * 0.15}s" repeatCount="indefinite"/></rect>`).join("")}</svg>` },
  ];
  return <div className="grid gap-4 md:grid-cols-2">{spinners.map((s) => <div key={s.name} className="rounded-2xl border border-border bg-card p-4 space-y-2"><div className="text-xs font-mono text-muted-foreground">{s.name}</div><div className="grid place-items-center rounded-lg border border-dashed border-border p-6 text-accent" dangerouslySetInnerHTML={{ __html: s.svg }} /><CodeBlock code={s.svg} lang="html" /></div>)}</div>;
}
function CheatSheet() {
  const sections: { title: string; items: [string, string][] }[] = [
    { title: "Flexbox", items: [["Center everything", "display:flex; align-items:center; justify-content:center"], ["Space between", "justify-content: space-between"], ["Wrap", "flex-wrap: wrap"], ["Grow evenly", "flex: 1"]] },
    { title: "Grid", items: [["3-col responsive", "grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))"], ["Full width row", "grid-column: 1 / -1"], ["Gap", "gap: 1rem"]] },
    { title: "Position", items: [["Sticky header", "position: sticky; top: 0"], ["Overlay", "position: absolute; inset: 0"]] },
    { title: "Modern", items: [["Container query", "@container (min-width: 640px) { … }"], ["Text balance", "text-wrap: balance"], ["Cascade layers", "@layer base, components, utilities"], ["Nesting", "&:hover { … }"]] },
  ];
  return <div className="grid gap-4 md:grid-cols-2">{sections.map((sec) => <div key={sec.title} className="rounded-2xl border border-border bg-card p-4"><div className="font-display font-semibold mb-3">{sec.title}</div><div className="space-y-2">{sec.items.map(([k, v]) => <div key={k} className="grid grid-cols-[1fr_auto] items-center gap-3"><div><div className="text-xs">{k}</div><code className="text-[11px] font-mono text-muted-foreground">{v}</code></div><CopyBtn value={v} /></div>)}</div></div>)}</div>;
}
function DiffChecker() {
  const [a, setA] = useState("line one\nline two\nline three"); const [b, setB] = useState("line one\nline two changed\nline three\nnew line");
  const la = a.split("\n"), lb = b.split("\n"), max = Math.max(la.length, lb.length);
  return <div className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><textarea value={a} onChange={(e) => setA(e.target.value)} rows={8} className="rounded-lg border border-border bg-background p-3 font-mono text-xs" /><textarea value={b} onChange={(e) => setB(e.target.value)} rows={8} className="rounded-lg border border-border bg-background p-3 font-mono text-xs" /></div><div className="rounded-xl border border-border bg-card p-3 font-mono text-xs">{Array.from({ length: max }).map((_, i) => { const same = la[i] === lb[i]; return <div key={i} className={same ? "text-muted-foreground" : "text-accent"}>{same ? "  " : "≠ "}{lb[i] ?? ""} <span className="opacity-40">{same ? "" : `(was: ${la[i] ?? ""})`}</span></div>; })}</div></div>;
}

function CheatSheetComplete() {
  const sections: { title: string; items: [string, string][] }[] = [
    {
      title: "Layout",
      items: [
        ["Center everything", "display: flex;\nalign-items: center;\njustify-content: center;"],
        ["Space between row", "display: flex;\njustify-content: space-between;\nalign-items: center;"],
        ["Wrap children", "display: flex;\nflex-wrap: wrap;\ngap: 1rem;"],
        ["Responsive auto grid", "display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\ngap: 1rem;"],
        ["Equal-height cards", "display: grid;\ngrid-auto-rows: 1fr;"],
        ["Sidebar + content", "display: grid;\ngrid-template-columns: 280px minmax(0, 1fr);\ngap: 1.5rem;"],
      ],
    },
    {
      title: "Spacing",
      items: [
        ["Page container", "width: min(100% - 2rem, 72rem);\nmargin-inline: auto;"],
        ["Section spacing", "padding-block: clamp(3rem, 6vw, 6rem);"],
        ["Fluid card padding", "padding: clamp(1rem, 2vw, 1.5rem);"],
        ["Safe viewport height", "min-height: 100svh;"],
      ],
    },
    {
      title: "Position",
      items: [
        ["Sticky header", "position: sticky;\ntop: 0;\nz-index: 50;"],
        ["Absolute overlay", "position: absolute;\ninset: 0;"],
        ["Absolute center", "position: absolute;\nleft: 50%;\ntop: 50%;\ntransform: translate(-50%, -50%);"],
        ["Floating action button", "position: fixed;\nright: 1rem;\nbottom: 1rem;"],
      ],
    },
    {
      title: "Typography",
      items: [
        ["Fluid heading", "font-size: clamp(2rem, 5vw, 4.5rem);\nline-height: 0.95;"],
        ["Readable paragraph", "max-width: 65ch;\nline-height: 1.7;"],
        ["Balance headline", "text-wrap: balance;"],
        ["Pretty body text", "text-wrap: pretty;"],
        ["Two-line clamp", "display: -webkit-box;\n-webkit-line-clamp: 2;\n-webkit-box-orient: vertical;\noverflow: hidden;"],
      ],
    },
    {
      title: "Backgrounds",
      items: [
        ["Linear gradient", "background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #38bdf8 100%);"],
        ["Radial glow", "background: radial-gradient(circle at top, rgba(56, 189, 248, 0.25), transparent 45%);"],
        ["Mesh background", "background:\n  radial-gradient(circle at 20% 20%, rgba(244, 114, 182, 0.25), transparent 30%),\n  radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.2), transparent 28%),\n  #020617;"],
        ["Image cover", "background: url('/image.jpg') center / cover no-repeat;"],
      ],
    },
    {
      title: "Borders & Radius",
      items: [
        ["Rounded card", "border: 1px solid var(--border);\nborder-radius: 1.5rem;"],
        ["Pill shape", "border-radius: 999px;"],
        ["Gradient border", "border: 1px solid transparent;\nbackground:\n  linear-gradient(#0f172a, #0f172a) padding-box,\n  linear-gradient(135deg, #38bdf8, #f472b6) border-box;"],
        ["Dashed drop zone", "border: 2px dashed color-mix(in srgb, currentColor 35%, transparent);"],
      ],
    },
    {
      title: "Effects",
      items: [
        ["Soft shadow", "box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);"],
        ["Layered shadow", "box-shadow:\n  0 1px 2px rgba(15, 23, 42, 0.08),\n  0 12px 24px rgba(15, 23, 42, 0.12);"],
        ["Glassmorphism", "background: rgba(255, 255, 255, 0.08);\nbackdrop-filter: blur(18px) saturate(160%);"],
        ["Image polish", "filter: saturate(1.1) contrast(1.05);"],
        ["Text glow", "text-shadow: 0 2px 18px rgba(14, 165, 233, 0.35);"],
      ],
    },
    {
      title: "Interactions",
      items: [
        ["Smooth transition", "transition: transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease;"],
        ["Lift on hover", "transition: transform 180ms ease;\n\n:hover {\n  transform: translateY(-4px);\n}"],
        ["Keyboard focus ring", ":focus-visible {\n  outline: 3px solid rgba(56, 189, 248, 0.45);\n  outline-offset: 3px;\n}"],
        ["Disable pointer hits", "pointer-events: none;"],
      ],
    },
    {
      title: "Animation",
      items: [
        ["Fade up", "@keyframes fade-up {\n  from { opacity: 0; transform: translateY(12px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\nelement {\n  animation: fade-up 500ms ease both;\n}"],
        ["Float loop", "@keyframes float {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-8px); }\n}\n\nelement {\n  animation: float 3s ease-in-out infinite;\n}"],
        ["Stagger by variable", "animation-delay: calc(var(--index) * 80ms);"],
        ["Reduced motion safe", "@media (prefers-reduced-motion: reduce) {\n  * {\n    animation: none !important;\n    transition: none !important;\n  }\n}"],
      ],
    },
    {
      title: "Responsive",
      items: [
        ["Tablet breakpoint", "@media (min-width: 768px) {\n  .layout { grid-template-columns: 1fr 1fr; }\n}"],
        ["Desktop breakpoint", "@media (min-width: 1024px) {\n  .layout { grid-template-columns: 280px 1fr; }\n}"],
        ["Clamp width", "width: clamp(16rem, 40vw, 28rem);"],
        ["Container query", "@container (min-width: 42rem) {\n  .card { grid-template-columns: 1fr 1fr; }\n}"],
      ],
    },
    {
      title: "Forms",
      items: [
        ["Input reset", "appearance: none;\nbackground: transparent;\nborder: 0;\nfont: inherit;"],
        ["Custom placeholder", "::placeholder {\n  color: color-mix(in srgb, currentColor 45%, transparent);\n}"],
        ["Accent color", "accent-color: #0ea5e9;"],
        ["Invalid state", ":invalid {\n  border-color: #ef4444;\n}"],
      ],
    },
    {
      title: "Modern CSS",
      items: [
        ["Cascade layers", "@layer reset, base, components, utilities;"],
        ["CSS nesting", ".card {\n  & img {\n    border-radius: inherit;\n  }\n\n  &:hover {\n    transform: translateY(-2px);\n  }\n}"],
        ["Color mix", "background: color-mix(in srgb, var(--accent) 18%, transparent);"],
        ["Aspect ratio", "aspect-ratio: 16 / 9;"],
        ["Subgrid", "grid-template-columns: subgrid;"],
      ],
    },
  ];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const categories = ["All", ...sections.map((section) => section.title)];
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(([label, snippet]) => {
        const matchesQuery = !query || `${label} ${snippet}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = active === "All" || section.title === active;
        return matchesQuery && matchesCategory;
      }),
    }))
    .filter((section) => section.items.length > 0);
  const totalSnippets = sections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <div>
            <div className="font-display text-xl font-semibold">CSS Cheatsheet</div>
            <p className="mt-1 text-sm text-muted-foreground">A broader quick-reference pack for layout, typography, effects, responsive patterns, forms, and modern CSS features.</p>
          </div>
          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Search snippets</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="grid, clamp, sticky, gradient, focus-visible..."
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            `Sections: ${sections.length}`,
            `Snippets: ${totalSnippets}`,
            `Showing: ${filteredSections.reduce((sum, section) => sum + section.items.length, 0)}`,
          ].map((item) => (
            <div key={item} className="rounded-xl border border-border bg-background px-3 py-3 text-xs font-mono text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActive(category)}
            className={"rounded-full border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide transition " + (active === category ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredSections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No snippets matched that search. Try broader terms like `flex`, `hover`, `animation`, or `container`.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredSections.map((sec) => (
            <div key={sec.title} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-display font-semibold">{sec.title}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{sec.items.length} snippets</div>
              </div>
              <div className="space-y-3">
                {sec.items.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="text-sm">{k}</div>
                      <CopyBtn value={v} />
                    </div>
                    <CodeBlock code={v} lang="css" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SnippetCard({ s }: { s: Snippet }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="font-display text-base font-semibold">{s.title}</div>
      <p className="text-xs text-muted-foreground">{s.explain}</p>
      <div className="rounded-lg border border-dashed border-border p-4 grid place-items-center min-h-[80px]">{s.demo()}</div>
      <CodeBlock code={s.code} lang="js" />
    </div>
  );
}
function JsSnippetsLibrary() { return <div className="grid gap-4 md:grid-cols-2">{SNIPPETS.map((s) => <SnippetCard key={s.title} s={s} />)}</div>; }

/* ---------- Components ---------- */
function ComponentsLibrary() {
  const items: { name: string; render: React.ReactNode; code: string }[] = [
    { name: "Primary Button", render: <button className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">Get started</button>, code: '<button class="rounded-full bg-accent px-5 py-2 text-sm text-accent-foreground">Get started</button>' },
    { name: "Card", render: <div className="rounded-2xl border border-border bg-card p-5 max-w-xs"><div className="font-semibold">Card title</div><p className="text-sm text-muted-foreground mt-1">Card body copy goes here.</p></div>, code: '<div class="rounded-2xl border p-5"><h3>Card title</h3><p>Body</p></div>' },
    { name: "Badge", render: <span className="rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-mono uppercase">New</span>, code: '<span class="rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs">New</span>' },
    { name: "Skeleton", render: <div className="space-y-2 w-full max-w-xs"><div className="h-4 rounded bg-muted animate-pulse" /><div className="h-4 w-3/4 rounded bg-muted animate-pulse" /></div>, code: '<div class="h-4 rounded bg-muted animate-pulse"></div>' },
    { name: "Alert", render: <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-400">Heads up — this is an alert.</div>, code: '<div class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-400">Alert</div>' },
    { name: "Progress", render: <div className="h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden"><div className="h-full w-2/3 bg-accent" /></div>, code: '<div class="h-2 rounded-full bg-muted"><div class="h-full w-2/3 bg-accent"></div></div>' },
    { name: "Empty state", render: <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">Nothing here yet.</div>, code: '<div class="rounded-xl border border-dashed p-6 text-center">Empty</div>' },
    { name: "Testimonial", render: <blockquote className="rounded-xl border border-border p-4 max-w-sm"><p className="italic text-sm">“One of the best UI devs I've worked with.”</p><div className="mt-2 text-xs font-mono text-muted-foreground">— Design Lead</div></blockquote>, code: '<blockquote>…</blockquote>' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((i) => (
        <div key={i.name} className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="font-display font-semibold">{i.name}</div>
          <div className="rounded-xl border border-dashed border-border p-6 grid place-items-center min-h-[120px]">{i.render}</div>
          <CodeBlock code={i.code} lang="html" />
        </div>
      ))}
    </div>
  );
}

function SvgOptimizerTool() {
  const [svg, setSvg] = useState(`<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g class="icon-root" data-name="demo">
    <rect width="120" height="120" rx="24" fill="#111827"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M30 60c0-16.569 13.431-30 30-30s30 13.431 30 30-13.431 30-30 30-30-13.431-30-30Z" fill="#f59e0b"/>
  </g>
</svg>`);
  const out = useMemo(() => {
    try {
      const doc = new DOMParser().parseFromString(svg.trim(), "image/svg+xml");
      const root = doc.documentElement;
      if (doc.querySelector("parsererror") || root.nodeName !== "svg") throw new Error("Invalid SVG");
      root.querySelectorAll("*").forEach((el) => ["class", "data-name", "id", "style", "xml:space", "xmlns:xlink"].forEach((a) => el.removeAttribute(a)));
      root.removeAttribute("width"); root.removeAttribute("height"); root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const clean = root.outerHTML.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
      const jsx = clean.replace(/class=/g, "className=").replace(/fill-rule=/g, "fillRule=").replace(/clip-rule=/g, "clipRule=").replace(/stroke-width=/g, "strokeWidth=").replace(/stroke-linecap=/g, "strokeLinecap=").replace(/stroke-linejoin=/g, "strokeLinejoin=");
      return { clean, jsx, preview: clean, error: "" };
    } catch {
      return { clean: "", jsx: "", preview: "", error: "SVG parsing failed." };
    }
  }, [svg]);
  return <div className="grid gap-4 lg:grid-cols-2"><div className="space-y-3"><textarea value={svg} onChange={(e) => setSvg(e.target.value)} rows={14} className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" />{out.error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">{out.error}</div> : <CodeBlock code={out.clean} lang="svg" />}</div><div className="space-y-3"><Preview dark={false} className="overflow-hidden [&_svg]:max-h-56 [&_svg]:max-w-full"><div dangerouslySetInnerHTML={{ __html: out.preview }} /></Preview><CodeBlock code={out.jsx} lang="jsx" /></div></div>;
}

function HtmlJsxTool() {
  const [mode, setMode] = useState<"html-jsx" | "jsx-html">("html-jsx");
  const [value, setValue] = useState(`<label class="field">
  <input readonly tabindex="0" />
</label>`);
  const out = useMemo(() => mode === "html-jsx" ? value.replace(/class=/g, "className=").replace(/for=/g, "htmlFor=").replace(/readonly/g, "readOnly").replace(/tabindex=/g, "tabIndex=") : value.replace(/className=/g, "class=").replace(/htmlFor=/g, "for=").replace(/readOnly/g, "readonly").replace(/tabIndex=/g, "tabindex="), [mode, value]);
  return <div className="space-y-3"><div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">{([["html-jsx", "HTML → JSX"], ["jsx-html", "JSX → HTML"]] as const).map(([id, label]) => <button key={id} onClick={() => setMode(id)} className={"rounded-full px-3 py-1 " + (mode === id ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{label}</button>)}</div><div className="grid gap-4 lg:grid-cols-2"><textarea value={value} onChange={(e) => setValue(e.target.value)} rows={12} className="rounded-xl border border-border bg-background p-3 font-mono text-xs" /><CodeBlock code={out} lang={mode === "html-jsx" ? "jsx" : "html"} /></div></div>;
}

function HtmlJsxToolFixed() {
  const [mode, setMode] = useState<"html-jsx" | "jsx-html">("html-jsx");
  const [value, setValue] = useState(`<label class="field" for="email">
  <input readonly tabindex="0" style="border-radius: 12px; background-color: #111827;" />
</label>`);

  const out = useMemo(() => {
    const htmlToJsxAttrs: Record<string, string> = {
      class: "className",
      for: "htmlFor",
      tabindex: "tabIndex",
      readonly: "readOnly",
      maxlength: "maxLength",
      minlength: "minLength",
      autocomplete: "autoComplete",
      autofocus: "autoFocus",
      spellcheck: "spellCheck",
      contenteditable: "contentEditable",
      srcset: "srcSet",
      crossorigin: "crossOrigin",
      colspan: "colSpan",
      rowspan: "rowSpan",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      fillrule: "fillRule",
      cliprule: "clipRule",
      strokewidth: "strokeWidth",
      strokelinecap: "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      strokeopacity: "strokeOpacity",
      fillopacity: "fillOpacity",
      viewbox: "viewBox",
    };
    const jsxToHtmlAttrs: Record<string, string> = Object.fromEntries(
      Object.entries(htmlToJsxAttrs).map(([htmlAttr, jsxAttr]) => [jsxAttr, htmlAttr]),
    );
    const booleanAttrs = new Set(["disabled", "checked", "selected", "multiple", "required", "readonly", "autofocus", "novalidate", "hidden", "open", "controls", "loop", "muted", "playsinline"]);
    const cssPropToJs = (prop: string) => prop.trim().replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    const jsPropToCss = (prop: string) => prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const convertHtmlStyleToJsx = (styleValue: string) => {
      const pairs = styleValue.split(";").map((item) => item.trim()).filter(Boolean);
      if (!pairs.length) return "{{}}";
      return `{{ ${pairs.map((pair) => {
        const [prop, rawValue] = pair.split(":");
        return `${cssPropToJs(prop || "")}: "${(rawValue || "").trim().replace(/"/g, '\\"')}"`;
      }).join(", ")} }}`;
    };
    const convertJsxStyleToHtml = (styleValue: string) => {
      const body = styleValue.trim().replace(/^\{\{/, "").replace(/\}\}$/, "").trim();
      if (!body) return '""';
      const pairs = body.split(",").map((item) => item.trim()).filter(Boolean);
      return `"${pairs.map((pair) => {
        const [prop, rawValue] = pair.split(":").map((part) => part.trim());
        return `${jsPropToCss(prop || "")}: ${(rawValue || "").replace(/^["']|["']$/g, "")}`;
      }).join("; ")}"`;
    };

    if (mode === "html-jsx") {
      let next = value;
      next = next.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");
      next = next.replace(/\sstyle=(['"])(.*?)\1/gi, (_, _quote: string, styleValue: string) => ` style=${convertHtmlStyleToJsx(styleValue)}`);
      next = next.replace(/<([a-zA-Z][^\s/>]*)([^>]*)>/g, (_full, tagName: string, attrs: string) => {
        const rewritten = attrs.replace(/\s([:@a-zA-Z_][\w:.-]*)(?:=(["'])(.*?)\2)?/g, (_match, attrName: string, _q: string | undefined, attrValue: string | undefined) => {
          const lower = attrName.toLowerCase();
          const mapped = htmlToJsxAttrs[lower] || attrName;
          if (booleanAttrs.has(lower) && typeof attrValue === "undefined") return ` ${mapped}={true}`;
          return attrValue === undefined ? ` ${mapped}` : ` ${mapped}="${attrValue}"`;
        });
        return `<${tagName}${rewritten}>`;
      });
      return next;
    }

    let next = value;
    next = next.replace(/\{\/\*([\s\S]*?)\*\/\}/g, "<!--$1-->");
    next = next.replace(/\sstyle=\{\{([\s\S]*?)\}\}/g, (_match, body: string) => ` style=${convertJsxStyleToHtml(`{{${body}}}`)}`);
    next = next.replace(/<([a-zA-Z][^\s/>]*)([^>]*)>/g, (_full, tagName: string, attrs: string) => {
      const rewritten = attrs.replace(/\s([:@a-zA-Z_][\w:.-]*)(?:=(\{true\}|"[^"]*"|'[^']*'|\{[^}]*\}))?/g, (_match, attrName: string, attrValue: string | undefined) => {
        const mapped = jsxToHtmlAttrs[attrName] || attrName;
        if (attrValue === "{true}") return ` ${mapped}`;
        if (!attrValue) return ` ${mapped}`;
        if (attrValue.startsWith("{") && attrValue.endsWith("}")) return ` ${mapped}="${attrValue.slice(1, -1)}"`;
        return ` ${mapped}=${attrValue}`;
      });
      return `<${tagName}${rewritten}>`;
    });
    return next;
  }, [mode, value]);

  return <div className="space-y-3"><div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">{([["html-jsx", "HTML → JSX"], ["jsx-html", "JSX → HTML"]] as const).map(([id, label]) => <button key={id} onClick={() => setMode(id)} className={"rounded-full px-3 py-1 " + (mode === id ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{label}</button>)}</div><div className="grid gap-4 lg:grid-cols-2"><textarea value={value} onChange={(e) => setValue(e.target.value)} rows={12} className="rounded-xl border border-border bg-background p-3 font-mono text-xs" /><CodeBlock code={out} lang={mode === "html-jsx" ? "jsx" : "html"} /></div></div>;
}

function CssToTailwindTool() {
  const [css, setCss] = useState(`display: flex;
align-items: center;
justify-content: space-between;
padding: 16px 24px;
gap: 12px;
border-radius: 16px;
background: #111827;
color: #ffffff;`);
  const out = useMemo(() => {
    const lines = css.split(";").map((l) => l.trim()).filter(Boolean);
    const px = (v: string) => { const n = Number(v.replace("px", "")); return Number.isFinite(n) ? n / 4 : null; };
    return lines.map((line) => {
      const [propRaw, valueRaw] = line.split(":").map((x) => x.trim());
      const prop = propRaw?.toLowerCase(); const value = valueRaw?.toLowerCase();
      if (!prop || !value) return "";
      if (prop === "display" && value === "flex") return "flex";
      if (prop === "display" && value === "grid") return "grid";
      if (prop === "align-items" && value === "center") return "items-center";
      if (prop === "justify-content" && value === "center") return "justify-center";
      if (prop === "justify-content" && value === "space-between") return "justify-between";
      if (prop === "gap") return "gap-" + px(value);
      if (prop === "border-radius") return px(value) === 4 ? "rounded-xl" : `rounded-[${value}]`;
      if (prop === "padding") { const parts = value.split(/\s+/); if (parts.length === 2) return `py-${px(parts[0])} px-${px(parts[1])}`; if (parts.length === 1) return `p-${px(parts[0])}`; }
      if (prop === "background" || prop === "background-color") return value.startsWith("#") ? `bg-[${value}]` : "";
      if (prop === "color") return value.startsWith("#") ? `text-[${value}]` : "";
      if (prop === "width") return value === "100%" ? "w-full" : "";
      if (prop === "height") return value === "100%" ? "h-full" : "";
      if (prop === "font-weight") return value === "600" ? "font-semibold" : value === "700" ? "font-bold" : "";
      return `/* ${line} */`;
    }).filter(Boolean).join(" ");
  }, [css]);
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={css} onChange={(e) => setCss(e.target.value)} rows={12} className="rounded-xl border border-border bg-background p-3 font-mono text-xs" /><CodeBlock code={out} lang="tailwind" /></div>;
}

function TailwindSorterTool() {
  const [value, setValue] = useState("text-white px-4 flex rounded-xl py-2 px-4 items-center bg-black justify-between text-sm");
  const out = useMemo(() => {
    const rank = (token: string) => {
      if (/^(absolute|relative|sticky|fixed)/.test(token)) return 1;
      if (/^(flex|inline-flex|grid|block|hidden)/.test(token)) return 2;
      if (/^(items-|justify-|content-|self-|place-)/.test(token)) return 3;
      if (/^(p|m|gap|space-)/.test(token)) return 4;
      if (/^(w-|h-|min-|max-)/.test(token)) return 5;
      if (/^(text-|font-|leading-|tracking-)/.test(token)) return 6;
      if (/^(bg-|from-|via-|to-)/.test(token)) return 7;
      if (/^(border|rounded)/.test(token)) return 8;
      if (/^(shadow|opacity|blur|ring)/.test(token)) return 9;
      if (/^(hover:|focus:|active:|disabled:)/.test(token)) return 11;
      return 10;
    };
    const tokens = Array.from(new Set(value.trim().split(/\s+/).filter(Boolean)));
    return tokens.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).join(" ");
  }, [value]);
  return <div className="space-y-3"><textarea value={value} onChange={(e) => setValue(e.target.value)} rows={6} className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" /><CodeBlock code={out} lang="tailwind" /></div>;
}

function BoxShadowPresetsTool() {
  const presets = [{ name: "Card Soft", shadow: "0 12px 40px -18px rgba(15, 23, 42, .35)" }, { name: "Dropdown", shadow: "0 16px 36px -14px rgba(2, 6, 23, .38)" }, { name: "Modal", shadow: "0 28px 80px -24px rgba(2, 6, 23, .55)" }, { name: "Glow", shadow: "0 0 0 1px rgba(245,158,11,.18), 0 24px 60px -24px rgba(245,158,11,.55)" }];
  return <div className="grid gap-4 md:grid-cols-2">{presets.map((p) => <div key={p.name} className="rounded-2xl border border-border bg-card p-4 space-y-3"><div className="font-display font-semibold">{p.name}</div><Preview dark={false}><div className="h-28 w-44 rounded-2xl bg-white" style={{ boxShadow: p.shadow }} /></Preview><CodeBlock code={`box-shadow: ${p.shadow};`} /></div>)}</div>;
}

function GradientMeshTool() {
  const [c1, setC1] = useState("#f59e0b"), [c2, setC2] = useState("#06b6d4"), [c3, setC3] = useState("#fb7185");
  const css = `background:\nradial-gradient(circle at 20% 20%, ${c1}, transparent 35%),\nradial-gradient(circle at 80% 20%, ${c2}, transparent 35%),\nradial-gradient(circle at 50% 80%, ${c3}, transparent 40%),\nlinear-gradient(135deg, #0f172a, #020617);`;
  return <div className="space-y-4"><div className="flex gap-3 flex-wrap">{[c1, c2, c3].map((c, i) => <label key={i} className="text-xs font-mono flex items-center gap-2">Color {i + 1}<input type="color" value={c} onChange={(e) => [setC1, setC2, setC3][i](e.target.value)} className="h-8 w-10" /></label>)}</div><div className="rounded-3xl border border-border p-3"><div className="h-72 rounded-2xl" style={{ background: `radial-gradient(circle at 20% 20%, ${c1}, transparent 35%),radial-gradient(circle at 80% 20%, ${c2}, transparent 35%),radial-gradient(circle at 50% 80%, ${c3}, transparent 40%),linear-gradient(135deg, #0f172a, #020617)` }} /></div><CodeBlock code={css} /></div>;
}

function SkeletonLoaderTool() {
  const [type, setType] = useState<"card" | "list" | "table">("card");
  const code = {
    card: `<div class="space-y-3 animate-pulse"><div class="h-40 rounded-2xl bg-muted"></div><div class="h-4 w-2/3 rounded bg-muted"></div><div class="h-4 w-1/2 rounded bg-muted"></div></div>`,
    list: `<div class="space-y-3">${Array.from({ length: 4 }, () => `<div class="flex items-center gap-3 animate-pulse"><div class="h-10 w-10 rounded-full bg-muted"></div><div class="flex-1 space-y-2"><div class="h-4 w-1/3 rounded bg-muted"></div><div class="h-3 w-2/3 rounded bg-muted"></div></div></div>`).join("")}</div>`,
    table: `<div class="space-y-2">${Array.from({ length: 5 }, () => `<div class="grid grid-cols-4 gap-3 animate-pulse"><div class="h-4 rounded bg-muted"></div><div class="h-4 rounded bg-muted"></div><div class="h-4 rounded bg-muted"></div><div class="h-4 rounded bg-muted"></div></div>`).join("")}</div>`,
  } as const;
  const preview = {
    card: (
      <div className="max-w-sm space-y-3 animate-pulse">
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    ),
    list: (
      <div className="w-full max-w-md space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    ),
    table: (
      <div className="w-full space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 animate-pulse">
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 rounded bg-muted" />
          </div>
        ))}
      </div>
    ),
  } as const;
  return <div className="space-y-4"><div className="flex gap-2">{(["card", "list", "table"] as const).map((k) => <button key={k} onClick={() => setType(k)} className={"rounded-full border px-3 py-1 text-xs font-mono uppercase " + (type === k ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{k}</button>)}</div><div className="rounded-2xl border border-border bg-card p-5">{preview[type]}</div><CodeBlock code={code[type]} lang="html" /></div>;
}

function RegexLibraryTool() {
  const presets = { email: String.raw`^[^\s@]+@[^\s@]+\.[^\s@]+$`, phone: String.raw`^\+?[0-9\s\-()]{8,20}$`, password: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$`, username: String.raw`^[a-z0-9_]{3,20}$`, otp: String.raw`^\d{4,8}$`, url: String.raw`^https?:\/\/[^\s/$.?#].[^\s]*$`, card: String.raw`^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$` } as const;
  const [key, setKey] = useState<keyof typeof presets>("email");
  const [text, setText] = useState("hello@example.com");
  const ok = (() => { try { return new RegExp(presets[key]).test(text); } catch { return false; } })();
  return <div className="space-y-3"><div className="flex gap-2 flex-wrap">{(Object.keys(presets) as Array<keyof typeof presets>).map((k) => <button key={k} onClick={() => setKey(k)} className={"rounded-full border px-3 py-1 text-xs font-mono uppercase " + (key === k ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{k}</button>)}</div><input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" /><div className={"rounded-lg border p-3 text-sm font-mono " + (ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-rose-500/30 bg-rose-500/10 text-rose-400")}>{ok ? "Valid match" : "Does not match"}</div><CodeBlock code={presets[key]} lang="regex" /></div>;
}

function inferTs(name: string, value: unknown): string {
  if (Array.isArray(value)) return value.length ? `${inferTs(name, value[0])}[]` : "unknown[]";
  if (value === null) return "null";
  if (typeof value === "object") return `{\n${Object.entries(value as Record<string, unknown>).map(([k, v]) => `  ${k}: ${inferTs(k, v)};`).join("\n")}\n}`;
  return typeof value;
}
function inferZod(value: unknown): string {
  if (Array.isArray(value)) return `z.array(${value.length ? inferZod(value[0]) : "z.unknown()"})`;
  if (value === null) return "z.null()";
  if (typeof value === "object") return `z.object({ ${Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${inferZod(v)}`).join(", ")} })`;
  if (typeof value === "string") return "z.string()";
  if (typeof value === "number") return "z.number()";
  if (typeof value === "boolean") return "z.boolean()";
  return "z.unknown()";
}
function snapshotStorageEntries(storage: Storage | null) {
  if (!storage) return [] as Array<{ key: string; value: string }>;
  return Array.from({ length: storage.length }, (_, index) => {
    const itemKey = storage.key(index) || `key-${index}`;
    return { key: itemKey, value: storage.getItem(itemKey) || "" };
  }).sort((a, b) => a.key.localeCompare(b.key));
}
function JsonToTypesTool() {
  const [v, setV] = useState('{"id":1,"name":"Jwala","active":true,"skills":["react","next"],"meta":{"role":"frontend"}}');
  const out = useMemo(() => { try { const parsed = JSON.parse(v); return { ts: `type Root = ${inferTs("Root", parsed)};`, zod: `const schema = ${inferZod(parsed)};`, error: "" }; } catch (e) { return { ts: "", zod: "", error: (e as Error).message }; } }, [v]);
  return <div className="grid gap-4 lg:grid-cols-2"><textarea value={v} onChange={(e) => setV(e.target.value)} rows={14} className="rounded-xl border border-border bg-background p-3 font-mono text-xs" /><div className="space-y-3">{out.error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">{out.error}</div> : <><CodeBlock code={out.ts} lang="ts" /><CodeBlock code={out.zod} lang="ts" /></>}</div></div>;
}

function StoragePlaygroundTool() {
  const [engine, setEngine] = useState<"localStorage" | "sessionStorage">("localStorage");
  const [key, setKey] = useState("theme");
  const [value, setValue] = useState('{"mode":"dark","sidebar":true}');
  const [read, setRead] = useState("");
  const [valueMode, setValueMode] = useState<"text" | "json">("json");
  const [status, setStatus] = useState("Ready");
  const [lastAction, setLastAction] = useState<"setItem" | "getItem" | "removeItem" | "clear">("setItem");
  const [entries, setEntries] = useState<Array<{ key: string; value: string }>>([]);
  const api = typeof window !== "undefined" ? window[engine] : null;

  const refreshEntries = () => setEntries(snapshotStorageEntries(api));

  useEffect(() => {
    setEntries(snapshotStorageEntries(api));
    setRead("");
    setStatus(`Switched to ${engine}`);
  }, [api, engine]);

  const formatValueForCode = () => {
    if (valueMode === "json") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return JSON.stringify(value);
      }
    }
    return JSON.stringify(value);
  };

  const setItem = () => {
    if (!api || !key.trim()) return;
    let nextValue = value;
    if (valueMode === "json") {
      try {
        nextValue = JSON.stringify(JSON.parse(value));
      } catch {
        setStatus("Invalid JSON. Fix the value before saving.");
        return;
      }
    }
    api.setItem(key, nextValue);
    setRead(nextValue);
    setLastAction("setItem");
    setStatus(`Saved "${key}" in ${engine}`);
    refreshEntries();
  };

  const getItem = (nextKey = key) => {
    if (!api || !nextKey.trim()) return;
    const saved = api.getItem(nextKey);
    setRead(saved ?? "");
    setKey(nextKey);
    setLastAction("getItem");
    setStatus(saved === null ? `No item found for "${nextKey}"` : `Loaded "${nextKey}" from ${engine}`);
  };

  const removeItem = () => {
    if (!api || !key.trim()) return;
    api.removeItem(key);
    setRead("");
    setLastAction("removeItem");
    setStatus(`Removed "${key}" from ${engine}`);
    refreshEntries();
  };

  const clearItems = () => {
    if (!api) return;
    api.clear();
    setRead("");
    setLastAction("clear");
    setStatus(`Cleared all ${engine} entries`);
    refreshEntries();
  };

  const parsedRead = (() => {
    if (!read) return "No value loaded yet.";
    try {
      return JSON.stringify(JSON.parse(read), null, 2);
    } catch {
      return read;
    }
  })();

  const codeMap = {
    setItem: valueMode === "json"
      ? `const payload = ${formatValueForCode()};\n${engine}.setItem(${JSON.stringify(key)}, JSON.stringify(payload));`
      : `${engine}.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)});`,
    getItem: `const saved = ${engine}.getItem(${JSON.stringify(key)});\nconst parsed = saved ? (() => {\n  try { return JSON.parse(saved); }\n  catch { return saved; }\n})() : null;`,
    removeItem: `${engine}.removeItem(${JSON.stringify(key)});`,
    clear: `${engine}.clear();`,
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["localStorage", "sessionStorage"] as const).map((m) => (
          <button key={m} onClick={() => setEngine(m)} className={"rounded-full border px-3 py-1 text-xs font-mono uppercase " + (engine === m ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{m}</button>
        ))}
        {(["text", "json"] as const).map((m) => (
          <button key={m} onClick={() => setValueMode(m)} className={"rounded-full border px-3 py-1 text-xs font-mono uppercase " + (valueMode === m ? "bg-foreground text-background border-foreground" : "border-border")}>{m} value</button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="storage key" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {entries.length} item{entries.length === 1 ? "" : "s"} in {engine}
            </div>
          </div>

          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={8} placeholder={valueMode === "json" ? '{"mode":"dark"}' : "dark"} className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs" />

          <div className="flex gap-2 flex-wrap">
            <button onClick={setItem} className="rounded-full bg-accent px-4 py-2 text-xs font-mono uppercase text-accent-foreground">Set item</button>
            <button onClick={() => getItem()} className="rounded-full border border-border px-4 py-2 text-xs font-mono uppercase">Get item</button>
            <button onClick={removeItem} className="rounded-full border border-border px-4 py-2 text-xs font-mono uppercase">Remove item</button>
            <button onClick={clearItems} className="rounded-full border border-border px-4 py-2 text-xs font-mono uppercase">Clear all</button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Result</div>
            <div className="rounded-lg border border-border bg-background p-3 text-sm font-mono whitespace-pre-wrap break-words">{parsedRead}</div>
            <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{status}</div>
          </div>

          <CodeBlock code={codeMap[lastAction]} lang="js" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Stored entries</div>
              <div className="mt-1 text-sm font-semibold">{engine}</div>
            </div>
            <button onClick={refreshEntries} className="rounded-full border border-border px-3 py-1 text-[11px] font-mono uppercase">Refresh</button>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No entries saved yet. Add a key and value, then click `Set item`.</div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
              {entries.map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => { setKey(entry.key); setValue(entry.value); getItem(entry.key); }}
                  className="w-full rounded-xl border border-border bg-background p-3 text-left transition hover:border-accent/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-mono uppercase tracking-widest text-muted-foreground">{entry.key}</div>
                      <div className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm text-foreground">{entry.value}</div>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground">open</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DebounceThrottleTool() {
  const [mode, setMode] = useState<"debounce" | "throttle">("debounce");
  const [wait, setWait] = useState(300);
  const code = mode === "debounce" ? `function debounce(fn, wait = ${wait}) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}` : `function throttle(fn, wait = ${wait}) {\n  let open = true;\n  return (...args) => {\n    if (!open) return;\n    open = false;\n    fn(...args);\n    setTimeout(() => { open = true; }, wait);\n  };\n}`;
  return <div className="space-y-3"><div className="flex gap-2">{(["debounce", "throttle"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={"rounded-full border px-3 py-1 text-xs font-mono uppercase " + (mode === m ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{m}</button>)}</div><Row label="wait"><SliderInput value={wait} onChange={setWait} min={50} max={1200} step={50} /></Row><CodeBlock code={code} lang="js" /></div>;
}

function BreakpointPreviewTool() {
  const presets = [375, 768, 1024, 1280];
  const [w, setW] = useState(768);
  return <div className="space-y-4"><div className="flex gap-2 flex-wrap">{presets.map((p) => <button key={p} onClick={() => setW(p)} className={"rounded-full border px-3 py-1 text-xs font-mono " + (w === p ? "bg-accent text-accent-foreground border-accent" : "border-border")}>{p}px</button>)}<input type="number" value={w} onChange={(e) => setW(+e.target.value || 320)} className="w-28 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono" /></div><div className="mx-auto rounded-[28px] border border-border bg-card p-3" style={{ width: Math.min(w, 960) }}><div className="rounded-[24px] border border-dashed border-border p-4"><div className={"grid gap-4 " + (w >= 900 ? "md:grid-cols-3" : w >= 640 ? "grid-cols-2" : "grid-cols-1")}><div className="rounded-2xl bg-accent/20 p-4">Card 1</div><div className="rounded-2xl bg-accent/10 p-4">Card 2</div><div className="rounded-2xl bg-accent/15 p-4">Card 3</div></div></div></div><CodeBlock code={`@media (min-width: ${w}px) {\n  /* custom breakpoint preview */\n}`} /></div>;
}

function AccessibleColorPairFinderTool() {
  const [bg, setBg] = useState("#111827"), [fg, setFg] = useState("#ffffff");
  const contrast = (a: string, b: string) => {
    const lum = (hex: string) => { const { r, g, b } = hexToRgb(hex); const t = [r, g, b].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]; };
    const l1 = lum(a), l2 = lum(b); return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
  };
  const ratio = contrast(bg, fg);
  const suggested = ["#ffffff", "#f8fafc", "#111827", "#020617", "#1f2937"].filter((c) => c !== fg).map((c) => ({ c, ratio: contrast(bg, c) })).sort((a, b) => Number(b.ratio) - Number(a.ratio)).slice(0, 3);
  return <div className="space-y-4"><div className="flex gap-4 flex-wrap">{([["BG", bg, setBg], ["FG", fg, setFg]] as const).map(([l, v, s]) => <label key={l} className="text-xs font-mono flex items-center gap-2">{l}<input type="color" value={v} onChange={(e) => s(e.target.value)} className="h-8 w-10" /></label>)}</div><div className="rounded-2xl border border-border p-6" style={{ background: bg, color: fg }}><div className="text-2xl font-bold">Accessible color preview</div><p className="mt-2">Contrast ratio: {ratio}:1</p></div><div className="grid gap-3 md:grid-cols-3">{suggested.map((s) => <button key={s.c} onClick={() => setFg(s.c)} className="rounded-xl border border-border p-3 text-left"><div className="h-10 rounded-md" style={{ background: s.c }} /><div className="mt-2 text-xs font-mono">{s.c}</div><div className="text-xs text-muted-foreground">{s.ratio}:1</div></button>)}</div></div>;
}

function FaviconGeneratorTool() {
  const [icons, setIcons] = useState<Array<{ size: number; url: string }>>([]);
  useEffect(() => () => { icons.forEach((i) => URL.revokeObjectURL(i.url)); }, [icons]);
  const build = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); img.src = objectUrl; });
    const sizes = [16, 32, 180, 192, 512];
    const next: Array<{ size: number; url: string }> = [];
    for (const size of sizes) {
      const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d"); if (!ctx) continue;
      ctx.drawImage(img, 0, 0, size, size);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) next.push({ size, url: URL.createObjectURL(blob) });
    }
    setIcons((prev) => { prev.forEach((i) => URL.revokeObjectURL(i.url)); return next; });
  };
  const tags = icons.map((i) => i.size === 180 ? `<link rel="apple-touch-icon" sizes="180x180" href="/icon-${i.size}.png" />` : `<link rel="icon" type="image/png" sizes="${i.size}x${i.size}" href="/icon-${i.size}.png" />`).join("\n");
  return <div className="space-y-4"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><ImageIcon className="h-4 w-4" /> Upload image<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void build(f); }} /></label>{icons.length > 0 && <><div className="grid gap-4 md:grid-cols-5">{icons.map((i) => <div key={i.size} className="rounded-xl border border-border bg-card p-3 text-center space-y-2"><img src={i.url} alt={`${i.size}px favicon`} className="mx-auto h-16 w-16 rounded-lg border border-border" /><div className="text-xs font-mono">{i.size}px</div><a href={i.url} download={`icon-${i.size}.png`} className="inline-flex rounded-full border border-border px-3 py-1 text-[11px] font-mono uppercase">Download</a></div>)}</div><CodeBlock code={tags} lang="html" /></>}</div>;
}

function OgPreviewTool() {
  const [title, setTitle] = useState("Frontend toolkit for developers"), [desc, setDesc] = useState("Live tools, previews, converters, and copy-ready snippets."), [site, setSite] = useState("jwalabaheliya.dev"), [image, setImage] = useState("/jwala-baheliya.jpg");
  const code = `<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:image" content="${image}" />\n<meta property="og:site_name" content="${site}" />`;
  return <div className="grid gap-4 lg:grid-cols-2"><div className="space-y-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full rounded-lg border border-border bg-background p-3 text-sm" /><input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /><CodeBlock code={code} lang="html" /></div><div className="rounded-3xl border border-border bg-card p-4"><div className="overflow-hidden rounded-2xl border border-border"><div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} /><div className="space-y-2 p-4"><div className="text-xs uppercase tracking-widest text-muted-foreground">{site}</div><div className="font-display text-2xl font-semibold">{title}</div><p className="text-sm text-muted-foreground">{desc}</p></div></div></div></div>;
}

function ClampSpacingTool() {
  const [prop, setProp] = useState("padding"), [min, setMin] = useState(16), [max, setMax] = useState(80), [minVw] = useState(360), [maxVw, setMaxVw] = useState(1440);
  const clamp = `clamp(${min}px, ${min}px + (${max - min}) * ((100vw - ${minVw}px) / (${maxVw - minVw})), ${max}px)`;
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-4"><select value={prop} onChange={(e) => setProp(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm"><option>padding</option><option>margin</option><option>gap</option></select><input type="number" value={min} onChange={(e) => setMin(+e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input type="number" value={max} onChange={(e) => setMax(+e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input type="number" value={maxVw} onChange={(e) => setMaxVw(+e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /></div><CodeBlock code={`${prop}: ${clamp};`} /><div className="rounded-2xl border border-border bg-card p-4"><div className="rounded-2xl bg-accent/15" style={{ [prop]: clamp } as React.CSSProperties }>Fluid spacing preview</div></div></div>;
}

function GridOverlayTool() {
  const [cols, setCols] = useState(12);
  const [gutter, setGutter] = useState(24);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [pagePadding, setPagePadding] = useState(32);
  const [rowHeight, setRowHeight] = useState(120);
  const [overlayOpacity, setOverlayOpacity] = useState(28);
  const [rows, setRows] = useState(6);
  const [showLabels, setShowLabels] = useState(true);
  const [showContent, setShowContent] = useState(true);
  const [mode, setMode] = useState<"fixed" | "minmax" | "auto-fit">("fixed");

  const template = mode === "minmax"
    ? `repeat(${cols}, minmax(48px, 1fr))`
    : mode === "auto-fit"
      ? `repeat(auto-fit, minmax(${Math.max(120, Math.round(containerWidth / Math.max(cols, 1) / 1.5))}px, 1fr))`
      : `repeat(${cols}, minmax(0, 1fr))`;
  const availableWidth = Math.max(containerWidth - gutter * (cols - 1), 0);
  const columnWidth = mode === "auto-fit" ? null : availableWidth / cols;
  const contentPadding = Math.max(Math.round(pagePadding * 0.75), 16);
  const code = [
    ".layout-shell {",
    `  max-width: ${containerWidth}px;`,
    `  padding-inline: ${pagePadding}px;`,
    "  margin-inline: auto;",
    "}",
    "",
    ".layout-grid {",
    "  display: grid;",
    `  grid-template-columns: ${template};`,
    `  column-gap: ${gutter}px;`,
    `  row-gap: ${Math.round(gutter * 1.25)}px;`,
    "}",
  ].join("\n");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Row label="mode">
          <select value={mode} onChange={(e) => setMode(e.target.value as "fixed" | "minmax" | "auto-fit")} className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono uppercase tracking-widest text-foreground">
            <option value="fixed">fixed 12-col</option>
            <option value="minmax">minmax cols</option>
            <option value="auto-fit">auto-fit grid</option>
          </select>
        </Row>
        <Row label="columns"><SliderInput value={cols} onChange={setCols} min={2} max={16} /></Row>
        <Row label="gutter"><SliderInput value={gutter} onChange={setGutter} min={0} max={48} /></Row>
        <Row label="rows"><SliderInput value={rows} onChange={setRows} min={3} max={10} /></Row>
        <Row label="max width"><SliderInput value={containerWidth} onChange={setContainerWidth} min={720} max={1600} step={20} /></Row>
        <Row label="padding"><SliderInput value={pagePadding} onChange={setPagePadding} min={0} max={80} step={4} /></Row>
        <Row label="row height"><SliderInput value={rowHeight} onChange={setRowHeight} min={72} max={180} step={4} /></Row>
        <Row label="opacity"><SliderInput value={overlayOpacity} onChange={setOverlayOpacity} min={8} max={60} step={2} /></Row>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
          column labels
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <input type="checkbox" checked={showContent} onChange={(e) => setShowContent(e.target.checked)} />
          content preview
        </label>
        <div className="rounded-xl border border-border bg-card px-3 py-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">column width</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{columnWidth ? `${columnWidth.toFixed(1)}px` : "fluid"}</div>
        </div>
        <div className="rounded-xl border border-border bg-card px-3 py-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">template</div>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">{template}</div>
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-card p-3 md:p-4">
        <div className="rounded-[24px] border border-border bg-background p-3 md:p-5">
          <div
            className="mx-auto overflow-hidden rounded-[24px] border border-border bg-[linear-gradient(180deg,rgba(127,127,127,0.06),transparent)]"
            style={{ maxWidth: containerWidth + pagePadding * 2, paddingInline: pagePadding, paddingBlock: contentPadding }}
          >
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">layout inspector</div>
                <div className="mt-1 text-sm font-semibold text-foreground">Container, gutters, and real content alignment</div>
              </div>
              <div className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {containerWidth}px container
              </div>
            </div>

            <div className="relative mx-auto" style={{ maxWidth: containerWidth }}>
              {showContent && (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
                    <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
                      <div className="h-3 w-24 rounded-full bg-accent/30" />
                      <div className="mt-4 h-10 max-w-[24rem] rounded-2xl bg-foreground/10" />
                      <div className="mt-3 space-y-2">
                        <div className="h-3 rounded-full bg-foreground/10" />
                        <div className="h-3 w-[90%] rounded-full bg-foreground/10" />
                        <div className="h-3 w-[68%] rounded-full bg-foreground/10" />
                      </div>
                      <div className="mt-5 flex gap-3">
                        <div className="h-10 w-28 rounded-full bg-accent/85" />
                        <div className="h-10 w-24 rounded-full border border-border bg-background" />
                      </div>
                    </div>
                    <div className="grid gap-5">
                      <div className="rounded-[24px] border border-border bg-card p-5">
                        <div className="h-3 w-20 rounded-full bg-foreground/10" />
                        <div className="mt-4 h-24 rounded-2xl bg-accent/15" />
                      </div>
                      <div className="rounded-[24px] border border-border bg-card p-5">
                        <div className="h-3 w-16 rounded-full bg-foreground/10" />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="h-16 rounded-2xl bg-foreground/10" />
                          <div className="h-16 rounded-2xl bg-foreground/10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    {Array.from({ length: 3 }, (_, cardIndex) => (
                      <div key={cardIndex} className="rounded-[24px] border border-border bg-card p-5">
                        <div className="h-32 rounded-[18px] bg-accent/12" />
                        <div className="mt-4 h-4 w-2/3 rounded-full bg-foreground/10" />
                        <div className="mt-3 space-y-2">
                          <div className="h-3 rounded-full bg-foreground/10" />
                          <div className="h-3 w-[86%] rounded-full bg-foreground/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="pointer-events-none absolute inset-0 grid"
                style={{
                  gridTemplateColumns: template,
                  columnGap: gutter,
                  rowGap: Math.round(gutter * 1.25),
                  gridTemplateRows: `repeat(${rows}, minmax(${rowHeight}px, 1fr))`,
                }}
              >
                {Array.from({ length: cols * rows }, (_, index) => {
                  const currentCol = (index % cols) + 1;
                  const currentRow = Math.floor(index / cols) + 1;
                  return (
                    <div
                      key={index}
                      className="relative rounded-xl border border-accent/30 bg-accent/20"
                      style={{ opacity: Math.max(overlayOpacity / 100, 0.08) }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px border-t border-dashed border-accent/70" />
                      {showLabels && (
                        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-accent shadow-sm">
                          c{currentCol} / r{currentRow}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock code={code} />
    </div>
  );
}

function AnimationPresetsGalleryTool() {
  const presets = [{ name: "Fade Up", keyframes: `@keyframes fadeUp { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }`, anim: "fadeUp .6s ease both" }, { name: "Scale In", keyframes: `@keyframes scaleIn { from { opacity:0; transform:scale(.92);} to { opacity:1; transform:scale(1);} }`, anim: "scaleIn .45s ease both" }, { name: "Slide In", keyframes: `@keyframes slideIn { from { opacity:0; transform:translateX(-20px);} to { opacity:1; transform:translateX(0);} }`, anim: "slideIn .5s ease both" }];
  const [run, setRun] = useState(0);
  return <div className="space-y-4"><div className="flex justify-end"><button onClick={() => setRun((v) => v + 1)} className="rounded-full border border-border px-3 py-1 text-[11px] font-mono uppercase tracking-wide">Replay all</button></div><div className="grid gap-4 md:grid-cols-3">{presets.map((p, index) => <div key={p.name} className="rounded-2xl border border-border bg-card p-4 space-y-3"><div className="flex items-center justify-between gap-3"><div className="font-display font-semibold">{p.name}</div><button onClick={() => setRun((v) => v + index + 1)} className="rounded-full border border-border px-3 py-1 text-[11px] font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground">Replay</button></div><Preview><style>{p.keyframes}</style><div key={`${p.name}-${run}`} className="rounded-2xl bg-accent px-6 py-4 text-accent-foreground" style={{ animation: p.anim }}>Preview</div></Preview><CodeBlock code={`${p.keyframes}\n\n.element { animation: ${p.anim}; }`} /></div>)}</div></div>;
}

function ImagePlaceholderTool() {
  const [src, setSrc] = useState(""), [dominant, setDominant] = useState("#111827"), [tiny, setTiny] = useState("");
  const shimmerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g"><stop stop-color="#e5e7eb" offset="20%"/><stop stop-color="#f8fafc" offset="50%"/><stop stop-color="#e5e7eb" offset="70%"/></linearGradient></defs><rect width="600" height="400" fill="#e5e7eb"/><rect width="600" height="400" fill="url(#g)"><animate attributeName="x" from="-600" to="600" dur="1.2s" repeatCount="indefinite"/></rect></svg>`;
  const shimmer = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shimmerSvg)}`;
  const dominantCss = `.image-placeholder {\n  background: ${dominant};\n}`;
  const blurCss = `.image-blur-placeholder {\n  background-image: url("${tiny}");\n  background-size: cover;\n  background-position: center;\n  filter: blur(18px);\n  transform: scale(1.04);\n}`;
  const shimmerCss = `.image-shimmer {\n  position: relative;\n  overflow: hidden;\n  background: #e5e7eb;\n}\n\n.image-shimmer::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background-image: url("${shimmer}");\n  background-size: cover;\n  background-position: center;\n  animation: shimmerMove 1.2s linear infinite;\n}\n\n@keyframes shimmerMove {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(100%); }\n}`;
  const skeletonHtml = `<div class="skeleton-card">\n  <div class="skeleton skeleton-media"></div>\n  <div class="skeleton skeleton-line skeleton-line-lg"></div>\n  <div class="skeleton skeleton-line"></div>\n  <div class="skeleton skeleton-line skeleton-line-sm"></div>\n</div>`;
  const skeletonCss = `.skeleton-card {\n  display: grid;\n  gap: 12px;\n}\n\n.skeleton {\n  position: relative;\n  overflow: hidden;\n  border-radius: 16px;\n  background: #e5e7eb;\n}\n\n.skeleton::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.72) 50%, transparent 100%);\n  transform: translateX(-100%);\n  animation: skeletonShimmer 1.25s linear infinite;\n}\n\n.skeleton-media {\n  height: 160px;\n}\n\n.skeleton-line {\n  height: 14px;\n}\n\n.skeleton-line-lg {\n  width: 72%;\n}\n\n.skeleton-line-sm {\n  width: 48%;\n}\n\n@keyframes skeletonShimmer {\n  to { transform: translateX(100%); }\n}`;
  const onPick = async (file: File) => {
    const objectUrl = URL.createObjectURL(file); setSrc(objectUrl);
    const img = new Image(); await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); img.src = objectUrl; });
    const canvas = document.createElement("canvas"); canvas.width = 12; canvas.height = 12;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.drawImage(img, 0, 0, 12, 12); const d = ctx.getImageData(0, 0, 12, 12).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; setDominant(rgbToHex(Math.round(r / n), Math.round(g / n), Math.round(b / n))); setTiny(canvas.toDataURL("image/jpeg", 0.5));
  };
  return <div className="space-y-4"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><ImageIcon className="h-4 w-4" /> Upload image<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPick(f); }} /></label>{src && <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs font-mono text-muted-foreground">Dominant color</div><div className="mt-3 h-24 rounded-xl" style={{ background: dominant }} /><CodeBlock code={dominant} lang="hex" /><CodeBlock code={dominantCss} lang="css" /></div><div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs font-mono text-muted-foreground">Blur placeholder</div><img src={tiny} alt="tiny placeholder" className="mt-3 h-24 w-full rounded-xl border border-border object-cover" /><CodeBlock code={tiny} lang="data-url" /><CodeBlock code={blurCss} lang="css" /></div><div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs font-mono text-muted-foreground">Shimmer placeholder</div><img src={shimmer} alt="shimmer placeholder" className="mt-3 h-24 w-full rounded-xl border border-border object-cover bg-muted" /><CodeBlock code={shimmer.slice(0, 220) + "..."} lang="data-url" /><CodeBlock code={shimmerCss} lang="css" /></div></div><div className="rounded-2xl border border-border bg-card p-4 space-y-4"><div><div className="text-xs font-mono text-muted-foreground">Skeleton placeholder</div><div className="mt-3 max-w-sm space-y-3"><div className="relative h-40 overflow-hidden rounded-2xl bg-muted"><div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent)] animate-[skeletonShimmer_1.25s_linear_infinite]" /></div><div className="relative h-4 w-2/3 overflow-hidden rounded bg-muted"><div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent)] animate-[skeletonShimmer_1.25s_linear_infinite]" /></div><div className="relative h-4 w-full overflow-hidden rounded bg-muted"><div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent)] animate-[skeletonShimmer_1.25s_linear_infinite]" /></div><div className="relative h-4 w-1/2 overflow-hidden rounded bg-muted"><div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent)] animate-[skeletonShimmer_1.25s_linear_infinite]" /></div></div></div><style>{`@keyframes skeletonShimmer { to { transform: translateX(100%); } }`}</style><div className="grid gap-4 lg:grid-cols-2"><CodeBlock code={skeletonHtml} lang="html" /><CodeBlock code={skeletonCss} lang="css" /></div></div></div>}</div>;
}

function StickyScrollTool() {
  const code = `const progress = () => {\n  const total = document.documentElement.scrollHeight - innerHeight;\n  const value = (scrollY / total) * 100;\n  document.documentElement.style.setProperty("--scroll-progress", value + "%");\n};\naddEventListener("scroll", progress);`;
  return <div className="space-y-4"><div className="rounded-2xl border border-border bg-card p-4"><div className="sticky top-4 rounded-2xl border border-dashed border-border bg-background p-4"><div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full w-2/3 bg-accent" /></div><div className="grid gap-4 md:grid-cols-[220px_1fr]"><div className="rounded-xl border border-border p-3 text-sm">Sticky sidebar</div><div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="rounded-xl border border-border p-4 text-sm">Scroll section {i + 1}</div>)}</div></div></div></div><CodeBlock code={code} lang="js" /></div>;
}

/* ---------- Registry ---------- */
const TOOLS: Tool[] = [
  { id: "shadow", name: "Box Shadow Generator", category: "CSS", keywords: "css shadow", icon: Square, render: () => <BoxShadow /> },
  { id: "gradient", name: "Gradient Generator", category: "CSS", keywords: "linear radial", icon: Wand2, render: () => <Gradient /> },
  { id: "radius", name: "Border Radius Generator", category: "CSS", icon: Square, render: () => <BorderRadius /> },
  { id: "glass", name: "Glassmorphism", category: "CSS", keywords: "frosted blur", icon: Sparkles, render: () => <Glassmorphism /> },
  { id: "neu", name: "Neumorphism", category: "CSS", icon: Sparkles, render: () => <Neumorphism /> },
  { id: "grid", name: "CSS Grid Generator", category: "Layout", icon: Grid3x3, render: () => <CssGrid /> },
  { id: "flex", name: "Flexbox Playground", category: "Layout", icon: Layout, render: () => <FlexPlay /> },
  { id: "clampf", name: "Clamp() Font Generator", category: "Typography", keywords: "fluid", icon: Type, render: () => <ClampFont /> },
  { id: "aspect", name: "Aspect Ratio", category: "CSS", icon: Ruler, render: () => <AspectRatio /> },
  { id: "tri", name: "CSS Triangle", category: "CSS", icon: Shapes, render: () => <CssTriangle /> },
  { id: "filter", name: "CSS Filter", category: "CSS", icon: Wand2, render: () => <CssFilter /> },
  { id: "transform", name: "Transform Playground", category: "CSS", keywords: "rotate scale skew", icon: Zap, render: () => <TransformPlay /> },
  { id: "keyframes", name: "Animation Keyframes", category: "CSS", icon: Zap, render: () => <Keyframes /> },
  { id: "clip", name: "Clip‑path Generator", category: "Wow", icon: Shapes, render: () => <ClipPath /> },
  { id: "blob", name: "Blob Shape Generator", category: "Wow", icon: Shapes, render: () => <BlobShape /> },
  { id: "wave", name: "SVG Wave Generator", category: "Wow", icon: Waves, render: () => <SvgWave /> },
  { id: "color", name: "Color Picker", category: "Color", icon: Palette, render: () => <ColorPicker /> },
  { id: "contrast", name: "Contrast Checker (WCAG)", category: "Color", icon: Gauge, render: () => <ContrastChecker /> },
  { id: "tw-color", name: "Tailwind Color Palette", category: "Color", icon: Palette, render: () => <TailwindPalette /> },
  { id: "fontpair", name: "Font Pair Generator", category: "Typography", icon: Type, render: () => <FontPair /> },
  { id: "resp", name: "Responsive Checker", category: "Responsive", icon: Smartphone, render: () => <ResponsiveChecker /> },
  { id: "mq", name: "Media Query Generator", category: "Responsive", icon: Smartphone, render: () => <MediaQueryGen /> },
  { id: "json", name: "JSON Formatter & Validator", category: "JavaScript", icon: FileJson, render: () => <JsonFormatter /> },
  { id: "b64", name: "Base64 Encode / Decode", category: "JavaScript", icon: Braces, render: () => <Base64Tool /> },
  { id: "url", name: "URL Encoder / Decoder", category: "JavaScript", icon: Link2, render: () => <UrlTool /> },
  { id: "regex", name: "Regex Tester", category: "JavaScript", icon: Code2, render: () => <RegexTester /> },
  { id: "uuid", name: "UUID Generator", category: "Utilities", icon: KeyRound, render: () => <UuidGen /> },
  { id: "slug", name: "Slug Generator", category: "Utilities", icon: Hash, render: () => <SlugGen /> },
  { id: "case", name: "Case Converter", category: "Utilities", icon: Type, render: () => <CaseConvert /> },
  { id: "pw", name: "Password Generator", category: "Utilities", icon: KeyRound, render: () => <PasswordGen /> },
  { id: "ts", name: "Timestamp Converter", category: "Utilities", icon: Timer, render: () => <TimestampConv /> },
  { id: "lorem", name: "Lorem Ipsum Generator", category: "Utilities", icon: Hash, render: () => <LoremGen /> },
  { id: "qr", name: "QR Code Generator", category: "Utilities", icon: QrCode, render: () => <QrCodeTool /> },
  { id: "units", name: "PX ↔ REM ↔ EM Converter", category: "Utilities", icon: Ruler, render: () => <UnitConv /> },
  { id: "interview-lab", name: "Interactive Interview Lab", category: "JavaScript", keywords: "interview prep event loop closures arrays dom event propagation bubbling capture quiz practice", icon: Terminal, render: () => <InteractiveInterviewLab /> },
  { id: "components", name: "Components Library", category: "Components", keywords: "buttons cards badges alerts", icon: Component, render: () => <ComponentsLibrary /> },
  { id: "text-shadow", name: "Text Shadow Generator", category: "CSS", icon: Type, render: () => <TextShadowGen /> },
  { id: "bezier", name: "Cubic Bezier Easing", category: "CSS", keywords: "animation timing", icon: Zap, render: () => <CubicBezierTool /> },
  { id: "svg-loaders", name: "SVG Loaders / Spinners", category: "Wow", keywords: "spinner loading", icon: Loader2, render: () => <SvgLoaders /> },
  { id: "meta-tags", name: "Meta Tag Generator", category: "Utilities", keywords: "seo open graph og twitter", icon: Tag, render: () => <MetaTagsGen /> },
  { id: "entities", name: "HTML Entity Encoder", category: "Utilities", keywords: "escape html", icon: Braces, render: () => <HtmlEntities /> },
  { id: "text-stats", name: "Word & Character Counter", category: "Utilities", keywords: "reading time", icon: FileText, render: () => <TextStats /> },
  { id: "jwt", name: "JWT Decoder", category: "JavaScript", keywords: "token auth", icon: Lock, render: () => <JwtDecoder /> },
  { id: "markdown", name: "Markdown Preview", category: "Utilities", keywords: "md live", icon: ScrollText, render: () => <MarkdownPreview /> },
  { id: "img64", name: "Image → Base64", category: "Utilities", keywords: "data url", icon: ImageIcon, render: () => <ImageToBase64 /> },
  { id: "curl", name: "cURL → Fetch", category: "JavaScript", keywords: "convert api", icon: Terminal, render: () => <CurlToFetch /> },
  { id: "cheat", name: "CSS Cheatsheet", category: "CSS", keywords: "reference snippets layout typography responsive animation forms modern css", icon: Percent, render: () => <CheatSheetComplete /> },
  { id: "diff", name: "Text Diff Checker", category: "JavaScript", keywords: "compare text code", icon: FileText, render: () => <DiffChecker /> },
  { id: "js-gallery", name: "JavaScript Snippets — 70 Ready-made", category: "JavaScript", keywords: "modal accordion tabs dropdown sidebar hamburger slider carousel typing scramble password validation debounce throttle fetch search pagination drag drop upload counter clock stopwatch quote uuid localstorage query params formdata custom event download event delegation reduce map promise all memoize flatten group by retry deep clone sort once interview prep closure currying pipe binary search dfs event loop polyfill bind call apply lru cache", icon: Code2, render: () => <SnippetsGallery /> },
  { id: "svg-css", name: "SVG to CSS Converter", category: "Utilities", keywords: "data uri background image encoder", icon: ImageIcon, render: () => <SvgToCssTool /> },
  { id: "img-convert", name: "Image Format Converter", category: "Utilities", keywords: "png jpeg jpg webp convert image", icon: ImageIcon, render: () => <ImageConverterTool /> },
  { id: "svg-cleanup", name: "SVG Optimizer + Cleanup", category: "Utilities", keywords: "svg optimize cleanup react", icon: ImageIcon, render: () => <SvgOptimizerTool /> },
  { id: "html-jsx", name: "HTML to JSX / JSX to HTML", category: "JavaScript", keywords: "convert markup react", icon: Braces, render: () => <HtmlJsxToolFixed /> },
  { id: "css-tw", name: "CSS to Tailwind Converter", category: "CSS", keywords: "tailwind convert", icon: Wand2, render: () => <CssToTailwindTool /> },
  { id: "tw-sort", name: "Tailwind Class Sorter / Merger", category: "Utilities", keywords: "tailwind sort dedupe classes", icon: Type, render: () => <TailwindSorterTool /> },
  { id: "shadow-presets", name: "Box Shadow Presets Library", category: "CSS", keywords: "cards modals dropdowns", icon: Square, render: () => <BoxShadowPresetsTool /> },
  { id: "mesh", name: "Gradient Mesh / Hero Background", category: "Wow", keywords: "hero gradient mesh", icon: Sparkles, render: () => <GradientMeshTool /> },
  { id: "regex-lib", name: "Form Validation Regex Library", category: "Utilities", keywords: "email phone password otp validation", icon: Code2, render: () => <RegexLibraryTool /> },
  { id: "json-types", name: "API JSON to TypeScript Types", category: "JavaScript", keywords: "json ts types zod", icon: FileJson, render: () => <JsonToTypesTool /> },
  { id: "storage", name: "LocalStorage / SessionStorage Playground", category: "JavaScript", keywords: "browser storage", icon: Terminal, render: () => <StoragePlaygroundTool /> },
  { id: "debounce-play", name: "Debounce / Throttle Playground", category: "JavaScript", keywords: "debounce throttle performance", icon: Timer, render: () => <DebounceThrottleTool /> },
  { id: "breakpoint-preview", name: "Breakpoint Preview + Device Frame Tester", category: "Responsive", keywords: "device viewport responsive", icon: Smartphone, render: () => <BreakpointPreviewTool /> },
  { id: "a11y-pair", name: "Accessible Color Pair Finder", category: "Color", keywords: "contrast accessible wcag", icon: Gauge, render: () => <AccessibleColorPairFinderTool /> },
  { id: "favicon-gen", name: "Favicons / App Icons Generator", category: "Utilities", keywords: "favicon app icon pwa", icon: ImageIcon, render: () => <FaviconGeneratorTool /> },
  { id: "og-preview", name: "Open Graph Preview Tool", category: "Utilities", keywords: "og social share meta", icon: Layout, render: () => <OgPreviewTool /> },
  { id: "clamp-space", name: "Clamp() Spacing Generator", category: "CSS", keywords: "fluid spacing clamp", icon: Ruler, render: () => <ClampSpacingTool /> },
  { id: "grid-overlay", name: "Grid Overlay / Layout Inspector", category: "Layout", keywords: "columns gutter layout", icon: Grid3x3, render: () => <GridOverlayTool /> },
  { id: "anim-gallery", name: "Animation Presets Gallery", category: "CSS", keywords: "entrance hover motion", icon: Zap, render: () => <AnimationPresetsGalleryTool /> },
  { id: "img-placeholder", name: "Image Placeholder Generator", category: "Utilities", keywords: "blur shimmer dominant color", icon: ImageIcon, render: () => <ImagePlaceholderTool /> },
  { id: "sticky-scroll", name: "Sticky / Scroll Progress Generator", category: "JavaScript", keywords: "scroll progress sticky sidebar", icon: ScrollText, render: () => <StickyScrollTool /> },
];

export function ToolkitToolRenderer({ id }: { id: string }) {
  const tool = TOOLS.find((item) => item.id === resolveToolkitId(id));
  if (!tool) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Tool not found.
      </div>
    );
  }
  return <>{tool.render()}</>;
}


export default ToolkitPage;
