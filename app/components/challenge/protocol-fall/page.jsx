"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trophy, Activity, ShieldAlert, RotateCcw, Home, Loader2 } from "lucide-react";

const FALLBACK_QUESTIONS = [
  {
    q: "Which scheduling algorithm can lead to starvation?",
    options: { A: "Round Robin", B: "Priority Scheduling", C: "FCFS" },
    ans: "B",
    feedback: "PRIORITY: Low-priority processes may never execute.",
    xp: 100
  }
];

export default function ProtocolFall() {
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]);
  const [barPos, setBarPos] = useState(50);
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState(["BOOT_OK", "AWAITING_LOGIC_STREAM..."]);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      try {
        const { data: dbData, error } = await supabase
          .from("os_challenges_tasks")
          .select("*")
          .eq("category", "protocol-fall")
          .order("sort_order", { ascending: true });

        if (error || !dbData || dbData.length === 0) {
          setQuestions(FALLBACK_QUESTIONS);
        } else {
          const mapped = dbData.map(t => ({
            id: t.id,
            q: t.task_description,
            options: t.options_json, 
            ans: t.correct_command,
            feedback: t.feedback_text,
            xp: t.xp_reward || 100
          }));
          setQuestions(mapped);
        }
      } catch (e) {
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const addLog = (msg) => setLogs((prev) => [msg, ...prev].slice(0, 5));

  const resetGame = () => {
    setProgress(0);
    setScore(0);
    setCurrentQ(0);
    setItems([]);
    setLogs(["SYSTEM_REBOOT", "AWAITING_LOGIC_STREAM..."]);
    setGameState("playing");
  };

  const handleSuccess = async (finalScore) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setGameState("success");

    if (user) {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const xpToAward = Math.floor(finalScore / 10); 

      const { data: existing } = await supabase
        .from("leaderboard")
        .select("id, xp")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        await supabase.from("leaderboard").update({ 
          xp: (existing.xp || 0) + xpToAward,
          recorded_at: new Date().toISOString()
        }).eq("id", existing.id);
      } else {
        await supabase.from("leaderboard").insert([{ 
          user_id: user.id, xp: xpToAward, month, year, challenges_completed: 1 
        }]);
      }
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    // STOP ENGINE IF NOT PLAYING OR ARRAY IS EXHAUSTED
    if (gameState !== "playing" || questions.length === 0 || currentQ >= questions.length) return;

    const spawnInterval = setInterval(() => {
      const types = ["A", "B", "C", "virus"];
      setItems((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 80 + 10,
          y: -10,
          type: types[Math.floor(Math.random() * types.length)],
          speed: 1.8 + Math.random() * 1.5 + (progress / 50),
        },
      ]);
    }, 900);

    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const nextItems = prev.map((item) => ({ ...item, y: item.y + item.speed }));
        
        nextItems.forEach((item) => {
          if (item.y > 84 && item.y < 93) {
            const dist = Math.abs(item.x - barPos);
            if (dist < 12) {
              const currentQuestion = questions[currentQ];
              
              // GUARD CLAUSE: Ensure question exists before accessing .ans
              if (!currentQuestion) return;

              if (item.type === currentQuestion.ans) {
                const isLastQ = currentQ === questions.length - 1;
                const newScore = score + 500;
                setScore(newScore);
                addLog("CORRECT: " + currentQuestion.ans);
                
                if (isLastQ) {
                  setProgress(100);
                  handleSuccess(newScore);
                } else {
                  setProgress((p) => Math.min(99, p + (100 / questions.length)));
                  setCurrentQ((prev) => prev + 1);
                }
              } else if (item.type === "virus") {
                setProgress((p) => Math.max(0, p - 20));
                addLog("ALERT: MALWARE_INJECTION");
                triggerGlitch("bg-red-500/20");
              } else {
                setProgress((p) => Math.max(0, p - 12));
                addLog("WRONG: " + currentQuestion.feedback);
                triggerGlitch("bg-amber-500/20");
              }
              item.y = 200; 
            }
          }
        });
        return nextItems.filter((item) => item.y < 100);
      });
    }, 30);

    return () => { 
        clearInterval(spawnInterval); 
        clearInterval(fallInterval); 
    };
  }, [gameState, barPos, progress, currentQ, questions, score]);

  const triggerGlitch = (colorClass) => {
    gameAreaRef.current?.classList.add(colorClass);
    setTimeout(() => gameAreaRef.current?.classList.remove(colorClass), 200);
  };

  const optionStyle = (key) => {
    if (key === "A") return "bg-emerald-500 text-black";
    if (key === "B") return "bg-amber-500 text-black";
    if (key === "C") return "bg-purple-500 text-black";
    return "bg-blue-500 text-black";
  };

  const itemStyle = (type) => {
    if (type === "A") return "bg-emerald-500 text-black rotate-3";
    if (type === "B") return "bg-amber-500 text-black -rotate-3";
    if (type === "C") return "bg-purple-500 text-black rotate-6";
    if (type === "virus") return "bg-red-600 text-white animate-pulse";
    return "bg-blue-500 text-black rotate-3";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-emerald-500">
        <Loader2 className="animate-spin mr-2" /> BOOTING_CORE_SYSTEM...
    </div>
  );

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-4 overflow-hidden select-none">
      <div
        ref={gameAreaRef}
        className="max-w-6xl mx-auto h-[90vh] border border-white/10 rounded-[2rem] relative bg-[#080808] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,1)] transition-colors duration-200"
      >
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col bg-black/40 z-20">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Protocol_Decoder_v2.1</p>
            </div>
            {q && (
              <>
                <h2 className="text-lg font-bold leading-snug mb-6 text-gray-200">{q.q}</h2>
                <div className="space-y-2">
                  {Object.entries(q.options).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl border border-white/5 bg-white/5">
                      <span className={"inline-block w-6 h-6 text-center rounded mr-2 font-black text-[10px] leading-6 " + optionStyle(key)}>{key}</span>
                      <span className="text-[11px] font-bold uppercase text-gray-300">{val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-[9px] text-gray-600 font-black mb-2 uppercase border-b border-white/10 pb-1">Event_Log</p>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p key={i} className={"text-[10px] font-bold " + (i === 0 ? "text-white" : "text-white/20")}>{">"} {log}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Game Engine View */}
        <div className="flex-1 relative bg-black/20 overflow-hidden cursor-none" onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          setBarPos(Math.max(5, Math.min(95, x)));
        }}>
          <div className="absolute top-6 left-8 z-20">
            <p className="text-4xl font-black italic text-emerald-500 tabular-nums">{score}</p>
          </div>

          <div className="absolute top-6 right-8 text-right">
            <p className="text-5xl font-black italic text-white/90 tabular-nums">{progress}%</p>
          </div>

          <div className="absolute top-20 left-8 right-8 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: progress + "%" }} />
          </div>

          {items.map((item) => (
            <div key={item.id} className={"absolute w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-transform " + itemStyle(item.type)} style={{ left: item.x + "%", top: item.y + "%" }}>
              {item.type === "virus" ? <ShieldAlert size={18}/> : item.type}
            </div>
          ))}

          <div className="absolute bottom-10 h-4 bg-white/5 rounded-full border border-white/10" style={{ left: barPos + "%", width: "140px", transform: "translateX(-50%)" }}>
            <div className="h-full bg-white rounded-full shadow-[0_0_15px_#fff]" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase bg-white text-black px-2 py-0.5 rounded">I/O_Head</div>
          </div>
        </div>

        {/* OVERLAYS */}
        {gameState === "start" && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-12 text-center">
            <h1 className="text-7xl font-black italic tracking-tighter mb-4 uppercase">Protocol_Fall</h1>
            <p className="text-zinc-500 text-xs mb-8 tracking-widest uppercase">Decode logic streams to authorize system access.</p>
            <button onClick={() => setGameState("playing")} className="px-12 py-5 border-2 border-white text-white font-black rounded-full uppercase hover:bg-white hover:text-black transition-all text-xs tracking-widest">Authorize_Exam</button>
          </div>
        )}

        {gameState === "success" && (
          <div className="absolute inset-0 bg-[#050505]/95 z-50 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-300">
            <Trophy className="text-emerald-500 mb-6" size={80} />
            <h1 className="text-6xl font-black italic tracking-tighter mb-2 uppercase text-white">Integrity_Verified</h1>
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] mb-12 w-full max-w-sm">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-black">Net_XP_Gain</p>
                <p className="text-6xl font-black text-emerald-500">+{Math.floor(score / 10)}</p>
            </div>
            <div className="flex gap-4 w-full max-w-sm">
                <button onClick={resetGame} className="flex-1 py-5 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                    <RotateCcw size={16} /> Re-Run
                </button>
                <button onClick={() => window.location.href = '/challenges'} className="flex-1 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <Home size={16} /> Exit
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}