#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const srcRoot = join(process.cwd(), 'docs', 'android', 'res')
const dstRoot = join(process.cwd(), 'android', 'app', 'src', 'main', 'res')

const buckets = [
  'mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi', 'mipmap-anydpi-v26'
]

const files = {
  'ic_launcher.png': true,
  'ic_launcher_foreground.png': true,
  'ic_launcher_background.png': true,
  'ic_launcher_monochrome.png': true,
  'mipmap-anydpi-v26/ic_launcher.xml': true
}

for (const bucket of buckets) {
  const srcDir = join(srcRoot, bucket)
  const dstDir = join(dstRoot, bucket)
  if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true })
  for (const name of Object.keys(files)) {
    if (bucket === 'mipmap-anydpi-v26' && !name.startsWith('mipmap-anydpi-v26')) continue
    if (bucket !== 'mipmap-anydpi-v26' && name.startsWith('mipmap-anydpi-v26')) continue
    const base = name.replace('mipmap-anydpi-v26/', '')
    const src = join(srcDir, base)
    const dst = join(dstDir, base)
    try { copyFileSync(src, dst); console.log('Copied', src, '->', dst) } catch {}
  }
}

console.log('Android launcher icons updated.')

