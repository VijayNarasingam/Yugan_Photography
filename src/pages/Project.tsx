import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { Lightbox } from '../components/Gallery'
import { Action, Arrow, Container, Label, Reveal } from '../components/ui'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

const pad = (n: number) => String(n).padStart(2, '0')

export function Project() {
  const { slug } = useParams()
  const { site } = useSite()
  const project = site.projects.find((p) => p.slug === slug)
  const [open, setOpen] = useState<number | null>(null)
  useTitle(project?.title)

  if (!project) {
    return (
      <Container className="flex min-h-[70svh] flex-col justify-center py-32">
        <Label className="text-brick">Not found</Label>
        <h1 className="display mt-5 max-w-[18ch] text-[clamp(2.4rem,6vw,4.6rem)]">That wedding has moved or never existed.</h1>
        <div className="mt-8">
          <Action to="/work" arrow>
            Back to the work
          </Action>
        </div>
      </Container>
    )
  }

  const index = site.projects.findIndex((p) => p.id === project.id)
  const next = site.projects[(index + 1) % site.projects.length]
  const meta = [
    { label: 'Venue', value: project.client },
    { label: 'Location', value: project.location },
    { label: 'Year', value: project.year },
    { label: 'Function', value: project.category },
  ]

  return (
    <>
      <Container className="pt-28 sm:pt-36">
        <div className="flex items-center justify-between border-b border-line pb-5">
          <Link to="/work" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink">
            <Arrow className="rotate-[225deg]" size={12} /> All work
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {pad(index + 1)} / {pad(site.projects.length)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <Label className="text-brick">{project.category} · {project.location}</Label>
            <h1 className="display mt-5 text-[clamp(2.6rem,7vw,5.8rem)] leading-[0.94]">{project.title}</h1>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-muted">{project.summary}</p>
          </div>
          <dl className="self-end lg:col-span-4">
            {meta.map((m) => (
              <div key={m.label} className="flex items-baseline justify-between gap-4 border-t border-line py-3 last:border-b">
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">{m.label}</dt>
                <dd className="text-right text-[14px] text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container className="mt-10">
        <button
          type="button"
          onClick={() => setOpen(0)}
          data-cursor="view"
          className="group relative block w-full overflow-hidden bg-paper-2"
          aria-label="Open the photograph viewer"
        >
          <img
            src={project.cover}
            alt={project.images[0]?.caption ?? project.title}
            className="aspect-[16/10] w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
          />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-night/70 to-transparent p-4 sm:p-6">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-paper/80">{project.images[0]?.caption}</span>
            <span className="rounded-pill bg-paper/95 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink">View 01</span>
          </span>
        </button>
      </Container>

      <Container className="py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label className="text-brick">The wedding</Label>
            <p className="mt-4 max-w-[26ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              {project.images.length} photographs · Teaser in 48 hours · Full gallery in 3 weeks
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {project.body.map((para) => (
              <Reveal key={para.slice(0, 24)}>
                <p className="mb-6 text-[16px] leading-[1.8] text-ink-2 last:mb-0">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {project.images.slice(1).map((photo, i) => (
            <Reveal key={photo.src + i} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => setOpen(i + 1)}
                data-cursor="view"
                className="group block w-full text-left"
                aria-label={`Open photograph ${i + 2}`}
              >
                <div className="overflow-hidden bg-paper-2">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                  <span>{photo.caption}</span>
                  <span className="text-faint">{pad(i + 2)}</span>
                </p>
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="pb-20 sm:pb-28">
        <Link
          to={`/work/${next.slug}`}
          className="group grid grid-cols-1 items-end gap-6 border-t border-line pt-8 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Next wedding</span>
            <p className="display mt-3 text-[clamp(2rem,5vw,3.8rem)] leading-none transition-colors group-hover:text-brick">
              {next.title}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {next.category} · {next.location} · {next.year}
            </p>
          </div>
          <img src={next.cover} alt="" loading="lazy" className="h-24 w-36 object-cover sm:h-28 sm:w-48" />
        </Link>
      </Container>

      <AnimatePresence>
        {open !== null && <Lightbox photos={project.images} start={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  )
}
