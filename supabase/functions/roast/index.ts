// Supabase Edge Function: roast
// Runtime: Deno

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

type Body = { imageUrl: string; username?: string | null; model?: string; prompt?: string }

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    const body: Body = await req.json()
    const { imageUrl, username } = body
    if (!imageUrl) return new Response('imageUrl required', { status: 400 })

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) return new Response('Missing OPENAI_API_KEY', { status: 500 })

    const system = body.prompt ?? `You roast photos of rooms. Only roast if it's a room; otherwise set is_room=false and provide a friendly message. Output JSON only with keys: is_room (boolean), roast, caption (short one-liner), fix (actionable tips), before_after (vivid before-after mockup), mess_score (0-100). Do not limit length; provide as much detail as needed. Keep PG-13 and avoid slurs.`

    const payload = {
      model: body.model ?? Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this room photo and produce the JSON.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    }

    const ai = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    })
    const json = await ai.json()
    const content = json.choices?.[0]?.message?.content || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(content) } catch {}
    const res = {
      is_room: !!parsed.is_room,
      roast: parsed.roast || '',
      caption: parsed.caption || '',
      fix: parsed.fix || '',
      before_after: parsed.before_after || '',
      username: username || null
    }
    return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
