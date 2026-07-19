"use client";
import { useEffect, useState } from "react";
import { Github, Star, GitFork, Users } from "lucide-react";

const USER = "jaybaheliya";

type Stats = {
  repos: number;
  followers: number;
  stars: number;
  languages: { name: string; pct: number; color: string }[];
};

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  SCSS: "#c6538c", Vue: "#41b883", PHP: "#4F5D95", Shell: "#89e051", Python: "#3572A5",
};

export function GithubStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${USER}`),
          fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`),
        ]);
        if (!uRes.ok || !rRes.ok) throw new Error("GitHub API");
        const u = await uRes.json();
        const repos = (await rRes.json()) as Array<{ language: string | null; stargazers_count: number }>;
        const stars = repos.reduce((a, r) => a + (r.stargazers_count ?? 0), 0);
        const counts = new Map<string, number>();
        repos.forEach((r) => r.language && counts.set(r.language, (counts.get(r.language) ?? 0) + 1));
        const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
        const languages = [...counts.entries()]
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100), color: LANG_COLORS[name] ?? "#888" }));
        if (!cancelled) setStats({ repos: u.public_repos ?? repos.length, followers: u.followers ?? 0, stars, languages });
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Github className="h-3.5 w-3.5" /> Live from GitHub
        </div>
        <a href={`https://github.com/${USER}`} target="_blank" rel="noreferrer"
           className="font-mono text-[11px] text-accent hover:underline">@{USER} ↗</a>
      </div>

      {err && <p className="mt-4 text-sm text-muted-foreground">Couldn't reach GitHub right now.</p>}
      {!stats && !err && (
        <div className="mt-6 space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      )}
      {stats && (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={<GitFork className="h-3.5 w-3.5" />} label="Repos" value={stats.repos} />
            <Stat icon={<Star className="h-3.5 w-3.5" />}    label="Stars" value={stats.stars} />
            <Stat icon={<Users className="h-3.5 w-3.5" />}   label="Followers" value={stats.followers} />
          </div>
          {stats.languages.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Top languages</div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                {stats.languages.map((l) => (
                  <span key={l.name} style={{ width: `${l.pct}%`, background: l.color }} title={`${l.name} ${l.pct}%`} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                {stats.languages.map((l) => (
                  <span key={l.name} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                    {l.name} <span className="text-foreground/60">{l.pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}</div>
      <div className="font-display mt-1 text-2xl font-bold">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}