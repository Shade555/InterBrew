# InterBrew

> AI-powered, gamified interview preparation platform built for Operating Systems — combining structured learning, mock interviews, real-time challenges, and performance analytics in one cohesive experience.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [NPM Packages](#npm-packages)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Dashboard](#dashboard)
  - [Collections](#collections)
  - [Scenario Practice](#scenario-practice)
  - [Challenges](#challenges)
  - [Leaderboard](#leaderboard)
  - [Profile](#profile)
- [AI Integration](#ai-integration)
- [Database Schema](#database-schema)
- [Animations](#animations)
- [Sound Design](#sound-design)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Overview

InterBrew is a full-stack Next.js application that turns OS interview preparation into a game. Users progress through structured learning modules, practice with an AI interviewer, compete in real-time challenges, and track their readiness with a Groq-powered AI report — all backed by Supabase and styled with Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript + JavaScript (mixed) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Groq SDK (llama-3.3-70b-versatile) |
| Email | Resend |
| 3D / WebGL | Three.js + @react-three/fiber |
| Animation | Motion (Framer Motion v12) + custom CSS keyframes |
| UI Components | Radix UI + shadcn/ui |
| Drag & Drop | @dnd-kit/core |
| Flow Diagrams | ReactFlow |

---

## NPM Packages

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.1.6 | App framework with App Router |
| `react` / `react-dom` | 19.2.3 | UI library |
| `@supabase/supabase-js` | ^2.98.0 | Database, auth, storage client |
| `groq-sdk` | ^0.37.0 | Groq LLM API for AI interviews and reports |
| `resend` | ^6.10.0 | Transactional email (interview reminders) |
| `lucide-react` | ^0.574.0 | Icon library |
| `motion` | ^12.34.1 | Animation library (Framer Motion v12) |
| `three` | ^0.182.0 | 3D rendering engine |
| `@react-three/fiber` | ^9.5.0 | React renderer for Three.js |
| `three-stdlib` | ^2.36.1 | Three.js utilities and extras |
| `camera-controls` | ^3.1.2 | Smooth camera controls for 3D scenes |
| `@shadergradient/react` | ^2.4.20 | Animated shader gradient backgrounds |
| `reactflow` | ^11.11.4 | Node-based flow diagram rendering |
| `@dnd-kit/core` | ^6.3.1 | Accessible drag-and-drop |
| `radix-ui` | ^1.4.3 | Headless accessible UI primitives |
| `class-variance-authority` | ^0.7.1 | Type-safe component variant management |
| `clsx` | ^2.1.1 | Conditional className utility |
| `tailwind-merge` | ^3.4.1 | Merge Tailwind classes without conflicts |
| `node-cron` | ^4.2.1 | Cron job scheduling (email reminders) |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `typescript` | Type checking |
| `tailwindcss` v4 | Utility-first CSS |
| `@tailwindcss/postcss` | PostCSS integration |
| `tw-animate-css` | Extended Tailwind animation utilities |
| `shadcn` | Component scaffolding CLI |
| `eslint` + `eslint-config-next` | Linting |
| `@types/three` | Three.js TypeScript types |

---

## Project Structure

```
interbrew/
├── app/
│   ├── (routing)/              # Next.js route groups
│   │   ├── dashboard/
│   │   ├── collections/
│   │   ├── scenario-practice/
│   │   ├── challenges/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   └── auth/
│   ├── api/                    # Next.js API routes
│   │   ├── ai-report/          # Groq readiness score generation
│   │   ├── mock_int/           # Groq mock interview conductor
│   │   ├── scenario-insights/  # Groq interview tips generator
│   │   ├── scenario-stats/     # Scenario progress stats
│   │   ├── send-interview-reminder/  # Resend email reminders
│   │   └── update-current-module/   # Dashboard current module tracker
│   ├── components/
│   │   ├── dashboard/          # Dashboard with graph, stats, calendar
│   │   ├── collections/        # OS topic modules, mock interviews, badges
│   │   ├── scenario/           # Scenario practice, lessons, XP animations
│   │   ├── challenge/          # 5 mini-game challenges
│   │   ├── navigation/         # GlobalShell, SidePanel, TopNav
│   │   ├── profile/            # Profile header, badges, certifications
│   │   ├── leaderboard/        # Monthly leaderboard
│   │   └── mock_int/           # Mock interview UI + speech
│   └── references/             # Design docs, diagrams, use-case specs
├── lib/
│   ├── supabaseClient.js       # Supabase client singleton
│   ├── certifications.ts       # Certification award logic
│   ├── streak.js               # Daily streak increment logic
│   ├── cron.ts                 # Cron job setup
│   └── utils.ts                # Shared utilities
├── components/
│   ├── ui/                     # shadcn tooltip component
│   ├── BlurText.jsx            # Animated blur-in text
│   ├── StarBorder.jsx          # Animated star border component
│   └── StarBorder.css
├── public/
│   ├── SidePanel/              # Navigation icons
│   ├── TopPanel/               # Top bar icons (fire.png, profile.png, etc.)
│   ├── images/                 # Badge images, certificate, consistency.png
│   ├── fonts/                  # Source Serif 4 variable font
│   ├── correct.mp3             # Quiz correct answer sound
│   ├── level-clear.mp3         # Level completion sound
│   └── wrong.mp3               # Wrong answer sound
└── .kiro/                      # Kiro AI spec and steering files
```

---

## Features

### Dashboard

The home screen gives a complete snapshot of the user's progress at a glance.

**AI Readiness Report**
- Groq LLM analyses the user's collection progress, scenario completions, mock interviews, XP, and leaderboard rank
- Generates a 0–100 readiness score with a 1–2 sentence actionable recommendation
- Report is cached for 7 days; user can force-refresh at any time
- Animated score ring draws in on load with a gradient stroke (emerald → cyan)
- Dynamic status pill: Interview Ready / On Track / Needs Work / Just Starting

**Quick Stats Row**
- 🔥 Day Streak — increments once per calendar day on module completion
- ⚡ Total XP — cumulative XP from `profiles.xp`
- ✅ Modules Done — sum of scenario + collection modules completed
- 🏆 Leaderboard Rank — live rank from the leaderboard table

**Progress Graph**
- Real data from the last 14 days
- Two switchable metrics: **Modules Completed** (emerald) and **Readiness Score** (blue)
- Smooth bezier curves with area fill and gradient
- Hover crosshair with HTML tooltip showing exact value and date
- Grid toggle button
- Modules data written to `user_dashboards.dashboard_graph` on every lesson completion
- Readiness data pulled from `user_ai_reports.score` averaged per day

**Interview Calendar**
- Schedule upcoming interviews by clicking any date
- Set subject, difficulty (Beginner / Intermediate / Advanced), round, and notes
- Mark interviews as Completed or Missed
- Visual dot indicators on calendar dates (green = completed, red = missed, small dot = scheduled)
- Automated email reminders via Resend API (triggered by cron)

**Continue Where You Left Off**
- Reads `profiles.last_activity` — written whenever a user opens a scenario lesson, starts a collection solve, or launches a mock interview
- Deep-links back to `/scenario-practice` or `/collections`

**Staggered entrance animations** — each card section fades up with a 60–440ms stagger on page load.

---

### Collections

A structured OS curriculum with 9 sections covering the full Operating Systems syllabus.

**Sections covered:**
- Foundation
- Process Management
- Process Synchronization & Deadlocks
- Threads & CPU Management
- Memory Management & Virtual Memory
- File Systems
- I/O Systems
- Command Line
- Protection & Security

**Module Table**
- Each section is collapsible with a progress bar showing solved/total
- Filter by difficulty (Easy / Medium / Difficult), solved status, or search by name
- Revision mode — bookmark modules for later review
- Per-module resources: YouTube video popup, documentation popup, personal notes (saved to DB)
- Drag-and-drop reordering support via `@dnd-kit/core`

**Mock Interviews**
- Each section has a dedicated mock interview unlocked after completing all modules
- Groq-powered AI interviewer with a section-specific system prompt
- Voice input via Web Speech API — user speaks answers, AI responds via speech synthesis
- Interrupt detection — counts how many times user speaks over the AI
- Hesitation detection — regex matches filler words (um, uh, like, you know, etc.)
- Interview completion triggers certification award

**Solve Mode**
- Opens a mock interview panel focused on a specific problem
- Difficulty maps to interview difficulty (Easy → Beginner, Difficult → Advanced)

**Badges**
- One badge per section, unlocked when all modules in that section are completed
- Badge images stored in `/public/images/`
- Unlock triggers `BadgeUnlockAnimation` — a full-screen celebration overlay

**Certifications**
- Awarded on completing a section mock interview
- Stored in `certifications` table with title, issuer, and issue date
- Unlock triggers `CertUnlockAnimation`

**Progress Ring**
- SVG donut chart in the sidebar showing Easy / Medium / Hard solved counts
- Three-segment arc with colour-coded fills (green / amber / red)

**Cheat Sheets**
- PDF/resource links per section
- Command Line section opens an in-app modal with categorised shell commands

**Staggered section row animations** — each section card fades up with a 60ms stagger.

---

### Scenario Practice

AI-driven interview practice tied to real-world OS scenarios.

**Overview Mode** (two-panel layout)
- Left panel: performance dashboard with weekly XP chart, module progress, and AI insights tab
- Right panel: scenario selector with difficulty filters (Easy / Medium / Hard) and completion filter

**Scenario Selection**
- Scenarios ordered by: in-progress first (sorted by % completion), then not-started (shuffled), then completed
- Progress bar per scenario showing % of modules completed
- Double-click to deselect

**Module View** (when scenario selected)
- Left panel switches to module list with completion checkmarks
- Debug button on each module for instant completion (development tool)

**Practice Mode**
- Full-screen module list with Learn / Reattempt buttons
- Debug button for instant completion

**Lesson Flow** (per module)
Each module contains a sequence of steps:
1. **Explanation** — text content with formatted lesson material
2. **Video** — embedded YouTube player (auto-converts watch URLs to embed URLs)
3. **Quiz** — 5 randomly selected questions from the module's question bank
   - Multiple choice with immediate feedback
   - Correct answer highlighted in green, wrong in red
   - Audio feedback: `correct.mp3` / `wrong.mp3`
4. **Interview** — AI mock interview via Groq
   - Voice input with Web Speech API
   - AI speaks responses via speech synthesis
   - Interrupt counter, hesitation counter, pause counter
5. **Feedback** — full performance report

**Scoring Formula**
```
finalScore = (quizPercent × 0.5) + (interviewScore × 0.5)
interviewScore = (softSkillPercent × completionRate) / 100
softSkillPercent = ((clarity + listening + confidence) / 3 / 5) × 100
```

**Soft Skills (1–5 scale)**
- Clarity — based on average response word count
- Listening — based on interruption count
- Confidence — based on hesitations, pauses, and response length

**Overall Rating**
- Excellent (≥80 adjusted quiz + ≥15 avg words) → emerald
- Good (≥60 + ≥10 words) → blue
- Satisfactory (≥40) → amber
- Needs Improvement → rose

**XP Formula**
```
XP = 50 (base) + finalScore (0–100)
Range: 50 XP minimum → 150 XP maximum
```

**XP Animation** — `XPRewardAnimation.tsx` plays a particle burst with the XP amount on lesson completion.

**Daily XP tracking** — `profiles.daily_xp` resets each calendar day; `profiles.daily_xp_reset_date` tracks the last reset.

**Weekly chart** — `user_dashboards.graph_data.chartPoints` stores Mon–Sun XP per day, updated on every lesson completion.

**AI Insights Tab**
- Lazy-loaded on first click
- Groq generates 4 interview tips covering different scenarios (behavioural, technical, salary, knowledge gaps)
- Each tip has a title, concrete advice, mitigation note, and emoji

**Panel transition animations** — content panel slides in from the right, scenarios panel from the left on page load. Switching to practice mode scales in the new panel.

---

### Challenges

Five standalone OS-themed mini-games, each with leaderboard XP sync.

#### 1. Memory Grid
Allocate incoming processes to memory blocks using best-fit logic.
- Drag processes from the queue to matching memory blocks
- Score 250 XP per correct allocation
- Emergency bypass available (0 XP)
- Fragmentation display per block
- Levels loaded from `challenges_memory_scenarios` table

#### 2. Deadlock Rescue
Identify and resolve deadlock scenarios under a 20-second timer.
- 3 lives system — wrong answer or timeout costs a life
- Score = 100 + (timeLeft × 10) per correct resolution
- Resource graph displayed in terminal-style pre block
- Typewriter effect for scenario description
- Tick sound effect when timer drops below 6 seconds
- Glitch flash effect on wrong answers
- Levels from `challenges_deadlock_scenarios` table

#### 3. Cycle Master
Arrange CPU processes in the correct scheduling order.
- Drag-to-queue interface with Gantt-style progress bar
- Algorithms: FCFS, SJF, Priority, Round Robin
- Score 500 XP per correct sequence
- Kernel override bypass (0 XP)
- Glitch animation on wrong order
- Click / success / error sound effects via Web Audio API
- Levels from `challenges_scheduling_scenarios` table

#### 4. Protocol Fall
Catch falling answer tokens with a moveable I/O head bar.
- Mouse-controlled bar position
- Tokens fall at increasing speed as progress increases
- Virus tokens subtract progress on catch
- Wrong answer tokens subtract progress
- Score synced to leaderboard as XP / 10
- Levels from `os_challenges_tasks` table (category: protocol-fall)

#### 5. OS SpeedRun
Timed OS knowledge speed quiz.
- Rapid-fire questions with countdown timer
- Loaded from `os_challenges_tasks` table

**All challenges** sync XP to the `leaderboard` table (monthly, upsert pattern).

---

### Leaderboard

Monthly competitive ranking across all users.

- Filter by month and year
- Columns: Rank, Username, Score, Challenges Completed, Accuracy
- Pulls from `leaderboard` table joined with `profiles` for display names
- Top 3 highlighted with gold / silver / bronze styling

---

### Profile

**Profile Header**
- Avatar upload to Supabase Storage (`profile-images` bucket)
- Editable display name (inline edit with save)
- Shows email from auth

**Personal Info**
- Role, domain, XP stat with Zap icon
- Collection progress bar (completed / total collection modules)
- Streak display from `user_dashboards`

**Badges Card**
- Grid of earned badges (8 columns)
- Tooltip on hover showing badge name
- **First Streak** badge — awarded at streak ≥ 1, revoked if streak drops to 0
- **Consistency** badge — awarded at streak ≥ 15, revoked if streak drops below 15
- Badge images from `/public/images/` and `/public/TopPanel/`
- Icon fallback system based on badge name keywords

**Certifications**
- Lists all earned mock interview certifications
- Each cert shows title, issuer (InterBrew), and issue date

**Settings Card**
- Update role and domain
- Account deletion with cascade

---

## AI Integration

All AI features use the **Groq SDK** with `llama-3.3-70b-versatile` (configurable via `GROQ_MODEL` env var).

| Feature | Route | Prompt Style |
|---|---|---|
| Mock Interview | `/api/mock_int` | Structured OS interviewer with strict question flow rules |
| AI Readiness Report | `/api/ai-report` | Progress analyser returning JSON `{score, recommendation}` |
| Scenario Insights | `/api/scenario-insights` | Interview tips generator returning JSON array of 4 tips |

**Mock Interview System Prompt highlights:**
- Opens with exactly "Hello, lets begin the interview."
- 7–10 questions for section-based, 15 for full-syllabus
- Adaptive difficulty based on answer quality
- Handles "I don't know" gracefully (skips without penalty)
- Ends with "[INTERVIEW_COMPLETE]" signal
- Randomised question order per session

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile: xp, daily_xp, daily_xp_reset_date, badges, last_activity, streak |
| `user_dashboards` | streak, graph_data (chartPoints, dashboard_graph), updated_at |
| `user_ai_reports` | score (0–100), daily_xp, recommendation, created_at |
| `user_module_progress` | Scenario module completion tracking |
| `user_collection_module_progress` | Collection module completion tracking |
| `user_interviews` | Scheduled interviews with status, email_sent flag |
| `certifications` | Earned mock interview certifications |
| `leaderboard` | Monthly XP scores, challenges_completed, accuracy |

### Content Tables

| Table | Purpose |
|---|---|
| `modules` | Scenario practice modules |
| `lessons` | Individual lesson steps per module |
| `quizzes` | Quiz questions per lesson |
| `scenarios` | Scenario definitions with difficulty |
| `collection_sections` | OS curriculum sections |
| `collection_modules` | Individual problems per section |
| `collection_resources` | YouTube URLs, docs, notes per module |
| `collection_badges` | Badge definitions per section |
| `collection_cheatsheets` | Cheatsheet resource links |

### Challenge Tables

| Table | Purpose |
|---|---|
| `challenges_memory_scenarios` | Memory Grid levels |
| `challenges_deadlock_scenarios` | Deadlock Rescue levels |
| `challenges_scheduling_scenarios` | Cycle Master levels |
| `os_challenges_tasks` | Protocol Fall + SpeedRun questions |

---

## Animations

InterBrew uses a layered animation system combining CSS keyframes, Tailwind utilities, and the Motion library.

### Page-Level Entrance Animations

**Dashboard** — staggered fade-up across 6 sections (50ms → 440ms delays):
- AI Report card, Quick Stats, Continue card, Graph, Calendar, Recommended

**Collections** — staggered fade-up for panels + cascading section rows:
- Left panel (40ms), right sidebar (100ms)
- Each section row fades up with 60ms stagger
- Sidebar cards scale in (170ms → 310ms)

**Scenario Practice** — directional slide animations:
- Content panel slides in from the right
- Scenarios panel slides in from the left
- Practice mode scales in as a whole panel
- Module list rows stagger with 55ms per item

### Component Animations

| Component | Animation |
|---|---|
| Score ring (Dashboard) | Stroke draws in over 900ms with spring easing |
| Score bar (Dashboard) | Width grows from 0% on mount |
| Stat cards (Dashboard) | Scale in with 70ms stagger |
| Scenario cards | Fade up with 50ms stagger per card |
| XP Reward | Particle burst + emerald glow overlay |
| Badge unlock | Full-screen celebration overlay |
| Cert unlock | Full-screen celebration overlay |
| Graph hover dot | Grows from r=3 to r=5, turns white |
| Graph crosshair | Dashed vertical line snaps to nearest point |
| Deadlock glitch | Red background flash on wrong answer |
| Cycle Master glitch | Screen translate + red tint on wrong order |
| Protocol Fall items | CSS rotate + colour per answer type |

### CSS Keyframes Used

```css
fadeUp    — opacity 0→1, translateY 18px→0
fadeIn    — opacity 0→1
scaleIn   — opacity 0→1, scale 0.96→1
ringDraw  — stroke-dashoffset 339.3→0
colFadeUp — opacity 0→1, translateY 16px→0
scFadeUp  — opacity 0→1, translateY 20px→0
scSlideLeft/Right — opacity 0→1, translateX ±24px→0
```

All entrance animations use `animation-fill-mode: both` to prevent flash-of-unstyled-content.

---

## Sound Design

InterBrew uses two sound systems:

### Pre-recorded Audio Files (`/public/`)

| File | Trigger |
|---|---|
| `correct.mp3` | Quiz correct answer |
| `wrong.mp3` | Quiz wrong answer |
| `level-clear.mp3` | Module / level completion |

### Web Audio API (Procedural)

Used in Deadlock Rescue and Cycle Master challenges — no audio files needed, generated in real-time:

| Sound | Type | Frequency | Trigger |
|---|---|---|---|
| Success | Square/Sine | 440Hz → 880Hz ramp | Correct answer |
| Error | Square | 220Hz → 40Hz ramp | Wrong answer |
| Tick | Sine | 1200Hz | Timer < 6 seconds |
| Click | Sine | 1200Hz | Process selection |

All Web Audio sounds are wrapped in try/catch to handle browsers that block AudioContext without user interaction.

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/ai-report` | POST | Generate/cache Groq readiness score |
| `/api/mock_int` | POST | Groq mock interview message handler |
| `/api/scenario-insights` | GET | Generate 4 interview tips via Groq |
| `/api/scenario-stats` | GET | Fetch scenario progress statistics |
| `/api/send-interview-reminder` | POST | Send Resend email for today's interviews |
| `/api/update-current-module` | POST | Update current module in user_dashboard |

---

## Environment Variables

```env
# Groq
GROQ_API_KEY=                        # Groq API key
GROQ_MODEL=llama-3.3-70b-versatile   # Optional model override

# Supabase
NEXT_PUBLIC_SUPABASE_URL=            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=           # Supabase service role key (server-only)

# Resend
RESEND_API_KEY=                      # Resend API key for email reminders

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your Groq, Supabase, and Resend keys

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Architecture Notes

- **Auth** — Supabase Auth with email/password and OAuth. All protected routes check session client-side.
- **RLS** — Supabase Row Level Security enabled on all user data tables. Server-side API routes use the service role key to bypass RLS where needed.
- **Caching** — AI reports are cached for 7 days in `user_ai_reports`. Graph data is written incrementally (not recalculated on every load).
- **Streak logic** — stored in `user_dashboards.graph_data.streak_meta.last_increment` (YYYY-MM-DD). Increments once per calendar day, fires a `streak:updated` CustomEvent for real-time UI updates.
- **Daily XP reset** — `profiles.daily_xp_reset_date` compared to today's date on every XP write. Resets to 0 on new day before adding.
- **last_activity** — `profiles.last_activity` is a JSONB column written fire-and-forget (non-blocking) whenever a user opens a lesson, starts a solve, or launches a mock interview.

---

*Built with Next.js 16, Supabase, Groq, and a lot of emerald green.*
