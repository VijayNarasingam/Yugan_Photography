import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

import { AdminButton, Container, Label, Spinner } from '../components/ui'
import { CATEGORIES, defaultSite, type Project, type Site } from '../content'
import { api, ApiError, type Message, type PasscodeState } from '../lib/api'
import { cx } from '../lib/cx'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

type Tab = 'hero' | 'gallery' | 'about' | 'contact' | 'inbox' | 'access'

const tabs: { key: Tab; label: string; note: string }[] = [
  { key: 'hero', label: 'Hero', note: 'Banner image and opening words' },
  { key: 'gallery', label: 'Gallery', note: 'Every wedding, cover and caption' },
  { key: 'about', label: 'About', note: 'Biography, portrait, facts' },
  { key: 'contact', label: 'Contact', note: 'Email, phone, studio details' },
  { key: 'inbox', label: 'Inbox', note: 'Briefs sent from the site' },
  { key: 'access', label: 'Access', note: 'Studio passcode and sign-in' },
]

const inputClass =
  'w-full border border-line bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-faint/70 focus:border-ink'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)

function AdminField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
        <span>{label}</span>
        {hint && <span className="text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const { upload } = useSite()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const pick = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await upload(file))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        <div className="h-24 w-32 shrink-0 overflow-hidden border border-line bg-paper-3">
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center font-mono text-[9px] uppercase text-faint">No image</span>}
        </div>
        <div className="min-w-[14rem] flex-1 space-y-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/gallery/name.webp or https://…" className={inputClass} />
          <div className="flex items-center gap-2">
            <AdminButton onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
            </AdminButton>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void pick(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {error && <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-danger">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Gate() {
  const { login } = useSite()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(passcode)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <div className="grain flex min-h-[100svh] flex-col justify-between bg-night px-5 py-6 text-night-text sm:px-8">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-night-muted">Yugan Photography</span>
        <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.22em] text-night-muted transition-colors hover:text-paper">
          ← Back to site
        </Link>
      </div>

      <form onSubmit={submit} className="mx-auto w-full max-w-md">
        <Label tone="light" className="text-brick">Studio access</Label>
        <h1 className="display mt-4 text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.95]">
          The room
          <br />
          <em className="italic">behind the prints.</em>
        </h1>
        <p className="mt-4 max-w-[36ch] text-[14px] leading-relaxed text-night-muted">
          This page is not linked anywhere on the site. Enter the studio passcode to change the hero, the gallery and the
          details.
        </p>

        <div className="mt-8">
          <label className="block">
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.16em] text-night-muted">Passcode</span>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="w-full border border-night-line bg-night-2 px-4 py-3.5 text-[16px] text-paper outline-none transition-colors focus:border-paper"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-brick">{error}</p>}
          <button
            type="submit"
            disabled={busy || passcode.length < 3}
            className="mt-6 w-full rounded-pill bg-paper px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brick hover:text-paper disabled:pointer-events-none disabled:opacity-40"
          >
            {busy ? 'Checking…' : 'Enter the studio'}
          </button>
        </div>
      </form>

      <p className="mx-auto max-w-md font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-night-muted">
        Session lasts seven days. The passcode is stored as a hash — change it from the Access tab after signing in.
      </p>
    </div>
  )
}

