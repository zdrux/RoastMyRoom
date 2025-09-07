import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRoastStore } from '../lib/store'
import { colors } from '../lib/theme'
import { PrimaryButton, OutlineButton } from '../components/Buttons'
import ProfileButton from '../components/ProfileButton'

export default function Capture() {
  const [uri, setUri] = useState<string | null>(null)
  const setImageUri = useRoastStore((s) => s.setImageUri)

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return
    const res = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.9 })
    if (!res.canceled) setUri(res.assets[0].uri)
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType ? ImagePicker.MediaType.Images : (ImagePicker as any).MediaTypeOptions?.Images, quality: 0.9 })
    if (!res.canceled) setUri(res.assets[0].uri)
  }

  function continueNext() {
    if (!uri) return
    setImageUri(uri)
    router.push('/generating')
  }

  return (
    <LinearGradient colors={["#FAFAFF", "#FFF7F7"]} style={styles.container}>
      <ProfileButton />
      <View style={styles.header}>
        <Text style={styles.title}>Ready to Get Roasted?</Text>
        <Text style={styles.sub}>Upload a photo of your room and let AI judge your life choices.</Text>
      </View>
      {uri ? (
        <Image source={{ uri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera" color={colors.muted} size={42} />
          <Text style={styles.placeholderText}>Show us your space, we’ll show you no mercy</Text>
        </View>
      )}
      <View style={styles.actions}>
        <PrimaryButton title="Take Photo" icon="camera" onPress={pickFromCamera} />
        <View style={{ height: 12 }} />
        <OutlineButton title="Upload from Gallery" icon="cloud-upload" onPress={pickFromGallery} />
      </View>
      <Text style={styles.tip}><Text style={{ fontWeight: '900' }}>Tip:</Text> Better lighting = better roasts</Text>
      <TouchableOpacity disabled={!uri} style={[styles.continue, !uri && { opacity: 0.5 }]} onPress={continueNext}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '900', color: '#191C2A', fontFamily: 'Poppins_900Black' },
  sub: { color: '#5A6075', marginTop: 6, fontFamily: 'Poppins_400Regular' },
  preview: { flex: 1, borderRadius: 18 },
  placeholder: { flex: 1, borderRadius: 18, borderWidth: 2, borderColor: '#F1F2F9', backgroundColor: '#FFFFFFD0', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  placeholderText: { color: '#6A6F84', textAlign: 'center', marginTop: 10, fontFamily: 'Poppins_400Regular' },
  actions: { paddingVertical: 16 },
  tip: { color: '#8A8FA3', marginTop: 8, textAlign: 'center', fontFamily: 'Poppins_400Regular' },
  continue: { backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  continueText: { color: 'white', fontWeight: '900', fontFamily: 'Poppins_700Bold' }
})
