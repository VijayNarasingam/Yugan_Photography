import { Hono } from 'hono'

import { CATEGORIES, defaultSite, type Project, type Site } from '../content'
import type { Store, StoredMessage } from './store'

/**
 * The portfolio API, shared by the Cloudflare Worker and the Vercel function.
 *
 * `GET /api/site` is public and reads the stored site JSON (seeded from
 * src/content.ts on first request). Everything under /api/admin needs a signed
 * studio session; uploads land in the host's object store and are served from
 * /media/*. Contact briefs are stored through the same Store adapter.
 */

export type AppOptions = {
  store: Store
  adminPasscode?: string
  sessionSecret?: string
  /** Cloudflare only: serve the built SPA for non-API routes. */
  serveAsset?: (request: Request) => Promise<Response> | Response
  /**
   * Vercel only: turn a `handleUpload` window into a client token so the
   * browser can upload straight to Blob without the 4.5 MB function limit.
   */
  generateUploadToken?: (input: { request: Request; body: unknown }) => Promise<unknown>
}

const SESSION_COOKIE = 'yp_studio'
const SESSION_DAYS = 7
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const enc = new TextEncoder()

const str = (v: unknown, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
const asImage = (v: unknown, fallback: string) => {
  const s = str(v, 500)
  return s.startsWith('/') || s.startsWith('http') ? s : fallback
}

/* --------------------------------------------------------------- schema --- */

async function readSite(store: Store): Promise<{ site: Site; source: 'db' | 'default' }> {
  try {
    const row = await store.getSite()
    if (row) return { site: JSON.parse(row) as Site, source: 'db' }
  } catch (error) {
    console.error('site read failed', error)
  }
  try {
    await store.putSite(JSON.stringify(defaultSite))
  } catch (error) {
    console.error('site seed failed', error)
  }
  return { site: defaultSite, source: 'default' }
}

async function writeSite(store: Store, site: Site) {
  await store.putSite(JSON.stringify(site))
}

/* ---------------------------------------------------------------- auth --- */

function secretOf(options: AppOptions) {
  return options.sessionSecret || 'yugan-local-session'
}

async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)))
  return btoa(String.fromCharCode(...sig)).replace(/=+$/, '')
}

