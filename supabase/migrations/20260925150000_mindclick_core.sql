-- Mindclick: PostgreSQL source of truth for profiles, matching, and feed.
-- Firebase remains responsible for authentication and chat only.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  legacy_user_id text unique not null,
  display_name text not null default '',
  avatar_url text,
  faculty text not null default '',
  bio text not null default '',
  gender text not null default 'prefer_not_to_say',
  social_links jsonb not null default '{}'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_responses (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  completed_categories text[] not null default '{}',
  category_answers jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.favorites (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, target_profile_id),
  check (profile_id <> target_profile_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  topic_id text,
  content text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index post_comments_post_id_idx on public.post_comments (post_id, created_at);

create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

-- Edge Functions use the service role after validating Firebase ID tokens.
-- Direct browser/mobile access is denied; never add an anon policy to these tables.
alter table public.profiles enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.favorites enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reactions enable row level security;
