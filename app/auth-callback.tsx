import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router } from 'expo-router'
import { onAuthChange } from '../lib/auth'
import { supabase } from '../lib/supabase'
import * as Linking from 'expo-linking'

export default function AuthCallback() {
  useEffect(() => {
    // If app cold-started via deep link, exchange code for a session
    (async () => {
      try {
        const url = await Linking.getInitialURL()
        if (url && url.includes('code=')) {
          const u = new URL(url)
          const code = u.searchParams.get('code')
          if (code && supabase) {
            await supabase.auth.exchangeCodeForSession({ code })
          }
        }
      } catch {}
    })()
    const sub = onAuthChange?.((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.replace('/profile')
      }
    })
    const t = setTimeout(() => router.replace('/profile'), 1500)
    return () => { (sub as any)?.subscription?.unsubscribe?.(); clearTimeout(t) }
  }, [])
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
      <Text>Completing sign in…</Text>
    </View>
  )
}
