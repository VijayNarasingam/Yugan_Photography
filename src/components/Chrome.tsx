import { AnimatePresence, motion, useMotionValue, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { cx } from '../lib/cx'
import { useSite } from '../lib/site'
import { Action, Arrow, Container, Cross } from './ui'

const links = [
  { to: '/work', label: 'Weddings', index: '01' },
  { to: '/about', label: 'About', index: '02' },
  { to: '/contact', label: 'Contact', index: '03' },
]

function Wordmark({ tone }: { tone: 'dark' | 'light' }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={cx('font-serif text-[26px] tracking-[-0.01em]', tone === 'dark' ? 'text-ink' : 'text-paper')}>Yugan</span>
      <span className={cx('mt-1 font-mono text-[8px] uppercase tracking-[0.26em]', tone === 'dark' ? 'text-muted' : 'text-paper/60')}>
        Photography · Salem
      </span>
    </span>
  )
}

export function Header() {
  const { site } = useSite()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  const overHero = pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenu(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menu])

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500',
          scrolled || !overHero
            ? 'border-b border-line bg-paper/92 py-3 backdrop-blur-md'
            : 'border-b border-transparent bg-gradient-to-b from-black/45 to-transparent py-5',
        )}
      >
        <Container className="flex items-center justify-between gap-6">
          <Link to="/" aria-label={`${site.brand} home`} className="relative z-10">
            <Wordmark tone={overHero ? 'light' : 'dark'} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'group relative flex items-baseline gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors',
                    overHero ? 'text-paper/80 hover:text-paper' : 'text-muted hover:text-ink',
                    isActive && (overHero ? 'text-paper' : 'text-ink'),
                  )
                }
              >
                <span className="text-[8px] text-brick">{l.index}</span>
                {l.label}
                <span
                  className={cx(
                    'absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100',
                    overHero ? 'bg-paper' : 'bg-ink',
                  )}
                />
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Action
              to="/contact"
              variant={overHero ? 'light' : 'solid'}
              className="hidden sm:inline-flex"
              arrow
            >
              Check my date
            </Action>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className={cx(
                'flex items-center gap-2 rounded-pill border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors md:hidden',
                overHero ? 'border-paper/40 text-paper' : 'border-ink/20 text-ink',
              )}
            >
              Menu
              <span className="flex flex-col gap-1">
                <span className={cx('h-px w-3.5', overHero ? 'bg-paper' : 'bg-ink')} />
                <span className={cx('h-px w-3.5', overHero ? 'bg-paper' : 'bg-ink')} />
              </span>
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-paper px-5 pb-8 pt-5 sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <Wordmark tone="dark" />
              <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-full border border-ink/20">
                <Cross />
              </button>
            </div>
            <nav aria-label="Menu" className="mt-14 flex flex-col border-t border-line">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line"
                >
                  <Link to={l.to} className="flex items-baseline justify-between py-6">
                    <span className="display text-[13vw] leading-none">{l.label}</span>
                    <span className="eyebrow text-brick">{l.index}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-10">
              <a href={`mailto:${site.contact.email}`} className="block text-[15px] rule-link">
                {site.contact.email}
              </a>
              <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="block text-[15px] text-muted">
                {site.contact.phone}
              </a>
              <p className="eyebrow pt-3 text-faint">{site.contact.address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const width = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return <motion.div className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-brick" style={{ scaleX: width }} aria-hidden="true" />
}

/** A ring that follows the pointer and grows into a "View" chip over photographs. */
export function Cursor() {
  const [fine, setFine] = useState(false)
  const [view, setView] = useState(false)
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.4 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return
    setFine(true)
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = e.target as Element | null
      setView(!!el?.closest?.('[data-cursor="view"]'))
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  if (!fine) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="grid place-items-center rounded-full border backdrop-blur-[1px]"
        animate={{
          width: view ? 78 : 11,
          height: view ? 78 : 11,
          backgroundColor: view ? 'rgba(242,239,233,0.94)' : 'rgba(164,73,43,0.95)',
          borderColor: 'rgba(242,239,233,0)',
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink"
          animate={{ opacity: view ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          View
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

export function Footer() {
  const { site } = useSite()
  const year = new Date().getFullYear()
  return (
    <footer className="grain bg-night text-night-text">
      <Container className="pt-16 sm:pt-24">
        <div className="flex flex-col gap-10 border-b border-night-line pb-12 lg:flex-row lg:justify-between">
          <p className="display max-w-[14ch] text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.9]">
            Let’s photograph
            <br />
            the <em className="italic text-brick">build.</em>
          </p>
          <div className="flex flex-col gap-3 lg:items-end">
            <a href={`mailto:${site.contact.email}`} className="rule-link text-[clamp(1rem,2vw,1.35rem)]">
              {site.contact.email}
            </a>
            <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="text-[15px] text-night-muted transition-colors hover:text-paper">
              {site.contact.phone}
            </a>
            <a
              href={`https://instagram.com/${site.contact.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[15px] text-night-muted transition-colors hover:text-paper"
            >
              @{site.contact.instagram}
              <Arrow size={11} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          <div>
            <p className="eyebrow mb-4 text-night-muted">Sitemap</p>
            <ul className="space-y-2 text-[14px]">
              {[{ to: '/', label: 'Home' }, ...links.map((l) => ({ to: l.to, label: l.label }))].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-paper/80 transition-colors hover:text-brick">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-night-muted">Studio</p>
            <p className="max-w-[22ch] text-[14px] leading-relaxed text-paper/80">{site.contact.address}</p>
            <p className="mt-3 text-[13px] text-night-muted">{site.contact.hours}</p>
          </div>
          <div>
            <p className="eyebrow mb-4 text-night-muted">Booking</p>
            <p className="max-w-[24ch] text-[14px] leading-relaxed text-paper/80">{site.hero.note}</p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-2 text-[13px] text-brick">
              Start a brief <Arrow size={11} />
            </Link>
          </div>
          <div>
            <p className="eyebrow mb-4 text-night-muted">Photography</p>
            <p className="text-[14px] text-paper/80">{site.photographer}</p>
            <p className="mt-1 text-[13px] text-night-muted">Weddings · Receptions</p>
          </div>
        </div>

        <div className="overflow-hidden border-t border-night-line pt-8">
          <p className="display select-none text-[clamp(3.4rem,15vw,13rem)] leading-[0.8] text-paper/90">
            Yugan<em className="italic text-brick">.</em>
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-night-line py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-night-muted sm:flex-row sm:justify-between">
          <span>© {year} {site.brand}</span>
          <span>Photographed &amp; built in Salem, Tamil Nadu</span>
        </div>
      </Container>
    </footer>
  )
}
