"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Timer, Zap, CheckCircle2, ChevronRight, ChevronLeft, 
  Trophy, Lock, HelpCircle 
} from "lucide-react";

// --- EMERGENCY FALLBACK ---
const FALLBACK_TASKS = [
  { id: 1, task: "List all files in long format", cmd: "ls -l", xp: 100 },
  { id: 2, task: "Print current working directory", cmd: "pwd", xp: 100 },
  { id: 3, task: "Display kernel version", cmd: "uname -r", xp: 150 }
];

export default function SpeedRun() {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth?.user);

      try {
        const { data: dbData, error } = await supabase
          .from("os_challenges_tasks")
          .select("*")
          .eq("category", "speed-run") 
          .order("sort_order", { ascending: true });

        if (error || !dbData || dbData.length === 0) {
          setTasks(FALLBACK_TASKS);
        } else {
          const mapped = dbData.map(t => ({
            id: t.id,
            task: t.task_description,
            cmd: t.correct_command,
            xp: t.xp_reward
          }));
          setTasks(mapped);
        }
      } catch (e) {
        setTasks(FALLBACK_TASKS);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished && isActive) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isFinished]);

  const handleComplete = async () => {
    setIsActive(false);
    setIsSyncing(true);
    
    // XP is only calculated for tasks that are Correct AND NOT Skipped
    const finalXP = Object.values(answers).reduce((acc, a, idx) => 
      (a.isCorrect && !a.isSkipped) ? acc + (tasks[idx]?.xp || 0) : acc, 0
    );
    
    if (user) {
      try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const { data: existing } = await supabase.from("leaderboard").select("id, xp").eq("user_id", user.id).eq("month", month).eq("year", year).maybeSingle();

        if (existing) {
          await supabase.from("leaderboard").update({ xp: (existing.xp || 0) + finalXP, recorded_at: new Date().toISOString() }).eq("id", existing.id);
        } else {
          await supabase.from("leaderboard").insert([{ user_id: user.id, xp: finalXP, month, year, challenges_completed: 1 }]);
        }
      } catch (err) { console.error("Sync error:", err); }
    }
    setIsSyncing(false);
    setIsFinished(true);
  };

  const handleInputChange = (val) => {
    if (!isActive) setIsActive(true);
    const isCorrect = val.trim() === tasks[currentIndex]?.cmd;
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { input: val, isCorrect, isSkipped: false }
    }));

    if (isCorrect) {
      setFeedback("success");
      setTimeout(() => setFeedback(null), 600);
      if (currentIndex < tasks.length - 1) setTimeout(() => move(1), 400);
    }
  };

  const handleSkip = () => {
    if (!isActive) setIsActive(true);
    const correctCmd = tasks[currentIndex]?.cmd;
    
    // Set answer to the correct command but mark as skipped (0 XP)
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { input: correctCmd, isCorrect: true, isSkipped: true }
    }));

    setFeedback("skipped");
    
    // Auto-move after a short delay so they can see the answer they missed
    if (currentIndex < tasks.length - 1) {
      setTimeout(() => {
        setFeedback(null);
        move(1);
      }, 1500);
    } else {
       setTimeout(() => handleComplete(), 1500);
    }
  };

  const move = (dir) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < tasks.length) setCurrentIndex(next);
  };

  if (loading || isSyncing) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-emerald-500 text-[10px] uppercase tracking-[0.4em]">Processing_Data...</p>
    </div>
  );

  if (!user) return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-black/40 border border-white/10 rounded-3xl text-center backdrop-blur-md font-mono">
      <Lock className="mx-auto mb-4 text-zinc-600" size={48} />
      <h2 className="text-white text-xl font-bold uppercase italic tracking-tight">Auth Required</h2>
      <button onClick={() => window.location.href = '/auth/signin'} className="w-full mt-8 py-4 bg-emerald-500 text-black font-black rounded-2xl uppercase text-xs tracking-widest">Login</button>
    </div>
  );

  const currentXP = Object.values(answers).reduce((acc, a, idx) => 
    (a.isCorrect && !a.isSkipped) ? acc + (tasks[idx]?.xp || 0) : acc, 0
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-12 font-mono">
      {/* HUD Header */}
      <div className="mb-10 flex justify-between items-end px-2">
        <div>
          <p className="text-emerald-500 text-[10px] tracking-widest uppercase mb-1">Root_User: {user.email?.split('@')[0]}</p>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">System_Speedrun</h1>
        </div>
        <div className="flex gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Zap className="text-emerald-400" size={18} />
                <span className="text-xl font-bold text-white tracking-tighter tabular-nums">{currentXP} XP</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Timer className={timeLeft < 10 ? "text-red-500 animate-pulse" : "text-emerald-400"} size={18} />
                <span className="text-xl font-bold text-white tracking-tighter tabular-nums">{timeLeft}s</span>
            </div>
        </div>
      </div>

      {/* Main Terminal Container */}
      <div className={`relative min-h-[420px] bg-[#080808] border-2 rounded-[3rem] p-10 md:p-14 shadow-2xl transition-all duration-500 ${
        isFinished ? "border-emerald-500/20" : feedback === "success" ? "border-emerald-500/40" : feedback === "skipped" ? "border-amber-500/40" : "border-white/5"
      }`}>
        {!isFinished ? (
          <>
            <div className="mb-12">
              <span className="text-zinc-700 text-[10px] font-bold mb-3 block uppercase tracking-[0.3em] underline decoration-emerald-500/30">Module_Sequence_{currentIndex + 1}</span>
              <h2 className="text-3xl text-white font-black leading-tight italic uppercase tracking-tight">
                {tasks[currentIndex]?.task}
              </h2>
            </div>

            <div className={`flex items-center gap-5 bg-white/[0.02] p-7 rounded-[2rem] border transition-all mb-14 group ${feedback === 'skipped' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 focus-within:border-emerald-500/30'}`}>
              <ChevronRight className="text-emerald-500 group-focus-within:translate-x-1 transition-transform" size={24} />
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={answers[currentIndex]?.input || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="enter_command..."
                disabled={feedback === 'skipped'}
                className="bg-transparent border-none outline-none flex-1 text-white text-2xl font-bold caret-emerald-500 placeholder:text-zinc-800 italic"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSkip}
                  title="Get Help (No XP)"
                  className="p-2 text-zinc-600 hover:text-amber-500 transition-colors"
                >
                  <HelpCircle size={24} />
                </button>
                {answers[currentIndex]?.isCorrect && !answers[currentIndex]?.isSkipped && <CheckCircle2 className="text-emerald-500 animate-in zoom-in" size={24} />}
                {answers[currentIndex]?.isSkipped && <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter">Skipped</span>}
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex gap-3">
                <button onClick={() => move(-1)} disabled={currentIndex === 0} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-5 transition-all"><ChevronLeft size={20} /></button>
                <button onClick={() => move(1)} disabled={currentIndex === tasks.length - 1} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-5 transition-all"><ChevronRight size={20} /></button>
              </div>
              <button onClick={handleComplete} className="px-8 py-4 bg-red-950/20 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Terminate</button>
            </div>
          </>
        ) : (
          /* RESULT VIEW */
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-700">
            <Trophy className="text-yellow-500 mb-8" size={72} />
            <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Sync_Complete</h3>
            <div className="grid grid-cols-2 gap-8 mb-14 w-full max-w-xl">
              <div className="bg-[#0c0c0c] border border-white/5 p-10 rounded-[2.5rem]">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-black">Net_XP_Gain</p>
                <p className="text-5xl font-black text-white tracking-tighter">+{currentXP}</p>
              </div>
              <div className="bg-[#0c0c0c] border border-white/5 p-10 rounded-[2.5rem]">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-black">Accuracy</p>
                <p className="text-5xl font-black text-emerald-500 tracking-tighter">
                  {Math.round((Object.values(answers).filter(a => a.isCorrect && !a.isSkipped).length / tasks.length) * 100)}%
                </p>
              </div>
            </div>
            <div className="flex gap-5 w-full max-w-sm">
              <button onClick={() => window.location.reload()} className="flex-1 py-6 bg-white text-black font-black rounded-3xl uppercase text-xs">Re-Run</button>
              <button onClick={() => window.location.href = '/challenges'} className="flex-1 py-6 bg-white/5 text-white border border-white/10 rounded-3xl uppercase text-xs">Exit</button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Map */}
      <div className="mt-12 flex gap-4 px-2">
        {tasks.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              currentIndex === idx ? "bg-white scale-y-125" : 
              (answers[idx]?.isCorrect && !answers[idx]?.isSkipped) ? "bg-emerald-500/50" : 
              answers[idx]?.isSkipped ? "bg-amber-500/50" : "bg-zinc-900"
            }`}
          />
        ))}
      </div>
    </div>
  );
}