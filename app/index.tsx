import { Link, router } from 'expo-router'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../lib/theme'
import { Ionicons } from '@expo/vector-icons'
import ProfileButton from '../components/ProfileButton'

export default function Home() {
  return (
    <LinearGradient colors={["#0f1024", "#1a0b0f"]} style={styles.container}>
      <ProfileButton />
      <View style={styles.hero}>
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../docs/app_logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.kicker}>Ready to Get Roasted?</Text>
        <Text style={styles.subtitle}>Upload a photo of your room and let AI judge your life choices.</Text>
      </View>
      <TouchableOpacity style={styles.cta} onPress={() => router.push('/capture')}>
        <Ionicons name="flame" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.ctaText}>Start Roasting</Text>
      </TouchableOpacity>
      <Link href="/profile" style={styles.profileLink}>Profile</Link>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 40 },
  kicker: { color: colors.white, fontSize: 28, fontWeight: '900', marginTop: 12, textAlign: 'center', fontFamily: 'Poppins_900Black' },
  subtitle: { color: '#C4C7D1', textAlign: 'center', marginTop: 8, lineHeight: 20, fontFamily: 'Poppins_400Regular' },
  logo: { width: 200, height: 200, resizeMode: 'contain' },
  cta: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', ...{ shadowColor: '#FF5A5F', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 8 } },
  ctaText: { color: colors.white, fontWeight: '900', fontSize: 18, fontFamily: 'Poppins_700Bold' },
  profileLink: { color: '#B9BECC', textAlign: 'center', marginTop: 16, fontFamily: 'Poppins_400Regular' }
})
