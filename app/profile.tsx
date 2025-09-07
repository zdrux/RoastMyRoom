import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useEffect } from 'react'
import { useCreditsStore, useRoastStore } from '../lib/store'
import { fetchSavedRoasts } from '../lib/persist'

export default function Profile() {
  const credits = useCreditsStore((s) => s.credits)
  const addDaily = useCreditsStore((s) => s.addDaily)
  const saved = useRoastStore((s) => s.savedRoasts)
  const setSaved = useRoastStore((s) => s.setSavedRoasts)

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
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Profile</Text>
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
            <Image key={r.id} source={{ uri: r.imageUri }} style={styles.thumb} />
          ))
        )}
      </View>
      <Text style={styles.desc}>Mock paywall coming later. Anonymous use allowed until share/save.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  title: { color: 'white', fontSize: 22, fontWeight: '800' },
  item: { color: 'white', marginTop: 8 },
  desc: { color: '#aaa', marginTop: 8 },
  btn: { backgroundColor: '#222', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  thumb: { width: 104, height: 184, borderRadius: 12 }
})
