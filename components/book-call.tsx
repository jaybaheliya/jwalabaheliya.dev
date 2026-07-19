import { Calendar, ExternalLink } from "lucide-react";

// Update this to your real Cal.com username
const CAL_USERNAME = "jwalabaheliya";
const CAL_EVENT = "15min";

export function BookCall() {
  const url = `https://cal.com/${CAL_USERNAME}/${CAL_EVENT}`;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
          <Calendar className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Book a call</div>
          <div className="font-display text-2xl font-bold">15-min intro chat</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Pick a slot — no forms, no back-and-forth. IST timezone, flexible for EU/US morning overlap.
      </p>

      <ul className="text-sm space-y-2 mb-6">
        <li className="flex gap-2"><span className="text-accent">→</span> Discuss role, stack, timeline</li>
        <li className="flex gap-2"><span className="text-accent">→</span> Walkthrough of relevant projects</li>
        <li className="flex gap-2"><span className="text-accent">→</span> Zero pressure, human conversation</li>
      </ul>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-accent-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition"
      >
        Book on Cal.com <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}