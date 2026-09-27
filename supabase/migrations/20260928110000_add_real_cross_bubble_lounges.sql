create table if not exists public.real_lounge_rooms (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.real_lounge_members (
  room_id uuid not null references public.real_lounge_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  alias text not null,
  faculty text not null default '',
  avatar_id text not null default 'avatar_1',
  pre_answers jsonb,
  quiz_answers jsonb,
  quiz_score integer,
  quiz_details jsonb,
  evaluated_with_ai boolean not null default false,
  wants_connection boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, profile_id)
);

create table if not exists public.real_lounge_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.real_lounge_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sender_alias text not null,
  sender_avatar_id text not null default 'avatar_1',
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists real_lounge_rooms_status_idx on public.real_lounge_rooms(status, created_at);
create index if not exists real_lounge_messages_room_created_idx on public.real_lounge_messages(room_id, created_at);

-- Matching is done in one database transaction so two people tapping "join" at
-- the same time cannot overfill a two-person room.  Only the service-role Edge
-- Function calls this RPC; clients never get direct access to these tables.
create or replace function public.join_real_lounge(
  p_profile_id uuid,
  p_alias text,
  p_faculty text,
  p_avatar_id text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  select m.room_id into v_room_id
  from real_lounge_members m
  join real_lounge_rooms r on r.id = m.room_id
  where m.profile_id = p_profile_id and r.status in ('waiting', 'active')
  order by r.created_at desc
  limit 1;

  if v_room_id is not null then
    return v_room_id;
  end if;

  select r.id into v_room_id
  from real_lounge_rooms r
  where r.status = 'waiting'
    and (select count(*) from real_lounge_members m where m.room_id = r.id) = 1
    and exists (
      select 1
      from real_lounge_members m
      join profiles p on p.id = m.profile_id
      where m.room_id = r.id
        and p.presence_status in ('online', 'busy')
        and p.last_seen_at > now() - interval '2 minutes'
    )
  order by r.created_at
  for update of r skip locked
  limit 1;

  if v_room_id is null then
    insert into real_lounge_rooms(status) values ('waiting') returning id into v_room_id;
  else
    update real_lounge_rooms
    set status = 'active', updated_at = now()
    where id = v_room_id;
  end if;

  insert into real_lounge_members(room_id, profile_id, alias, faculty, avatar_id)
  values (v_room_id, p_profile_id, left(coalesce(p_alias, 'ผู้ไม่ประสงค์ออกนาม'), 80), left(coalesce(p_faculty, ''), 120), left(coalesce(p_avatar_id, 'avatar_1'), 80));

  return v_room_id;
end;
$$;
