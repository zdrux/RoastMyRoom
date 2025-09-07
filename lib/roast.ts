import { supabase } from './supabase'
import { OPENAI_API_KEY } from './config'
import { RoastResult } from './store'
import { LLM_MODEL, SYSTEM_PROMPT } from './llm'
import * as FileSystem from 'expo-file-system'
// import * as FileSystem from 'expo-file-system'

async function tryUploadToSupabase(localUri: string): Promise<string | null> {
  try {
    if (!supabase) return null
    const res = await fetch(localUri)
    const blob = await res.blob()
    const fileName = `room_${Date.now()}.jpg`
    const { error } = await supabase.storage
      .from('rooms')
      .upload(fileName, blob as any, { upsert: false, contentType: (blob as any).type || 'image/jpeg' })
    if (error) return null
    const { data: pub } = supabase.storage.from('rooms').getPublicUrl(fileName)
    return pub.publicUrl
  } catch {
    return null
  }
}

export async function generateRoast(localImageUri: string): Promise<{ result: RoastResult, chat: any[] }> {
  // Prepare image as either remote URL (Supabase) or data URL (base64)
  let imageUrl: string | null = await tryUploadToSupabase(localImageUri)
  let dataUrl: string | null = null
  if (!imageUrl) {
    const base64 = await FileSystem.readAsStringAsync(localImageUri, { encoding: FileSystem.EncodingType.Base64 })
    dataUrl = `data:image/jpeg;base64,${base64}`
  }

  // Try Supabase Edge Function first if configured and we have a remote URL
  if (supabase && imageUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('roast', {
        body: { imageUrl, model: LLM_MODEL, prompt: SYSTEM_PROMPT }
      })
      if (!error && data) {
        const r = data as any
        const result: RoastResult = {
          isRoom: !!r.is_room,
          roast: r.roast || '',
          caption: r.caption || '',
          fix: r.fix || '',
          beforeAfter: r.before_after || '',
          username: r.username || null,
          messScore: typeof r.mess_score === 'number' ? r.mess_score : Math.round(Math.random() * 100)
        }
        const chat = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: [{ type: 'text', text: 'Roast this room photo.' }, { type: 'image_url', image_url: { url: imageUrl } }] },
          { role: 'assistant', content: JSON.stringify({
            is_room: result.isRoom,
            roast: result.roast,
            caption: result.caption,
            fix: result.fix,
            before_after: result.beforeAfter,
            mess_score: result.messScore
          }) }
        ]
        return { result, chat }
      }
    } catch {}
  }

  // Fallback: call OpenAI directly
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY for fallback')
  const prompt = SYSTEM_PROMPT
  const userContent = [
    { type: 'text', text: 'Roast this room photo.' },
    { type: 'image_url', image_url: { url: imageUrl || dataUrl } }
  ]
  const baseMessages: any[] = [ { role: 'system', content: prompt }, { role: 'user', content: userContent } ]
  const payload: any = { model: LLM_MODEL, response_format: { type: 'json_object' }, messages: baseMessages }
  async function call(model: string) {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ ...payload, model })
    })
  }
  let resp = await call(LLM_MODEL)
  if (!resp.ok) resp = await call('gpt-4o')
  const json = await resp.json()
  const content = json.choices?.[0]?.message?.content || '{}'
  let parsed: any = {}
  try { parsed = JSON.parse(content) } catch {}
  const result: RoastResult = {
    isRoom: !!parsed.is_room,
    roast: parsed.roast || '',
    caption: parsed.caption || '',
    fix: parsed.fix || '',
    beforeAfter: parsed.before_after || '',
    username: null,
    messScore: typeof parsed.mess_score === 'number' ? parsed.mess_score : Math.round(Math.random() * 100)
  }
  const chat = [...baseMessages, { role: 'assistant', content }]
  return { result, chat }
}
