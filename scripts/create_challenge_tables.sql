-- Challenge content, leaderboard, and multiplayer lobby tables.
-- Challenge rows are intentionally not seeded here; add project content after
-- creating the tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score integer NOT NULL DEFAULT 0,
  challenges_completed integer NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'XP',
  xp integer NOT NULL DEFAULT 0,
  streaks integer NOT NULL DEFAULT 0,
  badges integer NOT NULL DEFAULT 0,
  certificates integer NOT NULL DEFAULT 0,
  month integer NOT NULL,
  year integer NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges_deadlock_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name text NOT NULL,
  description text NOT NULL,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_action_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges_scheduling_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  processes jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges_memory_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  processes jsonb NOT NULL DEFAULT '[]'::jsonb,
  solution jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.os_challenges_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  task_description text NOT NULL,
  options_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  correct_command text,
  feedback_text text,
  xp_reward integer NOT NULL DEFAULT 100,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_period
  ON public.leaderboard(year, month, xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_period
  ON public.leaderboard(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_os_challenges_category
  ON public.os_challenges_tasks(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status
  ON public.duel_rooms(status, created_at DESC);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges_deadlock_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges_scheduling_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges_memory_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_challenges_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read challenge content" ON public.challenges_deadlock_scenarios;
CREATE POLICY "Public can read challenge content"
  ON public.challenges_deadlock_scenarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read scheduling challenges" ON public.challenges_scheduling_scenarios;
CREATE POLICY "Public can read scheduling challenges"
  ON public.challenges_scheduling_scenarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read memory challenges" ON public.challenges_memory_scenarios;
CREATE POLICY "Public can read memory challenges"
  ON public.challenges_memory_scenarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read OS challenge tasks" ON public.os_challenges_tasks;
CREATE POLICY "Public can read OS challenge tasks"
  ON public.os_challenges_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read leaderboard" ON public.leaderboard;
CREATE POLICY "Public can read leaderboard"
  ON public.leaderboard FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create leaderboard rows" ON public.leaderboard;
CREATE POLICY "Users can create leaderboard rows"
  ON public.leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own leaderboard rows" ON public.leaderboard;
CREATE POLICY "Users can update own leaderboard rows"
  ON public.leaderboard FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can read duel rooms" ON public.duel_rooms;
CREATE POLICY "Authenticated users can read duel rooms"
  ON public.duel_rooms FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can create duel rooms" ON public.duel_rooms;
CREATE POLICY "Authenticated users can create duel rooms"
  ON public.duel_rooms FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update duel rooms" ON public.duel_rooms;
CREATE POLICY "Authenticated users can update duel rooms"
  ON public.duel_rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
