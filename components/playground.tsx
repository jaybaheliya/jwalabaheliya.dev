"use client";

import { useEffect, useState } from "react";
import {
  Sandpack,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

const REACT_APP_CODE = `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "ui-sans-serif, system-ui",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.6, textTransform: "uppercase" }}>
          Reusable · Magnetic
        </div>
        <MagneticButton onClick={() => setCount((c) => c + 1)}>
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
        marginTop: 16,
        padding: "18px 32px",
        borderRadius: 999,
        background: "#c6f24e",
        color: "#000",
        border: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: 16,
        transform: \`translate(\${xy.x}px, \${xy.y}px)\`,
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {children}
    </button>
  );
}
`;

const HTML_ENTRY = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Live HTML CSS JS Playground</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="shell">
      <p class="eyebrow">HTML · CSS · JS</p>
      <h1>Make the card respond live.</h1>
      <p class="copy">Edit the markup, styles, or script on the left. The preview updates instantly here.</p>
      <button id="themeToggle" class="cta">Switch Accent</button>

      <section class="card">
        <div class="orb"></div>
        <h2>Frontend micro-interaction</h2>
        <p>Hover the card and click the button to cycle the accent glow.</p>
        <div class="pill-row">
          <span class="pill">HTML</span>
          <span class="pill">CSS</span>
          <span class="pill">JavaScript</span>
        </div>
      </section>
    </main>
    <script src="/index.js"></script>
  </body>
</html>
`;

const HTML_CSS = `:root {
  --bg: #07111f;
  --panel: #0f1b2d;
  --text: #f8fafc;
  --muted: #9fb3c8;
  --accent: #60a5fa;
  --accent-soft: rgba(96, 165, 250, 0.22);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, sans-serif;
  background:
    radial-gradient(circle at top, rgba(96, 165, 250, 0.18), transparent 32%),
    linear-gradient(180deg, #040b15 0%, var(--bg) 100%);
  color: var(--text);
}

.shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 20px;
  padding: 32px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.32em;
  font-size: 11px;
  color: var(--muted);
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 0.95;
  text-align: center;
}

.copy {
  max-width: 560px;
  margin: 0;
  text-align: center;
  line-height: 1.7;
  color: var(--muted);
}

.cta {
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: #04111f;
  background: linear-gradient(135deg, var(--accent), #c4f33b);
  box-shadow: 0 16px 40px -24px var(--accent-soft);
}

.card {
  position: relative;
  width: min(620px, 100%);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  box-shadow: 0 26px 70px -38px rgba(15, 23, 42, 0.75);
  transition: transform 280ms ease, border-color 280ms ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.orb {
  position: absolute;
  width: 200px;
  height: 200px;
  right: -40px;
  top: -70px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--accent-soft), transparent 62%);
}

.card h2 {
  position: relative;
  margin: 0;
  font-size: 1.6rem;
}

.card p {
  position: relative;
  margin: 10px 0 0;
  line-height: 1.7;
  color: var(--muted);
}

.pill-row {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.pill {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--muted);
}
`;

const HTML_JS = `const colors = [
  { accent: "#60a5fa", glow: "rgba(96, 165, 250, 0.22)" },
  { accent: "#34d399", glow: "rgba(52, 211, 153, 0.22)" },
  { accent: "#f472b6", glow: "rgba(244, 114, 182, 0.22)" },
  { accent: "#f59e0b", glow: "rgba(245, 158, 11, 0.24)" },
];

let index = 0;
const root = document.documentElement;
const button = document.getElementById("themeToggle");

button.addEventListener("click", () => {
  index = (index + 1) % colors.length;
  root.style.setProperty("--accent", colors[index].accent);
  root.style.setProperty("--accent-soft", colors[index].glow);
  button.textContent = "Accent " + (index + 1) + " Active";
});
`;

const CONSOLE_ENTRY = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Console Sandbox</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="console-shell">
      <section class="console-panel">
        <p class="console-eyebrow">Console · Sandbox · Preview</p>
        <h1 class="console-title">Use the browser-like console below.</h1>
        <p class="console-copy">Edit the script and refresh the preview. The integrated console panel will stream logs, arrays, objects, and timing output.</p>
        <button id="runButton" class="console-run">Emit Logs</button>
        <div class="console-note">Open the Console tab under the editor to inspect output like a lightweight devtools panel.</div>
      </section>
    </main>
    <script src="/index.js"></script>
  </body>
</html>
`;

const CONSOLE_CSS = `:root {
  --bg: #070d16;
  --panel: #0f1724;
  --line: rgba(255,255,255,0.08);
  --text: #f8fafc;
  --muted: #93a4b8;
  --accent: #38bdf8;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 34%),
    linear-gradient(180deg, #040912 0%, var(--bg) 100%);
  color: var(--text);
}

.console-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.console-panel {
  width: min(760px, 100%);
  border: 1px solid var(--line);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  box-shadow: 0 30px 70px -40px rgba(15, 23, 42, 0.85);
  padding: 24px;
}

.console-eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--muted);
}

.console-title {
  margin: 14px 0 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 1;
}

.console-copy {
  margin: 12px 0 0;
  max-width: 640px;
  color: var(--muted);
  line-height: 1.7;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.console-run {
  margin-top: 18px;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, var(--accent), #7dd3fc);
  color: #03111c;
  font-weight: 700;
  cursor: pointer;
}

.console-note {
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 18px;
  background: rgba(2, 6, 12, 0.78);
  color: #cbd5e1;
  line-height: 1.7;
}
`;

const CONSOLE_JS = `const button = document.getElementById("runButton");

button.addEventListener("click", () => {
  console.clear();
  console.log("Console sandbox started");

  const prices = [1299, 799, 2599, 499];
  const coupon = 0.12;
  const discounted = prices.map((price) => Math.round(price * (1 - coupon)));
  const summary = {
    originalTotal: prices.reduce((sum, price) => sum + price, 0),
    discountedTotal: discounted.reduce((sum, price) => sum + price, 0),
    saved: prices.reduce((sum, price, index) => sum + (price - discounted[index]), 0),
  };

  console.log("Original prices:", prices);
  console.table(discounted.map((price, index) => ({
    index: index + 1,
    original: prices[index],
    discounted: price,
  })));
  console.info("Summary:", summary);
  console.warn("Tip: edit /index.js on the left, then click Emit Logs again.");
});
`;

export function Playground() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"react" | "html" | "console">("react");
  const sandboxHeight = 560;

  useEffect(() => setMounted(true), []);

  return (
    <section id="playground" className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">/07 · Live Code</div>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Playground — edit the code, see it run</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Switch between a React sandbox, a pure HTML / CSS / JS sandbox, and a console-style debugging sandbox. Edit the code on the left and inspect the result live.
        </p>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-border bg-card/70 p-1 text-[11px] font-mono uppercase tracking-widest">
        <button
          type="button"
          onClick={() => setMode("react")}
          className={"rounded-full px-4 py-2 transition " + (mode === "react" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
        >
          React JS
        </button>
        <button
          type="button"
          onClick={() => setMode("html")}
          className={"rounded-full px-4 py-2 transition " + (mode === "html" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
        >
          HTML / CSS / JS
        </button>
        <button
          type="button"
          onClick={() => setMode("console")}
          className={"rounded-full px-4 py-2 transition " + (mode === "console" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
        >
          Console / Run
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        {mounted ? (
          mode === "console" ? (
            <SandpackProvider
              template="static"
              theme="dark"
              files={{
                "/index.html": CONSOLE_ENTRY,
                "/styles.css": CONSOLE_CSS,
                "/index.js": CONSOLE_JS,
              }}
              options={{
                activeFile: "/index.js",
                visibleFiles: ["/index.js", "/styles.css", "/index.html"],
              }}
            >
              <SandpackLayout className="bg-[#111111]" style={{ minHeight: sandboxHeight }}>
                <SandpackCodeEditor showTabs showLineNumbers style={{ height: sandboxHeight, flex: 1, minWidth: 0 }} />
                <div className="flex min-w-0 flex-1 flex-col border-l border-white/10 bg-[#0b0b0b]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/45">Console Output</div>
                      <div className="mt-1 text-sm text-white/80">Logs stream here after the sandbox runs.</div>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">
                      Live
                    </div>
                  </div>
                  <SandpackPreview style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }} />
                  <SandpackConsole
                    standalone
                    showHeader={false}
                    showResetConsoleButton
                    resetOnPreviewRestart
                    style={{ height: sandboxHeight, border: 0 }}
                  />
                </div>
              </SandpackLayout>
            </SandpackProvider>
          ) : mode === "react" ? (
            <Sandpack
              template="react"
              theme="dark"
              files={{ "/App.js": REACT_APP_CODE }}
              options={{
                showTabs: false,
                showLineNumbers: true,
                editorHeight: sandboxHeight,
                editorWidthPercentage: 55,
              }}
            />
          ) : (
            <Sandpack
              template="static"
              theme="dark"
              files={{
                "/index.html": HTML_ENTRY,
                "/styles.css": HTML_CSS,
                "/index.js": HTML_JS,
              }}
              options={{
                showTabs: true,
                showLineNumbers: true,
                editorHeight: sandboxHeight,
                editorWidthPercentage: 55,
              }}
            />
          )
        ) : (
          <div className="grid h-[560px] place-items-center text-sm text-muted-foreground">Loading playground...</div>
        )}
      </div>
    </section>
  );
}
