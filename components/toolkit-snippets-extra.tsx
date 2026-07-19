"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, Eye, EyeOff, Menu, X, ChevronDown, GripVertical } from "lucide-react";

/* ---------- Shared helpers (mirror the toolkit ones) ---------- */
function Copier({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
      aria-label="Copy code"
    >
      {ok ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
      {ok ? "copied" : "copy"}
    </button>
  );
}

type SnippetTabs = {
  html: string;
  css: string;
  js: string;
};

type SnippetTabKey = keyof SnippetTabs;

function Code({ code, minHeight = "min-h-[260px]" }: { code: string; minHeight?: string }) {
  return (
    <div className={"relative w-full rounded-lg border border-border bg-neutral-950/80 " + minHeight}>
      <div className="absolute right-2 top-2"><Copier text={code} /></div>
      <pre className="overflow-auto whitespace-pre-wrap break-words p-4 pr-16 text-[12px] leading-relaxed font-mono text-neutral-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SnippetCodeTabs({ snippets }: { snippets: SnippetTabs }) {
  const [tab, setTab] = useState<SnippetTabKey>("js");
  const labels: SnippetTabKey[] = ["html", "css", "js"];

  return (
    <div className="flex flex-1 flex-col space-y-2">
      <div className="inline-flex rounded-full border border-border bg-background p-1 text-[11px] font-mono uppercase tracking-widest">
        {labels.map((label) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={
              "rounded-full px-3 py-1 transition " +
              (tab === label ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <Code code={snippets[tab]} />
    </div>
  );
}

export type ExtraSnippet = {
  title: string;
  explain: string;
  code: string;
  demo: () => React.ReactNode;
};

type SnippetSection = "all" | "ready-made" | "interview-prep";

const INTERVIEW_SNIPPET_TITLES = new Set([
  "Array Map Transformation",
  "Array Reduce Sum",
  "Promise.all Runner",
  "Memoized Fibonacci",
  "Flatten Nested Array",
  "Group By Property",
  "Retry Async Request",
  "Deep Clone Object",
  "Sort Objects by Key",
  "Once Function Wrapper",
  "Closure Counter",
  "Currying Function",
  "Pipe Function",
  "Binary Search",
  "Tree DFS Traversal",
  "Event Loop Order",
  "Array.map Polyfill Idea",
  "Function.bind Example",
  "Call / Apply / Bind",
  "Tiny LRU Cache",
]);

function isInterviewSnippet(title: string) {
  return INTERVIEW_SNIPPET_TITLES.has(title);
}

/* ---------- Demos ---------- */
function SmoothScrollSectionDemo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="w-full">
      <button onClick={() => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Scroll to target ↓</button>
      <div className="mt-4 h-16 rounded-lg border border-dashed border-border grid place-items-center text-xs text-muted-foreground">…scroll spacer…</div>
      <div ref={ref} className="mt-4 rounded-lg bg-accent/10 border border-accent/30 p-4 text-sm text-accent">🎯 target section</div>
    </div>
  );
}
function StickyNavDemo() {
  return (
    <div className="w-full h-40 overflow-auto rounded-lg border border-border bg-background">
      <div className="sticky top-0 bg-accent text-accent-foreground px-3 py-2 text-xs font-mono">sticky navbar</div>
      <div className="p-3 text-xs text-muted-foreground space-y-2">{Array.from({ length: 8 }).map((_, i) => <p key={i}>scroll content line {i + 1}</p>)}</div>
    </div>
  );
}
function ActiveNavDemo() {
  const [active, setActive] = useState("home");
  const items = ["home", "work", "about", "contact"];
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((i) => (
        <button key={i} onClick={() => setActive(i)} className={"rounded-full px-3 py-1 text-xs font-mono border " + (active === i ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground")}>{i}</button>
      ))}
    </div>
  );
}
function ScrollProgressDemo() {
  const [p, setP] = useState(0);
  useEffect(() => { const on = () => setP(window.scrollY / (document.body.scrollHeight - innerHeight) * 100); on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on); }, []);
  return <div className="w-full"><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent" style={{ width: p + "%" }} /></div><div className="mt-1 font-mono text-[10px] text-muted-foreground">{p.toFixed(0)}%</div></div>;
}
function IODemo() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={"rounded-xl border border-border p-4 text-sm transition-all duration-500 " + (visible ? "opacity-100 translate-y-0 bg-accent/10 border-accent/40 text-accent" : "opacity-50")}>{visible ? "✨ in view" : "waiting…"}</div>;
}
function LazyImageDemo() {
  return <img src="https://picsum.photos/seed/lazy/400/200" loading="lazy" alt="lazy" className="rounded-lg border border-border max-h-40" />;
}
function InfiniteScrollDemo() {
  const [items, setItems] = useState(Array.from({ length: 8 }, (_, i) => i + 1));
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setItems((prev) => [...prev, ...Array.from({ length: 6 }, (_, i) => prev.length + i + 1)]); });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, []);
  return (
    <div className="h-40 w-full overflow-auto rounded-lg border border-border">
      <ul className="p-2 space-y-1 text-xs font-mono">{items.map((i) => <li key={i} className="rounded bg-muted/40 px-2 py-1">item #{i}</li>)}</ul>
      <div ref={sentinel} className="p-2 text-center text-[10px] text-muted-foreground">loading more…</div>
    </div>
  );
}
function ThemeToggleDemo() {
  const [dark, setDark] = useState(false);
  return <div className={"rounded-xl p-4 text-sm transition-colors " + (dark ? "bg-neutral-900 text-neutral-100" : "bg-neutral-100 text-neutral-900")}><button onClick={() => setDark((v) => !v)} className="rounded-full border border-current px-3 py-1 text-xs">{dark ? "☀ Light" : "🌙 Dark"}</button><p className="mt-2 text-xs opacity-70">Currently: {dark ? "dark" : "light"}</p></div>;
}
function ThemeSaverDemo() {
  const [theme, setTheme] = useState("light");
  useEffect(() => { const t = localStorage.getItem("tk:demo-theme"); if (t) setTheme(t); }, []);
  const toggle = () => { const n = theme === "light" ? "dark" : "light"; setTheme(n); localStorage.setItem("tk:demo-theme", n); };
  return <div className="text-xs font-mono"><button onClick={toggle} className="rounded-full border border-border px-3 py-1">Toggle & save</button><div className="mt-2 text-muted-foreground">localStorage → {theme}</div></div>;
}
function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Open modal</button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><h4 className="font-display font-semibold">Hello 👋</h4><button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div>
            <p className="mt-2 text-sm text-muted-foreground">Vanilla modal — click backdrop or ✕ to close.</p>
          </div>
        </div>
      )}
    </>
  );
}
function ToastDemo() {
  return <button onClick={async () => { const { toast } = await import("sonner"); toast.success("It works!"); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Show toast</button>;
}
function AccordionDemo() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [{ q: "What is JS?", a: "The language of the web." }, { q: "What is CSS?", a: "Style rules for HTML." }, { q: "What is React?", a: "A UI library." }];
  return (
    <div className="w-full space-y-1">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-border">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-3 py-2 text-sm"><span>{it.q}</span><ChevronDown className={"h-4 w-4 transition-transform " + (open === i ? "rotate-180" : "")} /></button>
          {open === i && <div className="px-3 pb-2 text-xs text-muted-foreground">{it.a}</div>}
        </div>
      ))}
    </div>
  );
}
function TabsDemo() {
  const [t, setT] = useState(0);
  const tabs = ["Profile", "Skills", "Contact"];
  return (
    <div className="w-full">
      <div className="flex gap-1 rounded-full border border-border p-1">{tabs.map((n, i) => <button key={n} onClick={() => setT(i)} className={"flex-1 rounded-full px-3 py-1 text-xs " + (t === i ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{n}</button>)}</div>
      <div className="mt-3 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">Content for <b className="text-accent">{tabs[t]}</b></div>
    </div>
  );
}
function DropdownDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">Menu <ChevronDown className="h-4 w-4" /></button>
      {open && <ul className="absolute z-10 mt-1 min-w-[140px] rounded-md border border-border bg-card p-1 text-sm shadow-lg">{["Profile", "Settings", "Sign out"].map((i) => <li key={i} className="rounded px-2 py-1.5 hover:bg-accent/10 cursor-pointer">{i}</li>)}</ul>}
    </div>
  );
}
function OffcanvasDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-background">
      <button onClick={() => setOpen(true)} className="m-3 rounded-md border border-border px-3 py-1 text-xs">☰ Open sidebar</button>
      {open && <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />}
      <aside className={"absolute top-0 left-0 h-full w-40 bg-card border-r border-border p-3 transition-transform " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between"><span className="text-xs font-mono">sidebar</span><button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button></div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{["Home", "Work", "About"].map((i) => <li key={i}>{i}</li>)}</ul>
      </aside>
    </div>
  );
}
function HamburgerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md border border-border p-2">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
      {open && <ul className="mt-2 space-y-1 rounded-lg border border-border bg-card p-2 text-sm">{["Home", "Work", "Contact"].map((i) => <li key={i} className="rounded px-2 py-1 hover:bg-accent/10">{i}</li>)}</ul>}
    </div>
  );
}
function SliderDemo() {
  const imgs = ["photo-1503023345310-bd7c1de61c7d", "photo-1519681393784-d120267933ba", "photo-1500530855697-b586d89ba3ee"];
  const [i, setI] = useState(0);
  return (
    <div className="w-full space-y-2">
      <div className="relative overflow-hidden rounded-lg border border-border aspect-video">
        <img src={`https://images.unsplash.com/${imgs[i]}?w=600&q=60`} className="h-full w-full object-cover transition-opacity" alt="slide" />
      </div>
      <div className="flex justify-center gap-2">{imgs.map((_, k) => <button key={k} onClick={() => setI(k)} className={"h-2 w-6 rounded-full " + (k === i ? "bg-accent" : "bg-muted")} />)}</div>
    </div>
  );
}
function AutoCarouselDemo() {
  const items = ["Rustomjee", "Godrej", "Kotak", "Tata", "Yes Bank"];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % items.length), 1500); return () => clearInterval(id); }, [items.length]);
  return <div className="grid place-items-center rounded-lg border border-border py-6 font-display text-xl text-accent transition-all">{items[i]}</div>;
}
function CounterAnimDemo() {
  const [n, setN] = useState(0);
  const start = () => { setN(0); let x = 0; const id = setInterval(() => { x += 5; setN(x); if (x >= 500) clearInterval(id); }, 15); };
  return <div className="text-center"><div className="font-display text-4xl text-accent">{n}+</div><button onClick={start} className="mt-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Animate</button></div>;
}
function NumberCountUpDemo() {
  const [n, setN] = useState(0);
  useEffect(() => { let raf = 0, start = 0; const step = (t: number) => { if (!start) start = t; const p = Math.min(1, (t - start) / 1500); setN(Math.round(p * 8752)); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, []);
  return <div className="font-display text-4xl text-accent tabular-nums">{n.toLocaleString()}</div>;
}
function TypingEffectDemo() {
  const text = "console.log('hello world');";
  const [n, setN] = useState(0);
  useEffect(() => { const i = setInterval(() => setN((v) => (v < text.length ? v + 1 : 0)), 80); return () => clearInterval(i); }, []);
  return <div className="font-mono text-sm">{text.slice(0, n)}<span className="animate-pulse">▌</span></div>;
}
function ScrambleDemo() {
  const target = "Frontend Developer";
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  const [out, setOut] = useState(target);
  const run = () => {
    let frame = 0;
    const queue = target.split("").map(() => Math.floor(Math.random() * 20) + 10);
    const tick = () => {
      let str = "";
      let done = 0;
      for (let i = 0; i < target.length; i++) {
        if (frame >= queue[i]) { str += target[i]; done++; }
        else str += chars[Math.floor(Math.random() * chars.length)];
      }
      setOut(str);
      if (done < target.length) { frame++; requestAnimationFrame(tick); }
    };
    tick();
  };
  return <div className="space-y-2 text-center"><div className="font-mono text-lg text-accent">{out}</div><button onClick={run} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Scramble</button></div>;
}
function ReadMoreDemo() {
  const [open, setOpen] = useState(false);
  const text = "Frontend developer with 8+ years of experience crafting premium interfaces for global brands including Rustomjee, Godrej, Kotak, Tata and many more. Passionate about performance, accessibility and design systems.";
  return <div className="text-sm text-muted-foreground"><span>{open ? text : text.slice(0, 80) + "…"}</span> <button onClick={() => setOpen((v) => !v)} className="text-accent underline">{open ? "less" : "more"}</button></div>;
}
function ClipboardCopyDemo() {
  const [ok, setOk] = useState(false);
  return <button onClick={async () => { await navigator.clipboard.writeText("hello@jwala.dev"); setOk(true); setTimeout(() => setOk(false), 1200); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">{ok ? "✓ Copied" : "Copy email"}</button>;
}
function PasswordVisibilityDemo() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} defaultValue="superSecret123" className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm" />
      <button onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
    </div>
  );
}
function PasswordStrengthDemo() {
  const [pw, setPw] = useState("");
  const score = (() => { let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return s; })();
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
  const colors = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  return (
    <div className="w-full space-y-2">
      <input value={pw} onChange={(e) => setPw(e.target.value)} type="text" placeholder="Type a password…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className={"h-1.5 flex-1 rounded-full " + (i < score ? colors[score] : "bg-muted")} />)}</div>
      <div className="text-xs font-mono text-muted-foreground">{labels[score]}</div>
    </div>
  );
}
function FormValidationDemo() {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <div className="w-full space-y-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={"w-full rounded-md border bg-background px-3 py-2 text-sm " + (email && !valid ? "border-rose-500" : "border-border")} />
      <div className={"text-xs font-mono " + (email ? (valid ? "text-emerald-400" : "text-rose-400") : "text-muted-foreground")}>{email ? (valid ? "✓ valid email" : "✕ not a valid email") : "enter an email"}</div>
    </div>
  );
}
function DebounceSnippetDemo() {
  const [v, setV] = useState(""), [out, setOut] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return <div className="w-full"><input value={v} onChange={(e) => { setV(e.target.value); if (t.current) clearTimeout(t.current); t.current = setTimeout(() => setOut(e.target.value), 400); }} placeholder="Type…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><div className="mt-1 font-mono text-xs text-accent">debounced: {out}</div></div>;
}
function ThrottleSnippetDemo() {
  const [count, setCount] = useState(0), last = useRef(0);
  return <div className="w-full text-center"><button onClick={() => { const n = Date.now(); if (n - last.current > 500) { last.current = n; setCount((c) => c + 1); } }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Click fast (throttled 500ms)</button><div className="mt-1 font-mono text-xs text-muted-foreground">counted: {count}</div></div>;
}
function FetchDemo() {
  const [data, setData] = useState<string>("—");
  const load = async () => { setData("loading…"); try { const r = await fetch("https://api.github.com/repos/facebook/react"); const j = await r.json(); setData("★ " + (j.stargazers_count as number).toLocaleString()); } catch { setData("failed"); } };
  return <div className="text-center"><button onClick={load} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Fetch React stars</button><div className="mt-2 font-mono text-sm text-accent">{data}</div></div>;
}
function SearchFilterDemo() {
  const items = ["Rustomjee", "Godrej", "Kotak", "Tata", "Yes Bank", "AU Bank", "VIP Bags", "Kokuyo Camlin"];
  const [q, setQ] = useState("");
  const filtered = items.filter((i) => i.toLowerCase().includes(q.toLowerCase()));
  return <div className="w-full"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><ul className="mt-2 max-h-32 overflow-auto space-y-1 text-xs font-mono">{filtered.map((i) => <li key={i} className="rounded bg-muted/40 px-2 py-1">{i}</li>)}{!filtered.length && <li className="text-muted-foreground">no matches</li>}</ul></div>;
}
function LiveSearchDemo() {
  const [q, setQ] = useState(""), [results, setResults] = useState<string[]>([]);
  useEffect(() => { const t = setTimeout(() => { if (!q) return setResults([]); setResults([q + " — result A", q + " — result B", q + " — result C"]); }, 250); return () => clearTimeout(t); }, [q]);
  return <div className="w-full"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Live search (debounced)…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />{results.length > 0 && <ul className="mt-2 space-y-1 text-xs font-mono">{results.map((r) => <li key={r} className="rounded bg-accent/10 text-accent px-2 py-1">{r}</li>)}</ul>}</div>;
}
function PaginationDemo() {
  const [page, setPage] = useState(1); const pages = 6;
  return (
    <div className="w-full text-center">
      <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">Showing page <b className="text-accent">{page}</b> of {pages}</div>
      <div className="mt-2 flex items-center justify-center gap-1">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40">‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} onClick={() => setPage(p)} className={"h-7 w-7 rounded text-xs font-mono " + (page === p ? "bg-accent text-accent-foreground" : "border border-border")}>{p}</button>)}
        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40">›</button>
      </div>
    </div>
  );
}
function DragDropDemo() {
  const [items, setItems] = useState(["Design", "Build", "Ship", "Iterate"]);
  const dragIdx = useRef<number | null>(null);
  return (
    <ul className="w-full space-y-1">
      {items.map((it, i) => (
        <li key={it} draggable onDragStart={() => (dragIdx.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { const from = dragIdx.current; if (from === null || from === i) return; const arr = [...items]; const [m] = arr.splice(from, 1); arr.splice(i, 0, m); setItems(arr); dragIdx.current = null; }} className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2 text-sm cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" /> {it}
        </li>
      ))}
    </ul>
  );
}
function FileUploadPreviewDemo() {
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  return (
    <div className="w-full">
      <label className="block cursor-pointer rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        Choose files
        <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []).map((f) => ({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" })))} />
      </label>
      {files.length > 0 && <ul className="mt-2 space-y-1 text-xs font-mono">{files.map((f) => <li key={f.name} className="flex justify-between rounded bg-muted/40 px-2 py-1"><span>{f.name}</span><span className="text-muted-foreground">{f.size}</span></li>)}</ul>}
    </div>
  );
}
function ImagePreviewDemo() {
  const [src, setSrc] = useState("");
  return (
    <div className="w-full space-y-2">
      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSrc(URL.createObjectURL(f)); }} className="text-xs" />
      {src && <img src={src} alt="preview" className="max-h-32 rounded-lg border border-border" />}
    </div>
  );
}
function CharCounterDemo() {
  const [v, setV] = useState(""); const max = 140;
  return <div className="w-full"><textarea value={v} onChange={(e) => setV(e.target.value.slice(0, max))} rows={3} placeholder="Tweet something…" className="w-full rounded-md border border-border bg-background p-2 text-sm" /><div className={"mt-1 text-right font-mono text-xs " + (v.length > max - 20 ? "text-rose-400" : "text-muted-foreground")}>{v.length} / {max}</div></div>;
}
function CountdownTimerDemo() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const target = +new Date("2027-01-01"); const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  return <div className="font-mono text-xl text-accent">{d}d {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</div>;
}
function StopwatchDemo() {
  const [ms, setMs] = useState(0); const [run, setRun] = useState(false);
  useEffect(() => { if (!run) return; const id = setInterval(() => setMs((v) => v + 10), 10); return () => clearInterval(id); }, [run]);
  const fmt = (n: number) => `${String(Math.floor(n / 60000)).padStart(2, "0")}:${String(Math.floor(n / 1000) % 60).padStart(2, "0")}.${String(Math.floor(n / 10) % 100).padStart(2, "0")}`;
  return <div className="text-center"><div className="font-mono text-2xl text-accent tabular-nums">{fmt(ms)}</div><div className="mt-2 flex justify-center gap-2"><button onClick={() => setRun((v) => !v)} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">{run ? "Pause" : "Start"}</button><button onClick={() => { setRun(false); setMs(0); }} className="rounded-full border border-border px-3 py-1 text-xs">Reset</button></div></div>;
}
function ClockDemo() {
  const [t, setT] = useState("");
  useEffect(() => { const upd = () => setT(new Date().toLocaleTimeString()); upd(); const i = setInterval(upd, 1000); return () => clearInterval(i); }, []);
  return <div className="font-mono text-2xl text-accent tabular-nums">{t || "--:--:--"}</div>;
}
function RandomColorGenDemo() {
  const [c, setC] = useState("#22c55e");
  return <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-lg border border-border" style={{ background: c }} /><div><code className="text-xs font-mono">{c}</code><div className="mt-1"><button onClick={() => setC('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'))} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Roll</button></div></div></div>;
}
function RandomQuoteDemo() {
  const quotes = ["Ship it.", "Details matter.", "Design in the browser.", "Constraints breed creativity.", "Less, but better.", "Make it work, then make it beautiful."];
  const [q, setQ] = useState(quotes[0]);
  return <div className="w-full text-center"><div className="italic text-sm">“{q}”</div><button onClick={() => setQ(quotes[Math.floor(Math.random() * quotes.length)])} className="mt-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">New quote</button></div>;
}
function UuidDemo() {
  const [u, setU] = useState("");
  const gen = () => setU((crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() || Math.random().toString(36).slice(2));
  return <div className="w-full text-center"><code className="block truncate rounded bg-muted px-2 py-1 font-mono text-xs">{u || "click generate"}</code><button onClick={gen} className="mt-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Generate</button></div>;
}
function EventDelegationDemo() {
  const [done, setDone] = useState<string[]>([]);
  const tasks = ["Design", "Build", "Ship"];
  return (
    <div className="w-full space-y-2">
      {tasks.map((task) => (
        <button
          key={task}
          onClick={() => setDone((prev) => prev.includes(task) ? prev.filter((x) => x !== task) : [...prev, task])}
          className={"w-full rounded-lg border px-3 py-2 text-left text-sm " + (done.includes(task) ? "border-accent bg-accent/10 text-accent" : "border-border")}
        >
          {task}
        </button>
      ))}
    </div>
  );
}
function LocalStorageFormDemo() {
  const [value, setValue] = useState("");
  useEffect(() => { setValue(localStorage.getItem("tk:autosave") || ""); }, []);
  useEffect(() => { localStorage.setItem("tk:autosave", value); }, [value]);
  return <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} placeholder="Type and refresh..." className="w-full rounded-lg border border-border bg-background p-3 text-sm" />;
}
function QueryParamsDemo() {
  const [url, setUrl] = useState("https://example.com/?role=frontend&mode=remote");
  const params = useMemo(() => Object.fromEntries(new URL(url).searchParams.entries()), [url]);
  return <div className="w-full space-y-2"><input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-mono" /><div className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify(params, null, 2)}</div></div>;
}
function DownloadFileDemo() {
  return <button onClick={() => { const blob = new Blob(["Hello from vanilla JS"], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "snippet-demo.txt"; a.click(); URL.revokeObjectURL(a.href); }} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Download .txt</button>;
}
function FormDataDemo() {
  const [data, setData] = useState("{}");
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setData(JSON.stringify(Object.fromEntries(fd.entries()), null, 2)); }} className="w-full space-y-2">
      <input name="name" placeholder="Name" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <input name="email" placeholder="Email" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <button className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Serialize</button>
      <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{data}</pre>
    </form>
  );
}
function CustomEventDemo() {
  const [msg, setMsg] = useState("Waiting...");
  useEffect(() => {
    const handler = (event: Event) => setMsg((event as CustomEvent<string>).detail);
    window.addEventListener("snippet:notify", handler);
    return () => window.removeEventListener("snippet:notify", handler);
  }, []);
  return <div className="w-full text-center"><button onClick={() => window.dispatchEvent(new CustomEvent("snippet:notify", { detail: "Custom event fired" }))} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Dispatch event</button><div className="mt-2 text-sm text-accent">{msg}</div></div>;
}
function ArrayMapDemo() {
  const nums = [1, 2, 3, 4];
  const doubled = nums.map((n) => n * 2);
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ nums, doubled }, null, 2)}</pre>;
}
function ArrayReduceDemo() {
  const prices = [120, 80, 50, 30];
  const total = prices.reduce((sum, price) => sum + price, 0);
  return <div className="text-center"><div className="font-mono text-sm text-muted-foreground">[120, 80, 50, 30]</div><div className="mt-2 text-3xl font-display text-accent">{total}</div></div>;
}
function PromiseAllDemo() {
  const [state, setState] = useState("Idle");
  async function run() {
    setState("Loading...");
    const wait = (label: string, ms: number) => new Promise((resolve) => setTimeout(() => resolve(label), ms));
    const result = await Promise.all([wait("users", 400), wait("posts", 650), wait("comments", 250)]);
    setState(result.join(", "));
  }
  return <div className="text-center"><button onClick={run} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Run Promise.all</button><div className="mt-2 text-sm text-accent">{state}</div></div>;
}
function MemoizeDemo() {
  const [value, setValue] = useState<number | null>(null);
  const fib = (n: number, cache = new Map<number, number>()): number => {
    if (cache.has(n)) return cache.get(n)!;
    if (n < 2) return n;
    const result = fib(n - 1, cache) + fib(n - 2, cache);
    cache.set(n, result);
    return result;
  };
  return <div className="text-center"><button onClick={() => setValue(fib(20))} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Memoized fib(20)</button><div className="mt-2 font-mono text-accent">{value ?? "Click to compute"}</div></div>;
}
function FlattenArrayDemo() {
  const nested = [1, [2, 3], [4, [5, 6]]];
  const flat = nested.flat(2);
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ nested, flat }, null, 2)}</pre>;
}
function GroupByDemo() {
  const items = [
    { name: "React", type: "library" },
    { name: "Vue", type: "framework" },
    { name: "Next.js", type: "framework" },
  ];
  const grouped = Object.groupBy ? Object.groupBy(items, (item) => item.type) : items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.type] ||= []).push(item);
    return acc;
  }, {});
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify(grouped, null, 2)}</pre>;
}
function RetryFetchDemo() {
  const [attempts, setAttempts] = useState("Not started");
  async function run() {
    let count = 0;
    const fakeRequest = () => new Promise((resolve, reject) => {
      count += 1;
      if (count < 3) reject(new Error("fail"));
      else resolve("success");
    });
    async function retry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
      let lastError: unknown;
      for (let i = 0; i < maxRetries; i += 1) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError;
    }
    const result = await retry(fakeRequest as () => Promise<string>);
    setAttempts(`Succeeded on try ${count}: ${result}`);
  }
  return <div className="text-center"><button onClick={run} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Retry demo</button><div className="mt-2 text-sm text-accent">{attempts}</div></div>;
}
function DeepCloneDemo() {
  const original = { user: { name: "JB" }, skills: ["JS", "React"] };
  const copy = structuredClone(original);
  copy.user.name = "Cloned";
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ original, copy }, null, 2)}</pre>;
}
function SortObjectsDemo() {
  const people = [{ name: "Zara", years: 4 }, { name: "Aman", years: 8 }, { name: "Riya", years: 6 }];
  const sorted = [...people].sort((a, b) => b.years - a.years);
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify(sorted, null, 2)}</pre>;
}
function OnceFunctionDemo() {
  const [count, setCount] = useState(0);
  const onceRef = useRef<(() => void) | null>(null);
  if (!onceRef.current) {
    const once = (fn: () => void) => {
      let called = false;
      return () => {
        if (called) return;
        called = true;
        fn();
      };
    };
    onceRef.current = once(() => setCount((c) => c + 1));
  }
  return <div className="text-center"><button onClick={() => onceRef.current?.()} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Run once</button><div className="mt-2 font-mono text-accent">count: {count}</div></div>;
}
function ClosureCounterDemo() {
  const [value, setValue] = useState(0);
  const counterRef = useRef<(() => number) | null>(null);
  if (!counterRef.current) {
    const createCounter = () => {
      let count = 0;
      return () => ++count;
    };
    counterRef.current = createCounter();
  }
  return <div className="text-center"><button onClick={() => setValue(counterRef.current?.() ?? 0)} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Increment closure</button><div className="mt-2 font-mono text-accent">{value}</div></div>;
}
function CurryingDemo() {
  const add = (a: number) => (b: number) => a + b;
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ add5: "const add5 = add(5)", result: add(5)(3) }, null, 2)}</pre>;
}
function PipeComposeDemo() {
  const pipe = (...fns: Array<(value: number) => number>) => (value: number) => fns.reduce((acc, fn) => fn(acc), value);
  const result = pipe((x) => x + 2, (x) => x * 3, (x) => x - 1)(4);
  return <div className="text-center"><div className="font-mono text-xs text-muted-foreground">pipe(add2, times3, minus1)(4)</div><div className="mt-2 text-3xl font-display text-accent">{result}</div></div>;
}
function BinarySearchDemo() {
  const arr = [2, 4, 6, 8, 10, 12, 14];
  const target = 10;
  let left = 0, right = arr.length - 1, found = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) { found = mid; break; }
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ arr, target, index: found }, null, 2)}</pre>;
}
function TreeTraversalDemo() {
  const tree = { value: "A", children: [{ value: "B", children: [{ value: "D", children: [] }] }, { value: "C", children: [] }] };
  const order: string[] = [];
  const dfs = (node: typeof tree) => { order.push(node.value); node.children.forEach(dfs); };
  dfs(tree);
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ traversal: order }, null, 2)}</pre>;
}
function EventLoopDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  function run() {
    const next: string[] = [];
    next.push("script start");
    Promise.resolve().then(() => setLogs((prev) => [...prev, "promise microtask"]));
    setTimeout(() => setLogs((prev) => [...prev, "setTimeout macrotask"]), 0);
    next.push("script end");
    setLogs(next);
  }
  return <div className="w-full"><button onClick={run} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Run event loop</button><ul className="mt-3 space-y-1 text-xs font-mono">{logs.map((log, i) => <li key={i} className="rounded bg-muted/40 px-2 py-1 text-accent">{log}</li>)}</ul></div>;
}
function PolyfillMapDemo() {
  const mapped = [1, 2, 3].reduce<number[]>((acc, item) => { acc.push(item * 2); return acc; }, []);
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ input: [1, 2, 3], mapped }, null, 2)}</pre>;
}
function PolyfillBindDemo() {
  const person = { name: "Jwala" };
  function greet(this: { name: string }, role: string) { return `Hi, I'm ${this.name} the ${role}`; }
  const bound = greet.bind(person, "developer");
  return <div className="rounded-lg bg-muted/40 p-3 text-sm font-mono text-accent">{bound()}</div>;
}
function CallApplyBindDemo() {
  const person = { name: "JB" };
  function intro(this: { name: string }, city: string) { return `${this.name} from ${city}`; }
  return <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{JSON.stringify({ call: intro.call(person, "Mumbai"), apply: intro.apply(person, ["Pune"]), bind: intro.bind(person, "Delhi")() }, null, 2)}</pre>;
}
function LruCacheDemo() {
  const [state, setState] = useState<string>("empty");
  function run() {
    const cache = new Map<string, number>();
    const set = (key: string, value: number) => {
      if (cache.has(key)) cache.delete(key);
      cache.set(key, value);
      if (cache.size > 2) cache.delete(cache.keys().next().value);
    };
    set("a", 1); set("b", 2); set("c", 3);
    setState(JSON.stringify(Object.fromEntries(cache), null, 2));
  }
  return <div className="w-full"><button onClick={run} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">Run LRU</button><pre className="mt-3 rounded-lg bg-muted/40 p-3 text-xs font-mono text-accent">{state}</pre></div>;
}

