-- Запусти в Supabase SQL Editor → New query → Run
-- Разрешает запись и удаление для анонимных пользователей (прототип без авторизации)

alter table public.profiles      disable row level security;
alter table public.weight_logs   disable row level security;
alter table public.diary_entries disable row level security;
alter table public.workouts      disable row level security;
alter table public.norm_history  disable row level security;

grant all on public.profiles      to anon;
grant all on public.weight_logs   to anon;
grant all on public.diary_entries to anon;
grant all on public.workouts      to anon;
grant all on public.norm_history  to anon;

grant usage, select on all sequences in schema public to anon;
