import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../lib/theme'
import RichText from './RichText'
import * as Clipboard from 'expo-clipboard'

type Props = {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  text: string
  disabled?: boolean
}

export default function StaticPanel({ title, icon, text, disabled }: Props) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const isDisabled = !!disabled || !text?.trim()
  const [copied, setCopied] = useState(false)
  return (
    <View style={[styles.wrap, isDisabled && { opacity: 0.5 }]}>
      <Pressable style={styles.header} onPress={() => !isDisabled && setExpanded((e) => !e)} disabled={isDisabled}>
        <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
      </Pressable>
      {expanded ? (
        <Pressable
          style={styles.body}
          onPress={() => setExpanded(false)}
          onLongPress={async () => {
            try { await Clipboard.setStringAsync(text || ''); setCopied(true); setTimeout(() => setCopied(false), 900) } catch {}
          }}
          delayLongPress={350}
        >
          <RichText text={text} style={{ color: '#fff', fontSize: 16, lineHeight: 22 }} />
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
  title: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  body: { backgroundColor: '#0F1024', padding: 12 },
  copiedBubble: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#FFFFFFAA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  copiedText: { color: '#111', fontWeight: '700', fontSize: 12 }
})