const DEFAULT_HTML = `<section class="snippet-card">
  <button class="snippet-button">Run snippet</button>
  <p class="snippet-text">Update the markup to fit your page.</p>
</section>`;

const DEFAULT_CSS = `.snippet-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid #d4d4d8;
  border-radius: 16px;
  background: #ffffff;
}

.snippet-button {
  width: fit-content;
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}`;

const VANILLA_SNIPPETS: Record<string, SnippetTabs> = {
  "Smooth Scroll to Section": {
    html: `<button class="scroll-btn" type="button">Scroll to pricing</button>

<div class="spacer">Hero content</div>

<section id="pricing" class="target-section">
  <h2>Pricing</h2>
  <p>Your target section goes here.</p>
</section>`,
    css: `.scroll-btn {
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

.spacer {
  height: 80vh;
}

.target-section {
  padding: 24px;
  border: 1px solid #d4d4d8;
  border-radius: 16px;
}`,
    js: `const scrollButton = document.querySelector(".scroll-btn");
const pricingSection = document.querySelector("#pricing");

scrollButton?.addEventListener("click", () => {
  pricingSection?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});`,
  },
  "Scroll To Top Button": {
    html: `<button id="toTop" class="to-top" type="button" aria-label="Back to top">
  Top
</button>`,
    css: `.to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition: 0.25s ease;
}

.to-top.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}`,
    js: `const toTopButton = document.querySelector("#toTop");

window.addEventListener("scroll", () => {
  const shouldShow = window.scrollY > 300;
  toTopButton?.classList.toggle("is-visible", shouldShow);
});

toTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});`,
  },
  "Sticky Navbar": {
    html: `<header class="site-header">
  <nav class="site-nav">Sticky navigation</nav>
</header>

<main class="page-content">
  <p>Scroll the page and the nav stays pinned.</p>
</main>`,
    css: `.site-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 16px;
  background: #111827;
  color: #fff;
}

.page-content {
  min-height: 120vh;
  padding: 24px 16px;
}`,
    js: `const stickyNav = document.querySelector(".site-nav");
console.log("Sticky nav ready:", Boolean(stickyNav));`,
  },
  "Active Navigation Highlight": {
    html: `<nav class="section-nav">
  <a href="#home" class="is-active">Home</a>
  <a href="#work">Work</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>`,
    css: `.section-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section-nav a {
  padding: 8px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 999px;
  text-decoration: none;
  color: #52525b;
}

.section-nav a.is-active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}`,
    js: `const navLinks = document.querySelectorAll(".section-nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});`,
  },
  "Scroll Progress Bar": {
    html: `<div class="progress-wrap">
  <div id="progressBar" class="progress-bar"></div>
</div>`,
    css: `.progress-wrap {
  position: fixed;
  inset: 0 0 auto;
  height: 4px;
  background: rgba(148, 163, 184, 0.2);
}

.progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #2563eb, #06b6d4);
}`,
    js: `const progressBar = document.querySelector("#progressBar");

window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = progress + "%";
});`,
  },
  "Intersection Observer Animation": {
    html: `<section class="reveal-grid">
  <article class="reveal-card">Card 1</article>
  <article class="reveal-card">Card 2</article>
  <article class="reveal-card">Card 3</article>
</section>`,
    css: `.reveal-card {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-card.in-view {
  opacity: 1;
  transform: translateY(0);
}`,
    js: `const cards = document.querySelectorAll(".reveal-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.4 });

cards.forEach((card) => observer.observe(card));`,
  },
  "Lazy Image Loader": {
    html: `<img
  class="lazy-image"
  src="https://picsum.photos/800/500"
  alt="Lazy loaded example"
  loading="lazy"
/>`,
    css: `.lazy-image {
  display: block;
  width: 100%;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.is-loaded {
  opacity: 1;
}`,
    js: `const lazyImage = document.querySelector(".lazy-image");

lazyImage?.addEventListener("load", () => {
  lazyImage.classList.add("is-loaded");
});`,
  },
  "Infinite Scroll": {
    html: `<ul id="feed" class="feed-list"></ul>
<div id="sentinel" class="feed-sentinel">Loading more...</div>`,
    css: `.feed-list {
  display: grid;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.feed-item {
  padding: 12px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
}

.feed-sentinel {
  padding: 16px;
  text-align: center;
  color: #71717a;
}`,
    js: `const feed = document.querySelector("#feed");
const sentinel = document.querySelector("#sentinel");
let page = 0;

const renderBatch = () => {
  const items = Array.from({ length: 6 }, (_, index) => page * 6 + index + 1);
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "feed-item";
    li.textContent = "Loaded item #" + item;
    feed?.appendChild(li);
  });
  page += 1;
};

renderBatch();

const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) renderBatch();
});

if (sentinel) observer.observe(sentinel);`,
  },
  "Dark / Light Theme Toggle": {
    html: `<button id="themeToggle" type="button">Toggle theme</button>`,
    css: `:root {
  color-scheme: light;
  --bg: #ffffff;
  --fg: #111827;
}

html.dark {
  color-scheme: dark;
  --bg: #09090b;
  --fg: #f4f4f5;
}

body {
  background: var(--bg);
  color: var(--fg);
}`,
    js: `const themeToggle = document.querySelector("#themeToggle");

themeToggle?.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});`,
  },
  "LocalStorage Theme Saver": {
    html: `<button id="savedThemeToggle" type="button">Toggle saved theme</button>`,
    css: `html.dark {
  background: #09090b;
  color: #f4f4f5;
}`,
    js: `const savedThemeKey = "theme";
const savedThemeToggle = document.querySelector("#savedThemeToggle");

const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const initialTheme = localStorage.getItem(savedThemeKey) || "light";
applyTheme(initialTheme);

savedThemeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(savedThemeKey, nextTheme);
});`,
  },
  "Modal Popup": {
    html: `<button id="openModal" type="button">Open modal</button>

<dialog id="modal">
  <h2>Hello</h2>
  <p>This modal closes on backdrop click too.</p>
  <button id="closeModal" type="button">Close</button>
</dialog>`,
    css: `dialog {
  width: min(420px, calc(100vw - 32px));
  padding: 24px;
  border: 0;
  border-radius: 20px;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.55);
}`,
    js: `const modal = document.querySelector("#modal");
const openModal = document.querySelector("#openModal");
const closeModal = document.querySelector("#closeModal");

openModal?.addEventListener("click", () => modal?.showModal());
closeModal?.addEventListener("click", () => modal?.close());

modal?.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});`,
  },
  "Toast Notification": {
    html: `<button id="showToast" type="button">Show toast</button>
<div id="toastHost" class="toast-host"></div>`,
    css: `.toast-host {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: grid;
  gap: 10px;
}

.toast {
  padding: 12px 16px;
  border-radius: 14px;
  background: #18181b;
  color: #fff;
  animation: toast-in 0.25s ease;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`,
    js: `const showToast = document.querySelector("#showToast");
const toastHost = document.querySelector("#toastHost");

showToast?.addEventListener("click", () => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "Saved successfully";
  toastHost?.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
});`,
  },
  Accordion: {
    html: `<div class="accordion">
  <button class="accordion-trigger" type="button">What is JavaScript?</button>
  <div class="accordion-panel">JavaScript is the language of the web.</div>

  <button class="accordion-trigger" type="button">What is ES6?</button>
  <div class="accordion-panel">Modern syntax like const, let, and arrow functions.</div>
</div>`,
    css: `.accordion-trigger {
  width: 100%;
  padding: 12px 14px;
  text-align: left;
}

.accordion-panel {
  display: none;
  padding: 0 14px 14px;
}

.accordion-panel.is-open {
  display: block;
}`,
    js: `const accordionButtons = document.querySelectorAll(".accordion-trigger");

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    document.querySelectorAll(".accordion-panel").forEach((item) => item.classList.remove("is-open"));
    panel?.classList.toggle("is-open");
  });
});`,
  },
  Tabs: {
    html: `<div class="tabs">
  <div class="tab-buttons">
    <button class="tab-btn is-active" data-tab="profile" type="button">Profile</button>
    <button class="tab-btn" data-tab="skills" type="button">Skills</button>
    <button class="tab-btn" data-tab="contact" type="button">Contact</button>
  </div>

  <div class="tab-panel is-active" data-panel="profile">Profile content</div>
  <div class="tab-panel" data-panel="skills">Skills content</div>
  <div class="tab-panel" data-panel="contact">Contact content</div>
</div>`,
    css: `.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-panel {
  display: none;
  margin-top: 12px;
}

.tab-btn.is-active,
.tab-panel.is-active {
  display: block;
}`,
    js: `const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { tab } = button.dataset;
    tabButtons.forEach((item) => item.classList.remove("is-active"));
    tabPanels.forEach((panel) => panel.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector('[data-panel="' + tab + '"]')?.classList.add("is-active");
  });
});`,
  },
  "Dropdown Menu": {
    html: `<div class="dropdown">
  <button id="menuButton" type="button">Menu</button>
  <ul id="menuList" class="menu-list">
    <li><a href="#profile">Profile</a></li>
    <li><a href="#settings">Settings</a></li>
    <li><a href="#logout">Sign out</a></li>
  </ul>
</div>`,
    css: `.dropdown {
  position: relative;
  width: fit-content;
}

.menu-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  display: none;
  min-width: 160px;
  padding: 8px;
  list-style: none;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
  background: #fff;
}

.menu-list.is-open {
  display: block;
}`,
    js: `const menuButton = document.querySelector("#menuButton");
const menuList = document.querySelector("#menuList");

menuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  menuList?.classList.toggle("is-open");
});

document.addEventListener("click", (event) => {
  if (!menuList?.contains(event.target)) menuList?.classList.remove("is-open");
});`,
  },
  "Offcanvas Sidebar": {
    html: `<button id="openSidebar" type="button">Open sidebar</button>
<div id="sidebarBackdrop" class="sidebar-backdrop"></div>
<aside id="sidebar" class="sidebar">
  <button id="closeSidebar" type="button">Close</button>
</aside>`,
    css: `.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 280px;
  padding: 24px;
  background: #fff;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  display: none;
  background: rgba(0, 0, 0, 0.45);
}

.sidebar-backdrop.is-open {
  display: block;
}`,
    js: `const sidebar = document.querySelector("#sidebar");
const sidebarBackdrop = document.querySelector("#sidebarBackdrop");
const openSidebar = document.querySelector("#openSidebar");
const closeSidebar = document.querySelector("#closeSidebar");

const toggleSidebar = (isOpen) => {
  sidebar?.classList.toggle("is-open", isOpen);
  sidebarBackdrop?.classList.toggle("is-open", isOpen);
};

openSidebar?.addEventListener("click", () => toggleSidebar(true));
closeSidebar?.addEventListener("click", () => toggleSidebar(false));
sidebarBackdrop?.addEventListener("click", () => toggleSidebar(false));`,
  },
  "Mobile Hamburger Menu": {
    html: `<button id="hamburger" type="button" aria-expanded="false">Menu</button>
<nav id="mobileNav" class="mobile-nav">
  <a href="#home">Home</a>
  <a href="#work">Work</a>
  <a href="#contact">Contact</a>
</nav>`,
    css: `.mobile-nav {
  display: none;
  margin-top: 12px;
}

.mobile-nav.is-open {
  display: grid;
  gap: 8px;
}`,
    js: `const hamburger = document.querySelector("#hamburger");
const mobileNav = document.querySelector("#mobileNav");

hamburger?.addEventListener("click", () => {
  const isOpen = mobileNav?.classList.toggle("is-open");
  hamburger.setAttribute("aria-expanded", String(Boolean(isOpen)));
});`,
  },
  "Image Slider": {
    html: `<div class="slider">
  <img id="sliderImage" src="https://picsum.photos/id/1015/700/420" alt="Slide" />
  <div class="slider-controls">
    <button type="button" data-index="0">1</button>
    <button type="button" data-index="1">2</button>
    <button type="button" data-index="2">3</button>
  </div>
</div>`,
    css: `#sliderImage {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
}

.slider-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}`,
    js: `const sliderImage = document.querySelector("#sliderImage");
const sliderImages = [
  "https://picsum.photos/id/1015/700/420",
  "https://picsum.photos/id/1016/700/420",
  "https://picsum.photos/id/1025/700/420",
];

document.querySelectorAll("[data-index]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    if (sliderImage) sliderImage.src = sliderImages[index];
  });
});`,
  },
  "Auto Carousel": {
    html: `<div id="brandCarousel" class="brand-carousel">Rustomjee</div>`,
    css: `.brand-carousel {
  padding: 24px;
  border: 1px solid #d4d4d8;
  border-radius: 16px;
  text-align: center;
  font-size: 24px;
}`,
    js: `const brandCarousel = document.querySelector("#brandCarousel");
const brands = ["Rustomjee", "Godrej", "Kotak", "Tata", "Yes Bank"];
let brandIndex = 0;

setInterval(() => {
  brandIndex = (brandIndex + 1) % brands.length;
  if (brandCarousel) brandCarousel.textContent = brands[brandIndex];
}, 1500);`,
  },
  "Counter Animation": {
    html: `<button id="startCounter" type="button">Animate counter</button>
<p id="counterValue">0</p>`,
    css: `#counterValue {
  font-size: 40px;
  font-weight: 700;
  color: #2563eb;
}`,
    js: `const startCounter = document.querySelector("#startCounter");
const counterValue = document.querySelector("#counterValue");

startCounter?.addEventListener("click", () => {
  let value = 0;
  const intervalId = setInterval(() => {
    value += 5;
    if (counterValue) counterValue.textContent = String(value);
    if (value >= 500) clearInterval(intervalId);
  }, 15);
});`,
  },
  "Number Count Up": {
    html: `<p id="countUpValue">0</p>`,
    css: `#countUpValue {
  font-size: 48px;
  font-variant-numeric: tabular-nums;
}`,
    js: `const countUpValue = document.querySelector("#countUpValue");
const countUpTarget = 8752;
const countUpDuration = 1500;

const countUp = () => {
  const start = performance.now();

  const step = (time) => {
    const progress = Math.min(1, (time - start) / countUpDuration);
    const value = Math.round(progress * countUpTarget);
    if (countUpValue) countUpValue.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

countUp();`,
  },
  "Typing Effect": {
    html: `<p id="typingText" class="typing-text"></p>`,
    css: `.typing-text::after {
  content: "|";
  margin-left: 2px;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}`,
    js: `const typingText = document.querySelector("#typingText");
const typingSource = "console.log(\\"hello world\\");";
let typingIndex = 0;

setInterval(() => {
  typingIndex = typingIndex < typingSource.length ? typingIndex + 1 : 0;
  if (typingText) typingText.textContent = typingSource.slice(0, typingIndex);
}, 80);`,
  },
  "Text Scramble Effect": {
    html: `<div>
  <p id="scrambleOutput">Frontend Developer</p>
  <button id="scrambleButton" type="button">Scramble text</button>
</div>`,
    css: `#scrambleOutput {
  font-family: monospace;
  font-size: 22px;
  letter-spacing: 0.04em;
}`,
    js: `const scrambleOutput = document.querySelector("#scrambleOutput");
const scrambleButton = document.querySelector("#scrambleButton");
const scrambleTarget = "Frontend Developer";
const scrambleChars = "!<>-_\\\\/[]{}=*?#";

const runScramble = () => {
  let frame = 0;
  const revealFrames = scrambleTarget.split("").map(() => Math.floor(Math.random() * 18) + 8);

  const update = () => {
    let nextValue = "";
    let complete = 0;

    scrambleTarget.split("").forEach((char, index) => {
      if (frame >= revealFrames[index]) {
        nextValue += char;
        complete += 1;
      } else {
        nextValue += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
    });

    if (scrambleOutput) scrambleOutput.textContent = nextValue;
    if (complete < scrambleTarget.length) {
      frame += 1;
      requestAnimationFrame(update);
    }
  };

  update();
};

scrambleButton?.addEventListener("click", runScramble);`,
  },
  "Read More Toggle": {
    html: `<p id="readMoreText" class="read-more-text">
  Frontend developer with 8+ years of experience crafting production-ready interfaces for large brands.
</p>
<button id="readMoreButton" type="button">Read more</button>`,
    css: `.read-more-text {
  max-width: 50ch;
}`,
    js: `const readMoreText = document.querySelector("#readMoreText");
const readMoreButton = document.querySelector("#readMoreButton");
const shortText = "Frontend developer with 8+ years of experience crafting production-ready interfaces for large brands.";
const longText = shortText + " Strong in performance, accessibility, design systems, and smooth interactions.";
let isExpanded = false;

readMoreButton?.addEventListener("click", () => {
  isExpanded = !isExpanded;
  if (readMoreText) readMoreText.textContent = isExpanded ? longText : shortText;
  if (readMoreButton) readMoreButton.textContent = isExpanded ? "Read less" : "Read more";
});`,
  },
  "Clipboard Copy": {
    html: `<button id="copyEmail" type="button">Copy email</button>`,
    css: `#copyEmail {
  padding: 10px 16px;
}`,
    js: `const copyEmail = document.querySelector("#copyEmail");
const email = "hello@example.com";

copyEmail?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(email);
  copyEmail.textContent = "Copied";
});`,
  },
  "Password Visibility Toggle": {
    html: `<div class="password-field">
  <input id="passwordInput" type="password" value="superSecret123" />
  <button id="togglePassword" type="button">Show</button>
</div>`,
    css: `.password-field {
  display: flex;
  gap: 8px;
}`,
    js: `const passwordInput = document.querySelector("#passwordInput");
const togglePassword = document.querySelector("#togglePassword");

togglePassword?.addEventListener("click", () => {
  const isHidden = passwordInput?.getAttribute("type") === "password";
  passwordInput?.setAttribute("type", isHidden ? "text" : "password");
  togglePassword.textContent = isHidden ? "Hide" : "Show";
});`,
  },
  "Password Strength Meter": {
    html: `<label class="field">
  <span>Password</span>
  <input id="strengthPassword" type="text" placeholder="Type a password" />
</label>
<div id="strengthLabel">Too weak</div>`,
    css: `#strengthLabel {
  margin-top: 8px;
  font-weight: 600;
}`,
    js: `const strengthPassword = document.querySelector("#strengthPassword");
const strengthLabel = document.querySelector("#strengthLabel");

const getStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];

strengthPassword?.addEventListener("input", () => {
  const score = getStrength(strengthPassword.value);
  if (strengthLabel) strengthLabel.textContent = labels[score];
});`,
  },
  "Form Validation": {
    html: `<form id="emailForm">
  <input id="emailInput" type="email" placeholder="you@example.com" />
  <button type="submit">Submit</button>
  <p id="emailFeedback"></p>
</form>`,
    css: `#emailFeedback {
  margin-top: 8px;
  font-size: 14px;
}`,
    js: `const emailForm = document.querySelector("#emailForm");
const emailInput = document.querySelector("#emailInput");
const emailFeedback = document.querySelector("#emailFeedback");
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

emailForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const isValid = emailPattern.test(emailInput?.value || "");
  if (emailFeedback) {
    emailFeedback.textContent = isValid ? "Valid email address" : "Please enter a valid email";
  }
});`,
  },
  "Debounce Function": {
    html: `<input id="debounceInput" type="text" placeholder="Search..." />
<p id="debounceOutput"></p>`,
    css: `#debounceOutput {
  margin-top: 8px;
  color: #2563eb;
}`,
    js: `const debounce = (callback, wait = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), wait);
  };
};

const debounceInput = document.querySelector("#debounceInput");
const debounceOutput = document.querySelector("#debounceOutput");

const updateOutput = debounce((value) => {
  if (debounceOutput) debounceOutput.textContent = "Debounced: " + value;
}, 400);

debounceInput?.addEventListener("input", (event) => {
  updateOutput(event.target.value);
});`,
  },
  "Throttle Function": {
    html: `<button id="throttleButton" type="button">Click fast</button>
<p id="throttleCount">0</p>`,
    css: `#throttleCount {
  font-size: 22px;
}`,
    js: `const throttle = (callback, wait = 500) => {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= wait) {
      lastRun = now;
      callback(...args);
    }
  };
};

const throttleButton = document.querySelector("#throttleButton");
const throttleCount = document.querySelector("#throttleCount");
let clicks = 0;

const countClick = throttle(() => {
  clicks += 1;
  if (throttleCount) throttleCount.textContent = String(clicks);
}, 500);

throttleButton?.addEventListener("click", countClick);`,
  },
  "Fetch API Example": {
    html: `<button id="fetchStars" type="button">Fetch React stars</button>
<pre id="fetchResult">Waiting...</pre>`,
    css: `#fetchResult {
  padding: 12px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
  white-space: pre-wrap;
}`,
    js: `const fetchStars = document.querySelector("#fetchStars");
const fetchResult = document.querySelector("#fetchResult");

fetchStars?.addEventListener("click", async () => {
  if (fetchResult) fetchResult.textContent = "Loading...";

  try {
    const response = await fetch("https://api.github.com/repos/facebook/react");
    const data = await response.json();
    if (fetchResult) fetchResult.textContent = "Stars: " + data.stargazers_count.toLocaleString();
  } catch (error) {
    if (fetchResult) fetchResult.textContent = "Request failed";
  }
});`,
  },
  "Search Filter": {
    html: `<input id="filterInput" type="text" placeholder="Search brands" />
<ul id="filterList">
  <li>Rustomjee</li>
  <li>Godrej</li>
  <li>Kotak</li>
  <li>Tata</li>
</ul>`,
    css: `#filterList {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}`,
    js: `const filterInput = document.querySelector("#filterInput");
const filterItems = [...document.querySelectorAll("#filterList li")];

filterInput?.addEventListener("input", () => {
  const query = filterInput.value.toLowerCase();
  filterItems.forEach((item) => {
    const visible = item.textContent.toLowerCase().includes(query);
    item.hidden = !visible;
  });
});`,
  },
  "Live Search": {
    html: `<input id="liveSearchInput" type="text" placeholder="Type to search" />
<ul id="liveSearchResults"></ul>`,
    css: `#liveSearchResults {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  list-style: none;
  padding: 0;
}`,
    js: `const liveSearchInput = document.querySelector("#liveSearchInput");
const liveSearchResults = document.querySelector("#liveSearchResults");
let liveSearchTimeout;

const mockSearch = (query) => [query + " result A", query + " result B", query + " result C"];

liveSearchInput?.addEventListener("input", () => {
  clearTimeout(liveSearchTimeout);
  liveSearchTimeout = setTimeout(() => {
    const results = liveSearchInput.value ? mockSearch(liveSearchInput.value) : [];
    if (!liveSearchResults) return;
    liveSearchResults.innerHTML = results.map((result) => "<li>" + result + "</li>").join("");
  }, 250);
});`,
  },
  Pagination: {
    html: `<div id="paginationInfo">Page 1</div>
<div class="pagination-actions">
  <button id="prevPage" type="button">Prev</button>
  <button id="nextPage" type="button">Next</button>
</div>`,
    css: `.pagination-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}`,
    js: `const paginationInfo = document.querySelector("#paginationInfo");
const prevPage = document.querySelector("#prevPage");
const nextPage = document.querySelector("#nextPage");
const totalPages = 6;
let currentPage = 1;

const renderPage = () => {
  if (paginationInfo) paginationInfo.textContent = "Page " + currentPage + " of " + totalPages;
};

prevPage?.addEventListener("click", () => {
  currentPage = Math.max(1, currentPage - 1);
  renderPage();
});

nextPage?.addEventListener("click", () => {
  currentPage = Math.min(totalPages, currentPage + 1);
  renderPage();
});

renderPage();`,
  },
  "Drag & Drop": {
    html: `<ul id="dragList" class="drag-list">
  <li draggable="true">Design</li>
  <li draggable="true">Build</li>
  <li draggable="true">Ship</li>
</ul>`,
    css: `.drag-list {
  display: grid;
  gap: 8px;
  list-style: none;
  padding: 0;
}

.drag-list li {
  padding: 12px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
  cursor: grab;
}`,
    js: `const dragItems = [...document.querySelectorAll("#dragList li")];
let draggedIndex = null;

dragItems.forEach((item, index) => {
  item.addEventListener("dragstart", () => {
    draggedIndex = index;
  });

  item.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  item.addEventListener("drop", () => {
    const list = document.querySelector("#dragList");
    const orderedItems = [...document.querySelectorAll("#dragList li")];
    const draggedItem = orderedItems[draggedIndex];
    if (draggedItem && list) list.insertBefore(draggedItem, orderedItems[index]);
  });
});`,
  },
  "File Upload Preview": {
    html: `<input id="fileInput" type="file" multiple />
<ul id="fileList"></ul>`,
    css: `#fileList {
  margin-top: 12px;
  list-style: none;
  padding: 0;
}`,
    js: `const fileInput = document.querySelector("#fileInput");
const fileList = document.querySelector("#fileList");

fileInput?.addEventListener("change", () => {
  const files = [...(fileInput.files || [])];
  if (!fileList) return;
  fileList.innerHTML = files
    .map((file) => "<li>" + file.name + " - " + Math.round(file.size / 1024) + " KB</li>")
    .join("");
});`,
  },
  "Image Preview Before Upload": {
    html: `<input id="imageInput" type="file" accept="image/*" />
<img id="imagePreview" alt="Preview" />`,
    css: `#imagePreview {
  display: block;
  max-width: 240px;
  margin-top: 12px;
  border-radius: 16px;
}`,
    js: `const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");

imageInput?.addEventListener("change", () => {
  const [file] = imageInput.files || [];
  if (!file || !imagePreview) return;
  imagePreview.src = URL.createObjectURL(file);
});`,
  },
  "Character Counter": {
    html: `<textarea id="tweetInput" maxlength="140"></textarea>
<p id="tweetCounter">0 / 140</p>`,
    css: `#tweetCounter {
  margin-top: 8px;
  text-align: right;
}`,
    js: `const tweetInput = document.querySelector("#tweetInput");
const tweetCounter = document.querySelector("#tweetCounter");

tweetInput?.addEventListener("input", () => {
  const length = tweetInput.value.length;
  if (tweetCounter) tweetCounter.textContent = length + " / 140";
});`,
  },
  "Countdown Timer": {
    html: `<p id="countdownValue">Loading...</p>`,
    css: `#countdownValue {
  font-size: 28px;
  font-variant-numeric: tabular-nums;
}`,
    js: `const countdownValue = document.querySelector("#countdownValue");
const countdownTarget = new Date("2027-01-01T00:00:00").getTime();

const renderCountdown = () => {
  const diff = Math.max(0, countdownTarget - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  if (countdownValue) {
    countdownValue.textContent = \`\${days}d \${String(hours).padStart(2, "0")}:\${String(minutes).padStart(2, "0")}:\${String(seconds).padStart(2, "0")}\`;
  }
};

renderCountdown();
setInterval(renderCountdown, 1000);`,
  },
  Stopwatch: {
    html: `<p id="stopwatchValue">00:00.00</p>
<div class="stopwatch-actions">
  <button id="startStopwatch" type="button">Start</button>
  <button id="pauseStopwatch" type="button">Pause</button>
  <button id="resetStopwatch" type="button">Reset</button>
</div>`,
    css: `.stopwatch-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}`,
    js: `const stopwatchValue = document.querySelector("#stopwatchValue");
const startStopwatch = document.querySelector("#startStopwatch");
const pauseStopwatch = document.querySelector("#pauseStopwatch");
const resetStopwatch = document.querySelector("#resetStopwatch");

let elapsed = 0;
let timerId = null;

const formatTime = (value) => {
  const minutes = String(Math.floor(value / 60000)).padStart(2, "0");
  const seconds = String(Math.floor(value / 1000) % 60).padStart(2, "0");
  const hundredths = String(Math.floor(value / 10) % 100).padStart(2, "0");
  return \`\${minutes}:\${seconds}.\${hundredths}\`;
};

const renderStopwatch = () => {
  if (stopwatchValue) stopwatchValue.textContent = formatTime(elapsed);
};

startStopwatch?.addEventListener("click", () => {
  if (timerId) return;
  timerId = setInterval(() => {
    elapsed += 10;
    renderStopwatch();
  }, 10);
});

pauseStopwatch?.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
});

resetStopwatch?.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  elapsed = 0;
  renderStopwatch();
});

renderStopwatch();`,
  },
  "Digital Clock": {
    html: `<p id="clockValue">--:--:--</p>`,
    css: `#clockValue {
  font-size: 32px;
  font-variant-numeric: tabular-nums;
}`,
    js: `const clockValue = document.querySelector("#clockValue");

const renderClock = () => {
  if (clockValue) clockValue.textContent = new Date().toLocaleTimeString();
};

renderClock();
setInterval(renderClock, 1000);`,
  },
  "Random Color Generator": {
    html: `<div id="colorPreview" class="color-preview"></div>
<button id="rollColor" type="button">Roll color</button>
<code id="colorValue">#22c55e</code>`,
    css: `.color-preview {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  border: 1px solid #d4d4d8;
  background: #22c55e;
}`,
    js: `const colorPreview = document.querySelector("#colorPreview");
const colorValue = document.querySelector("#colorValue");
const rollColor = document.querySelector("#rollColor");

rollColor?.addEventListener("click", () => {
  const color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  if (colorPreview) colorPreview.style.background = color;
  if (colorValue) colorValue.textContent = color;
});`,
  },
  "Random Quote Generator": {
    html: `<blockquote id="quoteText">Ship it.</blockquote>
<button id="newQuote" type="button">New quote</button>`,
    css: `#quoteText {
  font-style: italic;
  max-width: 40ch;
}`,
    js: `const quoteText = document.querySelector("#quoteText");
const newQuote = document.querySelector("#newQuote");
const quotes = [
  "Ship it.",
  "Details matter.",
  "Design in the browser.",
  "Make it work, then make it beautiful.",
];

newQuote?.addEventListener("click", () => {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (quoteText) quoteText.textContent = quote;
});`,
  },
  "UUID Generator": {
    html: `<code id="uuidValue">Click generate</code>
<button id="generateUuid" type="button">Generate UUID</button>`,
    css: `#uuidValue {
  display: block;
  margin-bottom: 12px;
  word-break: break-all;
}`,
    js: `const uuidValue = document.querySelector("#uuidValue");
const generateUuid = document.querySelector("#generateUuid");

generateUuid?.addEventListener("click", () => {
  const uuid = crypto.randomUUID();
  if (uuidValue) uuidValue.textContent = uuid;
});`,
  },
  "Event Delegation": {
    html: `<ul id="taskList">
  <li><button data-task="Design" type="button">Design</button></li>
  <li><button data-task="Build" type="button">Build</button></li>
  <li><button data-task="Ship" type="button">Ship</button></li>
</ul>`,
    css: `#taskList {
  display: grid;
  gap: 8px;
  list-style: none;
  padding: 0;
}`,
    js: `const taskList = document.querySelector("#taskList");

taskList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-task]");
  if (!button) return;
  button.classList.toggle("is-done");
  console.log("Clicked:", button.dataset.task);
});`,
  },
  "LocalStorage Form Saver": {
    html: `<textarea id="draftInput" rows="5" placeholder="Draft is saved automatically"></textarea>`,
    css: `#draftInput {
  width: 100%;
  padding: 12px;
  border: 1px solid #d4d4d8;
  border-radius: 12px;
}`,
    js: `const draftInput = document.querySelector("#draftInput");
const draftKey = "draft-message";

if (draftInput) draftInput.value = localStorage.getItem(draftKey) || "";

draftInput?.addEventListener("input", () => {
  localStorage.setItem(draftKey, draftInput.value);
});`,
  },
  "Query Params Reader": {
    html: `<input id="urlInput" value="https://example.com/?role=frontend&mode=remote" />
<pre id="paramsOutput"></pre>`,
    css: `#urlInput,
#paramsOutput {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
}`,
    js: `const urlInput = document.querySelector("#urlInput");
const paramsOutput = document.querySelector("#paramsOutput");

const renderParams = () => {
  const url = new URL(urlInput.value);
  const params = Object.fromEntries(url.searchParams.entries());
  if (paramsOutput) paramsOutput.textContent = JSON.stringify(params, null, 2);
};

urlInput?.addEventListener("input", renderParams);
renderParams();`,
  },
  "Download Text File": {
    html: `<button id="downloadFile" type="button">Download file</button>`,
    css: `#downloadFile {
  padding: 10px 16px;
  border-radius: 999px;
}`,
    js: `const downloadFile = document.querySelector("#downloadFile");

downloadFile?.addEventListener("click", () => {
  const blob = new Blob(["Hello from vanilla JS"], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "snippet-demo.txt";
  link.click();
  URL.revokeObjectURL(link.href);
});`,
  },
  "FormData to JSON": {
    html: `<form id="profileForm">
  <input name="name" placeholder="Name" />
  <input name="email" placeholder="Email" />
  <button type="submit">Serialize</button>
</form>
<pre id="formDataOutput"></pre>`,
    css: `#profileForm {
  display: grid;
  gap: 8px;
}

#formDataOutput {
  margin-top: 12px;
}`,
    js: `const profileForm = document.querySelector("#profileForm");
const formDataOutput = document.querySelector("#formDataOutput");

profileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(profileForm).entries());
  if (formDataOutput) formDataOutput.textContent = JSON.stringify(data, null, 2);
});`,
  },
  "Custom Event Bus": {
    html: `<button id="dispatchCustomEvent" type="button">Dispatch event</button>
<p id="customEventOutput">Waiting...</p>`,
    css: `#customEventOutput {
  margin-top: 12px;
  font-weight: 600;
}`,
    js: `const dispatchCustomEvent = document.querySelector("#dispatchCustomEvent");
const customEventOutput = document.querySelector("#customEventOutput");

window.addEventListener("snippet:notify", (event) => {
  if (customEventOutput) customEventOutput.textContent = event.detail;
});

dispatchCustomEvent?.addEventListener("click", () => {
  window.dispatchEvent(new CustomEvent("snippet:notify", {
    detail: "Custom event fired",
  }));
});`,
  },
  "Array Map Transformation": {
    html: `<pre id="mapOutput"></pre>`,
    css: `#mapOutput {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}`,
    js: `const mapOutput = document.querySelector("#mapOutput");
const nums = [1, 2, 3, 4];
const doubled = nums.map((num) => num * 2);

if (mapOutput) {
  mapOutput.textContent = JSON.stringify({ nums, doubled }, null, 2);
}`,
  },
  "Array Reduce Sum": {
    html: `<div>
  <p class="label">Prices</p>
  <p id="reduceOutput"></p>
</div>`,
    css: `.label {
  color: #71717a;
}

#reduceOutput {
  font-size: 32px;
  font-weight: 700;
}`,
    js: `const reduceOutput = document.querySelector("#reduceOutput");
const prices = [120, 80, 50, 30];
const total = prices.reduce((sum, price) => sum + price, 0);

if (reduceOutput) reduceOutput.textContent = String(total);`,
  },
  "Promise.all Runner": {
    html: `<button id="runPromiseAll" type="button">Run Promise.all</button>
<p id="promiseAllOutput">Idle</p>`,
    css: `#promiseAllOutput {
  margin-top: 12px;
}`,
    js: `const runPromiseAll = document.querySelector("#runPromiseAll");
const promiseAllOutput = document.querySelector("#promiseAllOutput");

const wait = (label, ms) => new Promise((resolve) => {
  setTimeout(() => resolve(label), ms);
});

runPromiseAll?.addEventListener("click", async () => {
  if (promiseAllOutput) promiseAllOutput.textContent = "Loading...";
  const result = await Promise.all([
    wait("users", 400),
    wait("posts", 650),
    wait("comments", 250),
  ]);
  if (promiseAllOutput) promiseAllOutput.textContent = result.join(", ");
});`,
  },
  "Memoized Fibonacci": {
    html: `<button id="memoFib" type="button">Memoized fib(20)</button>
<p id="memoFibOutput">Click to compute</p>`,
    css: `#memoFibOutput {
  margin-top: 12px;
  font-family: monospace;
}`,
    js: `const memoFib = document.querySelector("#memoFib");
const memoFibOutput = document.querySelector("#memoFibOutput");

const fib = (n, cache = new Map()) => {
  if (cache.has(n)) return cache.get(n);
  if (n < 2) return n;
  const result = fib(n - 1, cache) + fib(n - 2, cache);
  cache.set(n, result);
  return result;
};

memoFib?.addEventListener("click", () => {
  if (memoFibOutput) memoFibOutput.textContent = String(fib(20));
});`,
  },
  "Flatten Nested Array": {
    html: `<pre id="flatOutput"></pre>`,
    css: `#flatOutput {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}`,
    js: `const flatOutput = document.querySelector("#flatOutput");
const nested = [1, [2, 3], [4, [5, 6]]];
const flat = nested.flat(2);

if (flatOutput) {
  flatOutput.textContent = JSON.stringify({ nested, flat }, null, 2);
}`,
  },
  "Group By Property": {
    html: `<pre id="groupOutput"></pre>`,
    css: `#groupOutput {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}`,
    js: `const groupOutput = document.querySelector("#groupOutput");
const items = [
  { name: "React", type: "library" },
  { name: "Vue", type: "framework" },
  { name: "Next.js", type: "framework" },
];

const grouped = items.reduce((acc, item) => {
  (acc[item.type] ||= []).push(item);
  return acc;
}, {});

if (groupOutput) groupOutput.textContent = JSON.stringify(grouped, null, 2);`,
  },
  "Retry Async Request": {
    html: `<button id="retryDemo" type="button">Retry demo</button>
<p id="retryOutput">Not started</p>`,
    css: `#retryOutput {
  margin-top: 12px;
}`,
    js: `const retryDemo = document.querySelector("#retryDemo");
const retryOutput = document.querySelector("#retryOutput");

retryDemo?.addEventListener("click", async () => {
  let attempts = 0;

  const fakeRequest = () => new Promise((resolve, reject) => {
    attempts += 1;
    if (attempts < 3) reject(new Error("fail"));
    else resolve("success");
  });

  const retry = async (fn, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const result = await retry(fakeRequest);
  if (retryOutput) retryOutput.textContent = \`Succeeded on try \${attempts}: \${result}\`;
});`,
  },
  "Deep Clone Object": {
    html: `<pre id="cloneOutput"></pre>`,
    css: `#cloneOutput {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}`,
    js: `const cloneOutput = document.querySelector("#cloneOutput");
const original = { user: { name: "JB" }, skills: ["JS", "React"] };
const copy = structuredClone(original);
copy.user.name = "Cloned";

if (cloneOutput) {
  cloneOutput.textContent = JSON.stringify({ original, copy }, null, 2);
}`,
  },
  "Sort Objects by Key": {
    html: `<pre id="sortOutput"></pre>`,
    css: `#sortOutput {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
}`,
    js: `const sortOutput = document.querySelector("#sortOutput");
const people = [
  { name: "Zara", years: 4 },
  { name: "Aman", years: 8 },
  { name: "Riya", years: 6 },
];

const sorted = [...people].sort((a, b) => b.years - a.years);
if (sortOutput) sortOutput.textContent = JSON.stringify(sorted, null, 2);`,
  },
  "Once Function Wrapper": {
    html: `<button id="onceButton" type="button">Run once</button>
<p id="onceOutput">count: 0</p>`,
    css: `#onceOutput {
  margin-top: 12px;
  font-family: monospace;
}`,
    js: `const onceButton = document.querySelector("#onceButton");
const onceOutput = document.querySelector("#onceOutput");

const once = (fn) => {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    fn(...args);
  };
};

let count = 0;
const updateOnce = once(() => {
  count += 1;
  if (onceOutput) onceOutput.textContent = "count: " + count;
});

onceButton?.addEventListener("click", updateOnce);`,
  },
};

