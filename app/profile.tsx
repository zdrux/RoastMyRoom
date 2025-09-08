import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native'
import { useEffect, useState } from 'react'
import { useCreditsStore, useRoastStore } from '../lib/store'
import { fetchSavedRoasts } from '../lib/persist'
import { router } from 'expo-router'
import { SYSTEM_PROMPT } from '../lib/llm'
import * as Sharing from 'expo-sharing'
import { Ionicons } from '@expo/vector-icons'
import { deleteSavedRoast } from '../lib/persist'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton } from '../components/Buttons'
import { signInWithGoogle, signInWithGoogleNative, signOut } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const credits = useCreditsStore((s) => s.credits)
  const addDaily = useCreditsStore((s) => s.addDaily)
  const saved = useRoastStore((s) => s.savedRoasts)
  const setSaved = useRoastStore((s) => s.setSavedRoasts)
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState<string | null>(null)
  useEffect(() => {
    (async () => {
      try {
        const u = await supabase?.auth.getUser()
        setEmail(u?.data.user?.email ?? null)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const items = await fetchSavedRoasts()
        setSaved(items)
      } catch (e) {
        // ignore for MVP
      }
    })()
  }, [])
  const footerPad = (insets.bottom || 0) + 16
  const footerHeight = 72 + (insets.bottom || 0)
  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: footerHeight + 24 }}>
      <Text style={styles.title}>Profile</Text>
      {email ? (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.item}>Signed in as: {email}</Text>
          <TouchableOpacity style={styles.btn} onPress={async () => { await signOut(); setEmail(null) }}>
            <Text style={styles.btnText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={async () => {
          try {
            // Try native Google first, then fall back to browser-based OAuth.
            await signInWithGoogleNative()
          } catch {
            try { await signInWithGoogle() } catch {}
          }
          try { const u = await supabase?.auth.getUser(); setEmail(u?.data.user?.email ?? null) } catch {}
        }}>
          <Text style={styles.btnText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.item}>Credits: {credits}</Text>
      <TouchableOpacity style={styles.btn} onPress={addDaily}>
        <Text style={styles.btnText}>Claim Daily Credit</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { marginTop: 20 }]}>Saved Roasts</Text>
      <View style={styles.grid}>
        {saved.length === 0 ? (
          <Text style={styles.desc}>No saved roasts yet. Generate one and save it!</Text>
        ) : (
          saved.map((r) => (
            <View key={r.id} style={styles.thumbWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  useRoastStore.setState({
                    imageUri: r.imageUri,
                    roast: r.result,
                    chat: [
                      { role: 'system', content: SYSTEM_PROMPT },
                      { role: 'assistant', content: JSON.stringify({
                        is_room: r.result.isRoom,
                        roast: r.result.roast,
                        caption: r.result.caption,
                        mess_score: r.result.messScore || 50
                      }) }
                    ]
                  })
                  router.push('/result')
                }}
              >
                <Image source={{ uri: r.imageUri }} style={styles.thumb} />
              </TouchableOpacity>
              <View style={styles.thumbBar}>
                <Pressable onPress={() => Sharing.shareAsync(r.imageUri)} style={styles.thumbIconL}>
                  <Ionicons name="share-social" size={18} color="#111" />
                </Pressable>
                <Pressable onPress={async () => {
                  await deleteSavedRoast(r)
                  // optimistic update
                  useRoastStore.setState((s) => ({
                    savedRoasts: s.savedRoasts.filter((x) => x.id !== r.id)
                  }))
                }} style={styles.thumbIconR}>
                  <Ionicons name="trash" size={18} color="#B00020" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
      <Text style={styles.desc}>Mock paywall coming later. Anonymous use allowed until share/save.</Text>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: footerPad }]}>
      <View style={{ paddingHorizontal: 16 }}>
        <PrimaryButton title="New Roast" icon="camera" onPress={() => router.replace('/capture')} />
      </View>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#0E0F22', paddingTop: 12 },
  title: { color: 'white', fontSize: 22, fontWeight: '800' },
  item: { color: 'white', marginTop: 8 },
  desc: { color: '#aaa', marginTop: 8 },
  btn: { backgroundColor: '#222', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 104, height: 184, borderRadius: 12 },
  thumbBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, backgroundColor: '#FFFFFFD0', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  thumbIconL: { padding: 6 },
  thumbIconR: { padding: 6 }
})
