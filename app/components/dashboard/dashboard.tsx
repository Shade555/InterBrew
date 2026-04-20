"use client";

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from 'react-dom'
import "./dashboard.css"

function StatCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 shadow">
      <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div
        className={`mt-1 text-sm ${delta?.startsWith("+") ? "text-green-600" : "text-red-500"}`}
      >
        {delta}
      </div>
      
    </div>
  );
}

function ReadinessScore({
  percent = 0,
  size = 120,
  strokeWidth = 12,
}: {
  percent?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="mt-3 text-2xl font-bold">{percent}%</div>
    </div>
  );
}

function SmallRing({
  percent = 0,
  size = 68,
  stroke = 6,
  label = "",
}: {
  percent?: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="flex flex-col items-center w-20">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {label}
        </div>
      </div>
      <div className="mt-2 text-sm font-medium">{percent}%</div>
    </div>
  );
}

export default function Dashboard() {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [favOpen, setFavOpen] = useState(false)

  function Calendar() {
    const today = new Date()
    const [current, setCurrent] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selected, setSelected] = useState<number | null>(null)
    const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null)
    const [anchorFixed, setAnchorFixed] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    // sample markers (day numbers within the month)
    const pending = new Set([2, 10, 17])
    const confirmed = new Set([8, 15, 22])

    useEffect(() => {
      function handlePointer(e: PointerEvent) {
        if (!containerRef.current) return
        // close dropdown when clicking anywhere outside the calendar or dropdown
        if (selected && anchor) {
          const target = e.target as Node
          const inContainer = containerRef.current.contains(target)
          const inDropdown = dropdownRef.current?.contains(target)
          if (!inContainer && !inDropdown) {
            setSelected(null)
            setAnchor(null)
            setAnchorFixed(false)
          }
        }
      }
      document.addEventListener('pointerdown', handlePointer)
      return () => document.removeEventListener('pointerdown', handlePointer)
    }, [selected, anchor])

    const month = current.getMonth()
    const year = current.getFullYear()

    // compute calendar cells for a 6-week grid (42 cells)
    const firstDay = new Date(year, month, 1).getDay() // 0..6 (Sun..Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevMonthDays = new Date(year, month, 0).getDate()
    const total = 42
    const cells = Array.from({ length: total }).map((_, i) => {
      const dayIndex = i - firstDay + 1
      if (dayIndex <= 0) {
        // previous month
        const d = prevMonthDays + dayIndex
        return { type: 'prev', day: d }
      } else if (dayIndex > daysInMonth) {
        // next month
        const d = dayIndex - daysInMonth
        return { type: 'next', day: d }
      } else {
        return { type: 'current', day: dayIndex }
      }
    })

    function prevMonth() {
      setCurrent(new Date(year, month - 1, 1))
    }
    function nextMonth() {
      setCurrent(new Date(year, month + 1, 1))
    }

    function handleDateClick(e: React.MouseEvent<HTMLDivElement>, d: number, type: string) {
      const el = e.currentTarget as HTMLDivElement
      // only allow selecting current-month days
      if (type !== 'current') return
      if (window.innerWidth < 640) {
        const rect = el.getBoundingClientRect()
        const left = rect.left
        const top = rect.bottom
        if (selected === d) {
          setSelected(null)
          setAnchor(null)
          setAnchorFixed(false)
        } else {
          setSelected(d)
          setAnchor({ left, top })
          setAnchorFixed(true)
        }
      } else {
        const left = el.offsetLeft
        const top = el.offsetTop
        if (selected === d) {
          setSelected(null)
          setAnchor(null)
          setAnchorFixed(false)
        } else {
          setSelected(d)
          setAnchor({ left, top })
          setAnchorFixed(false)
        }
      }
    }

    const monthLabel = current.toLocaleString(undefined, { month: 'long', year: 'numeric' })

    return (
      <div ref={containerRef} className="relative rounded-lg border border-white/20 bg-black/60 p-2 sm:p-4 backdrop-blur-md text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1 rounded-md hover:bg-white/5">◀</button>
            <div className="font-semibold">{monthLabel}</div>
            <button onClick={nextMonth} className="p-1 rounded-md hover:bg-white/5">▶</button>
          </div>
          <div className="text-sm opacity-80">Pending</div>
        </div>

        <div className="grid grid-cols-7 gap-0 sm:gap-1 text-xs">
          {['S','M','T','W','T','F','S'].map((d, idx) => (
            <div key={`${d}-${idx}`} className="text-center opacity-70">{d}</div>
          ))}

          {cells.map((cell, idx) => (
            <div key={idx} className="h-6 sm:h-8 flex items-center justify-center">
              <div
                onClick={(e) => handleDateClick(e, cell.day, cell.type)}
                role="button"
                tabIndex={0}
                className={`relative w-5 sm:w-8 h-5 sm:h-8 flex items-center justify-center rounded-full ${cell.type === 'current' ? 'bg-white/5 cursor-pointer' : 'opacity-40'} ${selected === cell.day && cell.type === 'current' ? 'ring-2 ring-emerald-400' : ''}`}
              >
                <div className="text-[10px] sm:text-sm">{cell.day}</div>
                {cell.type === 'current' && pending.has(cell.day) && (
                  <div className="absolute -right-2 -top-2 bg-red-600 rounded-full w-2.5 sm:w-5 h-2.5 sm:h-5 flex items-center justify-center text-[7px] sm:text-[10px]">✕</div>
                )}
                {cell.type === 'current' && confirmed.has(cell.day) && (
                  <div className="absolute -right-2 -top-2 bg-emerald-500 rounded-full w-2.5 sm:w-5 h-2.5 sm:h-5 flex items-center justify-center text-[7px] sm:text-[10px]">✓</div>
                )}
              </div>
              
            </div>
          ))}
        </div>

        {selected && anchor && (() => {
          const dd = (
            <div
              ref={dropdownRef}
              className={`${anchorFixed ? 'fixed' : 'absolute'} z-50 w-36 sm:w-44 bg-black/80 border border-white/20 rounded-md p-2 sm:p-3 shadow-lg text-sm`}
            >
              <div className="text-xs opacity-80">{selected} {current.toLocaleString(undefined, { month: 'short' })}</div>
              <div className="mt-1 font-semibold">Frontend</div>
              <div className="text-xs sm:text-sm opacity-80 mt-1">76% complete</div>
              <div className="mt-1 text-xs sm:text-sm leading-snug">Work on the layout</div>
            </div>
          )

          if (anchorFixed) {
            try {
              const ddW = 144
              const leftRaw = anchor.left
              const maxLeft = Math.max(8, window.innerWidth - ddW - 8)
              const left = Math.min(Math.max(leftRaw, 8), maxLeft)
              const top = anchor.top + 6
              return createPortal(React.cloneElement(dd, { style: { left, top } }), document.body)
            } catch (e) {
              return dd
            }
          }

          return React.cloneElement(dd, { style: { left: anchor.left, top: anchor.top + 36 } })
        })()}
      </div>
    )
  }

  const collections = [
    { title: "Frontend", color: "bg-emerald-600" },
    { title: "Backend", color: "bg-sky-600" },
    { title: "Database", color: "bg-violet-600" },
    { title: "DevOps", color: "bg-orange-500" },
    { title: "Security", color: "bg-rose-600" },
    { title: "Data Science", color: "bg-green-700" },
    { title: "System Programming", color: "bg-slate-700" },
    { title: "Algorithms", color: "bg-indigo-600" },
    { title: "Machine Learning", color: "bg-pink-600" },
    { title: "Cloud", color: "bg-cyan-600" },
    { title: "Mobile", color: "bg-yellow-600" },
    { title: "UX/UI", color: "bg-rose-400" },
  ];

  const skills = [
    { name: 'Coding', abbr: 'CO' },
    { name: 'Critical Thinking', abbr: 'CT' },
    { name: 'Communication', abbr: 'CM' },
    { name: 'Quantitative Aptitude', abbr: 'QA' },
    { name: 'Problem Solving', abbr: 'PS' },
    { name: 'System Design', abbr: 'SD' },
    { name: 'Data Analysis', abbr: 'DA' },
    { name: 'Algorithms', abbr: 'AL' },
    { name: 'Machine Learning', abbr: 'ML' },
    { name: 'Cloud', abbr: 'CL' },
    { name: 'Mobile', abbr: 'MB' },
    { name: 'UX', abbr: 'UX' },
  ]

  // sample per-collection progress (same length as collections)
  const progress = [72, 30, 55, 20, 90, 45, 60, 12, 78, 34, 56, 18];

  const favQuestions = [
    "What is closure in JavaScript?",
    "Explain normalization in databases.",
    "How does HTTP/2 improve performance?",
    "Design an LRU cache.",
    "Explain the CAP theorem.",
    "What is the difference between TCP and UDP?",
  ]
  function abbreviate(title: string) {
    const map: Record<string, string> = {
      Frontend: "FE",
      Backend: "BE",
      Database: "DB",
      DevOps: "DO",
      Security: "SEC",
      "Data Science": "DS",
      "System Programming": "SP",
      Algorithms: "AL",
      "Machine Learning": "ML",
      Cloud: "CL",
      Mobile: "MB",
      "UX/UI": "UX",
    };
    return (
      map[title] ??
      title
        .split(/\W+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    );
  }

  return (
    <div className="pt-0 px-0 sm:px-0 lg:px-2 pb-6 v-scrollbar-hide">

      {/* Recommended Collections: horizontally scrollable cards */}
      <section className="mb-2">
        <h2 className="mb-3 text-lg font-semibold">Recommended collections</h2>
        <div>
            <div className="flex gap-4 overflow-x-auto pl-0 pr-2 py-2 scrollbar-hide">
            {collections.map((c) => (
              <div key={c.title} className="min-w-56 sm:min-w-[20rem] md:min-w-104 lg:min-w-120 shrink-0 rounded-lg p-6 sm:p-8 md:p-10 text-white bg-transparent recommended-card">
                <div className="text-sm opacity-90">Collection</div>
                <div className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold">{c.title}</div>
                <div className="mt-4 text-sm opacity-90">5 courses · 24 items</div>
              </div>
            ))}
          </div>
            {favOpen && (() => {
              const modal = (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={() => setFavOpen(false)} />
                  <div className="relative w-full max-w-2xl p-4">
                    <div className="rounded-lg p-6 bg-transparent text-white recommended-card" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Favourite questions</div>
                        <button onClick={() => setFavOpen(false)} className="ml-2 px-3 py-1 rounded-md bg-white/10">Close</button>
                      </div>
                      <div className="mt-4 max-h-64 overflow-y-auto">
                        <ul className="space-y-3">
                          {favQuestions.map((q, i) => (
                            <li key={i} className="text-sm opacity-90">{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
              try {
                return createPortal(modal, document.body)
              } catch (e) {
                return modal
              }
            })()}
        </div>
      </section>

      {/* New 2-column layout below recommended collections (left column smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 rounded-lg p-6 bg-black/80 dark:bg-black/60 flex flex-col items-center">
          <h3 className="mb-4 text-lg font-semibold">Readiness Score</h3>

          {/* small circular progress badges, scrollable */}
          <div className="w-full">
            <div className="-mx-2">
              <div className="flex gap-4 overflow-x-auto px-2 py-2 scrollbar-hide items-end">
                {collections.map((c, i) => (
                  <div key={c.title} className="shrink-0 flex flex-col items-center" title={`${skills[i]?.name ?? c.title} (${skills[i]?.abbr ?? abbreviate(c.title)})`}>
                    <SmallRing percent={progress[i] ?? 0} label={skills[i]?.abbr ?? abbreviate(c.title)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 w-full grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">This week's</h4>
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <div>Total: XP points - 1250</div>
                <div>Badges Earned:</div>
                <div>Current levels:</div>
                <div>Leaderboard Rank:</div>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full rounded-lg p-0 bg-black/60 border border-white/20 text-white">
                <div className="p-3">
                  <Calendar />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative rounded-lg p-4 sm:p-6 bg-black/80 dark:bg-black/60">
          {/* right column: contest card, expanding interviews panel, and graph */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Two cards placed side-by-side on larger screens */}
              <div className="rounded-lg p-6 bg-transparent text-white w-full text-center recommended-card">
                <div className="text-sm opacity-90">Slaying September Contest</div>
                <div className="mt-4">
                  <button className="px-4 py-2 rounded-md bg-[#19332C]/50 hover:bg-[#19332C]/80 text-white">Continue</button>
                </div>
              </div>
              <div
                className="rounded-lg p-6 bg-transparent text-white w-full recommended-card cursor-pointer"
                onClick={() => setFavOpen(true)}
              >
                <div className="text-sm opacity-90">Favourite questions</div>
                <div className="mt-3 text-left">
                  <div className="max-h-32 overflow-y-auto pr-2">
                    <ul className="space-y-2 text-sm">
                      {favQuestions.slice(0, 4).map((q, idx) => (
                        <li key={idx} className="opacity-90">• {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Calendar removed from right column per design change */}
            </div>

            <div className="rounded-lg card-outline p-4 h-96 bg-transparent relative overflow-hidden">
              <div className="mx-auto w-full sm:max-w-3xl h-full">
                {/* cards removed from graph area */}
                <div className="flex flex-col gap-3 mb-4">
                  <select className="rounded-md border px-2 sm:px-3 py-1 w-full sm:w-36 bg-transparent text-xs sm:text-sm text-gray-800 dark:text-gray-200 dashboard-select">
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Daily</option>
                  </select>
                  <select className="rounded-md border px-2 sm:px-3 py-1 w-full sm:w-36 bg-transparent text-xs sm:text-sm text-gray-800 dark:text-gray-200 dashboard-select">
                    <option>subject</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                  </select>
                </div>
                    <svg viewBox="0 0 600 300" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#297356" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#297356" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path d="M0 200 L50 160 L100 180 L150 120 L200 140 L250 100 L300 120 L350 90 L400 130 L450 80 L500 100 L550 60 L600 40" fill="url(#g1)" stroke="none" />
                      <path d="M0 200 L50 160 L100 180 L150 120 L200 140 L250 100 L300 120 L350 90 L400 130 L450 80 L500 100 L550 60 L600 40" fill="none" stroke="#297356" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