function same(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function readCookie(header: string | undefined, name: string) {
  if (!header) return ''
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return ''
}

async function isAdmin(headers: Headers, options: AppOptions) {
  const raw = readCookie(headers.get('cookie') ?? undefined, SESSION_COOKIE) || (headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const parts = raw.split('.')
  if (parts.length !== 3) return false
  const [tag, expires, sig] = parts
  if (tag !== 'studio') return false
  const expected = await hmac(secretOf(options), `${tag}.${expires}`)
  const expiry = Number(expires)
  return same(sig, expected) && Number.isFinite(expiry) && expiry > Date.now()
}

const unauthorized = (c: { json: (body: unknown, status: 401) => Response }) => c.json({ error: 'Sign in to the studio first.' }, 401)

/* --------------------------------------------------------------- input --- */

function slugify(input: string, fallback: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return slug || fallback
}

function sanitizeProject(input: unknown, i: number): Project {
  const p = asRecord(input) ?? {}
  const title = str(p.title, 90) || `Untitled set ${i + 1}`
  const category = CATEGORIES.includes(str(p.category) as (typeof CATEGORIES)[number])
    ? (str(p.category) as Project['category'])
    : 'Weddings'
  const images = Array.isArray(p.images)
    ? p.images.slice(0, 24).map((img, j) => {
        const r = asRecord(img) ?? {}
        return { src: asImage(r.src, ''), caption: str(r.caption, 160) || `Photograph ${j + 1}` }
      }).filter((img) => img.src)
    : []
  return {
    id: str(p.id, 60) || `p-${i}-${Date.now().toString(36)}`,
    title,
    slug: slugify(str(p.slug, 60) || title, `set-${i + 1}`),
    category,
    location: str(p.location, 80) || 'Salem',
    year: str(p.year, 8) || String(new Date().getFullYear()),
    client: str(p.client, 120),
    summary: str(p.summary, 320),
    body: Array.isArray(p.body) ? p.body.slice(0, 12).map((para) => str(para, 2500)).filter(Boolean) : [],
    cover: asImage(p.cover, defaultSite.hero.image),
    images,
    featured: p.featured === true,
  }
}

function sanitizeSite(input: unknown): Site {
  const b = asRecord(input) ?? {}
  const hero = asRecord(b.hero) ?? {}
  const about = asRecord(b.about) ?? {}
  const contact = asRecord(b.contact) ?? {}

  const projects = Array.isArray(b.projects)
    ? b.projects.slice(0, 60).map(sanitizeProject).map((p, i, all) => {
        // Keep slugs unique so /work/:slug always resolves.
        const clash = all.findIndex((x) => x.slug === p.slug) !== i
        return clash ? { ...p, slug: `${p.slug}-${i + 1}` } : p
      })
    : defaultSite.projects

  const facts = Array.isArray(about.facts)
    ? about.facts.slice(0, 20).map((f, i) => {
        const r = asRecord(f) ?? {}
        return { label: str(r.label, 40) || `Fact ${i + 1}`, value: str(r.value, 120) }
      })
    : defaultSite.about.facts

  const approach = Array.isArray(about.approach)
    ? about.approach.slice(0, 12).map((a, i) => {
        const r = asRecord(a) ?? {}
        return { title: str(r.title, 80) || `Step ${i + 1}`, text: str(r.text, 600) }
      })
    : defaultSite.about.approach

  const bio = Array.isArray(about.bio)
    ? about.bio.slice(0, 12).map((para) => str(para, 2500)).filter(Boolean)
    : defaultSite.about.bio

  return {
    brand: str(b.brand, 80) || defaultSite.brand,
    photographer: str(b.photographer, 80) || defaultSite.photographer,
    tagline: str(b.tagline, 160) || defaultSite.tagline,
    hero: {
      image: asImage(hero.image, defaultSite.hero.image),
      alt: str(hero.alt, 200) || defaultSite.hero.alt,
      eyebrow: str(hero.eyebrow, 160) || defaultSite.hero.eyebrow,
      lineOne: str(hero.lineOne, 80) || defaultSite.hero.lineOne,
      lineTwo: str(hero.lineTwo, 80) || defaultSite.hero.lineTwo,
      sub: str(hero.sub, 600) || defaultSite.hero.sub,
      note: str(hero.note, 160) || defaultSite.hero.note,
    },
    about: {
      portrait: asImage(about.portrait, defaultSite.about.portrait),
      standfirst: str(about.standfirst, 500) || defaultSite.about.standfirst,
      bio,
      facts,
      approach,
    },
    contact: {
      email: str(contact.email, 120) || defaultSite.contact.email,
      phone: str(contact.phone, 40) || defaultSite.contact.phone,
      whatsapp: str(contact.whatsapp, 20).replace(/\D/g, '') || defaultSite.contact.whatsapp,
      instagram: str(contact.instagram, 60).replace(/^@/, '') || defaultSite.contact.instagram,
      address: str(contact.address, 200) || defaultSite.contact.address,
      hours: str(contact.hours, 120) || defaultSite.contact.hours,
      note: str(contact.note, 500) || defaultSite.contact.note,
      mapUrl: asImage(contact.mapUrl, defaultSite.contact.mapUrl),
    },
    projects,
  }
}

/* -------------------------------------------------------------- routes --- */

export function createApp(options: AppOptions) {
  const app = new Hono()
  const { store } = options

  app.get('/api/health', (c) => c.json({ ok: true, storage: store.driver }))

  app.get('/api/site', async (c) => {
    const { site, source } = await readSite(store)
    return c.json({ site, source }, 200, { 'cache-control': 'no-store' })
  })

  app.get('/api/auth', async (c) => c.json({ admin: await isAdmin(c.req.raw.headers, options) }))

  app.post('/api/auth', async (c) => {
    const body = asRecord(await c.req.json().catch(() => null)) ?? {}
    const passcode = str(body.passcode, 120)
    const expected = options.adminPasscode || 'yugan2026'
    if (!same(passcode, expected)) {
      await new Promise((r) => setTimeout(r, 350))
      return c.json({ error: 'That passcode is not right.' }, 401)
    }
    const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
    const payload = `studio.${expires}`
    const token = `${payload}.${await hmac(secretOf(options), payload)}`
    const secure = new URL(c.req.url).protocol === 'https:' ? '; Secure' : ''
    return c.json({ admin: true }, 200, {
      'set-cookie': `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${secure}`,
      'cache-control': 'no-store',
    })
  })

  app.post('/api/auth/logout', (c) =>
    c.json({ admin: false }, 200, { 'set-cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` }),
  )

  app.put('/api/admin/site', async (c) => {
    if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
    const body = await c.req.json().catch(() => null)
    if (!asRecord(body)) return c.json({ error: 'Send the site as JSON.' }, 400)
    const site = sanitizeSite(body)
    await writeSite(store, site)
    return c.json({ site }, 200, { 'cache-control': 'no-store' })
  })

  app.post('/api/admin/site/reset', async (c) => {
    if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
    await writeSite(store, defaultSite)
    return c.json({ site: defaultSite }, 200, { 'cache-control': 'no-store' })
  })

  app.post('/api/admin/media', async (c) => {
    if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
    const form = await c.req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return c.json({ error: 'Choose an image to upload.' }, 400)
    if (!file.type.startsWith('image/')) return c.json({ error: 'Only image files can be uploaded.' }, 415)
    if (file.size > 10 * 1024 * 1024) return c.json({ error: 'Keep images under 10 MB.' }, 413)

    const ext = (file.name.split('.').pop() ?? 'webp').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'webp'
    const key = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    await store.putMedia?.(key, await file.arrayBuffer(), file.type)
    return c.json({ url: `/media/${key}` }, 201)
  })

  if (options.generateUploadToken) {
    app.post('/api/admin/media/upload', async (c) => {
      if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
      const body = await c.req.json().catch(() => null)
      const result = await options.generateUploadToken!({ request: c.req.raw, body })
      return c.json(result as Record<string, unknown>)
    })
  }

  // Cloudflare serves /media/* directly; Vercel rewrites /media/* to /api/media/*.
  const serveMedia = async (c: { req: { path: string } }) => {
    const key = decodeURIComponent(c.req.path.replace(/^(\/api)?\/media\//, ''))
    if (!key || key.includes('..')) return Response.json({ error: 'Not found' }, { status: 404 })
    const object = await store.getMedia(key)
    if (!object) return Response.json({ error: 'Not found' }, { status: 404 })
    return new Response(object.stream, {
      headers: {
        'content-type': object.contentType,
        etag: object.etag,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  }

  app.get('/media/*', serveMedia)
  app.get('/api/media/*', serveMedia)

  app.post('/api/contact', async (c) => {
    const body = asRecord(await c.req.json().catch(() => null))
    if (!body) return c.json({ error: 'Send the brief as JSON.' }, 400)

    const fields: Record<string, string> = {}
    const name = str(body.name, 80)
    const email = str(body.email, 160)
    const phone = str(body.phone, 40)
    const projectType = str(body.projectType, 40)
    const location = str(body.location, 100)
    const timeline = str(body.timeline, 60)
    const budget = str(body.budget, 60)
    const message = str(body.message, 4000)

    if (name.length < 2) fields.name = 'Your name, so I know who is writing.'
    if (!EMAIL.test(email)) fields.email = 'A working email address.'
    if (phone && phone.replace(/\D/g, '').length < 8) fields.phone = 'Include the country or STD code.'
    if (![...CATEGORIES, 'Other'].includes(projectType)) fields.projectType = 'Pick the closest wedding function.'
    if (location.length < 2) fields.location = 'The city or site is enough.'
    if (message.length < 10) fields.message = 'A sentence or two about the project, please.'
    if (Object.keys(fields).length) return c.json({ error: 'Check the highlighted fields.', fields }, 422)

    await store.addMessage({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      phone,
      projectType,
      location,
      timeline,
      budget,
      message,
    } satisfies StoredMessage)

    const reference = `YP-${Date.now().toString(36).toUpperCase().slice(-6)}`
    return c.json({ reference }, 201)
  })

  app.get('/api/admin/messages', async (c) => {
    if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
    return c.json({ messages: await store.listMessages() }, 200, { 'cache-control': 'no-store' })
  })

  app.delete('/api/admin/messages/:id', async (c) => {
    if (!(await isAdmin(c.req.raw.headers, options))) return unauthorized(c)
    await store.deleteMessage(c.req.param('id'))
    return c.json({ ok: true })
  })

  app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

  if (options.serveAsset) {
    app.all('*', (c) => options.serveAsset!(c.req.raw))
  }

  app.onError((err, c) => {
    console.error('api error', err)
    return c.json({ error: 'Something broke on the studio side.' }, 500)
  })

  return app
}
