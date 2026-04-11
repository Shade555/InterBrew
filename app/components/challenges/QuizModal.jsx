"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { CompanyName, CategoryKey, COMPANY_CONFIG, CATEGORY_META, QUESTION_BANK } from '@/data/challengeData';
import { normalizeCodingScore, determineRank } from '@/utils/scorer';
import StarBorder from '../StarBorder';

/** @typedef {{q: string; options: string[]; answer: number; explanation: string}} Question */



export default function QuizModal({ company, category, questions: propQuestions, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [finalScore, setFinalScore] = useState(0);
const [quizQuestions, setQuizQuestions] = useState([]);
const timerRef = useRef(null);
const audioRef = useRef(null);

  const totalQuestions = quizQuestions.length;
  const currentQuestion = quizQuestions[currentIndex];

  useEffect(() => {
    const loadQuestions = async () => {
let qs = propQuestions || [];

      if (!qs.length) {
const companyKey = company;
const categoryKey = category;
        qs = QUESTION_BANK[companyKey]?.[categoryKey] || [];
      }

      if (qs.length > 10) {
        qs = qs.sort(() => Math.random() - 0.5).slice(0, 10);
      }

      setQuizQuestions(qs);
      setIsLoading(false);
    };

    queueMicrotask(() => loadQuestions());
  }, [company, category, propQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
    } else {
      let rawScore = 0;
      const maxRaw = totalQuestions * 10;

      userAnswers.forEach((answer, idx) => {
        if (answer === quizQuestions[idx].answer) {
          rawScore += 10;
        }
      });

      const normalized = normalizeCodingScore(rawScore, maxRaw, 150);
      setFinalScore(normalized);
      setShowResults(true);
    }
  }, [currentIndex, totalQuestions, userAnswers, quizQuestions]);

const handleAnswer = useCallback((selectedIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = selectedIndex;
    setUserAnswers(newAnswers);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    queueMicrotask(nextQuestion);
  }, [userAnswers, currentIndex, nextQuestion]);

  useEffect(() => {
    if (showResults || isLoading || currentIndex >= totalQuestions) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);

          const newAnswers = [...userAnswers];
          newAnswers[currentIndex] = -1;
          setUserAnswers(newAnswers);
          queueMicrotask(nextQuestion);

          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, showResults, isLoading, totalQuestions, userAnswers, nextQuestion]);

  // Reset timer when question changes - using useEffect with derived state
  const [, forceUpdate] = useState({});


  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswers([]);
    setTimeLeft(30);
    setShowResults(false);
    setFinalScore(0);
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const correctAnswers = userAnswers.filter((ans, idx) => ans === quizQuestions[idx]?.answer).length;
const config = COMPANY_CONFIG[company];
  const progress = ((currentIndex / totalQuestions) * 100).toFixed(0);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50">
        <div className="bg-black/80 border border-white/10 rounded-3xl p-8 text-center max-w-md w-full mx-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-white font-bold text-xl mb-2">Loading Quiz</h3>
Preparing questions...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.logo}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{company}</h2>
                <p className="text-emerald-400 text-sm font-semibold">
{CATEGORY_META[category].label}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Q{currentIndex + 1}/{totalQuestions}</span>
              <span>{correctAnswers}/{currentIndex} correct</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content and rest stays SAME */}
        
        <audio ref={audioRef} src="/click.mp3" preload="auto" />

      </div>
    </div>
  );
}