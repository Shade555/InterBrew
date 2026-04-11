"use client";

import React, { useState, useEffect, useRef } from "react";

export default function PvP() {
  const [stage, setStage] = useState("select");
  const [voiceQuestionIndex, setVoiceQuestionIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [voiceScore, setVoiceScore] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [opponent, setOpponent] = useState(null);

  // ✅ NEW: store answers
  const [answers, setAnswers] = useState([]);

  const recognitionRef = useRef(null);

  const VOICE_QUESTIONS = [
    "What is a process in operating system?",
    "Explain deadlock and its conditions.",
    "What is virtual memory?",
    "Difference between process and thread?",
    "Explain CPU scheduling algorithms.",
  ];

  useEffect(() => {
    if (stage === "matchmaking") {
      const timer = setTimeout(() => {
        setOpponent({
          name: "Player_" + Math.floor(Math.random() * 1000),
          rating: Math.floor(Math.random() * 2000),
        });
        setStage("ready");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const speak = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  };

  const startVoiceQuestion = async () => {
    const q = VOICE_QUESTIONS[voiceQuestionIndex];
    setQuestion(q);
    setAiSpeaking(true);
    await speak(q);
    setAiSpeaking(false);
  };

  const startVoiceListening = () => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Google Chrome for voice support");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      voiceEvaluateAnswer(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // ✅ UPDATED: evaluation with feedback
  const voiceEvaluateAnswer = (answer) => {
    const score = Math.floor(Math.random() * 10) + 1;

    let feedback = "";
    let correct = false;

    if (answer.length < 10) {
      feedback = "Answer too short. Try explaining more.";
    } else if (answer.toLowerCase().includes("process")) {
      feedback = "Good answer. Key concept mentioned.";
      correct = true;
    } else {
      feedback = "Missing key concepts. Needs improvement.";
    }

    // ✅ STORE ANSWER
    setAnswers((prev) => [
      ...prev,
      {
        question,
        answer,
        score,
        feedback,
        correct,
      },
    ]);

    setVoiceScore((prev) => prev + score);

    if (voiceQuestionIndex < VOICE_QUESTIONS.length - 1) {
      setTimeout(() => {
        setVoiceQuestionIndex((prev) => prev + 1);
        setTranscript(""); // reset transcript
      }, 1200);
    } else {
      setStage("result");
    }
  };

  const startGame = () => setStage("matchmaking");

  useEffect(() => {
    if (stage === "ready") {
      const t = setTimeout(() => setStage("playing"), 1500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "playing") {
      const t = setTimeout(() => startVoiceQuestion(), 300);
      return () => clearTimeout(t);
    }
  }, [voiceQuestionIndex, stage]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.1),transparent_40%)]" />
      <div className="absolute inset-0 backdrop-blur-[80px]" />

      <div className="relative max-w-2xl mx-auto p-8 space-y-8">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent">
            ⚔️ PvP Arena
          </h1>
        </div>

        {/* SELECT */}
        {stage === "select" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
            <button
              onClick={startGame}
              className="w-full p-8 rounded-2xl bg-emerald-500/10 border border-emerald-400/30"
            >
              🎤 Voice Battle
            </button>
          </div>
        )}

        {/* MATCHMAKING */}
        {stage === "matchmaking" && (
          <div className="text-center text-emerald-400">
            Finding opponent...
          </div>
        )}

        {/* READY */}
        {stage === "ready" && opponent && (
          <div className="text-center text-white">
            You vs {opponent.name}
          </div>
        )}

        {/* PLAYING */}
        {stage === "playing" && (
          <div className="space-y-6">
            <div className="flex justify-between bg-white/5 p-4 rounded-2xl">
              <span>Q{voiceQuestionIndex + 1}/5</span>
              <span>{voiceScore}</span>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl">
              {question}
            </div>

            <div className="bg-black/40 p-4 rounded-xl">
              {transcript || "Speak..."}
            </div>

            <button
              onClick={startVoiceListening}
              className="w-full p-4 bg-emerald-500 rounded-xl"
            >
              🎤 Speak
            </button>
          </div>
        )}

        {/* ✅ RESULT PAGE */}
        {stage === "result" && (
          <div className="space-y-6">

            <div className="text-center">
              <h1 className="text-4xl text-emerald-400">🏆 Result</h1>
              <p className="text-5xl text-white">{voiceScore}</p>
            </div>

            {/* Answers */}
            {answers.map((a, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 p-5 rounded-2xl"
              >
                <p className="text-emerald-400 font-bold">
                  Q{i + 1}: {a.question}
                </p>

                <p className="text-gray-300 mt-2">
                  Your Answer: {a.answer}
                </p>

                <p
                  className={`mt-2 ${
                    a.correct ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {a.correct ? "✔ Good" : "❌ Needs Improvement"}
                </p>

                <p className="text-yellow-400 text-sm">
                  {a.feedback}
                </p>

                <p className="text-gray-400 text-sm">
                  Score: {a.score}
                </p>
              </div>
            ))}

            {/* Improvement */}
            <div className="bg-emerald-500/10 p-4 rounded-xl">
              <h3 className="text-emerald-400 mb-2">
                📈 Improve On:
              </h3>
              <ul className="list-disc pl-5 text-gray-300">
                {answers
                  .filter((a) => !a.correct)
                  .map((a, i) => (
                    <li key={i}>{a.question}</li>
                  ))}
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full p-3 bg-emerald-500 rounded-xl"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}