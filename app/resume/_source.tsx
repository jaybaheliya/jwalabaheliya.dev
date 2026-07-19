"use client";
import Link from "next/link";
import { useEffect } from "react";

function ResumePage() {
  useEffect(() => {
    document.documentElement.classList.add("resume-print");
    return () => document.documentElement.classList.remove("resume-print");
  }, []);

  return (
    <main className="mx-auto max-w-[820px] bg-white px-8 py-12 text-neutral-900 print:px-6 print:py-6">
      <div className="mb-6 flex items-start justify-between gap-6 border-b border-neutral-300 pb-6 print:hidden">
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

      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Jwala Baheliya</h1>
        <p className="mt-1 text-lg text-neutral-700">Senior Frontend Developer - 8+ years</p>
        <p className="mt-2 text-sm text-neutral-500">
          Mumbai, India - <a className="underline" href="mailto:jwala.baheliya@gmail.com">jwala.baheliya@gmail.com</a> -{" "}
          <a className="underline" href="https://www.linkedin.com/">LinkedIn</a>
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
          period="Apr 2021 - Present"
          points={[
            "Shipped 40+ pixel-accurate marketing sites and micro-sites for Rustomjee, Godrej, Kotak, Tata Chemicals, Shapoorji Pallonji, RMZ, VIP Bags, Yes Bank, AU Bank and more.",
            "Built with HTML, SCSS, JavaScript, PHP, React and Next.js following clean-code and BEM.",
            "Lifted Lighthouse performance into the 90s on flagship pages; owned responsive, cross-browser QA.",
            "Developed HTML email campaigns for Kotak; collaborated closely with designers and onsite coordinators.",
          ]}
        />
        <Job
          role="UI Developer"
          org="HRMantra - HR & Payroll Platform"
          period="May 2019 - Apr 2021"
          points={[
            "Owned UI development and web design for HRMantra's HR & payroll product.",
            "Built and maintained dynamic websites and web applications across HTML, CSS and JavaScript.",
          ]}
        />
        <Job
          role="Frontend Developer"
          org="Technofra Pvt Ltd"
          period="Jul 2016 - May 2019"
          points={[
            "Designed and implemented user interfaces for a diverse client portfolio.",
            "Built dynamic websites and web applications using HTML, CSS, JavaScript and ASP.NET.",
          ]}
        />
      </Section>

      <Section title="Selected Brands">
        <p className="text-sm text-neutral-700">
          Rustomjee - Godrej - Kotak - Tata Chemicals - Shapoorji Pallonji - RMZ - VIP Bags - Yes Bank - AU Bank -
          Kokuyo Camlin - Mezete - Kasih Food - Bharat Connect - Delhi Redz - Employee Vibes - Bits Design School
        </p>
      </Section>

      <Section title="Skills">
        <SkillRow label="Frontend" items="HTML5, CSS3, SCSS, JavaScript (ES6+), TypeScript, React.js, Next.js, Tailwind, Bootstrap" />
        <SkillRow label="Concepts" items="Responsive design, BEM, component architecture, accessibility (WCAG), performance, cross-browser QA" />
        <SkillRow label="Tools" items="Git, GitHub, Vite, Figma, Adobe XD, Photoshop, Illustrator" />
      </Section>

      <Section title="Education">
        <p className="text-sm text-neutral-700">B.Sc. Information Technology - Mumbai University</p>
      </Section>

      <Section title="Languages">
        <p className="text-sm text-neutral-700">English - Hindi - Marathi</p>
      </Section>

      <Section title="Recognition">
        <p className="text-sm text-neutral-700">Kyoorius Design Award, 2023 - team contribution at Bombay Design Centre</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">{title}</h2>
      <div className="space-y-3">{children}</div>
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
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
        {points.map((p) => <li key={p}>{p}</li>)}
      </ul>
    </div>
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
