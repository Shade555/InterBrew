"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SPEED_RUN_TASKS as FALLBACK_TASKS } from "@/data/osData";
import { 
  Timer, Zap, CheckCircle2, ChevronRight, ChevronLeft, 
  Terminal, Trophy, Lock, Home, RefreshCcw 
} from "lucide-react";

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

  const inputRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      // Auth Check
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth?.user);

      // Fetch from our new clearly named table
      try {
        const { data: dbData, error } = await supabase
          .from("os_challenges_tasks")
          .select("*")
          .eq("category", "speed-run") // ensures we only get Speed Run tasks
          .order("sort_order", { ascending: true });

        if (error || !dbData || dbData.length === 0) {
          setTasks(FALLBACK_TASKS);
        } else {
          // Map DB to Component Keys
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

  // Timer Logic
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
    setIsFinished(true);

    const totalXP = Object.values(answers).reduce((acc, a, idx) => a.isCorrect ? acc + tasks[idx].xp : acc, 0);
    const accuracy = Math.round((Object.values(answers).filter(a => a.isCorrect).length / tasks.length) * 100);
    
    if (user) {
      await supabase.from("challenge_logs").insert({
        user_id: user.id,
        game_name: "OS Command Speed Run",
        xp_earned: totalXP,
        accuracy_score: accuracy,
      });
    }
  };

  const handleInputChange = (val) => {
    if (!isActive) setIsActive(true);
    const isCorrect = val.trim() === tasks[currentIndex].cmd;
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { input: val, isCorrect }
    }));

    if (isCorrect) {
      setFeedback("success");
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const move = (dir) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < tasks.length) setCurrentIndex(next);
  };

  if (loading) return <div className="p-10 text-emerald-500 font-mono">LOADING SYSTEM...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-black/40 border border-white/10 rounded-3xl text-center backdrop-blur-md">
        <Lock className="mx-auto mb-4 text-zinc-600" size={48} />
        <h2 className="text-white text-xl font-bold">Unauthorized Access</h2>
        <p className="text-zinc-500 mt-2 mb-6">Login required to sync XP to the global leaderboard.</p>
        <button onClick={() => window.location.href = '/auth/signin'} className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl transition-transform active:scale-95">Sign In</button>
      </div>
    );
  }

  const finalXP = Object.values(answers).reduce((acc, a, idx) => a.isCorrect ? acc + tasks[idx].xp : acc, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* HUD Header */}
      <div className="mb-8 flex justify-between items-end px-2">
        <div>
          <p className="text-emerald-500 font-mono text-[10px] tracking-widest uppercase mb-1">Session_Root: {user.email}</p>
          <h1 className="text-4xl font-black text-white">SYSTEM_SPEEDRUN</h1>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Timer className={timeLeft < 10 ? "text-red-500 animate-pulse" : "text-emerald-400"} />
            <span className="text-2xl font-mono font-bold text-white tracking-tighter">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Terminal */}
      <div className={`relative min-h-100 bg-[#0c0d0e] border-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 ${
        isFinished ? "border-emerald-500/20" : feedback === "success" ? "border-emerald-500/50 shadow-emerald-500/5" : "border-white/5"
      }`}>
        {!isFinished ? (
          <>
            <div className="mb-10">
              <span className="text-zinc-700 text-xs font-mono mb-2 block uppercase tracking-widest underline decoration-emerald-500/20">Instruction_Set_{currentIndex + 1}</span>
              <h2 className="text-2xl text-white font-medium leading-relaxed font-mono">
                {tasks[currentIndex].task}
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 focus-within:border-emerald-500/40 transition-all mb-12">
              <ChevronRight className="text-emerald-500" />
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={answers[currentIndex]?.input || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="root@kernel:~#"
                className="bg-transparent border-none outline-none flex-1 text-emerald-50 text-xl font-mono caret-emerald-500 placeholder:text-zinc-800"
                autoComplete="off"
                spellCheck="false"
              />
              {answers[currentIndex]?.isCorrect && <CheckCircle2 className="text-emerald-500 animate-in zoom-in" />}
            </div>

            {/* Navigation & Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div className="flex gap-2">
                <button onClick={() => move(-1)} disabled={currentIndex === 0} className="p-3 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-10 transition-all"><ChevronLeft /></button>
                <button onClick={() => move(1)} disabled={currentIndex === tasks.length - 1} className="p-3 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-10 transition-all"><ChevronRight /></button>
              </div>
              <button onClick={handleComplete} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 tracking-tighter transition-all">ABORT_MISSION</button>
            </div>
          </>
        ) : (
          /* RESULT VIEW */
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Trophy className="text-yellow-500 mb-6" size={64} />
            <h3 className="text-3xl font-black text-white italic tracking-tighter">DATA_SYNC_COMPLETE</h3>
            <p className="text-zinc-500 font-sans mt-2 mb-10">Kernel stats have been encrypted and uploaded to the cloud.</p>
            
            <div className="flex gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl min-w-35">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-mono">Net XP</p>
                <p className="text-4xl font-bold text-yellow-500">+{finalXP}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl min-w-35">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-mono">Sync Rate</p>
                <p className="text-4xl font-bold text-emerald-400">
                  {Math.round((Object.values(answers).filter(a => a.isCorrect).length / tasks.length) * 100)}%
                </p>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform">Re-initialize</button>
              <button onClick={() => window.location.href = '/'} className="flex-1 py-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all">Home</button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Map */}
      <div className="mt-8 flex gap-3 px-2">
        {tasks.map((_, idx) => (
          <div 
            key={idx}
            onClick={() => !isFinished && setCurrentIndex(idx)}
            className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
              currentIndex === idx ? "bg-white" : 
              answers[idx]?.isCorrect ? "bg-emerald-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}