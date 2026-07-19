"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { applyMode, getSavedMode } from "./theme-switcher";

/**
 * ⌘K / Ctrl+K command palette.
 * Fuzzy filter across nav jumps, contact actions, and theme swaps.
 */

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Contact" | "Theme" | "Utility";
  keywords?: string;
  run: () => void | Promise<void>;
};

const EMAIL = "jaybaheliya@gmail.com";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const actions = useMemo<Action[]>(() => {
    const nav: Action[] = [
      { id: "nav-top",     group: "Navigate", label: "Jump to top",           hint: "G T", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
      { id: "nav-about",   group: "Navigate", label: "Jump to About",         hint: "G A", run: () => scrollTo("about") },
      { id: "nav-work",    group: "Navigate", label: "Jump to Selected Work", hint: "G W", run: () => scrollTo("work") },
      { id: "nav-contact", group: "Navigate", label: "Jump to Contact",       hint: "G C", run: () => scrollTo("contact") },
    ];
    const contact: Action[] = [
      {
        id: "copy-email", group: "Contact", label: "Copy email address", hint: "⏎",
        keywords: EMAIL,
        run: async () => {
          try { await navigator.clipboard.writeText(EMAIL); toast.success("Email copied"); }
          catch { toast.error("Couldn't copy — try the contact section"); }
        },
      },
      { id: "mail",     group: "Contact", label: "Send an email",           run: () => (window.location.href = `mailto:${EMAIL}`) },
      { id: "linkedin", group: "Contact", label: "Open LinkedIn",           run: () => window.open("https://www.linkedin.com/in/jwala-baheliya-a82a5411b", "_blank", "noopener") },
      { id: "resume",   group: "Contact", label: "Download resume (PDF)",   run: () => window.print() },
    ];
    const themes: Action[] = [
      {
        id: "theme-light", group: "Theme", label: "Switch to Light mode",
        keywords: "light theme mode day",
        run: () => { applyMode("light"); toast.success("Light mode"); },
      },
      {
        id: "theme-dark", group: "Theme", label: "Switch to Dark mode",
        keywords: "dark theme mode night",
        run: () => { applyMode("dark"); toast.success("Dark mode"); },
      },
      {
        id: "theme-toggle", group: "Theme", label: "Toggle Light / Dark",
        keywords: "toggle theme mode",
        run: () => {
          const next = getSavedMode() === "dark" ? "light" : "dark";
          applyMode(next);
          toast.success(`${next[0].toUpperCase()}${next.slice(1)} mode`);
        },
      },
    ];
    const util: Action[] = [
      { id: "reload", group: "Utility", label: "Reload page", run: () => window.location.reload() },
    ];
    return [...nav, ...contact, ...themes, ...util];
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return actions;
    return actions.filter((a) =>
      `${a.label} ${a.group} ${a.keywords ?? ""}`.toLowerCase().includes(s)
    );
  }, [q, actions]);

  // Global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset on open + focus input
  useEffect(() => {
    if (!open) return;
    setQ("");
    setI(0);
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset index when filter changes
  useEffect(() => { setI(0); }, [q]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${i}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [i, open]);

  const runAt = (idx: number) => {
    const a = filtered[idx];
    if (!a) return;
    setOpen(false);
    // Defer so overflow-lock unwinds before scroll actions
    setTimeout(() => a.run(), 40);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[55] px-3 py-1.5 rounded-full border border-border bg-background/80 backdrop-blur-md font-mono text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors shadow-lg"
      >
        Press{" "}
        <kbd className="mx-1 px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">⌘</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">K</kbd>{" "}
        to command
      </button>
    );
  }

  // Group filtered items for section labels
  const groups: Record<string, Action[]> = {};
  filtered.forEach((a) => {
    (groups[a.group] ??= []).push(a);
  });
  let running = 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] bg-background/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="slide-up-fade w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="font-mono text-xs text-muted-foreground">›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(filtered.length - 1, n + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
              else if (e.key === "Enter") { e.preventDefault(); runAt(i); }
            }}
            placeholder="Search actions, sections, themes…"
            className="flex-1 bg-transparent outline-none font-sans text-sm placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center font-mono text-xs text-muted-foreground">
              No matches. Try &quot;work&quot;, &quot;email&quot;, or &quot;theme&quot;.
            </div>
          ) : (
            Object.entries(groups).map(([g, items]) => (
              <div key={g} className="mb-2 last:mb-0">
                <div className="px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  {g}
                </div>
                {items.map((a) => {
                  const idx = running++;
                  const active = idx === i;
                  return (
                    <button
                      key={a.id}
                      data-idx={idx}
                      onMouseEnter={() => setI(idx)}
                      onClick={() => runAt(idx)}
                      className={
                        "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                        (active ? "bg-accent text-accent-foreground" : "text-foreground/85 hover:bg-muted")
                      }
                    >
                      <span className="truncate">{a.label}</span>
                      {a.hint && (
                        <span
                          className={
                            "font-mono text-[10px] tracking-widest " +
                            (active ? "text-accent-foreground/70" : "text-muted-foreground")
                          }
                        >
                          {a.hint}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">⏎</kbd>{" "}
            run
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-foreground">esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}