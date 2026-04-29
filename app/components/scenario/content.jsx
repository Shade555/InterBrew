"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Modules from "./modules";
import "./content.css";

function getLocalDateKey(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const badgeColors = {
  Outstanding: "text-sky-300 bg-sky-400/10 border-sky-500/20",
  Excellent: "text-violet-300 bg-violet-400/10 border-violet-500/20",
  Good: "text-amber-300 bg-amber-400/10 border-amber-500/20",
  Average: "text-gray-400 bg-gray-400/10 border-gray-600/20",
};

const ScoreBar = ({ score }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full bg-white/30 transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-xs text-gray-400 w-7 text-right">{score}</span>
  </div>
);

export default function Content({
  selectedScenario,
  onDeselectScenario,
  onStartPractice,
  onModuleSelect,
}) {
  const [tab, setTab] = useState("overview");
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const [overviewStats, setOverviewStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsFetched, setInsightsFetched] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContentData() {
      if (!supabase) {
        console.warn("Supabase client not configured");
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setOverviewStats([]);
          setRecentActivity([]);
          setInsights([]);
          setChartData([]);
          return;
        }

        const [
          { data: scenarioData, error: scenarioError },
          { data: modulesData, error: modulesError },
          { data: progressData, error: progressError },
          { data: profileData, error: profileError },
          { data: dashData },
        ] = await Promise.all([
          supabase.from("scenarios").select("id, title"),
          supabase.from("modules").select("id, scenario_id"),
          supabase
            .from("user_module_progress")
            .select("module_id, completed")
            .eq("user_id", user.id),
          supabase
            .from("profiles")
            .select("daily_xp")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("user_dashboards")
            .select("graph_data")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (scenarioError || modulesError || progressError) {
          console.error("Failed to load scenario history data:", {
            scenarioError,
            modulesError,
            progressError,
          });
          setOverviewStats([]);
          setChartData([]);
          setRecentActivity([]);
          return;
        }

        if (profileError) {
          console.warn("profiles unavailable, defaulting XP to 0", profileError);
        }

        const completedModuleIds = new Set(
          (progressData || [])
            .filter((row) => row.completed)
            .map((row) => row.module_id),
        );

        const scenariosWithProgress = (scenarioData || [])
          .map((scenario) => {
            const scenarioModules = (modulesData || []).filter(
              (m) => m.scenario_id === scenario.id,
            );
            const totalModules = scenarioModules.length;
            const completedModules = scenarioModules.filter((m) =>
              completedModuleIds.has(m.id),
            ).length;

            const progress =
              totalModules > 0
                ? Math.round((completedModules / totalModules) * 100)
                : 0;

            let badge = "Average";
            if (progress === 100) badge = "Outstanding";
            else if (progress >= 75) badge = "Excellent";
            else if (progress >= 40) badge = "Good";

            return {
              id: scenario.id,
              scenario: scenario.title,
              date: `${completedModules}/${totalModules} modules completed`,
              score: progress,
              badge,
              completedModules,
              totalModules,
            };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);

        const scopedProgress = selectedScenario?.id
          ? scenariosWithProgress.filter((s) => s.id === selectedScenario.id)
          : scenariosWithProgress;

        const completedModulesTotal = scopedProgress.reduce(
          (sum, row) => sum + row.completedModules,
          0,
        );
        const totalModulesTotal = scopedProgress.reduce(
          (sum, row) => sum + row.totalModules,
          0,
        );

        // Get daily XP from profiles table
        const todayXp = profileError ? 0 : (profileData?.daily_xp || 0);

        const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const now = new Date();
        const mondayOffset = (now.getDay() + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(now.getDate() - mondayOffset);

        // Use stored chart points from user_dashboards if they cover this week,
        // otherwise fall back to a fresh skeleton with today's XP filled in
        const today = now.toISOString().slice(0, 10);
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          return d.toISOString().slice(0, 10);
        });

        const storedPoints = dashData?.graph_data?.chartPoints || [];
        const storedIsThisWeek =
          storedPoints.length === 7 && storedPoints[0]?.date === weekDates[0];

        const chartPoints = storedIsThisWeek
          ? storedPoints
          : weekDates.map((date, i) => ({
              date,
              label: weekdayLabels[i],
              displayDate: `${date.slice(8)}/${date.slice(5, 7)}`,
              score: date === today ? todayXp : 0,
            }));

        const hoursSpent = (completedModulesTotal * 30) / 60;

        const overviewStatsData = [
          {
            label: "Modules Done",
            value: `${completedModulesTotal}/${totalModulesTotal}`,
            sub: null,
          },
          {
            label: "Daily XP",
            value: `${todayXp}`,
            sub: null,
          },
        ];

        setOverviewStats(overviewStatsData);
        setChartData(chartPoints);
        setRecentActivity(scenariosWithProgress);
        setInsights([]);

        // Save non-chart dashboard metadata (chart points are written by lesson.jsx on XP earn)
        try {
          await supabase.from("user_dashboards").upsert(
            {
              user_id: user.id,
              graph_data: {
                ...(dashData?.graph_data || {}),
                completedModules: completedModulesTotal,
                totalModules: totalModulesTotal,
                hoursSpent: hoursSpent.toFixed(1),
              },
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
        } catch (dashboardErr) {
          console.warn("Failed to save dashboard data:", dashboardErr);
        }
      } catch (err) {
        console.error("Failed to fetch content data:", err);
        setOverviewStats([]);
        setRecentActivity([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchContentData();
  }, [selectedScenario?.id]);

  // Fetch AI insights once when the insights tab is opened
  useEffect(() => {
    if (tab !== "insights" || insightsFetched || insightsLoading) return;
    setInsightsLoading(true);
    fetch("/api/scenario-insights")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tips)) setInsights(data.tips);
        setInsightsFetched(true);
      })
      .catch((err) => console.error("Failed to load insights:", err))
      .finally(() => setInsightsLoading(false));
  }, [tab, insightsFetched, insightsLoading]);

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* If a scenario is selected, show modules instead of chart */}
      {selectedScenario ? (
        <>
          <div className="flex items-start justify-between shrink-0">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {selectedScenario.title}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedScenario.description}
              </p>
            </div>
            <button
              onClick={onDeselectScenario}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition shrink-0"
            >
              ← Back to Graph
            </button>
          </div>
          {/* Modules list for selected scenario */}
          <div className="flex-1 min-h-0">
            <Modules
              selectedScenario={selectedScenario}
              onSelect={onModuleSelect}
            />
          </div>
        </>
      ) : (
        <>
          {/* Overall Dashboard */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-white">Overall</h1>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Track and improve your interview skills
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/4 rounded-xl p-1 w-fit border border-white/8">
            {["overview", "history", "insights"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  tab === t
                    ? "text-white border border-emerald-500/50"
                    : "text-gray-500 hover:border hover:border-emerald-500/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Modules Done",
                    value:
                      overviewStats.find((s) =>
                        s.label?.toLowerCase().includes("module"),
                      )?.value ?? "—",
                    sub:
                      overviewStats.find((s) =>
                        s.label?.toLowerCase().includes("module"),
                      )?.sub ?? null,
                    color: "text-white",
                  },
                  {
                    label: "Daily XP",
                    value:
                      overviewStats.find(
                        (s) =>
                          s.label?.toLowerCase().includes("xp") ||
                          s.label?.toLowerCase().includes("daily") ||
                          s.label?.toLowerCase().includes("avg") ||
                          s.label?.toLowerCase().includes("score"),
                      )?.value ??
                      (chartData.length >= 2
                        ? (
                            chartData.reduce((a, b) => a + (b.score || 0), 0) /
                            chartData.length
                          ).toFixed(1)
                        : "—"),
                    sub:
                      overviewStats.find(
                        (s) =>
                          s.label?.toLowerCase().includes("xp") ||
                          s.label?.toLowerCase().includes("daily") ||
                          s.label?.toLowerCase().includes("avg") ||
                          s.label?.toLowerCase().includes("score"),
                      )?.sub ?? null,
                    color: "text-white",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/3 border border-white/8 rounded-xl p-3 hover:border-emerald-500/30 transition-colors duration-200"
                  >
                    <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                    <p className={`text-xl font-semibold ${stat.color}`}>
                      {stat.value}
                    </p>
                    {stat.sub && (
                      <p className="text-xs text-gray-500">↑ {stat.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Performance Chart
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Score trend in current week
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                  {(() => {
                    const now = new Date();
                    const weekdayLabels = [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ];
                    const fullWeekdayLabels = [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ];
                    const mondayOffset = (now.getDay() + 6) % 7;
                    const weekStart = new Date(now);
                    weekStart.setHours(0, 0, 0, 0);
                    weekStart.setDate(now.getDate() - mondayOffset);

                    const fallbackData = Array.from({ length: 7 }, (_, idx) => {
                      const d = new Date(weekStart);
                      d.setDate(weekStart.getDate() + idx);
                      return {
                        date: getLocalDateKey(d),
                        label: weekdayLabels[idx],
                        displayDate: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
                        score: 0,
                      };
                    });

                    const data =
                      chartData.length === 7 ? chartData : fallbackData;

                    const w = 540;
                    const h = 220;
                    const margin = { top: 12, right: 14, bottom: 42, left: 36 };
                    const plotW = w - margin.left - margin.right;
                    const plotH = h - margin.top - margin.bottom;

                    const scores = data.map((d) => d.score);
                    const xStep = data.length > 0 ? plotW / data.length : 0;

                    // Dynamic y-axis: round max up to a nice ceiling
                    const maxScore = Math.max(...scores, 1);
                    const rawCeil = maxScore * 1.15; // 15% headroom
                    const magnitude = Math.pow(10, Math.floor(Math.log10(rawCeil)));
                    const niceStep = [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= rawCeil / 4) || magnitude * 10;
                    const yMax = Math.ceil(rawCeil / niceStep) * niceStep;
                    const numTicks = 4;
                    const tickStep = yMax / numTicks;
                    const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => Math.round(i * tickStep));

                    const yScale = (v) =>
                      margin.top + ((yMax - v) / yMax) * plotH;

                    // Origin point at O (left margin, bottom)
                    const originX = margin.left;
                    const originY = h - margin.bottom;

                    const xs = data.map(
                      (_, i) => margin.left + (i + 1) * xStep,
                    );
                    const ys = data.map((d) => yScale(d.score));

                    const xTickIndices = data.map((_, idx) => idx);
                    const todayIso = getLocalDateKey(now);
                    const todayIdx = data.findIndex(
                      (point) => point.date === todayIso,
                    );
                    const activeLastIdx =
                      todayIdx >= 0 ? todayIdx : data.length - 1;

                    // Generate single green line from origin O through current day
                    const generateMainPath = () => {
                      let path = `M ${originX},${originY}`;
                      for (let i = 0; i <= activeLastIdx; i++) {
                        if (i === 0) {
                          path += ` L ${xs[i]},${ys[i]}`;
                        } else {
                          const cpx1 = xs[i - 1] + xStep / 3;
                          const cpx2 = xs[i] - xStep / 3;
                          path += ` C ${cpx1},${ys[i - 1]} ${cpx2},${ys[i]} ${xs[i]},${ys[i]}`;
                        }
                      }
                      return path;
                    };

                    const linePath = generateMainPath();
                    const areaPath = `${linePath} L ${xs[activeLastIdx]},${originY} L ${originX},${originY} Z`;

                    // percentage positions for HTML overlay (immune to SVG distortion)
                    const hxPct =
                      hoverIdx !== null ? (xs[hoverIdx] / w) * 100 : null;
                    const hyPct =
                      hoverIdx !== null ? (ys[hoverIdx] / h) * 100 : null;
                    const hScore =
                      hoverIdx !== null ? data[hoverIdx]?.score : null;
                    const hDate =
                      hoverIdx !== null
                        ? `${data[hoverIdx]?.label} ${data[hoverIdx]?.displayDate}`
                        : null;
                    const todayScore =
                      todayIdx >= 0 && todayIdx < data.length
                        ? (data[todayIdx]?.score ?? 0)
                        : 0;
                    const todayPointXPct =
                      todayIdx >= 0 ? (xs[todayIdx] / w) * 100 : null;
                    const todayPointYPct =
                      todayIdx >= 0 ? (ys[todayIdx] / h) * 100 : null;

                    const todayLabel = `${fullWeekdayLabels[(now.getDay() + 6) % 7]} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

                    return (
                      <>
                        <svg
                          ref={svgRef}
                          viewBox={`0 0 ${w} ${h}`}
                          className="w-full h-full cursor-crosshair"
                          preserveAspectRatio="none"
                          onMouseMove={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const xInSvg =
                              ((e.clientX - rect.left) / rect.width) * w;
                            const clampedX = Math.max(
                              margin.left,
                              Math.min(w - margin.right, xInSvg),
                            );
                            const visibleIndices = Array.from(
                              { length: activeLastIdx + 1 },
                              (_, i) => i,
                            );
                            const nearestIdx = visibleIndices.reduce(
                              (best, i) =>
                                Math.abs(xs[i] - clampedX) <
                                Math.abs(xs[best] - clampedX)
                                  ? i
                                  : best,
                              0,
                            );
                            setHoverIdx(nearestIdx);
                          }}
                          onMouseLeave={() => setHoverIdx(null)}
                        >
                          <defs>
                            <linearGradient
                              id="greenAreaGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0"
                              />
                            </linearGradient>
                            <filter
                              id="glow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feGaussianBlur
                                stdDeviation="1.5"
                                result="blur"
                              />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {yTicks.map((tick, i) => {
                            const y = yScale(tick);
                            return (
                              <g key={i}>
                                <line
                                  x1={margin.left}
                                  y1={y}
                                  x2={w - margin.right}
                                  y2={y}
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeWidth="1"
                                />
                                <text
                                  x={margin.left - 8}
                                  y={y + 3}
                                  fill="rgba(148,163,184,0.75)"
                                  fontSize="8"
                                  textAnchor="end"
                                >
                                  {tick === 0 ? "O" : tick}
                                </text>
                              </g>
                            );
                          })}

                          <line
                            x1={margin.left}
                            y1={margin.top}
                            x2={margin.left}
                            y2={h - margin.bottom}
                            stroke="rgba(255,255,255,0.22)"
                            strokeWidth="1"
                          />
                          <line
                            x1={margin.left}
                            y1={h - margin.bottom}
                            x2={w - margin.right}
                            y2={h - margin.bottom}
                            stroke="rgba(255,255,255,0.22)"
                            strokeWidth="1"
                          />

                          {/* Green gradient area under the line */}
                          <path d={areaPath} fill="url(#greenAreaGrad)" />

                          {/* Main green line from origin O to current day */}
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                            vectorEffect="non-scaling-stroke"
                          />

                          {todayIdx >= 0 && (
                            <>
                              <circle
                                cx={xs[todayIdx]}
                                cy={ys[todayIdx]}
                                r="2.8"
                                fill="#10b981"
                                stroke="rgba(16,185,129,0.35)"
                                strokeWidth="4"
                              />
                              <circle
                                cx={xs[todayIdx]}
                                cy={ys[todayIdx]}
                                r="1.8"
                                fill="#ffffff"
                              />
                            </>
                          )}

                          {xTickIndices
                            .filter((idx, i, arr) => arr.indexOf(idx) === i)
                            .map((idx) => (
                              <g key={`${data[idx].date}-${idx}`}>
                                <text
                                  x={xs[idx]}
                                  y={h - 16}
                                  fill={
                                    idx === todayIdx
                                      ? "rgba(16,185,129,0.95)"
                                      : "rgba(148,163,184,0.75)"
                                  }
                                  fontSize="8"
                                  fontWeight={idx === todayIdx ? "700" : "400"}
                                  textAnchor="middle"
                                >
                                  {data[idx].label}
                                </text>
                                <text
                                  x={xs[idx]}
                                  y={h - 7}
                                  fill="rgba(148,163,184,0.6)"
                                  fontSize="7"
                                  textAnchor="middle"
                                >
                                  {data[idx].displayDate}
                                </text>
                              </g>
                            ))}

                          <text
                            x={margin.left}
                            y={h - 16}
                            fill="rgba(148,163,184,0.75)"
                            fontSize="8"
                            textAnchor="middle"
                          >
                            O
                          </text>
                        </svg>
                        <div className="pointer-events-none absolute right-2 top-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                          Today: {todayLabel}
                        </div>

                        {todayIdx >= 0 && (
                          <div
                            className="pointer-events-none absolute"
                            style={{
                              left: `clamp(42px, ${todayPointXPct}%, calc(100% - 42px))`,
                              top: `clamp(30px, ${todayPointYPct}%, calc(100% - 12px))`,
                              transform: "translate(-50%, -145%)",
                            }}
                          >
                            <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
                              <span className="text-[11px] text-emerald-300 font-medium whitespace-nowrap">
                                {data[todayIdx]?.label} Avg: {todayScore}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pointer-events-none absolute -left-5.5 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-500">
                          Average Score
                        </div>
                        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
                          Date
                        </div>

                        {/* HTML tooltip — not affected by SVG distortion */}
                        {hoverIdx !== null && (
                          <div
                            className="pointer-events-none absolute"
                            style={{
                              left: `clamp(36px, ${hxPct}%, calc(100% - 36px))`,
                              top: `clamp(28px, ${hyPct}%, calc(100% - 8px))`,
                              transform: "translate(-50%, -130%)",
                            }}
                          >
                            <div className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/12 backdrop-blur-sm">
                              <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                                {hDate} | Avg: {hScore}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {tab === "history" && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">
                  Scenario List
                </h3>
              </div>
              <div className="content-scroll flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                {loading ? (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Loading history...
                  </p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    No practice history yet.
                  </p>
                ) : (
                  recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-emerald-500/30 transition-colors duration-150"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {item.scenario}
                        </p>
                        <p className="text-xs text-gray-600">{item.date}</p>
                      </div>
                      <div className="w-36">
                        <ScoreBar score={item.score} />
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColors[item.badge]}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Insights */}
          {tab === "insights" && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex-1 min-h-0 flex flex-col">
              <h3 className="text-sm font-medium text-white mb-3">
                AI Insights
              </h3>
              <div className="content-scroll flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                {insightsLoading ? (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Generating tips...
                  </p>
                ) : insights.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    No insights available yet.
                  </p>
                ) : (
                  insights.map((insight) => (
                    <div
                      key={insight.title}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-emerald-500/30 transition-colors duration-150"
                    >
                      {insight.icon && (
                        <div className="text-2xl">{insight.icon}</div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          {insight.title}
                        </p>
                        <p className="text-sm text-white font-medium mt-0.5">
                          {insight.value}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {insight.note}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
