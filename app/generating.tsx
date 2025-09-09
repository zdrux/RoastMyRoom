import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import ProfileButton from '../components/ProfileButton'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useRoastStore } from '../lib/store'
import { generateRoast } from '../lib/roast'
import { saveRoast } from '../lib/persist'

export default function Generating() {
  const imageUri = useRoastStore((s) => s.imageUri)
  const setRoast = useRoastStore((s) => s.setRoast)
  const setChat = useRoastStore((s) => s.setChat)
  const [idx, setIdx] = useState(0)
  const phrases = useMemo(() => {
    const arr = [
      'Sharpening insult skewers...',
      'Marinating the snark...',
      'Skimming grease off the punchlines...',
      'Toasting your ego, lightly...',
      'Adding extra burn for flavor...',
      'Roast level: medium savage...',
      'Turning on the ventilation—this might smoke...',
      'Stoking the coals of judgment...',
      'Prepping safety goggles—spatter expected...',
      'Checking fire extinguisher… just in case...',
      'Measuring scorch marks to code...',
      'Whipping up a reduction of regret...',
      'Spreading artisanal shade on thick...',
      'Asking the smoke alarm to stay chill...',
      'Consulting the pitmaster of pettiness...',
      'Searing punchlines on cast iron...',
      'Basting with sarcasm glaze...'
    ]
    // Fisher–Yates shuffle once per mount
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!imageUri) return
      const out = await generateRoast(imageUri)
      if (mounted) {
        setRoast(out.result)
        setChat(out.chat)
        // Auto-save locally (and remotely if configured)
        try { await saveRoast(imageUri, out.result) } catch {}
        router.replace('/result')
      }
    }
    run()
    return () => { mounted = false }
  }, [imageUri])

  // Rotate phrases every ~4s
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 4000)
    return () => clearInterval(t)
  }, [phrases])

  return (
    <LinearGradient colors={["#1B0B0E", "#0F1024"]} style={styles.container}>
      <ProfileButton />
      <Flame />
      <Text style={styles.text}>Preparing your roast...</Text>
      <Text style={styles.textDim}>{phrases[idx]}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  text: { color: 'white', fontSize: 18, fontWeight: '900', fontFamily: 'Poppins_900Black' },
  textDim: { color: '#C3C7DA', fontFamily: 'Poppins_400Regular' }
})

function Flame() {
  const s1 = useSharedValue(1)
  const s2 = useSharedValue(1)
  const s3 = useSharedValue(1)
  const y1 = useSharedValue(0)
  const y2 = useSharedValue(0)
  const y3 = useSharedValue(0)

  // gentle flickers
  const flicker = (sv: any, delay = 0) => {
    sv.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    )
  }
  const floatUp = (sv: any, delay = 0) => {
    sv.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 700 }),
          withTiming(0, { duration: 700 })
        ),
        -1,
        true
      )
    )
  }

  // kick off
  useEffect(() => {
    flicker(s1, 0); flicker(s2, 150); flicker(s3, 300)
    floatUp(y1, 0); floatUp(y2, 150); floatUp(y3, 300)
  }, [])

  const a1 = useAnimatedStyle(() => ({ transform: [{ scale: s1.value }, { translateY: y1.value }] }))
  const a2 = useAnimatedStyle(() => ({ transform: [{ scale: s2.value }, { translateY: y2.value }] }))
  const a3 = useAnimatedStyle(() => ({ transform: [{ scale: s3.value }, { translateY: y3.value }] }))

  return (
    <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[a1]}>
        <Ionicons name="flame" size={56} color="#FF5A5F" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: 14, left: -24 }, a2]}>
        <Ionicons name="flame" size={28} color="#FF7A7E" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: 14, right: -24 }, a3]}>
        <Ionicons name="flame" size={28} color="#FF7A7E" />
      </Animated.View>
    </View>
  )
}


