import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { initAnalytics } from '../lib/analytics'
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_900Black } from '@expo-google-fonts/poppins'

const qc = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold, Poppins_900Black })
  useEffect(() => {
    initAnalytics()
  }, [])

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={qc}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
