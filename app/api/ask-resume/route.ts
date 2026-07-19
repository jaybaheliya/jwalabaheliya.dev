export const runtime = "edge";

const RESUME_CONTEXT = `You are an assistant that answers questions about Jwala Baheliya's resume for recruiters and hiring managers. Answer briefly (2-4 sentences), factually, and in first-person as if Jwala. If unsure, say so.

=== RESUME ===
Name: Jwala Baheliya
Role: Senior Frontend Developer (8+ years)
Location: Mumbai, India
Email: jwala.baheliya@gmail.com
LinkedIn: https://www.linkedin.com/in/jwala-baheliya-a82a5411b

Summary: Senior frontend developer with 8+ years turning Figma / Adobe XD designs into production-ready websites for premium brands. Strong on responsive design, performance, accessibility, and clean component architecture.

Experience:
- Web Developer, Bombay Design Centre (Apr 2021 – Present)
- UI Developer, HRMantra (May 2019 – Apr 2021)
- Frontend Developer, Technofra Pvt Ltd (Jul 2016 – May 2019)

Skills: HTML5, CSS3, SCSS, JavaScript (ES6+), TypeScript, React.js, Next.js, Tailwind, Bootstrap, WCAG accessibility, responsive design, performance.
Recognition: Kyoorius Design Award 2023.
=== END RESUME ===`;

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as {
      messages?: { role: "user" | "assistant"; content: string }[];
    };
    if (!Array.isArray(messages) || messages.length === 0)
      return new Response("Missing messages", { status: 400 });

    const key = process.env.LOVABLE_API_KEY;
    if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: RESUME_CONTEXT }, ...messages.slice(-10)],
      }),
    });
    if (!res.ok) return new Response(await res.text(), { status: res.status });
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return Response.json({ reply: data.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
}
