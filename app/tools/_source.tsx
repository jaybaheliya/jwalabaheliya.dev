"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Check, Palette, Type, Square, Smartphone, Code2, Ruler, Wand2, Gauge, Hash } from "lucide-react";
import { RateCalculator } from "@/components/rate-calculator";
import { BookCall } from "@/components/book-call";
import { GithubContributions } from "@/components/github-contributions";
import { ResumeToggle } from "@/components/resume-toggle";
import { SkillMatchScanner } from "@/components/skill-match";
import { BusinessCard } from "@/components/business-card";
import { Playground } from "@/components/playground";



function ToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="font-display text-lg font-bold tracking-tight">Toolkit<span className="text-accent">.</span></div>
          <a href="mailto:jaybaheliya@gmail.com" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Hire me</a>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-16 pb-10">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Toolkit · v1</div>
        <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 leading-[1.05]">
          For recruiters. <span className="text-accent">For developers.</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Everything a hiring manager needs to evaluate me — plus a set of frontend tools I actually use daily. Try them all.
        </p>
        <nav className="mt-8 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider">
          {[
            ["recruiter", "For Recruiters"],
            ["playground", "Playground"],
            ["color", "Color"],
            ["typography", "Typography"],
            ["shadow", "Shadow"],
            ["responsive", "Responsive"],
            ["gradient", "Gradient"],
            ["units", "Units"],
            ["lorem", "Lorem"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition">{label}</a>
          ))}
        </nav>
      </section>

      <SectionShell id="recruiter" tag="/01" icon={<Gauge className="h-4 w-4" />} title="For Recruiters">
        <div className="grid gap-6 md:grid-cols-2">
          <RateCalculator />
          <BookCall />
          <ResumeToggle />
          <SkillMatchScanner />
          <GithubContributions />
          <BusinessCard />
        </div>
      </SectionShell>

      <SectionShell id="playground" tag="/02" icon={<Code2 className="h-4 w-4" />} title="Live Playground">
        <Playground />
        <HtmlCssJsPlayground />
      </SectionShell>

      <SectionShell id="color" tag="/03" icon={<Palette className="h-4 w-4" />} title="Color Picker & Palette">
        <ColorTool />
      </SectionShell>

      <SectionShell id="typography" tag="/04" icon={<Type className="h-4 w-4" />} title="Typography Scale">
        <TypeScale />
      </SectionShell>

      <SectionShell id="shadow" tag="/05" icon={<Square className="h-4 w-4" />} title="Shadow Maker">
        <ShadowMaker />
      </SectionShell>

      <SectionShell id="gradient" tag="/06" icon={<Wand2 className="h-4 w-4" />} title="Gradient Generator">
        <GradientMaker />
      </SectionShell>

      <SectionShell id="responsive" tag="/07" icon={<Smartphone className="h-4 w-4" />} title="Responsive Checker">
        <ResponsiveChecker />
      </SectionShell>

      <SectionShell id="units" tag="/08" icon={<Ruler className="h-4 w-4" />} title="PX ↔ REM ↔ EM Converter">
        <UnitConverter />
      </SectionShell>

      <SectionShell id="lorem" tag="/09" icon={<Hash className="h-4 w-4" />} title="Lorem Ipsum Generator">
        <LoremGenerator />
      </SectionShell>

      <footer className="border-t border-border/60 mt-16 py-10 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Built by Jwala Baheliya · <Link href="/" className="hover:text-accent">Back to portfolio</Link>
      </footer>
    </div>
  );
}

