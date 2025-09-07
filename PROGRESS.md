# Roast My Room — Progress Log

Date: 2025-09-06

## Summary
- MVP app scaffolded (Expo SDK 53, Android focus) with capture ? generate ? result ? share flow.
- Supabase schema + Edge Function (`roast`) deployed; project secrets configured.
- Config-driven LLM (model + system prompt + extras) via `docs/llm.config.json`.
- Visual design pass (bold theme, gradients, animated accents) and shareable poster capture.

## What’s Done
- App
  - Home, Capture, Generating, Result, Profile screens.
  - Large logo on Home (no animation), profile icon on all screens.
  - Generating animation (vector flames with Reanimated).
  - Result screen without tabs; extras expand inline.
  - Dump-o-meter with shimmer + bouncing icon.
  - Buttons with press micro-animations; loading/disabled states on extras.
  - Share Roast: poster composition (room + roast + caption + brand watermark) + confetti overlay on share success.
- Data & Backend
  - Supabase schema (`users`, `roasts`, `credits_ledger`, `purchases`) and public buckets (`rooms`, `posters`).
  - Edge Function `roast` (Deno) deployed, reads model/prompt from request; supports `OPENAI_MODEL` fallback.
  - Project secret `OPENAI_API_KEY` set; CLI script added to rotate secrets.
  - Anonymous device user ID persisted locally; auto-save roast on generate; Profile fetches saved roasts.
- LLM & Config
  - Client uses `docs/llm.config.json` for `model`, `system_prompt`, and `extras`.
  - Extras executed as follow-ups in the same chat (no re-sending image).
  - Extras coerced to plain text response; JSON fallback parsed to text.
- Tooling
  - Git remote set to GitHub; initial commit pushed to `main`.

## In Progress / Polishing
- Improve error handling and toasts (save success, credit errors, network failures).
- Normalization of any remaining garbled copy on some devices.

## Next Up (High Priority)
1. Credits loop end-to-end
   - Debit 1 credit for each extra; add `credits_ledger` writes.
   - Show user credit balance in header/Profile; guard when insufficient.
2. Persist extras and mess_score
   - Extend `roasts` to store `mess_score` and `extras` JSON; hydrate in Profile detail.
3. Profile improvements
   - Saved roast detail view (full text, extras, share poster again).
4. Auth + RLS prep
   - Add Supabase Auth (Google/Apple), RLS policies, and device-to-auth migration path.
5. Error handling & moderation
   - Friendly UX for not-a-room and timeouts.
   - Optional content moderation/NSFW gate in edge or client prompt.

## Backlog / Nice to Have
- Replace confetti with brand-style animation.
- Reintroduce a poster preview screen with customization (layout, font size, watermark placement).
- Add metrics to PostHog (upload_started, roast_ready, share_clicked, extra_generated, save_completed).
- Crash reporting (Sentry init on app start).
- Deep links (out of MVP) — keep in backlog for future growth.

## Known Issues / Notes
- Some emoji glyphs can render as `??` on certain devices if used in static text. We now prefer vector icons.
- Expo Go is used (no dev client). If we need native modules beyond current set, consider an EAS dev build.

## How To Verify
- Start: `npx expo start --clear` ? Android.
- Generate a roast (Capture ? Generating ? Result):
  - See roast text, caption, Dump-o-meter.
  - Tap extras ? button pulses, spinner appears, result expands under button; button becomes disabled.
  - Share Roast ? poster is shared; confetti overlay appears ~1.5s.
  - Profile ? saved roast appears as a thumbnail (auto-save on generate).

## Ops / Scripts
- Update secrets from `docs/apikeys.txt`:
  - `npm run supabase:set-openai` (requires `SUPABASE_ACCESS_TOKEN` env var)
- Deploy function:
  - `npx supabase functions deploy roast --project-ref <project_ref>`

## Open Questions
- Exact credit pricing for extras in MVP (currently display only).
- Copy tone for extras and whether to add more (e.g., “What this room smells like”, “Spotify playlist”).
- Poster style options (fonts, overlays) to test for share CTR.

---

If you want this split into `TODO.md` + `CHANGELOG.md`, I can extract and format accordingly, and/or open GitHub issues for each “Next Up” item.
