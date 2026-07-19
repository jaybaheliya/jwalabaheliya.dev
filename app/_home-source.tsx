"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Sparkles, CircleDot, Clock, MapPin, Code2 } from "lucide-react";
const portrait = { src: "/jwala-baheliya.jpg", width: 800, height: 800 };
import { CursorGlow } from "@/components/cursor-glow";
import { Magnetic } from "@/components/magnetic";
import { TextScramble } from "@/components/text-scramble";
import { BuiltWith } from "@/components/built-with";
import { Currently } from "@/components/currently";
import { GithubStats } from "@/components/github-stats";
import { CursorTrail } from "@/components/cursor-trail";
import { MumbaiClock } from "@/components/mumbai-clock";
import { ViewCounter } from "@/components/view-counter";
import { Playground } from "@/components/playground";
import { BusinessCard } from "@/components/business-card";

const slugForTitle = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const HERO_COPY = {
  en: {
    badge: "Available for senior frontend roles · Remote / Mumbai",
    h1a: "Senior frontend developer",
    h1b: "crafting",
    h1accent: "clean, responsive",
    h1c: "web experiences.",
    body: "8+ years turning Figma and Adobe XD designs into production-ready websites — for Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji and more, currently at Bombay Design Centre.",
    cta1: "View projects",
    cta2: "Resume",
    cta3: "Contact me",
  },
  hi: {
    badge: "सीनियर फ्रंटएंड रोल्स के लिए उपलब्ध · रिमोट / मुंबई",
    h1a: "सीनियर फ्रंटएंड डेवलपर",
    h1b: "बनाता हूँ",
    h1accent: "क्लीन, रेस्पॉन्सिव",
    h1c: "वेब अनुभव।",
    body: "8+ वर्षों का अनुभव — Figma और Adobe XD डिज़ाइन को प्रोडक्शन-रेडी वेबसाइट्स में बदलना। Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji जैसे ब्रांड्स के लिए। वर्तमान में Bombay Design Centre में।",
    cta1: "प्रोजेक्ट्स देखें",
    cta2: "रिज्यूमे",
    cta3: "संपर्क करें",
  },
} as const;
// (removed ReactSkillGlobe — replaced with the lighter CSS SkillOrbit below)




/* ---------------- Data ---------------- */

const BRANDS = [
  "Rustomjee",
  "Godrej",
  "Kotak",
  "Tata",
  "Shapoorji Pallonji",
  "VIP Bags",
  "RMZ",
  "Yes Bank",
  "AU Bank",
  "Kokuyo Camlin",
];

const METRICS = [
  { k: "8+", v: "Years as a frontend developer" },
  { k: "20+", v: "Websites shipped for global brands" },
  { k: "3", v: "Companies — Bombay Design Centre, HRMantra, Technofra" },
  { k: "1", v: "Kyoorius Design Award, 2023" },
];