export function Studio() {
  const { site, admin, logout, save, refresh } = useSite()
  useTitle('Studio')
  const [tab, setTab] = useState<Tab>('hero')
  const [draft, setDraft] = useState<Site>(site)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [inbox, setInbox] = useState<Message[] | null>(null)
  const [passcodeState, setPasscodeState] = useState<PasscodeState | null>(null)
  const [currentPasscode, setCurrentPasscode] = useState('')
  const [nextPasscode, setNextPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [passcodeBusy, setPasscodeBusy] = useState(false)
  const [passcodeError, setPasscodeError] = useState('')
  const [passcodeNote, setPasscodeNote] = useState('')

  useEffect(() => {
    setDraft(site)
  }, [site])

  useEffect(() => {
    if (tab !== 'inbox' || !admin) return
    let live = true
    api
      .messages()
      .then((r) => live && setInbox(r.messages))
      .catch(() => live && setInbox([]))
    return () => {
      live = false
    }
  }, [tab, admin])

  useEffect(() => {
    if (tab !== 'access' || !admin) return
    let live = true
    setPasscodeError('')
    api
      .passcodeStatus()
      .then((state) => {
        if (live) setPasscodeState(state)
      })
      .catch(() => {
        if (live) setPasscodeError('Could not read the passcode status.')
      })
    return () => {
      live = false
    }
  }, [tab, admin])

  const patch = (fn: (d: Site) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
    setDirty(true)
    setStatus('idle')
  }

  const onSave = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      await save(draft)
      setDirty(false)
      setStatus('saved')
      setMessage('Saved. The site is live with these changes.')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof ApiError ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
      window.setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const onReset = async () => {
    if (!window.confirm('Restore every section to the built-in defaults? This cannot be undone.')) return
    try {
      const fresh = await api.resetSite()
      setDraft(fresh.site)
      setDirty(false)
      setMessage('Defaults restored.')
      setStatus('saved')
      await refresh()
    } catch {
      setMessage('Could not restore defaults.')
      setStatus('error')
    }
  }

  const submitPasscode = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasscodeError('')
    setPasscodeNote('')
    if (nextPasscode.length < 8) {
      setPasscodeError('Use at least 8 characters for the new passcode.')
      return
    }
    if (nextPasscode !== confirmPasscode) {
      setPasscodeError('The two new passcodes do not match.')
      return
    }
    setPasscodeBusy(true)
    try {
      const state = await api.changePasscode(currentPasscode, nextPasscode)
      setPasscodeState(state)
      setCurrentPasscode('')
      setNextPasscode('')
      setConfirmPasscode('')
      setPasscodeNote('Passcode updated. Use the new one next time you sign in.')
    } catch (err) {
      setPasscodeError(err instanceof ApiError ? err.message : 'Could not update the passcode.')
    } finally {
      setPasscodeBusy(false)
    }
  }

  const removePasscode = async () => {
    if (!window.confirm('Remove the saved passcode and go back to the environment passcode?')) return
    setPasscodeBusy(true)
    setPasscodeError('')
    setPasscodeNote('')
    try {
      const state = await api.resetPasscode(currentPasscode)
      setPasscodeState(state)
      setCurrentPasscode('')
      setPasscodeNote(
        state.source === 'none'
          ? 'Custom passcode removed. No environment fallback is configured, so sign-in is now disabled.'
          : 'Custom passcode removed. The environment passcode is active again.',
      )
    } catch (err) {
      setPasscodeError(err instanceof ApiError ? err.message : 'Could not remove the passcode.')
    } finally {
      setPasscodeBusy(false)
    }
  }

  const counts = useMemo(
    () => ({
      photos: draft.projects.reduce((n, p) => n + p.images.length, 0),
      featured: draft.projects.filter((p) => p.featured).length,
    }),
    [draft.projects],
  )

  if (!admin) return <Gate />

  const addProject = () => {
    const id = `p-${Date.now().toString(36)}`
    const project: Project = {
      id,
      title: 'New wedding',
      slug: `new-wedding-${id.slice(2, 6)}`,
      category: 'Weddings',
      location: 'Salem',
      year: String(new Date().getFullYear()),
      client: '',
      summary: '',
      body: [''],
      cover: draft.projects[0]?.cover ?? defaultSite.hero.image,
      images: [],
      featured: false,
    }
    patch((d) => {
      d.projects.unshift(project)
    })
    setEditing(id)
  }

  const updateProject = (id: string, fn: (p: Project) => void) =>
    patch((d) => {
      const p = d.projects.find((x) => x.id === id)
      if (p) fn(p)
    })

  const moveProject = (id: string, dir: -1 | 1) =>
    patch((d) => {
      const i = d.projects.findIndex((p) => p.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= d.projects.length) return
      const [item] = d.projects.splice(i, 1)
      d.projects.splice(j, 0, item)
    })

  const removeProject = (id: string) => {
    if (!window.confirm('Delete this wedding from the gallery?')) return
    patch((d) => {
      d.projects = d.projects.filter((p) => p.id !== id)
    })
    if (editing === id) setEditing(null)
  }

  return (
    <div className="min-h-screen bg-paper-2 pb-24">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-[22px] leading-none">Yugan</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">Studio · hidden</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {status !== 'idle' && (
              <span className={cx('mr-1 font-mono text-[9.5px] uppercase tracking-[0.12em]', status === 'saved' ? 'text-success' : 'text-danger')}>{message}</span>
            )}
            <Link to="/" className="px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
              View site ↗
            </Link>
            <AdminButton onClick={onReset}>Reset defaults</AdminButton>
            <AdminButton tone="solid" onClick={onSave} disabled={saving || !dirty}>
              {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </AdminButton>
            <AdminButton
              onClick={() => {
                if (dirty && !window.confirm('You have unsaved changes. Leave anyway?')) return
                void logout()
              }}
            >
              Log out
            </AdminButton>
          </div>
        </Container>
        <Container className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cx(
                'shrink-0 rounded-t-md px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
                tab === t.key ? 'bg-ink text-paper' : 'text-muted hover:bg-paper-3/60 hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </Container>
      </header>

      <Container className="pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Label className="text-brick">{tabs.find((t) => t.key === tab)?.label}</Label>
            <p className="mt-2 text-[14px] text-muted">{tabs.find((t) => t.key === tab)?.note}</p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
            {draft.projects.length} weddings · {counts.photos} photos · {counts.featured} selected
          </p>
        </div>

        {tab === 'hero' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="space-y-5 border border-line bg-paper p-5 lg:col-span-7">
              <ImageField label="Hero background" value={draft.hero.image} onChange={(url) => patch((d) => { d.hero.image = url })} />
              <AdminField label="Image description">
                <input value={draft.hero.alt} onChange={(e) => patch((d) => { d.hero.alt = e.target.value })} className={inputClass} />
              </AdminField>
              <AdminField label="Eyebrow line">
                <input value={draft.hero.eyebrow} onChange={(e) => patch((d) => { d.hero.eyebrow = e.target.value })} className={inputClass} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Headline, line one">
                  <input value={draft.hero.lineOne} onChange={(e) => patch((d) => { d.hero.lineOne = e.target.value })} className={inputClass} />
                </AdminField>
                <AdminField label="Headline, italic line" hint="rendered in serif italic">
                  <input value={draft.hero.lineTwo} onChange={(e) => patch((d) => { d.hero.lineTwo = e.target.value })} className={inputClass} />
                </AdminField>
              </div>
              <AdminField label="Standfirst">
                <textarea value={draft.hero.sub} onChange={(e) => patch((d) => { d.hero.sub = e.target.value })} rows={4} className={inputClass} />
              </AdminField>
              <AdminField label="Availability line" hint="also used in the footer">
                <input value={draft.hero.note} onChange={(e) => patch((d) => { d.hero.note = e.target.value })} className={inputClass} />
              </AdminField>
            </section>

            <aside className="lg:col-span-5">
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Live preview</p>
              <div className="relative aspect-[4/5] overflow-hidden bg-night">
                <img src={draft.hero.image} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-paper/70">{draft.hero.eyebrow}</span>
                  <p className="display mt-3 text-[clamp(1.7rem,3vw,2.3rem)] text-paper">
                    {draft.hero.lineOne}
                    <br />
                    <em className="italic">{draft.hero.lineTwo}</em>
                  </p>
                  <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-paper/70">{draft.hero.sub}</p>
                </div>
              </div>
              <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-faint">
                Tip: 2000px wide, landscape. The overlay darkens the top and bottom, so keep faces near the middle of the frame.
              </p>
            </aside>
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] text-muted">Tap a wedding to edit its images, captions and order.</p>
              <AdminButton tone="solid" onClick={addProject}>
                + Add a wedding
              </AdminButton>
            </div>
            <div className="space-y-3">
              {draft.projects.map((p, i) => {
                const open = editing === p.id
                return (
                  <div key={p.id} className="border border-line bg-paper">
                    <div className="flex flex-wrap items-center gap-3 p-3">
                      <img src={p.cover} alt="" className="h-16 w-24 shrink-0 object-cover" />
                      <button type="button" onClick={() => setEditing(open ? null : p.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[15px]">{p.title || 'Untitled'}</p>
                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                          {String(i + 1).padStart(2, '0')} · {p.category} · {p.location} · {p.year} · {p.images.length} photos
                          {p.featured ? ' · selected' : ''}
                        </p>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <AdminButton onClick={() => moveProject(p.id, -1)} disabled={i === 0} title="Move up">
                          ↑
                        </AdminButton>
                        <AdminButton onClick={() => moveProject(p.id, 1)} disabled={i === draft.projects.length - 1} title="Move down">
                          ↓
                        </AdminButton>
                        <AdminButton onClick={() => setEditing(open ? null : p.id)}>{open ? 'Close' : 'Edit'}</AdminButton>
                        <AdminButton tone="danger" onClick={() => removeProject(p.id)}>
                          Delete
                        </AdminButton>
                      </div>
                    </div>

                    {open && (
                      <div className="space-y-5 border-t border-line p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AdminField label="Title">
                            <input
                              value={p.title}
                              onChange={(e) => updateProject(p.id, (x) => { x.title = e.target.value })}
                              className={inputClass}
                            />
                          </AdminField>
                          <AdminField label="URL slug" hint={`/work/${p.slug}`}>
                            <div className="flex gap-2">
                              <input
                                value={p.slug}
                                onChange={(e) => updateProject(p.id, (x) => { x.slug = slugify(e.target.value) })}
                                className={inputClass}
                              />
                              <AdminButton onClick={() => updateProject(p.id, (x) => { x.slug = slugify(x.title) })}>From title</AdminButton>
                            </div>
                          </AdminField>
                          <AdminField label="Category">
                            <select
                              value={p.category}
                              onChange={(e) => updateProject(p.id, (x) => { x.category = e.target.value as Project['category'] })}
                              className={inputClass}
                            >
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </AdminField>
                          <AdminField label="Year">
                            <input value={p.year} onChange={(e) => updateProject(p.id, (x) => { x.year = e.target.value })} className={inputClass} />
                          </AdminField>
                          <AdminField label="Location">
                            <input value={p.location} onChange={(e) => updateProject(p.id, (x) => { x.location = e.target.value })} className={inputClass} />
                          </AdminField>
                          <AdminField label="Venue">
                            <input value={p.client} onChange={(e) => updateProject(p.id, (x) => { x.client = e.target.value })} className={inputClass} />
                          </AdminField>
                        </div>

                        <AdminField label="Summary" hint="one line, used on cards">
                          <textarea value={p.summary} onChange={(e) => updateProject(p.id, (x) => { x.summary = e.target.value })} rows={2} className={inputClass} />
                        </AdminField>
                        <AdminField label="Body" hint="one paragraph per blank line">
                          <textarea
                            value={p.body.join('\n\n')}
                            onChange={(e) => updateProject(p.id, (x) => { x.body = e.target.value.split(/\n{2,}/) })}
                            rows={6}
                            className={inputClass}
                          />
                        </AdminField>

                        <ImageField label="Cover image" value={p.cover} onChange={(url) => updateProject(p.id, (x) => { x.cover = url })} />

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={p.featured}
                            onChange={(e) => updateProject(p.id, (x) => { x.featured = e.target.checked })}
                            className="size-4 accent-[#a4492b]"
                          />
                          <span className="text-[13px] text-ink">Show in the home page selection</span>
                        </label>

                        <div className="border-t border-line pt-5">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Photographs in this set</p>
                            <AdminButton
                              onClick={() =>
                                updateProject(p.id, (x) => {
                                  x.images.push({ src: x.cover, caption: `${x.location}, ${x.year}` })
                                })
                              }
                            >
                              + Add photograph
                            </AdminButton>
                          </div>
                          <div className="space-y-4">
                            {p.images.map((photo, j) => (
                              <div key={`${p.id}-${j}`} className="border border-line bg-paper-2/40 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                                    Photo {String(j + 1).padStart(2, '0')}
                                  </span>
                                  <AdminButton tone="danger" onClick={() => updateProject(p.id, (x) => { x.images.splice(j, 1) })}>
                                    Remove
                                  </AdminButton>
                                </div>
                                <ImageField
                                  label="Image"
                                  value={photo.src}
                                  onChange={(url) => updateProject(p.id, (x) => { const img = x.images[j]; if (img) img.src = url })}
                                />
                                <div className="mt-3">
                                  <AdminField label="Caption">
                                    <input
                                      value={photo.caption}
                                      onChange={(e) => updateProject(p.id, (x) => { const img = x.images[j]; if (img) img.caption = e.target.value })}
                                      className={inputClass}
                                    />
                                  </AdminField>
                                </div>
                              </div>
                            ))}
                            {p.images.length === 0 && (
                              <p className="text-[13px] text-muted">No photographs yet. The cover image is used everywhere until you add one.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'about' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-5 border border-line bg-paper p-5">
              <ImageField label="Portrait" value={draft.about.portrait} onChange={(url) => patch((d) => { d.about.portrait = url })} />
              <AdminField label="Standfirst" hint="the big serif sentence">
                <textarea value={draft.about.standfirst} onChange={(e) => patch((d) => { d.about.standfirst = e.target.value })} rows={4} className={inputClass} />
              </AdminField>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Biography</span>
                  <AdminButton onClick={() => patch((d) => { d.about.bio.push('') })}>+ Paragraph</AdminButton>
                </div>
                <div className="space-y-3">
                  {draft.about.bio.map((para, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        value={para}
                        onChange={(e) => patch((d) => { d.about.bio[i] = e.target.value })}
                        rows={4}
                        className={inputClass}
                      />
                      <AdminButton tone="danger" onClick={() => patch((d) => { d.about.bio.splice(i, 1) })}>
                        ×
                      </AdminButton>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <section className="border border-line bg-paper p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Facts</span>
                  <AdminButton onClick={() => patch((d) => { d.about.facts.push({ label: 'Label', value: 'Value' }) })}>+ Fact</AdminButton>
                </div>
                <div className="space-y-2">
                  {draft.about.facts.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={f.label} onChange={(e) => patch((d) => { d.about.facts[i]!.label = e.target.value })} className={cx(inputClass, 'w-1/3')} />
                      <input value={f.value} onChange={(e) => patch((d) => { d.about.facts[i]!.value = e.target.value })} className={inputClass} />
                      <AdminButton tone="danger" onClick={() => patch((d) => { d.about.facts.splice(i, 1) })}>
                        ×
                      </AdminButton>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-line bg-paper p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Approach</span>
                  <AdminButton onClick={() => patch((d) => { d.about.approach.push({ title: 'New step', text: '' }) })}>+ Step</AdminButton>
                </div>
                <div className="space-y-4">
                  {draft.about.approach.map((a, i) => (
                    <div key={i} className="space-y-2 border border-line p-3">
                      <div className="flex gap-2">
                        <input value={a.title} onChange={(e) => patch((d) => { d.about.approach[i]!.title = e.target.value })} className={inputClass} />
                        <AdminButton tone="danger" onClick={() => patch((d) => { d.about.approach.splice(i, 1) })}>
                          ×
                        </AdminButton>
                      </div>
                      <textarea value={a.text} onChange={(e) => patch((d) => { d.about.approach[i]!.text = e.target.value })} rows={3} className={inputClass} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <section className="max-w-3xl space-y-5 border border-line bg-paper p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['whatsapp', 'WhatsApp number', 'digits only, for wa.me'],
                  ['instagram', 'Instagram handle', 'without the @'],
                  ['hours', 'Studio hours'],
                  ['mapUrl', 'Map link'],
                ] as const
              ).map(([key, label, hint]) => (
                <AdminField key={key} label={label} hint={hint}>
                  <input value={draft.contact[key]} onChange={(e) => patch((d) => { d.contact[key] = e.target.value })} className={inputClass} />
                </AdminField>
              ))}
            </div>
            <AdminField label="Studio address">
              <input value={draft.contact.address} onChange={(e) => patch((d) => { d.contact.address = e.target.value })} className={inputClass} />
            </AdminField>
            <AdminField label="Availability note">
              <textarea value={draft.contact.note} onChange={(e) => patch((d) => { d.contact.note = e.target.value })} rows={3} className={inputClass} />
            </AdminField>
            <div className="border-t border-line pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Studio identity</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <AdminField label="Brand">
                  <input value={draft.brand} onChange={(e) => patch((d) => { d.brand = e.target.value })} className={inputClass} />
                </AdminField>
                <AdminField label="Photographer">
                  <input value={draft.photographer} onChange={(e) => patch((d) => { d.photographer = e.target.value })} className={inputClass} />
                </AdminField>
              </div>
            </div>
          </section>
        )}

        {tab === 'inbox' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] text-muted">Every brief sent through the contact form, newest first.</p>
              <AdminButton
                onClick={() => {
                  setInbox(null)
                  api.messages().then((r) => setInbox(r.messages)).catch(() => setInbox([]))
                }}
              >
                Refresh
              </AdminButton>
            </div>
            {inbox === null && <Spinner label="Loading briefs" />}
            {inbox?.length === 0 && <p className="border border-line bg-paper p-6 text-[14px] text-muted">No briefs yet.</p>}
            <div className="space-y-3">
              {inbox?.map((m) => (
                <article key={m.id} className="border border-line bg-paper p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[15px] text-ink">{m.name}</p>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                        {m.projectType} · {m.location} · {m.timeline} · {m.budget}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">{new Date(m.createdAt).toLocaleString()}</span>
                      <AdminButton
                        tone="danger"
                        onClick={() => {
                          void api.deleteMessage(m.id).then(() => setInbox((prev) => prev?.filter((x) => x.id !== m.id) ?? null))
                        }}
                      >
                        Delete
                      </AdminButton>
                    </div>
                  </div>
                  <p className="mt-3 max-w-[80ch] whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{m.message}</p>
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-line pt-3 font-mono text-[10px] tracking-[0.08em] text-muted">
                    <a href={`mailto:${m.email}`} className="hover:text-ink">✉ {m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="hover:text-ink">☎ {m.phone}</a>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'access' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="border border-line bg-paper p-5 lg:col-span-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Current access</p>
              {passcodeState === null && !passcodeError && <p className="mt-4 text-[14px] text-muted">Checking…</p>}
              {passcodeState && (
                <>
                  <p className="mt-4 font-serif text-[24px] leading-tight text-ink">
                    {passcodeState.source === 'custom' && 'Saved in the studio'}
                    {passcodeState.source === 'env-hash' && 'Hashed environment passcode'}
                    {passcodeState.source === 'env' && 'Environment passcode'}
                    {passcodeState.source === 'none' && 'No passcode configured'}
                  </p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                    {passcodeState.source === 'custom' &&
                      'The passcode you set here is active. It is stored as a salted PBKDF2 hash in the private settings record, never in the public site JSON.'}
                    {passcodeState.source === 'env-hash' &&
                      'ADMIN_PASSCODE_HASH is active. Set a new passcode below to move it into the private site database.'}
                    {passcodeState.source === 'env' &&
                      'ADMIN_PASSCODE is active. Set a new passcode below to stop relying on the plain environment value.'}
                    {passcodeState.source === 'none' &&
                      'No saved passcode, ADMIN_PASSCODE or ADMIN_PASSCODE_HASH exists. Sign-in is disabled until one is configured.'}
                  </p>
                  <dl className="mt-5 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[9.5px] uppercase tracking-[0.12em]">
                    <dt className="text-faint">Hashing</dt>
                    <dd className="text-ink-2">PBKDF2 · SHA-256 · 150,000 rounds</dd>
                    <dt className="text-faint">Stored in</dt>
                    <dd className="text-ink-2">
                      {passcodeState.source === 'custom' ? 'Private site database' : 'Environment variable'}
                    </dd>
                  </dl>
                </>
              )}
              {passcodeError && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-danger">{passcodeError}</p>
              )}
            </section>

            <section className="border border-line bg-paper p-5 lg:col-span-7">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Change the passcode</p>
              <form onSubmit={submitPasscode} className="mt-4 space-y-4">
                <AdminField label="Current passcode">
                  <input
                    type="password"
                    value={currentPasscode}
                    onChange={(e) => setCurrentPasscode(e.target.value)}
                    autoComplete="current-password"
                    maxLength={120}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </AdminField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="New passcode" hint="8+ characters">
                    <input
                      type="password"
                      value={nextPasscode}
                      onChange={(e) => setNextPasscode(e.target.value)}
                      autoComplete="new-password"
                      maxLength={120}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </AdminField>
                  <AdminField label="Confirm new passcode">
                    <input
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      autoComplete="new-password"
                      maxLength={120}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </AdminField>
                </div>
                {passcodeNote && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-success">{passcodeNote}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <AdminButton
                    type="submit"
                    tone="solid"
                    disabled={passcodeBusy || !currentPasscode || !nextPasscode || !confirmPasscode}
                  >
                    {passcodeBusy ? 'Updating…' : 'Update passcode'}
                  </AdminButton>
                  {passcodeState?.custom && (
                    <AdminButton
                      type="button"
                      tone="danger"
                      onClick={removePasscode}
                      disabled={passcodeBusy || !currentPasscode}
                    >
                      Use environment passcode
                    </AdminButton>
                  )}
                </div>
                <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-faint">
                  The passcode is hashed before it is stored; the plain text never reaches the database. Removing it falls
                  back to ADMIN_PASSCODE_HASH or ADMIN_PASSCODE.
                </p>
              </form>
            </section>
          </div>
        )}

        <p className="mt-10 border-t border-line pt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-faint">
          Hidden studio · not linked from the public site · changes are stored in the site database
        </p>
      </Container>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur-md">
          <Container className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Unsaved changes</p>
            <div className="flex gap-2">
              <AdminButton onClick={() => { setDraft(site); setDirty(false) }}>Discard</AdminButton>
              <AdminButton tone="solid" onClick={onSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </AdminButton>
            </div>
          </Container>
        </div>
      )}
    </div>
  )
}
