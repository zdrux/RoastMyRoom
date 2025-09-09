import React, { useRef, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import LottieView from 'lottie-react-native'
import { colors } from '../lib/theme'
import { useRoastStore } from '../lib/store'
import { PrimaryButton, OutlineButton } from '../components/Buttons'
import ViewShot from 'react-native-view-shot'
import PosterView from '../components/PosterView'
import { POSTER } from '../lib/config'
import ProfileButton from '../components/ProfileButton'
import RichText from '../components/RichText'
import DumpOMeter from '../components/DumpOMeter'
import ExtraPanel from '../components/ExtraPanel'
import StaticPanel from '../components/StaticPanel'
import * as Clipboard from 'expo-clipboard'
import IkeaMakeoverPanel from '../components/IkeaMakeoverPanel'

export default function Result() {
  const { imageUri, roast } = useRoastStore()
  const chat = useRoastStore((s) => s.chat)
  const setChat = useRoastStore((s) => s.setChat)
  const insets = useSafeAreaInsets()
  const shotRef = useRef<ViewShot>(null as any)

  const caption = roast?.caption || ''
  const messScore = roast?.messScore ?? 50
  const [confetti, setConfetti] = useState(false)
  const [copiedRoast, setCopiedRoast] = useState(false)

  const [ownerLoading, setOwnerLoading] = useState(false)
  const [tinderLoading, setTinderLoading] = useState(false)

  async function sharePoster() {
    if (!imageUri) return
    try {
      const uri = await shotRef.current?.capture?.({ format: 'png', quality: 0.95, width: POSTER.width, height: POSTER.height })
      if (uri) {
        await Sharing.shareAsync(uri)
        setConfetti(true); setTimeout(() => setConfetti(false), 1500)
        return
      }
    } catch {}
    await Sharing.shareAsync(imageUri)
    setConfetti(true); setTimeout(() => setConfetti(false), 1500)
  }

  const footerPad = (insets.bottom || 0) + 16
  const footerHeight = 72 + (insets.bottom || 0)
  return (
    <LinearGradient colors={["#0f1024", "#1a0b0f"]} style={styles.container}>
      <ProfileButton />
      {confetti ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <LottieView source={require('../assets/lottie/confetti.json')} autoPlay loop={false} style={{ width: '100%', height: '100%' }} />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: footerHeight + 32 }} style={{ flex: 1 }}>
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Roast</Text>
          <Image source={{ uri: imageUri! }} style={styles.roomImage} />
          <View style={{ position: 'relative' }}>
            <Pressable
              onLongPress={async () => {
                try {
                  await Clipboard.setStringAsync(roast?.roast || '')
                  setCopiedRoast(true); setTimeout(() => setCopiedRoast(false), 900)
                } catch {}
              }}
              delayLongPress={350}
            >
              <RichText text={roast?.roast || 'No roast generated.'} style={styles.roastText} />
            </Pressable>
            {copiedRoast ? (
              <View style={styles.copiedBubble}><Text style={styles.copiedText}>Copied</Text></View>
            ) : null}
          </View>
          <View style={{ gap: 4 }}>
            <Text style={styles.captionLabel}>Caption</Text>
            <RichText text={caption} style={styles.caption} />
          </View>
          <DumpOMeter score={messScore} />
          <View style={{ height: 8 }} />

          <ExtraPanel title="Who Would Own Such a Room?" icon="key" extraKey="room_owner_archetype" disabled={roast?.isRoom === false} />
          <ExtraPanel title="Their Tinder bio" icon="diamond" extraKey="tinder_profile" disabled={roast?.isRoom === false} />
          <StaticPanel title="How do I fix this?" icon="construct" text={roast?.fix || ''} disabled={roast?.isRoom === false || !(roast?.fix)} />
          <IkeaMakeoverPanel disabled={roast?.isRoom === false} />

          {/* Hidden share card for capture */}
          <View style={{ position: 'absolute', left: -9999, width: POSTER.width, height: POSTER.height }}>
            <ViewShot ref={shotRef} style={{ width: POSTER.width, height: POSTER.height, borderRadius: 18, overflow: 'hidden' }}>
              <PosterView
                imageUri={imageUri!}
                roast={roast?.roast || ''}
                caption={caption}
                username={roast?.username || null}
                score={messScore}
              />
            </ViewShot>
          </View>
          <OutlineButton title="Share Roast" icon="share-social" onPress={sharePoster} />
        </View>
      </ScrollView>
      {/* Fixed footer with full-width background */}
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <View style={{ paddingHorizontal: 16 }}>
          <PrimaryButton title="New Roast" icon="camera" onPress={async () => {
            useRoastStore.getState().resetCurrent()
            const { router } = await import('expo-router')
            router.replace('/capture')
          }} />
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#0E0F22', paddingTop: 12 },
  sectionTitle: { color: 'white', fontWeight: '900', fontSize: 18, includeFontPadding: false as any },
  roastText: { color: 'white', fontSize: 16, lineHeight: 24, includeFontPadding: false as any },
  captionLabel: { color: '#FFD166', fontWeight: '900', includeFontPadding: false as any },
  caption: { color: '#D6DAEA', fontStyle: 'italic', includeFontPadding: false as any },
  body: { color: 'white', fontSize: 16, lineHeight: 22 },
  roomImage: { width: '100%', height: 260, borderRadius: 16, resizeMode: 'cover' },
  copiedBubble: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#FFFFFFAA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  copiedText: { color: '#111', fontWeight: '700', fontSize: 12 }
})
