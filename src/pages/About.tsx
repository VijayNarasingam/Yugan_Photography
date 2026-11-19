import { Link } from 'react-router'

import { Action, Container, Counter, Label, Marquee, Reveal, SectionHead } from '../components/ui'
import { clients, stats, testimonials, timeline, toolkit } from '../content'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

export function About() {
  const { site } = useSite()
  useTitle('About')

  return (
    <>
      <Container className="pt-32 sm:pt-40">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Label className="text-brick">About</Label>
            <h1 className="display mt-5 text-[clamp(2.9rem,8.4vw,7rem)] leading-[0.9]">
              Ajith Kumar,
              <br />
              <em className="italic text-brick">behind the camera.</em>
            </h1>
            <p className="mt-8 max-w-[46ch] text-[17px] leading-[1.7] text-ink-2">{site.about.standfirst}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span>{site.brand}</span>
              <span className="text-faint">/</span>
              <span>{site.contact.address}</span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative">
                <img src={site.about.portrait} alt={site.photographer} className="aspect-[4/5] w-full object-cover" />
                <div className="absolute -bottom-4 -left-4 hidden bg-paper px-4 py-3 shadow-[0_20px_40px_-30px_rgba(21,20,15,0.6)] sm:block">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">Photographer</p>
                  <p className="mt-1 text-[15px]">{site.photographer}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      <Container className="py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-10 border-t border-line pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label className="text-brick">01 — The person</Label>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {site.about.bio.map((para, i) => (
              <Reveal key={para.slice(0, 24)} delay={i * 0.05}>
                <p className="mb-6 text-[16px] leading-[1.8] text-ink-2 last:mb-0">{para}</p>
              </Reveal>
            ))}

            <dl className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {site.about.facts.map((f) => (
                <div key={f.label} className="border-t border-line py-3">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">{f.label}</dt>
                  <dd className="mt-1 text-[14.5px] text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      <section className="grain bg-night py-20 text-night-text sm:py-28">
        <Container>
          <div className="grid grid-cols-2 gap-8 border-t border-night-line pt-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="display text-[clamp(2.6rem,5vw,4rem)]">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 max-w-[14ch] font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.14em] text-night-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20 sm:py-28">
        <SectionHead index="02" title="How I work" note="Four habits that come from nine years of muhurthams, receptions and long waits for the light." />
        <div className="mt-12 grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
          {site.about.approach.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05} className="bg-paper">
              <div className="group h-full p-7 transition-colors duration-500 hover:bg-paper-2/60 sm:p-9">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-brick">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-px w-8 bg-line transition-all duration-500 group-hover:w-14 group-hover:bg-brick" />
                </div>
                <h3 className="display mt-10 text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight">{a.title}</h3>
                <p className="mt-4 max-w-[42ch] text-[14.5px] leading-[1.75] text-muted">{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-12 border-t border-line pt-10 md:grid-cols-2 md:gap-16">
          <div>
            <Label className="text-brick">03 — Toolkit</Label>
            <dl className="mt-6">
              {toolkit.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">{t.label}</dt>
                  <dd className="text-right text-[14px] text-ink">{t.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <Label className="text-brick">04 — Timeline</Label>
            <ol className="mt-6">
              {timeline.map((t) => (
                <li key={t.year} className="relative flex gap-6 border-b border-line py-3.5">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-brick">{t.year}</span>
                  <span className="text-[14px] leading-relaxed text-ink-2">{t.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>

      <Container className="pb-20 sm:pb-28">
        <figure className="border-y border-line py-12 text-center sm:py-16">
          <blockquote className="display mx-auto max-w-[24ch] text-[clamp(1.7rem,4vw,3.2rem)] leading-[1.12]">
            “{testimonials[0].quote}”
          </blockquote>
          <figcaption className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {testimonials[0].name} · {testimonials[0].role}
          </figcaption>
        </figure>
      </Container>

      <div className="border-t border-line">
        <Container className="py-8">
          <Label className="text-faint">Venues &amp; vendors</Label>
        </Container>
        <Marquee items={clients} slow />
      </div>

      <Container className="py-20 sm:py-28">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-line pt-10 sm:flex-row sm:items-end">
          <h2 className="display max-w-[18ch] text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.98]">
            More of the <em className="italic text-brick">weddings?</em>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Action to="/work" arrow>
              See the weddings
            </Action>
            <Link to="/contact" className="inline-flex items-center px-1 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] rule-link">
              Or start a brief
            </Link>
          </div>
        </div>
      </Container>
    </>
  )
}
