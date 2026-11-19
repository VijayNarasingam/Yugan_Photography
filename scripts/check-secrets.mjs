// Fails the build if a server secret made it into the files we publish.
// Vercel injects the real environment values during the build, so this runs
// there with ADMIN_PASSCODE, SESSION_SECRET and BLOB_READ_WRITE_TOKEN set.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const roots = ['dist', 'api/index.js'].filter((root) => existsSync(root))
const checkedExtensions = new Set(['.html', '.js', '.mjs', '.css', '.json', '.map', '.txt', '.svg'])

const envSecrets = ['ADMIN_PASSCODE', 'ADMIN_PASSCODE_HASH', 'SESSION_SECRET', 'BLOB_READ_WRITE_TOKEN']
  .map((name) => [name, process.env[name] ?? ''])
  .filter(([, value]) => value.length >= 8)

const patterns = [
  [/vercel_blob_rw_[A-Za-z0-9_-]{8,}/, 'Vercel Blob read-write token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\r\n]+[A-Za-z0-9+/=]{32,}/, 'private key'],
  [/sk_live_[A-Za-z0-9]{8,}/, 'live secret key'],
]

const walk = (path) => {
  const stats = statSync(path)
  if (stats.isFile()) return [path]
  return readdirSync(path).flatMap((entry) => walk(join(path, entry)))
}

const files = roots.flatMap(walk)
const findings = []

for (const file of files) {
  if (!checkedExtensions.has(extname(file))) continue
  const text = readFileSync(file, 'utf8')

  for (const [name, value] of envSecrets) {
    if (text.includes(value)) findings.push(`${file}: contains the value of ${name}`)
  }
  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) findings.push(`${file}: looks like a ${label}`)
  }
}

if (findings.length) {
  console.error('Secret scan failed — do not publish this build:')
  for (const finding of findings) console.error(`  - ${finding}`)
  process.exit(1)
}

console.log(`Secret scan: ${files.length} published files checked, no secrets found.`)
