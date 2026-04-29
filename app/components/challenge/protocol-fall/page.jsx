"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    q: "Which scheduling algorithm can lead to starvation?",
    options: { A: "Round Robin", B: "Priority Scheduling", C: "FCFS" },
    ans: "B",
    feedback: "PRIORITY: Low-priority processes may never execute.",
  },
  {
    q: "What does the MMU translate?",
    options: { A: "Virtual to Physical", B: "Physical to Virtual", C: "Disk to RAM" },
    ans: "A",
    feedback: "MMU maps virtual addresses to physical frames.",
  },
  {
    q: "Which page replacement uses the oldest page?",
    options: { A: "LRU", B: "FIFO", C: "Optimal" },
    ans: "B",
    feedback: "FIFO evicts the page loaded longest ago.",
  },
  {
    q: "A semaphore value of -2 means?",
    options: { A: "2 free resources", B: "2 processes waiting", C: "Deadlock" },
    ans: "B",
    feedback: "Negative semaphore value indicates waiting processes.",
  },
  {
    q: "Which is NOT a necessary deadlock condition?",
    options: { A: "Hold and Wait", B: "Preemption", C: "Circular Wait" },
    ans: "B",
    feedback: "Deadlock requires NO preemption; preemption prevents it.",
  },
  {
    q: "What is the primary role of the OS kernel?",
    options: { A: "File rendering", B: "Resource management", C: "Compiling code" },
    ans: "B",
    feedback: "KERNEL manages hardware resources for applications.",
  },
  {
    q: "Which disk scheduling minimizes arm movement?",
    options: { A: "FCFS", B: "SSTF", C: "SCAN" },
    ans: "B",
    feedback: "SSTF services the nearest request first.",
  },
  {
    q: "Thrashing occurs when?",
    options: { A: "CPU is idle", B: "Excessive paging", C: "Disk is full" },
    ans: "B",
    feedback: "THRASHING: high page-fault rate due to low RAM.",
  },
];

export default function ProtocolFall() {
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]);
  const [barPos, setBarPos] = useState(50);
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [logs, setLogs] = useState(["BOOT_OK", "AWAITING_LOGIC_STREAM..."]);
  const gameAreaRef = useRef(null);

  const addLog = (msg) => setLogs((prev) => [msg, ...prev].slice(0, 5));

  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      const types = ["A", "B", "C", "virus"];
      setItems((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 80 + 10,
          y: -10,
          type: types[Math.floor(Math.random() * types.length)],
          speed: 1.8 + Math.random() * 1.5 + progress / 50,
        },
      ]);
    }, 900);

    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const nextItems = prev.map((item) => ({
          ...item,
          y: item.y + item.speed,
        }));

        nextItems.forEach((item) => {
          if (item.y > 84 && item.y < 93) {
            const dist = Math.abs(item.x - barPos);
            if (dist < 12) {
              const correct = QUESTIONS[currentQ].ans;

              if (item.type === correct) {
                setProgress((p) => Math.min(100, p + 12));
                setScore((s) => s + 500);
                addLog("CORRECT: " + QUESTIONS[currentQ].ans);
                setCurrentQ((prev) => (prev + 1) % QUESTIONS.length);
              } else if (item.type === "virus") {
                setProgress((p) => Math.max(0, p - 20));
                addLog("ALERT: MALWARE_INJECTION");
                triggerGlitch("bg-red-500/20");
              } else {
                setProgress((p) => Math.max(0, p - 12));
                addLog("WRONG: " + QUESTIONS[currentQ].feedback);
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
  }, [gameState, barPos, progress, currentQ]);

  useEffect(() => {
    if (progress >= 100) setGameState("success");
  }, [progress]);

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

  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-4 overflow-hidden select-none">
      <div
        ref={gameAreaRef}
        className="max-w-6xl mx-auto h-[90vh] border border-white/10 rounded-[2rem] relative bg-[#080808] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,1)]"
      >
        <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col bg-black/40 z-20">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">
                Protocol_Decoder_v2.1
              </p>
            </div>
            <h2 className="text-lg font-bold leading-snug mb-6 text-gray-200">
              {q.q}
            </h2>
            <div className="space-y-2">
              {Object.entries(q.options).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl border border-white/5 bg-white/5 transition-all hover:bg-white/10"
                >
                  <span
                    className={
                      "inline-block w-6 h-6 text-center rounded mr-2 font-black text-[10px] leading-6 " +
                      optionStyle(key)
                    }
                  >
                    {key}
                  </span>
                  <span className="text-[11px] font-bold uppercase text-gray-300">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-[9px] text-gray-600 font-black mb-2 uppercase border-b border-white/10 pb-1">
              Event_Log
            </p>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className={
                    "text-[10px] font-bold leading-tight " +
                    (i === 0 ? "text-white" : "text-white/20")
                  }
                >
                  {">"} {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex-1 relative bg-black/20 overflow-hidden cursor-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            setBarPos(Math.max(5, Math.min(95, x)));
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

          <div className="absolute top-6 left-8 z-20">
            <p className="text-[8px] text-gray-600 font-black uppercase mb-1">
              Data_Score
            </p>
            <p className="text-4xl font-black italic text-emerald-500 tabular-nums">
              {score}
            </p>
          </div>

          <div className="absolute top-6 right-8 text-right">
            <p className="text-[8px] text-gray-600 font-black uppercase">
              Stream_Integrity
            </p>
            <p className="text-5xl font-black italic text-white/90 tabular-nums leading-none tracking-tighter">
              {progress}%
            </p>
          </div>

          <div className="absolute top-20 left-8 right-8 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300"
              style={{ width: progress + "%" }}
            />
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className={
                "absolute w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-transform " +
                itemStyle(item.type)
              }
              style={{ left: item.x + "%", top: item.y + "%" }}
            >
              {item.type === "virus" ? "!!" : item.type}
            </div>
          ))}

          <div
            className="absolute bottom-10 h-4 bg-white/5 rounded-full border border-white/10"
            style={{
              left: barPos + "%",
              width: "140px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="h-full bg-white rounded-full shadow-[0_0_15px_#fff] transition-all" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase bg-white text-black px-2 py-0.5 rounded">
              I/O_Head
            </div>
          </div>
        </div>

        {gameState === "start" && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-12 text-center">
            <h1 className="text-7xl font-black italic tracking-tighter mb-4 uppercase">
              Protocol_Fall
            </h1>
            <p className="text-gray-500 text-[10px] mb-4 max-w-md uppercase font-bold leading-relaxed tracking-[0.3em]">
              Decode the Kernel Query and catch the correct logic packet.
              Viruses corrupt data. Wrong answers degrade integrity.
            </p>
            <button
              onClick={() => setGameState("playing")}
              className="px-12 py-5 border-2 border-white text-white font-black rounded-full uppercase hover:bg-white hover:text-black transition-all text-xs tracking-widest"
            >
              Authorize_Exam
            </button>
          </div>
        )}

        {gameState === "success" && (
          <div className="absolute inset-0 bg-emerald-500 z-50 flex flex-col items-center justify-center p-12 text-center text-black">
            <h1 className="text-8xl font-black italic tracking-tighter mb-4 uppercase leading-none">
              Passed
            </h1>
            <p className="font-black uppercase tracking-widest mb-12 text-sm italic">
              System Integrity Verified // Telemetry Synced
            </p>
            <Link
              href="/challenges"
              className="px-10 py-4 bg-black text-white font-black rounded-xl uppercase text-xs"
            >
              Return_to_Hub
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

