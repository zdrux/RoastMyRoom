import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'

type Props = {
  imageUri: string
  roast: string
  caption: string
  username: string | null
}

export default function PosterView({ imageUri, roast, caption, username }: Props) {
  return (
    <ImageBackground source={{ uri: imageUri }} style={styles.bg}>
      <View style={styles.overlay} />
      <View style={styles.contentWrap}>
        <Text style={styles.roast} numberOfLines={6}>{roast}</Text>
        <Text style={styles.caption} numberOfLines={1}>Caption: {caption}</Text>
      </View>
      <View style={styles.watermarkWrap}>
        <Image source={require('../docs/app_logo.png')} style={styles.logo} />
        <Text style={styles.brand}>{username ? `@${username} • RoastMyRoom` : 'RoastMyRoom'}</Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  contentWrap: { padding: 16, backgroundColor: 'rgba(0,0,0,0.25)' },
  roast: { color: 'white', fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6, lineHeight: 24 },
  caption: { color: '#E4E7F5', fontSize: 14, fontStyle: 'italic', marginTop: 8 },
  watermarkWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 12 },
  logo: { width: 20, height: 20, marginRight: 8 },
  brand: { color: 'white', fontWeight: '700' }
})
