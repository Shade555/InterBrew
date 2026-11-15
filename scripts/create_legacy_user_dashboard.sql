-- Compatibility table used by the legacy AI-report and current-module API
-- routes. The main dashboard UI uses public.user_dashboards instead.

CREATE TABLE IF NOT EXISTS public.user_dashboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_module_name text,
  current_module_path text,
  xp integer NOT NULL DEFAULT 0,
  leaderboard_rank text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_dashboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own legacy dashboard" ON public.user_dashboard;
CREATE POLICY "Users can read own legacy dashboard"
  ON public.user_dashboard FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own legacy dashboard" ON public.user_dashboard;
CREATE POLICY "Users can update own legacy dashboard"
  ON public.user_dashboard FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
