"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { supabase } from "../../../lib/supabaseClient";
import { calculateReadinessScore } from "../../../lib/readinessScore";

function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [anchorFixed, setAnchorFixed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const addFormRef = useRef<HTMLDivElement | null>(null);

  const [interviews, setInterviews] = useState<Array<any>>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [difficultyInput, setDifficultyInput] = useState("intermediate");
  const [roundInput, setRoundInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [monthInterviewsMap, setMonthInterviewsMap] = useState<
    Record<number, any[]>
  >({});

  useEffect(() => {
    function handlePointer(e: PointerEvent) {
      if (!containerRef.current) return;
      if (selected != null && anchor) {
        const target = e.target as Node;
        const inContainer = containerRef.current.contains(target);
        const inDropdown = dropdownRef.current?.contains(target);
        const inAddModal = addFormRef.current?.contains(target);
        if (!inContainer && !inDropdown && !inAddModal) {
          setSelected(null);
          setAnchor(null);
          setAnchorFixed(false);
        }
      }
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [selected, anchor]);

  const month = current.getMonth();
  const year = current.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const total = 42;
  const cells = Array.from({ length: total }).map((_, i) => {
    const dayIndex = i - firstDay + 1;
    if (dayIndex <= 0) {
      const d = prevMonthDays + dayIndex;
      return { type: "prev", day: d };
    } else if (dayIndex > daysInMonth) {
      const d = dayIndex - daysInMonth;
      return { type: "next", day: d };
    } else {
      return { type: "current", day: dayIndex };
    }
  });

  function prevMonth() {
    setCurrent(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrent(new Date(year, month + 1, 1));
  }

  function handleDateClick(
    e: React.MouseEvent<HTMLDivElement>,
    d: number,
    type: string,
  ) {
    const el = e.currentTarget as HTMLDivElement;
    setShowAddFormModal(false);
    if (type !== "current") {
      if (type === "prev") {
        setCurrent(new Date(year, month - 1, 1));
      } else if (type === "next") {
        setCurrent(new Date(year, month + 1, 1));
      }
    }
    const rect = el.getBoundingClientRect();
    const left = rect.left;
    const top = rect.bottom;
    if (selected === d) {
      setSelected(null);
      setAnchor(null);
      setAnchorFixed(false);
    } else {
      setSelected(d);
      setAnchor({ left, top });
      setAnchorFixed(true);
    }
  }

  const fetchInterviewsForDay = useCallback(
    async (day: number) => {
      try {
        setLoadingInterviews(true);
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return setInterviews([]);
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const { data, error } = await supabase
          .from("user_interviews")
          .select("*")
          .eq("user_id", userId)
          .eq("interview_date", iso)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Failed to load interviews", error);
          setInterviews([]);
          return;
        }
        setInterviews(data ?? []);
      } finally {
        setLoadingInterviews(false);
      }
    },
    [month, year],
  );

  const fetchInterviewsForMonth = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return setMonthInterviewsMap({});
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`;
      const { data, error } = await supabase
        .from("user_interviews")
        .select("*")
        .eq("user_id", userId)
        .gte("interview_date", start)
        .lte("interview_date", end)
        .order("interview_date", { ascending: true });
      if (error) {
        console.error("Failed to load monthly interviews", error);
        setMonthInterviewsMap({});
        return;
      }
      const map: Record<number, any[]> = {};
      (data ?? []).forEach((iv: any) => {
        try {
          const day = new Date(iv.interview_date).getDate();
          map[day] = map[day] || [];
          map[day].push(iv);
        } catch (e) {
          // ignore
        }
      });
      setMonthInterviewsMap(map);
    } catch (e) {
      console.error(e);
      setMonthInterviewsMap({});
    }
  }, [month, year]);

  useEffect(() => {
    if (selected != null) {
      void fetchInterviewsForDay(selected);
    } else {
      setInterviews([]);
    }
  }, [selected, fetchInterviewsForDay]);

  useEffect(() => {
    void fetchInterviewsForMonth();
  }, [fetchInterviewsForMonth]);

  async function saveInterviewForDay(day: number) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      const userEmail = userData?.user?.email;
      if (!userId) throw new Error("Not signed in");
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const payload = {
        user_id: userId,
        interview_date: iso,
        subject: subjectInput,
        difficulty: difficultyInput,
        round: roundInput,
        notes: notesInput,
        user_email: userEmail,
      };
      const { data, error } = await supabase
        .from("user_interviews")
        .insert(payload)
        .select();
      if (error) {
        console.error("Failed to save interview", error);
        return false;
      }
      await fetchInterviewsForDay(day);
      await fetchInterviewsForMonth();
      setSubjectInput("");
      setDifficultyInput("medium");
      setRoundInput("technical");
      setNotesInput("");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function updateInterviewStatus(id: string | number, status: string) {
    try {
      const { data, error } = await supabase
        .from("user_interviews")
        .update({ status })
        .eq("id", id)
        .select();
      if (error) {
        console.error("Failed to update interview status", error);
        return false;
      }
      if (selected != null) await fetchInterviewsForDay(selected);
      await fetchInterviewsForMonth();
      return true;
    } catch (e) {
      console.error("updateInterviewStatus exception", e);
      return false;
    }
  }

  const monthLabel = current.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-white/10 bg-[#111214] p-4 text-white h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            ◀
          </button>
          <div className="font-semibold text-zinc-100">{monthLabel}</div>
          <button
            onClick={nextMonth}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            ▶
          </button>
        </div>
        <div className="text-xs text-zinc-400">Pending</div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
          <div
            key={`${d}-${idx}`}
            className="text-center text-zinc-500 font-medium"
          >
            {d}
          </div>
        ))}

        {cells.map((cell, idx) => (
          <div key={idx} className="h-8 flex items-center justify-center">
            <div
              onClick={(e) => handleDateClick(e, cell.day, cell.type)}
              role="button"
              tabIndex={0}
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                cell.type === "current"
                  ? selected === cell.day
                    ? "bg-emerald-500/30 border border-emerald-500/50 text-zinc-100"
                    : "text-zinc-300 hover:bg-white/10 border border-transparent"
                  : "text-zinc-600"
              }`}
            >
              <div>{cell.day}</div>
              {cell.type === "current" &&
                (() => {
                  const dayMap = monthInterviewsMap[cell.day] || [];
                  const hasScheduled = dayMap.length > 0;
                  const hasCompleted = dayMap.some(
                    (iv: any) => iv.status === "completed",
                  );
                  const hasMissed = dayMap.some(
                    (iv: any) => iv.status === "missed",
                  );
                  if (hasCompleted) {
                    return (
                      <div className="absolute -right-1 -top-1 bg-emerald-500 rounded-full w-3 h-3 flex items-center justify-center text-[8px] text-white">
                        ✓
                      </div>
                    );
                  }
                  if (hasMissed) {
                    return (
                      <div className="absolute -right-1 -top-1 bg-red-600 rounded-full w-3 h-3 flex items-center justify-center text-[8px] text-white">
                        ✕
                      </div>
                    );
                  }
                  if (hasScheduled) {
                    return (
                      <div className="absolute -right-0.5 -top-0.5 bg-emerald-400 rounded-full w-2 h-2" />
                    );
                  }
                  return null;
                })()}
            </div>
          </div>
        ))}
      </div>

      {selected &&
        anchor &&
        (() => {
          const dd = (
            <div
              ref={dropdownRef}
              className={`${anchorFixed ? "fixed" : "absolute"} z-50 w-72 sm:w-96 bg-black/80 border border-white/20 rounded-lg p-3 shadow-lg text-sm`}
            >
              <div className="text-xs text-zinc-400 mb-2">
                {selected}{" "}
                {current.toLocaleString(undefined, { month: "short" })}
              </div>

              <div className="mb-3">
                <div className="font-semibold text-zinc-100 mb-2">
                  Scheduled interviews
                </div>
                {loadingInterviews ? (
                  <div className="text-xs text-zinc-500">Loading…</div>
                ) : interviews.length ? (
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {interviews.map((iv: any) => (
                      <li
                        key={iv.id}
                        className="p-2 rounded bg-white/5 border border-white/10"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-zinc-100">
                              {iv.subject || "Untitled"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {iv.round} · {iv.difficulty}
                            </div>
                            {iv.notes && (
                              <div className="mt-1 text-xs text-zinc-600">
                                {iv.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {iv.status === "completed" && (
                              <div className="text-xs text-emerald-400">
                                Completed
                              </div>
                            )}
                            {iv.status === "missed" && (
                              <div className="text-xs text-red-400">Missed</div>
                            )}
                            <div className="flex gap-1">
                              {iv.status !== "completed" && (
                                <button
                                  onClick={async () =>
                                    await updateInterviewStatus(
                                      iv.id,
                                      "completed",
                                    )
                                  }
                                  className="text-xs px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {iv.status !== "missed" && (
                                <button
                                  onClick={async () =>
                                    await updateInterviewStatus(iv.id, "missed")
                                  }
                                  className="text-xs px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                  Missed
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-zinc-500">
                    No interviews scheduled
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setShowAddFormModal(true);
                  }}
                  className="px-2 py-1 rounded bg-emerald-600 text-xs hover:bg-emerald-700 transition-colors"
                >
                  + Add
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setAnchor(null);
                    setAnchorFixed(false);
                  }}
                  className="px-2 py-1 rounded bg-white/10 text-xs hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>

              {showAddFormModal &&
                selected &&
                (() => {
                  const modal = (
                    <div className="fixed inset-0 z-60 flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowAddFormModal(false)}
                      />
                      <div
                        ref={addFormRef}
                        className="relative w-full max-w-md p-4 bg-black/80 border border-white/20 rounded-lg text-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => setShowAddFormModal(false)}
                            className="px-2 py-1 rounded bg-white/10 text-xs hover:bg-white/20"
                          >
                            Back
                          </button>
                          <div className="text-sm font-semibold">
                            Add interview
                          </div>
                          <div />
                        </div>
                        <div>
                          <input
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            placeholder="Subject"
                            className="w-full mb-2 rounded px-2 py-1 bg-black/30 border border-white/10 text-sm text-white placeholder:text-zinc-600"
                          />
                          <div className="flex gap-2 mb-2">
                            <select
                              value={difficultyInput}
                              onChange={(e) =>
                                setDifficultyInput(e.target.value)
                              }
                              className="flex-1 rounded px-2 py-1 bg-black/30 border border-white/10 text-sm text-white"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                            <input
                              value={roundInput}
                              onChange={(e) => setRoundInput(e.target.value)}
                              placeholder="Round"
                              className="flex-1 rounded px-2 py-1 bg-black/30 border border-white/10 text-sm text-white placeholder:text-zinc-600"
                            />
                          </div>
                          <textarea
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder="Notes (optional)"
                            className="w-full mb-2 rounded px-2 py-1 bg-black/30 border border-white/10 text-sm text-white placeholder:text-zinc-600"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowAddFormModal(false)}
                              className="px-3 py-1 rounded bg-white/10 text-xs hover:bg-white/20 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (selected) {
                                  await saveInterviewForDay(selected);
                                  setShowAddFormModal(false);
                                }
                              }}
                              className="px-3 py-1 rounded bg-emerald-600 text-xs hover:bg-emerald-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  try {
                    return createPortal(modal, document.body);
                  } catch (e) {
                    return modal;
                  }
                })()}
            </div>
          );

          if (anchorFixed && typeof window !== "undefined") {
            try {
              const ddW = 144;
              const leftRaw = anchor.left;
              const topRaw = anchor.top + 6;
              if (window.innerWidth < 640) {
                const top = Math.min(
                  Math.max(topRaw, 8),
                  Math.max(8, window.innerHeight - 120),
                );
                return createPortal(
                  React.cloneElement(dd, { style: { left: 8, right: 8, top } }),
                  document.body,
                );
              }
              const maxLeft = Math.max(8, window.innerWidth - ddW - 8);
              const left = Math.min(Math.max(leftRaw, 8), maxLeft);
              const top = topRaw;
              return createPortal(
                React.cloneElement(dd, { style: { left, top } }),
                document.body,
              );
            } catch (e) {
              return dd;
            }
          }

          return React.cloneElement(dd, {
            style: { left: anchor.left, top: anchor.top + 36 },
          });
        })()}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [aiScore, setAiScore] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [loadingAiReport, setLoadingAiReport] = useState(true);
  const [regeneratingReport, setRegeneratingReport] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);
  const [activeGraphMetric, setActiveGraphMetric] = useState<
    "modules" | "readiness"
  >("modules");
  const [graphPoints, setGraphPoints] = useState<
    {
      date: string;
      label: string;
      modules_completed: number;
      readiness_score: number | null;
    }[]
  >([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphHoverIdx, setGraphHoverIdx] = useState<number | null>(null);
  const [currentModule, setCurrentModule] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [loadingCurrentModule, setLoadingCurrentModule] = useState(true);

  // Quick stats
  const [streak, setStreak] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [modulesCompleted, setModulesCompleted] = useState<number>(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [readinessData, setReadinessData] = useState<any>(null);

  // Graph data fetch removed — now handled by fetchGraph below

  // Fetch AI Report from Groq
  useEffect(() => {
    const fetchAiReport = async () => {
      try {
        setLoadingAiReport(true);
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const userId = user?.id;

        if (!userId) {
          setAiScore(0);
          setRecommendation("Please log in to see your personalized report.");
          setLoadingAiReport(false);
          return;
        }

        const response = await fetch("/api/ai-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI Report API error:", response.status, errorText);
          throw new Error(`Failed to fetch AI report: ${response.status}`);
        }

        const data = await response.json();
        setAiScore(data.score || 0);
        setRecommendation(data.recommendation || "Keep practicing to improve!");
      } catch (err) {
        console.error("Error fetching AI report:", err);
        setAiScore(65);
        setRecommendation(
          "Keep practicing to improve your interview readiness.",
        );
      } finally {
        setLoadingAiReport(false);
      }
    };

    fetchAiReport();
  }, []);

  // Regenerate AI Report
  const handleRegenerateReport = async () => {
    try {
      setRegeneratingReport(true);
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = user?.id;

      if (!userId) return;

      const response = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, forceRefresh: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "AI Report regeneration error:",
          response.status,
          errorText,
        );
        throw new Error(`Failed to regenerate report: ${response.status}`);
      }

      const data = await response.json();
      setAiScore(data.score || 0);
      setRecommendation(data.recommendation || "Keep practicing to improve!");
    } catch (err) {
      console.error("Error regenerating AI report:", err);
    } finally {
      setRegeneratingReport(false);
    }
  };

  // Fetch quick stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const userId = user.id;

        const [
          dashRes,
          profileRes,
          scenarioProgressRes,
          collectionProgressRes,
          lbRes,
        ] = await Promise.all([
          supabase
            .from("user_dashboards")
            .select("streak")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase.from("profiles").select("xp").eq("id", userId).maybeSingle(),
          supabase
            .from("user_module_progress")
            .select("module_id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("completed", true),
          supabase
            .from("user_collection_module_progress")
            .select("module_id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("completed", true),
          supabase
            .from("leaderboard")
            .select("user_id")
            .order("total_score", { ascending: false }),
        ]);

        setStreak(dashRes.data?.streak ?? 0);
        setTotalXp(Number(profileRes.data?.xp) || 0);

        const scenarioCount = (scenarioProgressRes as any).count ?? 0;
        const collectionCount = (collectionProgressRes as any).count ?? 0;
        setModulesCompleted(scenarioCount + collectionCount);

        if (lbRes.data) {
          const rank = lbRes.data.findIndex((r: any) => r.user_id === userId);
          setLeaderboardRank(rank >= 0 ? rank + 1 : null);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch graph data: last 14 days of modules_completed + readiness scores
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoadingGraph(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [dashRes, aiRes] = await Promise.all([
          supabase
            .from("user_dashboards")
            .select("dashboard_graph")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_ai_reports")
            .select("score, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
        ]);

        // Build last-14-days skeleton
        const days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          const date = d.toISOString().slice(0, 10);
          const label = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return {
            date,
            label,
            modules_completed: 0,
            readiness_score: null as number | null,
          };
        });

        // Fill modules_completed from dashboard_graph
        const stored: { date: string; modules_completed: number }[] =
          Array.isArray(dashRes.data?.dashboard_graph)
            ? dashRes.data.dashboard_graph
            : [];
        stored.forEach((entry) => {
          const idx = days.findIndex((d) => d.date === entry.date);
          if (idx >= 0)
            days[idx].modules_completed = entry.modules_completed || 0;
        });

        // Fill readiness_score: average score per day from user_ai_reports
        const scoresByDay: Record<string, number[]> = {};
        (aiRes.data || []).forEach((row: any) => {
          const date = new Date(row.created_at).toISOString().slice(0, 10);
          if (!scoresByDay[date]) scoresByDay[date] = [];
          scoresByDay[date].push(Number(row.score));
        });
        days.forEach((d) => {
          const scores = scoresByDay[d.date];
          if (scores && scores.length > 0) {
            d.readiness_score = Math.round(
              scores.reduce((a, b) => a + b, 0) / scores.length,
            );
          }
        });

        setGraphPoints(days);
      } catch (err) {
        console.error("Error fetching graph data:", err);
      } finally {
        setLoadingGraph(false);
      }
    };
    fetchGraph();
  }, []);

  // Fetch last activity from profiles
  useEffect(() => {
    const fetchCurrentModule = async () => {
      try {
        setLoadingCurrentModule(true);
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user) {
          setLoadingCurrentModule(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("last_activity")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData?.last_activity) {
          const a = profileData.last_activity;
          if (a.type === "scenario") {
            setCurrentModule({
              name: a.label,
              path: `/scenario-practice`,
            });
          } else if (
            a.type === "collection_mock" ||
            a.type === "collection_problem"
          ) {
            setCurrentModule({
              name: a.label,
              path: `/collections`,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching last activity:", err);
      } finally {
        setLoadingCurrentModule(false);
      }
    };
    fetchCurrentModule();
  }, []);

  return (
    <section className="py-5">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ringDraw {
          from { stroke-dashoffset: 339.3; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        .dash-fade-up   { animation: fadeUp  0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .dash-fade-in   { animation: fadeIn  0.4s ease both; }
        .dash-scale-in  { animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .dash-d1  { animation-delay: 0.05s; }
        .dash-d2  { animation-delay: 0.12s; }
        .dash-d3  { animation-delay: 0.20s; }
        .dash-d4  { animation-delay: 0.28s; }
        .dash-d5  { animation-delay: 0.36s; }
        .dash-d6  { animation-delay: 0.44s; }
      `}</style>

      {/* Top Section: 2-Column Grid - AI Report (Left) and Quick Stats (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4 auto-rows-max lg:auto-rows-fr">
        {/* Left Column - AI Readiness Report */}
        <div className="dash-fade-up dash-d1 rounded-2xl border border-white/10 bg-[#111214] px-6 py-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                AI Readiness Report
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Based on your recent activity
              </p>
            </div>
            <button
              onClick={handleRegenerateReport}
              disabled={regeneratingReport || loadingAiReport}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                regeneratingReport
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300 animate-pulse"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
              aria-label="Regenerate AI report"
            >
              <svg
                className={`w-3 h-3 ${regeneratingReport ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
              </svg>
              Refresh
            </button>
          </div>

          {loadingAiReport ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-500">
                Analysing your progress...
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* Score ring */}
              <div className="relative shrink-0 w-32 h-32">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <defs>
                    <linearGradient
                      id="ringGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                  />
                  {/* Progress */}
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="10"
                    strokeDasharray={`${(aiScore / 100) * 339.3} 339.3`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                    className="transition-all duration-700"
                    style={{
                      animation:
                        "ringDraw 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-400 leading-none">
                    {aiScore}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                    score
                  </span>
                </div>
              </div>

              {/* Right side: label + recommendation + rating bar */}
              <div className="flex-1 min-w-0">
                {/* Rating label */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 border ${
                    readinessData?.readiness_level === "Strong Candidate"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : readinessData?.readiness_level === "Interview Ready"
                        ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                        : readinessData?.readiness_level === "Progressing"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {readinessData?.readiness_level || "Just Starting"}
                </div>

                {/* Recommendation */}
                <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">
                  {recommendation}
                </p>

                {/* Score bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                      style={{ width: `${aiScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="dash-fade-up dash-d2 flex flex-col gap-4">
          {/* Stats grid */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-[#111214] px-6 py-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-5">
              Quick Stats
            </h2>
            {loadingStats ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Day Streak",
                    value: streak,
                    icon: "🔥",
                    color: "text-orange-400",
                    bg: "bg-orange-500/10 border-orange-500/20",
                  },
                  {
                    label: "Total XP",
                    value: (totalXp || 0).toLocaleString(),
                    icon: "⚡",
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10 border-yellow-500/20",
                  },
                  {
                    label: "Modules Done",
                    value: modulesCompleted,
                    icon: "✅",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                  },
                  {
                    label: "Leaderboard",
                    value: leaderboardRank ? `#${leaderboardRank}` : "—",
                    icon: "🏆",
                    color: "text-violet-400",
                    bg: "bg-violet-500/10 border-violet-500/20",
                  },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`dash-scale-in rounded-xl border p-4 flex flex-col gap-2 ${stat.bg}`}
                    style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{stat.icon}</span>
                      <span className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Section - Full Width */}
      <div className="dash-fade-up dash-d3 mt-4 rounded-2xl border border-white/10 bg-[#111214] px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {loadingCurrentModule ? (
            <h3 className="text-lg font-semibold text-zinc-100 text-center sm:text-left">
              Loading...
            </h3>
          ) : currentModule ? (
            <>
              <h3 className="text-lg font-semibold text-zinc-100 text-center sm:text-left">
                {currentModule.name}
              </h3>
              <button
                onClick={() => router.push(currentModule.path)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
              >
                Continue learning
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-zinc-400 text-center sm:text-left">
                No active module. Start learning!
              </h3>
              <button
                onClick={() => router.push("/collections")}
                className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
              >
                Start learning
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress & Calendar Section */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
        {/* Progress Graph */}
        <div className="dash-fade-up dash-d4 rounded-2xl border border-white/10 bg-[#111214] px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Progress Graph
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-2">
              {(["modules", "readiness"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveGraphMetric(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    activeGraphMetric === m
                      ? m === "modules"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-white/5 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m === "modules" ? "Modules Done" : "Readiness Score"}
                </button>
              ))}
              <button
                onClick={() => setShowGridLines(!showGridLines)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  showGridLines
                    ? "border-white/15 bg-white/8 text-zinc-300"
                    : "border-white/8 bg-transparent text-zinc-600"
                }`}
                title="Toggle grid"
              >
                ⊞
              </button>
            </div>
          </div>

          {loadingGraph ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            (() => {
              const isModules = activeGraphMetric === "modules";
              const color = isModules ? "#10b981" : "#3b82f6";
              const gradId = isModules ? "modGrad" : "readGrad";

              const values = graphPoints.map((p) =>
                isModules ? p.modules_completed : (p.readiness_score ?? 0),
              );
              const maxVal = Math.max(...values, isModules ? 1 : 10);

              const W = 460;
              const H = 160;
              const ml = 38;
              const mr = 10;
              const mt = 10;
              const mb = 36;
              const plotW = W - ml - mr;
              const plotH = H - mt - mb;
              const n = graphPoints.length;
              const xStep = plotW / (n - 1);
              const yScale = (v: number) => mt + plotH - (v / maxVal) * plotH;

              const xs = graphPoints.map((_, i) => ml + i * xStep);
              const ys = values.map((v) => yScale(v));

              // Smooth bezier path
              let path = `M ${xs[0]},${ys[0]}`;
              for (let i = 1; i < n; i++) {
                const cpx1 = xs[i - 1] + xStep / 3;
                const cpx2 = xs[i] - xStep / 3;
                path += ` C ${cpx1},${ys[i - 1]} ${cpx2},${ys[i]} ${xs[i]},${ys[i]}`;
              }
              const areaPath = `${path} L ${xs[n - 1]},${mt + plotH} L ${xs[0]},${mt + plotH} Z`;

              const yTicks = Array.from({ length: 5 }, (_, i) =>
                Math.round((i / 4) * maxVal),
              );
              const xLabels = graphPoints.filter(
                (_, i) => i % 2 === 0 || i === n - 1,
              );

              // Tooltip position as % of SVG dimensions
              const hxPct =
                graphHoverIdx !== null ? (xs[graphHoverIdx] / W) * 100 : null;
              const hyPct =
                graphHoverIdx !== null ? (ys[graphHoverIdx] / H) * 100 : null;
              const hVal =
                graphHoverIdx !== null ? values[graphHoverIdx] : null;
              const hPoint =
                graphHoverIdx !== null ? graphPoints[graphHoverIdx] : null;

              return (
                <div className="relative">
                  <svg
                    width="100%"
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const xInSvg = ((e.clientX - rect.left) / rect.width) * W;
                      const nearest = xs.reduce(
                        (best, x, i) =>
                          Math.abs(x - xInSvg) < Math.abs(xs[best] - xInSvg)
                            ? i
                            : best,
                        0,
                      );
                      setGraphHoverIdx(nearest);
                    }}
                    onMouseLeave={() => setGraphHoverIdx(null)}
                  >
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={color}
                          stopOpacity="0.25"
                        />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid */}
                    {showGridLines &&
                      yTicks.map((tick, i) => (
                        <line
                          key={i}
                          x1={ml}
                          y1={yScale(tick)}
                          x2={W - mr}
                          y2={yScale(tick)}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="1"
                        />
                      ))}

                    {/* Axes */}
                    <line
                      x1={ml}
                      y1={mt}
                      x2={ml}
                      y2={mt + plotH}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />
                    <line
                      x1={ml}
                      y1={mt + plotH}
                      x2={W - mr}
                      y2={mt + plotH}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />

                    {/* Y labels */}
                    {yTicks.map((tick, i) => (
                      <text
                        key={i}
                        x={ml - 5}
                        y={yScale(tick) + 3}
                        textAnchor="end"
                        fontSize="8"
                        fill="rgba(161,161,170,0.7)"
                      >
                        {tick}
                      </text>
                    ))}

                    {/* X labels */}
                    {xLabels.map((p, i) => {
                      const idx = graphPoints.findIndex(
                        (g) => g.date === p.date,
                      );
                      return (
                        <text
                          key={i}
                          x={xs[idx]}
                          y={H - 4}
                          textAnchor="middle"
                          fontSize="7.5"
                          fill="rgba(161,161,170,0.6)"
                        >
                          {p.label}
                        </text>
                      );
                    })}

                    {/* Area fill */}
                    <path d={areaPath} fill={`url(#${gradId})`} />

                    {/* Line */}
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dots */}
                    {graphPoints.map((p, i) => {
                      const v = values[i];
                      const isHovered = graphHoverIdx === i;
                      if (v === 0 && !isHovered) return null;
                      return (
                        <circle
                          key={i}
                          cx={xs[i]}
                          cy={ys[i]}
                          r={isHovered ? 5 : 3}
                          fill={isHovered ? "#fff" : color}
                          stroke={isHovered ? color : "rgba(0,0,0,0.5)"}
                          strokeWidth={isHovered ? 2 : 1.5}
                          className="transition-all duration-100"
                        />
                      );
                    })}

                    {/* Vertical crosshair on hover */}
                    {graphHoverIdx !== null && (
                      <line
                        x1={xs[graphHoverIdx]}
                        y1={mt}
                        x2={xs[graphHoverIdx]}
                        y2={mt + plotH}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                    )}
                  </svg>

                  {/* HTML tooltip */}
                  {graphHoverIdx !== null &&
                    hxPct !== null &&
                    hyPct !== null &&
                    hPoint && (
                      <div
                        className="pointer-events-none absolute"
                        style={{
                          left: `clamp(40px, ${hxPct}%, calc(100% - 40px))`,
                          top: `clamp(8px, ${hyPct}%, calc(100% - 40px))`,
                          transform: "translate(-50%, -130%)",
                        }}
                      >
                        <div className="px-2.5 py-1.5 rounded-lg bg-black/80 border border-white/15 backdrop-blur-sm text-center">
                          <p className="text-[10px] text-zinc-400">
                            {hPoint.label}
                          </p>
                          <p
                            className={`text-sm font-semibold ${isModules ? "text-emerald-400" : "text-blue-400"}`}
                          >
                            {hVal}
                            {isModules ? " modules" : " / 100"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              );
            })()
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[10px] text-zinc-500">
                Modules completed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-[10px] text-zinc-500">
                Avg readiness score
              </span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="dash-fade-up dash-d5 h-full">
          <Calendar />
        </div>
      </div>

      {/* Recommended Section */}
      <div className="dash-fade-up dash-d6 mt-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          Recommended for you
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-white/10 bg-[#111214] px-6 py-8 flex flex-col justify-between min-h-48 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-base font-semibold text-zinc-100 mb-6 leading-relaxed">
              Get prepared to tackle different interview scenarios
            </h3>
            <button
              onClick={() => router.push("/scenario-practice")}
              className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Practice
            </button>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-white/10 bg-[#111214] px-6 py-8 flex flex-col justify-between min-h-48 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-base font-semibold text-zinc-100 mb-6 leading-relaxed">
              Operating System Essentials
            </h3>
            <button
              onClick={() => router.push("/collections")}
              className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Learn
            </button>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-white/10 bg-[#111214] px-6 py-8 flex flex-col justify-between min-h-48 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-base font-semibold text-zinc-100 mb-6 leading-relaxed">
              Challenge yourself
            </h3>
            <button
              onClick={() => router.push("/challenges")}
              className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              Challenge
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
