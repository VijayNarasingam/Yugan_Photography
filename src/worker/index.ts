import { createApp } from '../server/app'
import { cloudflareStore } from '../server/cloudflare'

/**
 * Cloudflare Workers entry point.
 *
 * A fresh app (and D1/R2 adapter) is built per request so the bindings are
 * always the ones Cloudflare hands to this invocation.
 */
type Env = {
  ASSETS: Fetcher
  DB: D1Database
  FILES: R2Bucket
  ADMIN_PASSCODE?: string
  SESSION_SECRET?: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const app = createApp({
      store: cloudflareStore(env),
      adminPasscode: env.ADMIN_PASSCODE,
      sessionSecret: env.SESSION_SECRET,
      serveAsset: (req) => env.ASSETS.fetch(req),
    })
    return app.fetch(request, env, ctx)
  },
}
