import React from 'react'
import { Text, View } from 'react-native'

type Props = { text: string; style?: any }

// Lightweight Markdown renderer supporting headings, lists, bold/italic, code and blockquotes.
export default function RichText({ text, style }: Props) {
  const lines = (text || '').split(/\r?\n/)
  const items: React.ReactNode[] = []
  let inList = false
  let paraBuf: string[] = []

  const parseInline = (s: string) => {
    // Render inline markdown in a simple multi-pass pipeline.
    type Node = string | React.ReactNode
    let nodes: Node[] = [s]

    const apply = (arr: Node[], regex: RegExp, render: (m: RegExpExecArray, key: string) => React.ReactNode): Node[] => {
      const out: Node[] = []
      for (const n of arr) {
        if (typeof n !== 'string') { out.push(n); continue }
        let last = 0
        let m: RegExpExecArray | null
        regex.lastIndex = 0
        while ((m = regex.exec(n))) {
          if (m.index > last) out.push(n.slice(last, m.index))
          out.push(render(m, `md-${out.length}`))
          last = m.index + m[0].length
        }
        if (last < n.length) out.push(n.slice(last))
      }
      return out
    }

    // Links: [label](url) -> render label only, underlined
    nodes = apply(nodes, /\[([^\]]+?)\]\(([^\)]+?)\)/g, (m, key) => (
      <Text key={key} style={[style, { textDecorationLine: 'underline' }]}>{m[1]}</Text>
    ))
    // Inline code: `code`
    nodes = apply(nodes, /`([^`]+?)`/g, (m, key) => (
      <Text key={key} style={[style, { fontFamily: 'System', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 4, borderRadius: 4 }]}>{m[1]}</Text>
    ))
    // Bold: **text** or __text__
    nodes = apply(nodes, /\*\*([^*]+?)\*\*|__([^_]+?)__/g, (m, key) => (
      <Text key={key} style={[style, { fontWeight: '900' }]}>{m[1] || m[2]}</Text>
    ))
    // Italic: *text* or _text_
    nodes = apply(nodes, /(?<!\*)\*([^*]+?)\*(?!\*)|_([^_]+?)_/g, (m, key) => (
      <Text key={key} style={[style, { fontStyle: 'italic' }]}>{m[1] || m[2]}</Text>
    ))
    return nodes
  }

  const flushPara = () => {
    if (paraBuf.length) {
      const p = paraBuf.join(' ')
      items.push(<Text key={`p-${items.length}`} style={style}>{parseInline(p)}</Text>)
      paraBuf = []
    }
  }

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ').trim()
    // Headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      flushPara(); inList = false
      const level = h[1].length
      const sizeScale = [0, 1.35, 1.25, 1.15, 1.1, 1.05, 1]
      const scale = sizeScale[level] || 1
      items.push(
        <Text key={`h-${items.length}`} style={[style, { fontWeight: '900', fontSize: (style?.fontSize || 16) * scale, marginBottom: 4 }]}>
          {parseInline(h[2])}
        </Text>
      )
      continue
    }
    // Blockquote
    if (/^>\s+/.test(line)) {
      flushPara(); inList = false
      const content = line.replace(/^>\s+/, '')
      items.push(
        <View key={`q-${items.length}`} style={{ borderLeftWidth: 3, borderLeftColor: '#7C3AED66', paddingLeft: 8 }}>
          <Text style={[style, { fontStyle: 'italic', color: '#E4E7F5' }]}>{parseInline(content)}</Text>
        </View>
      )
      continue
    }
    // List item
    const li = /^([\-*+]|\d+\.)\s+/.test(line)
    if (li) {
      flushPara()
      const content = line.replace(/^([\-*+]|\d+\.)\s+/, '')
      items.push(
        <View key={`li-${items.length}`} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[style, { marginRight: 6 }]}>{'•'}</Text>
          <Text style={[style, { flex: 1 }]}>{parseInline(content)}</Text>
        </View>
      )
      inList = true
      continue
    }
    if (line === '') { flushPara(); inList = false; continue }
    if (inList) {
      items.push(
        <View key={`li-${items.length}`} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[style, { marginRight: 6 }]}>{'•'}</Text>
          <Text style={[style, { flex: 1 }]}>{parseInline(line)}</Text>
        </View>
      )
    } else {
      paraBuf.push(line)
    }
  }
  flushPara()

  return <View style={{ gap: 6 }}>{items}</View>
}
