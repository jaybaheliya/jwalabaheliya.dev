"use client";
import Link from "next/link";
import { useDeferredValue, useEffect, useId, useMemo, useReducer, useRef, useState, useTransition } from "react";
import { resolveToolkitId } from "@/lib/toolkit-content";
import {
  ArrowLeft, Copy, Check, Search, Star, X, Palette, Type, Square, Smartphone,
  Code2, Ruler, Wand2, Gauge, Hash, Sparkles, Layout, Zap, Component, Waves,
  Grid3x3, Shapes, Timer, KeyRound, QrCode, FileJson, Link2, Braces,
} from "lucide-react";
import { Loader2, FileText, Image as ImageIcon, Terminal, Lock, Tag, ScrollText, Percent } from "lucide-react";
import { SnippetsGallery } from "@/components/toolkit-snippets-extra";
import { Playground } from "@/components/playground";
import { SvgOptimizer } from "@/components/svg-optimizer";
import { JsonToZodTool } from "@/components/json-to-zod";
import { FluidClampTool } from "@/components/fluid-clamp";
import { MultiLayerShadowTool } from "@/components/multi-layer-shadow";
import { NextImageCalcTool } from "@/components/next-image-calc";
import { KeyframeAnimationBuilder } from "@/components/keyframe-animation-builder";
import { CssToTailwindTool } from "@/components/css-to-tailwind";



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

const LAB_TOOL_IDS = new Set([
  "forms-lab",
  "form-events-lab",
  "database-lab",
  "rest-api-lab",
  "frontend-backend-lab",
  "react-playground-lab",
  "interview-lab",
  "container-query",
  "view-transition",
  "color-mix-oklch",
  "scroll-snap",
]);

const CATEGORY_META: Record<Category, { blurb: string; tone: string }> = {
  CSS: {
    blurb: "Generators, effects, and visual polish for shipping UI faster.",
    tone: "from-sky-500/18 via-cyan-500/10 to-transparent",
  },
  Layout: {
    blurb: "Grids, flex, spacing, and structure tools for page systems.",
    tone: "from-emerald-500/18 via-teal-500/10 to-transparent",
  },
  JavaScript: {
    blurb: "Snippets, debuggers, converters, and hands-on frontend labs.",
    tone: "from-amber-500/18 via-orange-500/10 to-transparent",
  },
  Color: {
    blurb: "Palettes, contrast, and modern color system helpers.",
    tone: "from-fuchsia-500/16 via-pink-500/10 to-transparent",
  },
  Typography: {
    blurb: "Font pairing, fluid type, and text-focused helpers.",
    tone: "from-violet-500/16 via-indigo-500/10 to-transparent",
  },
  Responsive: {
    blurb: "Breakpoints, previews, and tools for multi-screen confidence.",
    tone: "from-blue-500/18 via-indigo-500/10 to-transparent",
  },
  Utilities: {
    blurb: "Fast everyday helpers for content, encoding, and productivity.",
    tone: "from-slate-500/18 via-zinc-500/10 to-transparent",
  },
  Components: {
    blurb: "Reusable patterns and UI building blocks.",
    tone: "from-rose-500/16 via-orange-500/10 to-transparent",
  },
  Wow: {
    blurb: "More expressive visuals for hero sections and standout moments.",
    tone: "from-cyan-500/18 via-sky-500/10 to-transparent",
  },
};

const DISCOVERY_LANES = [
  {
    id: "build",
    label: "Build Layouts",
    description: "Structure pages, sections, and responsive systems.",
    icon: Layout,
    category: "Layout" as const,
    picks: ["flex", "grid", "grid-overlay", "scroll-snap", "breakpoint-preview"],
  },
  {
    id: "style",
    label: "Style & Motion",
    description: "Shape, polish, animate, and add visual personality.",
    icon: Sparkles,
    category: "CSS" as const,
    picks: ["gradient", "shadow", "glass", "anim-gallery", "bezier"],
  },
  {
    id: "convert",
    label: "Convert & Clean",
    description: "Turn raw input into usable frontend-ready output.",
    icon: Braces,
    category: "Utilities" as const,
    picks: ["json-types", "html-jsx", "curl", "svg-css", "svg-cleanup"],
  },
  {
    id: "learn",
    label: "Labs & Practice",
    description: "Explore concepts with guided, interactive playgrounds.",
    icon: Wand2,
    category: "JavaScript" as const,
    picks: ["interview-lab", "forms-lab", "rest-api-lab", "database-lab", "view-transition"],
  },
];

const QUICK_START_IDS = ["gradient", "json-types", "flex", "color-mix-oklch", "img-placeholder", "forms-lab"];

function ToolkitPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All" | "Favorites" | "Recent" | "Labs">("All");
  const [favs, setFavs] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [spotlightId, setSpotlightId] = useState("flex");
  const [shelfView, setShelfView] = useState<Record<string, "list" | "grid">>({});
  const resultsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    const term = q.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (cat === "Favorites") return favs.includes(tool.id);
      if (cat === "Recent") return recent.includes(tool.id);
      if (cat === "Labs") {
        if (!LAB_TOOL_IDS.has(tool.id)) return false;
      } else if (cat !== "All" && tool.category !== cat) {
        return false;
      }
      if (!term) return true;
      return `${tool.name} ${tool.category} ${tool.keywords ?? ""}`.toLowerCase().includes(term);
    });
  }, [cat, favs, q, recent]);

  const categoryCounts = useMemo(() => {
    return TOOLS.reduce<Record<string, number>>((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const groupedFiltered = useMemo(() => {
    return (["CSS", "Layout", "JavaScript", "Color", "Typography", "Responsive", "Utilities", "Components", "Wow"] as Category[])
      .map((category) => ({
        category,
        tools: filtered.filter((tool) => tool.category === category),
      }))
      .filter((group) => group.tools.length > 0);
  }, [filtered]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const focusResults = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCategoryClick = (nextCategory: Category | "All" | "Favorites" | "Recent" | "Labs") => {
    setCat(nextCategory);
    focusResults();
  };

  const spotlightTool = TOOLS.find((tool) => tool.id === spotlightId) ?? filtered[0] ?? TOOLS[0];
  const spotlightLane = DISCOVERY_LANES.find((lane) => lane.picks.includes(spotlightTool.id)) ?? DISCOVERY_LANES[0];
  const spotlightTags = (spotlightTool.keywords || `${spotlightTool.category.toLowerCase()} live preview copy ready`)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  const isDefaultBrowse = !q.trim() && cat === "All";
  const recentTools = recent.map((id) => TOOLS.find((tool) => tool.id === id)).filter((tool): tool is Tool => Boolean(tool));
  const favoriteTools = favs.map((id) => TOOLS.find((tool) => tool.id === id)).filter((tool): tool is Tool => Boolean(tool));
  const quickStartTools = QUICK_START_IDS.map((id) => TOOLS.find((tool) => tool.id === id)).filter((tool): tool is Tool => Boolean(tool));
  const topRailTools = recentTools.length > 0 ? recentTools.slice(0, 4) : favoriteTools.length > 0 ? favoriteTools.slice(0, 4) : quickStartTools.slice(0, 4);

  const renderToolCard = (tool: Tool, emphasized = false) => {
    const Icon = tool.icon;
    const isFav = favs.includes(tool.id);

    return (
      <Link
        key={tool.id}
        href={`/toolkit/${tool.id}`}
        onClick={() => markRecent(tool.id)}
        onMouseEnter={() => setSpotlightId(tool.id)}
        onFocus={() => setSpotlightId(tool.id)}
        className={"group relative block w-full min-w-0 self-start overflow-hidden rounded-[20px] border p-3 text-left transition-all hover:-translate-y-0.5 " + (emphasized ? "border-accent/45 bg-background md:col-span-2 md:p-3.5" : "border-border bg-card hover:border-accent/60")}
      >
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
          <div className={"grid place-items-center rounded-xl bg-accent/15 text-accent " + (emphasized ? "h-9 w-9" : "h-8 w-8")}>
            <Icon className={emphasized ? "h-4.5 w-4.5" : "h-4 w-4"} />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav(tool.id);
            }}
            className={"grid h-8 w-8 place-items-center rounded-full border border-transparent transition hover:border-border " + (isFav ? "text-accent" : "text-muted-foreground/60")}
            aria-label="favorite"
          >
            <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          {emphasized ? (
            <span className="rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-accent">
              Start here
            </span>
          ) : null}
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{tool.category}</span>
        </div>
        <div className={"mt-2 min-w-0 font-display font-semibold break-words " + (emphasized ? "text-[1.02rem] leading-6" : "text-[0.96rem] leading-5")}>{tool.name}</div>
        <div className="mt-2.5 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-accent">
            Open
          </span>
          {emphasized ? (
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
              Preview
            </span>
          ) : null}
        </div>
      </Link>
    );
  };

  const renderShelfCard = (tool: Tool, featured = false) => {
    const Icon = tool.icon;
    const isFav = favs.includes(tool.id);

    return (
      <Link
        key={tool.id}
        href={`/toolkit/${tool.id}`}
        onClick={() => markRecent(tool.id)}
        onMouseEnter={() => setSpotlightId(tool.id)}
        onFocus={() => setSpotlightId(tool.id)}
        className={
          "group relative block h-full w-full min-w-0 overflow-hidden rounded-[20px] border bg-background/92 text-left transition-all hover:-translate-y-0.5 hover:border-accent/45 " +
          (featured ? "border-accent/35 p-4" : "border-border p-3.5")
        }
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className={"grid place-items-center rounded-xl bg-accent/12 text-accent " + (featured ? "h-9 w-9" : "h-8 w-8")}>
              <Icon className={featured ? "h-4 w-4" : "h-3.5 w-3.5"} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFav(tool.id);
              }}
              className={"grid h-7 w-7 place-items-center rounded-full border border-transparent transition hover:border-border " + (isFav ? "text-accent" : "text-muted-foreground/60")}
              aria-label="favorite"
            >
              <Star className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {featured ? (
              <span className="rounded-full bg-accent/12 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.22em] text-accent">
                Best start
              </span>
            ) : null}
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{tool.category}</span>
          </div>
          <div className={"mt-2 min-w-0 break-words font-display font-semibold text-foreground " + (featured ? "text-[1rem] leading-6" : "text-[0.92rem] leading-5")}>
            {tool.name}
          </div>
          {featured ? (
            <div className="mt-2 min-w-0 break-words text-[12px] leading-5 text-muted-foreground line-clamp-2">
              Open this first if you want the fastest path into {tool.category.toLowerCase()} work without comparing everything.
            </div>
          ) : (
            <div className="mt-2 text-[11px] leading-5 text-muted-foreground line-clamp-2">Quick entry point.</div>
          )}
          <div className="mt-auto flex items-center gap-2 pt-3 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="rounded-full bg-accent/10 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-accent">
              Open
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const renderShelfListItem = (tool: Tool, featured = false) => {
    const Icon = tool.icon;
    const isFav = favs.includes(tool.id);

    return (
      <Link
        key={tool.id}
        href={`/toolkit/${tool.id}`}
        onClick={() => markRecent(tool.id)}
        onMouseEnter={() => setSpotlightId(tool.id)}
        onFocus={() => setSpotlightId(tool.id)}
        className={
          "group flex w-full min-w-0 items-start gap-3 rounded-[18px] border bg-background/92 transition-all hover:-translate-y-0.5 hover:border-accent/45 " +
          (featured ? "border-accent/35 px-4 py-4" : "border-border px-3.5 py-3")
        }
      >
        <div className={"grid shrink-0 place-items-center rounded-xl bg-accent/12 text-accent " + (featured ? "h-10 w-10" : "h-8 w-8")}>
          <Icon className={featured ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {featured ? (
                  <span className="rounded-full bg-accent/12 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-accent">
                    Best start
                  </span>
                ) : null}
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{tool.category}</span>
              </div>
              <div className={"mt-2 min-w-0 break-words font-display font-semibold text-foreground " + (featured ? "text-[1rem] leading-6" : "text-[0.92rem] leading-5")}>
                {tool.name}
              </div>
              <div className="mt-1.5 text-[12px] leading-5 text-muted-foreground line-clamp-2">
                {featured
                  ? `Start here first if you want the fastest path into ${tool.category.toLowerCase()} work.`
                  : "Quick entry point for this workflow."}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFav(tool.id);
              }}
              className={"grid h-7 w-7 shrink-0 place-items-center rounded-full border border-transparent transition hover:border-border " + (isFav ? "text-accent" : "text-muted-foreground/60")}
              aria-label="favorite"
            >
              <Star className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="hidden font-display text-lg font-bold tracking-tight md:block">
            Toolkit<span className="text-accent">.</span>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools... press /"
              className="w-full rounded-full border border-border bg-card/60 py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            {q ? (
              <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <a href="mailto:jaybaheliya@gmail.com" className="hidden min-h-9 items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground sm:inline-flex">
            Hire me
          </a>
        </div>

        <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 pb-3 md:px-8">
          {(["All", "Favorites", "Recent", "Labs", "CSS", "Layout", "JavaScript", "Color", "Typography", "Responsive", "Utilities", "Components", "Wow"] as const).map((chip) => (
            <button
              type="button"
              key={chip}
              onClick={() => handleCategoryClick(chip)}
              className={"shrink-0 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-widest transition " + (cat === chip ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {chip === "Favorites" ? `Favs (${favs.length})` : chip === "Recent" ? `Recent (${recent.length})` : chip}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-10 md:px-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Frontend toolkit - v3</div>
        <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] md:text-5xl">
          Stop hunting. <span className="text-accent">Enter through intent.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          The toolkit now behaves more like a discovery console: start from the job to be done, inspect a spotlight, then move into stronger category shelves instead of a flat wall of cards.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-8 md:px-8">
        <div className="rounded-[36px] border border-border bg-card p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)] xl:items-start">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Toolkit Command Center</div>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[0.98] md:text-6xl">
                Find the right tool <span className="text-accent">without guessing</span>.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                Search directly, jump into a recent tool, or browse by workflow. The landing page should help you decide fast, not ask you to decode it.
              </p>

              <div className="mt-8 rounded-[28px] border border-border bg-background/80 p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Quick Actions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => searchRef.current?.focus()}
                    className="inline-flex min-h-10 items-center rounded-full border border-border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    Press / to search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setCat("All");
                      focusResults();
                    }}
                    className="inline-flex min-h-10 items-center rounded-full border border-border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    Browse all
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("Favorites")}
                    className="inline-flex min-h-10 items-center rounded-full border border-border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    Favorites
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  {topRailTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        setSpotlightId(tool.id);
                        markRecent(tool.id);
                      }}
                      className={"rounded-full border px-3 py-1.5 text-left text-[11px] font-mono uppercase tracking-[0.22em] transition " + (spotlightTool.id === tool.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground")}
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-[22px] border border-border bg-background/80 px-4 py-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Tools</div>
                  <div className="mt-2 text-3xl font-semibold">{TOOLS.length}</div>
                </div>
                <div className="rounded-[22px] border border-border bg-background/80 px-4 py-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Favorites</div>
                  <div className="mt-2 text-3xl font-semibold">{favs.length}</div>
                </div>
                <div className="rounded-[22px] border border-border bg-background/80 px-4 py-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Recent</div>
                  <div className="mt-2 text-3xl font-semibold">{recent.length}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-background/85 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Spotlight</div>
                  <div className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{spotlightTool.name}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{spotlightLane.label} lane</div>
                </div>
                <Link href={`/toolkit/${spotlightTool.id}`} className="rounded-full border border-border px-3 py-1.5 text-[11px] font-mono uppercase tracking-wide text-muted-foreground transition hover:border-accent hover:text-accent">
                  Open
                </Link>
              </div>

              <div className="mt-5 rounded-[24px] border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
                    <spotlightTool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Why this tool</div>
                    <p className="mt-2 text-base leading-7 text-foreground">{CATEGORY_META[spotlightTool.category].blurb}</p>
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

              <div className="mt-4 space-y-2">
                {spotlightLane.picks.slice(0, 3).map((id) => {
                  const tool = TOOLS.find((item) => item.id === id);
                  if (!tool) return null;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setSpotlightId(id)}
                      className={"flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition " + (tool.id === spotlightTool.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-foreground hover:border-accent/40 hover:bg-muted/50")}
                    >
                      <span>{tool.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{tool.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-border bg-card p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">Workflow Lanes</div>
            <div className="hidden rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground md:block">
              hover to scout
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {DISCOVERY_LANES.map((lane, index) => {
              const LaneIcon = lane.icon;
              const active = spotlightLane.id === lane.id;
              return (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() => handleCategoryClick(lane.category)}
                  onMouseEnter={() => setSpotlightId(lane.picks[0])}
                  className={"group relative overflow-hidden rounded-[28px] p-4 text-left transition-all " + (active ? "bg-[linear-gradient(180deg,rgba(59,130,246,0.14),rgba(255,255,255,0.98))] shadow-[0_18px_44px_rgba(59,130,246,0.14)] ring-1 ring-accent/35" : "bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] ring-1 ring-border hover:-translate-y-0.5 hover:ring-accent/30")}
                >
                  <div className={"absolute inset-x-0 top-0 h-1 transition " + (active ? "bg-accent" : "bg-transparent group-hover:bg-accent/45")} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="pt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      0{index + 1}
                    </div>
                    <div className={"rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] " + (active ? "bg-white/80 text-accent" : "bg-muted text-muted-foreground")}>
                      {lane.category}
                    </div>
                  </div>
                  <div className="mt-5 flex items-start gap-4">
                    <div className={"grid h-12 w-12 shrink-0 place-items-center rounded-[18px] transition " + (active ? "bg-white text-accent shadow-sm" : "bg-accent/12 text-accent")}>
                      <LaneIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-xl font-semibold leading-6">{lane.label}</div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{lane.description}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {lane.picks.slice(0, 2).map((id) => {
                        const tool = TOOLS.find((item) => item.id === id);
                        if (!tool) return null;
                        return (
                          <span key={id} className="rounded-full border border-border bg-white/80 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            {tool.name}
                          </span>
                        );
                      })}
                    </div>
                    <span className={"text-[10px] font-mono uppercase tracking-[0.22em] transition " + (active ? "text-accent" : "text-muted-foreground group-hover:text-accent")}>
                      Scout
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="border-t border-border/60">
        <Playground />
      </div>

      <section ref={resultsRef} className="mx-auto max-w-[1400px] scroll-mt-28 px-4 pb-24 md:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No tools match "{q}". Try a different keyword.
          </div>
        ) : isDefaultBrowse ? (
          <div className="space-y-10">
            {groupedFiltered.map(({ category, tools }) => {
              const featured = tools[0];
              const secondary = tools.slice(1, 8);
              const currentView = shelfView[category] ?? "list";
              const compactListLayout = secondary.length > 0 && secondary.length <= 2;

              return (
                <section key={category} className="rounded-[30px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.98))] p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.15)] md:p-5">
                  <div className="grid items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <div className={"self-start rounded-[24px] border border-border/80 p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.18)] md:p-5 " + "bg-gradient-to-br " + CATEGORY_META[category].tone}>
                      <div className="text-[9px] font-mono uppercase tracking-[0.32em] text-muted-foreground">Category Shelf</div>
                      <h2 className="mt-3 font-display text-[1.9rem] leading-none font-semibold tracking-tight">{category}</h2>
                      <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{CATEGORY_META[category].blurb}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="rounded-full border border-border/80 bg-background/85 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                          {tools.length} tools
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCategoryClick(category)}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-border/80 bg-background/85 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:bg-background hover:text-accent"
                        >
                          Focus {category}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-border/80 bg-background/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                      <div className="mb-3 flex items-center justify-between gap-3 px-1">
                        <div>
                          <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Recommended Flow</div>
                          <div className="mt-1 text-[12px] font-semibold text-foreground">
                            {currentView === "list"
                              ? "Start with the first item, then scan the rest in a tighter list."
                              : "Start with the first card, then compare the alternatives in one grid."}
                          </div>
                        </div>
                        <div className="inline-flex rounded-full border border-border/80 bg-card/90 p-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground shadow-[0_10px_24px_-20px_rgba(15,23,42,0.25)]">
                          <button
                            type="button"
                            onClick={() => setShelfView((prev) => ({ ...prev, [category]: "list" }))}
                            className={"rounded-full px-3 py-1 transition " + (currentView === "list" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                          >
                            List
                          </button>
                          <button
                            type="button"
                            onClick={() => setShelfView((prev) => ({ ...prev, [category]: "grid" }))}
                            className={"rounded-full px-3 py-1 transition " + (currentView === "grid" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                          >
                            Grid
                          </button>
                        </div>
                      </div>
                      {currentView === "list" ? (
                        compactListLayout ? (
                          <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
                            {featured ? (
                              <div className="min-w-0">
                                {renderShelfListItem(featured, true)}
                              </div>
                            ) : null}
                            <div className="grid gap-3">
                              {secondary.map((tool) => renderShelfListItem(tool))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {featured ? (
                              <div className="min-w-0">
                                {renderShelfListItem(featured, true)}
                              </div>
                            ) : null}
                            <div className="grid gap-3 lg:grid-cols-2">
                              {secondary.map((tool) => renderShelfListItem(tool))}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="grid auto-rows-[minmax(190px,1fr)] items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4">
                          {featured ? (
                            <div className="min-w-0 md:col-span-2 xl:col-span-2">
                              {renderShelfCard(featured, true)}
                            </div>
                          ) : null}
                          {secondary.map((tool) => (
                            <div key={tool.id} className="min-w-0">
                              {renderShelfCard(tool)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => renderToolCard(tool))}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Built by Jwala Baheliya - <Link href="/" className="hover:text-accent">Portfolio</Link> - <Link href="/tools" className="hover:text-accent">Recruiter tools</Link>
      </footer>

      <FloatingPlaygroundCTA />
    </div>
  );
}

/* ---------- helpers ---------- */
function FloatingPlaygroundCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = document.getElementById("playground");
    if (!section) {
      setVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const jumpToPlayground = () => {
    const section = document.getElementById("playground");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={"pointer-events-none fixed right-5 top-24 z-40 hidden xl:block transition-all duration-300 " + (visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0")}>
      <button
        type="button"
        onClick={jumpToPlayground}
        className="pointer-events-auto group inline-flex items-center gap-3 rounded-full border border-border bg-background/92 px-3 py-3 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/45"
        aria-label="Jump to live code playground"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_28px_-18px_rgba(56,189,248,0.8)]">
          <Code2 className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Live Code</span>
          <span className="mt-0.5 block font-display text-base font-semibold text-foreground">Open Playground</span>
        </span>
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)] transition-all duration-300 group-hover:scale-110" />
      </button>
    </div>
  );
}

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
  const [pxWidth, setPxWidth] = useState(640);
  const [mode, setMode] = useState<"css" | "fixed">("css");
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const computedHeight = Math.round((pxWidth * h) / w);
  const ratio = (w / h).toFixed(4);
  const previewWidth = Math.min(pxWidth, 720);
  const previewHeight = Math.round((previewWidth * h) / w);
  const css = mode === "css"
    ? "aspect-ratio: " + w + " / " + h + ";\nwidth: 100%;\nmax-width: " + pxWidth + "px;"
    : "width: " + pxWidth + "px;\nheight: " + computedHeight + "px;";
  const fallback = ".media-frame {\n  position: relative;\n  width: 100%;\n  max-width: " + pxWidth + "px;\n}\n\n.media-frame::before {\n  content: \"\";\n  display: block;\n  padding-top: " + ((h / w) * 100).toFixed(2) + "%;\n}\n\n.media-frame > * {\n  position: absolute;\n  inset: 0;\n}";
  const html = `<div class="media-frame">\n  <img src="/image.jpg" alt="" style="object-fit: ${fit};" />\n</div>`;
  return (
    <div className="grid gap-5 xl:grid-cols-[1.02fr_.98fr]">
      <div className="min-w-0 space-y-4">
        <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono">
          {(["css", "fixed"] as const).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={"rounded-full px-3 py-1 uppercase " + (mode === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
              {item === "css" ? "responsive" : "px size"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            [1, 1],
            [4, 3],
            [16, 9],
            [3, 2],
            [21, 9],
            [9, 16],
          ].map(([rw, rh]) => (
            <button
              key={`${rw}-${rh}`}
              onClick={() => { setW(rw); setH(rh); }}
              className={"rounded-full border px-3 py-1 " + (w === rw && h === rh ? "border-accent bg-accent text-accent-foreground" : "border-border")}
            >
              {rw}:{rh}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Row label="Ratio W"><SliderInput value={w} onChange={setW} min={1} max={32} /></Row>
          <Row label="Ratio H"><SliderInput value={h} onChange={setH} min={1} max={32} /></Row>
          <Row label="Max px"><SliderInput value={pxWidth} onChange={setPxWidth} min={120} max={1440} step={10} /></Row>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-24 uppercase text-muted-foreground">object fit</span>
            <SelectControl value={fit} onChange={(value) => setFit(value as "cover" | "contain")} options={["cover", "contain"]} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">ratio</div>
            <div className="mt-1 text-sm font-semibold">{w}:{h}</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">decimal</div>
            <div className="mt-1 text-sm font-semibold">{ratio}</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">px size</div>
            <div className="mt-1 text-sm font-semibold">{pxWidth} × {computedHeight}</div>
          </div>
        </div>

        <CodeBlock code={css} />
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock code={fallback} lang="css" />
          <CodeBlock code={html} lang="html" />
        </div>
      </div>
      <div className="min-w-0 space-y-4">
        <Preview className="p-4 sm:p-6">
          <div className="w-full max-w-2xl min-w-0 space-y-4">
            <div className="rounded-xl border border-border bg-card px-3 py-2 text-left">
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">preview frame</div>
              <div className="mt-1 text-sm font-semibold">{mode === "css" ? "responsive aspect-ratio" : "fixed pixel dimensions"}</div>
            </div>
            <div
              className="relative mx-auto overflow-hidden rounded-2xl border border-accent/40 bg-accent/10 shadow-[0_20px_50px_-30px_rgba(59,130,246,0.5)]"
              style={mode === "css"
                ? { aspectRatio: `${w} / ${h}`, width: "100%", maxWidth: `${pxWidth}px` }
                : { aspectRatio: `${w} / ${h}`, width: "100%", maxWidth: `${previewWidth}px` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.14),rgba(14,165,233,0.28))]" />
              <div className="absolute inset-4 rounded-[18px] border border-dashed border-accent/40" />
              <div className="absolute inset-0 grid place-items-center p-4 text-center">
                <div>
                  <div className="text-sm font-semibold text-accent-foreground/90">{w}:{h} aspect frame</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    {mode === "css" ? `${pxWidth}px max width` : `${pxWidth}px x ${computedHeight}px`}
                  </div>
                  {mode === "fixed" ? (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      scaled preview: {previewWidth}px x {previewHeight}px
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Preview>
      </div>
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

function ContainerQueryPlaygroundTool() {
  const [containerWidth, setContainerWidth] = useState(420);
  const [breakpoint, setBreakpoint] = useState(640);
  const [gap, setGap] = useState(20);
  const [padding, setPadding] = useState(18);
  const [radius, setRadius] = useState(24);
  const [theme, setTheme] = useState<"ocean" | "sunset" | "mono">("ocean");
  const [template, setTemplate] = useState<"feature" | "pricing">("feature");

  const themes = {
    ocean: {
      shell: "linear-gradient(135deg, rgba(8,145,178,0.12), rgba(59,130,246,0.08))",
      card: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
      accent: "#38bdf8",
      soft: "rgba(56,189,248,0.18)",
    },
    sunset: {
      shell: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(244,63,94,0.10))",
      card: "linear-gradient(180deg, rgba(41,37,36,0.98), rgba(68,64,60,0.92))",
      accent: "#fb7185",
      soft: "rgba(251,113,133,0.18)",
    },
    mono: {
      shell: "linear-gradient(135deg, rgba(148,163,184,0.10), rgba(100,116,139,0.08))",
      card: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.92))",
      accent: "#e2e8f0",
      soft: "rgba(226,232,240,0.16)",
    },
  } as const;

  const activeTheme = themes[theme];
  const isActive = containerWidth >= breakpoint;
  const heading = template === "feature" ? "Component-first responsive card" : "Pricing card with smart layout";
  const body = template === "feature"
    ? "Container queries react to the component width itself, not the whole viewport. Perfect for cards inside sidebars, CMS blocks, and nested layouts."
    : "This pricing block stacks naturally in narrow parents, then switches into a split summary once the component itself has enough room.";

  const css = `.cq-demo {
  container: toolkit-card / inline-size;
  width: min(100%, ${containerWidth}px);
  margin-inline: auto;
}

.cq-card {
  display: grid;
  gap: ${gap}px;
  padding: ${padding}px;
  border-radius: ${radius}px;
  color: #f8fafc;
  background: ${activeTheme.card};
  border: 1px solid ${activeTheme.soft};
  box-shadow: 0 24px 80px -36px rgba(15, 23, 42, 0.72);
}

.cq-media {
  min-height: 176px;
  border-radius: ${Math.max(16, radius - 8)}px;
  background:
    radial-gradient(circle at 20% 20%, ${activeTheme.soft}, transparent 36%),
    linear-gradient(140deg, ${activeTheme.accent}22, transparent 65%),
    #020617;
}

.cq-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cq-stats {
  display: grid;
  gap: 12px;
}

@container toolkit-card (min-width: ${breakpoint}px) {
  .cq-card {
    grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
    align-items: center;
  }

  .cq-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}`;

  const reactSnippet = `<section className="cq-demo">
  <article className="cq-card">
    <div className="cq-copy">
      <p className="cq-kicker">Modern CSS API</p>
      <h3>${heading}</h3>
      <p>${body}</p>
      <div className="cq-actions">
        <button>Primary action</button>
        <button>Secondary action</button>
      </div>
    </div>
    <div className="cq-media" />
  </article>
</section>`;

  const usageNotes = [
    "Use this when a card sits inside a grid, drawer, CMS section, or sidebar where viewport breakpoints are too global.",
    "Container queries make reusable components smarter because each one responds to its own width.",
    "Keep the parent container named and typed with `container: name / inline-size` or `container-type: inline-size`.",
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Controls</div>
            <div className="mt-2 text-sm text-muted-foreground">Resize the parent container and the card responds based on its own width, not the page viewport.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["feature", "pricing"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTemplate(item)}
                className={"flex-1 rounded-xl px-3 py-2 transition " + (template === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["ocean", "sunset", "mono"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTheme(item)}
                className={"flex-1 rounded-xl px-3 py-2 transition " + (theme === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
              >
                {item}
              </button>
            ))}
          </div>

          <Slider label="Width" v={containerWidth} on={setContainerWidth} min={260} max={920} step={10} />
          <Slider label="Query" v={breakpoint} on={setBreakpoint} min={320} max={880} step={10} />
          <Slider label="Gap" v={gap} on={setGap} min={12} max={40} />
          <Slider label="Padding" v={padding} on={setPadding} min={12} max={40} />
          <Slider label="Radius" v={radius} on={setRadius} min={16} max={40} />

          <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
            <div className="font-mono uppercase tracking-widest">State</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>Container width: {containerWidth}px</span>
              <span className={"rounded-full px-2 py-1 font-mono uppercase tracking-wide " + (isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600")}>
                {isActive ? "query matched" : "stacked mode"}
              </span>
            </div>
            <div className="mt-2">Breakpoint activates at <span className="font-mono text-foreground">{breakpoint}px</span>.</div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[28px] border border-border bg-white p-3 sm:p-5">
              <div
                className="mx-auto rounded-[28px] border border-border p-3 transition-all sm:p-5"
                style={{ width: `min(100%, ${containerWidth}px)`, background: activeTheme.shell }}
              >
                <style>{css}</style>
                <section className="cq-demo">
                  <article className="cq-card">
                    <div className="space-y-4">
                      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-white/70">
                        Modern CSS API
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">{heading}</h3>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{body}</p>
                      </div>
                      <div className="cq-actions">
                        <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">Primary action</button>
                        <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white">Secondary</button>
                      </div>
                      <div className="cq-stats">
                        {["Own width", "Reusable", "Nested layouts"].map((item, index) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
                            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Benefit {index + 1}</div>
                            <div className="mt-2 text-sm font-medium text-white">{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="cq-media flex min-h-[176px] items-end justify-between overflow-hidden p-5">
                      <div className="max-w-[180px] rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left text-white">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Container</div>
                        <div className="mt-2 text-xl font-semibold">{containerWidth}px</div>
                        <div className="mt-2 text-xs text-slate-300">The component changes when this box grows, even if the viewport stays the same.</div>
                      </div>
                      <div className="h-24 w-24 rounded-full border border-white/10 bg-white/10 backdrop-blur" />
                    </div>
                  </article>
                </section>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={css} lang="css" />
            <CodeBlock code={reactSnippet} lang="jsx" />
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Why it matters</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {usageNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewTransitionPlaygroundTool() {
  const [activeView, setActiveView] = useState<"overview" | "gallery" | "pricing">("overview");
  const [layout, setLayout] = useState<"card" | "split">("card");
  const [duration, setDuration] = useState(550);
  const [accent, setAccent] = useState("#3b82f6");
  const [supported, setSupported] = useState(false);
  const [lastAction, setLastAction] = useState("overview -> overview");

  useEffect(() => {
    if (typeof document === "undefined") return;
    setSupported("startViewTransition" in document);
  }, []);

  const changeView = (next: "overview" | "gallery" | "pricing") => {
    const current = activeView;
    const run = () => {
      setActiveView(next);
      setLastAction(`${current} -> ${next}`);
    };
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { finished?: Promise<unknown> };
    };
    if (doc.startViewTransition) {
      void doc.startViewTransition(run)?.finished?.catch(() => undefined);
      return;
    }
    run();
  };

  const toggleLayout = () => {
    const run = () => setLayout((current) => (current === "card" ? "split" : "card"));
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { finished?: Promise<unknown> };
    };
    if (doc.startViewTransition) {
      void doc.startViewTransition(run)?.finished?.catch(() => undefined);
      return;
    }
    run();
  };

  const accentRgb = hexToRgb(accent);
  const softAccent = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.18)`;
  const deepAccent = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.28)`;

  const css = `:root {
  --vt-duration: ${duration}ms;
  --vt-accent: ${accent};
}

.vt-shell {
  view-transition-name: demo-shell;
}

.vt-hero {
  view-transition-name: demo-hero;
}

.vt-badge {
  view-transition-name: demo-badge;
}

::view-transition-old(demo-shell),
::view-transition-new(demo-shell),
::view-transition-old(demo-hero),
::view-transition-new(demo-hero),
::view-transition-old(demo-badge),
::view-transition-new(demo-badge) {
  animation-duration: var(--vt-duration);
  animation-timing-function: cubic-bezier(.2,.8,.2,1);
}`;

  const js = `const swapView = (nextView) => {
  if (!document.startViewTransition) {
    setView(nextView);
    return;
  }

  document.startViewTransition(() => {
    setView(nextView);
  });
};`;

  const modeLabel =
    activeView === "overview"
      ? "Product overview"
      : activeView === "gallery"
        ? "Gallery spotlight"
        : "Pricing summary";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Controls</div>
            <div className="mt-2 text-sm text-muted-foreground">Switch views and layout states to test how the View Transition API can smooth page-level and component-level UI changes.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["overview", "gallery", "pricing"] as const).map((item) => (
              <button
                key={item}
                onClick={() => changeView(item)}
                className={"flex-1 rounded-xl px-3 py-2 transition " + (activeView === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
              >
                {item}
              </button>
            ))}
          </div>

          <button onClick={toggleLayout} className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-border px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition hover:border-foreground/30 hover:text-foreground">
            Toggle layout: {layout}
          </button>

          <Slider label="Duration" v={duration} on={setDuration} min={180} max={1200} step={10} />

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Accent</span>
            <input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-2" />
          </label>

          <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
            <div className="font-mono uppercase tracking-widest">Browser support</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>{supported ? "Native API available" : "Fallback mode active"}</span>
              <span className={"rounded-full px-2 py-1 font-mono uppercase tracking-wide " + (supported ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600")}>
                {supported ? "supported" : "fallback"}
              </span>
            </div>
            <div className="mt-2">Last transition: <span className="font-mono text-foreground">{lastAction}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <style>{css}</style>
            <div
              className={"vt-shell w-full rounded-[30px] border border-border p-4 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.42)] transition-all sm:p-6 " + (layout === "split" ? "grid gap-4 lg:grid-cols-[1.1fr_.9fr]" : "space-y-4")}
              style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98)), radial-gradient(circle at top right, ${softAccent}, transparent 34%)` }}
            >
              <div className="space-y-4">
                <div className="vt-badge inline-flex rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em]" style={{ borderColor: softAccent, color: accent }}>
                  View Transition API
                </div>
                <div className="vt-hero">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{modeLabel}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    {activeView === "overview" && "Use this to animate route changes, tab switches, or layout shifts without the jump-cut feeling of a normal state swap."}
                    {activeView === "gallery" && "Shared visual continuity helps images, cards, and spotlight sections feel connected when the active item changes."}
                    {activeView === "pricing" && "Pricing, plans, and comparison tables feel more polished when key UI blocks keep visual identity between states."}
                  </p>
                </div>

                <div className={"grid gap-3 " + (layout === "split" ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                  {[
                    activeView === "overview" ? "Route-level transitions" : activeView === "gallery" ? "Shared media focus" : "Plan switch polish",
                    supported ? "Native browser animation" : "Graceful state fallback",
                    `${duration}ms timing`,
                  ].map((item, index) => (
                    <div key={item} className="rounded-2xl border p-3" style={{ borderColor: softAccent, background: index === 0 ? softAccent : "rgba(255,255,255,0.8)" }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Signal {index + 1}</div>
                      <div className="mt-2 text-sm font-medium text-slate-900">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[26px] border p-4" style={{ borderColor: softAccent, background: `linear-gradient(135deg, ${softAccent}, rgba(15,23,42,0.04))` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Active surface</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950">{activeView}</div>
                    </div>
                    <div className="h-14 w-14 rounded-2xl border" style={{ borderColor: deepAccent, background: `linear-gradient(135deg, ${softAccent}, rgba(255,255,255,0.85))` }} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Card {item}</div>
                      <div className="mt-2 h-20 rounded-xl" style={{ background: `linear-gradient(135deg, ${softAccent}, rgba(15,23,42,0.04))` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={css} lang="css" />
            <CodeBlock code={js} lang="js" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Best for route changes, tab switches, and shared-element UI moments.",
              "Add a fallback path because unsupported browsers should still switch state instantly.",
              "Keep transitions purposeful so they guide attention instead of slowing the interface down.",
            ].map((note) => (
              <div key={note} className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorMixOklchPlaygroundTool() {
  const [base, setBase] = useState("#0f172a");
  const [blend, setBlend] = useState("#60a5fa");
  const [mix, setMix] = useState(26);
  const [space, setSpace] = useState<"srgb" | "oklab" | "oklch">("oklch");
  const [lightness, setLightness] = useState(0.72);
  const [chroma, setChroma] = useState(0.17);
  const [hue, setHue] = useState(248);

  const oklchColor = `oklch(${lightness.toFixed(2)} ${chroma.toFixed(2)} ${hue})`;
  const mixedColor = `color-mix(in ${space}, ${base} ${100 - mix}%, ${blend} ${mix}%)`;
  const surfaceMix = `color-mix(in ${space}, ${base} 88%, ${blend} 12%)`;
  const borderMix = `color-mix(in ${space}, ${blend} 38%, white 62%)`;
  const palette = [0.98, 0.93, 0.86, lightness, Math.max(0.22, lightness - 0.16), Math.max(0.16, lightness - 0.28)].map((value) => `oklch(${value.toFixed(2)} ${chroma.toFixed(2)} ${hue})`);

  const css = `:root {
  --brand-base: ${base};
  --brand-blend: ${blend};
  --brand-mix: ${mixedColor};
  --brand-surface: ${surfaceMix};
  --brand-strong: ${oklchColor};
}

.button {
  background: var(--brand-mix);
  color: white;
}

.panel {
  background: var(--brand-surface);
  border: 1px solid ${borderMix};
}

.badge {
  background: ${oklchColor};
}`;

  const tokens = `export const themeTokens = {
  brandBase: "${base}",
  brandBlend: "${blend}",
  brandMix: "${mixedColor}",
  brandSurface: "${surfaceMix}",
  brandStrong: "${oklchColor}",
};`;

  const tailwind = `@theme {
  --color-brand-base: ${base};
  --color-brand-mix: ${mixedColor};
  --color-brand-strong: ${oklchColor};
}`;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Mix controls</div>
            <div className="mt-2 text-sm text-muted-foreground">Blend two colors with modern CSS, then shape a stronger OKLCH accent for buttons, borders, highlights, and tokens.</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Base color</span>
              <input type="color" value={base} onChange={(event) => setBase(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-2" />
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Blend color</span>
              <input type="color" value={blend} onChange={(event) => setBlend(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-2" />
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Color space</span>
            <select value={space} onChange={(event) => setSpace(event.target.value as "srgb" | "oklab" | "oklch")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="srgb">srgb</option>
              <option value="oklab">oklab</option>
              <option value="oklch">oklch</option>
            </select>
          </label>

          <Slider label="Mix %" v={mix} on={setMix} min={0} max={100} />
          <Slider label="Lightness" v={Math.round(lightness * 100)} on={(value) => setLightness(value / 100)} min={35} max={98} />
          <Slider label="Chroma" v={Math.round(chroma * 100)} on={(value) => setChroma(value / 100)} min={0} max={37} />
          <Slider label="Hue" v={hue} on={setHue} min={0} max={360} />

          <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
            <div className="font-mono uppercase tracking-widest">Output</div>
            <div className="mt-2 break-words font-mono text-foreground">{mixedColor}</div>
            <div className="mt-2 break-words font-mono text-foreground">{oklchColor}</div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div
              className="w-full rounded-[30px] border p-4 text-left shadow-[0_24px_70px_-38px_rgba(15,23,42,0.32)] sm:p-6"
              style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98)), radial-gradient(circle at top right, ${surfaceMix}, transparent 36%)`, borderColor: borderMix }}
            >
              <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em]" style={{ color: oklchColor, borderColor: borderMix }}>
                    Modern color API
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Color Mix + OKLCH lab</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      Build softer surfaces with <span className="font-mono">color-mix()</span> and stronger brand accents with <span className="font-mono">oklch()</span>, then ship both as reusable tokens.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border p-3" style={{ borderColor: borderMix, background: surfaceMix }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Surface</div>
                      <div className="mt-2 text-sm font-medium text-slate-900">Muted blend</div>
                    </div>
                    <div className="rounded-2xl border p-3 text-white" style={{ borderColor: borderMix, background: mixedColor }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">Action</div>
                      <div className="mt-2 text-sm font-medium">Mixed button</div>
                    </div>
                    <div className="rounded-2xl border p-3" style={{ borderColor: borderMix, background: oklchColor, color: lightness > 0.65 ? "#0f172a" : "white" }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] opacity-70">Accent</div>
                      <div className="mt-2 text-sm font-medium">OKLCH tone</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: borderMix }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Mixed background</div>
                      <div className="mt-3 h-20 rounded-xl" style={{ background: `linear-gradient(135deg, ${surfaceMix}, ${mixedColor})` }} />
                    </div>
                    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: borderMix }}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Accent chip</div>
                      <div className="mt-3 inline-flex rounded-full px-4 py-2 text-sm font-medium" style={{ background: oklchColor, color: lightness > 0.65 ? "#0f172a" : "white" }}>
                        {oklchColor}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border bg-white/80 p-4" style={{ borderColor: borderMix }}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Palette ramp</div>
                  <div className="mt-4 grid gap-2">
                    {palette.map((colorValue, index) => (
                      <div key={colorValue} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <div className="h-10 w-10 rounded-xl border border-slate-200" style={{ background: colorValue }} />
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">Step {index + 1}</div>
                          <div className="truncate font-mono text-xs text-slate-900">{colorValue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 xl:grid-cols-3">
            <CodeBlock code={css} lang="css" />
            <CodeBlock code={tokens} lang="ts" />
            <CodeBlock code={tailwind} lang="css" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollSnapBuilderTool() {
  const [axis, setAxis] = useState<"x" | "y" | "both">("x");
  const [strictness, setStrictness] = useState<"mandatory" | "proximity">("mandatory");
  const [align, setAlign] = useState<"start" | "center" | "end">("center");
  const [snapStop, setSnapStop] = useState<"normal" | "always">("normal");
  const [itemCount, setItemCount] = useState(5);
  const [gap, setGap] = useState(16);
  const [padding, setPadding] = useState(20);
  const [itemSize, setItemSize] = useState(240);
  const [activeSlide, setActiveSlide] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragStateRef = useRef<{ pointerId: number; startX: number; startY: number; startLeft: number; startTop: number; dragging: boolean } | null>(null);

  const isVertical = axis === "y";
  const isBoth = axis === "both";
  const isHorizontal = axis === "x";
  const scrollSnapType = `${axis} ${strictness}`;
  const containerStyle: React.CSSProperties = isVertical
    ? {
        display: "grid",
        gap,
        overflowY: "auto",
        maxHeight: 420,
        padding,
        scrollSnapType: scrollSnapType as React.CSSProperties["scrollSnapType"],
        touchAction: "pan-y",
      }
    : {
        display: "flex",
        flexWrap: isBoth ? "wrap" : "nowrap",
        gap,
        overflowX: "auto",
        overflowY: isBoth ? "auto" : "hidden",
        padding,
        width: "100%",
        scrollSnapType: scrollSnapType as React.CSSProperties["scrollSnapType"],
        touchAction: isHorizontal ? "pan-y" : "none",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorX: "contain",
      };

  const itemStyle: React.CSSProperties = {
    scrollSnapAlign: align,
    scrollSnapStop: snapStop,
    flex: isVertical ? undefined : `0 0 ${itemSize}px`,
    width: isVertical ? undefined : `${itemSize}px`,
    minHeight: isVertical || isBoth ? 160 : 220,
  };

  const css = `.snap-container {
  display: ${isVertical ? "grid" : "flex"};
  ${isVertical ? "" : `flex-wrap: ${isBoth ? "wrap" : "nowrap"};\n`}
  gap: ${gap}px;
  padding: ${padding}px;
  overflow: auto;
  scroll-snap-type: ${scrollSnapType};
}

.snap-item {
  ${isVertical ? "" : `flex: 0 0 ${itemSize}px;\n  width: ${itemSize}px;`}
  scroll-snap-align: ${align};
  scroll-snap-stop: ${snapStop};
}`;

  const html = `<div class="snap-container">
  ${Array.from({ length: itemCount }, (_, index) => `<section class="snap-item">Slide ${index + 1}</section>`).join("\n  ")}
</div>`;

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, Math.max(itemCount - 1, 0)));
  }, [itemCount]);

  const snapToIndex = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, itemCount - 1));
    setActiveSlide(nextIndex);
    const item = itemRefs.current[nextIndex];
    item?.scrollIntoView({
      behavior: "smooth",
      inline: align,
      block: isVertical ? align : "nearest",
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rail.scrollLeft,
      startTop: rail.scrollTop,
      dragging: false,
    };
    rail.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const dragState = dragStateRef.current;
    if (!rail || !dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.dragging && Math.abs(deltaX) + Math.abs(deltaY) > 6) {
      dragState.dragging = true;
    }

    if (!dragState.dragging) return;

    event.preventDefault();

    if (!isVertical) {
      rail.scrollLeft = dragState.startLeft - deltaX;
    }
    if (isVertical || isBoth) {
      rail.scrollTop = dragState.startTop - deltaY;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const dragState = dragStateRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    if (dragState?.dragging && !isVertical) {
      const deltaX = event.clientX - dragState.startX;
      if (Math.abs(deltaX) > 40) {
        snapToIndex(activeSlide + (deltaX < 0 ? 1 : -1));
      }
    }
    dragStateRef.current = null;
  };

  const nudgeRail = (direction: "prev" | "next") => {
    snapToIndex(activeSlide + (direction === "next" ? 1 : -1));
  };

  const handleRailWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (isVertical) return;
    const rail = railRef.current;
    if (!rail) return;
    const dominantDelta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(dominantDelta) < 8) return;
    event.preventDefault();
    snapToIndex(activeSlide + (dominantDelta > 0 ? 1 : -1));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Container</div>
            <div className="mt-2 text-sm text-muted-foreground">Build snap-ready carousels, section rails, or full-page scroll experiences and copy the exact CSS once the interaction feels right.</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Axis</span>
              <select value={axis} onChange={(event) => setAxis(event.target.value as "x" | "y" | "both")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="x">x</option>
                <option value="y">y</option>
                <option value="both">both</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Strictness</span>
              <select value={strictness} onChange={(event) => setStrictness(event.target.value as "mandatory" | "proximity")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="mandatory">mandatory</option>
                <option value="proximity">proximity</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Align</span>
              <select value={align} onChange={(event) => setAlign(event.target.value as "start" | "center" | "end")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Snap stop</span>
              <select value={snapStop} onChange={(event) => setSnapStop(event.target.value as "normal" | "always")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="normal">normal</option>
                <option value="always">always</option>
              </select>
            </label>
          </div>

          <Slider label="Items" v={itemCount} on={setItemCount} min={3} max={8} />
          <Slider label="Gap" v={gap} on={setGap} min={0} max={40} />
          <Slider label="Padding" v={padding} on={setPadding} min={0} max={40} />
          <Slider label="Item px" v={itemSize} on={setItemSize} min={140} max={360} step={10} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">type</div>
              <div className="mt-1 text-sm font-semibold">{scrollSnapType}</div>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">align</div>
              <div className="mt-1 text-sm font-semibold">{align}</div>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">stop</div>
              <div className="mt-1 text-sm font-semibold">{snapStop}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[28px] border border-border bg-white p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">scroll snap preview</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{isVertical ? "Section stack" : "Carousel rail"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!isVertical && (
                    <>
                      <button
                        type="button"
                        onClick={() => nudgeRail("prev")}
                        className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeRail("next")}
                        className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent"
                      >
                        Next →
                      </button>
                    </>
                  )}
                  <div className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {scrollSnapType}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-border bg-slate-950 p-2">
                <div
                  ref={railRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onWheel={handleRailWheel}
                  className={(isVertical ? "pr-2 " : "") + (!isVertical ? "cursor-grab active:cursor-grabbing select-none " : "")}
                  style={containerStyle}
                >
                  {Array.from({ length: itemCount }, (_, index) => (
                    <div
                      key={index}
                      ref={(node) => {
                        itemRefs.current[index] = node;
                      }}
                      style={itemStyle}
                      className={
                        "rounded-[22px] border bg-[linear-gradient(145deg,rgba(59,130,246,0.25),rgba(15,23,42,0.92))] p-5 text-left text-white transition " +
                        (activeSlide === index ? "border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "border-white/10")
                      }
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-300">Slide {index + 1}</div>
                      <div className="mt-3 text-xl font-semibold">{index % 2 === 0 ? "Snap-ready content" : "Horizontal/vertical section"}</div>
                      <div className="mt-3 max-w-[18rem] text-sm leading-6 text-slate-300">
                        Use scroll snap for onboarding flows, full-screen sections, product galleries, story rails, or swipeable content blocks.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {!isVertical && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Drag, swipe, use trackpad, mouse wheel, or the buttons above.</div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: itemCount }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => snapToIndex(index)}
                        className={"h-2.5 rounded-full transition " + (activeSlide === index ? "w-8 bg-accent" : "w-2.5 bg-muted-foreground/30")}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Preview>

          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={css} lang="css" />
            <CodeBlock code={html} lang="html" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormsLabTool() {
  const [framework, setFramework] = useState<"vanilla" | "react" | "next">("react");
  const [mode, setMode] = useState<"basic" | "work" | "secure">("work");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [includeCsrf, setIncludeCsrf] = useState(true);
  const [includeHoneypot, setIncludeHoneypot] = useState(true);
  const [useSfdcRelay, setUseSfdcRelay] = useState(true);
  const [values, setValues] = useState({
    fullName: "Jwala Baheliya",
    email: "jwala@example.com",
    phone: "",
    company: "",
    password: "",
    otp: "",
    message: "Need a frontend developer for a landing page.",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

  const endpoint = mode === "secure" ? "/api/contact/secure" : "/api/contact";
  const visibleFields = mode === "basic"
    ? ["fullName", "email", "message"]
    : mode === "work"
      ? ["fullName", "email", "phone", "company", "message"]
      : ["fullName", "email", "password", "otp", "message"];

  const fieldMeta = {
    fullName: { label: "Full name", type: "text", placeholder: "Jwala Baheliya" },
    email: { label: "Email", type: "email", placeholder: "you@example.com" },
    phone: { label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
    company: { label: "Company", type: "text", placeholder: "Acme Inc." },
    password: { label: "Password", type: "password", placeholder: "At least 8 chars, one number" },
    otp: { label: "OTP", type: "text", placeholder: "123456" },
    message: { label: "Message", type: "textarea", placeholder: "Tell me about the project" },
  } as const;

  const validate = (input: typeof values) => {
    const next: Record<string, string> = {};
    if (!input.fullName.trim()) next.fullName = "Full name is required.";
    if (!input.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) next.email = "Enter a valid email address.";
    if (visibleFields.includes("phone") && input.phone && !/^[0-9+()\-\s]{7,20}$/.test(input.phone)) next.phone = "Phone should be 7 to 20 characters.";
    if (visibleFields.includes("password")) {
      if (!input.password.trim()) next.password = "Password is required.";
      else if (!/^(?=.*\d).{8,}$/.test(input.password)) next.password = "Password needs 8+ chars and one number.";
    }
    if (visibleFields.includes("otp") && input.otp && !/^\d{4,6}$/.test(input.otp)) next.otp = "OTP should be 4 to 6 digits.";
    if (!input.message.trim()) next.message = "Message is required.";
    return next;
  };

  const handleValue = (name: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitState("idle");
  };

  const handleDemoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitState("error");
      return;
    }
    setSubmitState("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setSubmitted(
      Object.fromEntries(
        Object.entries(values).filter(([key, value]) => visibleFields.includes(key) && value.trim()),
      ) as Record<string, string>,
    );
    setSubmitState("success");
  };

  const fieldLines = visibleFields.map((field) => {
    const meta = fieldMeta[field as keyof typeof fieldMeta];
    if (meta.type === "textarea") {
      return `      <label>\n        <span>${meta.label}</span>\n        <textarea\n          name="${field}"\n          value={form.${field}}\n          onChange={handleChange}\n          placeholder="${meta.placeholder}"\n          aria-invalid={Boolean(errors.${field})}\n        />\n        {errors.${field} && <small>{errors.${field}}</small>}\n      </label>`;
    }
    return `      <label>\n        <span>${meta.label}</span>\n        <input\n          name="${field}"\n          type="${meta.type}"\n          value={form.${field}}\n          onChange={handleChange}\n          placeholder="${meta.placeholder}"\n          aria-invalid={Boolean(errors.${field})}\n        />\n        {errors.${field} && <small>{errors.${field}}</small>}\n      </label>`;
  }).join("\n\n");

  const initialState = `{
${visibleFields.map((field) => `  ${field}: ${JSON.stringify(values[field as keyof typeof values] || "")},`).join("\n")}
}`;

  const validationBlock = [
    `if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";`,
    `if (!form.email.trim()) nextErrors.email = "Email is required.";`,
    `else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";`,
    visibleFields.includes("phone") ? `if (form.phone && !/^[0-9+()\\-\\s]{7,20}$/.test(form.phone)) nextErrors.phone = "Phone should be 7 to 20 characters.";` : "",
    visibleFields.includes("password") ? `if (!/^(?=.*\\d).{8,}$/.test(form.password)) nextErrors.password = "Password needs 8+ chars and one number.";` : "",
    visibleFields.includes("otp") ? `if (form.otp && !/^\\d{4,6}$/.test(form.otp)) nextErrors.otp = "OTP should be 4 to 6 digits.";` : "",
    `if (!form.message.trim()) nextErrors.message = "Message is required.";`,
  ].filter(Boolean).join("\n    ");

  const frameworkCode = framework === "vanilla"
    ? `const form = document.querySelector("#contact-form");
const status = document.querySelector("[data-status]");

function validate(payload) {
  const errors = {};
  if (!payload.fullName.trim()) errors.fullName = "Full name is required.";
  if (!payload.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload.email)) errors.email = "Enter a valid email address.";
  if (!payload.message.trim()) errors.message = "Message is required.";
  return errors;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  const errors = validate(payload);

  if (Object.keys(errors).length) {
    status.textContent = "Fix validation errors first.";
    return;
  }

  status.textContent = "Submitting...";
  const response = await fetch("${endpoint}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",${includeCsrf ? '\n      "X-CSRF-Token": window.__CSRF_TOKEN__,' : ""}
    },
    body: JSON.stringify(payload),
  });

  status.textContent = response.ok ? "Form submitted successfully." : "Submission failed.";
});`
    : framework === "react"
      ? `import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState(${initialState});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    ${validationBlock}

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus("Fix validation errors first.");
      return;
    }

    setLoading(true);
    setStatus("Submitting...");

    try {
      const response = await fetch("${endpoint}", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",${includeCsrf ? '\n          "X-CSRF-Token": csrfToken,' : ""}
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("Form submitted successfully.");
    } catch {
      setStatus("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
${fieldLines}
      ${includeHoneypot ? '<input type="text" name="website" hidden tabIndex={-1} autoComplete="off" />' : ""}
      <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
    </form>
  );
}`
      : `// app/contact/page.tsx
"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState(${initialState});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    ${validationBlock}

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus("Fix validation errors first.");
      return;
    }

    setLoading(true);
    setStatus("Submitting...");

    try {
      const response = await fetch("${endpoint}", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",${includeCsrf ? '\n          "X-CSRF-Token": csrfToken,' : ""}
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("Form submitted successfully.");
    } catch {
      setStatus("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// app/api/contact/route.ts
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Enter a valid email address."),
${visibleFields.includes("phone") ? '  phone: z.string().regex(/^[0-9+()\\-\\s]{7,20}$/).optional().or(z.literal("")),' : ""}
${visibleFields.includes("company") ? '  company: z.string().optional(),' : ""}
${visibleFields.includes("password") ? '  password: z.string().regex(/^(?=.*\\d).{8,}$/,' + ' "Password needs 8+ chars and one number."),' : ""}
${visibleFields.includes("otp") ? '  otp: z.string().regex(/^\\d{4,6}$/).optional().or(z.literal("")),' : ""}
  message: z.string().min(1, "Message is required."),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return Response.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  return Response.json({ ok: true, message: "Saved successfully" });
}`;

  const apiCode = `// backend route idea
export async function POST(request: Request) {
  const body = await request.json();

  // 1. validate body
  // 2. auth / CSRF / rate limit
  // 3. save to database or CRM

  return Response.json({
    ok: true,
    message: "Saved successfully"
  });
}`;

  const sfdcCode = `// safer SFDC / Salesforce relay
export async function POST(request: Request) {
  const body = await request.json();

  const payload = new URLSearchParams({
    oid: process.env.SFDC_ORG_ID ?? "",
    first_name: body.fullName,
    email: body.email,
    phone: body.phone ?? "",
    company: body.company ?? "",
    description: body.message,
  });

  await fetch("https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  return Response.json({ ok: true });
}`;

  const checklist = [
    "Client validation is for UX. Server validation is for trust.",
    includeCsrf ? "CSRF example is enabled. Use it for cookie-based auth flows." : "CSRF example is off. Turn it on for cookie-based auth flows.",
    includeHoneypot ? "Honeypot example is enabled for basic bot filtering." : "Honeypot example is off for a cleaner minimal form.",
    "Always design loading, success, and error states before wiring the API.",
    "Never trust hidden fields or client-side role checks for permission logic.",
  ];

  const steps = [
    ["1. Fill form", "User types into clearly labeled fields."],
    ["2. Validate", "Client checks required fields and formats."],
    ["3. Submit", "Frontend sends JSON to your API route."],
    ["4. Verify", "Server validates again and applies guardrails."],
    ["5. Save", useSfdcRelay ? "Server saves to DB or forwards safely to SFDC." : "Server saves to your database or CRM."],
    ["6. Respond", "Frontend shows success or field-level errors."],
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-border bg-card p-4 md:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-sky-700">
              Full form flow
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">One complete form, from validation to submit</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                This lab now focuses on one practical flow. Build the form, validate it, submit it to an API, handle success and errors, and then extend the same pattern to Next.js, React, vanilla JavaScript, or SFDC relay flows.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {steps.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-border bg-background p-4">
            <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
              {(["basic", "work", "secure"] as const).map((item) => (
                <button type="button" key={item} onClick={() => setMode(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (mode === item ? "bg-foreground text-background" : "text-muted-foreground")}>
                  {item}
                </button>
              ))}
            </div>
            <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
              {(["vanilla", "react", "next"] as const).map((item) => (
                <button type="button" key={item} onClick={() => setFramework(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (framework === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                  {item}
                </button>
              ))}
            </div>
            <div className="grid gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono">
                <input type="checkbox" checked={includeCsrf} onChange={(event) => setIncludeCsrf(event.target.checked)} />
                CSRF example
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono">
                <input type="checkbox" checked={includeHoneypot} onChange={(event) => setIncludeHoneypot(event.target.checked)} />
                Honeypot field
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono">
                <input type="checkbox" checked={useSfdcRelay} onChange={(event) => setUseSfdcRelay(event.target.checked)} />
                SFDC relay example
              </label>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Current setup</div>
              <div className="mt-2 text-sm text-foreground">{framework} form using `{endpoint}`</div>
              <div className="mt-2 text-sm text-muted-foreground">
                `{mode}` changes the visible fields and validation depth, so the code stays easier to follow.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
          <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_360px]">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Live form preview</div>
                  <div className="mt-2 text-xl font-semibold text-slate-950">Validate first, then submit</div>
                </div>

                <form onSubmit={(event) => void handleDemoSubmit(event)} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleFields.map((field) => {
                      const meta = fieldMeta[field as keyof typeof fieldMeta];
                      const fieldError = errors[field];
                      const isTextarea = meta.type === "textarea";
                      return (
                        <label key={field} className={isTextarea ? "grid gap-1.5 md:col-span-2" : "grid gap-1.5"}>
                          <span className="text-sm font-medium text-slate-900">{meta.label}</span>
                          {isTextarea ? (
                            <textarea
                              value={values[field as keyof typeof values]}
                              onChange={(event) => handleValue(field as keyof typeof values, event.target.value)}
                              placeholder={meta.placeholder}
                              className={"min-h-[140px] rounded-2xl border px-4 py-3 text-sm outline-none transition " + (fieldError ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white focus:border-sky-300")}
                            />
                          ) : (
                            <input
                              type={meta.type}
                              value={values[field as keyof typeof values]}
                              onChange={(event) => handleValue(field as keyof typeof values, event.target.value)}
                              placeholder={meta.placeholder}
                              className={"rounded-2xl border px-4 py-3 text-sm outline-none transition " + (fieldError ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white focus:border-sky-300")}
                            />
                          )}
                          <span className={"min-h-5 text-xs " + (fieldError ? "text-rose-600" : "text-slate-400")}>
                            {fieldError || " "}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {includeHoneypot && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                      Honeypot stays hidden in production, but shown here so the flow is easier to understand.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                      {submitState === "loading" ? "Submitting..." : "Submit form"}
                    </button>
                    <div className={"rounded-full border px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] " + (submitState === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : submitState === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      {submitState === "idle" ? "ready" : submitState}
                    </div>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">What happens here</div>
                  <div className="mt-3 grid gap-3">
                    {checklist.map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Submitted payload</div>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                    {JSON.stringify(submitted ?? Object.fromEntries(Object.entries(values).filter(([key]) => visibleFields.includes(key))), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Preview>

        <div className="grid gap-4 xl:grid-cols-3">
          <CodeBlock code={frameworkCode} lang={framework === "vanilla" ? "js" : "tsx"} />
          <CodeBlock code={apiCode} lang="ts" />
          <CodeBlock code={useSfdcRelay ? sfdcCode : "// SFDC relay is turned off.\n// Use your normal API -> database save flow here."} lang="ts" />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Client validation</div>
            <div className="mt-2 text-sm text-muted-foreground">Use field-level errors, instant feedback, and accessible labels so users know what is wrong before submit.</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Server validation</div>
            <div className="mt-2 text-sm text-muted-foreground">Repeat validation on the server, because browser checks can always be bypassed.</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Submit states</div>
            <div className="mt-2 text-sm text-muted-foreground">Design `loading`, `success`, and `error` states from the start, not as an afterthought.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormEventsCsrfLabTool() {
  const [framework, setFramework] = useState<"vanilla" | "react" | "next">("react");
  const [eventLog, setEventLog] = useState<string[]>(["ready"]);
  const [useCustomValidation, setUseCustomValidation] = useState(true);
  const [includeCsrf, setIncludeCsrf] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pushEvent = (label: string) => {
    setEventLog((current) => [label, ...current].slice(0, 10));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (message.trim().length < 12) next.message = "Message should be at least 12 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmitDemo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushEvent("submit");
    if (useCustomValidation && !validate()) return;
    setErrors({});
    pushEvent("submit success");
  };

  const customValidationJs = `const validateForm = (values) => {
  const errors = {};

  if (!values.name.trim()) errors.name = "Name is required";
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (values.message.trim().length < 12) {
    errors.message = "Message should be at least 12 characters";
  }

  return errors;
};`;

  const csrfJs = `await fetch("/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",${includeCsrf ? '\n    "X-CSRF-Token": csrfToken,' : ""}
  },
  body: JSON.stringify(values),
});`;

  const frameworkCode = framework === "vanilla"
    ? `const form = document.querySelector("#contact-form");
const log = (name) => console.log("[form-event]", name);

form?.addEventListener("focusin", () => log("focusin"));
form?.addEventListener("input", () => log("input"));
form?.addEventListener("change", () => log("change"));
form?.addEventListener("blur", () => log("blur"), true);
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form).entries());
  const errors = ${useCustomValidation ? "validateForm(values)" : "{}"};
  if (Object.keys(errors).length) return;
  ${csrfJs}
});`
    : framework === "next"
      ? `"use client";
import { useState } from "react";

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = ${useCustomValidation ? "validateForm(values)" : "{}"};
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    ${csrfJs}
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* name, email, message */}
    </form>
  );
}

// Route Handler: validate again on server before any DB or email action`
      : `const [values, setValues] = useState({ name: "", email: "", message: "" });
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const nextErrors = ${useCustomValidation ? "validateForm(values)" : "{}"};
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length) return;
  ${csrfJs}
};`;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">What this page teaches</div>
            <div className="mt-2 text-sm text-muted-foreground">One clean lab for form events, custom validation, submit flow, and CSRF protection. Use it to understand what happens before the request ever reaches your backend.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["vanilla", "react", "next"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setFramework(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (framework === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
            <input type="checkbox" checked={useCustomValidation} onChange={(event) => setUseCustomValidation(event.target.checked)} />
            Custom validation
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
            <input type="checkbox" checked={includeCsrf} onChange={(event) => setIncludeCsrf(event.target.checked)} />
            Include CSRF header example
          </label>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Event order to watch</div>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {["focus", "input", "change", "blur", "submit"].map((item) => (
                <div key={item} className="rounded-xl border border-border px-3 py-2">{item}</div>
              ))}
            </div>
          </div>

          <CodeBlock code={customValidationJs} lang="js" />
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                <form onSubmit={onSubmitDemo} className="grid gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Interactive form</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">Try focus, input, blur, and submit</div>
                  </div>
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-900">Name</span>
                    <input value={name} onFocus={() => pushEvent("focus:name")} onInput={() => pushEvent("input:name")} onChange={(e) => { setName(e.target.value); pushEvent("change:name"); }} onBlur={() => { pushEvent("blur:name"); if (useCustomValidation) validate(); }} className="rounded-2xl border border-slate-200 px-3 py-2" />
                    {errors.name && <span className="text-xs text-rose-600">{errors.name}</span>}
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-900">Email</span>
                    <input value={email} onFocus={() => pushEvent("focus:email")} onInput={() => pushEvent("input:email")} onChange={(e) => { setEmail(e.target.value); pushEvent("change:email"); }} onBlur={() => { pushEvent("blur:email"); if (useCustomValidation) validate(); }} className="rounded-2xl border border-slate-200 px-3 py-2" />
                    {errors.email && <span className="text-xs text-rose-600">{errors.email}</span>}
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-900">Message</span>
                    <textarea value={message} onFocus={() => pushEvent("focus:message")} onInput={() => pushEvent("input:message")} onChange={(e) => { setMessage(e.target.value); pushEvent("change:message"); }} onBlur={() => { pushEvent("blur:message"); if (useCustomValidation) validate(); }} className="min-h-[120px] rounded-2xl border border-slate-200 px-3 py-2" />
                    {errors.message && <span className="text-xs text-rose-600">{errors.message}</span>}
                  </label>
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">Submit form</button>
                </form>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Recent events</div>
                    <div className="mt-3 grid gap-2">
                      {eventLog.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">CSRF idea</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">If login uses cookies, a CSRF token helps prove the request came from your real form page. Add it in a header or hidden field and validate it on the server.</div>
                  </div>
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={frameworkCode} lang={framework === "vanilla" ? "js" : "tsx"} />
            <CodeBlock code={csrfJs} lang="js" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReactPlaygroundLabTool() {
  const [section, setSection] = useState<"hooks" | "events">("hooks");
  const [selectedHook, setSelectedHook] = useState("useState");
  const [selectedEvent, setSelectedEvent] = useState("onClick");
  const [name, setName] = useState("Jwala");
  const [step, setStep] = useState(1);
  const [count, setCount] = useState(2);
  const [todos, setTodos] = useState(["Read React docs", "Trace render flow", "Practice events"]);
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);
  const [view, setView] = useState<"learn" | "practice">("learn");
  const [isPending, startTransition] = useTransition();
  const [effectLog, setEffectLog] = useState<string[]>(["ready"]);
  const [eventLog, setEventLog] = useState<string[]>(["ready"]);
  const [shouldStopBubble, setShouldStopBubble] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  const [reducerState, dispatch] = useReducer(
    (state: { count: number; history: string[] }, action: { type: "increment" | "decrement" | "reset" }) => {
      if (action.type === "increment") {
        const next = state.count + step;
        return { count: next, history: [`increment -> ${next}`, ...state.history].slice(0, 6) };
      }
      if (action.type === "decrement") {
        const next = Math.max(0, state.count - step);
        return { count: next, history: [`decrement -> ${next}`, ...state.history].slice(0, 6) };
      }
      return { count: 0, history: ["reset -> 0", ...state.history].slice(0, 6) };
    },
    { count: 2, history: ["ready"] },
  );

  const hookGuides = [
    {
      id: "useState",
      title: "useState",
      summary: "Store local UI state like inputs, toggles, counters, tabs, and loading flags.",
      useWhen: "A single component owns the value and updates are simple.",
      code: `const [count, setCount] = useState(0);

<button onClick={() => setCount((current) => current + 1)}>
  {count}
</button>`,
    },
    {
      id: "useEffect",
      title: "useEffect",
      summary: "Run side effects after render, like fetches, subscriptions, timers, or syncing with outside systems.",
      useWhen: "You need to do something after React commits UI to the screen.",
      code: `useEffect(() => {
  const id = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => clearInterval(id);
}, []);`,
    },
    {
      id: "useRef",
      title: "useRef",
      summary: "Hold a mutable value or DOM reference without causing a re-render.",
      useWhen: "You need to focus an input, measure an element, or keep a mutable instance handle.",
      code: `const inputRef = useRef<HTMLInputElement>(null);

<button onClick={() => inputRef.current?.focus()}>
  Focus input
</button>
<input ref={inputRef} />`,
    },
    {
      id: "useMemo",
      title: "useMemo",
      summary: "Cache an expensive derived value so it recalculates only when inputs change.",
      useWhen: "The calculation is heavy or you need a stable derived value for child props.",
      code: `const filtered = useMemo(() => {
  return items.filter((item) => item.includes(query));
}, [items, query]);`,
    },
    {
      id: "useReducer",
      title: "useReducer",
      summary: "Manage multi-step state transitions when updates become more complex than one setter.",
      useWhen: "You have state with branching actions like increment, reset, add, remove, or wizard steps.",
      code: `const [state, dispatch] = useReducer(reducer, initialState);

dispatch({ type: "increment" });
dispatch({ type: "reset" });`,
    },
    {
      id: "useContext",
      title: "useContext",
      summary: "Read shared values from a provider without drilling props through every component.",
      useWhen: "Theme, auth, locale, feature flags, or app-wide settings need to be shared.",
      code: `const ThemeContext = createContext("light");

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}`,
    },
    {
      id: "useId",
      title: "useId",
      summary: "Generate a stable unique id for accessibility relationships like label -> input.",
      useWhen: "You need predictable ids in reusable components.",
      code: `const id = useId();

<label htmlFor={id}>Email</label>
<input id={id} />`,
    },
    {
      id: "useLayoutEffect",
      title: "useLayoutEffect",
      summary: "Run an effect before the browser paints, usually for measurements or layout correction.",
      useWhen: "You need DOM measurement without visible flicker.",
      code: `useLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect();
  setWidth(rect?.width ?? 0);
}, []);`,
    },
    {
      id: "useTransition",
      title: "useTransition",
      summary: "Mark non-urgent updates so urgent interactions stay responsive.",
      useWhen: "Switching views, filtering larger lists, or triggering slower UI updates.",
      code: `const [isPending, startTransition] = useTransition();

startTransition(() => {
  setView("results");
});`,
    },
    {
      id: "useDeferredValue",
      title: "useDeferredValue",
      summary: "Lag a value slightly so the UI can stay snappy while expensive work catches up.",
      useWhen: "Typing into a search field that drives a heavier filtered view.",
      code: `const deferredQuery = useDeferredValue(query);

const filtered = useMemo(() => {
  return items.filter((item) => item.includes(deferredQuery));
}, [items, deferredQuery]);`,
    },
  ] as const;

  const eventGuides = [
    {
      id: "onClick",
      title: "onClick",
      summary: "Respond to button presses, card actions, toggles, and custom UI controls.",
      useWhen: "A user intentionally activates something with pointer or keyboard.",
      code: `<button onClick={() => saveDraft()}>Save draft</button>`,
    },
    {
      id: "onChange",
      title: "onChange",
      summary: "Read the latest value from text inputs, textareas, and selects.",
      useWhen: "You want controlled form state in React.",
      code: `const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>`,
    },
    {
      id: "onSubmit",
      title: "onSubmit",
      summary: "Own the form submit flow and prevent full page reload.",
      useWhen: "Validating, posting data, or handling errors in a React form.",
      code: `<form onSubmit={(event) => {
  event.preventDefault();
  handleSubmit();
}} />`,
    },
    {
      id: "onFocus / onBlur",
      title: "onFocus / onBlur",
      summary: "Track field entry/exit for hints, validation timing, or active styling.",
      useWhen: "You want to reveal helper text or validate after the user leaves a field.",
      code: `<input
  onFocus={() => setActive(true)}
  onBlur={() => setActive(false)}
/>`,
    },
    {
      id: "onKeyDown",
      title: "onKeyDown",
      summary: "Watch keyboard shortcuts, Enter presses, Escape, and accessibility actions.",
      useWhen: "Implementing command input, modal escape, or keyboard-first UX.",
      code: `<input
  onKeyDown={(event) => {
    if (event.key === "Enter") submit();
  }}
/>`,
    },
    {
      id: "onPointerDown",
      title: "onPointerDown",
      summary: "Handle lower-level pointer interactions for drag, press, or drawing style UIs.",
      useWhen: "Building sliders, canvases, drag surfaces, or press interactions.",
      code: `<div
  onPointerDown={(event) => beginDrag(event.clientX, event.clientY)}
/>`,
    },
  ] as const;

  const selectedHookGuide = hookGuides.find((item) => item.id === selectedHook) ?? hookGuides[0];
  const selectedEventGuide = eventGuides.find((item) => item.id === selectedEvent) ?? eventGuides[0];

  const filteredTodos = useMemo(() => {
    const term = deferredFilter.trim().toLowerCase();
    if (!term) return todos;
    return todos.filter((todo) => todo.toLowerCase().includes(term));
  }, [deferredFilter, todos]);

  const derivedSummary = useMemo(() => {
    return `${name} is practicing ${todos.length} React items with a count of ${count}.`;
  }, [count, name, todos.length]);

  useEffect(() => {
    if (section !== "hooks") return;
    setEffectLog((current) => [`effect -> count ${count}`, ...current].slice(0, 6));
  }, [count, section]);

  const switchView = (nextView: "learn" | "practice") => {
    startTransition(() => {
      setView(nextView);
    });
  };

  const pushEventLog = (label: string) => {
    setEventLog((current) => [label, ...current].slice(0, 8));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-border bg-card p-4 md:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-emerald-700">
              React study section
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">Learn React hooks and events with code-first examples</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                This section is built like a study surface. Pick a hook or event, read what it does, copy the exact pattern, and use the live sandbox to see the behavior instead of memorizing disconnected snippets.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Hooks covered</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{hookGuides.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Events covered</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{eventGuides.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Live mode</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{section === "hooks" ? selectedHookGuide.title : selectedEventGuide.title}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Goal</div>
                <div className="mt-2 text-sm font-semibold text-foreground">Learn by reading and touching the code.</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-border bg-background p-4">
            <div className="inline-flex w-full rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
              {(["hooks", "events"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setSection(item)}
                  className={"flex-1 rounded-xl px-3 py-2 transition " + (section === item ? "bg-foreground text-background" : "text-muted-foreground")}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">How to study this</div>
              <div className="mt-2 text-sm leading-7 text-muted-foreground">Pick one item, read the example, then trigger the live sandbox until you can explain why the UI changed.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-border bg-card p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{section === "hooks" ? "Hooks catalog" : "Events catalog"}</div>
          <div className="mt-3 space-y-2">
            {(section === "hooks" ? hookGuides : eventGuides).map((item) => {
              const active = section === "hooks" ? selectedHook === item.id : selectedEvent === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => section === "hooks" ? setSelectedHook(item.id) : setSelectedEvent(item.id)}
                  className={"w-full rounded-2xl border px-3 py-3 text-left transition " + (active ? "border-accent bg-accent/10 text-accent" : "border-border bg-background text-foreground hover:border-accent/40")}
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs leading-6 text-muted-foreground">{item.summary}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-border bg-card p-4 md:p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_360px]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Reference</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{section === "hooks" ? selectedHookGuide.title : selectedEventGuide.title}</div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{section === "hooks" ? selectedHookGuide.summary : selectedEventGuide.summary}</p>
                <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Use it when</div>
                  <div className="mt-2 text-sm leading-7 text-foreground">{section === "hooks" ? selectedHookGuide.useWhen : selectedEventGuide.useWhen}</div>
                </div>
              </div>
              <CodeBlock code={section === "hooks" ? selectedHookGuide.code : selectedEventGuide.code} lang="tsx" />
            </div>
          </div>

          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              {section === "hooks" ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_320px]">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Hooks sandbox</div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">Change state, trigger reducer updates, and watch effects log</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-1.5">
                        <span className="text-sm font-medium text-slate-900">Name</span>
                        <input ref={inputRef} id={generatedId} value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-sm font-medium text-slate-900">Step</span>
                        <input type="number" min={1} max={5} value={step} onChange={(event) => setStep(Math.max(1, Number(event.target.value) || 1))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => setCount((current) => current + step)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">useState +{step}</button>
                      <button type="button" onClick={() => dispatch({ type: "increment" })} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Reducer +{step}</button>
                      <button type="button" onClick={() => setTodos((current) => [...current, `Practice ${selectedHookGuide.title}`])} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Add todo</button>
                      <button type="button" onClick={() => inputRef.current?.focus()} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Focus input</button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">useState count</div>
                        <div className="mt-2 text-4xl font-semibold text-slate-950">{count}</div>
                      </div>
                      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">useReducer count</div>
                        <div className="mt-2 text-4xl font-semibold text-slate-950">{reducerState.count}</div>
                      </div>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">useTransition + useDeferredValue</div>
                          <div className="mt-2 text-sm text-slate-700">Switch view and filter todos without blocking the UI.</div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => switchView("learn")} className={"rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-[0.2em] " + (view === "learn" ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-600")}>Learn</button>
                          <button type="button" onClick={() => switchView("practice")} className={"rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-[0.2em] " + (view === "practice" ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-600")}>Practice</button>
                        </div>
                      </div>
                      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter todos" className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                      <div className="mt-2 text-xs text-slate-500">{isPending ? "transition pending..." : `deferred filter: ${deferredFilter || "none"}`}</div>
                      <div className="mt-3 space-y-2">
                        {filteredTodos.map((todo) => (
                          <div key={todo} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">{view === "learn" ? todo : `Practice: ${todo}`}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Derived summary</div>
                      <div className="mt-2 text-sm leading-7 text-slate-700">{derivedSummary}</div>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Recent effect logs</div>
                      <div className="mt-3 space-y-2">
                        {effectLog.map((item) => (
                          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Reducer history</div>
                      <div className="mt-3 space-y-2">
                        {reducerState.history.map((item) => (
                          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_320px]">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Events sandbox</div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">Trigger form and pointer events, then inspect the order</div>
                    </div>
                    <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <input type="checkbox" checked={shouldStopBubble} onChange={(event) => setShouldStopBubble(event.target.checked)} />
                      stop bubbling when clicking the inner button
                    </label>
                    <div
                      onClick={() => pushEventLog("parent click")}
                      onPointerDown={() => pushEventLog("pointer down")}
                      className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Parent zone</div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            pushEventLog("button click");
                            if (shouldStopBubble) event.stopPropagation();
                          }}
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
                        >
                          Inner button
                        </button>
                        <input
                          value={inputValue}
                          onChange={(event) => {
                            setInputValue(event.target.value);
                            pushEventLog(`change -> ${event.target.value || "empty"}`);
                          }}
                          onFocus={() => pushEventLog("focus")}
                          onBlur={() => pushEventLog("blur")}
                          onKeyDown={(event) => pushEventLog(`key -> ${event.key}`)}
                          placeholder="Type and press a key"
                          className="min-w-[220px] rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                        />
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            pushEventLog("submit");
                          }}
                          className="flex"
                        >
                          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
                            Submit
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Event log</div>
                    <div className="mt-3 space-y-2">
                      {eventLog.map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Preview>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">What to notice</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                <div>Hooks solve different jobs. State stores values, effects sync with the outside world, refs hold mutable handles, reducers model transitions.</div>
                <div>Events are just inputs to your UI state machine. Log them until you can predict their order before clicking.</div>
                <div>The best way to learn React is to connect behavior to code, not memorize isolated API names.</div>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Practice prompts</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                <div>Rewrite the counter so every change goes through the reducer only.</div>
                <div>Add field validation to the events sandbox and inspect when `blur` should run.</div>
                <div>Turn the filtered todos into server data later and compare `useEffect` vs event-driven fetch.</div>
              </div>
            </div>
            <CodeBlock code={section === "hooks" ? selectedHookGuide.code : selectedEventGuide.code} lang="tsx" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseLabTool() {
  const [backend, setBackend] = useState<"sql" | "prisma" | "mongo" | "supabase">("prisma");
  const [operation, setOperation] = useState<"create" | "read" | "update" | "delete">("create");
  const [tableName, setTableName] = useState("leads");
  const [recordId, setRecordId] = useState("lead_101");
  const [queryField, setQueryField] = useState("email");
  const [payloadText, setPayloadText] = useState('{\n  "name": "Jwala Baheliya",\n  "email": "jwala@example.com",\n  "message": "Need a frontend developer for a landing page.",\n  "status": "new"\n}');

  const parsedPayload = useMemo(() => {
    try {
      return { value: JSON.parse(payloadText) as Record<string, string>, error: "" };
    } catch (error) {
      return { value: {} as Record<string, string>, error: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }, [payloadText]);

  const columns = Object.keys(parsedPayload.value);
  const queryValue = String(parsedPayload.value[queryField] ?? recordId);
  const sql = operation === "create"
    ? `INSERT INTO ${tableName} (${columns.join(", ")})\nVALUES (${columns.map((key) => `'${String(parsedPayload.value[key] ?? "")}'`).join(", ")});`
    : operation === "read"
      ? `SELECT * FROM ${tableName}\nWHERE ${queryField} = '${queryValue}'\nORDER BY created_at DESC;`
      : operation === "update"
        ? `UPDATE ${tableName}\nSET ${columns.filter((key) => key !== "id").map((key) => `${key} = '${String(parsedPayload.value[key] ?? "")}'`).join(",\n    ")}\nWHERE id = '${recordId}';`
        : `DELETE FROM ${tableName}\nWHERE id = '${recordId}';`;
  const prisma = operation === "create"
    ? `await prisma.${tableName}.create({\n  data: ${JSON.stringify(parsedPayload.value, null, 2)}\n});`
    : operation === "read"
      ? `const rows = await prisma.${tableName}.findMany({\n  where: {\n    ${queryField}: ${JSON.stringify(queryValue)}\n  },\n  orderBy: { createdAt: "desc" }\n});`
      : operation === "update"
        ? `await prisma.${tableName}.update({\n  where: { id: ${JSON.stringify(recordId)} },\n  data: ${JSON.stringify(parsedPayload.value, null, 2)}\n});`
        : `await prisma.${tableName}.delete({\n  where: { id: ${JSON.stringify(recordId)} }\n});`;
  const mongo = operation === "create"
    ? `await db.collection("${tableName}").insertOne(${JSON.stringify(parsedPayload.value, null, 2)});`
    : operation === "read"
      ? `const rows = await db.collection("${tableName}")\n  .find({ ${queryField}: ${JSON.stringify(queryValue)} })\n  .sort({ createdAt: -1 })\n  .toArray();`
      : operation === "update"
        ? `await db.collection("${tableName}").updateOne(\n  { _id: ${JSON.stringify(recordId)} },\n  { $set: ${JSON.stringify(parsedPayload.value, null, 2)} }\n);`
        : `await db.collection("${tableName}").deleteOne({ _id: ${JSON.stringify(recordId)} });`;
  const supabase = operation === "create"
    ? `await supabase.from("${tableName}").insert(${JSON.stringify(parsedPayload.value, null, 2)});`
    : operation === "read"
      ? `const { data, error } = await supabase\n  .from("${tableName}")\n  .select("*")\n  .eq("${queryField}", ${JSON.stringify(queryValue)})\n  .order("created_at", { ascending: false });`
      : operation === "update"
        ? `await supabase\n  .from("${tableName}")\n  .update(${JSON.stringify(parsedPayload.value, null, 2)})\n  .eq("id", ${JSON.stringify(recordId)});`
        : `await supabase\n  .from("${tableName}")\n  .delete()\n  .eq("id", ${JSON.stringify(recordId)});`;
  const activeCode = backend === "sql" ? sql : backend === "prisma" ? prisma : backend === "mongo" ? mongo : supabase;
  const method = operation === "create" ? "POST" : operation === "read" ? "GET" : operation === "update" ? "PATCH" : "DELETE";
  const routeCode = `// Next.js route handler\nexport async function ${method}(request: Request) {\n  ${operation === "read" ? `const url = new URL(request.url);\n  const ${queryField} = url.searchParams.get("${queryField}");` : "const body = await request.json();"}\n\n  // 1. auth / csrf / rate limit\n  // 2. validate and sanitize input\n  // 3. run the database operation\n\n  return Response.json({\n    ok: true,\n    operation: "${operation}",\n    resource: "${tableName}"\n  });\n}`;
  const responseCode = operation === "create"
    ? `{\n  "ok": true,\n  "id": "${recordId}",\n  "created": true\n}`
    : operation === "read"
      ? `{\n  "ok": true,\n  "items": [\n    ${JSON.stringify(parsedPayload.value, null, 4).replace(/\n/g, "\n    ")}\n  ]\n}`
      : operation === "update"
        ? `{\n  "ok": true,\n  "id": "${recordId}",\n  "updated": true\n}`
        : `{\n  "ok": true,\n  "id": "${recordId}",\n  "deleted": true\n}`;
  const operationLabel = operation === "create" ? `Create ${tableName}` : operation === "read" ? `Read ${tableName}` : operation === "update" ? `Update ${tableName}` : `Delete ${tableName}`;
  const operationSummary = operation === "create"
    ? "Collect fields in the UI, validate them in your API layer, and create a new database row or document."
    : operation === "read"
      ? "Fetch filtered records safely, shape the response, and return only the fields the UI actually needs."
      : operation === "update"
        ? "Load the current record, validate the changed fields, and patch the existing record predictably."
        : "Confirm intent, authorize the action, and remove the record with a clear success response.";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Flow</div>
            <div className="mt-2 text-sm text-muted-foreground">Move through the full CRUD path from frontend input to API validation and database write or read logic for SQL, Prisma, Mongo, or Supabase.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["sql", "prisma", "mongo", "supabase"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setBackend(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (backend === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["create", "read", "update", "delete"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setOperation(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (operation === item ? "bg-foreground text-background" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Collection / table</span>
            <input value={tableName} onChange={(e) => setTableName(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Record id</span>
              <input value={recordId} onChange={(e) => setRecordId(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Query field</span>
              <input value={queryField} onChange={(e) => setQueryField(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Payload editor</span>
            <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} className="min-h-[220px] rounded-2xl border border-border bg-background p-3 text-xs leading-6" spellCheck={false} />
          </label>

          <div className={"rounded-2xl border p-4 text-xs " + (parsedPayload.error ? "border-rose-500/40 bg-rose-500/10 text-rose-700" : "border-border bg-background text-muted-foreground")}>
            <div className="font-mono uppercase tracking-widest">{parsedPayload.error ? "Payload error" : "Columns detected"}</div>
            <div className="mt-2">{parsedPayload.error ? parsedPayload.error : columns.join(", ") || "none"}</div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">CRUD map</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{operationLabel}</div>
                  <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{operationSummary}</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.24em] text-slate-600">
                  {method} /api/{tableName}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {[
                  ["1. UI", operation === "read" ? "Search, filter, table, detail view" : operation === "delete" ? "Confirm intent before deletion" : "Form or action button triggers the request"],
                  ["2. API", `${method} route validates, sanitizes, and shapes the response`],
                  ["3. Guardrails", "Auth, CSRF, rate limit, audit trail, field allowlist"],
                  ["4. Database", operation === "create" ? `Create in ${tableName}` : operation === "read" ? `Query ${tableName}` : operation === "update" ? `Update ${tableName}` : `Delete from ${tableName}`],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Payload preview</div>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">{payloadText}</pre>
                </div>
                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Frontend + API checklist</div>
                  <div className="mt-3 grid gap-3">
                    {[
                      operation === "read"
                        ? "Use loading, empty, success, and error UI states for fetch-heavy screens."
                        : "Frontend should never write raw unchecked data straight into a database.",
                      operation === "delete"
                        ? "Delete flows need confirm modals, permission checks, and a restore strategy when possible."
                        : "API layer is where validation, auth, CSRF checks, and business rules should live.",
                      operation === "update"
                        ? "Patch only editable fields and return the updated record for optimistic UI sync."
                        : "Your UI should expect success, validation error, and server error states clearly.",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 xl:grid-cols-3">
            <CodeBlock code={activeCode} lang={backend === "sql" ? "sql" : backend === "mongo" ? "js" : "ts"} />
            <CodeBlock code={routeCode} lang="ts" />
            <CodeBlock code={responseCode} lang="json" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FrontendBackendLabTool() {
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "production">("beginner");
  const [framework, setFramework] = useState<"vanilla" | "react" | "next">("react");
  const [resource, setResource] = useState("leads");
  const [action, setAction] = useState<"fetch-list" | "create-item" | "update-item" | "delete-item">("fetch-list");
  const [authMode, setAuthMode] = useState<"public" | "bearer" | "cookie">("cookie");
  const [optimistic, setOptimistic] = useState(true);

  const actionLabel = action === "fetch-list"
    ? "Load list"
    : action === "create-item"
      ? "Create item"
      : action === "update-item"
        ? "Update item"
        : "Delete item";
  const method = action === "fetch-list" ? "GET" : action === "create-item" ? "POST" : action === "update-item" ? "PATCH" : "DELETE";
  const endpoint = `/api/${resource}${action === "fetch-list" ? "?page=1&limit=10" : "/lead_101"}`;
  const bodyExample = action === "fetch-list"
    ? ""
    : action === "create-item"
      ? `{\n  "name": "Jwala Baheliya",\n  "email": "jwala@example.com",\n  "status": "new"\n}`
      : action === "update-item"
        ? `{\n  "status": "qualified",\n  "priority": "high"\n}`
        : `{\n  "reason": "duplicate request"\n}`;

  const frontendCode = framework === "vanilla"
    ? `const state = {\n  loading: false,\n  error: "",\n  items: []\n};\n\nasync function ${action === "fetch-list" ? "loadLeads" : action === "create-item" ? "createLead" : action === "update-item" ? "updateLead" : "deleteLead"}() {\n  state.loading = true;\n  state.error = "";\n\n  try {\n    const response = await fetch("${endpoint}", {\n      method: "${method}",\n      headers: {\n        "Content-Type": "application/json"${authMode === "bearer" ? ',\n        "Authorization": "Bearer <token>"' : ""}\n      }${bodyExample ? `,\n      body: JSON.stringify(${bodyExample})` : ""}\n    });\n\n    if (!response.ok) throw new Error("Request failed");\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    state.error = error instanceof Error ? error.message : "Unknown error";\n  } finally {\n    state.loading = false;\n  }\n}`
    : framework === "react"
      ? `const [items, setItems] = useState([]);\nconst [loading, setLoading] = useState(false);\nconst [error, setError] = useState("");\n\nasync function ${action === "fetch-list" ? "loadLeads" : action === "create-item" ? "createLead" : action === "update-item" ? "updateLead" : "deleteLead"}() {\n  setLoading(true);\n  setError("");\n\n  try {\n    const response = await fetch("${endpoint}", {\n      method: "${method}",\n      headers: {\n        "Content-Type": "application/json"${authMode === "bearer" ? ',\n        "Authorization": "Bearer <token>"' : ""}\n      }${bodyExample ? `,\n      body: JSON.stringify(${bodyExample})` : ""}\n    });\n\n    if (!response.ok) throw new Error("Request failed");\n    const data = await response.json();\n    ${action === "fetch-list" ? "setItems(data.items ?? []);" : optimistic ? "// optimistic UI: update local state first, then revalidate if needed" : "// re-fetch the list after mutation if that fits your screen"}\n  } catch (error) {\n    setError(error instanceof Error ? error.message : "Unknown error");\n  } finally {\n    setLoading(false);\n  }\n}`
      : `// app/${resource}/page.tsx\n"use client";\n\nimport { useTransition, useState } from "react";\n\nexport function ${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}Panel() {\n  const [pending, startTransition] = useTransition();\n  const [error, setError] = useState("");\n\n  async function handleAction() {\n    startTransition(async () => {\n      setError("");\n      try {\n        const response = await fetch("${endpoint}", {\n          method: "${method}",\n          headers: {\n            "Content-Type": "application/json"${authMode === "bearer" ? ',\n            "Authorization": "Bearer <token>"' : ""}\n          }${bodyExample ? `,\n          body: JSON.stringify(${bodyExample})` : ""}\n        });\n\n        if (!response.ok) throw new Error("Request failed");\n      } catch (error) {\n        setError(error instanceof Error ? error.message : "Unknown error");\n      }\n    });\n  }\n\n  return <button onClick={handleAction} disabled={pending}>${actionLabel}</button>;\n}`;

  const routeCode = `// app/api/${resource}${action === "fetch-list" ? "/route.ts" : "/[id]/route.ts"}\nexport async function ${method}(request: Request${action === "fetch-list" ? "" : ", { params }: { params: { id: string } }"}) {\n  ${action === "fetch-list"
    ? `const url = new URL(request.url);\n  const page = Number(url.searchParams.get("page") ?? "1");\n  const limit = Number(url.searchParams.get("limit") ?? "10");`
    : "const body = await request.json();"}\n\n  // 1. authenticate user\n  // 2. validate input and allowlisted fields\n  // 3. call service / database layer\n  // 4. return shaped JSON the UI can actually use\n\n  return Response.json({\n    ok: true,\n    action: "${action}",\n    resource: "${resource}"\n  });\n}`;

  const serviceCode = action === "fetch-list"
    ? `export async function list${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}() {\n  // service layer keeps route handlers thin\n  return db.${resource}.findMany({\n    orderBy: { createdAt: "desc" },\n    take: 10\n  });\n}`
    : action === "create-item"
      ? `export async function create${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}(input: Create${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}Input) {\n  return db.${resource}.create({ data: input });\n}`
      : action === "update-item"
        ? `export async function update${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}(id: string, input: Update${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}Input) {\n  return db.${resource}.update({\n    where: { id },\n    data: input\n  });\n}`
        : `export async function delete${resource[0]?.toUpperCase() ?? "R"}${resource.slice(1)}(id: string) {\n  return db.${resource}.delete({ where: { id } });\n}`;

  const levelNotes = level === "beginner"
    ? [
        "Start with one screen, one button, one API route, and one predictable JSON response.",
        "Always show loading, success, empty, and error states. That is real frontend work.",
        "Do not connect components directly to the database. Go through an API or server layer.",
      ]
    : level === "intermediate"
      ? [
          "Separate UI state from fetch logic so your components stay readable.",
          "Normalize validation errors into a shape your inputs can render easily.",
          "Reuse a small API helper instead of duplicating fetch options everywhere.",
        ]
      : level === "advanced"
        ? [
            "Use optimistic updates carefully for faster-feeling UI, but keep rollback paths.",
            "Keep route handlers thin and move business logic into services.",
            "Return only the fields the screen needs, not the whole database record.",
          ]
        : [
            "Add auth, CSRF or cookie/session strategy, rate limiting, and audit logging.",
            "Document error contracts so frontend and backend agree on field names and codes.",
            "Think in retries, idempotency, observability, and rollback-safe mutations.",
          ];

  const stageCards = [
    ["1. Browser UI", action === "fetch-list" ? "Page load, filter, or search starts the request." : "Form submit or action button starts the mutation."],
    ["2. Frontend state", "Track loading, success, empty, and error state clearly."],
    ["3. API route", `${method} ${endpoint} validates and shapes the response.`],
    ["4. Service layer", "Business rules stay outside the component and outside the route body."],
    ["5. Database", action === "fetch-list" ? `Read from ${resource}` : `${actionLabel} in ${resource} safely.`],
    ["6. UI update", optimistic && action !== "fetch-list" ? "Optimistic state updates instantly, then revalidates." : "UI refreshes from trusted response data."],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Zero to hero map</div>
            <div className="mt-2 text-sm text-muted-foreground">A guided lab for understanding how a frontend talks to a backend properly, from the first fetch call to production-ready patterns.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["beginner", "intermediate", "advanced", "production"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setLevel(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (level === item ? "bg-foreground text-background" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["vanilla", "react", "next"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setFramework(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (framework === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Action</span>
              <select value={action} onChange={(event) => setAction(event.target.value as typeof action)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="fetch-list">fetch list</option>
                <option value="create-item">create item</option>
                <option value="update-item">update item</option>
                <option value="delete-item">delete item</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Auth mode</span>
              <select value={authMode} onChange={(event) => setAuthMode(event.target.value as typeof authMode)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="public">public</option>
                <option value="bearer">bearer token</option>
                <option value="cookie">cookie session</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Resource name</span>
            <input value={resource} onChange={(event) => setResource(event.target.value.replace(/\s+/g, "-").toLowerCase() || "leads")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={optimistic} onChange={(event) => setOptimistic(event.target.checked)} />
            <span>Show optimistic UI pattern for mutations</span>
          </label>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">What changes here</div>
            <div className="mt-2 text-sm text-foreground">{framework} + {actionLabel.toLowerCase()} + {authMode} auth</div>
            <div className="mt-2 text-sm text-muted-foreground">The examples update together so beginners can see how frontend code, the API route, and the service layer connect.</div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Frontend → backend learning flow</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{actionLabel} with {framework}</div>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    Learn the proper connection path: browser event, frontend state, API request, validation, service layer, database work, and UI refresh.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.24em] text-slate-600">
                  {method} {endpoint}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {stageCards.map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-4 text-slate-100">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Mental model</div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <div><span className="text-slate-400">Frontend owns:</span> form state, loading UI, retries, empty/error/success UX.</div>
                    <div><span className="text-slate-400">Backend owns:</span> trust, validation, auth, business rules, database writes.</div>
                    <div><span className="text-slate-400">Shared contract:</span> endpoint shape, field names, status codes, error format.</div>
                  </div>
                  {bodyExample ? (
                    <pre className="mt-4 overflow-auto rounded-2xl bg-white/5 p-4 font-mono text-xs leading-6 text-slate-100">{bodyExample}</pre>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">This flow uses query params more than a JSON body because it is a read request.</div>
                  )}
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">{level} guidance</div>
                  <div className="mt-3 grid gap-3">
                    {levelNotes.map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 xl:grid-cols-3">
            <CodeBlock code={frontendCode} lang={framework === "next" ? "tsx" : "ts"} />
            <CodeBlock code={routeCode} lang="ts" />
            <CodeBlock code={serviceCode} lang="ts" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RestApiLabTool() {
  const [framework, setFramework] = useState<"vanilla" | "react" | "next">("react");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET");
  const [auth, setAuth] = useState<"none" | "bearer" | "cookie">("bearer");
  const [endpoint, setEndpoint] = useState("/api/users?page=1&limit=10");
  const [status, setStatus] = useState<200 | 201 | 400 | 401 | 404 | 500>(200);
  const [payloadText, setPayloadText] = useState('{\n  "name": "Jwala Baheliya",\n  "role": "Senior Frontend Developer"\n}');

  const parsedPayload = useMemo(() => {
    try {
      return { value: JSON.parse(payloadText), error: "" };
    } catch (error) {
      return { value: {}, error: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }, [payloadText]);

  const responseMap = {
    200: { title: "200 OK", body: { data: [{ id: 1, name: "Jwala" }], page: 1, limit: 10 } },
    201: { title: "201 Created", body: { id: 18, created: true } },
    400: { title: "400 Bad Request", body: { error: "Validation failed", fields: { name: "Required" } } },
    401: { title: "401 Unauthorized", body: { error: "Missing or invalid token" } },
    404: { title: "404 Not Found", body: { error: "Resource not found" } },
    500: { title: "500 Server Error", body: { error: "Unexpected server error" } },
  } as const;

  const fetchCode = `const response = await fetch("${endpoint}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",${auth === "bearer" ? '\n    "Authorization": "Bearer <token>",' : ""}
  },${method === "GET" || method === "DELETE" ? "" : `\n  body: JSON.stringify(${JSON.stringify(parsedPayload.value, null, 2)}),`}
});

if (!response.ok) {
  throw new Error("Request failed");
}

const data = await response.json();`;

  const reactCode = `const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const callApi = async () => {
  setLoading(true);
  setError("");
  try {
    ${fetchCode.split("\n").join("\n    ")}
    setData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setLoading(false);
  }
};`;

  const nextCode = `// app/api/users/route.ts
export async function ${method === "DELETE" ? "DELETE" : method}(request: Request) {
  ${method === "GET" ? "const { searchParams } = new URL(request.url);" : "const body = await request.json();"}
  // validate input, auth, and business rules here
  return Response.json(${JSON.stringify(responseMap[status].body, null, 2)}, { status: ${status} });
}`;

  const beginnerNotes = [
    "GET reads data. POST creates. PUT replaces. PATCH updates partly. DELETE removes.",
    "Status codes matter as much as the JSON body. Your UI should react differently to 200, 400, 401, and 500.",
    "Frontend should handle loading, empty, success, and error states clearly.",
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">REST API concepts</div>
            <div className="mt-2 text-sm text-muted-foreground">Learn methods, headers, auth, payloads, status codes, and response handling in one place before wiring the request into a real UI.</div>
          </div>

          <div className="inline-flex w-full flex-wrap rounded-2xl border border-border p-1 text-[11px] font-mono uppercase tracking-wide">
            {(["vanilla", "react", "next"] as const).map((item) => (
              <button type="button" key={item} onClick={() => setFramework(item)} className={"flex-1 rounded-xl px-3 py-2 transition " + (framework === item ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Method</span>
              <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-mono">
              <span className="uppercase tracking-widest text-muted-foreground">Auth</span>
              <select value={auth} onChange={(e) => setAuth(e.target.value as typeof auth)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="none">none</option>
                <option value="bearer">bearer token</option>
                <option value="cookie">cookie session</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Endpoint</span>
            <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </label>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Example payload</span>
            <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} className="min-h-[180px] rounded-2xl border border-border bg-background p-3 text-xs leading-6" spellCheck={false} />
          </label>

          <label className="grid gap-1.5 text-xs font-mono">
            <span className="uppercase tracking-widest text-muted-foreground">Example status</span>
            <select value={status} onChange={(e) => setStatus(Number(e.target.value) as typeof status)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {[200, 201, 400, 401, 404, 500].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <div className={"rounded-2xl border p-4 text-xs " + (parsedPayload.error ? "border-rose-500/40 bg-rose-500/10 text-rose-700" : "border-border bg-background text-muted-foreground")}>
            <div className="font-mono uppercase tracking-widest">{parsedPayload.error ? "Payload error" : "Quick reminder"}</div>
            <div className="mt-2">{parsedPayload.error ? parsedPayload.error : "For GET requests, query params usually matter more than the request body."}</div>
          </div>
        </div>

        <div className="space-y-4">
          <Preview className="overflow-hidden p-4 sm:p-6" dark={false}>
            <div className="w-full rounded-[30px] border border-border bg-white p-4 text-left shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1.02fr_.98fr]">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-slate-700">
                    REST API lab
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Beginner to advanced request flow</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      A frontend should know what request it is sending, what success looks like, and how to react when the API answers with validation, auth, or server errors.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {beginnerNotes.map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-4 text-slate-100">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">Request summary</div>
                    <div className="mt-3 grid gap-2 text-sm">
                      <div><span className="text-slate-400">Method:</span> {method}</div>
                      <div><span className="text-slate-400">Endpoint:</span> {endpoint}</div>
                      <div><span className="text-slate-400">Auth:</span> {auth}</div>
                      <div><span className="text-slate-400">Framework tab:</span> {framework}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">Sample response</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{responseMap[status].title}</div>
                    <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-white p-4 font-mono text-xs leading-6 text-slate-900">{JSON.stringify(responseMap[status].body, null, 2)}</pre>
                  </div>
                  <div className="rounded-[26px] border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">How your UI should react</div>
                    <div className="mt-3 grid gap-3">
                      {status === 200 || status === 201 ? (
                        <>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">Show success state and update the screen with fresh data.</div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">Optionally reset the form or revalidate the list.</div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">Show a clear error state instead of silently failing.</div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">Handle retry, login redirect, or field errors depending on the status code.</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Preview>

          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={framework === "vanilla" ? fetchCode : framework === "react" ? reactCode : nextCode} lang={framework === "next" ? "ts" : "js"} />
            <CodeBlock code={`// HTTP ideas to remember\n// GET    -> read data\n// POST   -> create data\n// PUT    -> replace data\n// PATCH  -> partially update data\n// DELETE -> remove data\n\n// Typical headers\n// Content-Type: application/json\n${auth === "bearer" ? "// Authorization: Bearer <token>\n" : ""}// Accept: application/json`} lang="http" />
          </div>
        </div>
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

function ImageCompressorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<Array<{
    id: string;
    fileName: string;
    inputType: string;
    inputSize: number;
    width: number;
    height: number;
    outputWidth: number;
    outputHeight: number;
    sourceUrl: string;
    outputUrl: string;
    outputSize: number | null;
    outputBlob: Blob | null;
    error: string;
  }>>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [format, setFormat] = useState<"original" | "jpeg" | "webp" | "png">("original");
  const [quality, setQuality] = useState(0.78);
  const [maxWidth, setMaxWidth] = useState(1600);

  useEffect(() => () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.sourceUrl);
      URL.revokeObjectURL(item.outputUrl);
    });
  }, [items]);

  const formatLabel = {
    original: "Keep format",
    jpeg: "JPEG",
    webp: "WebP",
    png: "PNG",
  } as const;

  const prettySize = (bytes: number | null) =>
    bytes == null ? "-" : bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  const totalOriginal = items.reduce((sum, item) => sum + item.inputSize, 0);
  const totalCompressed = items.reduce((sum, item) => sum + (item.outputSize ?? 0), 0);
  const savedBytes = Math.max(0, totalOriginal - totalCompressed);
  const savedPercent = totalOriginal > 0 ? Math.max(0, Math.round((savedBytes / totalOriginal) * 100)) : 0;
  const hasOutput = items.some((item) => item.outputUrl);

  const getTargetFormat = (file: File, nextFormat: "original" | "jpeg" | "webp" | "png") => {
    if (nextFormat !== "original") return nextFormat;
    if (file.type === "image/jpeg" || file.type === "image/jpg") return "jpeg";
    if (file.type === "image/webp") return "webp";
    if (file.type === "image/png") return "png";
    return "webp";
  };

  const getMime = (nextFormat: "jpeg" | "webp" | "png") => ({
    jpeg: "image/jpeg",
    webp: "image/webp",
    png: "image/png",
  }[nextFormat]);

  const buildOutputName = (fileName: string, nextFormat: "jpeg" | "webp" | "png") =>
    (fileName.replace(/\.[^.]+$/, "") || "compressed-image") + "." + nextFormat;

  const compressOne = async (nextFile: File, nextFormat: "original" | "jpeg" | "webp" | "png", nextQuality: number, nextMaxWidth: number) => {
    const sourceUrl = URL.createObjectURL(nextFile);
    const fallback = {
      id: `${nextFile.name}-${nextFile.size}-${nextFile.lastModified}`,
      fileName: nextFile.name,
      inputType: nextFile.type || "image file",
      inputSize: nextFile.size,
      width: 0,
      height: 0,
      outputWidth: 0,
      outputHeight: 0,
      sourceUrl,
      outputUrl: "",
      outputSize: null,
      outputBlob: null,
      error: "",
    };

    let objectUrl = "";
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
      const targetFormat = getTargetFormat(nextFile, nextFormat);
      const scale = width > nextMaxWidth ? nextMaxWidth / width : 1;
      const outputWidth = Math.max(1, Math.round(width * scale));
      const outputHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");

      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputWidth, outputHeight);
      } else {
        ctx.clearRect(0, 0, outputWidth, outputHeight);
      }

      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, getMime(targetFormat), targetFormat === "png" ? undefined : nextQuality),
      );
      if (!blob) throw new Error("Compression failed for this image.");

      return {
        ...fallback,
        width,
        height,
        outputWidth,
        outputHeight,
        outputUrl: URL.createObjectURL(blob),
        outputSize: blob.size,
        outputBlob: blob,
      };
    } catch (err) {
      return {
        ...fallback,
        error: err instanceof Error ? err.message : "Compression failed.",
      };
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const rebuildItems = async (
    nextFiles: File[],
    nextFormat: "original" | "jpeg" | "webp" | "png",
    nextQuality: number,
    nextMaxWidth: number,
  ) => {
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
      nextItems.push(await compressOne(nextFile, nextFormat, nextQuality, nextMaxWidth));
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
    await rebuildItems(picked, format, quality, maxWidth);
  };

  const updateFormat = async (nextFormat: "original" | "jpeg" | "webp" | "png") => {
    setFormat(nextFormat);
    if (files.length) await rebuildItems(files, nextFormat, quality, maxWidth);
  };

  const updateQuality = async (nextQuality: number) => {
    setQuality(nextQuality);
    if (files.length) await rebuildItems(files, format, nextQuality, maxWidth);
  };

  const updateMaxWidth = async (nextMaxWidth: number) => {
    setMaxWidth(nextMaxWidth);
    if (files.length) await rebuildItems(files, format, quality, nextMaxWidth);
  };

  const downloadItem = (item: { fileName: string; inputType: string; outputUrl: string }) => {
    const a = document.createElement("a");
    const targetFormat = getTargetFormat({ type: item.inputType } as File, format);
    a.href = item.outputUrl;
    a.download = buildOutputName(item.fileName, targetFormat);
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
        const targetFormat = getTargetFormat({ type: item.inputType } as File, format);
        zip.file(buildOutputName(item.fileName, targetFormat), item.outputBlob as Blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed-images.zip";
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
          {(["original", "jpeg", "webp", "png"] as const).map((f) => (
            <button
              key={f}
              onClick={() => void updateFormat(f)}
              className={"rounded-full px-3 py-1 uppercase " + (format === f ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
            >
              {formatLabel[f]}
            </button>
          ))}
        </div>
        <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-border px-4 py-2">
          <span className="text-[11px] font-mono uppercase text-muted-foreground">Max width</span>
          <input type="range" min={480} max={2560} step={80} value={maxWidth} onChange={(e) => void updateMaxWidth(+e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
          <span className="w-14 text-right text-xs font-mono">{maxWidth}px</span>
        </div>
        {(format === "jpeg" || format === "webp" || format === "original") && (
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-border px-4 py-2">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Quality</span>
            <input type="range" min={0.35} max={1} step={0.05} value={quality} onChange={(e) => void updateQuality(+e.target.value)} className="flex-1 accent-[color:var(--accent)]" />
            <span className="w-10 text-right text-xs font-mono">{Math.round(quality * 100)}</span>
          </div>
        )}
        {hasOutput ? (
          <>
            <button onClick={downloadAll} className="rounded-full border border-border px-4 py-2 text-xs font-mono uppercase hover:border-accent hover:text-accent">
              Download all
            </button>
            <button onClick={() => void downloadZip()} disabled={zipBusy} className="rounded-full bg-accent px-4 py-2 text-xs font-mono uppercase text-accent-foreground disabled:opacity-60">
              {zipBusy ? "Zipping..." : "Download ZIP"}
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      ) : null}

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Upload images to reduce file size by resizing them, lowering quality, or converting them to more efficient formats like WebP.
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Files</div>
              <div className="mt-2 font-display text-2xl">{items.length}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Original Total</div>
              <div className="mt-2 font-display text-2xl">{prettySize(totalOriginal)}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Compressed Total</div>
              <div className="mt-2 font-display text-2xl">{prettySize(totalCompressed)}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Saved</div>
              <div className="mt-2 font-display text-2xl">{savedPercent}%</div>
              <div className="mt-1 text-xs text-muted-foreground">{prettySize(savedBytes)} smaller</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const percentSaved = item.outputSize != null && item.inputSize > 0
                ? Math.max(0, Math.round(((item.inputSize - item.outputSize) / item.inputSize) * 100))
                : 0;
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-display text-base font-semibold">{item.fileName}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{item.inputType}</div>
                    </div>
                    {item.outputUrl ? (
                      <button onClick={() => downloadItem(item)} className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase hover:border-accent hover:text-accent">
                        Download
                      </button>
                    ) : null}
                  </div>

                  {item.error ? (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-300">{item.error}</div>
                  ) : (
                    <>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div>
                          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Before</div>
                          <img src={item.sourceUrl} alt={item.fileName} className="h-40 w-full rounded-xl border border-border object-cover" />
                        </div>
                        <div>
                          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">After</div>
                          <img src={item.outputUrl} alt={`${item.fileName} compressed`} className="h-40 w-full rounded-xl border border-border object-cover" />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border bg-background/70 p-3">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Original</div>
                          <div className="mt-1 text-sm font-semibold">{prettySize(item.inputSize)}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{item.width} x {item.height}</div>
                        </div>
                        <div className="rounded-xl border border-border bg-background/70 p-3">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Compressed</div>
                          <div className="mt-1 text-sm font-semibold">{prettySize(item.outputSize)}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{item.outputWidth} x {item.outputHeight}</div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-xs text-emerald-300">
                        Saved {percentSaved}% on this image.
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {busy ? <div className="text-sm text-muted-foreground">Compressing images...</div> : null}
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
  return <SvgOptimizer />;
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

/* CssToTailwindTool imported from @/components/css-to-tailwind */

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

function FrontendAiPromptTool() {
  const [task, setTask] = useState("Build a responsive pricing section for a SaaS landing page.");
  const [stack, setStack] = useState("Next.js, TypeScript, Tailwind CSS");
  const [constraints, setConstraints] = useState("Accessible markup, mobile first, clean component structure, subtle motion only.");
  const [output, setOutput] = useState("Return production-ready JSX, Tailwind classes, and a short explanation of the layout decisions.");
  const prompt = `Act as a senior frontend developer.\n\nTask:\n${task}\n\nStack:\n${stack}\n\nConstraints:\n${constraints}\n\nOutput requirements:\n${output}\n\nAlso include:\n- semantic HTML choices\n- accessibility considerations\n- responsive behavior\n- states for hover, focus, loading, empty, and error where relevant\n- any assumptions you are making`;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="What should the AI build or help with?" />
        <input value={stack} onChange={(e) => setStack(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Stack" />
        <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Constraints" />
        <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Output requirements" />
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Frontend AI prompt</div>
              <div className="text-sm text-muted-foreground">Copy, refine, and paste into ChatGPT, Claude, or Copilot Chat.</div>
            </div>
            <CopyBtn value={prompt} />
          </div>
          <CodeBlock code={prompt} lang="md" />
        </div>
      </div>
    </div>
  );
}

function AiUiReviewTool() {
  const [screen, setScreen] = useState("Marketing hero with CTA, trust logos, and product screenshot.");
  const [focus, setFocus] = useState("Accessibility, visual hierarchy, spacing rhythm, and mobile responsiveness.");
  const review = `Review this frontend UI like a senior design-minded frontend engineer.\n\nScreen:\n${screen}\n\nFocus areas:\n${focus}\n\nReturn feedback in these sections:\n1. What is working well\n2. UX or clarity issues\n3. Accessibility concerns\n4. Responsive risks\n5. Visual polish ideas\n6. Priority fixes before launch\n\nKeep the feedback practical and implementation-oriented.`;
  const checklist = [
    "Semantic headings and landmark structure",
    "Clear focus states and keyboard reachability",
    "Readable contrast and type scale",
    "Consistent spacing rhythm across sections",
    "Empty, loading, and error states where needed",
    "Mobile overflow, wrapping, and tap target checks",
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <textarea value={screen} onChange={(e) => setScreen(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Describe the screen or component" />
        <textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Which areas should the review focus on?" />
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Quick review checklist</div>
          <div className="mt-3 grid gap-2">
            {checklist.map((item) => (
              <div key={item} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground/90">{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI UI review prompt</div>
            <div className="text-sm text-muted-foreground">Useful for design QA, frontend critique, and polish passes.</div>
          </div>
          <CopyBtn value={review} />
        </div>
        <CodeBlock code={review} lang="md" />
      </div>
    </div>
  );
}

function UiStateCopyPromptTool() {
  const [feature, setFeature] = useState("Job application form");
  const [tone, setTone] = useState("Clear, calm, and slightly polished");
  const [brand, setBrand] = useState("Professional portfolio for a senior frontend developer");
  const prompt = `Act as a UX writer working with a frontend developer.\n\nFeature:\n${feature}\n\nBrand / product context:\n${brand}\n\nTone:\n${tone}\n\nWrite concise UI copy for these states:\n- loading\n- success\n- empty\n- error\n- validation hint\n- destructive action confirmation\n\nKeep each line short, realistic, and ready for production UI. Return the result in a neat JSON shape with keys for each state.`;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <input value={feature} onChange={(e) => setFeature(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Feature or flow" />
        <textarea value={brand} onChange={(e) => setBrand(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Brand or product context" />
        <textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Tone" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">UI state copy prompt</div>
            <div className="text-sm text-muted-foreground">Useful for empty states, validation copy, and error messaging.</div>
          </div>
          <CopyBtn value={prompt} />
        </div>
        <CodeBlock code={prompt} lang="md" />
      </div>
    </div>
  );
}

function FrontendBugPromptTool() {
  const [bug, setBug] = useState("Mobile navigation drawer closes, but body scroll stays locked after tapping a link.");
  const [expected, setExpected] = useState("Drawer closes and page scroll is restored immediately.");
  const [stack, setStack] = useState("Next.js, React, TypeScript, Tailwind CSS");
  const [notes, setNotes] = useState("Issue happens on iPhone Safari. State is managed in a client component. There is a useEffect that toggles overflow-hidden on body.");
  const prompt = `Act as a senior frontend debugging partner.\n\nBug summary:\n${bug}\n\nExpected behavior:\n${expected}\n\nStack:\n${stack}\n\nNotes:\n${notes}\n\nHelp me debug this by returning:\n1. likely root causes\n2. the first checks to run in devtools\n3. the safest fix approach\n4. any React or DOM cleanup issues to inspect\n5. a small example patch if appropriate\n\nKeep the answer practical and focused on reproducible debugging steps.`;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <textarea value={bug} onChange={(e) => setBug(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Describe the bug" />
        <textarea value={expected} onChange={(e) => setExpected(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Expected behavior" />
        <input value={stack} onChange={(e) => setStack(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Stack" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="Extra notes" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Frontend bug debug prompt</div>
            <div className="text-sm text-muted-foreground">Turns messy bug notes into a clean AI debugging request.</div>
          </div>
          <CopyBtn value={prompt} />
        </div>
        <CodeBlock code={prompt} lang="md" />
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1500);
}

function safeName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function parsePageRanges(input: string, totalPages: number) {
  const picked = new Set<number>();
  for (const chunk of input.split(",")) {
    const value = chunk.trim();
    if (!value) continue;
    const rangeMatch = value.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > totalPages) return null;
      for (let page = start; page <= end; page += 1) picked.add(page);
      continue;
    }
    const page = Number(value);
    if (!Number.isInteger(page) || page < 1 || page > totalPages) return null;
    picked.add(page);
  }
  return [...picked].sort((a, b) => a - b);
}

type PdfQueueItem = {
  id: string;
  file: File;
  pages?: number;
  status: "reading" | "ready" | "error";
  error?: string;
};

type ImageQueueItem = {
  id: string;
  file: File;
  width?: number;
  height?: number;
  status: "reading" | "ready" | "error";
  error?: string;
};

async function loadPdfLib() {
  return import("pdf-lib");
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs;
}

async function readPdfPages(file: File) {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.load(await file.arrayBuffer());
  return doc.getPageCount();
}

async function readImageMeta(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error(`Could not read ${file.name}.`));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function extractPdfLines(items: Array<{ str?: string; transform?: number[] }>) {
  const rows = new Map<number, { y: number; parts: { x: number; text: string }[] }>();
  for (const item of items) {
    const text = item.str?.trim();
    const transform = item.transform;
    if (!text || !transform) continue;
    const y = transform[5];
    const x = transform[4];
    const key = Math.round(y / 4) * 4;
    const row = rows.get(key) ?? { y, parts: [] };
    row.parts.push({ x, text });
    rows.set(key, row);
  }
  return [...rows.values()]
    .sort((a, b) => b.y - a.y)
    .map((row) => row.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function PdfPanel({
  eyebrow,
  title,
  description,
  accent = "from-accent/20 via-accent/5 to-transparent",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_24px_80px_-48px_rgba(56,189,248,0.35)]">
      <div className={"pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-70 transition duration-300 group-hover:opacity-100 " + accent} />
      <div className="relative">
        <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</div>
        <div className="mt-2 font-display text-2xl font-semibold text-foreground">{title}</div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function PdfStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/65 p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function PdfNote({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warn";
  children: React.ReactNode;
}) {
  const toneClass = tone === "success"
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
    : tone === "warn"
      ? "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-100"
      : "border-border bg-background/65 text-muted-foreground";
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 transition-all duration-300 ${toneClass}`}>{children}</div>;
}

function PdfActionButton({
  onClick,
  disabled,
  busy,
  label,
}: {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || busy}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(56,189,248,0.7)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {busy ? "Working..." : label}
    </button>
  );
}

function QueueUpload({
  label,
  description,
  accept,
  multiple,
  onFiles,
}: {
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(Array.from(e.dataTransfer.files ?? []));
      }}
      className={"group block cursor-pointer rounded-[24px] border border-dashed p-5 transition-all duration-300 hover:border-accent/45 hover:bg-background " + (dragOver ? "border-accent bg-accent/5 shadow-[0_20px_50px_-35px_rgba(56,189,248,0.55)]" : "border-border bg-background/60")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-foreground transition-colors duration-300 group-hover:text-accent">{label}</div>
          <div className="mt-1 text-sm leading-6 text-muted-foreground">{dragOver ? "Drop files here to add them instantly." : description}</div>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-300 group-hover:border-accent/40 group-hover:text-accent">
          {dragOver ? "Drop" : "Browse"}
        </div>
      </div>
      <input type="file" accept={accept} multiple={multiple} className="mt-4 block w-full text-sm" onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
    </label>
  );
}

function QueueItemShell({
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  active,
  children,
}: {
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={"rounded-[22px] border bg-background/70 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-background " + (active ? "border-accent/60 shadow-[0_18px_40px_-28px_rgba(56,189,248,0.55)]" : "border-border")}
    >
      {children}
    </div>
  );
}

function MergePdfTool() {
  const [items, setItems] = useState<PdfQueueItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("merged-document");
  const [status, setStatus] = useState("Load at least two PDFs, then fine-tune the order before merging.");

  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const queued = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      status: "reading" as const,
    }));
    setItems((current) => [...current, ...queued]);
    setStatus(`Inspecting ${files.length} PDF ${files.length === 1 ? "file" : "files"}...`);
    await Promise.all(queued.map(async (entry) => {
      try {
        const pages = await readPdfPages(entry.file);
        setItems((current) => current.map((item) => item.id === entry.id ? { ...item, status: "ready", pages } : item));
      } catch (error) {
        setItems((current) => current.map((item) => item.id === entry.id ? { ...item, status: "error", error: error instanceof Error ? error.message : "Invalid PDF file." } : item));
      }
    }));
    setStatus("Order is exact from top to bottom. Move files before merging if needed.");
  };

  const readyItems = items.filter((item) => item.status === "ready");
  const totalPages = readyItems.reduce((sum, item) => sum + (item.pages ?? 0), 0);

  const merge = async () => {
    if (readyItems.length < 2) return;
    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (const item of readyItems) {
        const source = await PDFDocument.load(await item.file.arrayBuffer());
        const copied = await merged.copyPages(source, source.getPageIndices());
        copied.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save({ useObjectStreams: true });
      downloadBlob(new Blob([toArrayBuffer(bytes)], { type: "application/pdf" }), `${safeName(fileName)}.pdf`);
      setStatus(`Merged ${readyItems.length} PDFs in the visible order with ${totalPages} total pages.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not merge the selected PDFs.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <PdfPanel eyebrow="Accurate Order" title="Merge PDF files" description="This merge follows the queue exactly from top to bottom. Page totals are read first so you can verify the stack before export.">
        <div className="space-y-4">
          <QueueUpload label="Build your merge queue" description="Add multiple PDFs, then move them up, down, or drag them into the exact order you want." accept="application/pdf" multiple onFiles={(files) => void addFiles(files)} />
          <div className="space-y-3">
            {items.length === 0 ? (
              <QueueItemShell>
                <div className="text-sm text-muted-foreground">No PDFs queued yet. Once files are loaded, you will see page counts and exact order controls here.</div>
              </QueueItemShell>
            ) : (
              items.map((item, index) => (
                <QueueItemShell
                  key={item.id}
                  draggable
                  active={dragId === item.id}
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragId || dragId === item.id) return;
                    setItems((current) => {
                      const from = current.findIndex((entry) => entry.id === dragId);
                      const to = current.findIndex((entry) => entry.id === item.id);
                      return from === -1 || to === -1 ? current : moveItem(current, from, to);
                    });
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-accent">{String(index + 1).padStart(2, "0")}</span>
                        <span className="rounded-full border border-border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Drag</span>
                        <div className="truncate text-sm font-medium text-foreground">{item.file.name}</div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{formatBytes(item.file.size)}</span>
                        <span>•</span>
                        <span>{item.status === "ready" ? `${item.pages} pages` : item.status === "reading" ? "Reading pages..." : item.error ?? "Could not read file"}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => setItems((current) => moveItem(current, index, index - 1))} disabled={index === 0} className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-40">Up</button>
                      <button type="button" onClick={() => setItems((current) => moveItem(current, index, index + 1))} disabled={index === items.length - 1} className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-40">Down</button>
                      <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-rose-400/40 hover:text-rose-300"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                </QueueItemShell>
              ))
            )}
          </div>
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Merge Summary" title="Review before export" description="The output includes only PDFs that parsed successfully, in the order you see here." accent="from-sky-500/18 via-cyan-500/8 to-transparent">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <PdfStat label="Ready files" value={String(readyItems.length)} />
            <PdfStat label="Total pages" value={String(totalPages)} />
          </div>
          <label className="block">
            <span className="mb-2 block text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Output name</span>
            <input value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm transition focus:border-accent focus:outline-none" />
          </label>
          <PdfNote tone={readyItems.length >= 2 ? "success" : "warn"}>{status}</PdfNote>
          <PdfActionButton onClick={merge} disabled={readyItems.length < 2} busy={busy} label="Merge PDF files" />
        </div>
      </PdfPanel>
    </div>
  );
}

function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("This tool creates a lighter optimized copy when the PDF still has structural overhead. It does not aggressively recompress embedded images.");
  const [stats, setStats] = useState<{ before: number; after: number } | null>(null);

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
      downloadBlob(new Blob([toArrayBuffer(bytes)], { type: "application/pdf" }), `${safeName(file.name)}-optimized.pdf`);
      setStats({ before: file.size, after: bytes.length });
      const delta = file.size - bytes.length;
      setMessage(delta > 0 ? `Saved ${formatBytes(delta)} by rewriting the document with object streams and cleaner structure.` : "Finished. This PDF was already close to fully optimized, so file size stayed similar.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not optimize this PDF.");
      setStats(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
      <PdfPanel eyebrow="Honest Compression" title="Compress PDF files" description="This is a light optimization pass. The tool is accurate about what it can improve and shows you the actual before/after result.">
        <div className="space-y-4">
          <QueueUpload label="Select one PDF" description="Best for documents with export overhead, duplicated object streams, or unoptimized structure. You can also drag a PDF straight into this panel." accept="application/pdf" onFiles={(files) => setFile(files[0] ?? null)} />
          {file ? (
            <QueueItemShell>
              <div className="text-sm font-medium text-foreground">{file.name}</div>
              <div className="mt-2 text-xs text-muted-foreground">{formatBytes(file.size)}</div>
            </QueueItemShell>
          ) : null}
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Result" title="See the real size delta" description="No vague promise here. If the PDF is already optimized, the tool says so instead of pretending it compressed more.">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <PdfStat label="Original" value={stats ? formatBytes(stats.before) : "—"} />
            <PdfStat label="Optimized" value={stats ? formatBytes(stats.after) : "—"} />
          </div>
          <PdfNote tone={stats && stats.after < stats.before ? "success" : "warn"}>{message}</PdfNote>
          <PdfActionButton onClick={compress} disabled={!file} busy={busy} label="Create optimized copy" />
        </div>
      </PdfPanel>
    </div>
  );
}

function JpgToPdfTool() {
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Build the image order, then choose whether pages should keep original image size or fit onto A4 pages.");
  const [layoutMode, setLayoutMode] = useState<"original" | "a4">("a4");
  const [margin, setMargin] = useState(24);
  const [fileName, setFileName] = useState("images-to-pdf");

  const addImages = async (files: File[]) => {
    if (files.length === 0) return;
    const queued = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      status: "reading" as const,
    }));
    setItems((current) => [...current, ...queued]);
    await Promise.all(queued.map(async (entry) => {
      try {
        const meta = await readImageMeta(entry.file);
        setItems((current) => current.map((item) => item.id === entry.id ? { ...item, ...meta, status: "ready" } : item));
      } catch (error) {
        setItems((current) => current.map((item) => item.id === entry.id ? { ...item, status: "error", error: error instanceof Error ? error.message : "Invalid image." } : item));
      }
    }));
    setMessage("Image order is exact from top to bottom. Move pages before exporting if needed.");
  };

  const readyItems = items.filter((item) => item.status === "ready");

  const convert = async () => {
    if (readyItems.length === 0) return;
    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.create();
      const a4 = { width: 595.28, height: 841.89 };
      for (const item of readyItems) {
        const bytes = await item.file.arrayBuffer();
        const lower = item.file.name.toLowerCase();
        const image = lower.endsWith(".png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        if (layoutMode === "original") {
          const page = pdf.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          const page = pdf.addPage([a4.width, a4.height]);
          const maxWidth = a4.width - margin * 2;
          const maxHeight = a4.height - margin * 2;
          const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
          const width = image.width * ratio;
          const height = image.height * ratio;
          page.drawImage(image, {
            x: (a4.width - width) / 2,
            y: (a4.height - height) / 2,
            width,
            height,
          });
        }
      }
      const out = await pdf.save({ useObjectStreams: true });
      downloadBlob(new Blob([toArrayBuffer(out)], { type: "application/pdf" }), `${safeName(fileName)}.pdf`);
      setMessage(`Built a ${readyItems.length}-page PDF using ${layoutMode === "a4" ? "A4 fit mode" : "original image size mode"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not convert these images into a PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <PdfPanel eyebrow="Sequence Builder" title="JPG to PDF" description="This version is more capable: reorder images, choose page layout, and control margins so the output behaves predictably.">
        <div className="space-y-4">
          <QueueUpload label="Add JPG, JPEG, or PNG files" description="The queue becomes your final PDF page order, and you can drag files to reorder them." accept="image/jpeg,image/jpg,image/png" multiple onFiles={(files) => void addImages(files)} />
          <div className="space-y-3">
            {items.length === 0 ? (
              <QueueItemShell>
                <div className="text-sm text-muted-foreground">No images loaded yet. Add files to build the PDF queue.</div>
              </QueueItemShell>
            ) : (
              items.map((item, index) => (
                <QueueItemShell
                  key={item.id}
                  draggable
                  active={dragId === item.id}
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragId || dragId === item.id) return;
                    setItems((current) => {
                      const from = current.findIndex((entry) => entry.id === dragId);
                      const to = current.findIndex((entry) => entry.id === item.id);
                      return from === -1 || to === -1 ? current : moveItem(current, from, to);
                    });
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-accent">{String(index + 1).padStart(2, "0")}</span>
                        <span className="rounded-full border border-border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Drag</span>
                        <div className="truncate text-sm font-medium text-foreground">{item.file.name}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {item.status === "ready" ? `${item.width} × ${item.height}px • ${formatBytes(item.file.size)}` : item.status === "reading" ? "Reading dimensions..." : item.error ?? "Could not read image"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => setItems((current) => moveItem(current, index, index - 1))} disabled={index === 0} className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-40">Up</button>
                      <button type="button" onClick={() => setItems((current) => moveItem(current, index, index + 1))} disabled={index === items.length - 1} className="rounded-full border border-border px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-40">Down</button>
                    </div>
                  </div>
                </QueueItemShell>
              ))
            )}
          </div>
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Export Layout" title="Control the page fit" description="Choose whether each image should preserve its own page size or be centered onto A4 pages with margins.">
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono uppercase tracking-widest">
            <button type="button" onClick={() => setLayoutMode("a4")} className={"rounded-full px-4 py-2 transition " + (layoutMode === "a4" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>A4 fit</button>
            <button type="button" onClick={() => setLayoutMode("original")} className={"rounded-full px-4 py-2 transition " + (layoutMode === "original" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>Original size</button>
          </div>
          <div className="rounded-2xl border border-border bg-background/65 p-4">
            <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Margin</div>
            <SliderInput value={margin} onChange={setMargin} min={0} max={72} step={4} />
          </div>
          <label className="block">
            <span className="mb-2 block text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Output name</span>
            <input value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm transition focus:border-accent focus:outline-none" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <PdfStat label="Images ready" value={String(readyItems.length)} />
            <PdfStat label="Layout mode" value={layoutMode === "a4" ? "A4" : "Native"} />
          </div>
          <PdfNote tone={readyItems.length > 0 ? "success" : "warn"}>{message}</PdfNote>
          <PdfActionButton onClick={convert} disabled={readyItems.length === 0} busy={busy} label="Convert images to PDF" />
        </div>
      </PdfPanel>
    </div>
  );
}

function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("This is now explicitly a text-first PDF to Word export. It keeps page breaks and line order more accurately than a plain text join.");
  const [preview, setPreview] = useState("");

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pdfjs = await loadPdfJs();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pageTexts: string[] = [];
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const content = await page.getTextContent();
        const lines = extractPdfLines(content.items as Array<{ str?: string; transform?: number[] }>);
        pageTexts.push(lines.join("\n") || `Page ${pageNumber}`);
      }
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const wordDoc = new Document({
        sections: [{
          children: pageTexts.flatMap((text, index) => [
            new Paragraph({ children: [new TextRun({ text: `Page ${index + 1}`, bold: true })] }),
            ...text.split("\n").map((line) => new Paragraph(line)),
            new Paragraph(""),
          ]),
        }],
      });
      const buffer = await Packer.toBlob(wordDoc);
      downloadBlob(buffer, `${safeName(file.name)}.docx`);
      setPreview(pageTexts.slice(0, 2).join("\n\n"));
      setMessage(`Extracted structured text from ${doc.numPages} page${doc.numPages === 1 ? "" : "s"} into a .docx file with page breaks preserved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not convert this PDF to Word.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <PdfPanel eyebrow="Text-first Export" title="PDF to WORD Converter" description="This tool is now more accurate about what it does: it extracts readable text with line grouping and page breaks, rather than pretending to recreate every visual layout detail.">
        <div className="space-y-4">
          <QueueUpload label="Select one PDF" description="Best for text-based documents, reports, and notes where editable content matters more than exact visual fidelity. Drag and drop works here too." accept="application/pdf" onFiles={(files) => setFile(files[0] ?? null)} />
          {file ? <QueueItemShell><div className="text-sm font-medium text-foreground">{file.name}</div><div className="mt-2 text-xs text-muted-foreground">{formatBytes(file.size)}</div></QueueItemShell> : null}
          <PdfActionButton onClick={convert} disabled={!file} busy={busy} label="Extract into Word" />
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Preview" title="Check the extracted structure" description="You can quickly judge if the text grouping looks right before you use the `.docx` file.">
        <div className="space-y-4">
          <PdfNote tone={preview ? "success" : "warn"}>{message}</PdfNote>
          <div className="rounded-[24px] border border-border bg-background/70 p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Extracted sample</div>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-6 text-foreground">{preview || "Your extracted text preview will appear here after conversion."}</pre>
          </div>
        </div>
      </PdfPanel>
    </div>
  );
}

function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [pages, setPages] = useState("");
  const [message, setMessage] = useState("Choose whether to split every page or export only a precise custom page range.");

  const onPick = async (nextFile: File | null) => {
    setFile(nextFile);
    setTotalPages(null);
    if (!nextFile) return;
    try {
      const count = await readPdfPages(nextFile);
      setTotalPages(count);
      setMessage(`Loaded ${count} pages. ${mode === "all" ? "Each page will become its own PDF." : "Now enter the exact pages you want."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not inspect this PDF.");
    }
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const zipModule = await import("jszip");
      const zip = new zipModule.default();
      const source = await PDFDocument.load(await file.arrayBuffer());
      const selectedPages = mode === "custom"
        ? parsePageRanges(pages, source.getPageCount())
        : Array.from({ length: source.getPageCount() }, (_, index) => index + 1);
      if (!selectedPages || selectedPages.length === 0) {
        throw new Error(`Use valid page numbers between 1 and ${source.getPageCount()}.`);
      }
      for (const pageNumber of selectedPages) {
        const next = await PDFDocument.create();
        const [copied] = await next.copyPages(source, [pageNumber - 1]);
        next.addPage(copied);
        const bytes = await next.save({ useObjectStreams: true });
        zip.file(`${safeName(file.name)}-page-${pageNumber}.pdf`, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${safeName(file.name)}-split.zip`);
      setMessage(`Created ${selectedPages.length} split PDF file${selectedPages.length === 1 ? "" : "s"} and packed them into a ZIP.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not split this PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <PdfPanel eyebrow="Page Control" title="Split PDF file" description="This version makes the split mode obvious first, then lets you export either every page or only the exact pages you request.">
        <div className="space-y-4">
          <QueueUpload label="Select one PDF" description="The page count is inspected first so range validation is accurate. Drag and drop is supported here too." accept="application/pdf" onFiles={(files) => void onPick(files[0] ?? null)} />
          <div className="inline-flex rounded-full border border-border p-1 text-[11px] font-mono uppercase tracking-widest">
            <button type="button" onClick={() => setMode("all")} className={"rounded-full px-4 py-2 transition " + (mode === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>Every page</button>
            <button type="button" onClick={() => setMode("custom")} className={"rounded-full px-4 py-2 transition " + (mode === "custom" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>Custom range</button>
          </div>
          {mode === "custom" ? (
            <label className="block">
              <span className="mb-2 block text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Pages</span>
              <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Example: 1-3,5,8" className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm transition focus:border-accent focus:outline-none" />
            </label>
          ) : null}
          <PdfActionButton onClick={split} disabled={!file || (mode === "custom" && !pages.trim())} busy={busy} label="Split PDF file" />
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Validation" title="Range summary" description="Page count is surfaced before export so the custom range input stays grounded and less error-prone.">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <PdfStat label="PDF pages" value={totalPages ? String(totalPages) : "—"} />
            <PdfStat label="Mode" value={mode === "all" ? "All pages" : "Custom"} />
          </div>
          <PdfNote tone={totalPages ? "success" : "warn"}>{message}</PdfNote>
        </div>
      </PdfPanel>
    </div>
  );
}

function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.75);
  const [quality, setQuality] = useState(0.92);
  const [pages, setPages] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Choose a render scale and JPG quality, then export every page into a ZIP file.");

  const onPick = async (nextFile: File | null) => {
    setFile(nextFile);
    setPages(null);
    if (!nextFile) return;
    try {
      const count = await readPdfPages(nextFile);
      setPages(count);
      setMessage(`Loaded ${count} pages. Higher scale improves detail, while quality affects JPG compression.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not inspect this PDF.");
    }
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pdfjs = await loadPdfJs();
      const zipModule = await import("jszip");
      const zip = new zipModule.default();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas rendering is not available in this browser.");
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if (!blob) throw new Error(`Could not export page ${pageNumber} as JPG.`);
        zip.file(`${safeName(file.name)}-page-${pageNumber}.jpg`, blob);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      downloadBlob(archive, `${safeName(file.name)}-jpg.zip`);
      setMessage(`Exported ${doc.numPages} page${doc.numPages === 1 ? "" : "s"} as JPG images at scale ${scale} and quality ${quality.toFixed(2)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not convert this PDF to JPG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <PdfPanel eyebrow="Render Controls" title="PDF to JPG" description="This one now feels more like a real export tool: you can tune detail level and JPG quality instead of just pressing one button.">
        <div className="space-y-4">
          <QueueUpload label="Select one PDF" description="Every page is rendered to canvas first, then packed into a ZIP of JPG files. Drag and drop works here too." accept="application/pdf" onFiles={(files) => void onPick(files[0] ?? null)} />
          <div className="rounded-2xl border border-border bg-background/65 p-4">
            <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Render scale</div>
            <SliderInput value={scale} onChange={setScale} min={1} max={3} step={0.25} />
          </div>
          <div className="rounded-2xl border border-border bg-background/65 p-4">
            <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">JPG quality</div>
            <SliderInput value={quality} onChange={setQuality} min={0.6} max={1} step={0.05} />
          </div>
          <PdfActionButton onClick={convert} disabled={!file} busy={busy} label="Export JPG ZIP" />
        </div>
      </PdfPanel>
      <PdfPanel eyebrow="Export Summary" title="Quality vs size" description="Higher scale sharpens text and vector detail. Higher JPG quality keeps gradients cleaner but usually increases the ZIP size.">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <PdfStat label="PDF pages" value={pages ? String(pages) : "—"} />
            <PdfStat label="Quality" value={quality.toFixed(2)} hint={`Scale ${scale}`} />
          </div>
          <PdfNote tone={pages ? "success" : "warn"}>{message}</PdfNote>
        </div>
      </PdfPanel>
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
  { id: "tri", name: "CSS Triangle", category: "CSS", icon: Shapes, render: () => <CssTriangle /> },
  { id: "filter", name: "CSS Filter", category: "CSS", icon: Wand2, render: () => <CssFilter /> },
  { id: "transform", name: "Transform Playground", category: "CSS", keywords: "rotate scale skew", icon: Zap, render: () => <TransformPlay /> },
  { id: "clip", name: "Clip‑path Generator", category: "Wow", icon: Shapes, render: () => <ClipPath /> },
  { id: "blob", name: "Blob Shape Generator", category: "Wow", icon: Shapes, render: () => <BlobShape /> },
  { id: "wave", name: "SVG Wave Generator", category: "Wow", icon: Waves, render: () => <SvgWave /> },
  { id: "color", name: "Color Picker", category: "Color", icon: Palette, render: () => <ColorPicker /> },
  { id: "contrast", name: "Contrast Checker (WCAG)", category: "Color", icon: Gauge, render: () => <ContrastChecker /> },
  { id: "tw-color", name: "Tailwind Color Palette", category: "Color", icon: Palette, render: () => <TailwindPalette /> },
  { id: "color-mix-oklch", name: "Color Mix / OKLCH Playground", category: "Color", keywords: "color-mix oklch oklab modern css color palette tokens", icon: Palette, render: () => <ColorMixOklchPlaygroundTool /> },
  { id: "fontpair", name: "Font Pair Generator", category: "Typography", icon: Type, render: () => <FontPair /> },
  { id: "resp", name: "Responsive Checker", category: "Responsive", icon: Smartphone, render: () => <ResponsiveChecker /> },
  { id: "mq", name: "Media Query Generator", category: "Responsive", icon: Smartphone, render: () => <MediaQueryGen /> },
  { id: "container-query", name: "Container Query Playground", category: "Responsive", keywords: "container query @container component responsive modern css api", icon: Layout, render: () => <ContainerQueryPlaygroundTool /> },
  { id: "view-transition", name: "View Transition Playground", category: "JavaScript", keywords: "view transition api document.startViewTransition shared element page transition", icon: Sparkles, render: () => <ViewTransitionPlaygroundTool /> },
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
  { id: "img-convert", name: "Image Format Converter", category: "Utilities", keywords: "png jpeg jpg webp convert image", icon: ImageIcon, render: () => <ImageConverterTool /> },
  { id: "img-compress", name: "Image Size Compressor", category: "Utilities", keywords: "compress image reduce size kb mb webp jpeg png resize quality", icon: ImageIcon, render: () => <ImageCompressorTool /> },
  { id: "svg-cleanup", name: "SVG Optimizer & Converter", category: "Utilities", keywords: "svg optimizer clean minify react jsx converter data uri", icon: ImageIcon, render: () => <SvgOptimizerTool /> },
  { id: "json-zod", name: "JSON to Zod Schema Generator", category: "JavaScript", keywords: "json zod schema validation typescript interface", icon: Braces, render: () => <JsonToZodTool /> },
  { id: "fluid-clamp-builder", name: "CSS Clamp() Fluid Formula Builder", category: "CSS", keywords: "clamp fluid typography spacing responsive vw rem", icon: Ruler, render: () => <FluidClampTool /> },
  { id: "ambient-shadow", name: "Multi-Layer Ambient Shadow Studio", category: "CSS", keywords: "box shadow stripe apple elevation ambient glow", icon: Square, render: () => <MultiLayerShadowTool /> },
  { id: "next-img-calc", name: "Next.js <Image /> & Aspect Ratio Calculator", category: "Utilities", keywords: "nextjs image aspect ratio cls layout width height", icon: ImageIcon, render: () => <NextImageCalcTool /> },
  { id: "keyframe-studio", name: "Keyframe Micro-Interaction Studio", category: "CSS", keywords: "keyframes animation motion bounce pulse tailwind", icon: Zap, render: () => <KeyframeAnimationBuilder /> },
  { id: "html-jsx", name: "HTML to JSX / JSX to HTML", category: "JavaScript", keywords: "convert markup react", icon: Braces, render: () => <HtmlJsxToolFixed /> },
  { id: "css-tw", name: "CSS to Tailwind Converter", category: "CSS", keywords: "tailwind convert", icon: Wand2, render: () => <CssToTailwindTool /> },
  { id: "tw-sort", name: "Tailwind Class Sorter / Merger", category: "Utilities", keywords: "tailwind sort dedupe classes", icon: Type, render: () => <TailwindSorterTool /> },
  { id: "shadow-presets", name: "Box Shadow Presets Library", category: "CSS", keywords: "cards modals dropdowns", icon: Square, render: () => <BoxShadowPresetsTool /> },
  { id: "mesh", name: "Gradient Mesh / Hero Background", category: "Wow", keywords: "hero gradient mesh", icon: Sparkles, render: () => <GradientMeshTool /> },
  { id: "regex-lib", name: "Form Validation Regex Library", category: "Utilities", keywords: "email phone password otp validation", icon: Code2, render: () => <RegexLibraryTool /> },
  { id: "forms-lab", name: "Forms Lab: Beginner to Advanced", category: "JavaScript", keywords: "forms react nextjs vanilla js csrf validation vapt formdata editor", icon: FileText, render: () => <FormsLabTool /> },
  { id: "form-events-lab", name: "Form Events, Validation & CSRF Lab", category: "JavaScript", keywords: "form events validation blur input change submit csrf react nextjs vanilla", icon: FileText, render: () => <FormEventsCsrfLabTool /> },
  { id: "rest-api-lab", name: "REST API Lab: Beginner to Advanced", category: "JavaScript", keywords: "rest api http methods headers fetch crud auth pagination react nextjs vanilla", icon: FileJson, render: () => <RestApiLabTool /> },
  { id: "frontend-backend-lab", name: "Frontend to Backend Lab: Zero to Hero", category: "JavaScript", keywords: "frontend backend api fetch nextjs react vanilla auth validation loading error mutation architecture", icon: Link2, render: () => <FrontendBackendLabTool /> },
  { id: "react-playground-lab", name: "React Playground Lab", category: "JavaScript", keywords: "react hooks events fetch useState useEffect useReducer useRef async learning playground", icon: Component, render: () => <ReactPlaygroundLabTool /> },
  { id: "storage", name: "LocalStorage / SessionStorage Playground", category: "JavaScript", keywords: "browser storage", icon: Terminal, render: () => <StoragePlaygroundTool /> },
  { id: "debounce-play", name: "Debounce / Throttle Playground", category: "JavaScript", keywords: "debounce throttle performance", icon: Timer, render: () => <DebounceThrottleTool /> },
  { id: "breakpoint-preview", name: "Breakpoint Preview + Device Frame Tester", category: "Responsive", keywords: "device viewport responsive", icon: Smartphone, render: () => <BreakpointPreviewTool /> },
  { id: "a11y-pair", name: "Accessible Color Pair Finder", category: "Color", keywords: "contrast accessible wcag", icon: Gauge, render: () => <AccessibleColorPairFinderTool /> },
  { id: "favicon-gen", name: "Favicons / App Icons Generator", category: "Utilities", keywords: "favicon app icon pwa", icon: ImageIcon, render: () => <FaviconGeneratorTool /> },
  { id: "og-preview", name: "Open Graph Preview Tool", category: "Utilities", keywords: "og social share meta", icon: Layout, render: () => <OgPreviewTool /> },
  { id: "grid-overlay", name: "Grid Overlay / Layout Inspector", category: "Layout", keywords: "columns gutter layout", icon: Grid3x3, render: () => <GridOverlayTool /> },
  { id: "scroll-snap", name: "Scroll Snap Builder", category: "Layout", keywords: "scroll snap carousel sections snap-type snap-align overflow", icon: Layout, render: () => <ScrollSnapBuilderTool /> },
  { id: "database-lab", name: "Frontend to Database Lab", category: "JavaScript", keywords: "database sql prisma mongo supabase api insert validation schema", icon: FileJson, render: () => <DatabaseLabTool /> },
  { id: "anim-gallery", name: "Animation Presets Gallery", category: "CSS", keywords: "entrance hover motion", icon: Zap, render: () => <AnimationPresetsGalleryTool /> },
  { id: "img-placeholder", name: "Image Placeholder Generator", category: "Utilities", keywords: "blur shimmer dominant color", icon: ImageIcon, render: () => <ImagePlaceholderTool /> },
  { id: "sticky-scroll", name: "Sticky / Scroll Progress Generator", category: "JavaScript", keywords: "scroll progress sticky sidebar", icon: ScrollText, render: () => <StickyScrollTool /> },
  { id: "ai-prompt-builder", name: "Frontend AI Prompt Builder", category: "Utilities", keywords: "ai prompt chatgpt claude copilot frontend scaffold ui component", icon: Sparkles, render: () => <FrontendAiPromptTool /> },
  { id: "ai-ui-review", name: "AI UI Review Prompt Builder", category: "Utilities", keywords: "ai ui review accessibility responsive design qa frontend prompt", icon: Gauge, render: () => <AiUiReviewTool /> },
  { id: "ai-state-copy", name: "UI State Copy Prompt Builder", category: "Utilities", keywords: "ai ux copy loading empty error validation microcopy prompt", icon: FileText, render: () => <UiStateCopyPromptTool /> },
  { id: "ai-bug-debug", name: "Frontend Bug Debug Prompt", category: "Utilities", keywords: "ai debug frontend bug react nextjs dom prompt reproduction", icon: Terminal, render: () => <FrontendBugPromptTool /> },
  { id: "pdf-merge", name: "Merge PDF files", category: "Utilities", keywords: "pdf merge combine documents", icon: FileText, render: () => <MergePdfTool /> },
  { id: "pdf-compress", name: "Compress PDF files", category: "Utilities", keywords: "pdf compress optimize filesize", icon: FileText, render: () => <CompressPdfTool /> },
  { id: "jpg-to-pdf", name: "JPG to PDF", category: "Utilities", keywords: "jpg jpeg png image to pdf convert", icon: ImageIcon, render: () => <JpgToPdfTool /> },
  { id: "pdf-to-word", name: "PDF to WORD Converter", category: "Utilities", keywords: "pdf word docx text convert", icon: FileText, render: () => <PdfToWordTool /> },
  { id: "pdf-split", name: "Split PDF file", category: "Utilities", keywords: "pdf split extract pages", icon: FileText, render: () => <SplitPdfTool /> },
  { id: "pdf-to-jpg", name: "PDF to JPG", category: "Utilities", keywords: "pdf jpg images export pages", icon: ImageIcon, render: () => <PdfToJpgTool /> },
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
