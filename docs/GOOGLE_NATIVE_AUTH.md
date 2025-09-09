Native Google Sign-In (Android) with Supabase

Overview
- Uses `@react-native-google-signin/google-signin` to obtain an `id_token`.
- Exchanges the token with Supabase via `supabase.auth.signInWithIdToken({ provider: 'google', token })`.

Prerequisites
- Expo SDK 53 with EAS builds (or `expo run:android`).
- Google OAuth 2.0 credentials in Google Cloud Console.

Google Cloud setup
1) Create OAuth client IDs:
   - Web client: type "Web application" → copy the Client ID. This is used as `GOOGLE_WEB_CLIENT_ID`.
   - Android client: type "Android" → set package to `com.roastmyroom.app` (or your package), add SHA‑1 and SHA‑256 of your keystore.
     - For EAS keystore: `npx eas credentials -p android` → select your app → view fingerprints.
2) Ensure the Android client is linked to the same project as the Web client.

App config
- Add `GOOGLE_WEB_CLIENT_ID` to `docs/apikeys.txt` and rebuild.
- Dev client: `npx eas build -p android --profile development` then `npx expo start --dev-client`.

Where it’s wired
- `lib/auth.ts`: `signInWithGoogleNative()` configures Google Sign-In and exchanges the idToken with Supabase.
- `app/profile.tsx`: Tries native first, then falls back to browser-based OAuth.

Testing
- Install the dev client APK from EAS output.
- Start Metro: `npx expo start --dev-client`.
- Tap "Sign in with Google" on the Profile screen.

Common issues
- DEVELOPER_ERROR: Web client ID mismatch or wrong SHA‑1/SHA‑256 on Android OAuth client.
- idToken is null: Set `GOOGLE_WEB_CLIENT_ID` and rebuild the app (hot reload won’t apply native config).
