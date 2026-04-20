"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizModal from "@/app/components/challenges/QuizModal";
import { supabase } from "@/lib/supabaseClient";
import { fetchChallengeSetByCompany, fetchQuestionsByChallengeSetId } from "@/lib/challengeSets";
import {
  COMPANIES, COMPANY_CONFIG, QUESTION_BANK, CATEGORY_META,
  LIVE_SESSIONS,
} from "@/data/challengeData";
import StarBorder from "@/app/components/StarBorder";
const TABS = [
  { id: "live", label: "Live Interviews" },
  { id: "practice", label: "Practice" },
  { id: "pvp", label: "PvP Arena" },
];

export default function ChallengesPage() {
  const router = useRouter();
  const [tab, setTab] = useState("practice");
  const [quiz, setQuiz] = useState(null);
  const [co, setCo] = useState("Google");
  
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

  // Fetch questions from Supabase for a company
  const loadQuestionsFromSupabase = async (company) => {
    console.log("Loading questions from Supabase for:", company);
    console.log("Supabase client available:", !!supabase);
    
    if (!supabase) {
      console.log("Supabase not configured - using local data");
      return; // Already loaded or Supabase not available
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
          // Transform Supabase questions to match the expected format
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

  // Handle opening quiz - fetch from Supabase first
  const handleStartQuiz = async (company, category) => {
    // Try to load from Supabase if not already loaded
    if (!supabaseQuestions[company]) {
      await loadQuestionsFromSupabase(company);
    }
    setQuiz({ company, category });
  };

  // Check if session is registered
  const isRegistered = (session) => {
    return registeredSessions.some(
      (r) => r.company === session.company && r.time === session.time
    );
  };

  // Handle joining a live session
  const handleJoinLive = (session) => {
    router.push(`/exam/test?company=${session.company}`);
  };

  // Handle registering for upcoming sessions
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
    
    // Show alert for now (could be enhanced with a toast notification)
    alert(`✅ Registered for ${session.company} - ${session.topic}!\n\nWe'll remind you before the session starts.`);
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

      <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ⚡ Challenge Arena
          </h1>
          <p className="text-gray-400 text-sm">FAANG interview prep — quizzes, live sessions & checklists</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 mb-6">
          {TABS.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LIVE TAB */}
        {tab === "live" && (
          <div className="space-y-5 animate-fade-in">
            {/* Live banner */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-2xl relative overflow-hidden">
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
                  onClick={() => router.push(`/exam/test?company=Netflix`)} 
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
            <div className="grid grid-cols-3 gap-4">
              {[{v: "24", l: "Sessions This Month", i: "🎙"}, {v: "4.8★", l: "Avg Rating", i: "⭐"}, {v: "3.2K", l: "Total Participants", i: "👥"}].map((s, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-2xl mb-2">{s.i}</p>
                  <p className="text-xl font-bold text-white font-mono">{s.v}</p>
                  <p className="text-xs text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {tab === "practice" && (
          <div className="space-y-5 animate-fade-in">
            {/* Company Selector */}
            <div className="flex flex-wrap gap-3 justify-center">
              {COMPANIES.map(c => {
                const cc = COMPANY_CONFIG[c];
                const active = co === c;
                return (
                  <button 
                    key={c} 
                    onClick={() => setCo(c)} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{cc.logo}</span>
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
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{cc.logo}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{co} Challenges</h3>
                      <p className="text-sm text-gray-400">{totalQ} questions · 3 categories · 30s per Q</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["coding", "aptitude", "system"]).map(cat => (
                      <span key={cat} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["coding", "aptitude", "system"]).map(cat => {
                const meta = CATEGORY_META[cat];
                const qcount = (QUESTION_BANK[co]?.[cat] || []).length;
                return (
                  <div key={cat} className="bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{meta.icon}</span>
                      <h4 className="text-base font-bold text-white">{meta.label}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">{meta.desc}</p>
                    <div className="flex gap-4 mb-4">
                      {[{v: qcount, l: "Qs"}, {v: "30s", l: "Each"}, {v: `${qcount * 10}`, l: "Max pts"}].map((s, i) => (
                        <div key={i} className="text-center">
                          <p className="text-base font-bold text-white font-mono">{s.v}</p>
                          <p className="text-[10px] text-gray-400">{s.l}</p>
                        </div>
                      ))}
                    </div>
                    <StarBorder
                      as="button"
                      type="button"
                      color="#3f9371"
                      speed="5s"
                      onClick={() => handleStartQuiz(co, cat)}
                      className="mt-auto w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                    >
                      Start Challenge →
                    </StarBorder>
                  </div>
                );
              })}
            </div>

            {/* Quick Access */}
            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-4">⚡ Quick Jump — All Companies</h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {COMPANIES.flatMap(c =>
                  (["coding", "aptitude", "system"]).map(cat => {
                    const cc = COMPANY_CONFIG[c];
                    const meta = CATEGORY_META[cat];
                    return (
                      <button 
                        key={`${c}-${cat}`} 
                        onClick={() => { setCo(c); handleStartQuiz(c, cat); }} 
                        className="flex items-center gap-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-center"
                      >
                        <span className="text-lg">{cc.logo}</span>
                        <span className="truncate">{c}</span>
                        <span className="text-gray-500">·</span>
                        <span>{meta.icon}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