/* ---------- Shell ---------- */
function SectionShell({ id, tag, icon, title, children }: { id: string; tag: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-[1400px] px-6 md:px-10 py-14 md:py-20 scroll-mt-24">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">{tag}</span>
        <span className="h-9 w-9 rounded-full bg-accent/15 text-accent flex items-center justify-center">{icon}</span>
        <h2 className="font-display text-2xl md:text-4xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ---------- Copy helper ---------- */
function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
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

/* ---------- Color ---------- */
function ColorTool() {
  const [color, setColor] = useState("#c6f24e");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const palette = useMemo(() => generatePalette(color), [color]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-24 w-24 rounded-xl border border-border bg-transparent cursor-pointer" />
          <div className="flex-1 space-y-2 font-mono text-sm">
            <FieldRow label="HEX" value={color.toUpperCase()} />
            {rgb && <FieldRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />}
            {hsl && <FieldRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />}
          </div>
        </div>
        <div className="mt-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Tint / Shade palette</div>
          <div className="grid grid-cols-10 gap-1 h-14 rounded-lg overflow-hidden">
            {palette.map((c) => (
              <button key={c} title={c} onClick={() => setColor(c)} style={{ background: c }} className="hover:scale-110 transition" />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border p-6" style={{ background: color }}>
        <div className="rounded-xl bg-black/80 text-white p-6 backdrop-blur">
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">Preview on dark</div>
          <div className="font-display text-3xl font-bold mt-1">Aa Bb Cc 123</div>
          <p className="text-sm mt-2 opacity-90">The quick brown fox jumps over the lazy dog.</p>
        </div>
        <div className="rounded-xl bg-white text-black p-6 mt-3">
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">Preview on light</div>
          <div className="font-display text-3xl font-bold mt-1" style={{ color }}>Aa Bb Cc 123</div>
          <p className="text-sm mt-2">The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2">
      <div><span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-2">{label}</span>{value}</div>
      <CopyButton value={value} />
    </div>
  );
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
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
function generatePalette(hex: string) {
  const rgb = hexToRgb(hex); if (!rgb) return [];
  const out: string[] = [];
  for (let i = 0; i < 10; i++) {
    const t = (i - 4.5) / 5; // -0.9 .. 0.9
    const mix = t < 0 ? { r: 0, g: 0, b: 0, w: -t } : { r: 255, g: 255, b: 255, w: t };
    const r = Math.round(rgb.r * (1 - mix.w) + mix.r * mix.w);
    const g = Math.round(rgb.g * (1 - mix.w) + mix.g * mix.w);
    const b = Math.round(rgb.b * (1 - mix.w) + mix.b * mix.w);
    out.push("#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join(""));
  }
  return out;
}

/* ---------- Typography ---------- */
function TypeScale() {
  const [base, setBase] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const steps = [-2, -1, 0, 1, 2, 3, 4, 5];
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <label className="text-sm font-mono">Base <input type="number" value={base} onChange={(e) => setBase(+e.target.value)} className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1" /> px</label>
        <label className="text-sm font-mono">Ratio
          <select value={ratio} onChange={(e) => setRatio(+e.target.value)} className="ml-2 rounded-md border border-border bg-background px-2 py-1">
            <option value={1.125}>1.125 · Major Second</option>
            <option value={1.2}>1.2 · Minor Third</option>
            <option value={1.25}>1.25 · Major Third</option>
            <option value={1.333}>1.333 · Perfect Fourth</option>
            <option value={1.414}>1.414 · Augmented Fourth</option>
            <option value={1.5}>1.5 · Perfect Fifth</option>
            <option value={1.618}>1.618 · Golden Ratio</option>
          </select>
        </label>
      </div>
      <div className="space-y-3">
        {steps.map((s) => {
          const size = +(base * Math.pow(ratio, s)).toFixed(2);
          return (
            <div key={s} className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
              <div style={{ fontSize: size }} className="font-display leading-tight truncate">The quick brown fox</div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{size}px · {(size / 16).toFixed(3)}rem</span>
                <CopyButton value={`font-size: ${size}px;`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Shadow ---------- */
function ShadowMaker() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(20);
  const [blur, setBlur] = useState(40);
  const [spread, setSpread] = useState(-10);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(30);
  const rgb = hexToRgb(color)!;
  const css = `box-shadow: ${x}px ${y}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)});`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        {[
          ["Offset X", x, setX, -50, 50],
          ["Offset Y", y, setY, -50, 50],
          ["Blur", blur, setBlur, 0, 150],
          ["Spread", spread, setSpread, -50, 50],
          ["Opacity %", opacity, setOpacity, 0, 100],
        ].map(([lab, val, set, min, max]) => (
          <label key={lab as string} className="block text-xs font-mono">
            <div className="flex justify-between"><span>{lab as string}</span><span>{val as number}</span></div>
            <input type="range" min={min as number} max={max as number} value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="w-full accent-[hsl(var(--accent))]" />
          </label>
        ))}
        <label className="block text-xs font-mono">Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="ml-2 h-6 w-10 align-middle" /></label>
        <div className="mt-4 rounded-lg bg-background border border-border p-3 font-mono text-xs flex items-center justify-between gap-3">
          <code className="truncate">{css}</code><CopyButton value={css} />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-muted/30 p-6 grid place-items-center min-h-[280px]">
        <div className="h-40 w-40 rounded-2xl bg-card" style={{ boxShadow: `${x}px ${y}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})` }} />
      </div>
    </div>
  );
}

/* ---------- Gradient ---------- */
function GradientMaker() {
  const [c1, setC1] = useState("#c6f24e");
  const [c2, setC2] = useState("#0ea5e9");
  const [angle, setAngle] = useState(135);
  const css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex gap-4"><label className="text-xs font-mono">From <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="ml-2 h-8 w-14" /></label>
          <label className="text-xs font-mono">To <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="ml-2 h-8 w-14" /></label></div>
        <label className="block text-xs font-mono">Angle {angle}°<input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-[hsl(var(--accent))]" /></label>
        <div className="rounded-lg bg-background border border-border p-3 font-mono text-xs flex items-center justify-between gap-3">
          <code className="truncate">{css}</code><CopyButton value={css} />
        </div>
      </div>
      <div className="rounded-2xl border border-border overflow-hidden min-h-[280px]" style={{ background: `linear-gradient(${angle}deg, ${c1}, ${c2})` }} />
    </div>
  );
}

/* ---------- Responsive ---------- */
function ResponsiveChecker() {
  const [url, setUrl] = useState("https://jwalabaheliya-webdev.vercel.app/");
  const [input, setInput] = useState(url);
  const devices = [
    { name: "iPhone SE", w: 375, h: 667 },
    { name: "iPhone 15", w: 393, h: 852 },
    { name: "iPad", w: 768, h: 1024 },
    { name: "Laptop", w: 1280, h: 800 },
    { name: "Desktop", w: 1440, h: 900 },
  ];
  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); setUrl(input); }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://your-site.com" className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
        <button className="rounded-full bg-accent px-5 py-2 text-sm font-mono uppercase tracking-widest text-accent-foreground">Preview</button>
      </form>
      <div className="grid gap-6 lg:grid-cols-2">
        {devices.map((d) => (
          <div key={d.name} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>{d.name}</span><span>{d.w} × {d.h}</span>
            </div>
            <div className="overflow-auto rounded-lg border border-border bg-background" style={{ maxHeight: 420 }}>
              <iframe src={url} title={d.name} style={{ width: d.w, height: d.h, transform: "scale(0.55)", transformOrigin: "top left", border: 0 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Units ---------- */
function UnitConverter() {
  const [base, setBase] = useState(16);
  const [px, setPx] = useState(24);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 grid gap-6 md:grid-cols-2">
      <div>
        <label className="block text-xs font-mono mb-2">Root font size (px)<input type="number" value={base} onChange={(e) => setBase(+e.target.value || 16)} className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1" /></label>
        <label className="block text-xs font-mono mb-2">Pixels<input type="number" value={px} onChange={(e) => setPx(+e.target.value)} className="ml-2 w-20 rounded-md border border-border bg-background px-2 py-1" /></label>
      </div>
      <div className="space-y-2 font-mono text-sm">
        <FieldRow label="REM" value={`${(px / base).toFixed(4)}rem`} />
        <FieldRow label="EM" value={`${(px / base).toFixed(4)}em`} />
        <FieldRow label="PT" value={`${(px * 0.75).toFixed(2)}pt`} />
        <FieldRow label="%" value={`${((px / base) * 100).toFixed(2)}%`} />
      </div>
    </div>
  );
}

/* ---------- Lorem ---------- */
const LOREM = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" ");
function LoremGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const output = useMemo(() => {
    const sentence = () => {
      const n = 8 + Math.floor(Math.random() * 12);
      const s = Array.from({ length: n }, () => LOREM[Math.floor(Math.random() * LOREM.length)]).join(" ");
      return s.charAt(0).toUpperCase() + s.slice(1) + ".";
    };
    if (type === "words") return Array.from({ length: count }, () => LOREM[Math.floor(Math.random() * LOREM.length)]).join(" ");
    if (type === "sentences") return Array.from({ length: count }, sentence).join(" ");
    return Array.from({ length: count }, () => Array.from({ length: 4 }, sentence).join(" ")).join("\n\n");
  }, [count, type]);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs font-mono">Count <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(+e.target.value)} className="ml-2 w-16 rounded-md border border-border bg-background px-2 py-1" /></label>
        <div className="inline-flex gap-1 rounded-full border border-border p-1 text-[11px] font-mono">
          {(["paragraphs", "sentences", "words"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={"px-3 py-1 rounded-full uppercase tracking-wider " + (type === t ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{t}</button>
          ))}
        </div>
        <div className="ml-auto"><CopyButton value={output} label="Copy text" /></div>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{output}</pre>
    </div>
  );
}

/* ---------- HTML/CSS/JS Playground ---------- */
function HtmlCssJsPlayground() {
  const [html, setHtml] = useState(`<div class="card">\n  <h1>Hello 👋</h1>\n  <button id="b">Click me</button>\n</div>`);
  const [css, setCss] = useState(`body{font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fff}\n.card{padding:32px;border-radius:16px;background:#111;text-align:center}\nbutton{margin-top:12px;padding:10px 18px;border-radius:999px;border:0;background:#c6f24e;font-weight:600;cursor:pointer}`);
  const [js, setJs] = useState(`document.getElementById('b').onclick = () => alert('It works!');`);
  const srcDoc = `<!doctype html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mt-6">
      <div className="grid md:grid-cols-2">
        <div className="grid grid-rows-3 divide-y divide-border">
          <Editor label="HTML" value={html} onChange={setHtml} />
          <Editor label="CSS" value={css} onChange={setCss} />
          <Editor label="JS" value={js} onChange={setJs} />
        </div>
        <iframe title="preview" srcDoc={srcDoc} sandbox="allow-scripts" className="w-full min-h-[440px] bg-white" />
      </div>
    </div>
  );
}
function Editor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col">
      <div className="px-3 py-1.5 border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/30">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="flex-1 min-h-[140px] resize-none bg-background p-3 font-mono text-xs outline-none" />
    </div>
  );
}

/* ---------- Floating CTA (persistent across the app) ---------- */
export function FloatingToolkitCTA() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Link
      href="/toolkit"
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest shadow-lg hover:border-accent hover:text-accent transition"
    >
      <Wand2 className="h-3.5 w-3.5" /> Toolkit
    </Link>
  );
}

export default ToolsPage;
