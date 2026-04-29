"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Since you mentioned there is no company table anymore, 
// we will treat these as labels or categories if needed.
const COMPANIES = ["Meta", "Amazon", "Netflix", "Google", "Apple"];

const COMPANY_COLORS = {
  Meta: "#3b82f6",
  Amazon: "#f97316",
  Netflix: "#ef4444",
  Google: "#22c55e",
  Apple: "#6b7280",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export default function Leaderboard() {
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        if (!supabase) {
          setUseMockData(true);
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Query based on your specific schema: total_score and xp
        // We also fetch user metadata from the auth table via the foreign key
        let query = supabase
          .from("leaderboard")
          .select(`
            *,
            user:user_id ( 
              email, 
              raw_user_meta_data 
            )
          `)
          .order("total_score", { ascending: false });

        // Filter by month if selected
        if (selectedMonth !== "All") {
          query = query.eq("month", parseInt(selectedMonth));
        }

        // Filter by year if selected
        if (selectedYear) {
          query = query.eq("year", parseInt(selectedYear));
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform data to match UI expectations
          // We calculate rank dynamically based on the sorted index
          const transformedData = data.map((entry, index) => ({
            id: entry.id,
            rank: index + 1,
            user_name: entry.user?.raw_user_meta_data?.full_name || entry.user?.email || "Anonymous User",
            company: "Independent", // Placeholder since company table is gone
            score: entry.total_score || entry.xp || 0,
            challenges: entry.challenges_completed || 0,
            accuracy: entry.accuracy || 0,
          }));

          setLeaderboard(transformedData);
          setUseMockData(false);
        } else {
          setLeaderboard([]);
          setUseMockData(false);
        }
      } catch (err) {
        console.error("Leaderboard error:", err.message);
        setUseMockData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedMonth, selectedYear]);

  const getCompanyColor = (company) => COMPANY_COLORS[company] || "#10b981";

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
            KERNEL_LEADERBOARD
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
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
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
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
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
            {/* Podium (Only for All-Time/Top scores) */}
            {leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-4 p-8 bg-linear-to-b from-emerald-500/10 to-transparent border-b border-white/5">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => (
                  <div key={user.id} className={`text-center ${i === 1 ? "-mt-6" : ""}`}>
                    <div className={`mx-auto mb-3 rounded-full border-2 flex items-center justify-center font-black bg-black/40
                      ${i === 1 ? "w-20 h-20 text-3xl border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]" : "w-16 h-16 text-xl border-gray-500 text-gray-400"}`}>
                      {i === 1 ? "1" : i === 0 ? "2" : "3"}
                    </div>
                    <p className="text-white font-bold text-sm truncate max-w-30">{user.user_name}</p>
                    <p className="text-emerald-400 font-mono font-bold text-lg">{user.score.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10">
              <span className="col-span-1 text-center">Rank</span>
              <span className="col-span-5">Architect</span>
              <span className="col-span-2 text-right">Score_XP</span>
              <span className="col-span-2 text-right">Missions</span>
              <span className="col-span-2 text-right">Sync_Acc</span>
            </div>

            <div className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors items-center">
                  <div className="col-span-1 text-center font-mono">
                    {entry.rank <= 3 ? <span className="text-xl">{entry.rank === 1 ? "🏆" : entry.rank === 2 ? "🥈" : "🥉"}</span> : <span className="text-gray-500">{entry.rank}</span>}
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