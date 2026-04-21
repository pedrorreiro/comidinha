create table if not exists public.diary_meals (
  user_id uuid not null references auth.users(id) on delete cascade,
  date_ymd text not null,
  slot text not null,
  content text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, date_ymd, slot)
);

create index if not exists idx_diary_meals_user_date
  on public.diary_meals(user_id, date_ymd);

alter table public.diary_meals enable row level security;

drop policy if exists "Users can read own diary meals" on public.diary_meals;
create policy "Users can read own diary meals"
  on public.diary_meals
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own diary meals" on public.diary_meals;
create policy "Users can insert own diary meals"
  on public.diary_meals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own diary meals" on public.diary_meals;
create policy "Users can update own diary meals"
  on public.diary_meals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own diary meals" on public.diary_meals;
create policy "Users can delete own diary meals"
  on public.diary_meals
  for delete
  using (auth.uid() = user_id);
