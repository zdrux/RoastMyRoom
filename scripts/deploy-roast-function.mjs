#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = dirname(fileURLToPath(import.meta.url)) + '/..'
function parseEnv(p) {
  try { return Object.fromEntries(readFileSync(p, 'utf8').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).filter(l=>!l.startsWith('#')).map(l=>l.split('='))) } catch { return {} }
}
const keys = parseEnv(join(root, 'docs', 'apikeys.txt'))
const SUPABASE_URL = process.env.SUPABASE_URL || keys.SUPABASE_URL
if (!SUPABASE_URL) { console.error('SUPABASE_URL missing'); process.exit(1) }
const m = SUPABASE_URL.match(/https?:\/\/([a-z0-9]{20,})\.supabase\.co/i)
const projectRef = process.env.SUPABASE_PROJECT_REF || (m && m[1])
if (!projectRef) { console.error('Could not derive project ref'); process.exit(1) }

console.log('Deploying roast function to', projectRef)
const res = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['supabase','functions','deploy','roast','--project-ref', projectRef], { stdio: 'inherit' })
process.exit(res.status || 0)

