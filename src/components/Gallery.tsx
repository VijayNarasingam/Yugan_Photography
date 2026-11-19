import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import type { Photo, Project } from '../content'
import { cx } from '../lib/cx'
import { Arrow, Chevron, Cross, Label } from './ui'

const pad = (n: number) => String(n).padStart(2, '0')

/** A photograph in a frame: slow zoom on hover, index top-left, caption under. */
export function ProjectCard({
  project,
  index,
  aspect = 'aspect-[4/5]',
  className,
}: {
  project: Project
  index: number
  aspect?: string
  className?: string
}) {
  return (
    <Link to={`/work/${project.slug}`} className={cx('group block', className)} data-cursor="view">
      <div className={cx('relative overflow-hidden bg-paper-2', aspect)}>
        <img
          src={project.cover}
          alt={project.images[0]?.caption ?? project.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.14em] text-paper/90 mix-blend-difference">
          {pad(index + 1)}
        </span>
        {project.featured && (
          <span className="absolute right-3 top-3 rounded-pill bg-paper/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink">
            Selected
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between bg-paper/95 px-3 py-2.5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]">View project</span>
          <Arrow size={12} />
        </span>
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <h3 className="text-[16px] leading-tight text-ink transition-colors group-hover:text-brick">{project.title}</h3>
        <span className="eyebrow shrink-0 text-faint">{project.year}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {project.category} · {project.location}
      </p>
    </Link>
  )
}

/** An editorial index: rows of type, a photograph following the pointer. */
export function GalleryIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const listRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={listRef}
      className="relative border-t border-line"
      onPointerMove={(e) => {
        const rect = listRef.current?.getBoundingClientRect()
        if (!rect) return
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onPointerLeave={() => setActive(null)}
    >
      {projects.map((p, i) => (
        <Link
          key={p.id}
          to={`/work/${p.slug}`}
          onPointerEnter={() => setActive(i)}
          className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-line py-5 transition-colors hover:bg-paper-2/60 sm:grid-cols-[3.5rem_1fr_10rem_7rem_auto] sm:gap-6"
        >
          <span className="font-mono text-[10px] tracking-[0.14em] text-brick">{pad(i + 1)}</span>
          <span className="text-[clamp(1.15rem,2.4vw,1.7rem)] leading-none text-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
            {p.title}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:block">{p.category}</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:block">{p.location}</span>
          <span className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{p.year}</span>
            <Arrow className="text-ink opacity-0 transition-opacity group-hover:opacity-100" size={13} />
          </span>
        </Link>
      ))}

      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="preview"
            className="pointer-events-none absolute z-20 hidden w-[19rem] overflow-hidden bg-paper-2 shadow-[0_30px_60px_-36px_rgba(21,20,15,0.5)] md:block"
            style={{ left: pos.x + 32, top: pos.y - 110 }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={projects[active].cover} alt="" className="aspect-[4/3] w-full object-cover" />
            <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{projects[active].images[0]?.caption}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Full-screen viewer with keyboard and click navigation. */
export function Lightbox({ photos, start = 0, onClose }: { photos: Photo[]; start?: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const photo = photos[i]

  const go = (dir: number) => setI((v) => (v + dir + photos.length) % photos.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % photos.length)
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, photos.length])

  if (!photo) return null

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col bg-night/97 text-night-text backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph viewer"
    >
      <div className="flex items-center justify-between border-b border-night-line px-5 py-4 sm:px-8">
        <Label tone="light">
          {pad(i + 1)} <span className="text-night-muted">/ {pad(photos.length)}</span>
        </Label>
        <button type="button" onClick={onClose} aria-label="Close viewer" className="grid size-10 place-items-center rounded-full border border-night-line transition-colors hover:bg-paper hover:text-ink">
          <Cross />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 sm:px-16" onClick={onClose}>
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.src + i}
            src={photo.src}
            alt={photo.caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-night-line px-5 py-4 sm:px-8">
        <p className="max-w-[46ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-night-muted">{photo.caption}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="grid size-10 place-items-center rounded-full border border-night-line transition-colors hover:bg-paper hover:text-ink">
            <Chevron dir="left" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="grid size-10 place-items-center rounded-full border border-night-line transition-colors hover:bg-paper hover:text-ink">
            <Chevron />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/** A hero-sized photograph that drifts as the page scrolls. */
export function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cx('overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        className="size-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
