import { Radio, BookOpen, Hammer } from "lucide-react";

const ITEMS = [
  { icon: Hammer, label: "Building", value: "VIP Bags - Shopify PDP refresh" },
  {
    icon: BookOpen,
    label: "Reading",
    value: "Chrome for Developers",
    href: "https://developer.chrome.com/blog/",
  },
  { icon: Radio, label: "Listening", value: "Hanuman Chalisa" },
];

export function Currently() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-6 md:px-10">
      <div className="grid gap-3 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-md transition-colors hover:border-accent/50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Currently {label}
              </div>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-0.5 block truncate text-sm text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {value}
                </a>
              ) : (
                <div className="mt-0.5 truncate text-sm text-foreground">{value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
