import type { Site } from '../content'

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init })
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Something went wrong. Try again.'
    const fields = data?.fields && typeof data.fields === 'object' ? (data.fields as Record<string, string>) : undefined
    throw new ApiError(message, res.status, fields)
  }
  return data as T
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

export type ContactPayload = {
  name: string
  email: string
  phone: string
  projectType: string
  location: string
  timeline: string
  budget: string
  message: string
}

export type Message = ContactPayload & { id: string; createdAt: string }

export const api = {
  site: () => request<{ site: Site; source: 'db' | 'default' }>('/api/site'),
  session: () => request<{ admin: boolean }>('/api/auth'),
  login: (passcode: string) => request<{ admin: boolean }>('/api/auth', json({ passcode })),
  logout: () => request<{ admin: boolean }>('/api/auth/logout', { method: 'POST' }),
  saveSite: (site: Site) => request<{ site: Site }>('/api/admin/site', { ...json(site), method: 'PUT' }),
  resetSite: () => request<{ site: Site }>('/api/admin/site/reset', { method: 'POST' }),
  messages: () => request<{ messages: Message[] }>('/api/admin/messages'),
  deleteMessage: (id: string) => request<{ ok: true }>(`/api/admin/messages/${id}`, { method: 'DELETE' }),
  contact: (payload: ContactPayload) =>
    request<{ reference: string }>('/api/contact', json(payload)),
  async upload(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/media', { method: 'POST', body: form, credentials: 'same-origin' })
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
    if (!res.ok || !data?.url) throw new ApiError(data?.error ?? 'Upload failed.', res.status)
    return data.url
  },
}
