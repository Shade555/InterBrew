"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";

export default function DeadlockRescueChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing"); 
  const [loading, setLoading] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- LEADERBOARD SYNC LOGIC ---
  const finalizeAndSync = async (finalScore) => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGameState("summary");
        return;
      }

      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // Get existing entry to increment
      const { data: existing } = await supabase
        .from("leaderboard")
        .select("id, xp")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("leaderboard")
          .update({ 
            xp: (existing.xp || 0) + finalScore,
            recorded_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("leaderboard")
          .insert([{ 
            user_id: user.id, 
            xp: finalScore, 
            month, 
            year, 
            challenges_completed: 1 
          }]);
      }
    } catch (err) {
      console.error("Kernel Sync Error:", err);
    } finally {
      setIsSyncing(false);
      setGameState("summary");
    }
  };

  // --- SOUND ENGINE ---
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'success') {
        osc.type = 'square'; osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'tick') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const fetchDeadlock = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('challenges_deadlock_scenarios').select('*').order('level_name', { ascending: true });
        if (error) throw error;
        setScenarios(data || []);
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeadlock();
  }, []);

  const scenario = scenarios[currentIndex];

  useEffect(() => {
    if (scenario?.description && gameState === "playing") {
      let i = 0;
      setDisplayText("");
      const interval = setInterval(() => {
        setDisplayText((prev) => prev + scenario.description.charAt(i));
        i++;
        if (i >= scenario.description.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [scenario, gameState]);

  useEffect(() => {
    let timer;
    if (gameState === "playing" && scenario && timeLeft > 0) {
      timer = setInterval(() => {
        if (timeLeft <= 6) playSound('tick');
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, scenario]);

  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") handlePenalty();
  }, [timeLeft]);

  const handlePenalty = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        finalizeAndSync(score); // Sync points even on failure
        return 0;
      }
      setGameState("node_failed");
      return next;
    });
  };

  const handleAction = (actionId) => {
    if (actionId === scenario.correct_action_id) {
      playSound('success');
      setScore(prev => prev + (100 + (timeLeft * 10)));
      setGameState("success");
    } else {
      handlePenalty();
    }
  };

  const nextScenario = () => {
    setShowHint(false);
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20);
      setGameState("playing");
    } else {
      finalizeAndSync(score);
    }
  };

  if (loading || isSyncing) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-emerald-500">
      <p className="animate-pulse tracking-[0.5em] text-xs uppercase font-black">
        {isSyncing ? "Uploading_XP_Payload..." : "Connecting_To_Kernel..."}
      </p>
    </div>
  );

  if (gameState === "summary" || gameState === "fail") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono p-6">
      <div className={`max-w-xl w-full border ${gameState === "fail" ? "border-red-600" : "border-emerald-500/30"} p-12 bg-white/5 rounded-[3rem] text-center backdrop-blur-xl`}>
        <h1 className="text-6xl font-black italic mb-10 tracking-tighter uppercase">{gameState === "fail" ? "System_Crash" : "Mission_End"}</h1>
        <div className="bg-black/40 border border-white/5 p-8 rounded-3xl mb-12">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-2">XP_Exfiltrated</p>
            <p className="text-6xl font-black text-white">{score}</p>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest">Retry_Simulation</button>
          <Link href="/challenges" className="w-full py-5 border border-white/10 text-white font-black rounded-2xl uppercase text-xs tracking-widest flex items-center justify-center">Exit_To_Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white font-mono p-4 md:p-10 transition-all duration-300 overflow-hidden ${isGlitching ? 'bg-red-900/10' : ''}`}>
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-emerald-500">Deadlock_Rescue</h2>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Node_{currentIndex + 1}_of_{scenarios.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-emerald-500/50 uppercase font-black mb-1">XP_Buffer</p>
            <p className="text-5xl font-black tabular-nums tracking-tighter leading-none">{score}</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative">
              <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 20) * 100}%` }}></div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">{displayText}</p>
            </div>
            <div className="bg-black border border-emerald-900/30 p-8 rounded-[2rem] shadow-2xl">
               <div className="flex justify-between mb-4">
                  <span className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Resource_Graph_Dump</span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= lives ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-white/5'}`}></div>)}
                  </div>
               </div>
               <pre className="text-emerald-500/90 text-xs md:text-sm font-bold whitespace-pre-wrap">{scenario?.resource_graph}</pre>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
             <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Protocols</span>
             {/* Generate buttons based on scenario if available, otherwise fallback */}
             {['terminate_a', 'terminate_b', 'preempt_printer'].map((id) => (
              <button key={id} onClick={() => handleAction(id)} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all text-left uppercase text-xs font-black italic">
                Execute_Cmd::{id.replace('_', ' ')}
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* NODE INTERSTITIAL */}
      {(gameState === "success" || gameState === "node_failed") && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
          <div className={`max-w-md w-full bg-[#0a0a0a] border-2 ${gameState === "success" ? "border-emerald-500" : "border-red-600"} p-10 rounded-[3rem] text-center`}>
            <h2 className="text-4xl font-black italic mb-2 uppercase">{gameState === "success" ? "Stabilized" : "Node_Fault"}</h2>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl my-8">
              {gameState === "success" ? (
                <p className="text-3xl font-black text-emerald-500">+{100 + (timeLeft * 10)} XP</p>
              ) : (
                <p className="text-xs text-white leading-relaxed italic">{scenario?.explanation}</p>
              )}
            </div>
            <button onClick={nextScenario} className={`w-full py-5 ${gameState === "success" ? "bg-emerald-500 text-black" : "bg-red-600 text-white"} font-black rounded-2xl uppercase`}>
              Next_Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}