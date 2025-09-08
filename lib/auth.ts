import { supabase } from './supabase'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import Constants from 'expo-constants'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_WEB_CLIENT_ID } from './config'

const CALLBACK_PATH = 'auth-callback'
const APP_SCHEME = 'roastmyroom'

function parseCode(url: string): string | null {
  try {
    const u = new URL(url)
    return u.searchParams.get('code')
  } catch {
    const parsed = Linking.parse(url)
    const qp: any = (parsed as any)?.queryParams || {}
    return (qp.code as string) || null
  }
}

let authHandlerInstalled = false
let lastHandledUrl: string | null = null

export function installAuthCallbackListener() {
  if (authHandlerInstalled || !supabase) return
  authHandlerInstalled = true

  const maybeHandle = async (url: string | null) => {
    if (!url) return
    if (url === lastHandledUrl) return
    lastHandledUrl = url
    // Only react to our callback path
    const lower = url.toLowerCase()
    if (!lower.startsWith(`${APP_SCHEME}://`) || !lower.includes(CALLBACK_PATH)) return
    const code = parseCode(url)
    if (code) {
      try {
        await supabase!.auth.exchangeCodeForSession(code)
      } catch {
        // ignore; caller flow will surface errors
      }
    }
  }

  // Handle cold start
  Linking.getInitialURL().then(maybeHandle).catch(() => {})
  // Handle in-app events
  Linking.addEventListener('url', (e) => {
    maybeHandle(e.url)
  })
}

export async function getRedirectUrl() {
  // expo-linking generates app-scheme URL like roastmyroom://auth-callback
  return Linking.createURL(CALLBACK_PATH)
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured')
  const useProxy = Constants.appOwnership === 'expo'
  const redirectTo = (AuthSession as any).makeRedirectUri({ scheme: APP_SCHEME, path: CALLBACK_PATH, useProxy })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        // Ensure refresh token on Google
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  if (error) throw error
  if (!data?.url) throw new Error('No auth URL returned')

  // Open the auth session browser and wait for the deep link redirect
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (res.type === 'success' && res.url) {
    // In PKCE flow Supabase redirects back with ?code=...
    const code = parseCode(res.url)
    if (code) {
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
      if (exErr) throw exErr
    }
  }
}

let googleConfigured = false
function ensureGoogleConfigured() {
  if (googleConfigured) return
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    offlineAccess: false,
    forceCodeForRefreshToken: false
  })
  googleConfigured = true
}

export async function signInWithGoogleNative() {
  if (!supabase) throw new Error('Supabase not configured')
  ensureGoogleConfigured()
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  const result = await GoogleSignin.signIn()
  const idToken = (result as any)?.idToken
  if (!idToken) throw new Error('Google sign-in did not return idToken. Check GOOGLE_WEB_CLIENT_ID.')
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
  if (error) throw error
}

export async function signOut() {
  return supabase?.auth.signOut()
}

export function onAuthChange(cb: (event: string) => void) {
  return supabase?.auth.onAuthStateChange((event) => cb(event))
}