const PROJECTS = [
  {
    tag: "Real Estate · Flagship",
    title: "Rustomjee",
    problem:
      "Corporate site for one of Mumbai's leading luxury real-estate developers — needed to translate high-end brand design into a fast, responsive marketing site.",
    solution:
      "Built responsive pages from Figma / Adobe XD, focused on gallery performance, SEO fundamentals and cross-browser polish.",
    stack: ["HTML5", "SCSS", "JavaScript", "React", "Next.js"],
    links: { live: "https://www.rustomjee.com/", code: "" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2022 — Present",
    outcomes: [
      "Pixel-accurate build of 40+ project micro-sites and campaign pages",
      "Lighthouse performance lifted into the 90s on marketing pages",
      "Reusable gallery + enquiry components adopted across the brand",
    ],
  },
  {
    tag: "BFSI",
    title: "Kotak Investment Banking",
    problem:
      "Institutional-grade site for Kotak's investment banking arm — content-heavy pages, strict brand guidelines and HTML email campaigns to support.",
    solution:
      "Developed the frontend and shipped responsive HTML mailers used across Kotak's campaigns.",
    stack: ["HTML5", "SCSS", "JavaScript", "HTML Emailers"],
    links: { live: "https://investmentbank.kotak.com", code: "" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2022 — 2024",
    outcomes: [
      "Shipped the responsive marketing site under strict BFSI brand rules",
      "Built 20+ HTML email templates rendering across Outlook / Gmail / Apple Mail",
      "Zero regressions reported across quarterly compliance reviews",
    ],
  },
  {
    tag: "Conglomerate",
    title: "Godrej",
    problem:
      "Corporate presence for one of India's largest conglomerates — multiple product lines and audiences under a single umbrella brand.",
    solution:
      "Contributed to frontend development and responsive UI across brand pages, translating designs into clean, accessible markup.",
    stack: ["HTML5", "SCSS", "JavaScript", "jQuery"],
    links: { live: "https://www.godrej.com", code: "" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2021 — 2023",
    outcomes: [
      "Delivered accessible, semantic markup across group-level brand pages",
      "Improved mobile experience with fluid layouts and lazy media loading",
      "Maintained a shared component pattern reused by other Godrej teams",
    ],
  },
  {
    tag: "Real Estate",
    title: "Shapoorji Pallonji Real Estate",
    problem:
      "Marketing site for SP Real Estate and the Joyville Homes brand — needed rich project galleries and lead-capture flows.",
    solution:
      "Built responsive pages from design mockups, implemented enquiry forms and ensured cross-browser compatibility.",
    stack: ["HTML5", "SCSS", "JavaScript", "React"],
    links: { live: "https://www.shapoorjirealestate.com", code: "https://www.joyvillehomes.com" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2022",
    outcomes: [
      "Enquiry conversion improved with clearer CTA hierarchy on PDPs",
      "Cross-browser QA cleared for legacy Edge / Safari corporate estates",
      "Reused the pattern to ship the Joyville Homes sibling site",
    ],
  },
  {
    tag: "Retail · Shopify",
    title: "VIP Bags (in progress)",
    problem:
      "E-commerce experience for VIP Bags on Shopify — theme customisation and Liquid templating.",
    solution:
      "Working on the Shopify Liquid theme, responsive layouts and PDP polish.",
    stack: ["Shopify", "Liquid", "SCSS", "JavaScript"],
    links: { live: "https://vipbags.com/", code: "" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2025 — Present",
    outcomes: [
      "Rebuilding PDP + collection templates for a faster mobile checkout",
      "Cleaning up Liquid sections into reusable, merchandiser-friendly blocks",
      "Standardising design tokens across the theme for consistent branding",
    ],
  },
  {
    tag: "FMCG · International",
    title: "Mezete & Kasih Food",
    problem:
      "Brand websites for international FMCG clients (Mezete and Kasih Food, Jordan) with rich product storytelling.",
    solution:
      "Developed responsive marketing sites, product listings and content pages from Figma / XD.",
    stack: ["HTML5", "SCSS", "JavaScript", "jQuery"],
    links: { live: "https://www.mezete.com/", code: "https://www.kasihfood.com" },
    role: "Frontend Developer · Bombay Design Centre",
    year: "2023",
    outcomes: [
      "Delivered two full brand sites for an international FMCG client",
      "Rich product storytelling with lightweight animations and clean IA",
      "Multi-locale ready markup with cross-browser QA on legacy devices",
    ],
  },
];

const EXPERIENCE = [
  {
    role: "Web Developer",
    org: "Bombay Design Centre",
    period: "Apr 2021 — Present",
    points: [
      "Translate Figma and Adobe XD designs into seamless, responsive websites for brands like Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, RMZ and more.",
      "Build with HTML, CSS, SCSS, JavaScript, PHP and React with Next.js — following clean-code and BEM practices.",
      "Collaborate with designers, backend developers and stakeholders to ship fully functional websites with cross-browser compatibility.",
      "Optimise performance, run testing and debugging cycles, and keep pace with the latest frontend trends.",
      "Developed HTML email marketing campaigns for Kotak and prepared status reports for onsite coordinators.",
    ],
  },
  {
    role: "UI Developer",
    org: "HRMantra — The Ultimate HR Software Solution",
    period: "May 2019 — Apr 2021",
    points: [
      "Focused on UI development and web design for HRMantra's HR & payroll platform.",
      "Developed and maintained dynamic websites and web applications.",
      "Worked across HTML, CSS, JavaScript and other core web technologies.",
    ],
  },
  {
    role: "Frontend Developer",
    org: "Technofra Pvt Ltd",
    period: "Jul 2016 — May 2019",
    points: [
      "Designed and implemented visually compelling user interfaces for a diverse client portfolio.",
      "Built and maintained dynamic websites and web applications using HTML, CSS, JavaScript and ASP.NET.",
    ],
  },
];

const SKILLS: Record<string, string[]> = {
  "Frontend Technologies": [
    "HTML5",
    "CSS3",
    "Sass / SCSS",
    "JavaScript (ES6+)",
    "TypeScript (Basic)",
    "React.js",
    "Next.js",
    "Tailwind CSS",
    "Bootstrap",
    "Responsive Design",
    "BEM",
    "REST APIs",
    "JSON",
    "AJAX",
  ],
  "Frontend Concepts": [
    "Component-based architecture",
    "API integration",
    "Cross-browser compatibility",
    "Accessibility (WCAG)",
    "Performance optimization",
    "Reusable UI components",
    "Debugging & testing",
  ],
  "Tools & Platforms": ["Git", "GitHub", "Vite", "Figma", "Adobe XD", "Photoshop", "Illustrator"],
  "Libraries & Frameworks": ["React.js", "Next.js", "Tailwind CSS", "jQuery"],
  "AI & Productivity": ["ChatGPT", "GitHub Copilot", "Claude AI"],
  Additional: ["PHP", "ASP.NET (Basic)", "UI/UX collaboration", "Agile", "Clean code"],
};

const ACHIEVEMENTS = [
  { k: "Award", v: "Kyoorius Design Award 2023 — recognised for outstanding contributions in web design." },
  { k: "Education", v: "B.Sc. Information Technology · Mumbai University, 2013 (First Division)" },
  { k: "Languages", v: "English · Hindi · Marathi" },
  { k: "Interests", v: "Music · PC games · Exploring UI/UX trends across the web" },
];

const MORE_PROJECTS = [
  { name: "Viceroy Properties", url: "https://www.viceroyproperties.in/" },
  { name: "Bharat Connect", url: "https://www.bharat-connect.com" },
  { name: "Tata Chemicals", url: "https://www.tatachemicals.com" },
  { name: "RMZ", url: "https://www.rmz.com" },
  { name: "Kokuyo Camlin", url: "https://www.kokuyocamlin.com" },
  { name: "Delhi Redz", url: "https://www.delhiredz.com" },
  { name: "Joyville Homes", url: "https://www.joyvillehomes.com" },
  { name: "Yes Bank (Components)", url: "https://www.yesbank.in" },
  { name: "AU Bank (Components)", url: "#" },
  { name: "Asign Art", url: "https://www.asign.art" },
  { name: "Employee Vibes", url: "https://www.employeevibes.com" },
  { name: "Bits Design School", url: "https://www.bitsdesign.edu.in" },
];

/* ---------------- Small pieces ---------------- */

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
      <span className="text-accent">{n}</span>
      <span className="h-px w-8 bg-border" />
      <span>{children}</span>
    </div>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={
        className +
        " transition-all duration-700 ease-out " +
        (seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
      }
    >
      {children}
    </div>
  );
}

/* ---------------- Page ---------------- */

function BusinessCardShowcase() {
  return (
    <section id="hire" className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24">
      <div className="mb-8 hidden">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">/06 · For recruiters</div>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Everything you need in one place</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Check budget fit, score your JD against my resume, book a 15-min chat, or save my contact — all without email tag.
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
        <BusinessCard />
      </div>
    </section>
  );
}

function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustBar />
      <Metrics />
      <Currently />
      <Projects />
      <BusinessCardShowcase />
      <Playground />
      <Experience />
      <Skills />
      <Achievements />
      <About />
      <MoreProjects />
      <Testimonials />
      <BuiltWith />
      <Contact />
      <Footer />
      <SectionRail />
      <ScrollProgress />
      <CursorGlow />
      <CursorTrail />
    </main>
  );
}

/* ---------------- Nav ---------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/60"
          : "bg-transparent")
      }
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <img
            src="/favicon.png"
            alt="JB monogram"
            width={28}
            height={28}
            className="h-7 w-7 rounded-md bg-foreground/5 p-0.5 dark:invert"
          />
          <span>Jwala<span className="text-accent">.</span></span>
        </a>
        <nav className="hidden gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground md:flex">
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(s.id);
              }}
              className="hover:text-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
          <Link href="/notes" className="hover:text-foreground transition-colors">Notes</Link>
          <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
          <Link href="/toolkit" className="hover:text-accent transition-colors">Toolkit</Link>
        </nav>
        <div className="flex items-center gap-2">
          <MumbaiClock />
          <a
            href="mailto:jaybaheliya@gmail.com"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.02]"
          >
            Hire me
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const t = HERO_COPY.en;
  return (
    <section id="top" className="relative overflow-x-clip pt-32 pb-16 sm:pt-40 sm:pb-24 md:pt-52 md:pb-32">
      {/* aurora */}
      <div
        aria-hidden
        className="blob absolute -top-40 -left-24 h-[520px] w-[520px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
      />
      <div
        aria-hidden
        className="blob absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)", animationDelay: "-6s" }}
      />

      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-6 md:px-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="min-w-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t.badge}
          </div>
          <div className="mb-6 ml-1"><ViewCounter storageKey="home" label="recruiters viewed this week" /></div>

          <h1 className="font-display text-[13vw] font-bold leading-[0.95] tracking-tight break-words sm:text-[8vw] md:text-[6.5vw] lg:text-[5.5vw]">
            <TextScramble as="span" text={t.h1a} />
            <br />
            {t.h1b} <span className="text-accent">{t.h1accent}</span> {t.h1c}
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {t.body}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href="#work"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
              >
                {t.cta1} <span aria-hidden>→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="/resume"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium backdrop-blur-md transition-colors hover:bg-card"
              >
                <span aria-hidden>↓</span> {t.cta2}
              </a>
            </Magnetic>
            <a
              href="#contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.cta3}
            </a>
          </div>
        </div>

        {/* Dev status card */}
        <Reveal className="w-full max-w-full justify-self-center lg:justify-self-end">
          <HeroTerminal />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Trust bar ---------------- */

