/**
 * Studio passcode hashing.
 *
 * The passcode is never stored in plain text once it is changed from the
 * studio. Hashes use PBKDF2-HMAC-SHA256 with a random salt and a per-hash
 * iteration count, encoded as:
 *
 *   pbkdf2-sha256$<iterations>$<salt base64>$<hash base64>
 *
 * The same functions run in the Cloudflare Worker and the Vercel function
 * (both expose WebCrypto), and `npm run hash-passcode` uses them for the
 * optional ADMIN_PASSCODE_HASH environment variable.
 */

const enc = new TextEncoder()
export const PASSCODE_ITERATIONS = 150_000
const KEY_BYTES = 32
const ALGORITHM = 'pbkdf2-sha256'
const MIN_ITERATIONS = 10_000
const MAX_ITERATIONS = 2_000_000

const toBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=+$/, '')
}

const fromBase64 = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function derive(passcode: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(passcode), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, KEY_BYTES * 8)
  return new Uint8Array(bits)
}

function bytesEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i]! ^ b[i]!
  return diff === 0
}

export function isPasscodeHash(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.startsWith(`${ALGORITHM}$`)
}

export async function hashPasscode(passcode: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(passcode, salt, PASSCODE_ITERATIONS)
  return `${ALGORITHM}$${PASSCODE_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPasscode(passcode: string, stored: string) {
  if (!isPasscodeHash(stored)) return false
  const [, iterationsRaw, saltRaw, hashRaw] = stored.split('$')
  const iterations = Number(iterationsRaw)
  if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return false
  if (!saltRaw || !hashRaw) return false

  try {
    const salt = fromBase64(saltRaw)
    const expected = fromBase64(hashRaw)
    if (salt.length < 8 || expected.length !== KEY_BYTES) return false
    return bytesEqual(await derive(passcode, salt, iterations), expected)
  } catch {
    return false
  }
}
