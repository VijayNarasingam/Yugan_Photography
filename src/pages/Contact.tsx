import { useState } from 'react'

import { Accordion, Action, Container, Field, Input, Label, Reveal, Select, TextArea } from '../components/ui'
import { CATEGORIES, faq } from '../content'
import { api, ApiError, type ContactPayload } from '../lib/api'
import { cx } from '../lib/cx'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

const empty: ContactPayload = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  location: '',
  timeline: 'Within a month',
  budget: 'Not sure yet',
  message: '',
}

const TIMELINES = ['Next few weeks', 'In 1–3 months', 'In 3–6 months', 'Just planning']
const BUDGETS = ['Under ₹75,000', '₹75,000 – ₹1,50,000', '₹1,50,000 – ₹3,00,000', 'Above ₹3,00,000', 'Not sure yet']

export function Contact() {
  const { site } = useSite()
  useTitle('Contact')
  const [form, setForm] = useState<ContactPayload>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [reference, setReference] = useState('')
  const [failure, setFailure] = useState('')

  const set = <K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 2) next.name = 'Your name, so I know who is writing.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'A working email address.'
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 8) next.phone = 'Include the country or STD code.'
    if (!form.projectType) next.projectType = 'Pick the closest wedding function.'
    if (form.location.trim().length < 2) next.location = 'The city or venue is enough.'
    if (form.message.trim().length < 10) next.message = 'A sentence or two about the project, please.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFailure('')
    if (!validate()) return
    setStatus('sending')
    try {
      const res = await api.contact(form)
      setReference(res.reference)
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      if (err instanceof ApiError) {
        setFailure(err.message)
        if (err.fields) setErrors(err.fields)
      } else {
        setFailure('Could not send the brief. Check your connection and try again.')
      }
    }
  }

  const details = [
    { label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}` },
    { label: 'Phone', value: site.contact.phone, href: `tel:${site.contact.phone.replace(/\s/g, '')}` },
    { label: 'WhatsApp', value: 'Message the studio', href: `https://wa.me/${site.contact.whatsapp}` },
    { label: 'Instagram', value: `@${site.contact.instagram}`, href: `https://instagram.com/${site.contact.instagram}` },
  ]

  return (
    <>
      <Container className="pt-32 sm:pt-40">
        <div className="grid grid-cols-1 gap-10 border-b border-line pb-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Label className="text-brick">Contact</Label>
            <h1 className="display mt-5 text-[clamp(2.8rem,8vw,6.4rem)] leading-[0.9]">
              Tell me about
              <br />
              your <em className="italic text-brick">wedding.</em>
            </h1>
          </div>
          <div className="self-end lg:col-span-4">
            <p className="max-w-[34ch] text-[15px] leading-[1.75] text-muted">
              A date, a venue and how many functions is enough to start. I answer every enquiry myself, usually within
              one working day.
            </p>
          </div>
        </div>
      </Container>

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {status === 'sent' ? (
              <div className="border border-line bg-paper-2/50 p-8 sm:p-12">
                <Label className="text-brick">Enquiry received</Label>
                <h2 className="display mt-5 text-[clamp(2rem,4vw,3rem)] leading-tight">Thank you — that reached the studio.</h2>
                <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.75] text-muted">
                  Your reference is <span className="font-mono text-[13px] text-ink">{reference}</span>. I will reply from{' '}
                  {site.contact.email} within one working day with a quote and confirmation of the date.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Action
                    onClick={() => {
                      setForm(empty)
                      setStatus('idle')
                    }}
                    arrow
                  >
                    Send another enquiry
                  </Action>
                  <Action href={`https://wa.me/${site.contact.whatsapp}`} variant="outline">
                    WhatsApp instead
                  </Action>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <Field label="Your name" error={errors.name}>
                    <Input value={form.name} onChange={(v) => set('name', v)} placeholder="Aishwarya &amp; Karthik" autoComplete="name" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input value={form.email} onChange={(v) => set('email', v)} placeholder="you@email.com" type="email" autoComplete="email" />
                  </Field>
                  <Field label="Phone" hint="optional" error={errors.phone}>
                    <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="+91 …" autoComplete="tel" />
                  </Field>
                  <Field label="Venue or city" error={errors.location}>
                    <Input value={form.location} onChange={(v) => set('location', v)} placeholder="Salem, Tamil Nadu" />
                  </Field>
                </div>

                <Field label="What are we covering?" error={errors.projectType}>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[...CATEGORIES, 'Other'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set('projectType', c)}
                        aria-pressed={form.projectType === c}
                        className={cx(
                          'rounded-pill border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                          form.projectType === c ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-muted hover:border-ink/60 hover:text-ink',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <Field label="When is the wedding?">
                    <Select value={form.timeline} onChange={(v) => set('timeline', v)} options={TIMELINES} />
                  </Field>
                  <Field label="Budget range">
                    <Select value={form.budget} onChange={(v) => set('budget', v)} options={BUDGETS} />
                  </Field>
                </div>

                <Field label="About the wedding" error={errors.message}>
                  <TextArea
                    value={form.message}
                    onChange={(v) => set('message', v)}
                    rows={5}
                    placeholder="Muhurtham at 7:40am at Sri Lakshmi Mahal, reception the same evening, around 400 guests. We would like candids of both families…"
                  />
                </Field>

                {failure && <p className="border-l-2 border-danger pl-4 font-mono text-[11px] uppercase tracking-[0.1em] text-danger">{failure}</p>}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Action type="submit" arrow disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send the enquiry'}
                  </Action>
                  <p className="font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.14em] text-faint">
                    No newsletter, no list. Just a reply.
                  </p>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="grain bg-night p-7 text-night-text sm:p-9">
              <Label tone="light" className="text-brick">Direct lines</Label>
              <ul className="mt-6">
                {details.map((d) => (
                  <li key={d.label} className="border-t border-night-line py-4 first:border-t-0 first:pt-0">
                    <a href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group flex items-baseline justify-between gap-6">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-night-muted">{d.label}</span>
                      <span className="text-right text-[14.5px] text-paper transition-colors group-hover:text-brick">{d.value}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-night-line pt-6">
                <Label tone="light" className="text-brick">Studio</Label>
                <p className="mt-3 max-w-[26ch] text-[14px] leading-relaxed text-paper/85">{site.contact.address}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-night-muted">{site.contact.hours}</p>
                <a href={site.contact.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brick">
                  Open in maps ↗
                </a>
              </div>

              <div className="mt-8 border-t border-night-line pt-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-night-muted">Availability</p>
                <p className="mt-2 text-[14px] text-paper">{site.hero.note}</p>
                <p className="mt-3 max-w-[32ch] text-[13px] leading-relaxed text-night-muted">{site.contact.note}</p>
              </div>
            </div>

            <div className="mt-6 border border-line p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">Response time</p>
              <p className="display mt-2 text-[clamp(1.8rem,3vw,2.4rem)]">One working day</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                We meet at the studio in Fairlands, or on a video call if you are outside Salem. Travel is quoted before anything is booked.
              </p>
            </div>
          </aside>
        </div>
      </Container>

      <Container className="pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-10 border-t border-line pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label className="text-brick">Before you ask</Label>
            <h2 className="display mt-4 max-w-[12ch] text-[clamp(2rem,4vw,3rem)] leading-[0.98]">
              Questions, <em className="italic text-brick">answered.</em>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faq} />
          </div>
        </div>
      </Container>

      <Container className="pb-20">
        <Reveal>
          <p className="border-t border-line pt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-faint">
            {site.brand} · {site.photographer} · {site.contact.address}
          </p>
        </Reveal>
      </Container>
    </>
  )
}
