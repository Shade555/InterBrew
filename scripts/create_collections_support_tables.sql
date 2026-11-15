-- Collection, resource, badge, and collection-progress tables used by
-- app/components/collections/Collections.tsx.
-- Run after create_collections_table.sql and after Supabase Auth is enabled.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.collection_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  difficulty text,
  section_key text,
  section_id uuid REFERENCES public.collection_sections(id) ON DELETE SET NULL,
  completed boolean NOT NULL DEFAULT false,
  content text,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.collection_modules(id) ON DELETE CASCADE,
  type text,
  url text,
  content text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  section_key text,
  image_url text,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_cheatsheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  section_key text,
  resource_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_collection_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.collection_modules(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.user_module_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.collection_modules(id) ON DELETE CASCADE,
  is_revision boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.collection_badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- These tables support the mock-interview question solver. The misspelled
-- sollection_solve name is retained because legacy code still references it.
CREATE TABLE IF NOT EXISTS public.collection_solve (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.collection_modules(id) ON DELETE SET NULL,
  question_text text,
  question_type text,
  difficulty text,
  explanation text,
  options jsonb,
  correct_options jsonb,
  correct_boolean boolean,
  short_answer text,
  numerical_answer numeric,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sollection_solve (LIKE public.collection_solve INCLUDING ALL);

CREATE INDEX IF NOT EXISTS idx_collection_resources_module_id
  ON public.collection_resources(module_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_progress_user_id
  ON public.user_collection_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_meta_user_id
  ON public.user_module_meta(user_id);

ALTER TABLE public.collection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cheatsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collection_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_solve ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sollection_solve ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read collection content" ON public.collection_sections;
CREATE POLICY "Public can read collection content"
  ON public.collection_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read collection modules" ON public.collection_modules;
CREATE POLICY "Public can read collection modules"
  ON public.collection_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read collection resources" ON public.collection_resources;
CREATE POLICY "Public can read collection resources"
  ON public.collection_resources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read collection badges" ON public.collection_badges;
CREATE POLICY "Public can read collection badges"
  ON public.collection_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read collection cheatsheets" ON public.collection_cheatsheets;
CREATE POLICY "Public can read collection cheatsheets"
  ON public.collection_cheatsheets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage collection progress" ON public.user_collection_module_progress;
CREATE POLICY "Users can manage collection progress"
  ON public.user_collection_module_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage module metadata" ON public.user_module_meta;
CREATE POLICY "Users can manage module metadata"
  ON public.user_module_meta FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own badges" ON public.user_badges;
CREATE POLICY "Users can manage own badges"
  ON public.user_badges FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own solver rows" ON public.collection_solve;
CREATE POLICY "Users can manage own solver rows"
  ON public.collection_solve FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own legacy solver rows" ON public.sollection_solve;
CREATE POLICY "Users can manage own legacy solver rows"
  ON public.sollection_solve FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