function HeroTerminal() {
  return (
    <div className="orbit-wrap relative mx-auto h-[22rem] w-[22rem] max-w-full sm:h-[28rem] sm:w-[28rem] md:h-[34rem] md:w-[34rem]">
      <DottedSphere />
      <SkillOrbit />
      <div className="absolute inset-0 flex items-center justify-center">
        <DevStatusCard />
      </div>
    </div>
  );
}

/* Lightweight animated dotted wireframe sphere — pure SVG, no WebGL */
function DottedSphere() {
  const rings = 9;
  const dotsPerRing = 28;
  const radius = 210;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:1200px]" aria-hidden>
      <div className="relative h-[420px] w-[420px] [transform-style:preserve-3d] animate-[spin_38s_linear_infinite]">
        {Array.from({ length: rings }).map((_, r) => {
          const lat = (r / (rings - 1)) * Math.PI - Math.PI / 2;
          const rr = Math.cos(lat) * radius;
          const y = Math.sin(lat) * radius;
          return (
            <div
              key={r}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate3d(-50%, -50%, 0) translateY(${y.toFixed(2)}px) rotateX(90deg)` }}
            >
              {Array.from({ length: dotsPerRing }).map((_, i) => {
                const a = (i / dotsPerRing) * Math.PI * 2;
                const x = Math.cos(a) * rr;
                const z = Math.sin(a) * rr;
                return (
                  <span
                    key={i}
                    className="absolute block h-[3px] w-[3px] rounded-full bg-accent/70"
                    style={{ transform: `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px)` }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ORBIT_SKILLS: { label: string; ring: 0 | 1 | 2 }[] = [
  { label: "React",      ring: 0 },
  { label: "Next.js",    ring: 0 },
  { label: "TypeScript", ring: 0 },
  { label: "Tailwind",   ring: 1 },
  { label: "GSAP",       ring: 1 },
  { label: "Framer",     ring: 1 },
  { label: "SCSS",       ring: 1 },
  { label: "Figma",      ring: 2 },
  { label: "Node.js",    ring: 2 },
  { label: "HTML5",      ring: 2 },
  { label: "a11y",       ring: 2 },
  { label: "SEO",        ring: 2 },
];

function SkillOrbit() {
  const rings = [
    { r: 170, cls: "orbit-rotate",      items: ORBIT_SKILLS.filter((s) => s.ring === 0) },
    { r: 225, cls: "orbit-rotate-rev",  items: ORBIT_SKILLS.filter((s) => s.ring === 1) },
    { r: 285, cls: "orbit-rotate-fast", items: ORBIT_SKILLS.filter((s) => s.ring === 2) },
  ];
  return (
    <div aria-hidden={false} className="pointer-events-none absolute inset-0">
      {rings.map((ring, ri) => (
        <div key={ri} className={`pointer-events-none absolute inset-0 ${ring.cls}`}>
          <div
            className="orbit-ring"
            style={{ width: ring.r * 2, height: ring.r * 2, top: `calc(50% - ${ring.r}px)`, left: `calc(50% - ${ring.r}px)`, margin: 0 }}
          />
          {ring.items.map((s, i) => {
            const angle = (360 / ring.items.length) * i;
            return (
              <button
                key={s.label}
                type="button"
                tabIndex={0}
                aria-label={s.label}
                className="orbit-node pointer-events-auto outline-none"
                style={{ transform: `rotate(${angle}deg) translate(${ring.r}px)` }}
              >
                <span className="orbit-counter block">
                  <span className="orbit-chip absolute rounded-full border border-border/70 bg-card/80 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground/80 backdrop-blur-md">
                    {s.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* Terminal card with live typing, cursor, scanlines & key stats */

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string; tone?: "muted" | "accent" };

const TERMINAL_LINES: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "jwala baheliya — senior frontend developer" },
  { kind: "cmd", text: "cat stats.json" },
  { kind: "out", text: `{
  "years":      8,
  "specialty":  ["React", "Next.js", "TS"],
  "shipped":    "20+ brand sites",
  "available":  true
}`, tone: "muted" },
  { kind: "cmd", text: "echo $STATUS" },
  { kind: "out", text: "open to senior frontend roles · remote / Mumbai", tone: "accent" },
];

function DevStatusCard() {
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setLi(TERMINAL_LINES.length); setCi(0); return; }
    if (li >= TERMINAL_LINES.length) return;
    const line = TERMINAL_LINES[li];
    if (ci < line.text.length) {
      const speed = line.kind === "cmd" ? 42 : 10;
      const jitter = Math.random() * 20;
      const t = window.setTimeout(() => setCi((c) => c + 1), speed + jitter);
      return () => window.clearTimeout(t);
    }
    const pause = line.kind === "cmd" ? 260 : 380;
    const t = window.setTimeout(() => { setLi((n) => n + 1); setCi(0); }, pause);
    return () => window.clearTimeout(t);
  }, [li, ci]);

  const done = li >= TERMINAL_LINES.length;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />
      <div className="relative w-[20rem] overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/85 shadow-2xl backdrop-blur-xl md:w-[24rem]">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-background/40 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            ~/jwala — zsh
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-accent">
            <CircleDot className="h-3 w-3" /> live
          </div>
        </div>

        {/* Body with scanlines */}
        <div className="relative">
          <pre className="relative z-10 min-h-[15rem] whitespace-pre-wrap px-5 py-4 font-mono text-[12.5px] leading-relaxed text-foreground/90">
            {TERMINAL_LINES.slice(0, li).map((l, i) => (
              <TermLine key={i} line={l} shown={l.text.length} />
            ))}
            {!done && (
              <TermLine line={TERMINAL_LINES[li]} shown={ci} caret />
            )}
            {done && (
              <span
                className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
                style={{ animation: "blink 1s steps(2) infinite" }}
              />
            )}
          </pre>
          <div aria-hidden className="scanlines pointer-events-none absolute inset-0 z-20" />
          <div aria-hidden className="scan-sweep pointer-events-none absolute inset-x-0 top-0 z-20 h-24" />
        </div>

        {/* Key stats with icons */}
        <div className="grid grid-cols-3 border-t border-border/60 bg-background/40 text-foreground">
          <StatCell icon={<Briefcase className="h-3.5 w-3.5" />} value="8+" label="years" />
          <StatCell icon={<Sparkles  className="h-3.5 w-3.5" />} value="React · Next" label="specialty" divider />
          <StatCell icon={<Clock     className="h-3.5 w-3.5" />} value="Now" label="available" />
        </div>

        {/* Meta strip */}
        <div className="flex items-center justify-between border-t border-border/60 bg-background/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Mumbai · Remote</span>
          <span className="inline-flex items-center gap-1"><Code2 className="h-3 w-3 text-accent" /> v8.0</span>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  icon, value, label, divider,
}: { icon: React.ReactNode; value: string; label: string; divider?: boolean }) {
  return (
    <div className={`px-3 py-3 ${divider ? "border-x border-border/60" : ""}`}>
      <div className="flex items-center gap-1.5 text-accent">
        {icon}
        <span className="font-mono text-[13px] font-semibold leading-none">{value}</span>
      </div>
      <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function TermLine({ line, shown, caret }: { line: Line; shown: number; caret?: boolean }) {
  const text = line.text.slice(0, shown);
  if (line.kind === "cmd") {
    return (
      <div>
        <span className="text-accent">$</span>{" "}
        <span>{text}</span>
        {caret && (
          <span
            className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
            style={{ animation: "blink 1s steps(2) infinite" }}
          />
        )}
      </div>
    );
  }
  const cls =
    line.tone === "accent" ? "text-accent" :
    line.tone === "muted"  ? "text-foreground/70" :
    "text-foreground/85";
  return (
    <div className={cls}>
      {text}
      {caret && (
        <span
          className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-accent align-middle"
          style={{ animation: "blink 1s steps(2) infinite" }}
        />
      )}
    </div>
  );
}

function TrustBar() {
  const row = useMemo(() => [...BRANDS, ...BRANDS], []);
  return (
    <section aria-label="Trusted by" className="border-y border-border/60 bg-card/30 py-8">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Shipped for
        </div>
        <div className="overflow-hidden">
          <div className="marquee">
            {row.map((b, i) => (
              <span
                key={i}
                className="font-display text-2xl font-semibold tracking-tight text-muted-foreground/70 md:text-3xl"
              >
                {b}
                <span className="mx-6 text-accent">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Metrics ---------------- */

function Metrics() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="01">By the numbers</SectionLabel>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Reveal key={m.v}>
              <div className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent/60">
                <div className="font-display text-5xl font-bold tracking-tight text-accent md:text-6xl">
                  {m.k}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.v}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Projects ---------------- */

function Projects() {
  const [active, setActive] = useState<(typeof PROJECTS)[number] | null>(null);
  return (
    <section id="work" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="02">Featured work · Case studies</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Projects that moved a real metric.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A selection of the launches I've owned end-to-end. Click any card for the full case
          study — screenshot, stack and measurable outcomes.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {PROJECTS.map((p) => (
            <Reveal key={p.title} className="flex flex-col">
              <button
                type="button"
                onClick={() => setActive(p)}
                className="group flex h-full w-full flex-col rounded-3xl border border-border/60 bg-card/40 p-7 text-left backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent/60 focus-visible:-translate-y-1 focus-visible:border-accent focus-visible:outline-none md:p-8"
                aria-label={`Open case study: ${p.title}`}
              >
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  {p.tag}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                    {p.title}
                  </h3>
                  <span
                    aria-hidden
                    className="mt-2 shrink-0 rounded-full border border-border/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent"
                  >
                    Case study →
                  </span>
                </div>

                <dl className="mt-6 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Problem</dt>
                    <dd className="mt-1 text-foreground/90">{p.problem}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Solution</dt>
                    <dd className="mt-1 text-foreground/90">{p.solution}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>{p.year}</span>
                  <span className="text-accent">Quick view →</span>
                </div>
              </button>
              <Link
                href="/work/$slug"
               
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/40 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Read full case study →
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}

/* ---------------- Project Case-Study Modal ---------------- */

function screenshotFor(url: string) {
  if (!url) return "";
  return `https://image.thum.io/get/width/1400/crop/900/noanimate/${url}`;
}

function ProjectModal({
  project,
  onClose,
}: {
  project: (typeof PROJECTS)[number] | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (!project) return;
    setImgOk(true);
    const previousActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      previousActive?.focus?.();
    };
  }, [project, onClose]);

  if (!project) return null;

  const shot = screenshotFor(project.links.live);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-background/80 p-3 backdrop-blur-md sm:items-center sm:p-6 animate-fade-in"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="relative w-full max-w-4xl rounded-3xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl animate-scale-in"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-background/80 text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <span aria-hidden className="text-lg leading-none">×</span>
        </button>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl border-b border-border/70 bg-gradient-to-br from-accent/20 via-background to-background">
          {shot && imgOk ? (
            <img
              src={shot}
              alt={`${project.title} — live site screenshot`}
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-5xl font-bold tracking-tight text-accent/80 md:text-7xl">
                {project.title}
              </span>
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/60 to-transparent"
          />
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              {project.tag}
            </div>
            <h3
              id="case-study-title"
              className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl"
            >
              {project.title}
            </h3>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {project.role} · {project.year}
            </div>

            <div className="mt-6 space-y-5 text-[15px] leading-relaxed">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  The problem
                </div>
                <p className="mt-1 text-foreground/90">{project.problem}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  My approach
                </div>
                <p className="mt-1 text-foreground/90">{project.solution}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Outcomes
                </div>
                <ul className="mt-2 space-y-2 text-foreground/90">
                  {project.outcomes?.map((o) => (
                    <li key={o} className="flex items-start gap-2">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-2xl border border-border/60 bg-background/40 p-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tech stack
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border/70 bg-card/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground/90"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2 border-t border-border/60 pt-5 font-mono text-[11px] uppercase tracking-widest">
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <span>Visit live site</span>
                  <span aria-hidden>↗</span>
                </a>
              )}
              {project.links.code && (
                <a
                  href={project.links.code}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                >
                  <span>Related site</span>
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Experience ---------------- */

function Experience() {
  return (
    <section id="experience" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="03">Experience</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Eight years of shipping — with the numbers to back it.
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <div className="hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground lg:block">
            Timeline
          </div>

          <ol className="relative space-y-10 border-l border-border/60 pl-6 md:pl-8">
            {EXPERIENCE.map((e) => (
              <li key={e.role} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[33px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-background md:-left-[37px]"
                />
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                    {e.role}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {e.period}
                  </span>
                </div>
                <div className="mt-1 text-sm text-accent">{e.org}</div>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-foreground/90">
                  {e.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Skills ---------------- */

function Skills() {
  return (
    <section id="skills" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="04">Toolkit</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          The stack I reach for.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Deepest on the frontend, comfortable end-to-end. I pick tools for the problem, not the
          resume.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SKILLS).map(([cat, items]) => (
            <Reveal key={cat}>
              <div className="h-full rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent/60">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  {cat}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs text-foreground/90"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <GithubStats />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Achievements ---------------- */

function Achievements() {
  return (
    <section className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="05">Recognition & signals</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Beyond the day job.
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => (
            <Reveal key={a.v}>
              <div className="h-full rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-md transition-colors hover:border-accent/60">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  {a.k}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-foreground/90">{a.v}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */

function About() {
  return (
    <section id="about" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:px-10 lg:grid-cols-[auto_1fr_1.4fr] lg:items-start">
        <Portrait />
        <div>
          <SectionLabel n="06">About</SectionLabel>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            I build interfaces that <span className="text-accent">earn their weight</span>.
          </h2>
        </div>
        <div className="space-y-6 text-[17px] leading-relaxed text-foreground/90">
          <p>
            Highly skilled and meticulous frontend developer with 8 years of experience creating
            innovative, user-friendly websites. Proficient in HTML, CSS, JavaScript and responsive
            design, with strong problem-solving abilities and a keen eye for detail.
          </p>
          <p>
            Day-to-day, I translate Figma and Adobe XD designs into seamless, responsive websites —
            working across HTML, SCSS, JavaScript, PHP and React with Next.js. I care about clean
            markup, cross-browser compatibility, accessibility and performance.
          </p>
          <p>
            Collaborative team player with excellent communication skills. Dedicated to delivering
            exceptional results through clean and efficient code — currently based in Mumbai, open
            to remote roles.
          </p>
        </div>
      </div>
    </section>
  );
}

function Portrait() {
  return (
    <div className="group relative mx-auto w-full max-w-[260px] lg:mx-0">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent/40 via-accent/10 to-transparent opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-2xl backdrop-blur-md">
        <img
          src={portrait.src}
          alt="Portrait of Jwala Baheliya"
          width={520}
          height={520}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent"
        />
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/80">
          <span>Jwala Baheliya</span>
          <span className="text-accent">● live</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- More projects ---------------- */

function MoreProjects() {
  return (
    <section className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="07">More work</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          A wider slice of what I've shipped.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Additional client sites built end-to-end — from real estate and BFSI to FMCG, retail and
          education.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MORE_PROJECTS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer noopener"
              className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent/60"
            >
              <span className="font-display text-base font-semibold tracking-tight">{p.name}</span>
              <span aria-hidden className="text-accent transition-transform group-hover:translate-x-1">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */

/* ---------------- Testimonials ---------------- */

const TESTIMONIALS = [
  {
    q: "Pixel-perfect execution and one of the fastest hands on the team — turns Figma into production HTML/CSS without drama.",
    a: "Design Lead, Bombay Design Centre",
  },
  {
    q: "Owned the frontend for a dozen brand microsites end to end. Reliable, communicative, and cares about performance.",
    a: "Project Manager, Real Estate portfolio",
  },
  {
    q: "Understands responsive design deeply. Cross-browser bugs disappear when Jwala is on the ticket.",
    a: "Senior Engineer, HRMantra",
  },
  {
    q: "A rare frontend dev who reads design intent as well as specs. Interactions feel intentional, not bolted on.",
    a: "Creative Director, Client agency",
  },
];

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <section id="kind-words" className="relative border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Kind <span className="text-accent">words</span>.
          </h2>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {String(i + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-md md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
          />
          <div className="font-display text-6xl leading-none text-accent">“</div>
          <blockquote
            key={i}
            className="mt-4 max-w-4xl animate-fade-in font-display text-2xl leading-snug md:text-4xl"
          >
            {t.q}
          </blockquote>
          <figcaption className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            — {t.a}
          </figcaption>
          <div className="mt-10 flex gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Show testimonial ${idx + 1}`}
                onClick={() => setI(idx)}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (idx === i ? "w-10 bg-accent" : "w-4 bg-border hover:bg-muted-foreground/50")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry — ${state.name}`);
    const body = encodeURIComponent(`${state.message}\n\n— ${state.name} (${state.email})`);
    window.location.href = `mailto:jaybaheliya@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="border-t border-border/60 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionLabel n="09">Contact</SectionLabel>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Let's ship something worth shipping.
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Open to senior frontend roles, contract engagements, and design-system leadership. I
          reply within a day.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="space-y-2 font-mono text-sm">
            <ContactRow k="Email" v="jaybaheliya@gmail.com" href="mailto:jaybaheliya@gmail.com" />
            <ContactRow k="Phone" v="+91 90296 52067" href="tel:+919029652067" />
            <ContactRow k="LinkedIn" v="jwala-baheliya" href="https://www.linkedin.com/in/jwala-baheliya-a82a5411b" />
            <ContactRow k="Portfolio" v="jwalabaheliya-webdev.vercel.app" href="https://jwalabaheliya-webdev.vercel.app/" />
            <ContactRow k="Location" v="Mumbai, India · Remote" />
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-md md:p-8"
          >
            <Field label="Your name">
              <input
                required
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent"
              />
            </Field>
            <Field label="What can I help with?">
              <textarea
                required
                rows={4}
                value={state.message}
                onChange={(e) => setState({ ...state, message: e.target.value })}
                className="w-full resize-none rounded-lg border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent"
              />
            </Field>
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.01]"
            >
              Send message →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({ k, v, href }: { k: string; v: string; href?: string }) {
  const content = (
    <div className="flex items-center justify-between border-b border-border/60 py-3">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener" className="block hover:text-accent transition-colors">
      {content}
    </a>
  ) : (
    content
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 md:px-10">
        <div className="font-display text-lg font-bold tracking-tight">
          Jwala Baheliya<span className="text-accent">.</span>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} · Built with care in Mumbai
        </div>
        <div className="flex gap-4 font-mono text-[11px] uppercase tracking-widest">
          <a href="mailto:jaybaheliya@gmail.com" className="hover:text-accent transition-colors">Email</a>
          <a href="https://www.linkedin.com/in/jwala-baheliya-a82a5411b" target="_blank" rel="noreferrer noopener" className="hover:text-accent transition-colors">LinkedIn</a>
          <a href="https://jwalabaheliya-webdev.vercel.app/" target="_blank" rel="noreferrer noopener" className="hover:text-accent transition-colors">Portfolio</a>
          <Link href="/tools" className="hover:text-accent transition-colors">Tools</Link>
          <Link href="/toolkit" className="hover:text-accent transition-colors">Toolkit</Link>
          <Link href="/notes" className="hover:text-accent transition-colors">Notes</Link>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Smooth scroll + section rail ---------------- */

const NAV_SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const RAIL_SECTIONS = [
  { id: "top", label: "Intro" },
  ...NAV_SECTIONS,
];

function smoothScrollTo(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  // Lenis (if mounted) hijacks window.scroll; native smooth still triggers it.
  window.scrollTo({ top: y, behavior: "smooth" });
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[55] h-[3px] bg-accent origin-left transition-transform duration-100"
      style={{ width: "100%", transform: `scaleX(${p})` }}
    />
  );
}

function SectionRail() {
  const [active, setActive] = useState("top");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const els = RAIL_SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => !!n);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // pick the entry closest to the viewport top that's intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
    >
      {RAIL_SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => smoothScrollTo(s.id)}
            className="group relative flex items-center gap-3"
            aria-label={`Scroll to ${s.label}`}
          >
            <span
              className={
                "h-[2px] transition-all duration-300 " +
                (on ? "w-8 bg-accent" : "w-4 bg-border group-hover:w-6 group-hover:bg-foreground")
              }
            />
            <span
              className={
                "font-mono text-[10px] uppercase tracking-[0.25em] transition-all duration-300 " +
                (on
                  ? "opacity-100 text-foreground"
                  : "opacity-0 -translate-x-2 text-muted-foreground group-hover:opacity-100 group-hover:translate-x-0")
              }
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}



export default PortfolioPage;
