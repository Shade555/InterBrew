"use client";

import { useState } from "react";

interface ChecklistCardProps {
  title: string;
  icon: string;
  items: string[];
}

export function ChecklistCard({ title, icon, items }: ChecklistCardProps) {
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false));

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === index ? !v : v)));
  };

  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="card-glass rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            {done}/{items.length} completed
          </p>
        </div>
        <div className="relative w-10 h-10">
          <svg width="40" height="40" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray={`${100.53}`}
              strokeDashoffset={`${100.53 * (1 - pct / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            {pct}%
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-3 bg-none border-none cursor-pointer text-left p-1"
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                checked[i]
                  ? "bg-primary border-primary"
                  : "border-white/20"
              }`}
            >
              {checked[i] && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
            <span
              className={`text-xs ${
                checked[i] ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}


