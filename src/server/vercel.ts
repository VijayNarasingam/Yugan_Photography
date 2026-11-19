import { del, get, list, put } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

import type { MediaObject, Store, StoredMessage } from './store'

/**
 * Vercel Blob implementation of the Store contract.
 *
 * The store is created as private: the site JSON, enquiry briefs and uploaded
 * photographs all require the read-write token. Photographs are streamed back
 * through /media/* so their URLs stay stable and identical to the Cloudflare
 * build.
 */

const SITE_KEY = 'data/site.json'
const SETTINGS_KEY = 'data/settings.json'
const MESSAGES_KEY = 'data/messages.json'
const MEDIA_PREFIX = 'media/'

const token = () => process.env.BLOB_READ_WRITE_TOKEN

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const result = await get(key, { access: 'private', useCache: false })
    if (!result || result.statusCode !== 200) return fallback
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as T
  } catch (error) {
    console.error(`blob read failed: ${key}`, error)
    return fallback
  }
}

async function writeJson(key: string, value: unknown) {
  await put(key, JSON.stringify(value), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  })
}

export function vercelStore(): Store {
  return {
    driver: 'blob',

    async getSite() {
      try {
        const result = await get(SITE_KEY, { access: 'private', useCache: false })
        if (!result || result.statusCode !== 200) return null
        return await new Response(result.stream).text()
      } catch (error) {
        console.error('blob site read failed', error)
        return null
      }
    },

    async putSite(data) {
      await writeJson(SITE_KEY, JSON.parse(data))
    },

    async getSetting(key) {
      const settings = await readJson<Record<string, string>>(SETTINGS_KEY, {})
      return settings[key] ?? null
    },

    async putSetting(key, value) {
      const settings = await readJson<Record<string, string>>(SETTINGS_KEY, {})
      settings[key] = value
      await writeJson(SETTINGS_KEY, settings)
    },

    async deleteSetting(key) {
      const settings = await readJson<Record<string, string>>(SETTINGS_KEY, {})
      delete settings[key]
      await writeJson(SETTINGS_KEY, settings)
    },

    async addMessage(message: StoredMessage) {
      const messages = await readJson<StoredMessage[]>(MESSAGES_KEY, [])
      messages.unshift(message)
      await writeJson(MESSAGES_KEY, messages)
    },

    async listMessages() {
      const messages = await readJson<StoredMessage[]>(MESSAGES_KEY, [])
      return messages.slice(0, 200)
    },

    async deleteMessage(id) {
      const messages = await readJson<StoredMessage[]>(MESSAGES_KEY, [])
      await writeJson(
        MESSAGES_KEY,
        messages.filter((message) => message.id !== id),
      )
    },

    async getMedia(key): Promise<MediaObject | null> {
      const result = await get(`${MEDIA_PREFIX}${key}`, { access: 'private' })
      if (!result || result.statusCode !== 200) return null
      return {
        stream: result.stream,
        contentType: result.blob.contentType ?? 'application/octet-stream',
        etag: result.blob.etag,
      }
    },
  }
}

/** Only used by the diagnostic script; the app uploads from the browser. */
export async function listMedia() {
  return list({ prefix: MEDIA_PREFIX })
}

export async function deleteMedia(key: string) {
  await del(`${MEDIA_PREFIX}${key}`)
}

/**
 * Vercel Blob client-upload window. The browser posts here once, gets a
 * short-lived token, and uploads the file straight to Blob, bypassing the
 * function body-size limit.
 */
export async function generateUploadToken({ request, body }: { request: Request; body: unknown }) {
  return handleUpload({
    token: token(),
    request,
    body: body as HandleUploadBody,
    onBeforeGenerateToken: async (pathname) => {
      if (!pathname.startsWith(MEDIA_PREFIX)) throw new Error('Uploads must live under media/.')
      return {
        allowedContentTypes: ['image/*'],
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: false,
        allowOverwrite: false,
      }
    },
  })
}
