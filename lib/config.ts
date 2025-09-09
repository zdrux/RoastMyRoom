import Constants from 'expo-constants'

const extra = (Constants?.expoConfig?.extra || {}) as any

export const OPENAI_API_KEY = String(extra.OPENAI_API_KEY || '')
export const SUPABASE_URL = String(extra.SUPABASE_URL || '')
export const SUPABASE_ANON_KEY = String(extra.SUPABASE_ANON_KEY || '')
export const POSTHOG_PROJECT_KEY = String(extra.POSTHOG_PROJECT_KEY || '')
export const SENTRY_DSN = String(extra.SENTRY_DSN || '')
export const GOOGLE_WEB_CLIENT_ID = String(extra.GOOGLE_WEB_CLIENT_ID || '')
export const DEBUG_AUTH = !!(extra.DEBUG_AUTH && String(extra.DEBUG_AUTH).toLowerCase() !== 'false' && String(extra.DEBUG_AUTH).trim() !== '')

export const POSTER = {
  width: 1080,
  height: 1920
}
