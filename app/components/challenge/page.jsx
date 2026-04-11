"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizModal from "../challenges/QuizModal";
import { supabase } from "@/lib/supabaseClient";
import { fetchChallengeSetByCompany, fetchQuestionsByChallengeSetId } from "@/lib/challengeSets";
import {
  COMPANIES, COMPANY_CONFIG, QUESTION_BANK, CATEGORY_META,
  LIVE_SESSIONS,
} from "@/data/challengeData";
import StarBorder from "../StarBorder";
import TournamentPanel from "./TournamentPanel";

export default function ChallengesPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [co, setCo] = useState("Google");
  const [activeTab, setActiveTab] = useState("live");
  const [pvpSubject, setPvpSubject] = useState("os");
  
  // State for Supabase questions
  const [supabaseQuestions, setSupabaseQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Use lazy initialization to load from localStorage without useEffect
  const [registeredSessions, setRegisteredSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("registeredSessions");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Mock PvP stats from localStorage (client-safe) - lazy init
  const [pvpStats, setPvpStats] = useState(() => {
    if (typeof window === 'undefined') return { wins: 3, totalMatches: 8, winRate: 38, rank: 12 };
    try {
      const leaderboard = JSON.parse(localStorage.getItem('mockLeaderboard') || '[]');
      const userEntry = leaderboard.find((entry) => entry.user_name === 'Player1') || { score: 0, challenges: 0 };
      const totalMatches = userEntry.challenges || 0;
      const wins = Math.floor(totalMatches * 0.65);
      const rank = Math.floor(Math.random() * 15) + 1;
      return { wins, totalMatches, winRate: totalMatches ? Math.round((wins / totalMatches) * 100) : 0, rank };
    } catch {
      return { wins: 3, totalMatches: 8, winRate: 38, rank: 12 };
    }
  });

  // Fetch questions from Supabase for a company
  const loadQuestionsFromSupabase = async (company) => {
    console.log("Loading questions from Supabase for:", company);
    console.log("Supabase client available:", !!supabase);
    
    if (!supabase) {
      console.log("Supabase not configured - using local data");
      return; 
    }
    
    if (supabaseQuestions[company]) {
      console.log("Questions already loaded for:", company);
      return; 
    }
    
    try {
      setLoadingQuestions(true);
      console.log("Fetching challenge set for company:", company);
      const challengeSet = await fetchChallengeSetByCompany(supabase, company);
      console.log("Challenge set result:", challengeSet);
      
      if (challengeSet) {
        console.log("Fetching questions for challenge set ID:", challengeSet.id);
        const questions = await fetchQuestionsByChallengeSetId(supabase, challengeSet.id);
        console.log("Questions fetched:", questions?.length);
        
        if (questions && questions.length > 0) {
          const transformedQuestions = {
            coding: [],
            aptitude: [],
            system: []
          };
          
          questions.forEach(q => {
            const category = q.category || 'coding';
            if (transformedQuestions[category]) {
              transformedQuestions[category].push({
                q: q.question_text,
                options: [q.option_a, q.option_b, q.option_c, q.option_d],
                answer: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer),
                explanation: q.explanation || ''
              });
            }
          });
          
          setSupabaseQuestions(prev => ({
            ...prev,
            [company]: transformedQuestions
          }));
        }
      }
    } catch (err) {
      console.error("Error loading questions from Supabase:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartQuiz = async (company, category) => {
    if (!supabaseQuestions[company]) {
      await loadQuestionsFromSupabase(company);
    }
    setQuiz({ company, category });
  };

  const isRegistered = (session) => {
    return registeredSessions.some(
      (r) => r.company === session.company && r.time === session.time
    );
  };

  const handleJoinLive = (session) => {
    router.push(`/exam/test?company=${session.company}`);
  };

  const handleRegister = (session) => {
    const newRegistration = {
      company: session.company,
      time: session.time,
      topic: session.topic,
      registeredAt: new Date().toISOString(),
    };
    
    const updated = [...registeredSessions, newRegistration];
    setRegisteredSessions(updated);
    localStorage.setItem("registeredSessions", JSON.stringify(updated));
    
    alert(`✅ Registered for ${session.company} - ${session.topic}!\\n\\nWe'll remind you before the session starts.`);
  };

  return (
    <div className="relative min-h-screen bg-black/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {quiz && (
        <QuizModal 
          company={quiz.company} 
          category={quiz.category} 
          questions={supabaseQuestions[quiz.company]?.[quiz.category]} 
          onClose={() => setQuiz(null)} 
        />
      )}

      {tournamentOpen && (
        <TournamentPanel 
          onClose={() => setTournamentOpen(false)} 
          onScoreUpdate={(score) => {
            const userName = 'Player1';
            const leaderboard = JSON.parse(localStorage.getItem('mockLeaderboard') || '[]');
            const existing = leaderboard.find((entry) => entry.user_name === userName);
            if (existing) {
              existing.score = (existing.score || 0) + score;
            } else {
              leaderboard.push({ rank: leaderboard.length + 1, user_name: userName, score, challenges: 1, accuracy: 85 });
            }
            localStorage.setItem('mockLeaderboard', JSON.stringify(leaderboard));
            console.log('Leaderboard updated:', leaderboard);
          }}
        />
      )}

      <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ⚡ Challenge Arena
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">Live Interviews | Practice | PvP Tournaments</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { key: "live", label: " Live Interviews" },
            { key: "practice", label: " Practice" },
            { key: "pvp", label: "⚔️ PvP Tournaments" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full space-y-8">
          {activeTab === "live" && (
            <div className="challenge-column transition-all duration-300">
              <div className="challenge-column-header">
                <span className="text-2xl">🎙️</span>
                Live Interviews
              </div>

              {/* Live banner */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">● LIVE NOW</span>
                      <span className="text-xs text-gray-400">47 participants</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Netflix System Design Deep Dive</h3>
                    <p className="text-sm text-gray-400">Hosted by Tech Prep Pro · Started 12 mins ago</p>
                  </div>
                  <button 
                    onClick={() => router.push('/exam/test?company=Netflix')} 
                    className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-all"
                  >
                    Join Now →
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-300 mb-3">Upcoming Sessions</h3>
              <div className="space-y-3">
                {LIVE_SESSIONS.filter(s => !s.live).map((s, i) => {
                  const cc = COMPANY_CONFIG[s.company];
                  return (
                    <div key={i} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cc.logo}</span>
                          <div>
                            <p className="text-sm font-bold text-white">{s.company}</p>
                            <p className="text-xs text-gray-400">{s.role}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{s.participants} going</span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-2">{s.topic}</p>
                      <p className="text-xs text-gray-400 mb-4">🕐 {s.time} · {s.host}</p>
                      <button 
                        onClick={() => handleRegister(s)} 
                        disabled={isRegistered(s)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          isRegistered(s) 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {isRegistered(s) ? '✓ Registered' : 'Register & Remind Me'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[{v: "24", l: "Sessions This Month", i: "📅"}, {v: "4.8★", l: "Avg Rating", i: "⭐"}, {v: "3.2K", l: "Participants", i: "👥"}].map((s, i) => (
                  <div key={i} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-xl mb-1 opacity-75">{s.i}</p>
                    <p className="text-lg font-bold text-white font-mono">{s.v}</p>
                    <p className="text-xs text-gray-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "practice" && (
            <div className="challenge-column transition-all duration-300">
              <div className="challenge-column-header">
                <span className="text-2xl">💻</span>
                Practice Challenges
              </div>

              {/* Company Selector */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {COMPANIES.map(c => {
                  const cc = COMPANY_CONFIG[c];
                  const active = co === c;
                  return (
                    <button 
                      key={c} 
                      onClick={() => setCo(c)} 
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                        active 
                          ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20' 
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20 hover:border-white/30 hover:text-emerald-300'
                      }`}
                    >
                      <span className="text-xl">{cc.logo}</span>
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>

              {/* Company Banner */}
              {(() => {
                const cc = COMPANY_CONFIG[co];
                const totalQ = Object.values(QUESTION_BANK[co] || {}).flat().length;
                return (
                  <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-emerald-500/20 mb-8 shadow-2xl">
                    <div className="flex items-center gap-6 mb-6">
                      <span className="text-5xl">{cc.logo}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{co} Prep</h3>
                        <p className="text-lg text-emerald-300 font-semibold">{totalQ} questions across 3 categories</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {(["coding", "aptitude", "system"]).map(cat => {
                        const meta = CATEGORY_META[cat];
                        return (
                          <span key={cat} className="text-sm px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {meta.icon} {meta.label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Category Cards */}
              <div className="grid grid-cols-1 gap-6">
                {(["coding", "aptitude", "system"]).map(cat => {
                  const meta = CATEGORY_META[cat];
                  const qcount = (QUESTION_BANK[co]?.[cat] || []).length;
                  return (
                    <div key={cat} className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-emerald-400/40 transition-all flex flex-col h-48 shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl">{meta.icon}</span>
                        <h4 className="text-xl font-bold text-white">{meta.label}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed">{meta.desc}</p>
                      <div className="grid grid-cols-3 gap-6 mb-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-emerald-400 text-2xl">{qcount}</p>
                          <p className="text-gray-500 mt-1">Questions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-emerald-400 text-2xl">30s</p>
                          <p className="text-gray-500 mt-1">Each</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-emerald-400 text-2xl">{qcount * 10}</p>
                          <p className="text-gray-500 mt-1">Max pts</p>
                        </div>
                      </div>
                      <StarBorder
                        as="button"
                        type="button"
                        color="#3f9371"
                        speed="5s"
                        onClick={() => handleStartQuiz(co, cat)}
                        className="w-full py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-500/90 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all border border-emerald-400/50 shadow-lg"
                      >
                        Start {meta.label.split(' ')[0]} →
                      </StarBorder>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "pvp" && (
            <div className="challenge-column challenge-pvp-column transition-all duration-300">
              <div className="challenge-column-header">
                <span className="text-2xl">⚔️</span>
                PvP Tournaments
              </div>
              
              {/* Your Stats */}
              <div className="challenge-column-stats mb-6">
                <div className="challenge-stat-item">
                  <div className="challenge-stat-number text-purple-400">{pvpStats.wins}</div>
                  <div className="challenge-stat-label">Wins</div>
                </div>
                <div className="challenge-stat-item">
                  <div className="challenge-stat-number text-emerald-400">{pvpStats.winRate}%</div>
                  <div className="challenge-stat-label">Win Rate</div>
                </div>
                <div className="challenge-stat-item">
                  <div className="challenge-stat-number text-yellow-400">#{pvpStats.rank}</div>
                  <div className="challenge-stat-label">Rank</div>
                </div>
              </div>

              {/* Subject Selector */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Subject</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPvpSubject("os")}
                    className={`flex-1 px-6 py-3 rounded-xl text-base font-bold transition-all ${
                      pvpSubject === "os"
                      ? "bg-emerald-600/20 text-emerald-400 border-2 border-emerald-600/40 shadow-lg shadow-emerald-500/20"
                        : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    💻 OS
                  </button>
                </div>
              </div>

              {/* Recent Matches */}
              <div className="challenge-matches-list mb-6">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Recent Battles</h4>
                {[
                  { opponent: 'Alex', score: '28-24', result: 'W' },
                  { opponent: 'Sarah', score: '22-30', result: 'L' },
                  { opponent: 'Mike', score: '31-29', result: 'W' },
                ].map((match, i) => (
                  <div key={i} className="challenge-match-item">
                    <span className="text-sm font-medium">{match.opponent}</span>
                    <span className="text-xs opacity-75">{match.score}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      match.result === 'W' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {match.result}
                    </span>
                  </div>
                ))}
              </div>

              {/* Find Opponent Button */}
              <button
                className="challenge-pvp-button w-full bg-gradient-to-r from-purple-500 to-emerald-500 text-white shadow-2xl hover:shadow-purple-500/25 transition-all"
                onClick={() => router.push('/pvp')}
              >
                Find {pvpSubject.toUpperCase()} Opponent → Battle Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
