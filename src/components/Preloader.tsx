import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { useSite } from '../lib/site'

/** A one-off opening curtain: the wordmark, a counter, then the site. */
export function Preloader() {
  const { site } = useSite()
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true
    return sessionStorage.getItem('yp-intro') === '1'
  })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (done) return
    const finish = () => {
      sessionStorage.setItem('yp-intro', '1')
      setDone(true)
    }
    // rAF is paused in background tabs, so the curtain also has a hard stop.
    const failsafe = window.setTimeout(finish, 2400)
    const started = performance.now()
    const duration = 1100
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / duration)
      setCount(Math.round(p * 100))
      if (p < 1) frame = requestAnimationFrame(tick)
      else window.setTimeout(finish, 260)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(failsafe)
    }
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-night px-5 py-6 text-night-text sm:px-8 lg:px-12"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-night-muted">Yugan Photography</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-night-muted">Salem · TN</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="display max-w-[16ch] text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.9]">
              Your day,
              <br />
              <em className="italic text-brick">held in light.</em>
            </p>
            <span className="font-mono text-[clamp(1rem,2vw,1.4rem)] tabular-nums text-night-muted">{String(count).padStart(3, '0')}</span>
          </div>
          <div className="h-px w-full bg-night-line">
            <div className="h-px bg-paper transition-[width] duration-100" style={{ width: `${count}%` }} />
          </div>
          <span className="sr-only">{site.brand}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
