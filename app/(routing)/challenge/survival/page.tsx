"use client";

import { useState, useEffect } from "react";
import Character from "../../../components/challenges/Character";
import { sampleQuestions } from "../../../components/challenges/utils/question";

// Sound utility functions - Play MP3 files
const playAudio = (soundPath: string) => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.log("Audio playback error:", error);
    });
  } catch (error) {
    console.log("Audio error:", error);
  }
};

const playCorrectSound = () => {
  playAudio("/survival/sounds/correct.mp3");
};

const playWrongSound = () => {
  playAudio("/survival/sounds/wrong.mp3");
};

const playGameOverSound = () => {
  playAudio("/survival/sounds/wrong.mp3");
};

export default function SurvivalChallengePage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [animationState, setAnimationState] = useState<
    "run" | "jump" | "stumble"
  >("run");

  const question = sampleQuestions[index];
  const total = sampleQuestions.length;

  // Reset animation state after action
  useEffect(() => {
    if (animationState !== "run") {
      const timer = setTimeout(
        () => {
          setAnimationState("run");
        },
        animationState === "jump" ? 500 : 700,
      );
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  function submitAnswer() {
    if (selected === null || !question) return;

    if (selected === question.correctIndex) {
      playCorrectSound();
      setScore((prev) => prev + 1);
      setAnimationState("jump");
      setSelected(null);
      setIndex((prev) => (prev + 1) % total);
      return;
    }

    playWrongSound();
    setAnimationState("stumble");
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        setTimeout(() => playGameOverSound(), 200);
      }
      return newLives;
    });
    setSelected(null);
  }

  function restartGame() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setAnimationState("run");
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0c0c0c]">
      {/* BACKGROUND: Scrolling Road */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/survival/sprites/road.jpg")',
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          animation: "scroll-road 3s linear infinite",
        }}
      >
        <style>{`
          @keyframes scroll-road {
            from { background-position-x: 0; }
            to { background-position-x: 100%; }
          }
        `}</style>
      </div>

      {/* CHARACTER: Positioned at bottom center */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center">
        <Character animationState={animationState} />
      </div>

      {/* HUD: Top Left Score & Lives */}
      <div className="absolute top-6 left-6 z-30 space-y-2 text-zinc-100">
        <div className="rounded-lg border border-white/20 bg-black/60 backdrop-blur px-4 py-2">
          <p className="text-xs text-zinc-400">Score</p>
          <p className="text-2xl font-bold text-emerald-400">{score}</p>
        </div>
        <div className="rounded-lg border border-white/20 bg-black/60 backdrop-blur px-4 py-2">
          <p className="text-xs text-zinc-400">Lives</p>
          <p
            className={`text-2xl font-bold ${lives > 1 ? "text-blue-400" : "text-red-400"}`}
          >
            {lives}
          </p>
        </div>
      </div>

      {/* QUESTION POPUP: Centered floating container */}
      {!gameOver && question && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/20 bg-black/80 backdrop-blur-sm p-8 w-full max-w-2xl">
            <div className="mb-6">
              <p className="text-xs text-zinc-400 mb-2">
                Question {Math.min(index + 1, total)} / {total}
              </p>
              <h2 className="text-xl font-semibold text-zinc-100">
                {question.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-6">
              {question.options.map((opt, idx) => {
                const active = selected === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelected(idx)}
                    disabled={gameOver}
                    className={`rounded-lg border px-4 py-3 text-left transition-all ${
                      active
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-100"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + idx)}.
                    </span>{" "}
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={restartGame}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
              >
                Exit
              </button>
              <button
                type="button"
                onClick={submitAnswer}
                disabled={selected === null}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER POPUP */}
      {gameOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/20 bg-black/90 backdrop-blur p-8 w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Game Over</h1>
            <p className="text-lg text-zinc-400 mb-6">
              Final Score:{" "}
              <span className="text-emerald-400 font-bold">{score}</span>
            </p>

            <div className="mb-6 flex justify-center gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Correct Answers</p>
                <p className="text-2xl font-bold text-emerald-400">{score}</p>
              </div>
              <div className="border-l border-white/10"></div>
              <div>
                <p className="text-zinc-500">Total Questions</p>
                <p className="text-2xl font-bold text-zinc-300">{total}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={restartGame}
              className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
