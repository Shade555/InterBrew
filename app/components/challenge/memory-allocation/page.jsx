"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { supabase } from "@/lib/supabaseClient";

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
  const [gameState, setGameState] = useState("playing"); // playing | finished | summary
  const [showSolution, setShowSolution] = useState(false);
  const [history, setHistory] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('challenges_memory_scenarios').select('*').order('created_at', { ascending: true });
      if (data) { setScenarios(data); loadLevel(data[0]); }
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

  // Helper to find the correct block for a process based on strategy
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
      setProcesses(prev => prev.filter(p => p.id !== process.id));
      setStatus("✓ VALID_ALLOCATION: Point rewarded.");
      if (processes.length === 1) setGameState("finished");
    } else {
      setScore(prev => Math.max(0, prev - 25)); // Deduct 25 for mistake
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
      setGameState("summary");
    }
  };

  const revealSolution = () => {
    // Deduct heavy points for skipping/revealing
    setScore(prev => Math.max(0, prev - 100));
    setShowSolution(true);
    setGameState("finished");
    setStatus("REVEALING_SOLUTION: Sequence forced to complete.");
    
    // Auto-fill blocks with correct solution
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

  if (gameState === "summary") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-10 font-mono text-white flex items-center justify-center">
        <div className="max-w-xl w-full border border-white/10 p-8 rounded-3xl bg-white/5">
          <h2 className="text-2xl font-black text-emerald-400 mb-6 text-center underline underline-offset-8">FINAL_REPORT</h2>
          <div className="space-y-4 mb-8">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase">{h.strat}</p>
                  <p className={h.skipped ? "text-red-400" : "text-emerald-400"}>{h.name}</p>
                </div>
                <div className="text-right font-black">{h.score} XP</div>
              </div>
            ))}
          </div>
          <div className="text-center p-6 bg-emerald-500 text-black rounded-2xl mb-8">
             <p className="text-[10px] font-bold uppercase opacity-60">Total_Rank_Score</p>
             <p className="text-5xl font-black">{score}</p>
          </div>
          <button onClick={() => window.location.href='/leaderboard'} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold">RETURN_TO_BASE</button>
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
                <p className="text-[10px] text-gray-600 uppercase">Integrity_Score</p>
                <p className="text-5xl font-black">{score}</p>
              </div>

              {gameState === "playing" ? (
                <div className="space-y-2 mb-6">
                  {processes.map(p => <DraggableProcess key={p.id} process={p} />)}
                </div>
              ) : (
                <button onClick={handleLevelTransition} className="w-full py-5 bg-emerald-500 text-black font-black rounded-xl mb-4 animate-pulse">PROCEED_TO_NEXT_MODULE</button>
              )}

              <div className={`p-4 rounded-xl border text-[10px] uppercase mb-4 ${status.includes('⚠') ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-emerald-500/30 text-emerald-400'}`}>
                {status}
              </div>

              {gameState === "playing" && (
                <button onClick={revealSolution} className="w-full text-[10px] text-gray-600 hover:text-white uppercase tracking-widest transition-colors border border-white/5 py-2 rounded-lg">
                  [ Unable to solve? Reveal correct solution (-100XP) ]
                </button>
              )}
            </div>
          </div>

          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase text-gray-500 tracking-widest">Physical_Addresses</h3>
                {showSolution && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full animate-pulse">SOLUTION_MODE_ACTIVE</span>}
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