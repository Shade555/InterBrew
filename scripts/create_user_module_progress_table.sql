-- Track per-user completion progress for each module
-- Required for scenario Overview + History in app/components/scenario/content.jsx

create table if not exists public.user_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id integer not null references public.modules(id) on delete cascade,
  completed boolean not null default false,
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  started_at timestamptz default now(),
  completed_at timestamptz,
  last_accessed timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, module_id)
);

create index if not exists idx_user_module_progress_user_id
  on public.user_module_progress(user_id);

create index if not exists idx_user_module_progress_module_id
  on public.user_module_progress(module_id);

create index if not exists idx_user_module_progress_user_completed
  on public.user_module_progress(user_id, completed);

alter table public.user_module_progress enable row level security;

drop policy if exists "Users can view own module progress" on public.user_module_progress;
create policy "Users can view own module progress"
  on public.user_module_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own module progress" on public.user_module_progress;
create policy "Users can insert own module progress"
  on public.user_module_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own module progress" on public.user_module_progress;
create policy "Users can update own module progress"
  on public.user_module_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
