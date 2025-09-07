import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/theme'

export default function DumpOMeter({ score = 50 }: { score?: number }) {
  const [trackW, setTrackW] = useState(0)
  const progress = useSharedValue(0)
  const shimmer = useSharedValue(0)
  const poopY = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, score)) / 100, { duration: 700 })
    shimmer.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })), -1)
    poopY.value = withRepeat(withSequence(withTiming(-2, { duration: 400 }), withTiming(0, { duration: 400 })), -1, true)
  }, [score])

  const barStyle = useAnimatedStyle(() => ({ width: trackW * progress.value }))
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (trackW * progress.value) * shimmer.value }], opacity: 0.35 }))
  const poopStyle = useAnimatedStyle(() => ({ transform: [{ translateY: poopY.value }] }))

  return (
    <View style={styles.wrap}>
      <View style={styles.iconsRow}>
        <Ionicons name="home" size={18} color="#A8AEC3" />
        <Text style={{ color: '#FFF' }}>Dump‑o‑meter</Text>
        <Animated.Text style={[{ marginLeft: 'auto', fontSize: 16 }, poopStyle]}>💩</Animated.Text>
      </View>
      <View style={styles.track} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, barStyle]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
      </View>
      <Text style={styles.scoreText}>{Math.round(Math.max(0, Math.min(100, score)))} / 100</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  iconsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { height: 10, backgroundColor: '#1E2136', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 24, backgroundColor: '#fff' },
  scoreText: { color: '#C3C7DA', fontSize: 12 }
})

