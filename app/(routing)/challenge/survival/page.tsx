"use client";

import { useMemo, useState } from "react";
import { sampleQuestions } from "../../../components/challenges/utils/question";

export default function SurvivalChallengePage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const question = sampleQuestions[index];
  const total = sampleQuestions.length;

  const statusText = useMemo(() => {
    if (gameOver) return "Game Over";
    return `Question ${Math.min(index + 1, total)} / ${total}`;
  }, [gameOver, index, total]);

  function submitAnswer() {
    if (selected === null || !question) return;

    if (selected === question.correctIndex) {
      setScore((prev) => prev + 1);
      setSelected(null);

      if (index + 1 >= total) {
        setGameOver(true);
        return;
      }

      setIndex((prev) => prev + 1);
      return;
    }

    setGameOver(true);
  }

  function restartGame() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setGameOver(false);
  }

  return (
    <main className="relative z-10 min-h-screen bg-[#0c0c0c] px-4 py-4">
      <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#111214] p-6 text-zinc-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Survival Challenge</h1>
          <span className="text-sm text-zinc-400">{statusText}</span>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="text-sm text-zinc-400">Score</span>
          <span className="text-lg font-semibold text-emerald-300">
            {score}
          </span>
        </div>

        {gameOver ? (
          <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-lg font-semibold">
              {index + 1 >= total && score === total
                ? "Perfect Run!"
                : "Survival Ended"}
            </p>
            <p className="text-sm text-zinc-400">
              Final score: {score} / {total}
            </p>
            <button
              type="button"
              onClick={restartGame}
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : question ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <p className="text-xl leading-relaxed">{question.question}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {question.options.map((opt, idx) => {
                const active = selected === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelected(idx)}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-emerald-500/60 bg-emerald-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm text-zinc-300">
                      {String.fromCharCode(65 + idx)}.
                    </span>{" "}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitAnswer}
                disabled={selected === null}
                className="rounded-md border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No questions available.</p>
        )}
      </section>
    </main>
  );
}
