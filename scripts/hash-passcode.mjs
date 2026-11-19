// Prints a PBKDF2 hash for ADMIN_PASSCODE_HASH. Requires Node 24's native
// TypeScript support so the app and the CLI use exactly the same hashing code.
import { hashPasscode } from '../src/server/auth.ts'

const passcode = process.argv[2]

if (!passcode) {
  console.error('Usage: npm run hash-passcode -- "your new passcode"')
  process.exit(1)
}

if (passcode.length < 8) {
  console.error('Use at least 8 characters so the passcode is worth hashing.')
  process.exit(1)
}

console.log(await hashPasscode(passcode))
