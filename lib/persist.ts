import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'
import { RoastResult, SavedRoast } from './store'

function uuidv4() {
  // RFC4122-ish, sufficient for device id
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function getOrCreateDeviceUserId(): Promise<string> {
  const key = 'device_user_id'
  let id = await AsyncStorage.getItem(key)
  if (!id) {
    id = uuidv4()
    await AsyncStorage.setItem(key, id)
    if (supabase) {
      await supabase.from('users').upsert({ id, is_anon: true }).throwOnError()
    }
  }
  return id
}

export async function uploadRoomsImage(localUri: string, userId?: string): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')
  const uid = userId || (await getOrCreateDeviceUserId())
  const res = await fetch(localUri)
  const blob = await res.blob()
  const fileName = `users/${uid}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from('rooms').upload(fileName, blob as any, {
    upsert: false,
    contentType: (blob as any).type || 'image/jpeg'
  })
  if (error) throw error
  const { data: pub } = supabase.storage.from('rooms').getPublicUrl(fileName)
  return pub.publicUrl
}

export async function saveRoastToSupabase(localImageUri: string, result: RoastResult): Promise<string | null> {
  if (!supabase) return null
  const userId = await getOrCreateDeviceUserId()
  const imageUrl = await uploadRoomsImage(localImageUri, userId)
  const { data, error } = await supabase
    .from('roasts')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      roast_text: result.roast,
      caption: result.caption,
      is_premium_fix: true,
      is_premium_before_after: true
    })
    .select('id')
    .single()
  if (error) throw error
  return data?.id ?? null
}

export async function fetchSavedRoasts(): Promise<SavedRoast[]> {
  if (!supabase) return []
  const userId = await getOrCreateDeviceUserId()
  const { data, error } = await supabase
    .from('roasts')
    .select('id, image_url, roast_text, caption, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((r) => ({
    id: r.id,
    imageUri: r.image_url,
    result: {
      isRoom: true,
      roast: r.roast_text || '',
      caption: r.caption || '',
      fix: '',
      beforeAfter: '',
      username: null
    },
    createdAt: Date.parse(r.created_at as any) || Date.now()
  }))
}

