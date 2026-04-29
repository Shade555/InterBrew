import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are an interview coach. Respond only with valid JSON — no markdown, no code fences, no extra text.",
        },
        {
          role: "user",
          content: `Give me 4 practical interview tips. Each tip should cover a different common interview scenario (e.g. behavioural questions, technical deep-dives, salary negotiation, handling gaps in knowledge).

Return a JSON array with exactly 4 objects. Each object must have these fields:
- "title": short scenario name (max 5 words)
- "value": one concrete tip for that scenario (1–2 sentences)
- "note": a quick mitigation or follow-up action (1 sentence)
- "icon": a single relevant emoji

Example shape:
[{"title":"...","value":"...","note":"...","icon":"..."}]`,
        },
      ],
      stream: false,
    });

    const raw = completion.choices?.[0]?.message?.content || "[]";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const tips = JSON.parse(cleaned);

    return NextResponse.json({ tips });
  } catch (err: any) {
    console.error("scenario-insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights", details: err.message },
      { status: 500 },
    );
  }
}
