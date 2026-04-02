"use client";

import { useState, useEffect, useCallback } from "react";
import {
  QUESTION_BANK,
  COMPANY_CONFIG,
  type CompanyName,
  type CategoryKey,
} from "@/data/challengeData";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface QuizModalProps {
  company: CompanyName;
  category: CategoryKey;
  questions?: QuizQuestion[];
  onClose: () => void;
}

export function QuizModal({ company, category, questions, onClose }: QuizModalProps) {
  // Use provided questions from Supabase, or fall back to local QUESTION_BANK
  const qs = (questions && questions.length > 0) 
    ? questions 
    : (QUESTION_BANK[company]?.[category] || []);
  
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);
  const [t, setT] = useState(30);

  const co = COMPANY_CONFIG[company];
  const catLabel =
    category === "coding"
      ? "Coding & DSA"
      : category === "aptitude"
      ? "Aptitude"
      : "System Design";

  const advance = useCallback(
    (forced: number | null | undefined) => {
      const ans = forced !== undefined ? forced : sel;
      setAnswers((prev) => {
        const next = [...prev, ans];
        if (cur + 1 >= qs.length) {
          setDone(true);
        } else {
          setCur((c) => c + 1);
          setSel(null);
        }
        return next;
      });
    },
    [cur, sel, qs.length]
  );

  // Timer initialization - use a ref to track if timer should be running
  useEffect(() => {
    if (done) return;

    // Start fresh with 30 seconds
    const timerId = setInterval(() => {
      setT((prev) => {
        if (prev <= 1) {
          if (timerId) clearInterval(timerId);
          // Use callback form to avoid direct call
          setAnswers((prevAnswers) => {
            const newAnswers = [...prevAnswers, null];
            if (cur + 1 >= qs.length) {
              setDone(true);
            } else {
              setCur((c) => c + 1);
              setSel(null);
            }
            return newAnswers;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, done]);

  // Guard against empty questions - must be after hooks
  if (!qs.length) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="rounded-2xl w-full max-w-xl p-8 text-center"
          style={{
            background: "#0e1420",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4">No Questions Available</h2>
          <p className="text-gray-400 mb-6">
            There are no questions available for {company} - {catLabel}.
          </p>
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-lg font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const pick = (i: number) => {
    if (sel !== null) return;
    setSel(i);
  };

  const score = answers.filter((a, i) => a === qs[i]?.answer).length;
  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0;
  const q = qs[cur];
  const prog = qs.length ? (cur / qs.length) * 100 : 0;
  const timerWarn = t <= 10;

  if (done) {
    const pass = pct >= 70;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="rounded-2xl w-full max-w-xl overflow-hidden"
          style={{
            background: "#0e1420",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="p-8 text-center"
            style={{
              background: `linear-gradient(135deg,${co.a}22,${co.b}11)`,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-22 h-22 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: pass
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "linear-gradient(135deg,#ef4444,#dc2626)",
              }}
            >
              <span className="text-4xl font-extrabold text-white">
                {pct}%
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              {pass ? "Excellent Work!" : "Keep Practicing"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {company} · {catLabel}
            </p>
            <div className="flex justify-center gap-8 mt-5">
              {[
                { v: `${score}/${qs.length}`, l: "Correct" },
                { v: `${score * 10}`, l: "Points" },
                { v: `${pct}%`, l: "Score" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: co.a }}
                  >
                    {s.v}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="p-5 overflow-y-auto"
            style={{ maxHeight: "14rem" }}
          >
            {qs.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <div
                  key={i}
                  className="rounded-xl p-3 mb-2"
                  style={{
                    background: ok
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(239,68,68,0.08)",
                  }}
                >
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {i + 1}. {q.q}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: ok ? "#34d399" : "#f87171",
                    }}
                  >
                    {ok
                      ? "✓ Correct"
                      : `✗ ${
                          answers[i] !== null
                            ? q.options[answers[i]!]
                            : "Timed out"
                        } → ${q.options[q.answer]}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="p-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-semibold"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setCur(0);
                setAnswers([]);
                setSel(null);
                setDone(false);
                setT(30);
              }}
              className="flex-1 py-3 rounded-lg font-bold text-white"
              style={{
                background: `linear-gradient(135deg,${co.a},${co.b})`,
              }}
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="rounded-2xl w-full max-w-xl overflow-hidden"
        style={{
          background: "#0e1420",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="p-5"
          style={{
            background: `linear-gradient(135deg,${co.a}20,${co.b}15)`,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="font-bold text-white">{company}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {catLabel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs"
                style={{
                  background: timerWarn
                    ? "linear-gradient(135deg,#ef4444,#dc2626)"
                    : "rgba(255,255,255,0.08)",
                  color: "white",
                  border: `1px solid ${
                    timerWarn ? "#ef4444" : "rgba(255,255,255,0.12)"
                  }`,
                }}
              >
                {t}s
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground bg-none border-none cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: `linear-gradient(90deg,${co.a},${co.b})`,
                width: `${prog}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Question {cur + 1} of {qs.length}
          </p>
        </div>
        <div className="p-6">
          <p className="font-semibold text-white mb-5 leading-relaxed">
            {q.q}
          </p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => {
              let bg = "transparent";
              let bdr = "rgba(255,255,255,0.08)";
              let tc = "white";

              if (sel !== null) {
                if (i === q.answer) {
                  bg = "rgba(16,185,129,0.1)";
                  bdr = "#34d399";
                  tc = "#34d399";
                } else if (i === sel) {
                  bg = "rgba(239,68,68,0.1)";
                  bdr = "#f87171";
                  tc = "#f87171";
                } else {
                  tc = "rgba(255,255,255,0.4)";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={sel !== null}
                  className="w-full text-left p-4 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  style={{
                    background: bg,
                    border: `1.5px solid ${bdr}`,
                    color: tc,
                  }}
                >
                  <span
                    className="font-bold mr-2"
                    style={{
                      color:
                        sel === null
                          ? "rgba(255,255,255,0.5)"
                          : tc,
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {sel !== null && (
            <div
              className="mt-4 p-4 rounded-lg text-sm"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#a5b4fc",
              }}
            >
              <span className="font-bold">💡 </span>
              {q.explanation}
            </div>
          )}
          <button
            onClick={() => advance(undefined)}
            disabled={sel === null}
            className="w-full mt-4 p-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                sel !== null
                  ? `linear-gradient(135deg,${co.a},${co.b})`
                  : "rgba(255,255,255,0.04)",
              color: sel !== null ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            {cur + 1 === qs.length ? "See Results →" : "Next Question →"}
          </button>
        </div>
      </div>
    </div>
  );
}


