import fs from 'node:fs'
import path from 'node:path'

type KV = Record<string, string>

function parseKeys(): KV {
  const p = path.join(__dirname, 'docs', 'apikeys.txt')
  if (!fs.existsSync(p)) return {}
  const txt = fs.readFileSync(p, 'utf8')
  const kv: KV = {}
  for (const line of txt.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (key) kv[key] = val
  }
  return kv
}

export default () => {
  const env = parseKeys()
  return {
    expo: {
      name: 'Roast My Room',
      slug: 'roastmyroom',
      version: '0.1.0',
      orientation: 'portrait',
      // Use Play store icon placed under docs/android
      icon: './docs/android/play_store_512.png',
      scheme: 'roastmyroom',
      userInterfaceStyle: 'automatic',
      plugins: [
        'expo-asset',
        'expo-font',
        '@react-native-google-signin/google-signin'
      ],
      platforms: ['android'],
      android: {
        package: env.ANDROID_PACKAGE_NAME || 'com.roastmyroom.app',
        // Explicitly request Play Billing permission for purchases
        permissions: ['com.android.vending.BILLING'],
        // Ensure deep links with our custom scheme are routed back
        // to the app, specifically for the OAuth callback path.
        intentFilters: [
          {
            action: 'VIEW',
            data: [
              { scheme: 'roastmyroom', path: '/auth-callback' },
              // Dev Client sometimes uses the package name as scheme
              { scheme: env.ANDROID_PACKAGE_NAME || 'com.roastmyroom.app', path: '/auth-callback' }
            ],
            category: ['BROWSABLE', 'DEFAULT']
          }
        ],
        adaptiveIcon: {
          // Foreground image; Expo will resize as needed
          foregroundImage: './docs/android/res/mipmap-xxxhdpi/ic_launcher_foreground.png',
          backgroundColor: '#000000',
          // Optional monochrome for Android 13+
          monochromeImage: './docs/android/res/mipmap-xxxhdpi/ic_launcher_monochrome.png'
        }
      },
      extra: {
        OPENAI_API_KEY: env.OPENAI_API_KEY || '',
        SUPABASE_URL: env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
        GOOGLE_WEB_CLIENT_ID: env.GOOGLE_WEB_CLIENT_ID || '',
        POSTHOG_PROJECT_KEY: env.POSTHOG_PROJECT_KEY || '',
        SENTRY_DSN: env.SENTRY_DSN || '',
        eas: {
          projectId: '8af660f9-9944-4f93-96ea-c433dc7acc1f'
        }
      }
    }
  }
}
