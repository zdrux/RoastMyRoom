import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadow } from '../lib/theme'
import { useCreditsStore, useRoastStore } from '../lib/store'
import { generateExtra, ExtraKey } from '../lib/extras'
import { persistExtrasForCurrent } from '../lib/persist'
import RichText from './RichText'
import * as Clipboard from 'expo-clipboard'

type Props = {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  extraKey: ExtraKey
  disabled?: boolean
}

export default function ExtraPanel({ title, icon, extraKey, disabled }: Props) {
  const chat = useRoastStore((s) => s.chat)
  const setChat = useRoastStore((s) => s.setChat)
  const roast = useRoastStore((s) => s.roast)
  const setRoast = useRoastStore((s) => s.setRoast)
  const spend = useCreditsStore((s) => s.spend)
  const credits = useCreditsStore((s) => s.credits)

  const existing = roast?.extras?.[extraKey]
  const [expanded, setExpanded] = useState<boolean>(!!existing)
  const [loading, setLoading] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)
  const isDisabled = !!disabled && !existing

  const onToggle = async () => {
    if (isDisabled) return
    if (expanded) { setExpanded(false); return }
    // If we already have it, just expand
    if (roast?.extras?.[extraKey]) { setExpanded(true); return }
    // Spend a credit on first open
    if (!spend(1)) {
      Alert.alert('Not enough credits', 'You need 1 credit to unlock this.')
      return
    }
    setLoading(true)
    try {
      const out = await generateExtra(chat, extraKey)
      setChat(out.chat)
      const newExtras = { ...(roast?.extras || {}), [extraKey]: out.text }
      setRoast({ ...(roast as any), extras: newExtras })
      if (useRoastStore.getState().imageUri) {
        await persistExtrasForCurrent(useRoastStore.getState().imageUri as string, newExtras)
      }
      setExpanded(true)
    } catch (e) {
      Alert.alert('Error', 'Failed to generate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.wrap, isDisabled && { opacity: 0.5 }]}>
      <Pressable style={[styles.header, loading && styles.headerLoading]} onPress={onToggle} disabled={loading || isDisabled}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.title}>{title}</Text>
            {!existing && !isDisabled ? <Text style={styles.credit}>-1 credit</Text> : null}
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
          </>
        )}
      </Pressable>
      {expanded && (roast?.extras?.[extraKey]) ? (
        <Pressable
          style={styles.body}
          onPress={() => setExpanded(false)}
          onLongPress={async () => {
            try {
              await Clipboard.setStringAsync(roast?.extras?.[extraKey] || '')
              setCopied(true); setTimeout(() => setCopied(false), 900)
            } catch {}
          }}
          delayLongPress={350}
        >
          <RichText text={roast?.extras?.[extraKey] || ''} style={{ color: '#fff', fontSize: 16, lineHeight: 22 }} />
          {copied ? (
            <View style={styles.copiedBubble}><Text style={styles.copiedText}>Copied</Text></View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.white, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  headerLoading: { justifyContent: 'center' },
  title: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  credit: { color: colors.primary, marginLeft: 8, opacity: 0.7 },
  body: { backgroundColor: '#0F1024', padding: 12 }
  ,copiedBubble: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#FFFFFFAA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }
  ,copiedText: { color: '#111', fontWeight: '700', fontSize: 12 }
})
