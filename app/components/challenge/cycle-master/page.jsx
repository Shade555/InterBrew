"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

export default function CycleMasterChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState("playing"); 
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- LEADERBOARD SYNC ---
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

      // Check if entry exists for this month/year
      const { data: existing } = await supabase
        .from("leaderboard")
        .select("id, xp, challenges_completed")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("leaderboard")
          .update({ 
            xp: (existing.xp || 0) + finalScore,
            challenges_completed: (existing.challenges_completed || 0) + 1,
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
            challenges_completed: 1,
            accuracy: 100 
          }]);
      }
    } catch (err) {
      console.error("Leaderboard update failed:", err);
    } finally {
      setIsSyncing(false);
      setGameState("summary");
    }
  };

  // --- AUDIO ENGINE ---
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'error') {
        osc.type = 'square'; osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // --- FETCH SCENARIOS ---
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('challenges_scheduling_scenarios')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setScenarios(data || []);
      } catch (err) {
        setDbError(err.message || "Connection to Kernel failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const scenario = scenarios[currentIndex];

  const handleProcessClick = (pId) => {
    if (selectedOrder.includes(pId)) {
      setSelectedOrder(prev => prev.filter(id => id !== pId));
    } else {
      playSound('click');
      setSelectedOrder(prev => [...prev, pId]);
    }
  };

  const handleBypass = () => {
    setHasSkipped(true);
    setSelectedOrder(scenario.correct_order);
    setGameState("success");
  };

  const validateOrder = () => {
    if (!scenario) return;
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(scenario.correct_order);
    
    if (isCorrect) {
      playSound('success');
      // Only grant points if not bypassed
      if (!hasSkipped) setScore(prev => prev + 500);
      setGameState("success");
    } else {
      playSound('error');
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 400);
      setSelectedOrder([]); 
    }
  };

  const totalBurst = scenario?.processes?.reduce((acc, p) => acc + p.burst, 0) || 1;

  if (loading || isSyncing) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="text-emerald-500 animate-pulse uppercase tracking-[0.5em] text-[10px]">
        {isSyncing ? "Committing_Cycles_To_DB..." : "Initializing_Scheduler_v6"}
      </div>
    </div>
  );

  if (dbError) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-10 text-center">
      <div className="border border-red-500/30 p-8 rounded-3xl bg-red-500/5">
        <p className="text-red-500 uppercase text-xs font-black tracking-widest mb-4">Kernel_Panic: {dbError}</p>
        <button onClick={() => window.location.reload()} className="text-white bg-red-600 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">Reboot_System</button>
      </div>
    </div>
  );

  if (gameState === "summary") return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono p-6 text-center">
      <div className="max-w-xl w-full border border-white/5 p-16 bg-[#080808] rounded-[4rem] relative shadow-2xl">
        <h1 className="text-7xl font-black text-white italic mb-4 uppercase tracking-tighter">Complete</h1>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-10">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-[0.2em]">Efficiency_XP_Synchronized</p>
          <p className="text-6xl font-black text-emerald-500 tabular-nums">{score}</p>
        </div>
        <div className="grid gap-4">
          <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all">Restart_Sim</button>
          <Link href="/challenges" className="w-full py-6 border border-white/10 text-white font-black rounded-2xl uppercase text-xs flex justify-center items-center tracking-widest">Return_Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#050505] text-white font-mono p-6 md:p-12 transition-all duration-300 ${isGlitching ? 'bg-red-950/20 translate-x-1' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-start mb-16 border-b border-white/10 pb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Cycle_Master</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">
              Logic: <span className="text-emerald-500">{scenario?.algorithm_type}</span>
            </p>
          </div>
          <div className="text-right bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Session_XP</p>
            <p className="text-5xl font-black text-emerald-500 tabular-nums leading-none">{score}</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 mb-10 backdrop-blur-md">
              <h3 className="text-[10px] font-black mb-6 text-emerald-500/50 uppercase tracking-[0.4em] italic">{'//'} Scenario_Parameters</h3>
              <p className="text-xl md:text-2xl font-bold leading-tight italic text-white/90">{scenario?.description}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">Process_Registers:</h3>
              <div className="flex flex-wrap gap-4">
                {scenario?.processes.map((p) => (
                  <button
                    key={p.id}
                    disabled={selectedOrder.includes(p.id)}
                    onClick={() => handleProcessClick(p.id)}
                    className={`group relative p-8 border-2 transition-all rounded-[2.5rem] text-left w-44 ${
                      selectedOrder.includes(p.id) ? 'opacity-10 grayscale pointer-events-none' : 'border-white/10 bg-white/5 hover:border-emerald-500 hover:scale-105'
                    }`}
                  >
                    <p className="font-black text-4xl mb-2 italic uppercase">{p.id}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Time: {p.burst}ms</p>
                    {p.arrival !== undefined && <p className="text-[10px] font-bold text-emerald-500/50 uppercase">Arrival: {p.arrival}</p>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12">
               <button onClick={handleBypass} className="text-[9px] font-black text-gray-800 hover:text-red-500 transition-colors uppercase tracking-[0.4em] italic">
                 [!] Kernel_Override_Bypass (0 XP)
               </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-black border border-white/10 p-10 rounded-[3rem] flex-1 shadow-2xl relative">
              <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-10">Scheduling_Queue:</h3>
              
              <div className="flex h-4 w-full bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
                {selectedOrder.map(id => {
                   const proc = scenario.processes.find(p => p.id === id);
                   const width = (proc.burst / totalBurst) * 100;
                   return <div key={id} style={{ width: `${width}%` }} className="bg-emerald-500 border-r border-black/20 transition-all duration-500" />;
                })}
              </div>

              <div className="flex-1 flex flex-col gap-4 mb-10">
                {selectedOrder.map((id, index) => (
                  <div key={id} className="group bg-emerald-500 text-black p-6 rounded-2xl flex justify-between items-center animate-in slide-in-from-right-4 duration-300">
                    <span className="font-black text-2xl italic tracking-tighter">SEQ_0{index + 1} // {id}</span>
                    <button onClick={() => handleProcessClick(id)} className="text-[9px] font-black px-4 py-2 bg-black/10 rounded-full uppercase hover:bg-black hover:text-white transition-colors">Clear</button>
                  </div>
                ))}
                {selectedOrder.length === 0 && (
                  <div className="flex-1 min-h-[100px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center">
                    <p className="text-gray-800 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Waiting_For_Input</p>
                  </div>
                )}
              </div>
              <button 
                disabled={selectedOrder.length !== scenario?.processes.length}
                onClick={validateOrder}
                className="w-full py-8 bg-white text-black font-black rounded-[2rem] uppercase tracking-[0.3em] text-xs disabled:opacity-10 transition-all active:scale-95"
              >
                Commit_Execution
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NODE COMPLETION MODAL */}
      {gameState === "success" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="max-w-md w-full bg-[#080808] border border-white/10 p-12 rounded-[4rem] text-center shadow-2xl relative">
            <h2 className="text-5xl font-black text-white italic mb-2 uppercase tracking-tighter">
              {hasSkipped ? "Overridden" : "Synchronized"}
            </h2>
            <div className={`text-[10px] font-black uppercase mb-10 ${hasSkipped ? 'text-red-500' : 'text-emerald-500'}`}>
              Level_{currentIndex + 1}_Result: {hasSkipped ? "0 XP" : "+500 XP"}
            </div>
            <div className="p-6 bg-white/5 rounded-3xl mb-12">
               <p className="text-gray-500 text-xs italic leading-relaxed uppercase font-bold tracking-tighter">
                  {scenario?.explanation}
               </p>
            </div>
            <button 
              onClick={() => {
                if(currentIndex < scenarios.length - 1) {
                  const nextIdx = currentIndex + 1;
                  setCurrentIndex(nextIdx);
                  setSelectedOrder([]);
                  setHasSkipped(false);
                  setGameState("playing");
                } else {
                  finalizeAndSync(score);
                }
              }}
              className="w-full py-6 bg-emerald-500 text-black font-black rounded-3xl uppercase tracking-widest hover:bg-white transition-all"
            >
              {currentIndex < scenarios.length - 1 ? "Initialize_Next_Node" : "Finalize_Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}