"use client";
import { useEffect, useState } from "react";

// Public contributions API (no auth, no rate-limit issues)
// Change username to yours
const USERNAME = "jaybaheliya";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type ApiRes = { total: Record<string, number>; contributions: Day[] };

export function GithubContributions() {
  const [data, setData] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setError("Couldn't load contributions"));
  }, []);

  // slice to last ~26 weeks for a compact display
  const days = data?.contributions ?? [];
  const recent = days.slice(-182);
  // group into weeks (columns)
  const weeks: Day[][] = [];
  for (let i = 0; i < recent.length; i += 7) weeks.push(recent.slice(i, i + 7));
  const total = recent.reduce((a, b) => a + b.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Live GitHub</div>
          <div className="font-display text-2xl font-bold">Contribution graph</div>
        </div>
        <a
          href={`https://github.com/${USERNAME}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-accent hover:underline"
        >
          @{USERNAME} ↗
        </a>
      </div>

      {error && <div className="text-sm text-muted-foreground">{error}</div>}

      {!error && !data && (
        <div className="h-[112px] rounded-lg bg-muted animate-pulse" />
      )}

      {data && (
        <>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-[3px] min-w-max">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {w.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.count} commits`}
                      className="h-[12px] w-[12px] rounded-[3px]"
                      style={{ background: levelColor(d.level) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{total} contributions · last 6 months</span>
            <div className="flex items-center gap-1">
              <span>less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <span key={l} className="h-3 w-3 rounded-sm" style={{ background: levelColor(l as Day["level"]) }} />
              ))}
              <span>more</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function levelColor(level: Day["level"]) {
  const shades = [
    "color-mix(in oklab, var(--muted) 60%, transparent)",
    "color-mix(in oklab, var(--accent) 20%, transparent)",
    "color-mix(in oklab, var(--accent) 45%, transparent)",
    "color-mix(in oklab, var(--accent) 70%, transparent)",
    "hsl(var(--accent))",
  ];
  return shades[level];
}