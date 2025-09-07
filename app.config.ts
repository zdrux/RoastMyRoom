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
      icon: './docs/app_logo.png',
      scheme: 'roastmyroom',
      userInterfaceStyle: 'automatic',
      plugins: [
        'expo-asset',
        'expo-font'
      ],
      platforms: ['android'],
      android: {
        package: env.ANDROID_PACKAGE_NAME || 'com.roastmyroom.app',
        permissions: [],
        adaptiveIcon: {
          foregroundImage: './docs/app_logo.png',
          backgroundColor: '#000000'
        }
      },
      extra: {
        OPENAI_API_KEY: env.OPENAI_API_KEY || '',
        SUPABASE_URL: env.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
        POSTHOG_PROJECT_KEY: env.POSTHOG_PROJECT_KEY || '',
        SENTRY_DSN: env.SENTRY_DSN || ''
      }
    }
  }
}
