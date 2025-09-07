import React, { useRef, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import LottieView from 'lottie-react-native'
import { colors } from '../lib/theme'
import { useRoastStore } from '../lib/store'
import { PrimaryButton, OutlineButton } from '../components/Buttons'
import ViewShot from 'react-native-view-shot'
import PosterView from '../components/PosterView'
import ProfileButton from '../components/ProfileButton'
import RichText from '../components/RichText'
import DumpOMeter from '../components/DumpOMeter'
import { generateExtra } from '../lib/extras'

export default function Result() {
  const { imageUri, roast } = useRoastStore()
  const chat = useRoastStore((s) => s.chat)
  const setChat = useRoastStore((s) => s.setChat)
  const insets = useSafeAreaInsets()
  const shotRef = useRef<ViewShot>(null as any)

  const caption = roast?.caption || ''
  const messScore = roast?.messScore ?? 50
  const [confetti, setConfetti] = useState(false)

  const [ownerLoading, setOwnerLoading] = useState(false)
  const [tinderLoading, setTinderLoading] = useState(false)

  async function sharePoster() {
    if (!imageUri) return
    try {
      const uri = await shotRef.current?.capture?.({ format: 'png', quality: 0.92 })
      if (uri) {
        await Sharing.shareAsync(uri)
        setConfetti(true); setTimeout(() => setConfetti(false), 1500)
        return
      }
    } catch {}
    await Sharing.shareAsync(imageUri)
    setConfetti(true); setTimeout(() => setConfetti(false), 1500)
  }

  return (
    <LinearGradient colors={["#0f1024", "#1a0b0f"]} style={styles.container}>
      <ProfileButton />
      {confetti ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <LottieView source={require('../assets/lottie/confetti.json')} autoPlay loop={false} style={{ width: '100%', height: '100%' }} />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: (insets.bottom || 0) + 160 }} style={{ flex: 1 }}>
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Roast</Text>
          <Image source={{ uri: imageUri! }} style={styles.roomImage} />
          <RichText text={roast?.roast || 'No roast generated.'} style={styles.roastText} />
          <Text style={styles.caption}>Caption: {caption}</Text>
          <DumpOMeter score={messScore} />
          <View style={{ height: 8 }} />

          <OutlineButton
            title="Who owns this room? (1 credit)"
            icon="diamond"
            loading={ownerLoading}
            disabled={!!roast?.extras?.room_owner_archetype}
            onPress={async () => {
              if (ownerLoading || roast?.extras?.room_owner_archetype) return
              setOwnerLoading(true)
              const out = await generateExtra(chat, 'room_owner_archetype')
              setChat(out.chat)
              useRoastStore.setState((s) => ({ roast: { ...(s.roast as any), extras: { ...(s.roast?.extras || {}), room_owner_archetype: out.text } } }))
              setOwnerLoading(false)
            }}
          />
          {roast?.extras?.room_owner_archetype ? (
            <RichText text={roast.extras.room_owner_archetype} style={styles.body} />
          ) : null}

          <OutlineButton
            title="Their Tinder bio (1 credit)"
            icon="diamond"
            loading={tinderLoading}
            disabled={!!roast?.extras?.tinder_profile}
            onPress={async () => {
              if (tinderLoading || roast?.extras?.tinder_profile) return
              setTinderLoading(true)
              const out = await generateExtra(chat, 'tinder_profile')
              setChat(out.chat)
              useRoastStore.setState((s) => ({ roast: { ...(s.roast as any), extras: { ...(s.roast?.extras || {}), tinder_profile: out.text } } }))
              setTinderLoading(false)
            }}
          />
          {roast?.extras?.tinder_profile ? (
            <RichText text={roast.extras.tinder_profile} style={styles.body} />
          ) : null}

          {/* Hidden share card for capture */}
          <View style={{ position: 'absolute', left: -9999, width: 360, height: 640 }}>
            <ViewShot ref={shotRef} style={{ width: 360, height: 640, borderRadius: 18, overflow: 'hidden' }}>
              <PosterView imageUri={imageUri!} roast={roast?.roast || ''} caption={caption} username={roast?.username || null} />
            </ViewShot>
          </View>
          <PrimaryButton title="Share Roast" icon="share-social" onPress={sharePoster} />
          <OutlineButton title="New Roast" icon="camera" onPress={async () => {
            useRoastStore.getState().resetCurrent()
            const { router } = await import('expo-router')
            router.replace('/capture')
          }} />
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { color: 'white', fontWeight: '900', fontSize: 18, includeFontPadding: false as any },
  roastText: { color: 'white', fontSize: 16, lineHeight: 24, includeFontPadding: false as any },
  caption: { color: '#D6DAEA', fontStyle: 'italic', includeFontPadding: false as any },
  body: { color: 'white', fontSize: 16, lineHeight: 22 },
  roomImage: { width: '100%', height: 260, borderRadius: 16, resizeMode: 'cover' }
})
