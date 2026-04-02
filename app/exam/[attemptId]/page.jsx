"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ExamPage() {
  const { attemptId } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

const autoSubmit = async () => {
    await supabase
      .from("attempts")
      .update({
        status: "expired",
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    router.push(`/result/${attemptId}`);
  };

  const startTimer = (expiresAt) => {
    if (!expiresAt) return;
    // clear existing timer if present
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = Math.floor((expiry - now) / 1000);

      if (diff <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        autoSubmit();
      } else {
        // only update state when component is still mounted
        if (mountedRef.current) setTimeLeft(diff);
      }
    }, 1000);
  };

  const loadExam = async () => {
    try {
const { data: attemptData, error: attemptErr } = await supabase
        .from("attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (attemptErr || !attemptData) {
        router.push("/challenge");
        return;
      }

      if (attemptData.status === "completed") {
        router.push(`/result/${attemptId}`);
        return;
      }

      // Only set state if still mounted to avoid cascading renders after unmount
      if (mountedRef.current) setAttempt(attemptData);

const { data: questionData, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("challenge_set_id", attemptData.challenge_set_id);

      if (qErr) {
        console.error(qErr);
      }

      if (mountedRef.current) {
        setQuestions(questionData || []);
        setLoading(false);
      }

      // Start timer only after component is mounted and state updates deferred
      if (mountedRef.current) startTimer(attemptData.expires_at);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Defer loadExam to next microtask to avoid synchronous setState within the effect
  useEffect(() => {
    (async () => {
      await Promise.resolve();
      if (mountedRef.current) await loadExam();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="text-white p-8">Loading exam...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Exam in Progress</h1>

      <div className="mb-6">
        Time Left:{" "}
        {timeLeft ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` : "Loading..."}
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6 p-4 bg-gray-900 rounded-lg">
          <p className="mb-3">
            {index + 1}. {q.question_text}
          </p>

          {["A", "B", "C", "D"].map((opt) => (
            <button key={opt} className="block w-full text-left p-2 mb-2 bg-gray-800 rounded">
              {q[`option_${opt.toLowerCase()}`]}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}