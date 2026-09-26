-- Stable source identifiers make the one-off Firestore migration safe to rerun.
alter table public.posts
  add column if not exists legacy_firestore_id text unique;

alter table public.post_comments
  add column if not exists legacy_firestore_id text unique;
