export const runtime = "edge";

const RESUME = `Jwala Baheliya — Senior Frontend Developer (8+ years). Skills: HTML5, CSS3, SCSS, JavaScript, TypeScript, React, Next.js, Tailwind, Framer Motion, GSAP, Three.js, Vite, accessibility, performance. Brands: Rustomjee, Godrej, Kotak, Tata, Shapoorji, VIP Bags. Kyoorius 2023.`;

export async function POST(request: Request) {
  try {
    const { jd } = (await request.json()) as { jd?: string };
    if (!jd || jd.trim().length < 20)
      return new Response("Please paste a longer job description.", { status: 400 });
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

    const prompt = `Compare candidate resume with the JD. Return STRICT JSON only: { "score": 0-100, "verdict": "Strong fit"|"Good fit"|"Partial fit"|"Weak fit", "matched": string[], "missing": string[], "summary": string }
=== RESUME ===
${RESUME}
=== JD ===
${jd.slice(0, 4000)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a strict technical recruiter. Output only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return new Response(await res.text(), { status: res.status });
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    let text = (data.choices?.[0]?.message?.content ?? "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    try { return Response.json(JSON.parse(text)); }
    catch { return Response.json({ score: 60, verdict: "Partial fit", matched: [], missing: [], summary: text.slice(0, 220) }); }
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
}
