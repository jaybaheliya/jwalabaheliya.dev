"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Clock, Calendar, Sparkles, Terminal } from "lucide-react";

const CRON_PRESETS = [
  { label: "Every 5 Minutes", expr: "*/5 * * * *" },
  { label: "Every Hour on the Hour", expr: "0 * * * *" },
  { label: "Every Day at 9:00 AM", expr: "0 9 * * *" },
  { label: "Every Weekday (Mon-Fri) at 9:00 AM", expr: "0 9 * * 1-5" },
  { label: "Every Sunday at Midnight", expr: "0 0 * * 0" },
  { label: "First Day of Month at Midnight", expr: "0 0 1 * *" },
];

function explainCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron format (must have 5 parts: min hour day month weekday)";

  const [min, hour, dom, mon, dow] = parts;

  let timeStr = "";
  if (min === "*" && hour === "*") timeStr = "every minute";
  else if (min.startsWith("*/")) timeStr = `every ${min.replace("*/", "")} minutes`;
  else if (hour === "*") timeStr = `at minute ${min} past every hour`;
  else {
    const h = parseInt(hour, 10);
    const m = parseInt(min, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    timeStr = `at ${h12}:${mStr} ${ampm}`;
  }

  let dayStr = "";
  if (dow === "1-5") dayStr = ", Monday through Friday";
  else if (dow === "0" || dow === "7") dayStr = ", on Sunday";
  else if (dow === "6,0" || dow === "0,6") dayStr = ", on weekends";
  else if (dom !== "*") dayStr = `, on day ${dom} of the month`;
  else if (dow !== "*") dayStr = `, on weekday ${dow}`;

  return `Runs ${timeStr}${dayStr}.`;
}

function getNextExecutions(expr: string, count = 5): string[] {
  const dates: string[] = [];
  const now = new Date();
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  let current = new Date(now.getTime());
  let iterations = 0;

  while (dates.length < count && iterations < 5000) {
    iterations++;
    current = new Date(current.getTime() + 60000); // add 1 minute

    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    const [pMin, pHour, pDom, pMon, pDow] = parts;

    // Check minute
    if (pMin !== "*") {
      if (pMin.startsWith("*/")) {
        const step = parseInt(pMin.replace("*/", ""), 10);
        if (m % step !== 0) continue;
      } else if (parseInt(pMin, 10) !== m) continue;
    }

    // Check hour
    if (pHour !== "*" && parseInt(pHour, 10) !== h) continue;

    // Check weekday
    if (pDow !== "*") {
      if (pDow === "1-5" && (dow === 0 || dow === 6)) continue;
      if (pDow !== "1-5" && parseInt(pDow, 10) !== dow) continue;
    }

    // Check day of month
    if (pDom !== "*" && parseInt(pDom, 10) !== dom) continue;

    dates.push(
      current.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  }

  return dates;
}

export function CronBuilderTool() {
  const [cronExpr, setCronExpr] = useState("0 9 * * 1-5");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const inputId = useId();

  const humanExplanation = useMemo(() => explainCron(cronExpr), [cronExpr]);
  const upcomingRuns = useMemo(() => getNextExecutions(cronExpr), [cronExpr]);

  const { vercelJson, githubYaml } = useMemo(() => {
    const vercel = `{\n  "crons": [\n    {\n      "path": "/api/cron-job",\n      "schedule": "${cronExpr}"\n    }\n  ]\n}`;
    const gh = `name: Scheduled Workflow\non:\n  schedule:\n    - cron: '${cronExpr}'\njobs:\n  run-job:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4`;
    return { vercelJson: vercel, githubYaml: gh };
  }, [cronExpr]);

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
            <Clock className="h-5 w-5 text-accent" /> Vercel & GitHub Actions Cron Expression Builder
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Build and validate standard 5-part cron expressions with human-readable explanations & upcoming run timestamps.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Presets:</span>
          {CRON_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setCronExpr(p.expr)}
              className={
                "rounded-full border px-3 py-1 text-xs font-mono transition-colors " +
                (cronExpr === p.expr
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:border-accent")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Cron String */}
      <div className="my-5 space-y-2">
        <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Cron Expression String (5 Parts)
        </label>
        <input
          id={inputId}
          type="text"
          value={cronExpr}
          onChange={(e) => setCronExpr(e.target.value)}
          placeholder="0 9 * * 1-5"
          className="w-full rounded-xl border border-border/70 bg-background p-3.5 font-mono text-base font-bold tracking-widest text-accent outline-none focus:border-accent"
        />
      </div>

      {/* Human Explanation Banner */}
      <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-4 flex items-center gap-3 text-accent font-mono text-sm">
        <Sparkles className="h-5 w-5 shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-accent/70">Human Explanation</div>
          <div className="font-semibold">{humanExplanation}</div>
        </div>
      </div>

      {/* Next 5 Upcoming Runs */}
      <div className="mb-6 rounded-xl border border-border/70 bg-background/50 p-4">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" /> Next 5 Scheduled Executions (Local Time)
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingRuns.map((run, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-card p-2.5 font-mono text-xs text-foreground/90">
              <span className="text-accent font-bold">#0{i + 1}:</span> {run}
            </div>
          ))}
        </div>
      </div>

      {/* Code Export */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vercel Cron (`vercel.json`)</span>
            <button
              onClick={() => handleCopy(vercelJson, "vercel")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "vercel" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{vercelJson}</pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">GitHub Actions (`workflow.yml`)</span>
            <button
              onClick={() => handleCopy(githubYaml, "gh")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "gh" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{githubYaml}</pre>
        </div>
      </div>
    </div>
  );
}
