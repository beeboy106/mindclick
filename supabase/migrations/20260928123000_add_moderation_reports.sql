create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('user', 'post', 'comment', 'message')),
  target_id text not null,
  target_name text not null default '',
  reason text not null check (reason in ('harassment', 'spam', 'hate_speech', 'impersonation', 'other')),
  details text not null default '',
  context text not null default '',
  post_id text,
  post_content text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_reports_created_idx
  on public.moderation_reports(created_at desc);
create index if not exists moderation_reports_reporter_idx
  on public.moderation_reports(reporter_profile_id, created_at desc);
