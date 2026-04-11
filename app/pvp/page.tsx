"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function PvP() {
  const [mode, setMode] = useState<'voice'>('voice');
  const [stage, setStage] = useState<'select' | 'matchmaking' | 'ready' | 'playing' | 'result'>('select');
  
  interface Opponent { 
    name: string; 
    rating: number 
  }
  const [opponent, setOpponent] = useState<Opponent | null>(null);

  // Voice mode state
  const [voiceQuestionIndex, setVoiceQuestionIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [voiceScore, setVoiceScore] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // No survive mode state



  // Voice questions
  const VOICE_QUESTIONS = [
    'What is a process in operating system?',
    'Explain deadlock and its conditions.',
    'What is virtual memory?',
    'Difference between process and thread?',
    'Explain CPU scheduling algorithms.'
  ];

  useEffect(() => {
    if (stage === 'matchmaking') {
      const timer = setTimeout(() => {
        setOpponent({
          name: 'Player_' + Math.floor(Math.random() * 1000),
          rating: Math.floor(Math.random() * 2000),
        });
        setStage('ready');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      speechSynthesis.speak(utterance);
    });
  };

  const startVoiceQuestion = async () => {
    const q = VOICE_QUESTIONS[voiceQuestionIndex];
    setQuestion(q);
    setAiSpeaking(true);
    await speak(q);
    setAiSpeaking(false);
    startVoiceListening();
  };

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      await voiceEvaluateAnswer(text);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const voiceEvaluateAnswer = async (answer: string) => {
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      const data = await res.json();
      setVoiceScore((prev) => prev + (data.score || 0));

      if (voiceQuestionIndex < VOICE_QUESTIONS.length - 1) {
        setTimeout(() => setVoiceQuestionIndex((prev) => prev + 1), 1500);
      } else {
        setStage('result');
      }
    } catch (err) {
      console.error(err);
    }
  };









  const startGame = () => {
    setOpponent({
      name: 'Player_' + Math.floor(Math.random() * 1000),
      rating: Math.floor(Math.random() * 2000),
    });
    setStage('matchmaking');
  };

  useEffect(() => {
    if (stage === 'ready') {
      const timer = setTimeout(() => setStage('playing'), 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'playing' && mode === 'voice') {
      const timer = setTimeout(startVoiceQuestion, 500);
      return () => clearTimeout(timer);
    }
  }, [voiceQuestionIndex, stage, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-500 bg-clip-text text-transparent mb-4 tracking-tight">
            ⚔️ PvP Arena
          </h1>
          <p className="text-xl text-gray-300">Battle AI opponents in OS challenges</p>
        </div>

        {stage === 'select' && (
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-emerald-500/30 shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Choose Game Mode
            </h2>
            <button
                onClick={() => startGame()}
                className="mx-auto group bg-gradient-to-r from-emerald-500/20 hover:from-emerald-500/40 border-2 border-emerald-400/50 p-8 rounded-2xl text-left transition-all hover:scale-105 shadow-emerald-500/20 hover:shadow-emerald-500/40 w-full md:w-auto"
              >
                <div className="text-4xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold mb-2 text-emerald-300">Voice Battle</h3>
                <p className="text-lg text-emerald-200 mb-4">5 open-ended OS questions via speech</p>
                <span className="px-4 py-1 bg-emerald-500/20 rounded-full text-emerald-300 text-sm font-bold">Voice Only</span>
              </button>
          </div>
        )}

        {stage === 'matchmaking' && (
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full mx-auto mb-6 animate-spin shadow-lg" />
            <h2 className="text-2xl font-bold mb-2 text-emerald-400">Finding opponent...</h2>
            <p className="text-gray-400 text-lg">Voice Battle</p>
          </div>
        )}

        {stage === 'ready' && opponent && (
          <div className="text-center space-y-6">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold mb-4 text-emerald-400">🎉 Match Found!</h2>
              <div className="space-y-2">
                <p className="text-xl">You vs <span className="text-emerald-400 font-bold">{opponent.name}</span></p>
                <p className="text-lg text-emerald-300 font-mono">Rating: {opponent.rating}</p>
                <p className="text-lg font-bold text-emerald-400">
                  Voice Battle
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full animate-bounce mx-auto shadow-lg" />
          </div>
        )}

        {stage === 'playing' && mode === 'voice' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl p-4 rounded-2xl">
              <span className="text-lg font-bold">Q{voiceQuestionIndex + 1}/5</span>
              <span className="text-2xl font-bold text-emerald-400">Score: {voiceScore}</span>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-700/20 border-2 border-emerald-500/30 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-white">'{question}'</h3>
              {aiSpeaking && (
                <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
                  AI speaking...
                </div>
              )}
            </div>

            <div className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-400/30">
              <p className="text-sm font-semibold text-gray-300 mb-2">Your Answer:</p>
              <div className="p-4 bg-white/10 rounded-xl min-h-16 text-lg">
                {transcript || <span className="text-gray-500 italic">Click to speak</span>}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startVoiceListening}
                className="flex-1 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all border border-emerald-400/50"
              >
                🎤 Speak Now
              </button>
              <button
                onClick={() => speechSynthesis.cancel()}
                className="p-4 bg-gray-700/50 text-gray-300 border border-gray-600 rounded-2xl font-bold hover:bg-gray-600 transition-all"
              >
                Stop Voice
              </button>
            </div>
          </div>
        )}



        {stage === 'result' && (
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-4">
              Voice Victory!
            </h1>
            <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl border border-emerald-500/30 shadow-2xl">
              <p className="text-6xl font-mono font-black text-emerald-400 mb-6">{voiceScore}</p>
              <p className="text-2xl font-bold text-gray-300 mb-2">
                Voice Score
              </p>

            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black text-lg shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all border border-emerald-400/50"
              >
                Play Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-12 py-4 bg-emerald-600/80 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all border border-emerald-400/50"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



