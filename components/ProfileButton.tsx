import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfileButton() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]}>
      <Link href="/profile" asChild>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="person-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 12, zIndex: 100 },
  btn: { padding: 4 }
})

