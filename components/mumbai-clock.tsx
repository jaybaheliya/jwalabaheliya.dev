"use client";
import { useEffect, useState } from "react";

/** Live Mumbai (IST) clock — tiny recruiter-friendly "I'm awake" widget. */
export function MumbaiClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const time = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(now),
  );
  const awake = hour >= 9 && hour < 23;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
      <span className={`h-1.5 w-1.5 rounded-full ${awake ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
      Mumbai · {time} IST
    </span>
  );
}