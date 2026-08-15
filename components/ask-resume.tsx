"use client";
import { useEffect, useRef, useState } from "react";
import { X, ArrowUp, Sparkles, Circle } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Does Jwala know Next.js?",
  "Which brands has he shipped?",
  "Years of experience?",
  "Is he open to hire?",
  "Strongest skills?",
];

// Offline fallback — free, no API. Answers common recruiter questions locally
// so the chat still works when LOVABLE_API_KEY is out of credits or the
// gateway is unreachable.
const FACTS: { match: RegExp; answer: string }[] = [
  { match: /(experience|years|how long)/i, answer: "Jwala has **8+ years** of frontend experience — currently Senior Frontend Developer at Bombay DC, previously HRMantra and Technofra." },
  { match: /(hire|available|availability|open to|freelance|contract|join)/i, answer: "**Yes — open to opportunities.** Based in Mumbai, IST. Reach him at **jaybaheliya@gmail.com**." },
  { match: /(contact|email|reach|phone)/i, answer: "📧 **jaybaheliya@gmail.com** — fastest way to reach Jwala." },
  { match: /(next\.?js|nextjs)/i, answer: "Yes — Next.js is part of his core stack alongside React, TypeScript, and TanStack." },
  { match: /(react|typescript|ts\b)/i, answer: "Core stack: **React, TypeScript, Next.js, TanStack, Tailwind, Framer Motion, Three.js**." },
  { match: /(skill|stack|tech|tools)/i, answer: "**Frontend:** React, Next.js, TypeScript, Tailwind, Framer Motion, Three.js, GSAP, Redux, Zustand, Vite. **Design:** Figma, design systems, accessibility, motion." },
  { match: /(brand|client|company|worked|project)/i, answer: "Shipped for **Rustomjee, Godrej, Kotak, Yes Bank, AU Bank, VIP Bags, Bharat Connect, RMZ, Kokuyo Camlin, Delhi Redz, Employee Vibes, Bits Design School, Mezete, Kasih Food** and more." },
  { match: /(location|where|based|city|mumbai|india|remote)/i, answer: "Based in **Mumbai, India (IST)** — open to remote and hybrid roles globally." },
  { match: /(education|degree|study|college)/i, answer: "Graduate in Computer Applications. Self-driven learner — 8+ years shipping production frontend." },
  { match: /(language|speak)/i, answer: "English, Hindi, Marathi." },
  { match: /(hi|hello|hey|yo)\b/i, answer: "Hey! 👋 Ask me about Jwala's experience, stack, brands he's shipped, or availability." },
];

function offlineAnswer(q: string): string {
  for (const f of FACTS) if (f.match.test(q)) return f.answer;
  return "I'm on offline mode right now — email **jaybaheliya@gmail.com** and he'll get back within a day. You can also ask about his *experience, stack, brands, or availability*.";
}

export function AskResume() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi — ask me anything about Jwala's experience, stack, or availability." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        setMsgs((m) => [...m, { role: "assistant", content: offlineAnswer(q) + "\n\n_(offline mode)_" }]);
      } else {
        const { reply } = (await res.json()) as { reply: string };
        setMsgs((m) => [...m, { role: "assistant", content: reply || "…" }]);
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: offlineAnswer(q) + "\n\n_(offline mode)_" }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask my resume"
        className="fixed bottom-4 right-4 z-[60] h-12 pl-1.5 pr-2 sm:pr-4 rounded-full border border-border bg-background/90 backdrop-blur-xl shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform group max-w-[calc(100vw-5rem)]"
        style={{ boxShadow: "0 12px 40px -10px color-mix(in oklab, var(--accent) 70%, transparent)" }}
      >
        <span className="relative h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </span>
        <span className="hidden xs:inline sm:inline font-mono text-[11px] tracking-widest uppercase text-foreground pr-2">Ask&nbsp;my&nbsp;resume</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop — mobile-first modal feel */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[59] bg-background/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-0 sm:pointer-events-none animate-in fade-in duration-200"
      />

      {/* Panel — full-screen sheet on mobile, floating card on desktop */}
      <div
        role="dialog"
        aria-label="Ask my resume"
        data-lenis-prevent
        className="fixed z-[60] flex flex-col overflow-hidden bg-card border-border shadow-2xl slide-up-fade
                   inset-0 sm:inset-auto
                   sm:bottom-4 sm:right-4 sm:w-[400px] sm:h-[600px]
                   rounded-none sm:rounded-3xl
                   border-t sm:border"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header — mobile app style */}
        <header className="relative flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-xl">
          {/* Drag handle for mobile */}
          <span
            aria-hidden
            className="sm:hidden absolute left-1/2 -translate-x-1/2 top-1.5 h-1 w-10 rounded-full bg-muted-foreground/30"
          />
          <div className="relative shrink-0 mt-2 sm:mt-0">
            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent/70 text-accent-foreground flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="min-w-0 flex-1 mt-2 sm:mt-0">
            <div className="text-[15px] font-semibold leading-tight truncate">Ask about Jwala</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
              <span>AI · online</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="shrink-0 mt-2 sm:mt-0 h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Transcript */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3"
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                "flex items-end gap-2 " +
                (m.role === "user" ? "justify-end" : "justify-start")
              }
            >
              {m.role === "assistant" && (
                <span className="shrink-0 h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
              <div
                className={
                  "max-w-[80%] px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm " +
                  (m.role === "user"
                    ? "bg-accent text-accent-foreground rounded-2xl rounded-br-md"
                    : "bg-muted text-foreground rounded-2xl rounded-bl-md")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <span className="shrink-0 h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Sparkles className="h-3 w-3" />
              </span>
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-3.5 py-3 shadow-sm">
                <span className="inline-flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "240ms" }} />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions — horizontal scroll like iMessage */}
        {msgs.length <= 1 && !loading && (
          <div className="border-t border-border/50 px-3 py-2 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="whitespace-nowrap text-[12px] px-3 py-1.5 rounded-full border border-border bg-background/50 text-foreground/80 hover:text-foreground hover:border-accent hover:bg-accent/10 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2 border-t border-border px-3 py-2.5 bg-card"
        >
          <div className="flex-1 flex items-center bg-muted rounded-full pl-4 pr-1 py-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message"
              enterKeyHint="send"
              className="flex-1 bg-transparent outline-none text-[15px] py-1.5 placeholder:text-muted-foreground min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="shrink-0 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-105 enabled:active:scale-95 transition-transform"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}