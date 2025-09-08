import React, { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/theme'
import { useCreditsStore, useRoastStore } from '../lib/store'
import { generateIkeaMakeover } from '../lib/extras'
import { persistExtrasForCurrent } from '../lib/persist'
import RichText from './RichText'

export default function IkeaMakeoverPanel({ disabled }: { disabled?: boolean }) {
  const spend = useCreditsStore((s) => s.spend)
  const roast = useRoastStore((s) => s.roast)
  const setRoast = useRoastStore((s) => s.setRoast)
  const chat = useRoastStore((s) => s.chat)
  const imageUri = useRoastStore((s) => s.imageUri)

  const existingImg = roast?.extras?.ikea_makeover_image
  const existingText = roast?.extras?.ikea_makeover_md
  const [expanded, setExpanded] = useState<boolean>(!!existingImg || !!existingText)
  const [loading, setLoading] = useState<boolean>(false)

  const isDisabled = !!disabled && !existingImg && !existingText

  const onToggle = async () => {
    if (isDisabled) return
    if (expanded) { setExpanded(false); return }
    if (existingImg || existingText) { setExpanded(true); return }
    if (!spend(3)) { Alert.alert('Not enough credits', 'This costs 3 credits.'); return }
    if (!imageUri) { Alert.alert('Missing image', 'Cannot generate without the original image.'); return }
    setLoading(true)
    try {
      const out = await generateIkeaMakeover(chat, imageUri)
      const newExtras = { ...(roast?.extras || {}), ikea_makeover_image: out.imageDataUrl || '', ikea_makeover_md: out.text }
      setRoast({ ...(roast as any), extras: newExtras })
      await persistExtrasForCurrent(imageUri, newExtras)
      setExpanded(true)
    } catch (e) {
      Alert.alert('Error', 'Failed to generate IKEA makeover. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Header = (
    <Pressable style={[styles.header, loading && { justifyContent: 'center' }, isDisabled && { opacity: 0.5 }]} onPress={onToggle} disabled={loading || isDisabled}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Ionicons name="storefront" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Give me an IKEA Makeover</Text>
          {!(existingImg || existingText) && !isDisabled ? <Text style={styles.credit}>-3 credits</Text> : null}
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </>
      )}
    </Pressable>
  )

  const Body = expanded ? (
    <View style={styles.body}>
      {existingImg ? <Image source={{ uri: existingImg }} style={styles.img} /> : null}
      {existingText ? <RichText text={existingText} style={{ color: '#fff', fontSize: 16, lineHeight: 22 }} /> : null}
    </View>
  ) : null

  return (
    <View style={styles.wrap}>
      {Header}
      {Body}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.white, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  title: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  credit: { color: colors.primary, marginLeft: 8, opacity: 0.7 },
  body: { backgroundColor: '#0F1024', padding: 12, gap: 12 },
  img: { width: '100%', height: 320, borderRadius: 12, resizeMode: 'cover' }
})

