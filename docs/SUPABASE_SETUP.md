Supabase setup (rooms + roasts)

Prereqs
- Supabase account and project created.
- Supabase CLI installed: `npm i -g supabase`.
- Access token exported: `export SUPABASE_ACCESS_TOKEN=<token>` (macOS/Linux) or `setx SUPABASE_ACCESS_TOKEN <token>` (Windows PowerShell). Create a token in the Supabase dashboard.

Project config
- Put these in `docs/apikeys.txt`:
  - `SUPABASE_URL=...`
  - `SUPABASE_ANON_KEY=...`

Buckets
- Create a public storage bucket named `rooms`:
  - Dashboard → Storage → New bucket → name: `rooms`, Public: enabled.
  - (Optional) also create `posters` if you want to upload captured posters later.

Database schema
- Run this SQL in the SQL editor (or `supabase db query`):

```sql
-- Basic, MVP-friendly schema (no auth). Add RLS later when you add real auth.
create table if not exists public.users (
  id uuid primary key,
  is_anon boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.roasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  image_url text not null,
  roast_text text,
  caption text,
  mess_score int,
  extras jsonb,
  created_at timestamp with time zone default now()
);

-- Optional: relax RLS for MVP (so anon key can read/write). Tighten later when real auth is added.
alter table public.users enable row level security;
alter table public.roasts enable row level security;

create policy if not exists "public users read-write"
on public.users for all using (true) with check (true);

create policy if not exists "public roasts read-write"
on public.roasts for all using (true) with check (true);
```

Edge function secret
- Set OpenAI key for the roast Edge Function using the CLI helper:

```
npm run supabase:set-openai
```

Deploy the function (optional; you can also call OpenAI directly from the client):

```
npx supabase functions deploy roast --project-ref <project-ref>
```

Verification
- Generate a roast in the app and open Profile. You should see a saved thumbnail.
- In Storage, uploaded images should appear under the `rooms` bucket.

