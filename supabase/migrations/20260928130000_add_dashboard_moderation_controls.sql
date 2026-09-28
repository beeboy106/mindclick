alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists moderation_note text not null default '',
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_account_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_account_status_check
      check (account_status in ('active', 'suspended', 'banned'));
  end if;
end $$;

alter table public.moderation_reports
  add column if not exists status text not null default 'new',
  add column if not exists admin_note text not null default '',
  add column if not exists assigned_to text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'moderation_reports_status_check'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_status_check
      check (status in ('new', 'reviewing', 'resolved', 'dismissed'));
  end if;
end $$;

create index if not exists moderation_reports_status_created_idx
  on public.moderation_reports(status, created_at desc);
