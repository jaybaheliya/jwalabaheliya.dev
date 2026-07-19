"use client";
import { useState } from "react";
import { Loader2, Target, Check, X } from "lucide-react";

type Result = { score: number; verdict: string; matched: string[]; missing: string[]; summary: string };

const SAMPLE = `We're hiring a Senior Frontend Engineer with 5+ years of React and TypeScript experience. You'll own our marketing site and web app, ship pixel-perfect UI from Figma, care about performance and accessibility, and collaborate with designers daily. Bonus: Next.js, Tailwind, motion design.`;

export function SkillMatchScanner() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function scan() {
    if (jd.trim().length < 20 || loading) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      const res = await fetch("/api/skill-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e) {
      setErr((e as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 80 ? "text-emerald-500" : result.score >= 60 ? "text-amber-500" : "text-red-500"
    : "";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">AI Skill Match</div>
          <div className="font-display text-2xl font-bold">Paste your JD — see the fit</div>
        </div>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the full job description here..."
        className="w-full h-32 rounded-xl border border-border bg-background p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
        <button
          onClick={() => setJd(SAMPLE)}
          className="text-xs font-mono text-muted-foreground hover:text-foreground underline"
        >
          Try a sample JD
        </button>
        <button
          onClick={scan}
          disabled={jd.trim().length < 20 || loading}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-accent-foreground font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing</> : "Score fit"}
        </button>
      </div>

      {err && <div className="mt-4 text-sm text-red-500">{err}</div>}

      {result && (
        <div className="mt-6 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-end gap-4 mb-4">
            <div className={"text-6xl font-display font-bold tabular-nums " + scoreColor}>{result.score}<span className="text-xl text-muted-foreground">%</span></div>
            <div className="mb-2">
              <div className={"text-xs font-mono uppercase tracking-widest " + scoreColor}>{result.verdict}</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-md">{result.summary}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-2">Strong match</div>
              <ul className="space-y-1.5 text-sm">
                {result.matched.map((m) => <li key={m} className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{m}</li>)}
              </ul>
            </div>
            {result.missing.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-2">Growth areas</div>
                <ul className="space-y-1.5 text-sm">
                  {result.missing.map((m) => <li key={m} className="flex gap-2"><X className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}