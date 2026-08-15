"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Braces, Sparkles, FileCode, CheckCircle2 } from "lucide-react";

const SAMPLE_JSON = `{
  "id": "usr_982173",
  "name": "Jwala Baheliya",
  "email": "jaybaheliya@gmail.com",
  "age": 29,
  "role": "Senior Frontend Developer",
  "isAvailable": true,
  "skills": ["React", "Next.js", "TypeScript", "Tailwind"],
  "stats": {
    "projectsShipped": 20,
    "rating": 4.95,
    "verified": true
  },
  "socials": [
    { "platform": "GitHub", "url": "https://github.com" },
    { "platform": "LinkedIn", "url": "https://linkedin.com" }
  ]
}`;

function generateZodSchema(obj: unknown, indentLevel = 0): string {
  const indent = "  ".repeat(indentLevel);
  const childIndent = "  ".repeat(indentLevel + 1);

  if (obj === null || obj === undefined) {
    return "z.nullable(z.any())";
  }

  if (typeof obj === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(obj)) return "z.string().datetime()";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj)) return "z.string().email()";
    if (/^https?:\/\//.test(obj)) return "z.string().url()";
    return "z.string()";
  }

  if (typeof obj === "number") {
    if (Number.isInteger(obj)) return "z.number().int()";
    return "z.number()";
  }

  if (typeof obj === "boolean") {
    return "z.boolean()";
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "z.array(z.any())";
    const itemSchema = generateZodSchema(obj[0], indentLevel);
    return `z.array(${itemSchema})`;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) return "z.object({})";

    const entries = keys.map((key) => {
      const val = (obj as Record<string, unknown>)[key];
      const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      return `${childIndent}${validKey}: ${generateZodSchema(val, indentLevel + 1)}`;
    });

    return `z.object({\n${entries.join(",\n")}\n${indent}})`;
  }

  return "z.any()";
}

export function JsonToZodTool() {
  const [inputJson, setInputJson] = useState(SAMPLE_JSON);
  const [schemaName, setSchemaName] = useState("userSchema");
  const [copied, setCopied] = useState(false);
  const inputId = useId();
  const nameId = useId();

  const { zodCode, error } = useMemo(() => {
    if (!inputJson.trim()) return { zodCode: "", error: "" };
    try {
      const parsed = JSON.parse(inputJson);
      const schemaBody = generateZodSchema(parsed);
      const pascalName = schemaName
        ? schemaName.charAt(0).toUpperCase() + schemaName.slice(1)
        : "Output";
      const typeName = pascalName.endsWith("Schema")
        ? pascalName.replace(/Schema$/, "")
        : `${pascalName}Type`;

      const code = `import { z } from "zod";\n\nexport const ${schemaName || "outputSchema"} = ${schemaBody};\n\nexport type ${typeName} = z.infer<typeof ${schemaName || "outputSchema"}>;`;
      return { zodCode: code, error: "" };
    } catch (e) {
      return { zodCode: "", error: (e as Error).message || "Invalid JSON syntax" };
    }
  }, [inputJson, schemaName]);

  const handleCopy = () => {
    if (!zodCode) return;
    navigator.clipboard.writeText(zodCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Braces className="h-5 w-5 text-accent" /> JSON to Zod Schema Generator
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Instantly convert raw API JSON responses into strongly-typed Zod validation schemas & TypeScript types.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor={nameId} className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
            Schema Name:
            <input
              id={nameId}
              type="text"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value.replace(/[^a-zA-Z0-9_$]/g, ""))}
              placeholder="userSchema"
              className="rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* Left Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Input Raw JSON
            </label>
            <button
              onClick={() => setInputJson("")}
              className="text-[11px] font-mono text-muted-foreground hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <textarea
            id={inputId}
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Paste raw JSON here..."
            spellCheck={false}
            className="h-80 w-full rounded-xl border border-border/70 bg-background p-3.5 font-mono text-xs leading-relaxed outline-none focus:border-accent"
          />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Output */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Generated Zod Schema & TypeScript Type
            </span>

            <button
              onClick={handleCopy}
              disabled={!zodCode}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-1 font-mono text-xs font-medium text-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-border/70 bg-background/50 p-4 font-mono text-xs overflow-auto min-h-[320px]">
            {zodCode ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-foreground/90">{zodCode}</pre>
            ) : (
              <span className="text-muted-foreground">// Valid JSON will generate Zod schema here...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
