let cfg: any = {}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cfg = require('../docs/llm.config.json')
} catch {}

export const LLM_MODEL = cfg.model || 'gpt-4o'
export const SYSTEM_PROMPT =
  cfg.system_prompt ||
  "You are roasting photos of rooms. Only roast if it's a room; otherwise set is_room=false and respond with a friendly line asking for a room photo. Output JSON with keys: is_room (boolean), roast, caption (short one-liner), fix (actionable tips), before_after (vivid before-after mockup), mess_score (0-100 where 100 is the messiest). Do not limit length; fully express the roast. Keep PG-13 and avoid slurs."

export type ExtraDef = { key: string; title: string; prompt: string }
export function getExtras(): ExtraDef[] {
  const extras = (cfg.extras as ExtraDef[]) || [
    { key: 'room_owner_archetype', title: 'Who owns this room?', prompt: 'In 3-5 sentences, describe the archetype of the person who owns this room. Lean into humor but stay PG-13.' },
    { key: 'tinder_profile', title: "Their Tinder bio", prompt: "Write a short, funny Tinder bio this room's owner might have (2-3 lines)." }
  ]
  return extras
}
