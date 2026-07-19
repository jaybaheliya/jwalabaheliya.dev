import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NOTES } from "../_source";
import { ViewCounter } from "@/components/view-counter";

const BODIES: Record<string, string[]> = {
  "shipping-brand-sites-that-load-fast": [
    "Every corporate site I've shipped - Rustomjee, Kotak, Godrej - has one non-negotiable: it has to feel instant on a mid-range Android on 4G. Design signs off on desktop; the CTO cares about the phone. Three levers reliably move the number.",
    "1. Ship less JavaScript. I audit every dependency with `bun run build --analyze` and remove anything under 4kb of use. On brand marketing, jQuery, moment.js and full icon fonts almost always go first.",
    "2. Own the fold. LCP is usually one hero image or one webfont. I preload the exact variant, ship AVIF with a JPG fallback, and set explicit width/height so CLS never crosses 0.05.",
    "3. Defer the story. Long-scroll pages get intersection observers with a 200px root-margin - never load a gallery until it's about to be seen. Combined with `content-visibility: auto`, hidden sections cost almost nothing.",
    "Result across the last five projects: Lighthouse mobile 92-97, INP under 200ms on the real devices the client tests with.",
  ],
  "html-emailers-in-2026": [
    "HTML email is a museum of every mistake the web has ever made - and yet Kotak, Rustomjee and half my clients still need them. Here's the checklist I actually use.",
    "Layout: nested tables, 600px max width, no flex, no grid. Yes, in 2026. Outlook desktop still renders on Word.",
    "Images: hosted, absolute URLs, inline width/height, alt text - plus a text fallback because Gmail Promotions clips images.",
    "Styles: inline everything with a build step. I use `mjml` locally and hand-tune the compiled output for Outlook's `mso-` quirks.",
    "QA: I preview in Litmus for the top eight clients before a single mail goes out. It has caught bugs I would never have spotted in Gmail alone.",
  ],
  "figma-to-code-my-handoff-ritual": [
    "Before I open my editor I spend 20 minutes in Figma with a checklist. It sounds slow. It's actually the fastest thing I do.",
    "Tokens first. I export the color, spacing and type scale and turn them into CSS variables in `styles.css`. No pixel values in components.",
    "States next. Hover, focus-visible, disabled, loading, empty, error. If the design file has none of them, that's my first question for the designer.",
    "Edge cases. Long names, missing images, RTL, dark mode, zoom 200%. I annotate the file with what I'm assuming.",
    "Then I write the component library - not the pages. Pages become boring compositions after that, and design changes stop breaking me.",
  ],
};

export function NotePage({ slug }: { slug: string }) {
  const note = NOTES.find((entry) => entry.slug === slug);
  const body = note ? BODIES[note.slug] : undefined;

  if (!note || !body) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
        <Link href="/notes" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All notes
        </Link>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {new Date(note.date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })} · {note.minutes} min read
        </p>
        <div className="mt-3">
          <ViewCounter storageKey={`note:${note.slug}`} label="reads this week" />
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{note.title}</h1>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          {body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </article>
    </main>
  );
}

export default NotePage;
