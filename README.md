# Roast My Room (MVP)

- Android-only Expo app scaffolded in this repo.
- Keys are read from `docs/apikeys.txt` via `app.config.ts` (not committed).
- Supabase schema and Edge Function included under `supabase/`.

## Getting started

1. Ensure `docs/apikeys.txt` contains:
   - `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `POSTHOG_PROJECT_KEY`, `SENTRY_DSN`
2. Install deps and start Expo:
   - `npm install`
   - For device/emulator (native modules like view-shot): `npm run android` (first time builds a dev client)
   - For web/QR dev (limited native support): `npx expo start`
3. Deploy Supabase schema and function:
   - Run SQL in `supabase/schema.sql` on your project
   - Create edge function `roast` with code in `supabase/functions/roast/index.ts` and set env `OPENAI_API_KEY`

## App flow
- `index` → Start → `capture` (camera/gallery) → `generating` (call edge function) → `result` (tabs + poster + share)
- Poster is built in-app (`react-native-view-shot`) at 9:16 with watermark:
  - Signed-in (future): `@username • RoastMyRoom`
  - Anonymous: brand-only (logo + name)

## Notes
- Referrals and deep links are removed for MVP.
- Premium tabs (“Fix It”, “Before/After”) are unlocked and cost 0 during MVP.
- Daily credit drip is mocked in state; no server accounting yet.
