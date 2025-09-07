import React from 'react'
import { Text, StyleSheet, GestureResponderEvent, Pressable, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, shadow } from '../lib/theme'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

type BtnProps = {
  title: string
  onPress?: (e: GestureResponderEvent) => void
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  style?: any
  loading?: boolean
}

export function PrimaryButton({ title, onPress, disabled, icon, style, loading }: BtnProps) {
  const scale = useSharedValue(1)
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View style={[styles.primaryWrap, anim, (disabled || loading) && { opacity: 0.6 }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.97, { stiffness: 500, damping: 25 }))}
        onPressOut={() => (scale.value = withSpring(1, { stiffness: 500, damping: 25 }))}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primary, shadow.heavy]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} style={{ paddingVertical: 2 }} />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={20} color={colors.white} style={{ marginRight: 8 }} /> : null}
              <Text style={styles.primaryText}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  )
}

export function OutlineButton({ title, onPress, disabled, icon, style, loading }: BtnProps) {
  const scale = useSharedValue(1)
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View style={[styles.outline, shadow.soft, anim, style, (disabled || loading) && { opacity: 0.6 }]}>
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 }}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, { stiffness: 500, damping: 25 }))}
        onPressOut={() => (scale.value = withSpring(1, { stiffness: 500, damping: 25 }))}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 8 }} /> : null}
            <Text style={styles.outlineText}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  primaryWrap: { borderRadius: 16, alignSelf: 'stretch', width: '100%' },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16
  },
  primaryText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    includeFontPadding: false as any,
    textAlignVertical: 'center' as any
  },
  outline: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignSelf: 'stretch',
    width: '100%'
  },
  outlineText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    includeFontPadding: false as any,
    textAlignVertical: 'center' as any
  }
})

export default { PrimaryButton, OutlineButton }
