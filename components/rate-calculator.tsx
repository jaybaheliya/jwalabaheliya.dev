"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";

// Jwala's target range (USD/hour equivalent; INR shown too)
const MIN_OK = 35; // USD/hr
const IDEAL = 55;
const USD_TO_INR = 84;

export function RateCalculator() {
  const [rate, setRate] = useState(45);
  const [type, setType] = useState<"hourly" | "monthly">("hourly");

  const usd = type === "hourly" ? rate : Math.round(rate / 160);
  const match = usd >= IDEAL ? "ideal" : usd >= MIN_OK ? "workable" : "low";
  const monthly = usd * 160;
  const inr = Math.round(monthly * USD_TO_INR).toLocaleString("en-IN");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Rate calculator</div>
          <div className="font-display text-2xl font-bold mt-1">Does your budget match?</div>
        </div>
        <div className="flex gap-1 rounded-full border border-border p-1 text-[11px] font-mono">
          {(["hourly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setRate(t === "hourly" ? 45 : 7000); }}
              className={"px-3 py-1 rounded-full uppercase tracking-wider transition " + (type === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="text-5xl font-display font-bold tabular-nums">
        ${rate.toLocaleString()}
        <span className="text-lg text-muted-foreground font-mono ml-2">/{type === "hourly" ? "hr" : "mo"}</span>
      </div>
      <input
        type="range"
        min={type === "hourly" ? 15 : 2000}
        max={type === "hourly" ? 120 : 15000}
        step={type === "hourly" ? 5 : 500}
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="w-full mt-4 accent-[hsl(var(--accent))]"
      />

      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[11px] font-mono">
        <StatusPill active={match === "low"} label="Below range" tone="neg" />
        <StatusPill active={match === "workable"} label="Workable" tone="warn" />
        <StatusPill active={match === "ideal"} label="Ideal fit" tone="pos" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Fact k="Monthly (USD)" v={`$${monthly.toLocaleString()}`} />
        <Fact k="Monthly (INR)" v={`₹${inr}`} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Flexible for long-term contracts, full-time roles, or product retainers. <a href="mailto:jaybaheliya@gmail.com" className="text-accent underline">Email to discuss →</a>
      </p>
    </div>
  );
}

function StatusPill({ active, label, tone }: { active: boolean; label: string; tone: "pos" | "warn" | "neg" }) {
  const color = tone === "pos" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : tone === "warn" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" : "bg-red-500/15 text-red-500 border-red-500/30";
  return (
    <div className={"px-2 py-2 rounded-lg border flex items-center justify-center gap-1.5 transition " + (active ? color : "border-border/50 text-muted-foreground/50")}>
      {active ? (tone === "neg" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />) : null}
      {label}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-lg font-display font-semibold tabular-nums">{v}</div>
    </div>
  );
}