Android release (EAS → Google Play) and SHA‑1

Prereqs
- Expo account (for EAS) and Google Play Console access.
- Node 18+. In repo root: `npm i`.

1) Sign in to EAS and initialize
```bash
npm i -g eas-cli
eas login
eas init  # if prompted; non-interactive OK
```

2) Build the AAB for Internal Testing
```bash
eas build -p android --profile production
```
Notes
- EAS manages the Android keystore automatically unless you choose to provide one.
- The build produces an .aab; wait for it to complete and download.

3) Create the Play app and upload
- Play Console → Create app → package: `com.roastmyroom.app`.
- App content: data safety, content rating, privacy policy.
- Testing → Internal testing → Create release → upload the .aab from step 2 → roll out to testers (optional).

4) Get the production SHA‑1 (App Signing key)
- Play Console → App integrity → App signing key certificate → copy `SHA‑1`.
  (This appears only after your first .aab is uploaded and processed.)

5) (Optional) Upload key SHA‑1 for OAuth testing
```bash
eas credentials -p android --display
```
Copy the `Keystore hashes` → `SHA-1`. Use this only for the “Android” OAuth client used for test builds; production should use the App Signing SHA‑1 above.

6) Submission via EAS (optional)
You can also submit straight from CI/local:
```bash
eas submit -p android --latest --profile production
```

Where to put secrets
- App config: `docs/apikeys.txt` is read by `app.config.ts` (OpenAI, Supabase, PostHog, Sentry).
- RevenueCat: configure at runtime via SDK key.
- OAuth: add Google OAuth client + secret in Supabase dashboard providers; redirect URL `roastmyroom://auth-callback`.

