"use client";
import Link from "next/link";
import { useEffect } from "react";

function ResumePage() {
  useEffect(() => {
    document.documentElement.classList.add("resume-print");
    return () => document.documentElement.classList.remove("resume-print");
  }, []);

  return (
    <main className="mx-auto max-w-[820px] bg-white px-8 py-8 text-neutral-900 print:px-6 print:py-4">
      <div className="mb-5 flex items-start justify-between gap-6 border-b border-neutral-300 pb-5 print:hidden">
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

      <header className="mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl font-bold tracking-tight">Jwala Baheliya</h1>
          <span className="font-mono text-xl text-neutral-400">&lt;/&gt;</span>
        </div>
        <p className="mt-1 text-lg text-neutral-700">Senior Frontend Developer · 8+ years</p>
        <p className="mt-2 text-sm text-neutral-500">
          Mumbai, India ·{" "}
          <a className="underline" href="tel:+919029652067">(+91) 90296 52067</a> ·{" "}
          <a className="underline" href="mailto:jaybaheliya@gmail.com">jaybaheliya@gmail.com</a> ·{" "}
          <a className="underline" href="https://www.linkedin.com/in/jwala-baheliya-a82a5411b/" target="_blank" rel="noreferrer">LinkedIn</a> ·{" "}
          <a className="underline" href="https://jwalabaheliya-dev.vercel.app/" target="_blank" rel="noreferrer">Portfolio</a>
        </p>
      </header>

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-neutral-700">
          Senior frontend developer with 8+ years turning Figma / Adobe XD designs into production-ready
          websites for Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, RMZ and more. Strong on
          responsive design, performance, accessibility and clean component architecture.
        </p>
      </Section>

      <Section title="Experience">
        <Job
          role="Web Developer"
          org="Bombay Design Centre"
          period="Apr 2021 – Present"
          points={[
            "Translated Figma and Adobe XD designs into pixel-accurate, responsive marketing sites and micro-sites for Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, RMZ, VIP Bags, Yes Bank, AU Bank, Bharat Connect, Kokuyo Camlin and more.",
            "Built with HTML, SCSS, JavaScript, PHP, React.js and Next.js; lifted Lighthouse scores into the 90s on flagship pages.",
            "Developed HTML email campaigns for Kotak; collaborated with designers, backend developers and onsite coordinators.",
          ]}
        />
        <Job
          role="UI Developer"
          org="HRMantra – HR & Payroll Platform"
          period="May 2019 – Apr 2021"
          points={[
            "Owned UI development for HRMantra's advanced HR & payroll software — the world's most parameterised hire-to-retire platform.",
            "Built and maintained dynamic web applications using HTML, CSS and JavaScript.",
          ]}
        />
        <Job
          role="Frontend Developer"
          org="Technofra Pvt Ltd"
          period="Jul 2016 – May 2019"
          points={[
            "Designed and implemented user interfaces for diverse consumer and business web projects.",
            "Built dynamic websites using HTML, CSS, JavaScript and ASP.NET.",
          ]}
        />
      </Section>

      <Section title="Selected Brands">
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-neutral-700">
          <BrandLink href="https://www.rustomjee.com/">Rustomjee</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.godrej.com/">Godrej</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://investmentbank.kotak.com/">Kotak Investment Banking</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.tatachemicals.com/">Tata Chemicals</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.shapoorjirealestate.com/">Shapoorji Pallonji</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.joyvillehomes.com/">Joyville Homes</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.rmz.com/">RMZ</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://vipbags.com/">VIP Bags</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.yesbank.in/">Yes Bank</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.aubank.in/">AU Bank</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.viceroyproperties.in/">Viceroy Properties</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.kokuyocamlin.com/">Kokuyo Camlin</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.mezete.com/">Mezete</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.kasihfood.com/">Kasih Food</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.bharat-connect.com/">Bharat Connect</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.delhiredz.com/">Delhi Redz</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.employeevibes.com/">Employee Vibes</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.bitsdesign.edu.in/">Bits Design School</BrandLink>
          <span className="text-neutral-300">·</span>
          <BrandLink href="https://www.asign.art/">Asign Art</BrandLink>
        </p>
      </Section>

      <Section title="Skills">
        <SkillRow label="Frontend" items="HTML5, CSS3, SCSS, JavaScript (ES6+), TypeScript, React.js, Next.js, Tailwind CSS, Bootstrap, jQuery, Shopify Liquid" />
        <SkillRow label="Concepts" items="Responsive design, BEM, component architecture, accessibility (WCAG), performance optimisation & Core Web Vitals, REST APIs, cross-browser QA" />
        <SkillRow label="Tools" items="Git, GitHub, Vite, Figma, Adobe XD, Photoshop, Illustrator" />
        <SkillRow label="AI Tools" items="ChatGPT, GitHub Copilot, Claude AI – code generation, debugging, refactoring & productivity" />
        <SkillRow label="Other" items="PHP, ASP.NET (Basic), Agile workflow, UI/UX collaboration, clean code practices" />
      </Section>

      <Section title="Education">
        <div className="space-y-1 text-sm text-neutral-700">
          <p>
            <span className="font-medium">B.Sc. Information Technology</span> — Mumbai University, 2015{" "}
            <span className="text-neutral-500">(Grade A · CGPA 6.07)</span>
          </p>
          <p>HSC (12th) — Maharashtra State Board, 2012 <span className="text-neutral-500">(Second Division)</span></p>
          <p>SSC (10th) — Maharashtra State Board, 2010 <span className="text-neutral-500">(First Division)</span></p>
        </div>
      </Section>

      <Section title="Recognition">
        <p className="text-sm text-neutral-700">
          Kyoorius Design Award, 2023 – team contribution at Bombay Design Centre
        </p>
      </Section>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Languages">
          <p className="text-sm text-neutral-700">English · Hindi · Marathi</p>
        </Section>

        <Section title="Interests">
          <p className="text-sm text-neutral-700">UI/UX Trends · Web Accessibility · Creative Coding</p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 print:mb-3">
      <h2 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">{title}</h2>
      <div className="space-y-2.5 print:space-y-1.5">{children}</div>
    </section>
  );
}

function Job({ role, org, period, points }: { role: string; org: string; period: string; points: string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="font-display text-base font-semibold text-neutral-900">{role}</div>
          <div className="text-sm text-neutral-600">{org}</div>
        </div>
        <div className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-neutral-500">{period}</div>
      </div>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-neutral-700">
        {points.map((p) => <li key={p}>{p}</li>)}
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
      className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 hover:decoration-neutral-600 transition-colors"
    >
      {children}
    </a>
  );
}

function SkillRow({ label, items }: { label: string; items: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <div className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="text-neutral-700">{items}</div>
    </div>
  );
}

export default ResumePage;