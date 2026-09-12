"use client";
import Link from "next/link";
import { useEffect } from "react";

function ResumePage() {
  useEffect(() => {
    document.documentElement.classList.add("resume-print");
    return () => document.documentElement.classList.remove("resume-print");
  }, []);

  return (
    <main className="mx-auto max-w-[840px] bg-white px-5 sm:px-7 py-5 text-neutral-900 print:max-w-none print:p-0">
      <div className="mb-4 flex items-start justify-between gap-6 border-b border-neutral-300 pb-4 print:hidden">
        <Link href="/" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900">
          {"<- Portfolio"}
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:bg-neutral-700"
        >
          Print / Save PDF
        </button>
      </div>

      <header className="mb-3.5">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-3xl font-bold tracking-tight">Jwala Baheliya</h1>
          <span className="font-mono text-lg text-neutral-400">&lt;/&gt;</span>
        </div>
        <p className="mt-0.5 text-[15px] font-medium text-neutral-800">Senior Frontend Developer · 8+ years</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-neutral-600">
          <span>Mumbai, India</span>
          <span className="text-neutral-300">•</span>
          <span>
            <span className="font-medium text-neutral-700">Phone: </span>
            <a className="underline underline-offset-2 hover:text-neutral-900" href="tel:+919029652067">(+91) 90296 52067</a>
          </span>
          <span className="text-neutral-300">•</span>
          <span>
            <span className="font-medium text-neutral-700">Email: </span>
            <a className="underline underline-offset-2 hover:text-neutral-900" href="mailto:jaybaheliya@gmail.com">jaybaheliya@gmail.com</a>
          </span>
          <span>
            <span className="font-medium text-neutral-700">LinkedIn: </span>
            <a className="underline underline-offset-2 hover:text-neutral-900" href="https://www.linkedin.com/in/jwala-baheliya-a82a5411b/">https://www.linkedin.com/in/jwala-baheliya-a82a5411b/</a>
          </span>
          <span className="text-neutral-300">•</span>
          <a className="underline underline-offset-2 hover:text-neutral-900" href="https://jwalabaheliya-dev.vercel.app/" target="_blank" rel="noreferrer">Portfolio</a>
          <span className="text-neutral-300">•</span>
          <a className="underline underline-offset-2 hover:text-neutral-900" href="https://github.com/jaybaheliya?tab=repositories" target="_blank" rel="noreferrer">Github</a>
        </p>
      </header>

      <Section title="Summary">
        <p className="text-[13px] leading-relaxed text-neutral-800">
          Senior frontend developer with 8+ years turning Figma / Adobe XD designs into production-ready
          websites for Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, RMZ and more. Strong on
          responsive design, performance, accessibility and clean component architecture.
        </p>
      </Section>

      <Section title="Technical Skills">
        <div className="space-y-1.5">
          <SkillRow label="Frontend & Frameworks" items="HTML5, CSS3, SCSS / Sass, JavaScript (ES6+), TypeScript, React.js, Next.js, Tailwind CSS, Bootstrap, jQuery, Shopify Liquid" />
          <SkillRow label="Motion & Animation" items="GSAP (ScrollTrigger), Lottie, SVG & CSS Animations, Micro-interactions" />
          <SkillRow label="Architecture & Web Vitals" items="Component Architecture, Responsive Web Design, Web Performance Optimization, Core Web Vitals, Web Accessibility (WCAG), RESTful APIs, Cross-Browser Compatibility, BEM Methodology" />
          <SkillRow label="Design & Prototyping" items="Figma, Adobe XD, Adobe Photoshop, Adobe Illustrator, Design Systems, Pixel-Perfect UI Implementation" />
          <SkillRow label="Developer Tools" items="Git, GitHub, Vite, Webpack, npm, Chrome DevTools, FileZilla, PuTTY" />
          <SkillRow label="AI-Assisted Engineering" items="GitHub Copilot, ChatGPT, Claude AI, Figma MCP Server (Design-to-Code Automation, Code Generation)" />
          <SkillRow label="Backend & Practices" items="PHP, ASP.NET (Basic), Agile / Scrum Workflow, Cross-Functional Team Collaboration, Clean Code Principles" />
        </div>
      </Section>

      <Section title="Experience">
        <Job
          role="Web Developer"
          org="Bombay Design Centre"
          period="Apr 2021 – Present"
          points={[
            <>Translated <strong>Figma and Adobe XD</strong> designs into pixel-accurate, responsive web applications and marketing platforms for <strong>15+ premier enterprise brands</strong> including VIP Bags, Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, and RMZ.</>,
            <>Engineered modern web interfaces using <strong>React.js, Next.js, TypeScript, and Tailwind CSS</strong>; optimized website performance resulting in <strong>20% faster load times</strong>, consistent <strong>Lighthouse scores of 90+</strong>, and a <strong>15% increase in user retention</strong>.</>,
            <>Developed responsive <strong>HTML email marketing campaigns for Kotak</strong> reaching <strong>100K+ users</strong> with 100% cross-client inbox fidelity; collaborated closely with UI/UX designers and backend teams.</>,
          ]}
        />
        <Job
          role="UI Developer"
          org="HRMantra – HR & Payroll Platform"
          period="May 2019 – Apr 2021"
          points={[
            <>Led UI development and frontend design for <strong>HRMantra&apos;s enterprise SaaS HR & payroll software</strong> serving <strong>250K+ active employees</strong>, delivering intuitive multi-module workflows that reduced task completion time by <strong>25%</strong>.</>,
            <>Developed and maintained dynamic, accessible web interfaces using <strong>HTML5, CSS3, and JavaScript</strong> with a focus on cross-browser stability and reusable code.</>,
          ]}
        />
        <Job
          role="Frontend Developer"
          org="Technofra Pvt Ltd"
          period="Jul 2016 – May 2019"
          points={[
            <>Designed and deployed visually compelling, responsive user interfaces across <strong>20+ consumer and business web applications</strong>, elevating mobile responsiveness and user engagement.</>,
            <>Built scalable frontend features using <strong>HTML, CSS, JavaScript, and ASP.NET</strong>, reducing page asset weight by <strong>30%</strong> while ensuring cross-browser consistency and high reliability.</>,
          ]}
        />
      </Section>

      <Section title="Selected Brands">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12.5px] leading-relaxed text-neutral-700">
        
          <BrandLink href="https://vipbags.com/">VIP Bags</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.godrej.com/">Godrej</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://investmentbank.kotak.com/">Kotak Investment Banking</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.tatachemicals.com/">Tata Chemicals</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.shapoorjirealestate.com/">Shapoorji Pallonji</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://joyvillehomes.com/">Joyville Homes</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.rmz.com/">RMZ</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.rustomjee.com/">Rustomjee</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.yesbank.in/">Yes Bank</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.aubank.in/">AU Bank</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.viceroyproperties.in/">Viceroy Properties</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.kokuyocamlin.com/">Kokuyo Camlin</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.mezete.com/">Mezete</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.kasihfood.com/">Kasih Food</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.bharat-connect.com/">Bharat Connect</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.delhiredz.com/">Delhi Redz</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.employeevibes.com/">Employee Vibes</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.bitsdesign.edu.in/">Bits Design School</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://bombaydc.com/">BombayDC</BrandLink>
          <span className="text-neutral-400 font-bold">•</span>
          <BrandLink href="https://www.asign.art/">Asign Art</BrandLink>
        </p>
      </Section>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Education">
          <p className="text-[12.5px] text-neutral-800">
            <span className="font-semibold text-neutral-900">B.Sc. Information Technology</span> — Mumbai University, 2015{" "}
            <br/>
            <span className="text-neutral-500">(Grade A · CGPA 6.07)</span>
          </p>
        </Section>

        <Section title="Recognition">
          <p className="text-[12.5px] text-neutral-800">
            Kyoorius Design Award, 2023 – team contribution at Bombay Design Centre
          </p>
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Languages">
          <p className="text-[12.5px] text-neutral-800">English · Hindi · Marathi</p>
        </Section>

        <Section title="Interests">
          <p className="text-[12.5px] text-neutral-800">UI/UX Trends · PC Games · Creative Coding</p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3 print:mb-2.5 break-inside-avoid">
      <h2 className="mb-1 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900">
        <span className="shrink-0">{title}</span>
        <span className="h-0 flex-1 border-b border-neutral-300" />
      </h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Job({ role, org, period, points }: { role: string; org: string; period: string; points: React.ReactNode[] }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="font-display text-[14.5px] font-semibold text-neutral-900">{role}</span>
          <span className="text-[12px] text-neutral-600">&nbsp;({org})&nbsp;</span>
        </div>
        <div className="whitespace-nowrap font-mono text-[10.5px] uppercase tracking-widest text-neutral-600">{period}</div>
      </div>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[12px] leading-[1.5] text-neutral-800">
        {points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
  );
}

function BrandLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-neutral-800 hover:text-neutral-950 transition-colors"
    >
      {children}
    </a>
  );
}

function SkillRow({ label, items }: { label: string; items: React.ReactNode }) {
  return (
    <div className="text-[12.5px] leading-relaxed text-neutral-800">
      <span className="font-semibold text-neutral-950">{label}:</span>{" "}
      <span className="text-neutral-800">{items}</span>
    </div>
  );
}

export default ResumePage;