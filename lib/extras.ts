import { OPENAI_API_KEY } from './config' 
import { getExtras, SYSTEM_PROMPT, LLM_MODEL, getIkeaPrompt } from './llm'
import * as FileSystem from 'expo-file-system'

export type ExtraKey = ReturnType<typeof getExtras>[number]['key']

export async function generateExtra(chat: any[], key: ExtraKey): Promise<{ text: string, chat: any[] }> {
  const extras = getExtras()
  const def = extras.find((e) => e.key === key)
  if (!def) throw new Error('Unknown extra')

  const promptText = `${def.prompt}\n\nRespond in Markdown text. Do not return JSON or code fences.`
  const messages = [...chat, { role: 'user', content: [{ type: 'text', text: promptText }] }]
  async function call(model: string) {
    const payload: any = { model, messages }
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    })
  }
  let resp = await call(LLM_MODEL)
  if (!resp.ok) resp = await call('gpt-4o')
  const json = await resp.json()
  let text: string = json.choices?.[0]?.message?.content?.toString?.() || ''
  try {
    if (text.trim().startsWith('{')) {
      const obj = JSON.parse(text)
      text = obj.bio || obj.tinder || obj.archetype || obj.roast || obj.caption || text
    }
  } catch {}
  return { text: text.trim(), chat: [...messages, { role: 'assistant', content: text }] }
}

// Premium: generates a makeover image + markdown item list. Costs 3 credits (handled in UI).
export async function generateIkeaMakeover(chat: any[], localImageUri: string): Promise<{ imageDataUrl: string | null, text: string, chat: any[] }> {
  // 1) Ask text LLM for the IKEA list/description (Markdown)
  const promptText = getIkeaPrompt()
  const messages = [...chat, { role: 'user', content: [{ type: 'text', text: promptText }] }]
  async function call(model: string) {
    const payload: any = { model, messages }
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    })
  }
  let resp = await call(LLM_MODEL)
  if (!resp.ok) resp = await call('gpt-4o')
  const j = await resp.json()
  const text: string = j.choices?.[0]?.message?.content?.toString?.() || ''
  const nextChat = [...messages, { role: 'assistant', content: text }]

  // 2) Generate makeover image via image edits using the original local image
  let imageDataUrl: string | null = null
  try {
    const form = new FormData()
    form.append('model', 'gpt-image-1')
    form.append('prompt', 'Render this same room in a pristine, freshly cleaned state with 3-5 tasteful IKEA furnishings added. Keep the perspective similar. High detail, photorealistic, natural lighting.')
    // RN FormData file
    form.append('image', {
      uri: localImageUri,
      name: 'room.jpg',
      type: 'image/jpeg'
    } as any)
    form.append('size', '1024x1024')

    const imgResp = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form as any
    })
    const imgJson = await imgResp.json()
    const b64 = imgJson?.data?.[0]?.b64_json
    if (typeof b64 === 'string') imageDataUrl = `data:image/png;base64,${b64}`
  } catch {}

  return { imageDataUrl, text: text.trim(), chat: nextChat }
}

