import type { MediaObject, Store, StoredMessage } from './store'

export type CloudflareEnv = {
  DB: D1Database
  FILES: R2Bucket
}

let schemaReady = false

async function ensureSchema(db: D1Database) {
  if (schemaReady) return
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS site (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, project_type TEXT, location TEXT, timeline TEXT, budget TEXT, message TEXT NOT NULL)',
    ),
  ])
  schemaReady = true
}

export function cloudflareStore(env: CloudflareEnv): Store {
  return {
    driver: 'r2',

    async getSite() {
      await ensureSchema(env.DB)
      const row = await env.DB.prepare('SELECT data FROM site WHERE id = 1').first<{ data: string }>()
      return row?.data ?? null
    },

    async putSite(data) {
      await ensureSchema(env.DB)
      await env.DB.prepare('INSERT OR REPLACE INTO site (id, data, updated_at) VALUES (1, ?, ?)')
        .bind(data, new Date().toISOString())
        .run()
    },

    async addMessage(message: StoredMessage) {
      await ensureSchema(env.DB)
      await env.DB.prepare(
        'INSERT INTO messages (id, created_at, name, email, phone, project_type, location, timeline, budget, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(
          message.id,
          message.createdAt,
          message.name,
          message.email,
          message.phone,
          message.projectType,
          message.location,
          message.timeline,
          message.budget,
          message.message,
        )
        .run()
    },

    async listMessages() {
      await ensureSchema(env.DB)
      const { results } = await env.DB.prepare(
        'SELECT id, created_at as createdAt, name, email, phone, project_type as projectType, location, timeline, budget, message FROM messages ORDER BY created_at DESC LIMIT 200',
      ).all<StoredMessage>()
      return results ?? []
    },

    async deleteMessage(id) {
      await ensureSchema(env.DB)
      await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run()
    },

    async putMedia(key, bytes, contentType) {
      await env.FILES.put(key, bytes, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
      })
    },

    async getMedia(key): Promise<MediaObject | null> {
      const object = await env.FILES.get(key)
      if (!object) return null
      return {
        stream: object.body as ReadableStream<Uint8Array>,
        contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
        etag: object.httpEtag,
      }
    },
  }
}
