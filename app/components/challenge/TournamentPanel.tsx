"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Groq } from 'groq-sdk';
import { osQuestions, OSQuestion, getRandomQuestions } from '../data/osQuestions';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ 
  apiKey: GROQ_API_KEY!, 
  dangerouslyAllowBrowser: typeof window !== 'undefined' 
});

interface PvPTournamentProps {
  onClose: () => void;
  onScoreUpdate: (score: number) => void;
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
            totalUserScore += Math.random() * 8 + 2;
            totalOpponentScore += Math.random() * 8 + 2;
          }
        }
      } catch {
        totalUserScore += Math.random() * 8 + 2;
        totalOpponentScore += Math.random() * 8 + 2;
      }
    }
    
    setUserScore(Math.round(totalUserScore));
    setOpponentScore(Math.round(totalOpponentScore));
    onScoreUpdate(totalUserScore);
  };

  // Shared styles
  const gridPattern = {
    backgroundImage: `
      linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  };

  const scanlineOverlay = (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.015]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
      }}
    />
  );

  if (step === 'waiting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div 
          className="relative w-full max-w-md overflow-hidden rounded-lg border border-emerald-500/30 bg-[#0a0f0a] shadow-2xl shadow-emerald-500/10"
          style={gridPattern}
        >
          {scanlineOverlay}
          
          {/* Header bar */}
          <div className="relative flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-500/70">Matchmaking</span>
            </div>
            <span className="text-xs font-mono text-emerald-500/50">LIVE</span>
          </div>

          <div className="relative p-8 text-center">
            {/* Radar animation */}
            <div className="relative mx-auto mb-8 h-32 w-32">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/30" />
              <div className="absolute inset-8 rounded-full border border-emerald-500/40" />
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.3) 60deg, transparent 60deg)',
                  animation: 'spin 2s linear infinite',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-4xl font-bold text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  {countdown}
                </span>
              </div>
            </div>

            <h2 className="mb-2 font-mono text-lg font-semibold uppercase tracking-wider text-emerald-400">
              Scanning Network
            </h2>
            <p className="mb-1 text-sm text-emerald-500/60">Locating opponent...</p>
            
            {/* Fake loading bars */}
            <div className="mx-auto mt-6 max-w-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500/50">
                <span>PING</span>
                <div className="flex-1 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-emerald-500/40 animate-pulse rounded-full" />
                </div>
                <span>24ms</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500/50">
                <span>SYNC</span>
                <div className="flex-1 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: `${(5 - countdown) * 20}%`, transition: 'width 1s linear' }} />
                </div>
                <span>{(5 - countdown) * 20}%</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-mono text-emerald-500/40">
              <span>◆ 3 ROUNDS</span>
              <span>◆ OS THEORY</span>
              <span>◆ RANKED</span>
            </div>

            <button 
              onClick={onClose} 
              className="mt-8 px-6 py-2 rounded border border-emerald-500/30 bg-emerald-500/5 text-sm font-mono uppercase tracking-wider text-emerald-500/70 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || { question: '' };

  if (step === 'playing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div 
          className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-emerald-500/30 bg-[#0a0f0a] shadow-2xl shadow-emerald-500/10"
          style={gridPattern}
        >
          {scanlineOverlay}

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-500/70">Live Match</span>
              </div>
              <div className="h-4 w-px bg-emerald-500/20" />
              <span className="text-xs font-mono text-emerald-400">vs {opponentName}</span>
            </div>
            <button 
              onClick={onClose} 
              className="flex h-6 w-6 items-center justify-center rounded border border-emerald-500/30 text-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
            >
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative h-1 bg-emerald-500/10">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${((currentQuestionIndex + 1) / 3) * 100}%` }}
            />
          </div>

          <div className="relative p-6">
            {/* Question number indicator */}
            <div className="mb-6 flex items-center gap-3">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded border font-mono text-sm transition-all duration-300 ${
                    i === currentQuestionIndex 
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                      : i < currentQuestionIndex 
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500/70' 
                        : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/30'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
              <div className="ml-auto text-xs font-mono text-emerald-500/50">
                ROUND {currentQuestionIndex + 1}/3
              </div>
            </div>

            {/* Question */}
            <div className="mb-6 rounded border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-500/50">
                <span>▸</span>
                <span>Query</span>
              </div>
              <p className="text-lg leading-relaxed text-emerald-100">
                {currentQuestion.question}
              </p>
            </div>

            {/* Input area */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-xs font-mono text-emerald-500/50">
                <span className="uppercase tracking-wider">Response Terminal</span>
                <span>{userAnswers[currentQuestionIndex]?.length || 0} chars</span>
              </div>
              <textarea
                value={userAnswers[currentQuestionIndex]}
                onChange={(e) => {
                  const newAnswers = [...userAnswers];
                  newAnswers[currentQuestionIndex] = e.target.value;
                  setUserAnswers(newAnswers);
                }}
                placeholder="Enter your analysis..."
                className="w-full min-h-[140px] resize-none rounded border border-emerald-500/30 bg-black/50 p-4 font-mono text-emerald-100 placeholder-emerald-500/30 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                autoFocus
              />
            </div>

            {/* Submit button */}
            <button
              onClick={() => submitAnswer(userAnswers[currentQuestionIndex])}
              disabled={!userAnswers[currentQuestionIndex]?.trim()}
              className="group relative w-full overflow-hidden rounded border border-emerald-500/50 bg-emerald-500/10 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-emerald-400 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/10 disabled:hover:border-emerald-500/50 disabled:hover:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {currentQuestionIndex < 2 ? (
                  <>Execute & Continue <span className="text-emerald-500/70">→</span></>
                ) : (
                  <>Submit for Analysis <span className="text-emerald-500/70">◆</span></>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results
  const isWin = userScore > opponentScore;
  const isDraw = userScore === opponentScore;
  const scoreDiff = userScore - opponentScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-emerald-500/30 bg-[#0a0f0a] shadow-2xl shadow-emerald-500/10"
        style={gridPattern}
      >
        {scanlineOverlay}

        {/* Header */}
        <div className={`relative border-b px-4 py-3 ${
          isWin ? 'border-emerald-500/30 bg-emerald-500/10' : isDraw ? 'border-amber-500/30 bg-amber-500/10' : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isWin ? 'bg-emerald-500' : isDraw ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className={`text-xs font-mono uppercase tracking-widest ${
              isWin ? 'text-emerald-500/70' : isDraw ? 'text-amber-500/70' : 'text-red-500/70'
            }`}>
              Match Complete
            </span>
          </div>
        </div>

        <div className="relative p-8">
          {/* Result indicator */}
          <div className="mb-8 text-center">
            <div className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 ${
              isWin 
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' 
                : isDraw 
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/20' 
                  : 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20'
            }`}>
              <span className="text-4xl">
                {isWin ? '▲' : isDraw ? '◆' : '▼'}
              </span>
            </div>
            <h2 className={`mb-1 font-mono text-2xl font-bold uppercase tracking-wider ${
              isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400'
            }`}>
              {isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
            </h2>
            <p className="text-sm text-emerald-500/60">
              {isWin ? `Outperformed ${opponentName}` : isDraw ? 'Evenly matched' : `${opponentName} wins this round`}
            </p>
          </div>

          {/* Score display */}
          <div className="mb-8 rounded border border-emerald-500/20 bg-black/30 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="mb-1 text-xs font-mono uppercase tracking-wider text-emerald-500/50">You</p>
                <p className="font-mono text-3xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {userScore}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className={`rounded px-3 py-1 font-mono text-sm font-bold ${
                  scoreDiff > 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : scoreDiff < 0 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-mono uppercase tracking-wider text-emerald-500/50">{opponentName}</p>
                <p className="font-mono text-3xl font-bold text-emerald-500/70">
                  {opponentScore}
                </p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs font-mono text-emerald-500/50">
              <span>Performance</span>
              <span>{Math.round((userScore / 30) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-500/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${(userScore / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 rounded border border-emerald-500/30 bg-emerald-500/5 py-3 font-mono text-sm uppercase tracking-wider text-emerald-500/70 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200"
            >
              Exit
            </button>
            <button 
              onClick={() => {
                setStep('waiting');
                setCountdown(5);
                setCurrentQuestionIndex(0);
                setUserScore(0);
                setOpponentScore(0);
              }}
              className="flex-1 rounded border border-emerald-500/50 bg-emerald-500/20 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
            >
              Rematch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PvPTournamentPanel;
