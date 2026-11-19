import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { GalleryIndex, Lightbox, ProjectCard } from '../components/Gallery'
import { Action, Chip, Container, Label, Reveal } from '../components/ui'
import { CATEGORIES, type Photo } from '../content'
import { cx } from '../lib/cx'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

type View = 'grid' | 'index'

export function Work() {
  const { site } = useSite()
  useTitle('Weddings')
  const [params, setParams] = useSearchParams()
  const category = params.get('cat') ?? 'All'
  const [view, setView] = useState<View>('grid')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = useMemo(
    () => (category === 'All' ? site.projects : site.projects.filter((p) => p.category === category)),
    [category, site.projects],
  )

  const photos: Photo[] = useMemo(
    () =>
      filtered.map((p) => ({
        src: p.cover,
        caption: `${p.title} — ${p.images[0]?.caption ?? `${p.location}, ${p.year}`}`,
      })),
    [filtered],
  )

  const setCategory = (next: string) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'All') nextParams.delete('cat')
    else nextParams.set('cat', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <>
      <Container className="pt-32 sm:pt-40">
        <div className="flex flex-col gap-8 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label className="text-brick">The weddings</Label>
            <h1 className="display mt-5 max-w-[16ch] text-[clamp(2.8rem,8vw,6.6rem)] leading-[0.92] text-ink">
              Weddings, <em className="italic text-brick">2024—2026</em>
            </h1>
          </div>
          <div className="max-w-[38ch] lg:pb-3">
            <p className="text-[15px] leading-[1.75] text-muted">
              Twelve weddings from across Tamil Nadu. Filter by function, or switch to the index and let the frames come
              to you.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLightbox(0)}
                className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink rule-link"
              >
                Open the viewer
              </button>
              <span className="h-3 w-px bg-line" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {String(filtered.length).padStart(2, '0')} weddings
              </span>
            </div>
          </div>
        </div>
      </Container>

      <div className="sticky top-[68px] z-40 border-b border-line bg-paper/94 backdrop-blur-md">
        <Container className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {['All', ...CATEGORIES].map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint sm:inline">View</span>
            {(['grid', 'index'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cx(
                  'rounded-pill px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                  view === v ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <motion.div layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {view === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.04}>
                    <ProjectCard project={p} index={i} aspect={i % 5 === 1 ? 'aspect-[4/5]' : i % 5 === 3 ? 'aspect-[5/4]' : 'aspect-[4/3]'} />
                  </Reveal>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="index"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <GalleryIndex projects={filtered} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-muted">No weddings in this category yet. Try another filter.</p>
        )}

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-end">
          <p className="display max-w-[18ch] text-[clamp(1.7rem,3.4vw,2.6rem)] leading-tight">
            Have a date in mind?
          </p>
          <Action to="/contact" arrow>
            Check my date
          </Action>
        </div>
      </Container>

      <AnimatePresence>
        {lightbox !== null && <Lightbox photos={photos} start={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </>
  )
}
