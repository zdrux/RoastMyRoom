import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { initAnalytics } from '../lib/analytics'
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_900Black } from '@expo-google-fonts/poppins'
import { installAuthCallbackListener } from '../lib/auth'

const qc = new QueryClient()

// Ensure the in-app browser session is correctly completed on Android/iOS
// This should run at module scope per Expo's recommendation.
WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold, Poppins_900Black })
  useEffect(() => {
    initAnalytics()
    // Install a catch-all handler so OAuth completes even if the
    // browser doesn't close or the app cold-starts from a deep link.
    installAuthCallbackListener()
  }, [])

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={qc}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
