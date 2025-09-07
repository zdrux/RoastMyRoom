-- Initial schema for RoastMyRoom MVP (no referrals)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  is_anon boolean not null default true,
  username text unique,
  created_at timestamp with time zone default now()
);

create table if not exists public.roasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  image_url text not null,
  poster_url text,
  roast_text text,
  caption text,
  is_premium_fix boolean default false,
  is_premium_before_after boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  delta integer not null,
  reason text,
  created_at timestamp with time zone default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id text,
  amount numeric,
  platform text,
  created_at timestamp with time zone default now()
);

-- Storage buckets
-- rooms: public images
-- posters: public generated posters
insert into storage.buckets (id, name, public)
values ('rooms', 'rooms', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('posters', 'posters', true)
on conflict (id) do nothing;

