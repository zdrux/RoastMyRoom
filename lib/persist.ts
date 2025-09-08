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
      mess_score: result.messScore ?? null,
      extras: result.extras ?? null
    })
    .select('id')
    .single()
  if (error) throw error
  return data?.id ?? null
}

const LOCAL_KEY = 'saved_roasts_v1'

async function loadLocal(): Promise<SavedRoast[]> {
  try {
    const txt = await AsyncStorage.getItem(LOCAL_KEY)
    if (!txt) return []
    return JSON.parse(txt)
  } catch {
    return []
  }
}

async function saveLocal(items: SavedRoast[]) {
  try { await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(items)) } catch {}
}

export async function addLocalSavedRoast(imageUri: string, result: RoastResult): Promise<SavedRoast> {
  const item: SavedRoast = { id: `local_${Date.now()}`, imageUri, result, createdAt: Date.now() }
  const all = await loadLocal()
  const next = [item, ...all].slice(0, 100)
  await saveLocal(next)
  return item
}

export async function updateLocalSavedRoastExtrasByImage(imageUri: string, extras: Record<string, string>) {
  const all = await loadLocal()
  let changed = false
  const next = all.map((r) => {
    if (r.imageUri === imageUri) {
      changed = true
      return { ...r, result: { ...r.result, extras: { ...(r.result.extras || {}), ...extras } } }
    }
    return r
  })
  if (changed) await saveLocal(next)
}

export async function updateSupabaseRoastExtrasByImage(imageUrl: string, extras: Record<string, string>) {
  if (!supabase) return
  const userId = await getOrCreateDeviceUserId()
  await supabase.from('roasts').update({ extras }).eq('user_id', userId).eq('image_url', imageUrl)
}

export async function persistExtrasForCurrent(imageUri: string, extras: Record<string, string>) {
  await updateLocalSavedRoastExtrasByImage(imageUri, extras)
  try { await updateSupabaseRoastExtrasByImage(imageUri, extras) } catch {}
}

export async function fetchSavedRoasts(): Promise<SavedRoast[]> {
  const local = await loadLocal()
  if (!supabase) return local
  try {
    const userId = await getOrCreateDeviceUserId()
    const { data, error } = await supabase
      .from('roasts')
      .select('id, image_url, roast_text, caption, mess_score, extras, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const remote: SavedRoast[] = (data || []).map((r) => ({
      id: r.id,
      imageUri: r.image_url,
      result: {
        isRoom: true,
        roast: r.roast_text || '',
        caption: r.caption || '',
        fix: '',
        beforeAfter: '',
        username: null,
        messScore: (r as any).mess_score ?? undefined,
        extras: (r as any).extras || undefined
      },
      createdAt: Date.parse(r.created_at as any) || Date.now()
    }))
    // Merge remote first, then local items that aren't duplicates by image URL
    const seen = new Set(remote.map((r) => r.imageUri))
    const merged = [...remote, ...local.filter((l) => !seen.has(l.imageUri))]
    return merged
  } catch {
    return local
  }
}

// Save both remotely (if configured) and locally so Profile always has data.
export async function saveRoast(localImageUri: string, result: RoastResult): Promise<void> {
  // Local first so UI can update
  await addLocalSavedRoast(localImageUri, result)
  try { await saveRoastToSupabase(localImageUri, result) } catch {}
}

export async function deleteSavedRoast(item: SavedRoast): Promise<void> {
  // Remove from local
  const all = await loadLocal()
  const next = all.filter((r) => r.id !== item.id)
  await saveLocal(next)
  // Try remote if configured
  try {
    if (supabase) {
      if (!item.id.startsWith('local_')) {
        await supabase.from('roasts').delete().eq('id', item.id)
      } else {
        const userId = await getOrCreateDeviceUserId()
        await supabase.from('roasts').delete().eq('user_id', userId).eq('image_url', item.imageUri)
      }
    }
  } catch {}
}
