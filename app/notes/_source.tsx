"use client";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export const NOTES = [
  {
    slug: "shipping-brand-sites-that-load-fast",
    title: "Shipping brand sites that load fast on real devices",
    date: "2026-05-12",
    minutes: 5,
    excerpt: "The three levers I keep pulling on Rustomjee, Kotak and Godrej projects to keep Lighthouse in the 90s.",
  },
  {
    slug: "html-emailers-in-2026",
    title: "HTML emailers in 2026 — still messy, still worth mastering",
    date: "2026-03-04",
    minutes: 4,
    excerpt: "Rendering across Outlook, Gmail and Apple Mail without losing your weekend — a working checklist.",
  },
  {
    slug: "figma-to-code-my-handoff-ritual",
    title: "Figma to code — the handoff ritual I use every project",
    date: "2026-01-20",
    minutes: 6,
    excerpt: "How I read a design file before I write a line of code. Tokens, states, edge cases and questions for the designer.",
  },
];



function NotesIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <h1 className="font-display mt-10 text-5xl font-bold tracking-tight">Notes</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Short reads on frontend craft — performance, handoff, and the boring wins that actually ship.
        </p>

        <ul className="mt-14 divide-y divide-border">
          {NOTES.map((n) => (
            <li key={n.slug}>
              <Link href="/notes/$slug"
                    className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:gap-8">
                <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-display text-xl font-semibold group-hover:text-accent transition-colors">
                    {n.title} <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">{n.excerpt}</span>
                  <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">{n.minutes} min read</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default NotesIndex;
