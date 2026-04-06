"use client";

import React, { useEffect, useRef, useState } from "react";
import MockInterviewPanel from "../mock_int/mock_int";

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

function FilterDropdown<T extends string>({
  value,
  onChange,
  options,
  triggerLabel,
  widthClass,
}: {
  value: T;
  onChange: (v: T) => void;
  options: DropdownOption<T>[];
  triggerLabel?: string;
  widthClass: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label ?? triggerLabel ?? "Select";

  return (
    <div ref={wrapRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#121417] px-3 text-zinc-300 text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span>{selectedLabel}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1115] p-2 shadow-xl shadow-black/50">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full rounded-xl px-4 py-2.5 text-left text-base transition-colors ${
                  isSelected
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Collections({
  className = "",
}: {
  className?: string;
}) {
  const [mockDifficulty, setMockDifficulty] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"all" | "revision">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedFilter, setSolvedFilter] = useState<
    "all" | "solved" | "unsolved"
  >("all");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "Easy" | "Medium" | "Difficult"
  >("all");
  const [randomPicked, setRandomPicked] = useState<string | null>(null);
  const [randomOnlyProblem, setRandomOnlyProblem] = useState<string | null>(
    null,
  );
  const [revisionMap, setRevisionMap] = useState<Record<string, boolean>>({});
  const [isBasicsOpen, setIsBasicsOpen] = useState(true);
  const [isThingsOpen, setIsThingsOpen] = useState(true);

  const items = [
    { name: "Input Output", difficulty: "Easy" },
    { name: "Data Types and Variables", difficulty: "Easy" },
    { name: "Conditional Statements", difficulty: "Easy" },
    { name: "Loops and Iteration", difficulty: "Medium" },
    { name: "Functions and Scope", difficulty: "Medium" },
    { name: "Arrays and Strings", difficulty: "Medium" },
    { name: "Recursion Basics", difficulty: "Difficult" },
    { name: "Time Complexity Intro", difficulty: "Difficult" },
  ];

  function toggleDone(problem: string) {
    setDoneMap((prev) => ({ ...prev, [problem]: !prev[problem] }));
  }

  function toggleRevision(problem: string) {
    setRevisionMap((prev) => ({ ...prev, [problem]: !prev[problem] }));
  }

  function startSolve(problem: string, problemDifficulty?: string) {
    setTopic(problem);
    if (problemDifficulty === "Easy") setMockDifficulty("Beginner");
    else if (problemDifficulty === "Difficult") setMockDifficulty("Advanced");
    else setMockDifficulty("Intermediate");
  }

  function pickRandomProblem() {
    const pickFrom = items;
    if (pickFrom.length === 0) return;
    const selected = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    setRandomPicked(selected.name);
    setRandomOnlyProblem(selected.name);
  }

  function showAllProblems() {
    setRandomOnlyProblem(null);
    setRandomPicked(null);
  }

  const filteredItems = items.filter((it) => {
    if (randomOnlyProblem && it.name !== randomOnlyProblem) return false;

    if (activeTab === "revision" && !doneMap[it.name]) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (!it.name.toLowerCase().includes(q)) return false;
    }

    if (solvedFilter === "solved" && !doneMap[it.name]) return false;
    if (solvedFilter === "unsolved" && doneMap[it.name]) return false;

    if (difficultyFilter !== "all" && it.difficulty !== difficultyFilter)
      return false;
    return true;
  });

  const solvedCount = items.filter((it) => doneMap[it.name]).length;
  const solvedPct = items.length > 0 ? (solvedCount / items.length) * 100 : 0;

  // Compact right-panel stats (kept small so more widgets can be added below)
  const easySolved = 425;
  const easyTotal = 845;
  const medSolved = 942;
  const medTotal = 1773;
  const hardSolved = 216;
  const hardTotal = 782;
  const allSolved = easySolved + medSolved + hardSolved;
  const allTotal = easyTotal + medTotal + hardTotal;
  const attempting = 27;

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const easyRatio = clamp01(easySolved / easyTotal);
  const medRatio = clamp01(medSolved / medTotal);
  const hardRatio = clamp01(hardSolved / hardTotal);

  // Ring sizing based on r=96 -> circumference ~603
  // Use sequential spans with small fixed gaps to avoid overlap.
  const ringCirc = 603;
  const segGap = 16;
  const easySpan = 189;
  const medSpan = 183;
  const hardSpan = 183;
  const easyStart = 0;
  const medStart = -(easySpan + segGap);
  const hardStart = -(easySpan + segGap + medSpan + segGap);

  return (
    <section className={`${className} py-5`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <div className="mb-5 mt-2 space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                <div className="inline-flex w-fit rounded-xl border border-white/10 bg-[#1a1c1f] p-0.5 shadow-lg shadow-black/30 md:col-span-3">
                  <button
                    onClick={() => {
                      setActiveTab("all");
                      showAllProblems();
                    }}
                    className={`h-10 rounded-lg px-4 text-xs transition-colors ${
                      activeTab === "all"
                        ? "bg-white/10 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All Problems
                  </button>
                  <button
                    onClick={() => setActiveTab("revision")}
                    className={`h-10 rounded-lg px-4 text-xs transition-colors ${
                      activeTab === "revision"
                        ? "bg-white/10 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Revision
                  </button>
                </div>

                <div className="flex h-11 w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#121417] px-3 md:col-span-5">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(
                        "collection-search",
                      ) as HTMLInputElement | null;
                      el?.focus();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 transition-colors"
                    aria-label="Search"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M20 20l-3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <input
                    id="collection-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problem"
                    className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  />
                </div>

                <FilterDropdown
                  value={solvedFilter}
                  onChange={setSolvedFilter}
                  widthClass="w-full md:col-span-4"
                  options={[
                    { value: "all", label: "All problems" },
                    { value: "solved", label: "Solved" },
                    { value: "unsolved", label: "Unsolved" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                <FilterDropdown
                  value={difficultyFilter}
                  onChange={setDifficultyFilter}
                  widthClass="w-full md:col-span-4"
                  triggerLabel="Difficulty"
                  options={[
                    { value: "all", label: "Difficulty" },
                    { value: "Easy", label: "Easy" },
                    { value: "Medium", label: "Medium" },
                    { value: "Difficult", label: "Hard" },
                  ]}
                />

                <button
                  onClick={pickRandomProblem}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-[#121417] px-4 text-sm text-zinc-200 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 whitespace-nowrap md:col-span-4"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 4h4v4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 18l6-6m0 0 3-3a3 3 0 0 1 4.2 0L20 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 6l4 4m0 0 2 2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Random Problem
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#2a1b14] px-5 py-4">
              <div className="flex flex-wrap items-center gap-5">
                <div className="h-16 w-16 rounded-full border-4 border-black/40 bg-[#151619] flex items-center justify-center text-xl font-semibold">
                  0%
                </div>

                <div>
                  <div className="text-base text-zinc-100">
                    Overall Progress
                  </div>
                  <div className="text-lg text-zinc-200">0 / 454</div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-6 text-sm text-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
                    <span>Easy&nbsp;&nbsp;0/133</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-400" />
                    <span>Medium&nbsp;&nbsp;0/184</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-rose-500" />
                    <span>Hard&nbsp;&nbsp;0/137</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111214] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsBasicsOpen((v) => !v)}
              className="w-full border-b border-white/10 px-6 py-5"
            >
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 text-zinc-100 transition-transform ${isBasicsOpen ? "rotate-0" : "-rotate-90"}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-base font-semibold text-zinc-100">
                  Learn the basics
                </span>

                <div className="ml-auto flex items-center gap-4">
                  <div className="h-2 w-44 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/40"
                      style={{ width: `${solvedPct}%` }}
                    />
                  </div>
                  <span className="text-zinc-400 text-base">
                    {solvedCount} / {items.length}
                  </span>
                </div>
              </div>
            </button>

            {isBasicsOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setIsThingsOpen((v) => !v)}
                  className="w-full border-b border-white/10 px-10 py-5"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 text-zinc-100 transition-transform ${isThingsOpen ? "rotate-0" : "-rotate-90"}`}
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-base text-zinc-100">
                      Things to Know in C++/Java/Python or any language
                    </span>
                  </div>
                </button>

                {isThingsOpen && (
                  <div className="px-6 py-5">
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0f1012]">
                      <table className="w-full min-w-215 text-left">
                        <thead>
                          <tr className="border-b border-white/10 text-zinc-300">
                            <th className="px-5 py-3 text-sm font-semibold">
                              Status
                            </th>
                            <th className="px-5 py-3 text-sm font-semibold">
                              Problem
                            </th>
                            <th className="px-5 py-3 text-sm font-semibold text-center">
                              Solve
                            </th>
                            <th className="px-5 py-3 text-sm font-semibold">
                              Resource
                            </th>
                            <th className="px-5 py-3 text-sm font-semibold text-center">
                              Note
                            </th>
                            <th className="px-5 py-3 text-sm font-semibold text-center">
                              Revision
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredItems.map((it) => (
                            <tr
                              key={it.name}
                              className="border-b border-white/5 last:border-0"
                            >
                              <td className="px-5 py-3">
                                <button
                                  onClick={() => toggleDone(it.name)}
                                  className="h-7 w-7 rounded-md border border-white/20 bg-black/20 flex items-center justify-center"
                                  aria-label={`Toggle status for ${it.name}`}
                                >
                                  {doneMap[it.name] ? (
                                    <span className="text-emerald-400">✓</span>
                                  ) : (
                                    <span className="text-zinc-500">○</span>
                                  )}
                                </button>
                              </td>

                              <td className="px-5 py-3 text-zinc-100 text-sm">
                                {it.name}
                              </td>

                              <td className="px-5 py-3 text-center align-middle">
                                <button
                                  onClick={() =>
                                    startSolve(it.name, it.difficulty)
                                  }
                                  className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                >
                                  Solve
                                </button>
                              </td>

                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="h-8 w-8 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                                    aria-label={`Open document resource for ${it.name}`}
                                    title="Doc"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4 text-zinc-200"
                                      fill="none"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M7 3.5h7l4 4V20.5H7z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M14 3.5v4h4"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M9.5 12.5h6.5M9.5 15.5h6.5"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    type="button"
                                    className="h-8 w-8 rounded-md border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center"
                                    aria-label={`Open YouTube resource for ${it.name}`}
                                    title="YouTube"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="h-4 w-4 text-red-400"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path d="M20.2 7.2a2.7 2.7 0 0 0-1.9-1.9C16.6 4.8 12 4.8 12 4.8s-4.6 0-6.3.5a2.7 2.7 0 0 0-1.9 1.9 28.7 28.7 0 0 0 0 9.6 2.7 2.7 0 0 0 1.9 1.9c1.7.5 6.3.5 6.3.5s4.6 0 6.3-.5a2.7 2.7 0 0 0 1.9-1.9 28.7 28.7 0 0 0 0-9.6z" />
                                      <path
                                        d="M10 15.2V8.8l5.2 3.2z"
                                        fill="#0f1012"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>

                              <td className="px-5 py-3 text-center align-middle">
                                <button
                                  type="button"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-xl leading-none text-zinc-300 hover:bg-white/10 transition-colors"
                                  aria-label={`Add note for ${it.name}`}
                                  title="Add note"
                                >
                                  +
                                </button>
                              </td>
                              <td className="px-5 py-3 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => toggleRevision(it.name)}
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-xl leading-none transition-colors ${
                                    revisionMap[it.name]
                                      ? "border-yellow-400/70 bg-yellow-400/15 text-yellow-300"
                                      : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
                                  }`}
                                  aria-label={`Toggle revision for ${it.name}`}
                                  title="Revision"
                                >
                                  ★
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredItems.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-5 py-8 text-center text-sm text-zinc-500"
                              >
                                No problems found for the selected filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {randomPicked && (
                      <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
                        <span>Random picked: {randomPicked}</span>
                        <button
                          type="button"
                          onClick={showAllProblems}
                          className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                          All problems
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#111214] p-4 min-h-95">
          <div className="mb-4 rounded-xl border border-white/10 bg-[#1a1c1f] p-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/TopPanel/profile.png"
                alt="profile avatar"
                className="h-12 w-12 rounded-md object-cover"
              />
              <div>
                <div className="text-xl font-semibold text-zinc-100">
                  Anzila
                </div>
                <div className="text-sm text-zinc-300">Level 5</div>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-md border border-white/15 bg-white/5 py-2 text-sm text-zinc-100 hover:bg-white/10 transition-colors"
            >
              View Profile
            </button>
          </div>

          <div className="rounded-xl border border-white/8 bg-zinc-800/35 p-2.5">
            <div className="grid grid-cols-5 gap-1.5 items-stretch">
              <div className="col-span-3 relative h-40 w-full">
                <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
                  {/* Faint full tracks */}
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="rgba(34,197,94,0.24)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${easySpan} ${ringCirc}`}
                    strokeDashoffset={easyStart}
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="rgba(193,132,47,0.28)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${medSpan} ${ringCirc}`}
                    strokeDashoffset={medStart}
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="rgba(255,69,69,0.26)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${hardSpan} ${ringCirc}`}
                    strokeDashoffset={hardStart}
                  />

                  {/* Bright completed portions */}
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="#22c55e"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${easySpan * easyRatio} ${ringCirc}`}
                    strokeDashoffset={easyStart}
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="#c1842f"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${medSpan * medRatio} ${ringCirc}`}
                    strokeDashoffset={medStart}
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="96"
                    stroke="#ff4545"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${hardSpan * hardRatio} ${ringCirc}`}
                    strokeDashoffset={hardStart}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-xl font-bold leading-none text-zinc-100">
                    {allSolved}
                    <span className="text-xs font-medium text-zinc-200">
                      /{allTotal}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-100">
                    <span className="text-emerald-400">✓</span> Solved
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-400">
                    {attempting} Attempting
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-1.5">
                <div className="rounded-lg bg-zinc-700/35 p-1.5 text-center">
                  <div className="text-green-400 text-xs font-semibold">
                    Easy
                  </div>
                  <div className="mt-0.5 text-zinc-100 text-base font-semibold">
                    {easySolved}/{easyTotal}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-700/35 p-1.5 text-center">
                  <div className="text-[#c1842f] text-xs font-semibold">
                    Med.
                  </div>
                  <div className="mt-0.5 text-zinc-100 text-base font-semibold">
                    {medSolved}/{medTotal}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-700/35 p-1.5 text-center">
                  <div className="text-[#ff4545] text-xs font-semibold">
                    Hard
                  </div>
                  <div className="mt-0.5 text-zinc-100 text-base font-semibold">
                    {hardSolved}/{hardTotal}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#1a1c1f] p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-zinc-100">
                Course Badges
              </h4>
              <span className="text-sm text-zinc-300">8 / 8</span>
            </div>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Complete a chapter to earn a badge - collect 'em all!
            </p>

            <div className="mt-4 grid grid-cols-4 gap-3 text-center text-2xl">
              <span>🌍</span>
              <span>🪐</span>
              <span>🏅</span>
              <span>🧭</span>
              <span>🎟️</span>
              <span>🧩</span>
              <span>🧱</span>
              <span>📄</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#1a1c1f] p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-zinc-100">
                Cheat Sheets
              </h4>
              <span className="text-sm text-zinc-300">2 / 2</span>
            </div>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Unlock printables with functions and concepts.
            </p>

            <div className="mt-4 space-y-3">
              <a
                href="#"
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 hover:bg-white/10 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="text-base">Python: Basics I</span>
                </span>
                <span className="text-sm">↗</span>
              </a>

              <a
                href="#"
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 hover:bg-white/10 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="text-base">Python: Basics II</span>
                </span>
                <span className="text-sm">↗</span>
              </a>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#1a1c1f] p-4">
            <h4 className="text-xl font-semibold text-zinc-100">Need Help?</h4>
            <p className="mt-2 text-sm text-zinc-300">
              Ask questions in our community!
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-md border border-white/20 bg-black/20 py-2 text-base text-zinc-100 hover:bg-white/10 transition-colors"
            >
              Go to Community
            </button>
          </div>
        </aside>
      </div>

      {mockDifficulty && (
        <MockInterviewPanel
          difficulty={mockDifficulty}
          topic={topic || undefined}
          onClose={() => {
            setMockDifficulty(null);
            setTopic(null);
          }}
        />
      )}
    </section>
  );
}
