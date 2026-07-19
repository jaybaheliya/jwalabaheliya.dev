"use client";
import { useEffect, useState } from "react";

/**
 * Ambient code-syntax backdrop — 4 slow-scrolling columns of syntax-highlighted
 * TS/React snippets behind the page content. Very low opacity, non-interactive,
 * respects prefers-reduced-motion (renders static columns instead of scrolling).
 */

// Simple tokenizer that returns styled spans. Keeps things fast — no regex heavy lifting.
type Tok = { t: "kw" | "str" | "com" | "num" | "typ" | "fn" | "op" | "txt"; v: string };

const KW = new Set([
  "const","let","var","function","return","if","else","for","while","import","from","export",
  "default","async","await","new","class","extends","interface","type","as","of","in","null",
  "undefined","true","false","this","void","typeof","try","catch","finally","throw","break",
  "continue","switch","case","yield","static","public","private","protected","readonly",
]);
const TYP = new Set([
  "string","number","boolean","any","unknown","never","void","Promise","Array","Record",
  "Partial","Readonly","React","JSX","HTMLElement","Element","Ref","MutableRefObject",
]);

function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const N = line.length;
  while (i < N) {
    const ch = line[i];
    // comment
    if (ch === "/" && line[i + 1] === "/") {
      out.push({ t: "com", v: line.slice(i) });
      break;
    }
    // string (single, double, backtick)
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      let j = i + 1;
      while (j < N && line[j] !== q) j++;
      out.push({ t: "str", v: line.slice(i, Math.min(j + 1, N)) });
      i = j + 1;
      continue;
    }
    // number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < N && /[0-9.]/.test(line[j])) j++;
      out.push({ t: "num", v: line.slice(i, j) });
      i = j;
      continue;
    }
    // identifier / keyword
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < N && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isCall = line[j] === "(";
      if (KW.has(word)) out.push({ t: "kw", v: word });
      else if (TYP.has(word)) out.push({ t: "typ", v: word });
      else if (isCall) out.push({ t: "fn", v: word });
      else out.push({ t: "txt", v: word });
      i = j;
      continue;
    }
    // operator / punctuation
    if (/[{}()[\];,.<>=+\-*/%!?:&|^~]/.test(ch)) {
      out.push({ t: "op", v: ch });
      i++;
      continue;
    }
    out.push({ t: "txt", v: ch });
    i++;
  }
  return out;
}

const cls: Record<Tok["t"], string> = {
  kw:  "text-[color:var(--accent)]",
  typ: "text-[color:color-mix(in_oklab,var(--accent)_75%,var(--foreground))]",
  fn:  "text-foreground/85",
  str: "text-foreground/55",
  num: "text-[color:color-mix(in_oklab,var(--accent)_60%,var(--foreground))]",
  com: "text-foreground/35 italic",
  op:  "text-foreground/45",
  txt: "text-foreground/65",
};

