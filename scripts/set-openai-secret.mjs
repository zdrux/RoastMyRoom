#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const cwd = dirname(fileURLToPath(import.meta.url))
const root = join(cwd, '..')

function parseEnvFile(p) {
  try {
    const txt = readFileSync(p, 'utf8')
    const out = {}
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) out[m[1]] = m[2]
    }
    return out
  } catch (e) {
    return {}
  }
}

const keys = parseEnvFile(join(root, 'docs', 'apikeys.txt'))
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || keys.OPENAI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL || keys.SUPABASE_URL
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not found. Add it to docs/apikeys.txt or env.')
  process.exit(1)
}
if (!SUPABASE_URL) {
  console.error('SUPABASE_URL not found. Add it to docs/apikeys.txt or env.')
  process.exit(1)
}
if (!SUPABASE_ACCESS_TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN environment variable is required to set secrets.')
  console.error('Create one at https://supabase.com/dashboard/account/tokens and run:')
  console.error('  export SUPABASE_ACCESS_TOKEN=<your_token>    # bash')
  console.error('  setx SUPABASE_ACCESS_TOKEN <your_token>      # Windows PowerShell')
  process.exit(1)
}

const refMatch = SUPABASE_URL.match(/https?:\/\/([a-z0-9]{20,})\.supabase\.co/i)
const projectRef = process.env.SUPABASE_PROJECT_REF || (refMatch ? refMatch[1] : null)
if (!projectRef) {
  console.error('Could not derive project ref from SUPABASE_URL. Set SUPABASE_PROJECT_REF.')
  process.exit(1)
}

console.log(`Setting OPENAI_API_KEY for project ${projectRef}...`)
const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
  'supabase', 'secrets', 'set', `OPENAI_API_KEY=${OPENAI_API_KEY}`, '--project-ref', projectRef
], { stdio: 'inherit', cwd: root, env: process.env })

child.on('exit', (code) => {
  if (code === 0) {
    console.log('OPENAI_API_KEY set for Supabase Edge Functions successfully.')
    console.log('If the roast function is already deployed, no redeploy is needed; secrets are available at runtime.')
  } else {
    console.error('Failed to set secret. Ensure supabase CLI is installed: npm i -g supabase')
  }
})

