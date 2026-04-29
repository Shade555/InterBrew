"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function GoalCompletion() {
  const [xpData, setXpData] = useState({
    totalXp: 0,
    currentXp: 0,
    xpGoal: 1000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXpData = async () => {
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's total XP
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();

        if (profileErr) throw profileErr;

        const totalXp = profile?.total_xp || 0;
        const xpGoal = 1000; // Weekly goal or can be made dynamic

        setXpData({
          totalXp,
          currentXp: totalXp % xpGoal, // XP in current level
          xpGoal,
        });
      } catch (err) {
        console.error("Error fetching XP data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchXpData();
  }, []);

  const percentage = Math.round((xpData.currentXp / xpData.xpGoal) * 100);
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h3 className="text-sm font-semibold text-zinc-100">Goal Completion</h3>

      {/* Circular Progress Ring */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 200 200"
          className="drop-shadow-lg transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="16"
          />

          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#goalGradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.6s ease",
            }}
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient
              id="goalGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-emerald-400">
            {xpData.totalXp.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-400 mt-1">Total XP</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-zinc-300">Weekly XP Goal</p>
      </div>
    </div>
  );
}
