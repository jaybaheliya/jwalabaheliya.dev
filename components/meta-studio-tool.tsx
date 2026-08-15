"use client";

import { useId, useMemo, useState } from "react";
import { Copy, Check, Tag, Share2, Globe, Sparkles } from "lucide-react";

export function MetaStudioTool() {
  const [title, setTitle] = useState("Jwala Baheliya — Senior Full-Stack Engineer & Designer");
  const [description, setDescription] = useState("Full-Stack Developer building high-performance web applications, design systems, and frontend developer tools.");
  const [url, setUrl] = useState("https://jwalabaheliya.dev");
  const [ogImage, setOgImage] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop");
  const [siteName, setSiteName] = useState("Jwala Baheliya Portfolio");
  const [twitterHandle, setTwitterHandle] = useState("@jwalabaheliya");
  const [themeColor, setThemeColor] = useState("#0f172a");

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();
  const urlId = useId();
  const ogImgId = useId();
  const twitterId = useId();

  const domain = useMemo(() => {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return "jwalabaheliya.dev";
    }
  }, [url]);

  const { nextJsMetadataCode, htmlTagsCode } = useMemo(() => {
    const nextJs = `import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: '${title}',\n  description: '${description}',\n  metadataBase: new URL('${url}'),\n  openGraph: {\n    title: '${title}',\n    description: '${description}',\n    url: '${url}',\n    siteName: '${siteName}',\n    images: [\n      {\n        url: '${ogImage}',\n        width: 1200,\n        height: 630,\n        alt: '${title}',\n      },\n    ],\n    type: 'website',\n  },\n  twitter: {\n    card: 'summary_large_image',\n    title: '${title}',\n    description: '${description}',\n    creator: '${twitterHandle}',\n    images: ['${ogImage}'],\n  },\n};`;

    const html = `<title>${title}</title>\n<meta name="description" content="${description}" />\n<meta name="theme-color" content="${themeColor}" />\n<link rel="canonical" href="${url}" />\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website" />\n<meta property="og:url" content="${url}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta property="og:image" content="${ogImage}" />\n\n<!-- Twitter -->\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${description}" />\n<meta name="twitter:image" content="${ogImage}" />`;

    return { nextJsMetadataCode: nextJs, htmlTagsCode: html };
  }, [title, description, url, ogImage, siteName, twitterHandle, themeColor]);

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 text-accent" /> Next.js Metadata & Social Card Studio
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Build SEO meta tags and preview real-time cards for Google, Twitter/X, and LinkedIn with Next.js App Router code export.
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="my-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={titleId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Page Title ({title.length} chars)
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={urlId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Canonical URL
          </label>
          <input
            id={urlId}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor={descId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Meta Description ({description.length} chars - optimal 150-160)
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border/70 bg-background p-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={ogImgId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            OpenGraph Social Image URL (1200 x 630)
          </label>
          <input
            id={ogImgId}
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={twitterId} className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Twitter Creator Handle
          </label>
          <input
            id={twitterId}
            type="text"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Live Social Previews */}
      <div className="mb-6 space-y-4">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" /> Real-time Social Card Previews
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Google Search Card Preview */}
          <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Google Search Result Preview</div>
            <div className="text-xs text-muted-foreground truncate">{url}</div>
            <div className="text-base font-semibold text-blue-400 hover:underline cursor-pointer truncate">{title}</div>
            <div className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">{description}</div>
          </div>

          {/* Twitter / X Large Card Preview */}
          <div className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-2 overflow-hidden">
            <div className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Twitter / X Card Preview</div>
            <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ogImage} alt={title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-[11px] text-muted-foreground font-mono truncate">{domain}</div>
                <div className="text-xs font-bold text-foreground truncate mt-0.5">{title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Export */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Next.js App Router `metadata` Object</span>
            <button
              onClick={() => handleCopy(nextJsMetadataCode, "next")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "next" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{nextJsMetadataCode}</pre>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">HTML5 Head Meta Tags</span>
            <button
              onClick={() => handleCopy(htmlTagsCode, "html")}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent"
            >
              {copiedFormat === "html" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
            </button>
          </div>
          <pre className="font-mono text-xs text-accent overflow-x-auto whitespace-pre-wrap">{htmlTagsCode}</pre>
        </div>
      </div>
    </div>
  );
}
