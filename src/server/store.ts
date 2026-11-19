/**
 * Storage contract shared by the Cloudflare Worker (D1 + R2) and the Vercel
 * function (Vercel Blob). The Hono app in `app.ts` only talks to this
 * interface, so the same routes and validation run on either host.
 */

export type StoredMessage = {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string
  projectType: string
  location: string
  timeline: string
  budget: string
  message: string
}

export type MediaObject = {
  stream: ReadableStream<Uint8Array>
  contentType: string
  etag: string
}

export interface Store {
  /** `r2` on Cloudflare, `blob` on Vercel. Surfaced by GET /api/health. */
  readonly driver: 'r2' | 'blob'
  getSite(): Promise<string | null>
  putSite(data: string): Promise<void>
  /** Private key/value data that must never appear in GET /api/site. */
  getSetting(key: string): Promise<string | null>
  putSetting(key: string, value: string): Promise<void>
  deleteSetting(key: string): Promise<void>
  addMessage(message: StoredMessage): Promise<void>
  listMessages(): Promise<StoredMessage[]>
  deleteMessage(id: string): Promise<void>
  /** Server-side upload path. Vercel uploads from the browser instead. */
  putMedia?(key: string, bytes: ArrayBuffer, contentType: string): Promise<void>
  getMedia(key: string): Promise<MediaObject | null>
}
