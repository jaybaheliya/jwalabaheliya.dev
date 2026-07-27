export type ToolkitCategory =
  | "CSS"
  | "Layout"
  | "JavaScript"
  | "Color"
  | "Typography"
  | "Responsive"
  | "Utilities"
  | "Components"
  | "Wow";

export type ToolkitDoc = {
  id: string;
  name: string;
  category: ToolkitCategory;
  keywords?: string;
};

export const TOOLKIT_ROUTE_ALIASES: Record<string, string> = {
  "js-snippets": "js-gallery",
  skeleton: "img-placeholder",
};

export const TOOLKIT_CATEGORY_ORDER: ToolkitCategory[] = [
  "CSS",
  "Layout",
  "JavaScript",
  "Color",
  "Typography",
  "Responsive",
  "Utilities",
  "Components",
  "Wow",
];

export const TOOLKIT_DOCS: ToolkitDoc[] = [
  { id: "shadow", name: "Box Shadow Generator", category: "CSS", keywords: "css shadow" },
  { id: "gradient", name: "Gradient Generator", category: "CSS", keywords: "linear radial" },
  { id: "radius", name: "Border Radius Generator", category: "CSS" },
  { id: "glass", name: "Glassmorphism", category: "CSS", keywords: "frosted blur" },
  { id: "neu", name: "Neumorphism", category: "CSS" },
  { id: "grid", name: "CSS Grid Generator", category: "Layout" },
  { id: "flex", name: "Flexbox Playground", category: "Layout" },
  { id: "clampf", name: "Clamp() Font Generator", category: "Typography", keywords: "fluid" },
  { id: "aspect", name: "Aspect Ratio", category: "CSS" },
  { id: "tri", name: "CSS Triangle", category: "CSS" },
  { id: "filter", name: "CSS Filter", category: "CSS" },
  { id: "transform", name: "Transform Playground", category: "CSS", keywords: "rotate scale skew" },
  { id: "keyframes", name: "Animation Keyframes", category: "CSS" },
  { id: "clip", name: "Clippath Generator", category: "Wow" },
  { id: "blob", name: "Blob Shape Generator", category: "Wow" },
  { id: "wave", name: "SVG Wave Generator", category: "Wow" },
  { id: "color", name: "Color Picker", category: "Color" },
  { id: "contrast", name: "Contrast Checker (WCAG)", category: "Color" },
  { id: "tw-color", name: "Tailwind Color Palette", category: "Color" },
  { id: "color-mix-oklch", name: "Color Mix / OKLCH Playground", category: "Color", keywords: "color-mix oklch oklab modern css color palette tokens" },
  { id: "fontpair", name: "Font Pair Generator", category: "Typography" },
  { id: "resp", name: "Responsive Checker", category: "Responsive" },
  { id: "mq", name: "Media Query Generator", category: "Responsive" },
  { id: "container-query", name: "Container Query Playground", category: "Responsive", keywords: "container query @container component responsive modern css api" },
  { id: "view-transition", name: "View Transition Playground", category: "JavaScript", keywords: "view transition api document.startViewTransition shared element page transition" },
  { id: "json", name: "JSON Formatter & Validator", category: "JavaScript" },
  { id: "b64", name: "Base64 Encode / Decode", category: "JavaScript" },
  { id: "url", name: "URL Encoder / Decoder", category: "JavaScript" },
  { id: "regex", name: "Regex Tester", category: "JavaScript" },
  { id: "uuid", name: "UUID Generator", category: "Utilities" },
  { id: "slug", name: "Slug Generator", category: "Utilities" },
  { id: "case", name: "Case Converter", category: "Utilities" },
  { id: "pw", name: "Password Generator", category: "Utilities" },
  { id: "ts", name: "Timestamp Converter", category: "Utilities" },
  { id: "lorem", name: "Lorem Ipsum Generator", category: "Utilities" },
  { id: "qr", name: "QR Code Generator", category: "Utilities" },
  { id: "units", name: "PX / REM / EM Converter", category: "Utilities" },
  { id: "interview-lab", name: "Interactive Interview Lab", category: "JavaScript", keywords: "interview prep event loop closures arrays dom event propagation bubbling capture quiz practice" },
  { id: "components", name: "Components Library", category: "Components", keywords: "buttons cards badges alerts" },
  { id: "text-shadow", name: "Text Shadow Generator", category: "CSS" },
  { id: "bezier", name: "Cubic Bezier Easing", category: "CSS", keywords: "animation timing" },
  { id: "svg-loaders", name: "SVG Loaders / Spinners", category: "Wow", keywords: "spinner loading" },
  { id: "meta-tags", name: "Meta Tag Generator", category: "Utilities", keywords: "seo open graph og twitter" },
  { id: "entities", name: "HTML Entity Encoder", category: "Utilities", keywords: "escape html" },
  { id: "text-stats", name: "Word & Character Counter", category: "Utilities", keywords: "reading time" },
  { id: "jwt", name: "JWT Decoder", category: "JavaScript", keywords: "token auth" },
  { id: "markdown", name: "Markdown Preview", category: "Utilities", keywords: "md live" },
  { id: "img64", name: "Image to Base64", category: "Utilities", keywords: "data url" },
  { id: "curl", name: "cURL to Fetch", category: "JavaScript", keywords: "convert api" },
  { id: "cheat", name: "CSS Cheatsheet", category: "CSS", keywords: "reference snippets layout typography responsive animation forms modern css" },
  { id: "diff", name: "Text Diff Checker", category: "JavaScript", keywords: "compare text code" },
  { id: "js-gallery", name: "JavaScript Snippets - 70 Ready-made", category: "JavaScript", keywords: "modal accordion tabs dropdown sidebar hamburger slider carousel typing scramble password validation debounce throttle fetch search pagination drag drop upload counter clock stopwatch quote uuid localstorage query params formdata custom event download event delegation reduce map promise all memoize flatten group by retry deep clone sort once interview prep closure currying pipe binary search dfs event loop polyfill bind call apply lru cache" },
  { id: "svg-css", name: "SVG to CSS Converter", category: "Utilities", keywords: "data uri background image encoder" },
  { id: "img-convert", name: "Image Format Converter", category: "Utilities", keywords: "png jpeg jpg webp convert image" },
  { id: "svg-cleanup", name: "SVG Optimizer + Cleanup", category: "Utilities", keywords: "svg optimize cleanup react" },
  { id: "html-jsx", name: "HTML to JSX / JSX to HTML", category: "JavaScript", keywords: "convert markup react" },
  { id: "css-tw", name: "CSS to Tailwind Converter", category: "CSS", keywords: "tailwind convert" },
  { id: "tw-sort", name: "Tailwind Class Sorter / Merger", category: "Utilities", keywords: "tailwind sort dedupe classes" },
  { id: "shadow-presets", name: "Box Shadow Presets Library", category: "CSS", keywords: "cards modals dropdowns" },
  { id: "mesh", name: "Gradient Mesh / Hero Background", category: "Wow", keywords: "hero gradient mesh" },
  { id: "regex-lib", name: "Form Validation Regex Library", category: "Utilities", keywords: "email phone password otp validation" },
  { id: "forms-lab", name: "Forms Lab: Beginner to Advanced", category: "JavaScript", keywords: "forms react nextjs vanilla js csrf validation vapt formdata editor" },
  { id: "form-events-lab", name: "Form Events, Validation & CSRF Lab", category: "JavaScript", keywords: "form events validation blur input change submit csrf react nextjs vanilla" },
  { id: "rest-api-lab", name: "REST API Lab: Beginner to Advanced", category: "JavaScript", keywords: "rest api http methods headers fetch crud auth pagination react nextjs vanilla" },
  { id: "frontend-backend-lab", name: "Frontend to Backend Lab: Zero to Hero", category: "JavaScript", keywords: "frontend backend api fetch nextjs react vanilla auth validation loading error mutation architecture" },
  { id: "react-playground-lab", name: "React Playground Lab", category: "JavaScript", keywords: "react hooks events fetch useState useEffect useReducer useRef async learning playground" },
  { id: "json-types", name: "API JSON to TypeScript Types", category: "JavaScript", keywords: "json ts types zod" },
  { id: "storage", name: "LocalStorage / SessionStorage Playground", category: "JavaScript", keywords: "browser storage" },
  { id: "debounce-play", name: "Debounce / Throttle Playground", category: "JavaScript", keywords: "debounce throttle performance" },
  { id: "breakpoint-preview", name: "Breakpoint Preview + Device Frame Tester", category: "Responsive", keywords: "device viewport responsive" },
  { id: "a11y-pair", name: "Accessible Color Pair Finder", category: "Color", keywords: "contrast accessible wcag" },
  { id: "favicon-gen", name: "Favicons / App Icons Generator", category: "Utilities", keywords: "favicon app icon pwa" },
  { id: "og-preview", name: "Open Graph Preview Tool", category: "Utilities", keywords: "og social share meta" },
  { id: "clamp-space", name: "Clamp() Spacing Generator", category: "CSS", keywords: "fluid spacing clamp" },
  { id: "grid-overlay", name: "Grid Overlay / Layout Inspector", category: "Layout", keywords: "columns gutter layout" },
  { id: "scroll-snap", name: "Scroll Snap Builder", category: "Layout", keywords: "scroll snap carousel sections snap-type snap-align overflow" },
  { id: "database-lab", name: "Frontend to Database Lab", category: "JavaScript", keywords: "database sql prisma mongo supabase api insert validation schema" },
  { id: "anim-gallery", name: "Animation Presets Gallery", category: "CSS", keywords: "entrance hover motion" },
  { id: "img-placeholder", name: "Image Placeholder Generator", category: "Utilities", keywords: "blur shimmer dominant color" },
  { id: "sticky-scroll", name: "Sticky / Scroll Progress Generator", category: "JavaScript", keywords: "scroll progress sticky sidebar" },
  { id: "ai-prompt-builder", name: "Frontend AI Prompt Builder", category: "Utilities", keywords: "ai prompt chatgpt claude copilot frontend scaffold ui component" },
  { id: "ai-ui-review", name: "AI UI Review Prompt Builder", category: "Utilities", keywords: "ai ui review accessibility responsive design qa frontend prompt" },
  { id: "ai-state-copy", name: "UI State Copy Prompt Builder", category: "Utilities", keywords: "ai ux copy loading empty error validation microcopy prompt" },
  { id: "ai-bug-debug", name: "Frontend Bug Debug Prompt", category: "Utilities", keywords: "ai debug frontend bug react nextjs dom prompt reproduction" },
];

export const TOOLKIT_DOCS_BY_ID = Object.fromEntries(
  TOOLKIT_DOCS.map((tool) => [tool.id, tool]),
) as Record<string, ToolkitDoc>;

export function resolveToolkitId(id: string) {
  return TOOLKIT_ROUTE_ALIASES[id] ?? id;
}

export function getToolkitDocById(id: string) {
  return TOOLKIT_DOCS_BY_ID[resolveToolkitId(id)];
}

export function getToolkitDescription(tool: ToolkitDoc) {
  return `${tool.name} in Jwala Baheliya's frontend toolkit. A live ${tool.category.toLowerCase()} utility with copy-ready output and in-browser previews.`;
}
