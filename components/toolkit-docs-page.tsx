"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  Copy,
  ExternalLink,
  Layers3,
  MousePointerClick,
  PanelLeft,
  PanelRight,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  TOOLKIT_CATEGORY_ORDER,
  TOOLKIT_DOCS,
  type ToolkitDoc,
  type ToolkitCategory,
  getToolkitDescription,
} from "@/lib/toolkit-content";
import { ToolkitToolRenderer } from "@/app/toolkit/_source";

function groupByCategory() {
  const grouped = new Map<ToolkitCategory, ToolkitDoc[]>();
  for (const category of TOOLKIT_CATEGORY_ORDER) grouped.set(category, []);
  for (const tool of TOOLKIT_DOCS) grouped.get(tool.category)?.push(tool);
  return grouped;
}

function getToolPurpose(tool: ToolkitDoc) {
  switch (tool.category) {
    case "CSS":
      return `${tool.name} helps you generate, test, and copy CSS faster without manually tweaking values in the browser over and over.`;
    case "Layout":
      return `${tool.name} helps you understand layout behavior visually, so you can build sections, containers, and alignment patterns with less trial and error.`;
    case "JavaScript":
      return `${tool.name} is useful when you need frontend logic, data conversion, or browser-side code output that you can test and reuse quickly.`;
    case "Color":
      return `${tool.name} helps you pick, compare, and validate color combinations for cleaner UI design and better accessibility.`;
    case "Typography":
      return `${tool.name} helps you tune text, scale, and type decisions so the UI feels more polished and readable.`;
    case "Responsive":
      return `${tool.name} is for checking how interfaces adapt across devices, widths, and breakpoints before you ship them.`;
    case "Components":
      return `${tool.name} gives you practical UI building blocks and patterns you can reuse while building frontend screens faster.`;
    case "Wow":
      return `${tool.name} is best for visual polish, branded sections, and more expressive UI details that make a page feel finished.`;
    default:
      return `${tool.name} is a practical frontend utility that helps you generate output faster and avoid repetitive manual work.`;
  }
}

function getToolSteps(tool: ToolkitDoc) {
  if (tool.category === "JavaScript") {
    return [
      "Paste code, JSON, markup, or the input the tool needs.",
      "Adjust the options and watch the output update live.",
      "Copy the generated code and drop it into your project.",
    ];
  }

  if (tool.category === "Responsive" || tool.category === "Layout") {
    return [
      "Choose the layout, viewport, or sizing controls you want to test.",
      "Use the live preview to inspect spacing, alignment, and structure.",
      "Copy the generated CSS or use the preview as a build reference.",
    ];
  }

  if (tool.category === "Color") {
    return [
      "Pick your base colors or enter the values you want to test.",
      "Review the preview, contrast, or suggested combinations.",
      "Copy the final color values once the pairing looks right.",
    ];
  }

  if (tool.category === "Components") {
    return [
      "Choose the pattern or placeholder style you want.",
      "Preview how it looks before adding it to your UI.",
      "Copy the markup, CSS, or output and adapt it inside your app.",
    ];
  }

  return [
    "Add your input, upload a file, or pick the values you want to work with.",
    "Adjust the controls until the live preview matches what you need.",
    "Copy or download the final output and use it in your project.",
  ];
}

function getToolResult(tool: ToolkitDoc) {
  switch (tool.category) {
    case "JavaScript":
      return "Copy-ready frontend code, transformed data, or browser-friendly output.";
    case "Layout":
      return "A clearer layout decision plus reusable CSS for production.";
    case "Responsive":
      return "A better sense of how your UI behaves across devices and widths.";
    case "Color":
      return "Safer, cleaner color choices you can use directly in the interface.";
    case "Components":
      return "Reusable UI patterns and placeholders you can plug into a screen fast.";
    default:
      return "Live preview plus output you can copy, reuse, or export immediately.";
  }
}

