"use client";
import { useState } from "react";
import { Rocket, Building2, Palette } from "lucide-react";

type Mode = "startup" | "enterprise" | "agency";

const PITCHES: Record<Mode, { icon: React.ReactNode; label: string; headline: string; bullets: string[]; cta: string }> = {
  startup: {
    icon: <Rocket className="h-4 w-4" />,
    label: "Startup",
    headline: "Ship fast without breaking the design system.",
    bullets: [
      "Solo-owned frontend across 40+ shipped sites",
      "Comfortable with 0→1: design handoff, MVP, iterate on user feedback",
      "React, Next.js, TypeScript, Tailwind — production-ready in a week",
      "Communicates directly with founders and designers",
    ],
    cta: "Let's build v1",
  },
  enterprise: {
    icon: <Building2 className="h-4 w-4" />,
    label: "Enterprise",
    headline: "Pixel-precise builds with process, docs, and QA.",
    bullets: [
      "8+ years shipping for Kotak, Yes Bank, AU Bank, Tata, Godrej",
      "Component libraries, design tokens, accessibility (WCAG AA)",
      "Cross-browser QA, Lighthouse 90+, Core Web Vitals",
      "Works cleanly across product, design, backend, and QA teams",
    ],
    cta: "See enterprise work",
  },
  agency: {
    icon: <Palette className="h-4 w-4" />,
    label: "Agency",
    headline: "Design-led delivery from Figma to production.",
    bullets: [
      "Currently at Bombay Design Centre — Kyoorius Award 2023",
      "40+ marketing sites for Rustomjee, RMZ, Shapoorji, VIP Bags",
      "Motion (GSAP, Framer), 3D (Three.js), interactive prototypes",
      "Handles client feedback loops and tight campaign deadlines",
    ],
    cta: "See agency work",
  },
};

export function ResumeToggle() {
  const [mode, setMode] = useState<Mode>("agency");
  const p = PITCHES[mode];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Tailored pitch</div>
          <div className="font-display text-2xl font-bold">Which best fits your team?</div>
        </div>
        <div className="inline-flex gap-1 rounded-full border border-border p-1 text-[11px] font-mono">
          {(Object.keys(PITCHES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={"px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 transition " + (mode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {PITCHES[m].icon}{PITCHES[m].label}
            </button>
          ))}
        </div>
      </div>

      <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h4 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-4">{p.headline}</h4>
        <ul className="space-y-2.5 text-sm mb-6">
          {p.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="text-accent mt-1">▸</span><span>{b}</span>
            </li>
          ))}
        </ul>
        <a
          href="mailto:jaybaheliya@gmail.com"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition"
        >
          {p.cta} →
        </a>
      </div>
    </div>
  );
}