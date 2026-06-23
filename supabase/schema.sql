-- КБЖУ-трекер — схема базы данных
-- Запусти в Supabase: SQL Editor → New query → вставь всё → Run

create table if not exists public.profiles (
  id            integer primary key,
  name          text        not null default 'Пользователь',
  sex           text        not null default 'm' check (sex in ('m','f')),
  age           integer     not null default 25,
  height_cm     numeric(5,1) not null default 170,
  weight_kg     numeric(5,2) not null default 70,
  goal_weight_kg numeric(5,2) not null default 70,
  activity      numeric(5,3) not null default 1.55,
  goal          text        not null default 'keep' check (goal in ('gain','lose','keep')),
  units         text        not null default 'metric' check (units in ('metric','imperial')),
  goal_kcal     integer     not null default 0,
  goal_protein  integer     not null default 0,
  goal_carbs    integer     not null default 0,
  goal_fat      integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id         bigserial primary key,
  user_id    integer     not null references public.profiles(id) on delete cascade,
  weight_kg  numeric(5,2) not null,
  logged_at  timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id          bigserial primary key,
  user_id     integer     not null references public.profiles(id) on delete cascade,
  meal_name   text        not null,
  food_name   text        not null,
  grams       integer     not null,
  kcal        numeric(7,2) not null,
  protein_g   numeric(6,2) not null default 0,
  carbs_g     numeric(6,2) not null default 0,
  fat_g       numeric(6,2) not null default 0,
  logged_date date        not null default current_date,
  logged_at   timestamptz not null default now()
);

create table if not exists public.workouts (
  id          bigserial primary key,
  user_id     integer     not null references public.profiles(id) on delete cascade,
  type        text        not null,
  emoji       text,
  minutes     integer     not null,
  kcal_burned numeric(7,2) not null,
  logged_date date        not null default current_date,
  logged_at   timestamptz not null default now()
);

create table if not exists public.norm_history (
  id          bigserial primary key,
  user_id     integer     not null references public.profiles(id) on delete cascade,
  old_kcal    integer     not null,
  new_kcal    integer     not null,
  reason      text,
  adjusted_at timestamptz not null default now()
);
