-- Storage bucket (rooms) must be created in Dashboard; this file sets tables and policies.
-- Ensure required extensions are available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key,
  is_anon boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.roasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  image_url text not null,
  roast_text text,
  caption text,
  mess_score int,
  extras jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.roasts enable row level security;

-- Recreate policies idempotently (CREATE POLICY does not support IF NOT EXISTS)
drop policy if exists "public users read-write" on public.users;
create policy "public users read-write" on public.users for all using (true) with check (true);

drop policy if exists "public roasts read-write" on public.roasts;
create policy "public roasts read-write" on public.roasts for all using (true) with check (true);
