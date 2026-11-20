import { motion, useInView, useMotionValue, useSpring, animate } from 'motion/react'
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'

import { cx } from '../lib/cx'

/* ---------------------------------------------------------------- icons ---
   Drawn here rather than pulled from an icon pack: four shapes, no bundle. */

export function Arrow({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" className={className}>
      <path d="M4 12 12 4M12 4H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
    </svg>
  )
}

export function ArrowDown({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" className={className}>
      <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
    </svg>
  )
}

export function Chevron({ dir = 'right', className }: { dir?: 'left' | 'right'; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" className={className}>
      <path
        d={dir === 'right' ? 'M6 3.5 10.5 8 6 12.5' : 'M10 3.5 5.5 8 10 12.5'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  )
}

export function Cross({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" className={className}>
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
    </svg>
  )
}

/* ------------------------------------------------------------- structure --- */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12', className)}>{children}</div>
}

export function Label({ children, className, tone = 'muted' }: { children: ReactNode; className?: string; tone?: 'muted' | 'brick' | 'light' }) {
  return (
    <span
      className={cx(
        'eyebrow inline-flex items-center gap-2',
        tone === 'muted' && 'text-muted',
        tone === 'brick' && 'text-brick',
        tone === 'light' && 'text-night-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** A numbered section head: index on the left, title, optional note on the right. */
export function SectionHead({
  index,
  title,
  note,
  action,
  tone = 'dark',
  className,
}: {
  index: string
  title: string
  note?: string
  action?: ReactNode
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-6 border-t pt-5 sm:flex-row sm:items-baseline sm:justify-between', tone === 'dark' ? 'border-line' : 'border-night-line', className)}>
      <div className="flex items-baseline gap-5 sm:gap-8">
        <span className={cx('eyebrow shrink-0', tone === 'dark' ? 'text-brick' : 'text-brick')}>{index}</span>
        <h2 className={cx('display text-[clamp(2rem,4.6vw,3.9rem)]', tone === 'dark' ? 'text-ink' : 'text-night-text')}>{title}</h2>
      </div>
      <div className="flex items-baseline gap-6 sm:justify-end">
        {note && <p className={cx('max-w-[34ch] text-[14px] leading-relaxed', tone === 'dark' ? 'text-muted' : 'text-night-muted')}>{note}</p>}
        {action}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- controls --- */

type ActionVariant = 'solid' | 'outline' | 'light' | 'paper' | 'bare'

const actionClass: Record<ActionVariant, string> = {
  solid: 'bg-ink text-paper hover:bg-brick',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper',
  light: 'border border-paper/30 text-paper hover:bg-paper hover:text-ink',
  paper: 'border border-paper/30 bg-paper text-ink hover:border-brick hover:bg-brick hover:text-paper',
  bare: 'text-ink hover:text-brick',
}

type ActionProps = {
  children: ReactNode
  variant?: ActionVariant
  to?: string
  href?: string
  arrow?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
}

/** One button shape for links, anchors and buttons, with an optional arrow. */
export function Action({ children, variant = 'solid', to, href, arrow, className, onClick, type = 'button', disabled, title }: ActionProps) {
  const classes = cx(
    'group inline-flex items-center justify-center gap-3 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300',
    variant !== 'bare' && 'rounded-pill',
    variant === 'bare' && 'px-0 py-0',
    actionClass[variant],
    disabled && 'pointer-events-none opacity-50',
    className,
  )
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1" />}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} title={title}>
        {inner}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" onClick={onClick} title={title}>
        {inner}
      </a>
    )
  }
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} title={title}>
      {inner}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  className,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex size-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-pill border px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300',
        active ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-muted hover:border-ink/60 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- motion --- */

/** Fades and lifts a block into view once. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Reveals a line by sliding it up from behind a mask. */
export function MaskLine({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={cx('block overflow-hidden', className)}>
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Counts a number up the first time it is seen. */
export function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const mv = useMotionValue(0)
  const smooth = useSpring(mv, { stiffness: 60, damping: 18 })
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, mv, value])

  useEffect(() => smooth.on('change', (v) => setShown(Math.round(v))), [smooth])

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
      {suffix}
    </span>
  )
}

/* -------------------------------------------------------------- furniture --- */

export function Marquee({ items, tone = 'dark', slow = false }: { items: string[]; tone?: 'dark' | 'light'; slow?: boolean }) {
  const row = [...items, ...items]
  return (
    <div className={cx('relative flex overflow-hidden border-y py-5', tone === 'dark' ? 'border-line' : 'border-night-line')}>
      <div className={cx('flex w-max shrink-0 items-center gap-10 pr-10', slow ? 'animate-marquee-slow' : 'animate-marquee')}>
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            <span className={cx('font-mono text-[11px] uppercase tracking-[0.2em]', tone === 'dark' ? 'text-muted' : 'text-night-muted')}>{item}</span>
            <span className={cx('size-1 rounded-full', tone === 'dark' ? 'bg-brick' : 'bg-brick')} />
          </span>
        ))}
      </div>
    </div>
  )
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-baseline justify-between gap-6 py-6 text-left"
            >
              <span className="flex items-baseline gap-5">
                <span className="eyebrow text-brick">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[17px] leading-snug text-ink sm:text-[19px]">{item.q}</span>
              </span>
              <span className={cx('relative mt-2 grid size-4 shrink-0 place-items-center transition-transform duration-500', isOpen && 'rotate-45')}>
                <span className="absolute h-px w-4 bg-ink" />
                <span className="absolute h-4 w-px bg-ink" />
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="max-w-[62ch] pb-7 pl-0 text-[15px] leading-[1.75] text-muted sm:pl-11">{item.a}</p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ forms --- */

export function Field({
  label,
  error,
  children,
  hint,
  className,
}: {
  label: string
  error?: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label className={cx('block', className)}>
      <span className="eyebrow mb-2.5 flex items-baseline justify-between text-muted">
        <span>{label}</span>
        {hint && <span className="text-faint normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-2 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-danger">{error}</span>}
    </label>
  )
}

const inputBase =
  'w-full border-0 border-b border-line bg-transparent px-0 py-3 text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-faint/70 focus:border-ink'

export function Input(props: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; name?: string; autoComplete?: string }) {
  return (
    <input
      {...props}
      onChange={(e) => props.onChange(e.target.value)}
      className={inputBase}
    />
  )
}

export function TextArea({ value, onChange, placeholder, rows = 5, name }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; name?: string }) {
  return <textarea name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cx(inputBase, 'resize-none')} />
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputBase, 'appearance-none pr-6')}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-3 text-muted">
      <span className="size-4 animate-spin rounded-full border border-line border-t-ink" />
      <span className="eyebrow">{label}</span>
    </span>
  )
}

/* ----------------------------------------------------------- admin extras --- */

export function AdminButton({
  children,
  onClick,
  tone = 'quiet',
  className,
  type = 'button',
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'solid' | 'quiet' | 'danger'; children: ReactNode }) {
  return (
    <button
      {...rest}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-pill px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40',
        tone === 'solid' && 'bg-ink text-paper hover:bg-brick',
        tone === 'quiet' && 'border border-ink/20 text-ink hover:border-ink',
        tone === 'danger' && 'border border-danger/30 text-danger hover:bg-danger hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  )
}
