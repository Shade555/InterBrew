"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Groq } from 'groq-sdk';
import { osQuestions, OSQuestion, getRandomQuestions } from '../../data/osQuestions'; // reuse existing

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ 
  apiKey: GROQ_API_KEY!, 
  dangerouslyAllowBrowser: typeof window !== 'undefined' 
});

interface PvPTournamentProps {
  onClose: () => void;
  onScoreUpdate: (score: number) => void; // callback for leaderboard
}

const PvPTournamentPanel: React.FC<PvPTournamentProps> = ({ onClose, onScoreUpdate }) => {
  const [step, setStep] = useState<'waiting' | 'playing' | 'results'>('waiting');
  const [countdown, setCountdown] = useState(5);
  const [questions, setQuestions] = useState<OSQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState('Player2');
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'waiting' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => timer && clearTimeout(timer);
  }, [step, countdown]);

  const startMatch = useCallback(() => {
    const selectedQuestions = getRandomQuestions(3);
    setQuestions(selectedQuestions);
    setUserAnswers(new Array(3).fill(''));
    setOpponentName(['Alex', 'Sarah', 'Mike'][Math.floor(Math.random() * 3)]);
    setStep('playing');
  }, []);

  useEffect(() => {
    if (step === 'waiting' && countdown === 0) {
      setTimeout(startMatch, 0);
    }
  }, [countdown]);

  const submitAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('results');
      judgeAnswers(newAnswers);
    }
  };

  const judgeAnswers = async (answers: string[]) => {
    let totalUserScore = 0;
    let totalOpponentScore = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAns = answers[i] || '';
      // Mock opponent answer (close to correct but different)
      const opponentAns = question.question.substring(0, 50) + (i % 2 === 0 ? ' slightly different approach' : '');
      
      try {
        const prompt = `OS THEORY JUDGING (0-10 score each):
Question: ${question.question}

User Answer: ${userAns}
Opponent Answer: ${opponentAns}

Score BOTH answers 0-10 for accuracy, completeness, OS knowledge.
Return ONLY JSON: {"userScore": number, "opponentScore": number}`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          try {
            const json = JSON.parse(response);
            totalUserScore += json.userScore || 0;
            totalOpponentScore += json.opponentScore || 0;
          } catch {
            // Fallback scores
            totalUserScore += Math.random() * 8 + 2;
            totalOpponentScore += Math.random() * 8 + 2;
          }
        }
      } catch {
        // Fallback
        totalUserScore += Math.random() * 8 + 2;
        totalOpponentScore += Math.random() * 8 + 2;
      }
    }
    
    setUserScore(Math.round(totalUserScore));
    setOpponentScore(Math.round(totalOpponentScore));
    
    // Update leaderboard (localStorage mock)
    onScoreUpdate(totalUserScore);
  };

  const getLetter = (index: number) => String.fromCharCode(65 + index);

  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-emerald-600/5 border border-emerald-400/20 backdrop-blur-xl text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
          <div className="text-3xl font-mono font-bold text-emerald-400 mb-8 animate-pulse">
            {countdown}
          </div>
          <div className="text-sm text-gray-300 mb-6">OS Tournament - 3 questions</div>
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || { question: '' };

  if (step === 'playing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-2xl p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">OS PvP Tournament</h2>
              <p className="text-sm opacity-75">
                Q {currentQuestionIndex + 1}/3 vs {opponentName}
              </p>
            </div>
            <button onClick={onClose} className="px-4 py-1 rounded-lg bg-white/10 hover:bg-white/20">×</button>
          </div>

          <div className="space-y-6 mb-8">
            <div className="text-lg leading-relaxed">
              {currentQuestion.question}
            </div>
            <div className="text-xs opacity-75 italic mb-4 p-4 bg-slate-800/50 rounded-lg">
              Write detailed explanation (2-4 sentences). Time unlimited but submit when ready.
            </div>
          </div>

          <textarea
            value={userAnswers[currentQuestionIndex]}
            onChange={(e) => {
              const newAnswers = [...userAnswers];
              newAnswers[currentQuestionIndex] = e.target.value;
              setUserAnswers(newAnswers);
            }}
            placeholder="Your OS theory explanation..."
            className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white min-h-[160px] resize-vertical"
            autoFocus
          />

          <button
            onClick={() => submitAnswer(userAnswers[currentQuestionIndex])}
            disabled={!userAnswers[currentQuestionIndex].trim()}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            {currentQuestionIndex < 2 ? 'Next Question →' : 'Submit & Judge →'}
          </button>
        </div>
      </div>
    );
  }

  // Results
  const isWin = userScore > opponentScore;
  const isDraw = userScore === opponentScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-purple-500/10 border-2 border-gradient-to-r from-emerald-400 to-purple-400 backdrop-blur-xl text-center">
        <div className={`text-5xl mb-6 p-4 rounded-2xl mx-auto mb-8 ${isWin ? 'bg-emerald-500/20 text-emerald-400 animate-bounce' : isDraw ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
          {isWin ? '🏆' : isDraw ? '🤝' : '🥈'}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          {isWin ? 'Victory!' : isDraw ? 'Draw!' : 'Good Fight!'}
        </h2>
        <p className="text-lg opacity-90 mb-8">
          {isWin ? `You defeated ${opponentName}!` : isDraw ? 'Perfect match!' : `${opponentName} takes the win!`}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-slate-800/50 rounded-xl">
          <div>
            <p className="text-sm opacity-75">You</p>
            <p className="text-3xl font-bold text-emerald-400">{userScore}</p>
          </div>
          <div>
            <p className="text-sm opacity-75">{opponentName}</p>
            <p className="text-3xl font-bold text-purple-400">{opponentScore}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl bg-slate-700/50 border border-slate-500/50 text-white font-bold hover:bg-slate-600/50 transition-all"
          >
            Finish
          </button>
          <button 
            onClick={() => {
              setStep('waiting');
              setCountdown(5);
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
};

export default PvPTournamentPanel;