function getSnippetTabs(snippet: ExtraSnippet): SnippetTabs {
  const fallbackJs = `document.addEventListener("DOMContentLoaded", () => {
  ${snippet.code
    .split("\n")
    .map((line) => line || "")
    .join("\n  ")}
});`;

  return VANILLA_SNIPPETS[snippet.title] ?? {
    html: DEFAULT_HTML,
    css: DEFAULT_CSS,
    js: fallbackJs,
  };
}

/* ---------- Snippet list ---------- */
export const EXTRA_SNIPPETS: ExtraSnippet[] = [
  { title: "Smooth Scroll to Section", explain: "Native smooth scrolling to any element.", code: `document.querySelector('#target')?.scrollIntoView({ behavior: 'smooth', block: 'center' });`, demo: () => <SmoothScrollSectionDemo /> },
  { title: "Scroll To Top Button", explain: "Show a button after scrolling, then jump to top.", code: `const btn = document.querySelector('#toTop');\naddEventListener('scroll', () => btn.classList.toggle('show', scrollY > 300));\nbtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });`, demo: () => <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">↑ Top</button> },
  { title: "Sticky Navbar", explain: "CSS position:sticky keeps nav pinned during scroll.", code: `.navbar { position: sticky; top: 0; z-index: 50; }`, demo: () => <StickyNavDemo /> },
  { title: "Active Navigation Highlight", explain: "Toggle an active class based on current section.", code: `const links = document.querySelectorAll('nav a');\nlinks.forEach(l => l.onclick = () => {\n  links.forEach(x => x.classList.remove('active'));\n  l.classList.add('active');\n});`, demo: () => <ActiveNavDemo /> },
  { title: "Scroll Progress Bar", explain: "Reflect page scroll % as a horizontal bar.", code: `const bar = document.querySelector('#bar');\naddEventListener('scroll', () => {\n  const p = scrollY / (document.body.scrollHeight - innerHeight);\n  bar.style.width = (p * 100) + '%';\n});`, demo: () => <ScrollProgressDemo /> },
  { title: "Intersection Observer Animation", explain: "Animate elements when they enter the viewport.", code: `const io = new IntersectionObserver((entries) => {\n  entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view'));\n}, { threshold: 0.5 });\ndocument.querySelectorAll('.reveal').forEach(el => io.observe(el));`, demo: () => <IODemo /> },
  { title: "Lazy Image Loader", explain: "Native browser lazy loading — no JS needed.", code: `<img src="hero.jpg" loading="lazy" alt="Hero" />`, demo: () => <LazyImageDemo /> },
  { title: "Infinite Scroll", explain: "Load more items when a sentinel enters view.", code: `const io = new IntersectionObserver(([e]) => {\n  if (e.isIntersecting) loadMore();\n});\nio.observe(document.querySelector('#sentinel'));`, demo: () => <InfiniteScrollDemo /> },
  { title: "Dark / Light Theme Toggle", explain: "Toggle a `dark` class on <html>.", code: `document.documentElement.classList.toggle('dark');`, demo: () => <ThemeToggleDemo /> },
  { title: "LocalStorage Theme Saver", explain: "Persist user's theme choice across reloads.", code: `const saved = localStorage.getItem('theme');\nif (saved) document.documentElement.classList.toggle('dark', saved === 'dark');\ntoggle.onclick = () => {\n  const next = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';\n  localStorage.setItem('theme', next);\n};`, demo: () => <ThemeSaverDemo /> },
  { title: "Modal Popup", explain: "Open/close modal with backdrop click support.", code: `openBtn.onclick = () => modal.showModal();\ncloseBtn.onclick = () => modal.close();\nmodal.onclick = (e) => { if (e.target === modal) modal.close(); };`, demo: () => <ModalDemo /> },
  { title: "Toast Notification", explain: "Show a brief message with auto-dismiss.", code: `import { toast } from 'sonner';\ntoast.success('Saved!');`, demo: () => <ToastDemo /> },
  { title: "Accordion", explain: "Toggle expandable panels, one open at a time.", code: `document.querySelectorAll('.accordion button').forEach(b => b.onclick = () => {\n  b.nextElementSibling.classList.toggle('open');\n});`, demo: () => <AccordionDemo /> },
  { title: "Tabs", explain: "Switch content panels via tab buttons.", code: `tabs.forEach((t, i) => t.onclick = () => {\n  tabs.forEach(x => x.classList.remove('active'));\n  panels.forEach(x => x.classList.remove('active'));\n  t.classList.add('active');\n  panels[i].classList.add('active');\n});`, demo: () => <TabsDemo /> },
  { title: "Dropdown Menu", explain: "Toggle a menu, close on outside click.", code: `btn.onclick = () => menu.classList.toggle('open');\ndocument.addEventListener('click', (e) => {\n  if (!btn.contains(e.target)) menu.classList.remove('open');\n});`, demo: () => <DropdownDemo /> },
  { title: "Offcanvas Sidebar", explain: "Slide-in sidebar with dim backdrop.", code: `openBtn.onclick = () => sidebar.classList.add('open');\nbackdrop.onclick = () => sidebar.classList.remove('open');`, demo: () => <OffcanvasDemo /> },
  { title: "Mobile Hamburger Menu", explain: "Show/hide nav on small screens.", code: `hamburger.onclick = () => nav.classList.toggle('open');`, demo: () => <HamburgerDemo /> },
  { title: "Image Slider", explain: "Manual slider with dot indicators.", code: `let i = 0;\ndots.forEach((d, k) => d.onclick = () => { i = k; slide.src = images[i]; });`, demo: () => <SliderDemo /> },
  { title: "Auto Carousel", explain: "Auto-advance items on an interval.", code: `let i = 0; setInterval(() => {\n  i = (i + 1) % items.length;\n  el.textContent = items[i];\n}, 1500);`, demo: () => <AutoCarouselDemo /> },
  { title: "Counter Animation", explain: "Animate a number to a target on click.", code: `let n = 0; const id = setInterval(() => {\n  n += 5; el.textContent = n;\n  if (n >= 500) clearInterval(id);\n}, 15);`, demo: () => <CounterAnimDemo /> },
  { title: "Number Count Up", explain: "Smooth easing with requestAnimationFrame.", code: `let start = performance.now();\nrequestAnimationFrame(function step(t) {\n  const p = Math.min(1, (t - start) / 1500);\n  el.textContent = Math.round(p * target);\n  if (p < 1) requestAnimationFrame(step);\n});`, demo: () => <NumberCountUpDemo /> },
  { title: "Typing Effect", explain: "Reveal text one character at a time.", code: `let i = 0; setInterval(() => {\n  el.textContent = text.slice(0, ++i);\n  if (i > text.length) i = 0;\n}, 80);`, demo: () => <TypingEffectDemo /> },
  { title: "Text Scramble Effect", explain: "Randomize characters, then settle on target.", code: `// Each character gets a random reveal frame\n// See demo source for the full 20-line algorithm.`, demo: () => <ScrambleDemo /> },
  { title: "Read More Toggle", explain: "Expand/collapse long text blocks.", code: `btn.onclick = () => {\n  el.classList.toggle('open');\n  btn.textContent = el.classList.contains('open') ? 'less' : 'more';\n};`, demo: () => <ReadMoreDemo /> },
  { title: "Clipboard Copy", explain: "Async Clipboard API — modern & secure.", code: `await navigator.clipboard.writeText(text);`, demo: () => <ClipboardCopyDemo /> },
  { title: "Password Visibility Toggle", explain: "Swap input type between password and text.", code: `btn.onclick = () => {\n  input.type = input.type === 'password' ? 'text' : 'password';\n};`, demo: () => <PasswordVisibilityDemo /> },
  { title: "Password Strength Meter", explain: "Score password against length + variety rules.", code: `function score(pw) {\n  let s = 0;\n  if (pw.length >= 8) s++;\n  if (/[A-Z]/.test(pw)) s++;\n  if (/\\d/.test(pw)) s++;\n  if (/[^A-Za-z0-9]/.test(pw)) s++;\n  return s; // 0..4\n}`, demo: () => <PasswordStrengthDemo /> },
  { title: "Form Validation", explain: "Regex-based email validator with live feedback.", code: `const valid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);`, demo: () => <FormValidationDemo /> },
  { title: "Debounce Function", explain: "Delay a function until N ms after the last call.", code: `function debounce(fn, wait = 300) {\n  let t;\n  return (...a) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...a), wait);\n  };\n}`, demo: () => <DebounceSnippetDemo /> },
  { title: "Throttle Function", explain: "Run a function at most once every N ms.", code: `function throttle(fn, wait = 300) {\n  let last = 0;\n  return (...a) => {\n    const now = Date.now();\n    if (now - last >= wait) { last = now; fn(...a); }\n  };\n}`, demo: () => <ThrottleSnippetDemo /> },
  { title: "Fetch API Example", explain: "GET JSON from an API with async/await.", code: `const r = await fetch('https://api.github.com/repos/facebook/react');\nconst data = await r.json();\nconsole.log(data.stargazers_count);`, demo: () => <FetchDemo /> },
  { title: "Search Filter", explain: "Client-side filter with .filter() + includes().", code: `const filtered = items.filter(i => i.toLowerCase().includes(q.toLowerCase()));`, demo: () => <SearchFilterDemo /> },
  { title: "Live Search", explain: "Debounced search that queries as you type.", code: `let t; input.oninput = () => {\n  clearTimeout(t);\n  t = setTimeout(() => search(input.value), 250);\n};`, demo: () => <LiveSearchDemo /> },
  { title: "Pagination", explain: "Render page controls and slice current items.", code: `const start = (page - 1) * perPage;\nconst pageItems = items.slice(start, start + perPage);`, demo: () => <PaginationDemo /> },
  { title: "Drag & Drop", explain: "HTML5 drag events for a reorderable list.", code: `let from;\nlist.querySelectorAll('li').forEach((li, i) => {\n  li.draggable = true;\n  li.ondragstart = () => from = i;\n  li.ondragover = e => e.preventDefault();\n  li.ondrop = () => reorder(from, i);\n});`, demo: () => <DragDropDemo /> },
  { title: "File Upload Preview", explain: "Read multi-file input into a list with sizes.", code: `input.onchange = () => {\n  [...input.files].forEach(f => console.log(f.name, f.size));\n};`, demo: () => <FileUploadPreviewDemo /> },
  { title: "Image Preview Before Upload", explain: "Use URL.createObjectURL for instant preview.", code: `input.onchange = () => {\n  img.src = URL.createObjectURL(input.files[0]);\n};`, demo: () => <ImagePreviewDemo /> },
  { title: "Character Counter", explain: "Enforce & display a max-length count.", code: `textarea.oninput = () => counter.textContent = textarea.value.length + '/140';`, demo: () => <CharCounterDemo /> },
  { title: "Countdown Timer", explain: "Count down d/h/m/s to a target date.", code: `setInterval(() => {\n  const diff = target - Date.now();\n  const d = Math.floor(diff / 864e5);\n  const h = Math.floor(diff / 36e5) % 24;\n  const m = Math.floor(diff / 6e4) % 60;\n  const s = Math.floor(diff / 1e3) % 60;\n  el.textContent = \`\${d}d \${h}:\${m}:\${s}\`;\n}, 1000);`, demo: () => <CountdownTimerDemo /> },
  { title: "Stopwatch", explain: "Start / pause / reset with millisecond accuracy.", code: `let ms = 0, id;\nstart.onclick = () => id = setInterval(() => el.textContent = ++ms, 10);\npause.onclick = () => clearInterval(id);\nreset.onclick = () => { ms = 0; el.textContent = 0; };`, demo: () => <StopwatchDemo /> },
  { title: "Digital Clock", explain: "Live time updated every second.", code: `setInterval(() => el.textContent = new Date().toLocaleTimeString(), 1000);`, demo: () => <ClockDemo /> },
  { title: "Random Color Generator", explain: "Random hex color one-liner.", code: `'#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');`, demo: () => <RandomColorGenDemo /> },
  { title: "Random Quote Generator", explain: "Pick a random quote from an array.", code: `el.textContent = quotes[Math.floor(Math.random() * quotes.length)];`, demo: () => <RandomQuoteDemo /> },
  { title: "UUID Generator", explain: "Native crypto.randomUUID() — no library needed.", code: `const id = crypto.randomUUID();`, demo: () => <UuidDemo /> },
  { title: "Event Delegation", explain: "Use one parent listener to handle many child actions.", code: `list.addEventListener("click", (event) => {\n  const button = event.target.closest("[data-task]");\n  if (!button) return;\n  button.classList.toggle("is-done");\n});`, demo: () => <EventDelegationDemo /> },
  { title: "LocalStorage Form Saver", explain: "Autosave a draft locally while the user types.", code: `const key = "draft-message";\ninput.value = localStorage.getItem(key) || "";\ninput.addEventListener("input", () => {\n  localStorage.setItem(key, input.value);\n});`, demo: () => <LocalStorageFormDemo /> },
  { title: "Query Params Reader", explain: "Read URL search params as a plain object.", code: `const url = new URL("https://example.com/?role=frontend&mode=remote");\nconst params = Object.fromEntries(url.searchParams.entries());`, demo: () => <QueryParamsDemo /> },
  { title: "Download Text File", explain: "Generate a text file and download it in the browser.", code: `const blob = new Blob(["Hello from vanilla JS"], { type: "text/plain" });\nconst link = document.createElement("a");\nlink.href = URL.createObjectURL(blob);\nlink.download = "snippet-demo.txt";\nlink.click();`, demo: () => <DownloadFileDemo /> },
  { title: "FormData to JSON", explain: "Serialize form fields into a clean JSON-ready object.", code: `form.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const data = Object.fromEntries(new FormData(form).entries());\n  console.log(data);\n});`, demo: () => <FormDataDemo /> },
  { title: "Custom Event Bus", explain: "Dispatch and subscribe to your own browser events.", code: `window.addEventListener("snippet:notify", (event) => {\n  console.log(event.detail);\n});\nwindow.dispatchEvent(new CustomEvent("snippet:notify", {\n  detail: "Custom event fired",\n}));`, demo: () => <CustomEventDemo /> },
  { title: "Array Map Transformation", explain: "A common interview starter for transforming arrays immutably.", code: `const nums = [1, 2, 3, 4];\nconst doubled = nums.map((num) => num * 2);`, demo: () => <ArrayMapDemo /> },
  { title: "Array Reduce Sum", explain: "Use reduce to aggregate values into a single result.", code: `const prices = [120, 80, 50, 30];\nconst total = prices.reduce((sum, price) => sum + price, 0);`, demo: () => <ArrayReduceDemo /> },
  { title: "Promise.all Runner", explain: "Resolve multiple async tasks in parallel.", code: `const result = await Promise.all([\n  fetchUsers(),\n  fetchPosts(),\n  fetchComments(),\n]);`, demo: () => <PromiseAllDemo /> },
  { title: "Memoized Fibonacci", explain: "Show memoization with a recursive function and cache.", code: `const fib = (n, cache = new Map()) => {\n  if (cache.has(n)) return cache.get(n);\n  if (n < 2) return n;\n  const result = fib(n - 1, cache) + fib(n - 2, cache);\n  cache.set(n, result);\n  return result;\n};`, demo: () => <MemoizeDemo /> },
  { title: "Flatten Nested Array", explain: "Flatten nested arrays using modern JavaScript.", code: `const nested = [1, [2, 3], [4, [5, 6]]];\nconst flat = nested.flat(2);`, demo: () => <FlattenArrayDemo /> },
  { title: "Group By Property", explain: "Group arrays of objects by a property key.", code: `const grouped = items.reduce((acc, item) => {\n  (acc[item.type] ||= []).push(item);\n  return acc;\n}, {});`, demo: () => <GroupByDemo /> },
  { title: "Retry Async Request", explain: "Wrap flaky async calls with a retry helper.", code: `const retry = async (fn, maxRetries = 3) => {\n  let lastError;\n  for (let i = 0; i < maxRetries; i += 1) {\n    try {\n      return await fn();\n    } catch (error) {\n      lastError = error;\n    }\n  }\n  throw lastError;\n};`, demo: () => <RetryFetchDemo /> },
  { title: "Deep Clone Object", explain: "Use structuredClone for safe deep copies.", code: `const original = { user: { name: "JB" }, skills: ["JS", "React"] };\nconst copy = structuredClone(original);`, demo: () => <DeepCloneDemo /> },
  { title: "Sort Objects by Key", explain: "Sort object arrays by a numeric property.", code: `const sorted = [...people].sort((a, b) => b.years - a.years);`, demo: () => <SortObjectsDemo /> },
  { title: "Once Function Wrapper", explain: "Create a helper that only allows a callback once.", code: `const once = (fn) => {\n  let called = false;\n  return (...args) => {\n    if (called) return;\n    called = true;\n    fn(...args);\n  };\n};`, demo: () => <OnceFunctionDemo /> },
  { title: "Closure Counter", explain: "Classic interview example for closures retaining private state.", code: `const createCounter = () => {\n  let count = 0;\n  return () => ++count;\n};\nconst counter = createCounter();`, demo: () => <ClosureCounterDemo /> },
  { title: "Currying Function", explain: "Convert multi-argument logic into chained unary functions.", code: `const add = (a) => (b) => a + b;\nconst add5 = add(5);\nconsole.log(add5(3));`, demo: () => <CurryingDemo /> },
  { title: "Pipe Function", explain: "Compose small functions left-to-right for cleaner transformations.", code: `const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);\nconst result = pipe(add2, times3, minus1)(4);`, demo: () => <PipeComposeDemo /> },
  { title: "Binary Search", explain: "Efficiently search sorted arrays in O(log n).", code: `let left = 0;\nlet right = arr.length - 1;\nwhile (left <= right) {\n  const mid = Math.floor((left + right) / 2);\n  if (arr[mid] === target) return mid;\n  if (arr[mid] < target) left = mid + 1;\n  else right = mid - 1;\n}`, demo: () => <BinarySearchDemo /> },
  { title: "Tree DFS Traversal", explain: "Depth-first recursion over nested node structures.", code: `const dfs = (node) => {\n  result.push(node.value);\n  node.children.forEach(dfs);\n};`, demo: () => <TreeTraversalDemo /> },
  { title: "Event Loop Order", explain: "Show sync code, microtasks, and macrotasks execution order.", code: `console.log("script start");\nPromise.resolve().then(() => console.log("microtask"));\nsetTimeout(() => console.log("macrotask"), 0);\nconsole.log("script end");`, demo: () => <EventLoopDemo /> },
  { title: "Array.map Polyfill Idea", explain: "Understand how mapping works internally using iteration.", code: `const mapped = arr.reduce((acc, item) => {\n  acc.push(item * 2);\n  return acc;\n}, []);`, demo: () => <PolyfillMapDemo /> },
  { title: "Function.bind Example", explain: "Lock a function's `this` context and preset arguments.", code: `function greet(role) {\n  return \`Hi, I'm \${this.name} the \${role}\`;\n}\nconst bound = greet.bind(person, "developer");`, demo: () => <PolyfillBindDemo /> },
  { title: "Call / Apply / Bind", explain: "Compare the three core ways to control function context.", code: `intro.call(person, "Mumbai");\nintro.apply(person, ["Pune"]);\nintro.bind(person, "Delhi")();`, demo: () => <CallApplyBindDemo /> },
  { title: "Tiny LRU Cache", explain: "Useful interview pattern using Map insertion order.", code: `const cache = new Map();\nif (cache.has(key)) cache.delete(key);\ncache.set(key, value);\nif (cache.size > limit) cache.delete(cache.keys().next().value);`, demo: () => <LruCacheDemo /> },
];

export function SnippetsGallery() {
  const [q, setQ] = useState("");
  const [section, setSection] = useState<SnippetSection>("all");

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return EXTRA_SNIPPETS.filter((snippet) => {
      const matchesQuery = (snippet.title + " " + snippet.explain).toLowerCase().includes(query);
      if (!matchesQuery) return false;
      if (section === "all") return true;
      if (section === "interview-prep") return isInterviewSnippet(snippet.title);
      return !isInterviewSnippet(snippet.title);
    });
  }, [q, section]);

  const readyMadeCount = EXTRA_SNIPPETS.filter((snippet) => !isInterviewSnippet(snippet.title)).length;
  const interviewCount = EXTRA_SNIPPETS.filter((snippet) => isInterviewSnippet(snippet.title)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-accent/5 px-4 py-3 text-sm text-muted-foreground">
        Every snippet includes <span className="font-medium text-foreground">vanilla HTML</span>, <span className="font-medium text-foreground">CSS</span>, and <span className="font-medium text-foreground">ES6 JavaScript</span>.
      </div>
      <div className="flex flex-wrap gap-2">
        {([
          { id: "all", label: `All (${EXTRA_SNIPPETS.length})` },
          { id: "ready-made", label: `Ready-made (${readyMadeCount})` },
          { id: "interview-prep", label: `Interview Prep (${interviewCount})` },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={
              "rounded-full border px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest transition " +
              (section === tab.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${EXTRA_SNIPPETS.length} snippets…`} className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm" />
        <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">{filtered.length}</span>
      </div>
      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.title} className="flex h-full min-h-[620px] flex-col rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-base font-semibold">{s.title}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.explain}</p>
              </div>
              <Copier text={s.code} />
            </div>
            <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-border bg-background/50 p-5">{s.demo()}</div>
            <SnippetCodeTabs snippets={getSnippetTabs(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}
