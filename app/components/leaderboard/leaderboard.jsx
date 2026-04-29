"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export default function Leaderboard() {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        if (!supabase) return;

        // STEP 1: Fetch raw leaderboard data
        let lbQuery = supabase
          .from("leaderboard")
          .select("user_id, total_score, challenges_completed, accuracy, month, year")
          .order("total_score", { ascending: false });

        if (selectedMonth !== "All") lbQuery = lbQuery.eq("month", parseInt(selectedMonth));
        if (selectedYear) lbQuery = lbQuery.eq("year", parseInt(selectedYear));

        const { data: lbData, error: lbError } = await lbQuery;
        if (lbError) throw lbError;

        if (lbData && lbData.length > 0) {
          // STEP 2: Fetch profiles for these specific users to avoid join errors
          const userIds = lbData.map(entry => entry.user_id);
          const { data: profData, error: profError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds);

          if (profError) throw profError;

          // STEP 3: Merge the data manually
          const mergedData = lbData.map((entry, index) => {
            const profile = profData?.find(p => p.id === entry.user_id);
            return {
              id: entry.user_id + index,
              rank: index + 1,
              user_name: profile?.full_name || profile?.email || "Anonymous Architect",
              score: entry.total_score || 0,
              challenges: entry.challenges_completed || 0,
              accuracy: entry.accuracy || 0,
              company: "Independent"
            };
          });

          setLeaderboard(mergedData);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Leaderboard Sync Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="relative min-h-screen bg-black/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            LEADERBOARD
          </h1>
          <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">
            Top performing system architects
          </p>
        </div>

        {/* Filters */}
        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-xl mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-gray-500 text-xs font-mono uppercase">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none cursor-pointer"
              >
                <option value="All">All Time</option>
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-500 text-xs font-mono uppercase">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-gray-500 text-xs font-mono uppercase">
              Nodes_Active: <span className="text-emerald-400">{leaderboard.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-emerald-400 font-mono">RETRIEVING_DATA...</div>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Podium (Top 3) */}
            {leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-4 p-8 bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-white/5">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => (
                  <div key={user.id} className={`text-center ${i === 1 ? "-mt-6" : ""}`}>
                    <div className={`mx-auto mb-3 rounded-full border-2 flex items-center justify-center font-black bg-black/40
                      ${i === 1 ? "w-20 h-20 text-3xl border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]" : "w-16 h-16 text-xl border-gray-500 text-gray-400"}`}>
                      {i === 1 ? "1" : i === 0 ? "2" : "3"}
                    </div>
                    <p className="text-white font-bold text-sm truncate max-w-[120px]">{user.user_name}</p>
                    <p className="text-emerald-400 font-mono font-bold text-lg">{user.score.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10">
              <span className="col-span-1 text-center">Rank</span>
              <span className="col-span-5">Architect</span>
              <span className="col-span-2 text-right">Score_XP</span>
              <span className="col-span-2 text-right">Missions</span>
              <span className="col-span-2 text-right">Sync_Acc</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors items-center">
                  <div className="col-span-1 text-center font-mono">
                    {entry.rank <= 3 ? 
                      <span className="text-xl">{entry.rank === 1 ? "🏆" : entry.rank === 2 ? "🥈" : "🥉"}</span> : 
                      <span className="text-gray-500">{entry.rank}</span>
                    }
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {entry.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-white font-medium text-sm truncate">{entry.user_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase">{entry.company}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold font-mono">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right text-gray-400 font-mono">
                    {entry.challenges}
                  </div>
                  <div className="col-span-2 text-right font-mono">
                    <span className={entry.accuracy >= 90 ? "text-emerald-400" : entry.accuracy >= 75 ? "text-yellow-500" : "text-red-400"}>
                      {Math.round(entry.accuracy)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-20 border-t border-white/5">
                <p className="text-gray-500 font-mono text-sm uppercase tracking-tighter">No_Data_Sequences_Found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}