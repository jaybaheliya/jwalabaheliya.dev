"use client";
import { lazy, Suspense, useEffect, useState } from "react";

const Sandpack = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({ default: m.Sandpack })),
);

const APP_CODE = `import { useState } from "react";

// A reusable magnetic button — one of Jwala's go-to interactions.
// Try clicking, or hover to feel the magnetic pull.
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid", placeItems: "center",
      background: "#0a0a0a", color: "#fff",
      fontFamily: "ui-sans-serif, system-ui",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.6, textTransform: "uppercase" }}>
          Reusable · Magnetic
        </div>
        <MagneticButton onClick={() => setCount(c => c + 1)}>
          Clicked {count}× — try me
        </MagneticButton>
      </div>
    </div>
  );
}

function MagneticButton({ children, onClick }) {
  const [xy, setXy] = useState({ x: 0, y: 0 });
  return (
    <button
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setXy({
          x: (e.clientX - r.left - r.width / 2) * 0.35,
          y: (e.clientY - r.top - r.height / 2) * 0.35,
        });
      }}
      onMouseLeave={() => setXy({ x: 0, y: 0 })}
      style={{
        marginTop: 16, padding: "18px 32px", borderRadius: 999,
        background: "#c6f24e", color: "#000", border: 0, cursor: "pointer",
        fontFamily: "inherit", fontWeight: 600, fontSize: 16,
        transform: \`translate(\${xy.x}px, \${xy.y}px)\`,
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {children}
    </button>
  );
}
`;

export function Playground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section id="playground" className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24">
      <div className="mb-8">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">/07 · Live Code</div>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Playground — edit the code, see it run</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          A production-ready magnetic button, running live in your browser. Edit the code on the left — the preview updates instantly.
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden border border-border">
        {mounted ? (
          <Suspense fallback={<div className="h-[440px] grid place-items-center text-sm text-muted-foreground">Loading playground…</div>}>
            <Sandpack
              template="react"
              theme="dark"
              files={{ "/App.js": APP_CODE }}
              options={{
                showTabs: false,
                showLineNumbers: true,
                editorHeight: 440,
                editorWidthPercentage: 55,
              }}
            />
          </Suspense>
        ) : (
          <div className="h-[440px] grid place-items-center text-sm text-muted-foreground">Loading playground…</div>
        )}
      </div>
    </section>
  );
}