alter table public.profiles
  add column if not exists presence_status text not null default 'offline'
    check (presence_status in ('online', 'busy', 'offline')),
  add column if not exists last_seen_at timestamptz;
