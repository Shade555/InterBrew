"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

export default function MemoryGridChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [memoryBlocks, setMemoryBlocks] = useState([]);
  const [pendingProcesses, setPendingProcesses] = useState([]);
  const [gameState, setGameState] = useState("playing"); 
  const [score, setScore] = useState(0);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- DATABASE SYNC LOGIC ---
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

      // Get existing XP for this month
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
          .update({ xp: (existing.xp || 0) + finalScore })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("leaderboard")
          .insert([{ user_id: user.id, xp: finalScore, month, year }]);
      }
    } catch (err) {
      console.error("Leaderboard Sync Failed:", err);
    } finally {
      setIsSyncing(false);
      setGameState("summary");
    }
  };

  useEffect(() => {
    const fetchScenarios = async () => {
      const { data, error } = await supabase
        .from('challenges_memory_scenarios')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (data && data.length > 0) {
        setScenarios(data);
        initLevel(data[0]);
      }
      setLoading(false);
    };
    fetchScenarios();
  }, []);

  const initLevel = (level) => {
    setMemoryBlocks(level.blocks.map(b => ({ ...b, occupant: null })));
    setPendingProcesses(level.processes);
    setHasSkipped(false);
  };

  const scenario = scenarios[currentIndex];
  const currentProcess = pendingProcesses[0];

  const handleAllocation = (blockId) => {
    if (!currentProcess) return;

    const blockIndex = memoryBlocks.findIndex(b => b.id === blockId);
    const block = memoryBlocks[blockIndex];

    if (block.size >= currentProcess.size && !block.occupant) {
      const newBlocks = [...memoryBlocks];
      newBlocks[blockIndex].occupant = currentProcess;
      
      setMemoryBlocks(newBlocks);
      const remaining = pendingProcesses.slice(1);
      setPendingProcesses(remaining);
      
      if (!hasSkipped) setScore(s => s + 250);

      if (remaining.length === 0) {
        setGameState("success");
      }
    } else {
      const btn = document.getElementById(`block-${blockId}`);
      btn?.classList.add('border-red-500', 'animate-shake');
      setTimeout(() => btn?.classList.remove('border-red-500', 'animate-shake'), 500);
    }
  };

  const handleBypass = () => {
    setHasSkipped(true);
    setGameState("success");
    setPendingProcesses([]);
  };

  if (loading || isSyncing) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-emerald-500">
      <div className="animate-pulse text-[10px] tracking-[0.5em] uppercase">
        {isSyncing ? "Committing_Allocation_Log..." : "Mapping_Virtual_Address_Space..."}
      </div>
    </div>
  );

  if (gameState === "summary") return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono p-6">
      <div className="max-w-xl w-full border border-white/5 p-16 bg-[#080808] rounded-[4rem] text-center shadow-2xl relative">
        <h1 className="text-6xl font-black text-white italic mb-4 uppercase tracking-tighter">Complete</h1>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-10">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Total Efficiency XP</p>
          <p className="text-6xl font-black text-emerald-500 italic">{score}</p>
        </div>
        <div className="grid gap-4">
          <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-black font-black rounded-2xl uppercase tracking-widest hover:bg-emerald-500 transition-all">Restart_Sim</button>
          <Link href="/challenges" className="w-full py-6 bg-transparent border border-white/10 text-white font-black rounded-2xl uppercase text-sm flex items-center justify-center tracking-widest">Return_to_Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-start mb-16 border-b border-white/10 pb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Memory_Grid</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">
              Level: <span className="text-white">{scenario?.level_name}</span> | 
              Strategy: <span className="text-emerald-500 ml-2">{scenario?.strategy_type}</span>
            </p>
          </div>
          <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/5 text-right">
            <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Points</p>
            <p className="text-4xl font-black text-emerald-500 tabular-nums leading-none">{score}</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* PROCESS QUEUE */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-6 italic">{'//'} Incoming_Queue</h3>
            <div className="space-y-4">
              {pendingProcesses.map((p, i) => (
                <div key={p.id} className={`p-6 border-2 rounded-2xl transition-all duration-500 ${i === 0 ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-xl shadow-emerald-500/5' : 'border-white/5 opacity-30'}`}>
                  <p className="text-[9px] font-black text-emerald-500/50 mb-1 tracking-widest">TASK_{p.id}</p>
                  <p className="text-2xl font-black italic text-white uppercase">{p.name}</p>
                  <p className="text-lg font-bold text-gray-500">{p.size} KB</p>
                </div>
              ))}
              <button onClick={handleBypass} className="w-full py-4 text-[9px] font-black text-gray-700 hover:text-red-500 transition-colors uppercase tracking-[0.4em]">
                [!] Emergency_Bypass
              </button>
            </div>
          </div>

          {/* PHYSICAL MEMORY */}
          <div className="lg:col-span-8">
            <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-6 italic">{'//'} Physical_Memory_Map</h3>
            <div className="grid gap-4">
              {memoryBlocks.map((block) => (
                <button
                  id={`block-${block.id}`}
                  key={block.id}
                  onClick={() => handleAllocation(block.id)}
                  disabled={!!block.occupant}
                  className={`w-full p-8 border-2 rounded-[2.5rem] text-left transition-all relative overflow-hidden group ${block.occupant ? 'border-white/5 bg-white/[0.01]' : 'border-white/10 hover:border-emerald-500 bg-white/[0.03]'}`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-[9px] font-black text-gray-600 mb-1 tracking-tighter uppercase">Block_Offset_{block.id}</p>
                        <p className="text-4xl font-black italic">{block.size} <span className="text-lg">KB</span></p>
                    </div>
                    {block.occupant ? (
                        <div className="text-right">
                            <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Allocated</p>
                            <p className="text-xl font-black italic text-emerald-500 uppercase">{block.occupant.name}</p>
                            <p className="text-[10px] text-gray-600 font-bold italic uppercase tracking-tighter">Fragmentation: {block.size - block.occupant.size} KB</p>
                        </div>
                    ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black bg-white text-black px-6 py-3 rounded-full uppercase">Allocate_Here</span>
                        </div>
                    )}
                  </div>
                  {block.occupant && <div className="absolute inset-0 bg-emerald-500/5 transition-all" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {gameState === "success" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
          <div className="max-w-md w-full bg-[#080808] border border-white/10 p-12 rounded-[4rem] text-center shadow-2xl relative">
            <h2 className="text-5xl font-black text-white italic mb-2 uppercase tracking-tighter">{hasSkipped ? "Overridden" : "Stabilized"}</h2>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-10 ${hasSkipped ? 'text-red-500' : 'text-emerald-500'}`}>
               Level_{currentIndex + 1}_Result: {hasSkipped ? "0 XP" : "+250 XP"}
            </div>
            <button 
              onClick={() => {
                if(currentIndex < scenarios.length - 1) {
                  const nextIdx = currentIndex + 1;
                  setCurrentIndex(nextIdx);
                  initLevel(scenarios[nextIdx]);
                  setGameState("playing");
                } else {
                  finalizeAndSync(score);
                }
              }}
              className="w-full py-6 bg-emerald-500 text-black font-black rounded-3xl uppercase text-xs"
            >
              {currentIndex < scenarios.length - 1 ? "Initialize_Next_Level" : "Finalize_Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}