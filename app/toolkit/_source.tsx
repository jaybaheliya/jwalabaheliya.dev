"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
                <button
                  key={t.id}
                  onClick={() => { setOpenId(t.id); markRecent(t.id); }}
                  className="group relative text-left rounded-2xl border border-border bg-card p-4 hover:border-accent/60 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); toggleFav(t.id); }}
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
                </button>
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
  const [cols, setCols] = useState(3), [rows, setRows] = useState(2), [gap, setGap] = useState(12);
  const css = "display: grid;\ngrid-template-columns: repeat(" + cols + ", 1fr);\ngrid-template-rows: repeat(" + rows + ", 1fr);\ngap: " + gap + "px;";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Row label="Columns"><SliderInput value={cols} onChange={setCols} min={1} max={12} /></Row>
        <Row label="Rows"><SliderInput value={rows} onChange={setRows} min={1} max={8} /></Row>
        <Row label="Gap"><SliderInput value={gap} onChange={setGap} min={0} max={60} /></Row>
        <CodeBlock code={css} />
      </div>
      <Preview>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(" + cols + ",1fr)", gridTemplateRows: "repeat(" + rows + ",1fr)", gap, width: "100%", height: 220 }}>
          {Array.from({ length: cols * rows }).map((_, i) => (
            <div key={i} className="rounded-md bg-accent/30 border border-accent/50 grid place-items-center text-xs font-mono text-accent">{i + 1}</div>
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
  const [wrap, setWrap] = useState(false);
  const [gap, setGap] = useState(8);
  const css = "display: flex;\nflex-direction: " + dir + ";\njustify-content: " + jc + ";\nalign-items: " + ai + ";\nflex-wrap: " + (wrap ? "wrap" : "nowrap") + ";\ngap: " + gap + "px;";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3 text-xs font-mono">
        <div className="flex flex-wrap gap-2 items-center"><span className="w-24 uppercase text-muted-foreground">direction</span><SelectControl value={dir} onChange={(value) => setDir(value as typeof dir)} options={["row", "row-reverse", "column", "column-reverse"]} /></div>
        <div className="flex flex-wrap gap-2 items-center"><span className="w-24 uppercase text-muted-foreground">justify</span><SelectControl value={jc} onChange={setJc} options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]} /></div>
        <div className="flex flex-wrap gap-2 items-center"><span className="w-24 uppercase text-muted-foreground">align</span><SelectControl value={ai} onChange={setAi} options={["stretch", "flex-start", "center", "flex-end", "baseline"]} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} /> wrap</label>
        <Row label="Gap"><SliderInput value={gap} onChange={setGap} min={0} max={60} /></Row>
        <CodeBlock code={css} />
      </div>
      <Preview>
        <div style={{ display: "flex", flexDirection: dir, justifyContent: jc, alignItems: ai, flexWrap: wrap ? "wrap" : "nowrap", gap, width: "100%", height: 220 }}>
          {[60, 90, 40, 80, 50].map((w, i) => <div key={i} style={{ width: w }} className="h-12 rounded bg-accent/40 border border-accent/60 grid place-items-center text-xs">{i + 1}</div>)}
        </div>
      </Preview>
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
  const [v, setV] = useState("Hello, world!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  let out = ""; try { out = mode === "encode" ? btoa(v) : atob(v); } catch { out = "Invalid input"; }
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
        {(["encode", "decode"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={"px-3 py-1 rounded-full uppercase " + (mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{m}</button>)}
      </div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 font-mono text-xs" />
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
        <input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-16 rounded-md border border-border bg-background px-2 py-1" />
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

type InterviewTopic = "All" | "Closures" | "Async" | "Arrays" | "DOM";
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
];

function InteractiveInterviewLab() {
  const topics: InterviewTopic[] = ["All", "Closures", "Async", "Arrays", "DOM"];
  const [topic, setTopic] = useState<InterviewTopic>("All");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [stopInnerBubble, setStopInnerBubble] = useState(false);
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
            <p className="mt-1 text-sm text-muted-foreground">Click the inner button and watch capture and bubble order update in real time.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStopInnerBubble((value) => !value)}
              className={"rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition " + (stopInnerBubble ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {stopInnerBubble ? "Inner bubble stop: on" : "Inner bubble stop: off"}
            </button>
            <button onClick={() => setLogs([])} className="rounded-full border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-accent hover:text-accent">
              Clear log
            </button>
          </div>

          <div
            onClickCapture={() => pushLog("Outer capture")}
            onClick={() => pushLog("Outer bubble")}
            className="rounded-[28px] border border-sky-500/40 bg-sky-500/10 p-5"
          >
            <div className="mb-2 text-xs font-mono uppercase tracking-widest text-sky-300">Outer</div>
            <div
              onClickCapture={() => pushLog("Middle capture")}
              onClick={() => pushLog("Middle bubble")}
              className="rounded-[24px] border border-violet-500/40 bg-violet-500/10 p-5"
            >
              <div className="mb-2 text-xs font-mono uppercase tracking-widest text-violet-300">Middle</div>
              <div
                onClickCapture={() => pushLog("Inner capture")}
                onClick={(event) => {
                  pushLog("Inner bubble");
                  if (stopInnerBubble) {
                    event.stopPropagation();
                    pushLog("Propagation stopped at inner bubble");
                  }
                }}
                className="rounded-[20px] border border-amber-500/40 bg-amber-500/10 p-5"
              >
                <div className="mb-3 text-xs font-mono uppercase tracking-widest text-amber-300">Inner</div>
                <button className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                  Click me
                </button>
              </div>
            </div>
          </div>

          <CodeBlock
            lang="js"
            code={`outer.addEventListener('click', () => log('Outer bubble'));\nouter.addEventListener('click', () => log('Outer capture'), true);\n\ninner.addEventListener('click', (event) => {\n  log('Inner bubble');\n  if (${stopInnerBubble}) event.stopPropagation();\n});`}
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
  { id: "json", name: "JSON Formatter & Validator", category: "Utilities", icon: FileJson, render: () => <JsonFormatter /> },
  { id: "b64", name: "Base64 Encode / Decode", category: "Utilities", icon: Braces, render: () => <Base64Tool /> },
  { id: "url", name: "URL Encoder / Decoder", category: "Utilities", icon: Link2, render: () => <UrlTool /> },
  { id: "regex", name: "Regex Tester", category: "Utilities", icon: Code2, render: () => <RegexTester /> },
  { id: "uuid", name: "UUID Generator", category: "Utilities", icon: KeyRound, render: () => <UuidGen /> },
  { id: "slug", name: "Slug Generator", category: "Utilities", icon: Hash, render: () => <SlugGen /> },
  { id: "case", name: "Case Converter", category: "Utilities", icon: Type, render: () => <CaseConvert /> },
  { id: "pw", name: "Password Generator", category: "Utilities", icon: KeyRound, render: () => <PasswordGen /> },
  { id: "ts", name: "Timestamp Converter", category: "Utilities", icon: Timer, render: () => <TimestampConv /> },
  { id: "lorem", name: "Lorem Ipsum Generator", category: "Utilities", icon: Hash, render: () => <LoremGen /> },
  { id: "qr", name: "QR Code Generator", category: "Utilities", icon: QrCode, render: () => <QrCodeTool /> },
  { id: "units", name: "PX ↔ REM ↔ EM Converter", category: "Utilities", icon: Ruler, render: () => <UnitConv /> },
  { id: "js-snippets", name: "JavaScript Snippets Library", category: "JavaScript", keywords: "vanilla scroll debounce throttle typing counter", icon: Code2, render: () => <JsSnippetsLibrary /> },
  { id: "interview-lab", name: "Interactive Interview Lab", category: "JavaScript", keywords: "interview prep event loop closures arrays dom event propagation bubbling capture quiz practice", icon: Terminal, render: () => <InteractiveInterviewLab /> },
  { id: "components", name: "Components Library", category: "Components", keywords: "buttons cards badges alerts", icon: Component, render: () => <ComponentsLibrary /> },
  { id: "text-shadow", name: "Text Shadow Generator", category: "CSS", icon: Type, render: () => <TextShadowGen /> },
  { id: "bezier", name: "Cubic Bezier Easing", category: "CSS", keywords: "animation timing", icon: Zap, render: () => <CubicBezierTool /> },
  { id: "svg-loaders", name: "SVG Loaders / Spinners", category: "Wow", keywords: "spinner loading", icon: Loader2, render: () => <SvgLoaders /> },
  { id: "meta-tags", name: "Meta Tag Generator", category: "Utilities", keywords: "seo open graph og twitter", icon: Tag, render: () => <MetaTagsGen /> },
  { id: "entities", name: "HTML Entity Encoder", category: "Utilities", keywords: "escape html", icon: Braces, render: () => <HtmlEntities /> },
  { id: "text-stats", name: "Word & Character Counter", category: "Utilities", keywords: "reading time", icon: FileText, render: () => <TextStats /> },
  { id: "jwt", name: "JWT Decoder", category: "Utilities", keywords: "token auth", icon: Lock, render: () => <JwtDecoder /> },
  { id: "markdown", name: "Markdown Preview", category: "Utilities", keywords: "md live", icon: ScrollText, render: () => <MarkdownPreview /> },
  { id: "img64", name: "Image → Base64", category: "Utilities", keywords: "data url", icon: ImageIcon, render: () => <ImageToBase64 /> },
  { id: "curl", name: "cURL → Fetch", category: "Utilities", keywords: "convert api", icon: Terminal, render: () => <CurlToFetch /> },
  { id: "cheat", name: "CSS Cheatsheet", category: "CSS", keywords: "reference snippets", icon: Percent, render: () => <CheatSheet /> },
  { id: "diff", name: "Text Diff Checker", category: "Utilities", keywords: "compare", icon: FileText, render: () => <DiffChecker /> },
  { id: "js-gallery", name: "JavaScript Snippets — 70 Ready-made", category: "JavaScript", keywords: "modal accordion tabs dropdown sidebar hamburger slider carousel typing scramble password validation debounce throttle fetch search pagination drag drop upload counter clock stopwatch quote uuid localstorage query params formdata custom event download event delegation reduce map promise all memoize flatten group by retry deep clone sort once interview prep closure currying pipe binary search dfs event loop polyfill bind call apply lru cache", icon: Code2, render: () => <SnippetsGallery /> },
];


export default ToolkitPage;
