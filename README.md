# Jwala Baheliya — Portfolio (Next.js 15 port)

Next.js 15 (App Router) port of the TanStack Start portfolio. Same UI, same
content, same components — different framework wiring.

## Getting started

```bash
cp .env.example .env.local   # optional: only needed for AI + view counter
npm install                  # or: pnpm i / bun i
npm run dev
```

Open http://localhost:3000

## What was ported

- `app/page.tsx` — full home page
- `app/resume/page.tsx` — printable resume
- `app/work/[slug]/page.tsx` — case-study detail
- `app/notes/page.tsx`, `app/notes/[slug]/page.tsx` — blog
- `app/toolkit/page.tsx`, `app/tools/page.tsx` — developer toolkits
- `app/api/ask-resume/route.ts`, `app/api/skill-match/route.ts` — edge AI routes (Lovable AI Gateway)
- All `/components` (theme switcher, magnetic buttons, playground, skill match, etc.)

## What changed vs the TanStack version

| TanStack Start                          | Next.js 15                              |
| --------------------------------------- | ---------------------------------------- |
| `src/routes/foo.tsx` + `createFileRoute`| `app/foo/page.tsx`                       |
| `createServerFn` / `server: { handlers }`| `app/api/*/route.ts` (edge)             |
| `@tanstack/react-router` `<Link to>`    | `next/link` `<Link href>`                |
| `head()` in route                       | `metadata` export in `layout` / `page`   |
| `src/styles.css` imported via `?url`    | `app/globals.css` imported in layout     |
| `import.meta.env.VITE_*`                | `process.env.NEXT_PUBLIC_*`              |
| Vite `@/*` alias                        | `tsconfig.json` `paths` (same alias)     |

## Notes / things to review

- **Lovable AI Gateway**: `/api/ask-resume` and `/api/skill-match` require
  `LOVABLE_API_KEY`. Without it, the endpoints return 500; the widgets have
  offline fallbacks.
- **Supabase view counter**: uses `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Without them, view counts fall
  back to localStorage.
- **`"use client"` directives** were auto-added to any component using
  hooks or event handlers. If you convert a component to a Server
  Component, remove the directive at the top.
- **Sandpack playground** and **Three.js** components are client-only and
  wrapped accordingly. If SSR crashes on a specific route, gate that
  component with `dynamic(() => import(...), { ssr: false })`.
- The **assets** folder wasn't fully brought over (only `jb-logo.png`).
  Drop any additional images into `public/` and update paths.

## Scripts

- `npm run dev` — start dev server on :3000
- `npm run build` — production build
- `npm start` — serve production build
