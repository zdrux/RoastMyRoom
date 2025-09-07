import React from 'react'
import { Text, View } from 'react-native'

export default function RichText({ text, style }: { text: string; style?: any }) {
  const lines = (text || '').split(/\r?\n/)
  const items: React.ReactNode[] = []
  let bulletMode = false
  let buffer: string[] = []

  const flushPara = () => {
    if (buffer.length) {
      items.push(<Text key={`p-${items.length}`} style={style}>{buffer.join(' ')}</Text>)
      buffer = []
    }
  }

  for (const l of lines) {
    const line = l.trim()
    const bullet = /^([\-*•]|\d+\.)\s+/.test(line)
    if (bullet) {
      flushPara()
      const content = line.replace(/^([\-*•]|\d+\.)\s+/, '')
      items.push(
        <View key={`li-${items.length}`} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[style, { marginRight: 6 }]}>{'•'}</Text>
          <Text style={[style, { flex: 1 }]}>{content}</Text>
        </View>
      )
      bulletMode = true
      continue
    }
    if (line === '') {
      flushPara()
      bulletMode = false
      continue
    }
    if (bulletMode) {
      items.push(
        <View key={`li-${items.length}`} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[style, { marginRight: 6 }]}>{'•'}</Text>
          <Text style={[style, { flex: 1 }]}>{line}</Text>
        </View>
      )
    } else {
      buffer.push(line)
    }
  }
  flushPara()

  return <View style={{ gap: 6 }}>{items}</View>
}

