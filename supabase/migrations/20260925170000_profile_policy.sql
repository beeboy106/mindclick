alter table public.profiles
  add column if not exists has_accepted_policy boolean not null default false,
  add column if not exists policy_accepted_at timestamptz;
