"use client";

import React from 'react';
import Link from 'next/link';

const CHALLENGES = [
  {
    id: "deadlock-rescue",
    title: "Deadlock_Rescue",
    category: "Process Management",
    description: "Prevent system-wide circular wait by allocating resources to high-priority threads.",
    path: "/deadlock-rescue",
    clearance: "Level_1",
    status: "Operational"
  },
  {
    id: "cycle-master",
    title: "Cycle_Master",
    category: "CPU Scheduling",
    description: "Optimize the kernel scheduler by organizing process bursts for maximum throughput.",
    path: "/cycle-master",
    clearance: "Level_2",
    status: "Active"
  },
  {
    id: "memory-grid",
    title: "Memory_Grid",
    category: "Memory Allocation",
    description: "Map incoming process heaps to physical memory blocks while minimizing fragmentation.",
    path: "/memory-grid",
    clearance: "Level_2",
    status: "Active"
  },
 {
    id: "memory-allocation",
    title: "Memory_Allocation",
    category: "Memory Management",
    description: "Allocate physical frames and manage the MMU under high-pressure speedrun conditions.",
    path: "/memory-allocation",
    clearance: "Level_3",
    status: "Experimental"
  },
  {
    id: "os-speedrun-core",
    title: "Kernel_Logic_Sync",
    category: "OS Foundations",
    description: "Rapid-fire testing of process states, scheduling, and kernel architecture theory.",
    path: "/os-speedrun", // Pointing to the same engine or a specialized speedrun route
    clearance: "Level_3",
    status: "Active"
  },
{
  id: "buffer-catch",
  title: "Protocol_Fall",
  category: "Kernel I/O",
  description: "Catch verified mcq answers to fill the loading buffer while dodging system viruses.",
  path: "/protocol-fall",
  clearance: "Level_1",
  status: "Operational"
},
];

export default function ChallengePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-8 md:p-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 bg-[length:50px_50px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 border-l-4 border-emerald-500 pl-8">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
            Architect_Challenges
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.5em]">
            Select a sub-system to verify kernel integrity
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CHALLENGES.map((challenge) => (
            <Link 
              key={challenge.id} 
              href={challenge.path}
              className="group relative block bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all duration-500 overflow-hidden"
            >
              {/* Animated Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-[80px] transition-all duration-700"></div>

              <div className="flex justify-between items-start mb-12">
                <div className="px-3 py-1 border border-emerald-500/30 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  {challenge.clearance}
                </div>
                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                  {challenge.status}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[10px] text-emerald-500/50 font-black uppercase mb-2 tracking-tighter">
                  {challenge.category}
                </p>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">
                  {challenge.title}
                </h2>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase mb-12 opacity-80 group-hover:opacity-100">
                {challenge.description}
              </p>

              <div className="flex items-center gap-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <span>Initialize_Sequence</span>
                <div className="h-[1px] flex-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-all"></div>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </Link>
          ))}

          {/* Locked/Future Challenge Placeholder */}
          <div className="p-8 border border-white/5 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-30 grayscale cursor-not-allowed">
            <div className="w-12 h-12 border-2 border-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">🔒</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
              Encrypted_Node
            </p>
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8 items-center">
            <div className="text-center">
              <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Total_Games</p>
              <p className="text-2xl font-black italic">05</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="text-center">
              <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Architecture_XP</p>
              <p className="text-2xl font-black italic text-emerald-500">12,450</p>
            </div>
          </div>
          
          <div className="text-[8px] text-gray-800 font-black uppercase tracking-[1em]">
            System_Architect_v6.1.0 // Auth_Validated
          </div>
        </footer>
      </div>
    </div>
  );
}