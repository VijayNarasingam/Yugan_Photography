import { createApp } from './app'
import { generateUploadToken, vercelStore } from './vercel'

/**
 * Vercel function entry point. `scripts/build-api.mjs` bundles this file to
 * `api/index.js`; vercel.json rewrites `/api/*` and `/media/*` to it. Vercel's
 * Node runtime accepts a Web `fetch` export, so the Hono app can serve both
 * without a Node request adapter.
 */
const app = createApp({
  store: vercelStore(),
  adminPasscode: process.env.ADMIN_PASSCODE,
  sessionSecret: process.env.SESSION_SECRET,
  generateUploadToken,
})

export const fetch = (request: Request) => app.fetch(request)