// Real-ish snippets from a portfolio dev's codebase.
const SNIPPETS: string[][] = [
  [
    "// hooks/useReveal.ts",
    "import { useEffect, useRef, useState } from 'react'",
    "",
    "export function useReveal<T extends HTMLElement>() {",
    "  const ref = useRef<T>(null)",
    "  const [shown, setShown] = useState(false)",
    "  useEffect(() => {",
    "    const el = ref.current",
    "    if (!el) return",
    "    const io = new IntersectionObserver(([e]) => {",
    "      if (e.isIntersecting) setShown(true)",
    "    }, { threshold: 0.15 })",
    "    io.observe(el)",
    "    return () => io.disconnect()",
    "  }, [])",
    "  return { ref, shown } as const",
    "}",
  ],
  [
    "// components/Marquee.tsx",
    "export function Marquee({ items }: { items: string[] }) {",
    "  const doubled = [...items, ...items]",
    "  return (",
    "    <div className='marquee'>",
    "      {doubled.map((label, i) => (",
    "        <span key={i} className='px-4'>",
    "          {label}",
    "        </span>",
    "      ))}",
    "    </div>",
    "  )",
    "}",
  ],
  [
    "// lib/spring.ts",
    "export const spring = {",
    "  stiff: (v: number) => Math.min(1, 1 - Math.exp(-6 * v)),",
    "  soft:  (v: number) => 1 - Math.pow(1 - v, 3),",
    "  bounce: (v: number) => {",
    "    const n = 7.5625, d = 2.75",
    "    if (v < 1 / d) return n * v * v",
    "    if (v < 2 / d) return n * (v -= 1.5 / d) * v + 0.75",
    "    return n * (v -= 2.625 / d) * v + 0.984375",
    "  },",
    "}",
  ],
  [
    "// routes/index.lazy.tsx",
    "const PROJECTS = [",
    "  { name: 'Rustomjee',  tag: 'Real Estate' },",
    "  { name: 'Godrej',     tag: 'Real Estate' },",
    "  { name: 'Kotak',      tag: 'Finance' },",
    "  { name: 'Tata',       tag: 'Enterprise' },",
    "  { name: 'Shapoorji',  tag: 'Real Estate' },",
    "]",
    "",
    "export function Work() {",
    "  return PROJECTS.map((p) => <Row key={p.name} p={p} />)",
    "}",
  ],
];

function Column({ lines, dir, dur, delay }: { lines: string[]; dir: "up" | "down"; dur: number; delay: number }) {
  // Duplicate list so translateY(-50%) loops seamlessly.
  const doubled = [...lines, ...lines];
  const anim =
    dir === "up" ? "code-scroll-up" : "code-scroll-down";
  return (
    <div
      className="absolute top-0 h-[200%] font-mono text-[11px] md:text-xs leading-6 whitespace-pre overflow-hidden"
      style={{
        animation: `${anim} ${dur}s linear infinite`,
        animationDelay: `-${delay}s`,
        willChange: "transform",
      }}
    >
      {doubled.map((line, i) => (
        <div key={i}>
          {tokenize(line).map((tok, j) => (
            <span key={j} className={cls[tok.t]}>
              {tok.v}
            </span>
          ))}
          {line === "" ? "\u00A0" : null}
        </div>
      ))}
    </div>
  );
}

export function CodeBackdrop() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!mounted) return null;

  // 4 columns positioned across the viewport. Skip inner columns on narrow screens via CSS.
  const columns = [
    { snippet: SNIPPETS[0], dir: "up"   as const, dur: 90, delay: 0,  left: "2%",   hideOnSm: false },
    { snippet: SNIPPETS[1], dir: "down" as const, dur: 110, delay: 20, left: "28%",  hideOnSm: true  },
    { snippet: SNIPPETS[2], dir: "up"   as const, dur: 100, delay: 40, left: "56%",  hideOnSm: true  },
    { snippet: SNIPPETS[3], dir: "down" as const, dur: 120, delay: 10, left: "82%",  hideOnSm: false },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none opacity-[0.08] md:opacity-[0.11]"
      style={{
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 90%)",
      }}
    >
      {columns.map((c, i) => (
        <div
          key={i}
          className={"absolute top-0 h-full " + (c.hideOnSm ? "hidden md:block" : "")}
          style={{ left: c.left, width: "18ch" }}
        >
          {reduced ? (
            <div className="font-mono text-[11px] md:text-xs leading-6 whitespace-pre">
              {c.snippet.map((line, j) => (
                <div key={j}>
                  {tokenize(line).map((tok, k) => (
                    <span key={k} className={cls[tok.t]}>{tok.v}</span>
                  ))}
                  {line === "" ? "\u00A0" : null}
                </div>
              ))}
            </div>
          ) : (
            <Column lines={c.snippet} dir={c.dir} dur={c.dur} delay={c.delay} />
          )}
        </div>
      ))}
    </div>
  );
}