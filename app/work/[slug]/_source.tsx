"use client";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar, Briefcase } from "lucide-react";
import { PROJECTS, getProject } from "@/lib/projects";
import { ViewCounter } from "@/components/view-counter";



function CaseStudyPage() {
  const { project } = undefined as any;
  const shot = (url: string) =>
    `https://image.thum.io/get/width/1200/crop/700/noanimate/${url}`;

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to work
        </Link>
        <div className="mt-4"><ViewCounter storageKey={`work:${project.slug}`} /></div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
          {project.tag}
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          {project.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {project.role}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {project.year}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.live && (
            <a href={project.links.live} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:scale-[1.02] transition-transform">
              <ExternalLink className="h-4 w-4" /> Visit live site
            </a>
          )}
          {project.links.code && (
            <a href={project.links.code} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-5 py-2.5 text-sm font-medium backdrop-blur-md hover:bg-card transition-colors">
              <Github className="h-4 w-4" /> Sibling site
            </a>
          )}
        </div>

        {project.links.live && (
          <figure className="mt-12 overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={shot(project.links.live)} alt={`${project.title} screenshot`}
                 loading="lazy" className="block w-full" />
          </figure>
        )}

        <section className="mt-16 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">The problem</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">{project.problem}</p>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">My approach</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">{project.solution}</p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Outcomes</h2>
          <ul className="mt-6 space-y-4">
            {project.outcomes.map((o: string) => (
              <li key={o} className="flex gap-4 rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-md">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="text-foreground/90">{o}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Tech stack</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s: string) => (
              <span key={s} className="rounded-full border border-border bg-card/40 px-4 py-1.5 font-mono text-xs backdrop-blur-md">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-border pt-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Next case study</p>
          <Link href="/work/$slug"
                className="mt-4 flex items-center justify-between gap-4 group">
            <span className="font-display text-2xl font-semibold group-hover:text-accent transition-colors sm:text-3xl">
              {next.title}
            </span>
            <span aria-hidden className="text-2xl text-accent transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

export default CaseStudyPage;
