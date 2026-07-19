import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PerfPanel } from "@/components/perf-panel";
import { CommandPalette } from "@/components/command-palette";
import { CodeBackdrop } from "@/components/code-backdrop";
import { Konami } from "@/components/konami";
import { AskResume } from "@/components/ask-resume";
import { LenisScroll } from "./_providers";

export const metadata: Metadata = {
  title: "Jwala Baheliya — Senior Frontend Developer",
  description:
    "Senior frontend developer, 8+ years crafting interfaces for Rustomjee, Godrej, Kotak, Tata, Shapoorji Pallonji and other world-class brands.",
  authors: [{ name: "Jwala Baheliya" }],
  openGraph: {
    title: "Jwala Baheliya — Senior Frontend Developer",
    description:
      "8+ years shipping premium interfaces for Rustomjee, Godrej, Kotak, Tata, Shapoorji Pallonji and more.",
    type: "website",
    images: ["/jwala-baheliya.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/jwala-baheliya.jpg"] },
  icons: { icon: "/favicon.png", shortcut: "/favicon.png", apple: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <LenisScroll />
        <CodeBackdrop />
        <div className="relative z-10">{children}</div>
        <ThemeSwitcher />
        <PerfPanel />
        <CommandPalette />
        <AskResume />
        <Konami />
        <Toaster position="bottom-right" richColors closeButton theme="dark" />
      </body>
    </html>
  );
}
