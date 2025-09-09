import { supabase } from './supabase'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import Constants from 'expo-constants'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { GOOGLE_WEB_CLIENT_ID, DEBUG_AUTH } from './config'
import { useDebugStore } from './store'

function d(...args: any[]) {
  if (!DEBUG_AUTH) return
  try {
    // eslint-disable-next-line no-console
    console.log('[auth]', ...args)
  } catch {}
  try {
    const line = args
      .map((a) => (typeof a === 'string' ? a : (() => { try { return JSON.stringify(a) } catch { return String(a) } })()))
      .join(' ')
    useDebugStore.getState().addLog(line)
  } catch {}
}

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
  ;(global as any).__DEBUG_AUTH__ = DEBUG_AUTH
  const pkg = (Constants as any)?.expoConfig?.android?.package || 'unknown'
  const wcid = GOOGLE_WEB_CLIENT_ID || ''
  d('Configuring GoogleSignin')
  d('package:', pkg)
  d('webClientId length:', wcid.length, 'suffix:', wcid.slice(-16))
  if (!wcid || !wcid.endsWith('.apps.googleusercontent.com')) {
    d('WARN: GOOGLE_WEB_CLIENT_ID looks invalid (must be Web client ID)')
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    scopes: ['openid', 'email', 'profile'],
    offlineAccess: false,
    forceCodeForRefreshToken: false
  })
  googleConfigured = true
}

export async function signInWithGoogleNative() {
  if (!supabase) throw new Error('Supabase not configured')
  ensureGoogleConfigured()
  try {
    const hasPS = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    d('hasPlayServices:', hasPS)
    const result: any = await GoogleSignin.signIn()
    d('Google signIn result keys:', Object.keys(result || {}))
    let idToken: string | null = null
    const rType = result?.type
    if (rType === 'success') {
      idToken = result?.data?.idToken ?? null
      // As an additional guard on Android, fetch tokens explicitly if needed
      if (!idToken) {
        try {
          const toks = await GoogleSignin.getTokens()
          idToken = (toks as any)?.idToken || null
          d('Fetched tokens via getTokens(). idToken present:', !!idToken)
        } catch (e) {
          d('getTokens() failed')
        }
      }
    } else if (rType === 'cancelled') {
      const msg = 'User cancelled Google sign-in'
      d('Sign-in cancelled by user')
      throw Object.assign(new Error(msg), { code: 'SIGN_IN_CANCELLED' })
    } else {
      d('Unexpected signIn() result type:', rType)
    }
    d('idToken present:', !!idToken)
    if (!idToken) {
      const msg = 'Google sign-in did not return idToken. Check GOOGLE_WEB_CLIENT_ID (must be Web client ID) and Android OAuth SHA-1.'
      throw Object.assign(new Error(msg), { code: 'NO_ID_TOKEN' })
    }
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
    if (error) throw Object.assign(error, { code: 'SUPABASE_EXCHANGE_ERROR' })
  } catch (e: any) {
    // Surface Google Sign-In error codes when possible
    const code = e?.code || e?.status || e?.statusCode || 'UNKNOWN'
    d('Native Google sign-in failed:', code, e?.message || String(e))
    try { d('Error payload:', JSON.stringify(e)) } catch {}
    throw e
  }
}

export async function signOut(opts?: { disconnect?: boolean }) {
  try {
    ensureGoogleConfigured()
    // Sign out from the native module so the next sign-in shows the picker.
    await GoogleSignin.signOut()
    if (opts?.disconnect) {
      // Revoke granted scopes to fully disconnect this app from the account
      // which further increases the chance of seeing the account chooser.
      try {
        // Best-effort clear cached access token then revoke
        try {
          const toks: any = await GoogleSignin.getTokens()
          if (toks?.accessToken) {
            await GoogleSignin.clearCachedAccessToken(toks.accessToken)
          }
        } catch {}
        await GoogleSignin.revokeAccess()
      } catch {}
    }
  } catch {}
  return supabase?.auth.signOut()
}

export function onAuthChange(cb: (event: string) => void) {
  return supabase?.auth.onAuthStateChange((event) => cb(event))
}
