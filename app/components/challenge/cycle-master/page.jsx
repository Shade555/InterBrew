"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

export default function CycleMasterChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState("playing"); // playing | success | summary
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [hasSkipped, setHasSkipped] = useState(false);

  // --- NEURAL AUDIO ENGINE ---
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

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('challenges_scheduling_scenarios')
          .select('*');
        
        if (error) {
          setDbError(error.message);
        } else {
          setScenarios(data || []);
        }
      } catch (err) {
        setDbError("Connection failed");
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

  // --- BYPASS LOGIC (Reveals answer, yields 0 points) ---
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
      setHasSkipped(false);
      setScore(prev => prev + 500);
      setGameState("success");
    } else {
      playSound('error');
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 400);
      setSelectedOrder([]); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <p className="text-emerald-500 animate-pulse uppercase tracking-[0.5em] text-[10px]">Initializing_Scheduler_v6</p>
    </div>
  );

  if (dbError) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-10 text-center">
      <div className="border border-red-500/30 p-8 rounded-3xl bg-red-500/5">
        <p className="text-red-500 uppercase text-xs font-black tracking-widest mb-4">Sync_Error: {dbError}</p>
        <button onClick={() => window.location.reload()} className="text-white bg-red-600 px-6 py-2 rounded-lg text-xs font-bold">Retry</button>
      </div>
    </div>
  );

  // --- FINAL SUMMARY SCREEN ---
  if (gameState === "summary") return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono p-6">
      <div className="max-w-xl w-full border border-white/5 p-16 bg-[#080808] rounded-[4rem] text-center shadow-2xl relative">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-[100px]"></div>
        <h1 className="text-7xl font-black text-white italic mb-4 tracking-tighter uppercase leading-none">Complete</h1>
        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">All Nodes Synchronized</p>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Points_Received</p>
          <p className="text-6xl font-black text-emerald-500 tabular-nums italic">{score}</p>
        </div>

        <div className="grid gap-4">
          <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-black font-black rounded-2xl uppercase tracking-widest hover:bg-emerald-500 transition-all">Restart_Session</button>
          <Link href="/challenges" className="w-full py-6 bg-transparent border border-white/10 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-3">
            <span>←</span> Return_to_Home
          </Link>
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Algorithm: <span className="text-emerald-500">{scenario?.algorithm_type}</span></p>
          </div>
          <div className="text-right bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Efficiency_XP</p>
            <p className="text-5xl font-black text-emerald-500 tabular-nums leading-none">{score}</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 mb-10 backdrop-blur-md">
              <h3 className="text-[10px] font-black mb-6 text-emerald-500/50 uppercase tracking-[0.4em] italic">{'//'} Scheduling_Report</h3>
              <p className="text-xl md:text-2xl font-bold leading-tight italic text-white/90">{scenario?.description || "Awaiting kernel data..."}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">Incoming_Buffer:</h3>
              <div className="flex flex-wrap gap-4">
                {scenario?.processes.map((p) => (
                  <button
                    key={p.id}
                    disabled={selectedOrder.includes(p.id)}
                    onClick={() => handleProcessClick(p.id)}
                    className={`group relative p-8 border-2 transition-all rounded-[2.5rem] text-left w-44 overflow-hidden ${
                      selectedOrder.includes(p.id) 
                      ? 'opacity-10 border-white/5 grayscale cursor-not-allowed' 
                      : 'border-white/10 bg-white/5 hover:border-emerald-500 hover:scale-105'
                    }`}
                  >
                    <p className="font-black text-4xl mb-2 italic">{p.id}</p>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Burst: {p.burst}ms</p>
                      {p.arrival !== undefined && <p className="text-[10px] font-bold text-emerald-500/50 uppercase">Arrival: {p.arrival}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12">
               <button onClick={handleBypass} className="text-[9px] font-black text-gray-700 hover:text-emerald-500 transition-colors uppercase tracking-[0.4em]">
                 [!] Request_Kernel_Override (Bypass Level - 0 XP)
               </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-black border border-white/10 p-10 rounded-[3rem] flex-1 flex flex-col shadow-2xl relative">
              <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-10">Execution_Queue:</h3>
              <div className="flex-1 flex flex-col gap-4 mb-10">
                {selectedOrder.map((id, index) => (
                  <div key={id} className="group bg-emerald-500 text-black p-6 rounded-2xl flex justify-between items-center animate-in slide-in-from-right duration-300">
                    <span className="font-black text-2xl italic tracking-tighter">0{index + 1} | {id}</span>
                    <button onClick={() => handleProcessClick(id)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-[9px] font-black px-3 py-1 rounded">Undo</button>
                  </div>
                ))}
                {selectedOrder.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center">
                    <p className="text-gray-800 text-[10px] font-black uppercase tracking-[0.5em]">Idle_State</p>
                  </div>
                )}
              </div>
              <button 
                disabled={selectedOrder.length !== scenario?.processes.length}
                onClick={validateOrder}
                className="w-full py-8 bg-emerald-500 text-black font-black rounded-[2rem] uppercase tracking-[0.3em] text-xs disabled:opacity-20 active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
              >
                Commit_Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT OVERLAY */}
      {gameState === "success" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="max-w-md w-full bg-[#080808] border border-white/10 p-12 rounded-[4rem] text-center shadow-2xl">
            <h2 className="text-5xl font-black text-white italic mb-2 uppercase tracking-tighter leading-none">
              {hasSkipped ? "Overridden" : "Stabilized"}
            </h2>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-10 p-2 ${hasSkipped ? 'text-red-500' : 'text-emerald-500'}`}>
              {hasSkipped ? "Points_Received: 0" : "Points_Received: +500"}
            </div>
            <p className="text-gray-500 text-[10px] mb-12 uppercase tracking-widest font-bold italic leading-loose">{scenario?.explanation}</p>
            <button 
              onClick={() => {
                if(currentIndex < scenarios.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setSelectedOrder([]);
                  setHasSkipped(false);
                  setGameState("playing");
                } else {
                  setGameState("summary");
                }
              }}
              className="w-full py-6 bg-emerald-500 text-black font-black rounded-3xl uppercase tracking-widest hover:bg-white transition-all shadow-lg"
            >
              Next_Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}