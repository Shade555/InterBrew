import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, answer } = await request.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an OS interview expert. Score answer 1-10. Return ONLY the number.',
          },
          {
            role: 'user',
            content: `Question: ${question}\\nAnswer: ${answer}\\nScore:`,
          },
        ],
      }),
    });

    const data = await response.json();
    const scoreText = data.choices?.[0]?.message?.content?.trim() || '5';
    const score = parseInt(scoreText.match(/\\d+/)?.[0] || '5', 10);

    return NextResponse.json({ score: Math.min(Math.max(score, 1), 10) });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ score: 5 }, { status: 500 });
  }
}
