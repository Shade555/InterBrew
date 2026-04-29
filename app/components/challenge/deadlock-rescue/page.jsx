"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

export default function DeadlockRescueChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing"); // playing | fail | success | summary
  const [loading, setLoading] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // --- 8-BIT SOUND ENGINE ---
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) { /* Browser blocked audio */ }
  };

  // --- DATABASE SYNC ---
  useEffect(() => {
    const fetchDeadlock = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('challenges_deadlock_scenarios')
          .select('*')
          .order('level_name', { ascending: true });
        
        if (error) throw error;
        if (data) setScenarios(data);
      } catch (err) {
        console.error("Kernel Sync Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeadlock();
  }, []);

  const scenario = scenarios[currentIndex];

  // --- TYPEWRITER EFFECT ---
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

  // --- GAME LOOP (TIMER) ---
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
    if (timeLeft === 0 && gameState === "playing" && scenario) {
      handlePenalty();
    }
  }, [timeLeft, gameState]);

  // --- ACTION HANDLERS ---
  const handlePenalty = () => {
    playSound('error');
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) setGameState("fail");
      return next;
    });
    setTimeLeft(20);
  };

  const handleAction = (actionId) => {
    if (!scenario || gameState !== "playing") return;
    
    if (actionId === scenario.correct_action_id) {
      playSound('success');
      const gainedXP = 100 + (timeLeft * 10);
      setScore(prev => prev + gainedXP);
      setGameState("success");
    } else {
      handlePenalty();
    }
  };

  const nextScenario = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20);
      setGameState("playing");
    } else {
      setGameState("summary");
    }
  };

  // --- RENDER STATES ---
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
      <p className="text-emerald-500 animate-pulse tracking-[0.5em] text-xs uppercase font-black">Syncing_Kernel_Modules...</p>
    </div>
  );

  if (gameState === "fail") return (
    <div className="min-h-screen bg-[#0a0000] flex items-center justify-center font-mono p-6">
      <div className="max-w-md w-full border-2 border-red-600 p-10 bg-red-950/5 text-center shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <h1 className="text-6xl font-black text-red-600 italic mb-4 tracking-tighter">CRASHED</h1>
        <p className="text-red-400 text-xs mb-10 uppercase tracking-widest font-bold opacity-60">System Overload: Deadlock unresolved</p>
        <button onClick={() => window.location.reload()} className="w-full py-5 bg-red-600 text-black font-black uppercase hover:bg-white transition-all active:scale-95">Hard_Reboot</button>
      </div>
    </div>
  );

  if (gameState === "summary") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono p-6">
      <div className="max-w-xl w-full border border-emerald-500/30 p-12 bg-white/5 rounded-[3rem] text-center backdrop-blur-xl">
        <h2 className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em] mb-4">Simulation_End</h2>
        <h1 className="text-6xl font-black text-white italic mb-2 tracking-tighter uppercase">Exfiltrated</h1>
        <p className="text-gray-500 text-[10px] mb-12 uppercase tracking-widest">Total system integrity restored to 100%</p>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-black/40 border border-white/5 p-8 rounded-3xl">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-2">Total_XP</p>
            <p className="text-5xl font-black text-white">{score}</p>
          </div>
          <div className="bg-black/40 border border-white/5 p-8 rounded-3xl">
            <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Success_Rate</p>
            <p className="text-5xl font-black text-white">100%</p>
          </div>
        </div>

        <button onClick={() => window.location.reload()} className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all">Restart_Cycle</button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white font-mono p-4 md:p-10 transition-all duration-300 overflow-hidden ${isGlitching ? 'bg-red-900/20 translate-x-1 grayscale-[0.5]' : ''}`}>
      
      {/* CRT SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,255,0,0.06))] bg-[length:100%_4px,4px_100%]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Deadlock_Rescue_v5</h2>
            </div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Node_{currentIndex + 1}_of_{scenarios.length} // {scenario?.level_name}</p>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] text-emerald-500/50 uppercase font-black mb-1 tracking-widest italic">XP_Buffer</p>
            <p className="text-5xl font-black tabular-nums tracking-tighter leading-none">{score}</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: VISUALS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 20) * 100}%` }}></div>
              <h3 className="text-[10px] font-black mb-4 text-emerald-500 uppercase tracking-widest italic">Incident_Report:</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed min-h-[60px] font-medium">{displayText}</p>
            </div>

            <div className="bg-black border border-emerald-900/30 p-8 rounded-[2rem] shadow-2xl relative group">
               <div className="absolute top-4 right-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-[8px] text-red-600/60 font-black uppercase tracking-widest">Live_RAG_Graph</span>
               </div>
               <pre className="text-emerald-500/90 text-xs md:text-sm leading-[2.2] font-bold whitespace-pre-wrap filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                 {scenario?.resource_graph}
               </pre>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center px-1 mb-2">
               <span className="text-[10px] text-gray-600 font-black uppercase italic tracking-widest">Resolution_Protocols</span>
               <span className={`text-[10px] font-black tabular-nums ${timeLeft < 5 ? 'text-red-500 animate-bounce' : 'text-gray-400'}`}>T-Minus: {timeLeft}s</span>
            </div>
            
            {[
              { id: 'terminate_a', label: 'Terminate P1 (A)', hex: '0x0A' },
              { id: 'terminate_b', label: 'Terminate P2 (B)', hex: '0x0B' },
              { id: 'preempt_printer', label: 'Force Resource Preempt', hex: '0x0C' }
            ].map((opt) => (
              <button 
                key={opt.id}
                onClick={() => handleAction(opt.id)}
                className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all text-left overflow-hidden active:scale-[0.98]"
              >
                <div className="flex justify-between items-center relative z-10">
                   <span className="text-xs font-black uppercase italic tracking-tighter">Execute_Cmd::{opt.label}</span>
                   <span className="text-[10px] opacity-20 group-hover:opacity-100 font-mono font-bold">{opt.hex}</span>
                </div>
              </button>
            ))}

            {/* INTEGRITY BAR */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest italic">Core_Integrity</span>
                <span className="text-[9px] text-red-600 font-black uppercase tracking-widest italic">{lives * 33}%</span>
              </div>
              <div className="flex gap-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 ${i <= lives ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-white/5'}`}></div>
                 ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* SUCCESS POPUP */}
      {gameState === "success" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-md w-full bg-[#0a0a0a] border-2 border-emerald-500 p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(16,185,129,0.15)]">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
               <div className="w-12 h-12 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-5xl font-black text-white italic mb-2 uppercase tracking-tighter leading-none">Stabilized</h2>
            <p className="text-gray-500 text-xs mb-10 leading-relaxed uppercase tracking-tighter font-bold italic">Node secured. Deadlock cycle terminated.</p>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl mb-10">
               <p className="text-[10px] text-emerald-500 font-black uppercase mb-1 tracking-widest">Buffer_XP_Allocated</p>
               <p className="text-3xl font-black text-white">+{100 + (timeLeft * 10)}</p>
            </div>

            <button 
              onClick={nextScenario}
              className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-white transition-all text-sm active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              {currentIndex === scenarios.length - 1 ? "Finalize_Mission" : "Sync_Next_Node"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}