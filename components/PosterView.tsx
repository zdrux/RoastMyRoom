import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import RichText from './RichText'

type Props = {
  imageUri: string
  roast: string
  caption: string
  username: string | null
  score?: number
}

export default function PosterView({ imageUri, roast, caption, username, score = 72 }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <View style={styles.root}>
      {/* Background gradients for a flame vibe */}
      <LinearGradient colors={["#1a0b0f", "#120b24"]} style={styles.bgGrad} />
      <LinearGradient
        colors={["rgba(255,90,95,0.35)", "rgba(124,58,237,0.15)", "transparent"]}
        style={styles.flameGlow}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      />

      {/* Image in a gradient frame (scaled down) */}
      <LinearGradient colors={["#FF7A7E", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.frame}> 
        <View style={styles.frameInner}>
          <ImageBackground source={{ uri: imageUri }} style={styles.bg} imageStyle={styles.bgImg}>
            {/* subtle top gradient */}
            <LinearGradient colors={["rgba(0,0,0,0.35)", "transparent"]} style={styles.topGrad} />

            {/* watermark (bigger, more prominent) */}
            <View style={styles.watermarkWrap}>
              <Image source={require('../docs/app_logo.png')} style={styles.logo} />
              <Text style={styles.brand}>{username ? `@${username} • RoastMyRoom` : 'RoastMyRoom'}</Text>
            </View>
          </ImageBackground>
        </View>
      </LinearGradient>

      {/* Large dump‑o‑meter between image and card */}
      <View style={styles.meterWrap}>
        <Text style={styles.meterTitle}>Dump‑o‑meter</Text>
        <View style={styles.trackLarge}>
          <View style={[styles.fillLarge, { width: `${clamped}%` }]} />
        </View>
        <Text style={styles.meterScore}>{clamped} / 100</Text>
      </View>

      {/* Roast card below the image */}
      <LinearGradient colors={["#14162A", "#0E0F22"]} style={styles.card}>
        <Text style={styles.cardTitle}>The Roast</Text>
        <RichText text={roast} style={styles.roast} />
        <View style={{ gap: 4, marginTop: 8 }}>
          <Text style={styles.captionLabel}>Caption</Text>
          <RichText text={caption} style={styles.caption} />
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, justifyContent: 'flex-start', gap: 10 },
  bgGrad: { ...StyleSheet.absoluteFillObject } as any,
  flameGlow: { position: 'absolute', left: -40, right: -40, bottom: -20, height: '55%', borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  frame: { borderRadius: 24, padding: 4, height: '46%' },
  frameInner: { borderRadius: 20, overflow: 'hidden', flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, justifyContent: 'flex-end' },
  bgImg: { resizeMode: 'cover' },
  topGrad: { position: 'absolute', left: 0, right: 0, top: 0, height: 120 },
  watermarkWrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, margin: 10 },
  logo: { width: 28, height: 28, marginRight: 8 },
  brand: { color: 'white', fontWeight: '900', fontSize: 18, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 3 },

  meterWrap: { paddingHorizontal: 6 },
  meterTitle: { color: '#E7E9F7', fontWeight: '700', marginBottom: 6 },
  trackLarge: { height: 18, backgroundColor: '#1E2136', borderRadius: 999, overflow: 'hidden' },
  fillLarge: { height: '100%', backgroundColor: '#FF5A5F' },
  meterScore: { color: '#C3C7DA', fontSize: 12, marginTop: 6, textAlign: 'right' },

  card: { borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#7C3AED55', height: '42%' },
  cardTitle: { color: '#FFD166', fontWeight: '900', marginBottom: 8, fontSize: 16 },
  roast: { color: 'white', fontSize: 20, fontWeight: '800', lineHeight: 28, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 3 },
  captionLabel: { color: '#FFD166', fontWeight: '900' },
  caption: { color: '#E4E7F5', fontSize: 16, fontStyle: 'italic' }
})
