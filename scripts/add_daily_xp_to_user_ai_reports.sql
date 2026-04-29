-- Add daily_xp column to user_ai_reports table
ALTER TABLE public.user_ai_reports 
ADD COLUMN IF NOT EXISTS daily_xp integer DEFAULT 0;

-- Backfill existing records with calculated XP (50 + score)
UPDATE public.user_ai_reports 
SET daily_xp = 50 + COALESCE(score, 0)
WHERE daily_xp = 0;
