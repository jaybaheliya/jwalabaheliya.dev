export type Project = {
  slug: string;
  tag: string;
  title: string;
  problem: string;
  solution: string;
  stack: string[];
  links: { live: string; code?: string };
  role: string;
  year: string;
  outcomes: string[];
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const RAW: Omit<Project, "slug">[] = [
  { tag: "Real Estate · Flagship", title: "Rustomjee",
    problem: "Corporate site for one of Mumbai's leading luxury real-estate developers — needed to translate high-end brand design into a fast, responsive marketing site.",
    solution: "Built responsive pages from Figma / Adobe XD, focused on gallery performance, SEO fundamentals and cross-browser polish.",
    stack: ["HTML5","SCSS","JavaScript","React","Next.js"],
    links: { live: "https://www.rustomjee.com/" },
    role: "Frontend Developer · Bombay Design Centre", year: "2022 — Present",
    outcomes: ["Pixel-accurate build of 40+ project micro-sites and campaign pages","Lighthouse performance lifted into the 90s on marketing pages","Reusable gallery + enquiry components adopted across the brand"] },
  { tag: "BFSI", title: "Kotak Investment Banking",
    problem: "Institutional-grade site for Kotak's investment banking arm — content-heavy pages, strict brand guidelines and HTML email campaigns to support.",
    solution: "Developed the frontend and shipped responsive HTML mailers used across Kotak's campaigns.",
    stack: ["HTML5","SCSS","JavaScript","HTML Emailers"],
    links: { live: "https://investmentbank.kotak.com" },
    role: "Frontend Developer · Bombay Design Centre", year: "2022 — 2024",
    outcomes: ["Shipped the responsive marketing site under strict BFSI brand rules","Built 20+ HTML email templates rendering across Outlook / Gmail / Apple Mail","Zero regressions reported across quarterly compliance reviews"] },
  { tag: "Conglomerate", title: "Godrej",
    problem: "Corporate presence for one of India's largest conglomerates — multiple product lines and audiences under a single umbrella brand.",
    solution: "Contributed to frontend development and responsive UI across brand pages, translating designs into clean, accessible markup.",
    stack: ["HTML5","SCSS","JavaScript","jQuery"],
    links: { live: "https://www.godrej.com" },
    role: "Frontend Developer · Bombay Design Centre", year: "2021 — 2023",
    outcomes: ["Delivered accessible, semantic markup across group-level brand pages","Improved mobile experience with fluid layouts and lazy media loading","Maintained a shared component pattern reused by other Godrej teams"] },
  { tag: "Real Estate", title: "Shapoorji Pallonji Real Estate",
    problem: "Marketing site for SP Real Estate and the Joyville Homes brand — needed rich project galleries and lead-capture flows.",
    solution: "Built responsive pages from design mockups, implemented enquiry forms and ensured cross-browser compatibility.",
    stack: ["HTML5","SCSS","JavaScript","React"],
    links: { live: "https://www.shapoorjirealestate.com", code: "https://www.joyvillehomes.com" },
    role: "Frontend Developer · Bombay Design Centre", year: "2022",
    outcomes: ["Enquiry conversion improved with clearer CTA hierarchy on PDPs","Cross-browser QA cleared for legacy Edge / Safari corporate estates","Reused the pattern to ship the Joyville Homes sibling site"] },
  { tag: "Retail · Shopify", title: "VIP Bags",
    problem: "E-commerce experience for VIP Bags on Shopify — theme customisation and Liquid templating.",
    solution: "Working on the Shopify Liquid theme, responsive layouts and PDP polish.",
    stack: ["Shopify","Liquid","SCSS","JavaScript"],
    links: { live: "https://vipbags.com/" },
    role: "Frontend Developer · Bombay Design Centre", year: "2025 — Present",
    outcomes: ["Rebuilding PDP + collection templates for a faster mobile checkout","Cleaning up Liquid sections into reusable, merchandiser-friendly blocks","Standardising design tokens across the theme for consistent branding"] },
  { tag: "FMCG · International", title: "Mezete & Kasih Food",
    problem: "Brand websites for international FMCG clients (Mezete and Kasih Food, Jordan) with rich product storytelling.",
    solution: "Developed responsive marketing sites, product listings and content pages from Figma / XD.",
    stack: ["HTML5","SCSS","JavaScript","jQuery"],
    links: { live: "https://www.mezete.com/", code: "https://www.kasihfood.com" },
    role: "Frontend Developer · Bombay Design Centre", year: "2023",
    outcomes: ["Delivered two full brand sites for an international FMCG client","Rich product storytelling with lightweight animations and clean IA","Multi-locale ready markup with cross-browser QA on legacy devices"] },
];

export const PROJECTS: Project[] = RAW.map((p) => ({ ...p, slug: slugify(p.title) }));
export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
