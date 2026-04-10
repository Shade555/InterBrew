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
      systemPromptContent = `You are a professional interviewer conducting a job interview. Topic: "${moduleTitle}".

Persona: Professional, engaged, and evaluative. You listen carefully and respond naturally like a real interviewer — praising when appropriate, asking follow-ups to assess depth, and moving strategically through prepared questions.

RULES:
- Prepare exactly 4 core questions to explore the topic deeply.
- Start with a brief, warm greeting (e.g., "Good morning. Thanks for joining me. Let's talk about ${moduleTitle}.").
- Ask your first main question naturally.
- Listen actively: Acknowledge strong answers with brief, genuine responses ("That's a solid approach", "I appreciate that insight", "Good example").
- If an answer seems incomplete or weak, ask natural follow-up questions:
  * "Can you elaborate on that?"
  * "Can you give me a specific example?"
  * "How would you handle [scenario]?"
  * "What would that look like in practice?"
  * "What challenges did you face?"
- Move to your next core question after you feel you've assessed the candidate's understanding on the current topic.
- Keep responses conversational but professional — 1-3 sentences typically.
- After the candidate responds to all 4 main topics (or you've finished exploring them), close with: "That covers what I wanted to discuss. Thanks for your time." then append "[INTERVIEW_COMPLETE]" — nothing after it.
- Never rush through topics. Depth matters more than speed.
- Maintain professionalism while being warm and approachable.`;
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
