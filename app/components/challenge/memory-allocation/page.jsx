"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

// --- Sub-Components ---
function DraggableProcess({ process }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(process.id),
    data: process,
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 100 : 50,
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: isDragging ? 'none' : 'auto', 
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-emerald-500 text-black p-4 rounded-lg font-mono font-black cursor-grab active:cursor-grabbing mb-3 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] border-2 border-emerald-400 flex justify-between items-center transition-opacity">
      <span>{process.name}</span>
      <span className="bg-black/20 px-2 py-1 rounded text-xs">{process.size}KB</span>
    </div>
  );
}

function DroppableBlock({ block, occupiedBy, isSolution = false }) {
  const { isOver, setNodeRef } = useDroppable({ id: String(block.id) });
  return (
    <div ref={setNodeRef} className={`relative w-full border-2 rounded-xl p-4 mb-4 transition-all duration-200 flex flex-col justify-end ${isOver ? 'border-emerald-400 bg-emerald-500/20 scale-[1.01]' : 'border-white/10 bg-white/5'} ${occupiedBy ? 'border-solid border-emerald-500/50 bg-emerald-500/5' : 'border-dashed'}`} style={{ height: `${Math.max(block.size / 2, 100)}px` }}>
      <div className="absolute top-3 left-4 text-[10px] font-mono text-gray-500 tracking-tighter uppercase font-bold">
        Block: {block.size}KB {isSolution && <span className="text-emerald-500 ml-2">// RECOMMENDED</span>}
      </div>
      {occupiedBy ? (
        <div className={`h-full w-full rounded-lg flex flex-col items-center justify-center text-black animate-in fade-in zoom-in duration-300 ${isSolution ? 'bg-emerald-400' : 'bg-emerald-500/90'}`}>
          <span className="text-[10px] font-mono opacity-60 uppercase font-bold tracking-widest">Allocated</span>
          <span className="font-black underline underline-offset-4">{occupiedBy.name}</span>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center opacity-20 italic text-[10px] uppercase tracking-widest">{isOver ? 'Link_Process' : 'Standby'}</div>
      )}
    </div>
  );
}

// --- Main Engine ---
export default function MemoryAllocationChallenge() {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("SYSTEM_READY");
  const [gameState, setGameState] = useState("playing"); 
  const [showSolution, setShowSolution] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

      const { data: existing } = await supabase.from("leaderboard").select("id, xp").eq("user_id", user.id).eq("month", month).eq("year", year).maybeSingle();

      if (existing) {
        await supabase.from("leaderboard").update({ 
          xp: (existing.xp || 0) + finalScore,
          recorded_at: new Date().toISOString()
        }).eq("id", existing.id);
      } else {
        await supabase.from("leaderboard").insert([{ user_id: user.id, xp: finalScore, month, year, challenges_completed: 1 }]);
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
      setGameState("summary");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.from('challenges_memory_scenarios').select('*').order('created_at', { ascending: true });
      if (data) { 
        setScenarios(data); 
        loadLevel(data[0]); 
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadLevel = (level) => {
    setBlocks(level.blocks.map(b => ({ ...b, occupied: null })));
    setProcesses(level.processes);
    setGameState("playing");
    setShowSolution(false);
    setStatus(`TASK: Allocate using ${level.strategy_type}.`);
  };

  const findCorrectBlock = (process, currentBlocks) => {
    const available = currentBlocks.filter(b => !b.occupied && b.size >= process.size);
    const strat = scenarios[currentIndex].strategy_type;
    if (available.length === 0) return null;

    if (strat === "First Fit") return available[0];
    if (strat === "Best Fit") return [...available].sort((a, b) => a.size - b.size)[0];
    if (strat === "Worst Fit") return [...available].sort((a, b) => b.size - a.size)[0];
    return null;
  };

  const handleDragEnd = (event) => {
    if (gameState !== "playing") return;
    const { active, over } = event;
    if (!over) return;

    const process = processes.find(p => String(p.id) === String(active.id));
    const targetBlock = blocks.find(b => String(b.id) === String(over.id));
    const correctBlock = findCorrectBlock(process, blocks);

    if (!process || !targetBlock || targetBlock.occupied) return;

    if (targetBlock.id === correctBlock?.id) {
      setScore(prev => prev + 100);
      setBlocks(prev => prev.map(b => b.id === targetBlock.id ? { ...b, occupied: process } : b));
      const remaining = processes.filter(p => p.id !== process.id);
      setProcesses(remaining);
      setStatus("✓ VALID_ALLOCATION: Point rewarded.");
      if (remaining.length === 0) setGameState("finished");
    } else {
      setScore(prev => Math.max(0, prev - 25)); 
      setStatus("⚠ LOGIC_ERROR: Points deducted. Try a different block.");
    }
  };

  const handleLevelTransition = () => {
    setHistory([...history, { 
        name: scenarios[currentIndex].level_name, 
        strat: scenarios[currentIndex].strategy_type, 
        score: score,
        skipped: showSolution 
    }]);

    if (currentIndex < scenarios.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      loadLevel(scenarios[next]);
    } else {
      finalizeAndSync(score);
    }
  };

  const revealSolution = () => {
    setScore(prev => Math.max(0, prev - 100));
    setShowSolution(true);
    setGameState("finished");
    setStatus("REVEALING_SOLUTION: Sequence forced to complete.");
    
    let tempBlocks = [...blocks];
    processes.forEach(p => {
      const correct = findCorrectBlock(p, tempBlocks);
      if (correct) {
        tempBlocks = tempBlocks.map(b => b.id === correct.id ? { ...b, occupied: p } : b);
      }
    });
    setBlocks(tempBlocks);
    setProcesses([]);
  };

  if (loading || isSyncing) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <p className="text-emerald-500 animate-pulse uppercase tracking-[0.5em] text-[10px]">
        {isSyncing ? "Syncing_Leaderboard..." : "Initializing_Memory_Module..."}
      </p>
    </div>
  );

  if (gameState === "summary") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-10 font-mono text-white flex items-center justify-center">
        <div className="max-w-xl w-full border border-white/10 p-12 rounded-[3rem] bg-white/5 text-center">
          <h2 className="text-2xl font-black text-emerald-400 mb-6 underline underline-offset-8 uppercase italic">Final_Report</h2>
          <div className="space-y-4 mb-8 text-left">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">{h.strat}</p>
                  <p className={h.skipped ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{h.name}</p>
                </div>
                <div className="text-right font-black">+{h.score} XP</div>
              </div>
            ))}
          </div>
          <div className="text-center p-8 bg-emerald-500 text-black rounded-[2rem] mb-10 shadow-2xl">
             <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2">Total_Rank_Score</p>
             <p className="text-6xl font-black tracking-tighter">{score}</p>
          </div>
          <Link href="/challenges" className="block w-full py-5 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl transition-all font-black uppercase tracking-widest text-xs">Return_To_Base</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 font-mono text-white bg-[#0a0a0a] min-h-screen">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-10">
              <h2 className="text-emerald-400 font-black mb-1 uppercase tracking-tighter">Memory_Module</h2>
              <p className="text-[10px] text-gray-500 mb-6 italic">{scenarios[currentIndex]?.strategy_type} Logic Active</p>
              
              <div className="mb-10">
                <p className="text-[10px] text-gray-600 uppercase font-black mb-1">Integrity_Score</p>
                <p className="text-5xl font-black tabular-nums">{score}</p>
              </div>

              {gameState === "playing" ? (
                <div className="space-y-2 mb-6">
                  {processes.map(p => <DraggableProcess key={p.id} process={p} />)}
                  {processes.length === 0 && <p className="text-gray-600 text-[10px] uppercase font-bold animate-pulse">Processing_Allocation...</p>}
                </div>
              ) : (
                <button onClick={handleLevelTransition} className="w-full py-5 bg-emerald-500 text-black font-black rounded-xl mb-4 animate-pulse uppercase tracking-widest text-xs">PROCEED_TO_NEXT_MODULE</button>
              )}

              <div className={`p-4 rounded-xl border text-[10px] uppercase mb-4 font-black ${status.includes('⚠') ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-emerald-500/30 text-emerald-400'}`}>
                {status}
              </div>

              {gameState === "playing" && (
                <button onClick={revealSolution} className="w-full text-[10px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors border border-white/5 py-3 rounded-lg font-black italic">
                  [ Unable to solve? Reveal correct solution (-100XP) ]
                </button>
              )}
            </div>
          </div>

          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] uppercase text-gray-500 tracking-widest font-black">Physical_Addresses</h3>
                {showSolution && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full animate-pulse font-black">SOLUTION_MODE_ACTIVE</span>}
            </div>
            {blocks.map(b => (
              <DroppableBlock key={b.id} block={b} occupiedBy={b.occupied} isSolution={showSolution} />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}