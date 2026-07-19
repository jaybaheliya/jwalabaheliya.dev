const STACK = [
  { name: "React 19", note: "concurrent UI" },
  { name: "TanStack Start", note: "typed routing + SSR" },
  { name: "Tailwind v4", note: "token-first styling" },
  { name: "Lenis", note: "smooth scroll" },
  { name: "Sonner", note: "toasts" },
  { name: "Lucide", note: "iconography" },
  { name: "Vite 7", note: "build" },
  { name: "TypeScript", note: "strict mode" },
];

export function BuiltWith() {
  return (
    <section className="border-t border-border/50 py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              /meta
            </div>
            <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
              Built with <span className="text-accent">this stack</span>
            </h2>
          </div>
          <div className="text-right font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            self-aware · v1.0
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STACK.map((s) => (
            <li
              key={s.name}
              className="group rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-md transition-colors hover:border-accent/60 hover:bg-card"
            >
              <div className="font-display text-base font-semibold">{s.name}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.note}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}