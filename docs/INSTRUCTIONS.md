# Roast My Room — MVP PRD (Clean)

## 1. Product In One Glance
**Elevator Pitch:**
A fun entertainment app where users upload photos of their messy, weird, or too-perfect rooms. AI roasts the room, suggests quick fixes, and generates a shareable meme-style poster. Social sharing fuels virality.

**Core Loop:**
1. Snap/Upload a room photo
2. AI generates roast, caption, and poster
3. User laughs, shares, earns credits
4. Friends discover via shared posts and repeat

---

## 2. MVP Scope & Goals
- **Platform:** Android (Expo managed) for MVP.
- **Free vs Premium:** “Fix It” and “Before/After” are premium features but remain unlocked (free) in MVP for testing. Re-roll costs 1 credit.
- **Onboarding:** Allow anonymous use until share/save; require sign-in only for gated actions.
- **Latency:** Simple synchronous call; show a loading screen. Target <10s end-to-end.
- **Objectives:** Ship a fun, repeatable flow; maximize shares; validate credits loop.

---

## 3. Target Users
- Teens and young adults (13–30) who enjoy memes, roasts, TikTok/IG reels.
- People with messy/quirky rooms or selfies taken in rooms.
- Social sharers who want to “show their roast” for clout.

---

## 4. Key Features

### Capture & Upload
- Camera with grid overlay and snap button; import from gallery.
- (Optional) Face/address blur as a later enhancement.

### Roast Generation
- Model: OpenAI GPT‑4o (keys in `docs/apikeys.txt`).
- Prompt includes instruction to only roast room photos; otherwise return a friendly “not a room” message.
- Outputs per photo:
  - Full roast text (3–5 lines)
  - One-liner caption (share-ready)
  - Shareable 9:16 poster (photo + overlay + watermark)

### Result Screen
- Tabs:
  - Roast (default)
  - Fix It (Premium; unlocked in MVP)
  - Before/After (Premium; unlocked in MVP, produced via a single LLM prompt)
- Actions: Save, Copy caption, Share (TikTok/IG/X), Re-roll (1 credit)

### Sharing
- Share card with watermark: `@username • RoastMyRoom` when signed in; brand-only (logo + app name) when anonymous.

### Monetization & Credits
- Starter balance: 3 free credits + daily login reward (1 credit), no cap.
- Cost: All premium actions are 1 credit in MVP (adjust later).
- IAP: Mock paywall only (no live purchases yet).

---

## 5. Tech Stack

### Client (Expo + React Native)
- Navigation: `expo-router`
- Images: `expo-image`, `react-native-image-picker`
- State/Data: `zustand`, `@tanstack/react-query`, `react-hook-form`
- Animations: `react-native-reanimated`, `lottie-react-native`

### Backend (Supabase)
- Auth: Anonymous; email/Google/Apple later.
- Database: Postgres with RLS.
- Storage: Buckets for room uploads and poster outputs.
- Edge Functions: TypeScript-based AI calls and image composition.
- Async: Supabase Queue available, but MVP uses a simple synchronous call.

### Analytics & Ops
- PostHog for funnels/retention.
- Sentry for error/crash tracking.
- Push (OneSignal/Expo) is out of scope for MVP.

---

## 6. Screens & UX Flow

### Welcome
- Copy: “Get roasted. Laugh. Fix it.”
- CTA: Start

### Camera/Upload
- Buttons: Take Photo, Upload from Gallery

### Generating
- Lottie animation (fire/oven)
- Copy: “Preheating the oven…” / “Cooking your roast…”

### Result
- Roast tab: Roast text (3–5 lines), caption, re-roll
- Fix/Glow-Up tab (Premium; free in MVP): Actionable cleanup tips (30/60‑min variants)
- Before/After tab (Premium; free in MVP): Lightweight mockup via single LLM prompt
- Share tab: Watermarked poster, Copy Caption, Share

### Profile
- Shows credits, buy options, defaults

---

## 7. Non-Goals (MVP)
- Multi-photo batch uploads for entire houses
- AR room scanning
- Hardcore AI photo editing (beyond text overlays/mockups)
- Long-term personalization
- Tone slider / profanity toggle (excluded in MVP)

---

## 8. Risks & Considerations
- Content moderation: Light prompt-based gate that ensures a room photo; no profanity filtering (it’s a roast).
- Latency: Synchronous path must typically return <10s.
- Legal: Age gate 13+, disclaimer, and consent text when faces are present.
- Virality: Ensure sharing works smoothly on TikTok/IG.

---

## 9. Success Metrics
- Day 1: ≥ 40% of users share a roast
- Week 1 retention: ≥ 25%
- ARPU (mock phase): N/A; track paywall views and intent

---

## 10. Data Model (Initial)
- `users` (id, is_anon, username, created_at)
- `roasts` (id, user_id, image_url, poster_url, roast_text, caption, is_premium_fix, is_premium_before_after, created_at)
- `credits_ledger` (id, user_id, delta, reason, created_at)
- `purchases` (id, user_id, product_id, amount, platform, created_at)

---

## 11. Storage
- Buckets: `rooms` (original uploads), `posters` (generated outputs)
- Poster spec: 9:16 at 1080×1920; watermark at a corner (bottom-right recommended).
  - Signed-in users: `@username • RoastMyRoom` (plus app logo)
  - Anonymous users: brand-only watermark (app logo + app name from `docs/app_logo.png`)
- Max upload size: ~10MB; clamp and compress on device when possible

---

## 12. Keys & Configuration
Place non-committed secrets in `docs/apikeys.txt`:
- OpenAI API Key
- Supabase URL + Anon Key
- PostHog Project Key
- Sentry DSN

---

## 13. Copy Appendix (Proposed)
- Welcome headline: “Get roasted. Laugh. Fix it.”
- Start button: “Start”
- Upload options: “Take Photo”, “Upload from Gallery”
- Loading primary: “Preheating the oven…”
- Loading alt: “Cooking your roast…”
- Not-a-room validation: “That doesn’t look like a room. Try another photo.”
- Roast tab title: “Roast”
- Fix tab title: “Fix It (Free in MVP)”
- Before/After tab title: “Before/After (Free in MVP)”
- Re-roll: “Re-roll (1 credit)”
- Save: “Save Poster”
- Copy caption: “Copy Caption”
- Share: “Share Roast”
- Watermark (signed in): “@username • RoastMyRoom”
- Watermark (anonymous): “RoastMyRoom” brand + app logo
- Age gate: “You must be 13+ to use Roast My Room.”
- Consent text (faces): “If people appear in your photo, confirm you have their consent to upload and share.”
- Disclaimer: “This is humor. Don’t upload personal or sensitive info. We roast rooms, not people.”

---

## 14. Post‑MVP Roadmap
- Tone slider and roast intensity options
- Real paywall + RevenueCat integration

- Push notifications and drip engagement
- Advanced moderation and optional face blur
