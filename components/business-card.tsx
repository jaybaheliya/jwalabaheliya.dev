"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, RotateCw } from "lucide-react";

const VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Jwala Baheliya
N:Baheliya;Jwala;;;
TITLE:Senior Frontend Developer
ORG:Bombay Design Centre
EMAIL:jaybaheliya@gmail.com
TEL:+91 90296 52067
URL:https://jwalabaheliya-dev.vercel.app/
ADR:;;Mumbai;;;India
END:VCARD`;

export function BusinessCard() {
  const [flipped, setFlipped] = useState(false);

  function download() {
    const blob = new Blob([VCARD], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Jwala-Baheliya.vcf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-md md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Digital Business Card</div>
          <div className="font-display text-2xl font-bold leading-tight">Save my contact in one tap</div>
        </div>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition"
          aria-label="Flip card"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>

      <div style={{ perspective: "1200px" }} className="mx-auto flex w-full max-w-sm flex-1 items-center">
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full aspect-[1.75/1] cursor-pointer transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, hsl(var(--foreground)), color-mix(in oklab, hsl(var(--foreground)) 70%, hsl(var(--accent))))",
              color: "hsl(var(--background))",
              boxShadow: "0 20px 60px -20px color-mix(in oklab, hsl(var(--accent)) 60%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-2xl font-bold tracking-tight">JB</div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">v-card · 2026</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold leading-tight">Jwala Baheliya</div>
              <div className="text-xs font-mono opacity-80 mt-1">Senior Frontend Developer · Mumbai</div>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex items-center justify-between gap-4 bg-background border border-border"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Scan to save</div>
              <div className="text-sm mt-1 truncate">jaybaheliya@gmail.com</div>
              <div className="text-sm truncate">+91 90296 52067</div>
              <div className="text-xs text-muted-foreground truncate mt-1">jwalabaheliya-dev.vercel.app</div>
            </div>
            <div className="bg-white p-2 rounded-lg shrink-0">
              <QRCodeSVG value={VCARD} size={88} level="M" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={download}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-accent-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition"
      >
        <Download className="h-4 w-4" /> Download .vcf
      </button>
    </div>
  );
}
