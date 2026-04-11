"use client";

import { useState } from "react";
import { sampleQuestions } from "../utils/question";

type SurvivalQuestion = (typeof sampleQuestions)[number];

export function useSurvivalGame() {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (sampleQuestions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    return sampleQuestions[randomIndex];
  });
  const [animationState, setAnimationState] = useState("run");
  const [freezeAvailable, setFreezeAvailable] = useState(1);
  const [isFrozen, setIsFrozen] = useState(false);

  function getRandomQuestion(
    excludeQuestion: SurvivalQuestion | null = null,
  ): SurvivalQuestion | null {
    if (sampleQuestions.length === 0) return null;
    if (sampleQuestions.length === 1) return sampleQuestions[0];

    let next = null;
    do {
      const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
      next = sampleQuestions[randomIndex];
    } while (next === excludeQuestion);

    return next;
  }

  function handleCorrectAnswer() {
    setScore((prev) => prev + 10);
    setAnimationState("jump");

    setTimeout(() => {
      setAnimationState("run");
    }, 500);
  }

  function handleWrongAnswer() {
    setLives((prev) => Math.max(prev - 1, 0));
    setAnimationState("stumble");

    setTimeout(() => {
      setAnimationState("run");
    }, 700);
  }

  function nextQuestion() {
    setCurrentQuestion((prev) => getRandomQuestion(prev));
  }

  function activateFreeze() {
    if (isFrozen || freezeAvailable <= 0) return;

    setFreezeAvailable((prev) => Math.max(prev - 1, 0));
    setIsFrozen(true);

    setTimeout(() => {
      setIsFrozen(false);
    }, 3000);
  }

  function resetGame() {
    setLives(3);
    setScore(0);
    setCurrentQuestion(getRandomQuestion());
    setAnimationState("run");
    setFreezeAvailable(1);
    setIsFrozen(false);
  }

  return {
    lives,
    setLives,
    score,
    setScore,
    currentQuestion,
    setCurrentQuestion,
    animationState,
    setAnimationState,
    freezeAvailable,
    setFreezeAvailable,
    isFrozen,
    setIsFrozen,
    handleCorrectAnswer,
    handleWrongAnswer,
    nextQuestion,
    activateFreeze,
    resetGame,
  };
}
