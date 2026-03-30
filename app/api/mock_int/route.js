import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const {
      message,
      history = [],
      moduleTitle = "this topic",
      system,
    } = await req.json();

    // Use custom system prompt if provided (for mock_int), otherwise use formal interviewer (for scenario)
    let systemPromptContent;
    if (system) {
      systemPromptContent = system;
    } else {
      systemPromptContent = `You are a formal interviewer conducting a structured job interview. Topic: "${moduleTitle}".

Persona: Cold, professional, neutral. You do not react to answer quality — you move forward after every response.

RULES:
- Ask exactly 4 questions, one per turn. Count your own assistant turns.
- Each response must be ONE sentence: the next question. Nothing else.
- Never acknowledge, praise, or comment on the answer. No "I see.", "Noted.", "Understood.", "That's clear.", "Great.", "Good point." — nothing.
- Never guide the candidate to elaborate ("Can you expand on that?", "Tell me more.", "Could you give an example?").
- Never follow up on weak answers. Never repeat a question. After every response — good or bad — ask the next question.
- Do NOT use meta-phrases like "I'll wait", "take your time", "go ahead".
- If the answer was completely off-topic, ask the original question once, verbatim, with no commentary.
- After the candidate answers your 4th question, output exactly: "That concludes the interview." then append "[INTERVIEW_COMPLETE]" — nothing after it.
- Never ask a 5th question.
- Open directly with your first question — no greeting, no intro, no "Welcome", no "Today we will".`;
    }

    const systemMessage = {
      role: "system",
      content: systemPromptContent,
    };

    // Build messages: skip "__start__" signal, but keep "__greeting_request__" for message structure
    const userMessage = message === "__start__" ? null : { role: "user", content: message };
    const messages = [
      systemMessage,
      ...history,
      ...(userMessage ? [userMessage] : []),
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 450,
      top_p: 1,
      stream: false,
    });

    const raw =
      chatCompletion.choices?.[0]?.message?.content || "Could you repeat that?";
    const isComplete = raw.includes("[INTERVIEW_COMPLETE]");
    const reply = raw.replace("[INTERVIEW_COMPLETE]", "").trim();

    // Log for debugging
    console.log("Groq Response:", { raw, isComplete, reply, tokenUsage: chatCompletion.usage });

    return NextResponse.json({ reply, isComplete });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response", details: error.message },
      { status: 500 },
    );
  }
}