function getToolAccent(tool: ToolkitDoc) {
  switch (tool.category) {
    case "CSS":
      return "from-sky-500/20 via-cyan-500/10 to-transparent";
    case "Layout":
      return "from-emerald-500/20 via-teal-500/10 to-transparent";
    case "JavaScript":
      return "from-amber-500/20 via-orange-500/10 to-transparent";
    case "Color":
      return "from-rose-500/20 via-fuchsia-500/10 to-transparent";
    case "Typography":
      return "from-violet-500/20 via-indigo-500/10 to-transparent";
    case "Responsive":
      return "from-blue-500/20 via-sky-500/10 to-transparent";
    case "Components":
      return "from-lime-500/20 via-emerald-500/10 to-transparent";
    default:
      return "from-foreground/10 via-foreground/5 to-transparent";
  }
}

export function ToolkitDocsPage({ tool }: { tool: ToolkitDoc }) {
  const grouped = groupByCategory();
  const index = TOOLKIT_DOCS.findIndex((item) => item.id === tool.id);
  const prev = index > 0 ? TOOLKIT_DOCS[index - 1] : null;
  const next = index < TOOLKIT_DOCS.length - 1 ? TOOLKIT_DOCS[index + 1] : null;
  const steps = getToolSteps(tool);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "tool" | "usage">("overview");
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightRailOpen, setRightRailOpen] = useState(true);
  const relatedTools = useMemo(
    () => TOOLKIT_DOCS.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 3),
    [tool.category, tool.id],
  );
  const randomTool = useMemo(
    () => TOOLKIT_DOCS.find((item) => item.id !== tool.id && item.category !== tool.category) ?? TOOLKIT_DOCS.find((item) => item.id !== tool.id) ?? tool,
    [tool],
  );
  const accent = getToolAccent(tool);

  useEffect(() => {
    const sections = ["overview", "tool", "usage"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const current = sections.findLast((section) => section.getBoundingClientRect().top <= 160);
      if (current && (current.id === "overview" || current.id === "tool" || current.id === "usage")) {
        setActiveSection(current.id);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tool.id]);

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const jumpToSection = (id: "overview" | "tool" | "usage") => (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <Link href="/toolkit" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card/70 px-4 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Toolkit
            </Link>
            <div className="hidden min-w-0 items-center gap-3 md:flex">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-card/70 text-accent">
                <Wand2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{tool.category} tool page</div>
                <div className="truncate text-sm font-semibold text-foreground">{tool.name}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void copyLink()}
              className="hidden h-11 items-center gap-2 rounded-full border border-border bg-card/70 px-4 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground md:inline-flex"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a href="mailto:jaybaheliya@gmail.com" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] transition hover:opacity-90">
              Hire me
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] overflow-x-clip pt-[73px] lg:flex">
        <div className="border-b border-border px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{tool.category}</div>
              <div className="mt-1 line-clamp-2 pr-2 text-lg font-semibold text-foreground">{tool.name}</div>
            </div>
            <button onClick={() => void copyLink()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/toolkit" className="shrink-0 rounded-full border border-border px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              All tools
            </Link>
            {relatedTools.map((item) => (
              <Link key={item.id} href={`/toolkit/${item.id}`} className="truncate rounded-full border border-border px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <aside
          className="relative hidden shrink-0 border-r border-border/70 transition-[width] duration-300 ease-out lg:block"
          style={{ width: leftRailOpen ? 300 : 44 }}
        >
          <div
            className={
              "fixed top-[65px] left-[max(0px,calc((100vw-1800px)/2))] z-30 h-[calc(100vh-65px)] overflow-y-auto border-r border-border/70 bg-background/95 px-5 py-6 shadow-[18px_0_50px_-42px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 ease-out " +
              (leftRailOpen ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0 pointer-events-none")
            }
            style={{ width: 300 }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {[Boxes, Layers3, Wand2].map((Icon, index) => (
                  <div key={index} className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setLeftRailOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                aria-label="Hide left navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Frontend Toolkit</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{TOOLKIT_DOCS.length} tool pages</div>
              <p className="mt-2 text-sm text-muted-foreground">Every utility can now live on its own route, which is much better for discovery, sharing, and search.</p>
            </div>
            <div className="mb-5 rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Quick Actions</div>
              <div className="mt-3 space-y-2">
                <a href="#tool" onClick={jumpToSection("tool")} className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground">
                  <MousePointerClick className="h-4 w-4" /> Jump to live tool
                </a>
                <a href="#usage" onClick={jumpToSection("usage")} className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground">
                  <Layers3 className="h-4 w-4" /> View steps
                </a>
              </div>
            </div>
            <nav className="space-y-6">
              {TOOLKIT_CATEGORY_ORDER.map((category) => {
                const items = grouped.get(category) || [];
                if (!items.length) return null;
                return (
                  <div key={category}>
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{category}</div>
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/toolkit/${item.id}`}
                          className={
                            "block rounded-xl px-3 py-2 text-sm transition " +
                            (item.id === tool.id
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground")
                          }
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {!leftRailOpen && (
          <button
            onClick={() => setLeftRailOpen(true)}
            className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-background/96 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground shadow-[0_18px_48px_-24px_rgba(15,23,42,0.42)] backdrop-blur-xl transition hover:border-foreground/30 hover:text-foreground lg:inline-flex"
            aria-label="Show left navigation"
          >
            <PanelLeft className="h-4 w-4 rotate-180" />
            Browse
          </button>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 pb-36 md:px-8 md:py-8 md:pb-32 lg:px-10 lg:pb-8 xl:px-12">
          <div className="w-full max-w-none">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{tool.category}</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{tool.name}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{getToolkitDescription(tool)}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => void copyLink()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy link"}
              </button>
              <Link href={`/toolkit/${randomTool.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Random tool
              </Link>
              <a href="#tool" onClick={jumpToSection("tool")} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
                Try it now
              </a>
            </div>

            <div className="mt-8 overflow-hidden rounded-[32px] border border-border bg-card">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
                <div className="relative overflow-hidden p-6 md:p-8">
                  <div className={"absolute inset-0 bg-gradient-to-br " + accent} />
                  <div className="relative">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Visual Guide</div>
                    <div className="mt-3 max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
                      A cleaner, more guided way to use <span className="text-accent">{tool.name}</span>.
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                      The left rail keeps navigation nearby, the right rail keeps your reading position visible, and the live tool stays front and center once you are ready to use it.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Category</div>
                        <div className="mt-2 text-sm font-semibold">{tool.category}</div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Mode</div>
                        <div className="mt-2 text-sm font-semibold">Interactive docs</div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Route</div>
                        <div className="mt-2 text-sm font-semibold font-mono">/{tool.id}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative border-t border-border lg:border-l lg:border-t-0">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(127,127,127,0.04),transparent)]" />
                  <div className="relative flex h-full items-center justify-center p-6 md:p-8">
                    <svg viewBox="0 0 420 300" className="h-full w-full max-w-[360px] text-accent" aria-hidden="true">
                      <defs>
                        <linearGradient id="toolkitDocVector" x1="0%" x2="100%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <rect x="28" y="28" width="364" height="244" rx="28" fill="url(#toolkitDocVector)" />
                      <rect x="56" y="56" width="308" height="188" rx="22" fill="none" stroke="currentColor" strokeOpacity="0.24" />
                      <rect x="80" y="80" width="96" height="96" rx="24" fill="currentColor" fillOpacity="0.08" />
                      <rect x="194" y="82" width="144" height="18" rx="9" fill="currentColor" fillOpacity="0.16" />
                      <rect x="194" y="114" width="118" height="14" rx="7" fill="currentColor" fillOpacity="0.1" />
                      <rect x="80" y="196" width="256" height="18" rx="9" fill="currentColor" fillOpacity="0.12" />
                      <circle cx="118" cy="118" r="22" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="10" />
                      <path d="M246 214h84" stroke="currentColor" strokeOpacity="0.32" strokeWidth="10" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <a href="#overview" onClick={jumpToSection("overview")} className={"rounded-2xl border p-4 transition " + (activeSection === "overview" ? "border-foreground/40 bg-muted/60" : "border-border bg-card hover:bg-muted/30")}>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Start Here</div>
                <div className="mt-2 text-sm font-semibold text-foreground">What this tool does</div>
              </a>
              <a href="#tool" onClick={jumpToSection("tool")} className={"rounded-2xl border p-4 transition " + (activeSection === "tool" ? "border-foreground/40 bg-muted/60" : "border-border bg-card hover:bg-muted/30")}>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Interactive</div>
                <div className="mt-2 text-sm font-semibold text-foreground">Open the live tool</div>
              </a>
              <a href="#usage" onClick={jumpToSection("usage")} className={"rounded-2xl border p-4 transition " + (activeSection === "usage" ? "border-foreground/40 bg-muted/60" : "border-border bg-card hover:bg-muted/30")}>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Guide</div>
                <div className="mt-2 text-sm font-semibold text-foreground">Follow the steps</div>
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">What It Does</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{getToolPurpose(tool)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">How To Use</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{steps[0]} Then {steps[1].charAt(0).toLowerCase() + steps[1].slice(1)}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">What You Get</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{getToolResult(tool)}</div>
              </div>
            </div>

            <section id="overview" className="mt-16 scroll-mt-24">
              <h2 className="text-2xl font-semibold md:text-3xl">What This Tool Does</h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground">
                <p>
                  {getToolPurpose(tool)}
                </p>
                <p>
                  If you are not sure where to start, use the live controls below, watch the preview change, and copy the result only when it matches what you want in your project.
                </p>
              </div>
            </section>

            <section id="tool" className="mt-16 scroll-mt-24">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-semibold md:text-3xl">Live Tool</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Interactive, client-side, and still running directly inside this docs page.</p>
                </div>
                <Link href="/toolkit" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:border-foreground/30 hover:text-foreground">
                  All tools <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-[28px] border border-border bg-card p-4 md:p-6">
                <ToolkitToolRenderer id={tool.id} />
              </div>
            </section>

            <section id="usage" className="mt-16 scroll-mt-24">
              <h2 className="text-2xl font-semibold md:text-3xl">How To Use It</h2>
              <div className="mt-5 rounded-3xl border border-border bg-card p-5 md:p-6">
                <ol className="space-y-4 text-base leading-8 text-muted-foreground">
                  {steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-4">
                      <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-mono text-foreground">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {relatedTools.length > 0 && (
              <section className="mt-16">
                <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold md:text-3xl">Related Tools</h2>
                    <p className="mt-2 text-sm text-muted-foreground">More tools from the same category, so you can keep moving without going back to the full index.</p>
                  </div>
                  <Link href="/toolkit" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:border-foreground/30 hover:text-foreground">
                    Browse all <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {relatedTools.map((item) => (
                    <Link key={item.id} href={`/toolkit/${item.id}`} className="rounded-2xl border border-border bg-card p-4 transition hover:border-foreground/30 hover:bg-muted/30">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{item.category}</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">{item.name}</div>
                      <div className="mt-3 text-sm text-muted-foreground">{getToolResult(item)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-20 grid gap-4 border-t border-border pt-8 md:grid-cols-2">
              {prev ? (
                <Link href={`/toolkit/${prev.id}`} className="rounded-2xl border border-border bg-card p-4 transition hover:border-foreground/30 hover:bg-muted/40">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Previous</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-foreground"><ArrowLeft className="h-4 w-4" /> {prev.name}</div>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/toolkit/${next.id}`} className="rounded-2xl border border-border bg-card p-4 text-right transition hover:border-foreground/30 hover:bg-muted/40">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Next</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-foreground">{next.name} <ArrowRight className="h-4 w-4" /></div>
                </Link>
              ) : <div />}
            </div>
          </div>
        </main>

        <aside
          className="relative hidden shrink-0 border-l border-border/70 transition-[width] duration-300 ease-out xl:block"
          style={{ width: rightRailOpen ? 260 : 44 }}
        >
          <div
            className={
              "fixed top-[65px] right-[max(0px,calc((100vw-1800px)/2))] z-30 h-[calc(100vh-65px)] overflow-y-auto border-l border-border/70 bg-background/95 px-6 py-8 shadow-[-18px_0_50px_-42px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 ease-out " +
              (rightRailOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0 pointer-events-none")
            }
            style={{ width: 260 }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {[Sparkles, Copy, ExternalLink].map((Icon, index) => (
                  <div key={index} className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setRightRailOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                aria-label="Hide right navigation"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm font-semibold text-foreground">On this page</div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <a href="#overview" onClick={jumpToSection("overview")} className={"block transition hover:text-foreground " + (activeSection === "overview" ? "text-foreground" : "")}>Overview</a>
              <a href="#tool" onClick={jumpToSection("tool")} className={"block transition hover:text-foreground " + (activeSection === "tool" ? "text-foreground" : "")}>Live tool</a>
              <a href="#usage" onClick={jumpToSection("usage")} className={"block transition hover:text-foreground " + (activeSection === "usage" ? "text-foreground" : "")}>Usage notes</a>
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Quick Route</div>
              <div className="mt-2 text-sm font-mono text-foreground">/toolkit/{tool.id}</div>
              <div className="mt-3 text-sm text-muted-foreground">Use the quick actions above to copy this link or jump into another tool without leaving the docs flow.</div>
            </div>
          </div>
        </aside>

        {!rightRailOpen && (
          <button
            onClick={() => setRightRailOpen(true)}
            className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-background/96 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground shadow-[0_18px_48px_-24px_rgba(15,23,42,0.42)] backdrop-blur-xl transition hover:border-foreground/30 hover:text-foreground xl:inline-flex"
            aria-label="Show right navigation"
          >
            Page Nav
            <PanelRight className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-3 z-40 px-3 pb-[env(safe-area-inset-bottom,0px)] pt-3 lg:hidden">
        <div className="mx-auto max-w-[min(100%,22rem)] rounded-[26px] border border-border bg-background/96 p-2 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.38)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border/70 bg-card/70 px-3 py-2">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Quick nav</div>
              <div className="truncate text-sm font-semibold text-foreground">{tool.name}</div>
            </div>
            <div className="rounded-full border border-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              {tool.category}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <a href="#overview" onClick={jumpToSection("overview")} className={"rounded-2xl px-2 py-2.5 text-center text-[10px] font-mono uppercase tracking-widest transition " + (activeSection === "overview" ? "bg-foreground text-background" : "border border-border bg-background/70 text-muted-foreground")}>
              Overview
            </a>
            <a href="#tool" onClick={jumpToSection("tool")} className={"rounded-2xl px-2 py-2.5 text-center text-[10px] font-mono uppercase tracking-widest transition " + (activeSection === "tool" ? "bg-foreground text-background" : "border border-border bg-background/70 text-muted-foreground")}>
              Tool
            </a>
            <a href="#usage" onClick={jumpToSection("usage")} className={"rounded-2xl px-2 py-2.5 text-center text-[10px] font-mono uppercase tracking-widest transition " + (activeSection === "usage" ? "bg-foreground text-background" : "border border-border bg-background/70 text-muted-foreground")}>
              Steps
            </a>
            <Link href="/toolkit" className="rounded-2xl border border-border bg-background/70 px-2 py-2.5 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
