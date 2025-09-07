import { OPENAI_API_KEY } from './config'
import { getExtras, SYSTEM_PROMPT, LLM_MODEL } from './llm'

export type ExtraKey = ReturnType<typeof getExtras>[number]['key']

export async function generateExtra(chat: any[], key: ExtraKey): Promise<{ text: string, chat: any[] }> {
  const extras = getExtras()
  const def = extras.find((e) => e.key === key)
  if (!def) throw new Error('Unknown extra')

  const promptText = `${def.prompt}\n\nRespond with plain text only. Do not return JSON or code fences.`
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

