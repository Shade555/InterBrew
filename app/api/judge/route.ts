import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { question, userAnswer, opponentAnswer } = await req.json();

    const prompt = `OS THEORY JUDGING (0-10 score):
    Question: ${question}
    User A: ${userAnswer}
    User B: ${opponentAnswer}
    Return ONLY JSON: {"scoreA": number, "scoreB": number}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
  } catch (error) {
    return NextResponse.json({ scoreA: 5, scoreB: 5 }, { status: 500 });
  }
}