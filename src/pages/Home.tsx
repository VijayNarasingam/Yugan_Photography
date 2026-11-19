import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import { ProjectCard } from '../components/Gallery'
import { Action, Arrow, ArrowDown, Chevron, Container, Counter, Label, Marquee, MaskLine, Reveal, SectionHead } from '../components/ui'
import { clients, process, services, stats, testimonials } from '../content'
import { cx } from '../lib/cx'
import { useSite } from '../lib/site'
import { useTitle } from '../lib/title'

export function Home() {
  const { site } = useSite()
  useTitle()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const contentFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const featured = site.projects.filter((p) => p.featured).slice(0, 6)
  const rail = site.projects.slice(0, 9)
  const railRef = useRef<HTMLDivElement>(null)

  const [quote, setQuote] = useState(0)
  const t = testimonials[quote]

  const railScroll = (dir: number) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.7, 720), behavior: 'smooth' })
  }

  return (
    <>
      {/* ---------------------------------------------------------- hero --- */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-night">
        <motion.div className="absolute inset-0" style={{ y: imageY }}>
          <img
            src={site.hero.image}
            alt={site.hero.alt}
            fetchPriority="high"
            className="size-full scale-[1.06] object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/75" />
        <div className="grain absolute inset-0" />

        <motion.div style={{ y: contentY, opacity: contentFade }} className="relative flex h-full flex-col">
          <Container className="flex h-full flex-col justify-end pb-8 pt-28 sm:pb-10">
            <div className="max-w-[62rem]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.15 }}
                className="mb-6 flex items-center gap-3"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-brick" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/75">{site.hero.eyebrow}</span>
              </motion.div>

              <h1 className="display text-[clamp(3rem,10.5vw,8.6rem)] text-paper">
                <MaskLine delay={0.2}>{site.hero.lineOne}</MaskLine>
                <MaskLine delay={0.34}>
                  <em className="italic">{site.hero.lineTwo}</em>
                </MaskLine>
              </h1>

              <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.6 }}
                  className="max-w-[46ch] text-[15px] leading-[1.7] text-paper/80"
                >
                  {site.hero.sub}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.72 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Action to="/work" variant="light" className="bg-paper text-ink hover:bg-brick hover:text-paper" arrow>
                    See the weddings
                  </Action>
                  <Action to="/contact" variant="light" className="border-paper/40">
                    Check my date
                  </Action>
                </motion.div>
              </div>
            </div>

            <div className="mt-10 flex items-end justify-between gap-6 border-t border-paper/20 pt-5">
              <div className="flex flex-col gap-1.5">
                <Label tone="light" className="text-paper/50">Now</Label>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/80">{site.hero.note}</p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Label tone="light" className="mr-2 text-paper/50">Scroll</Label>
                <span className="relative block h-10 w-px overflow-hidden bg-paper/25">
                  <span className="absolute inset-0 block animate-scroll-cue bg-paper" />
                </span>
                <ArrowDown className="text-paper/70" />
              </div>
              <div className="hidden text-right md:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/50">11.66° N · 78.15° E</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/80">Salem · Tamil Nadu</p>
              </div>
            </div>
          </Container>
        </motion.div>

        <span className="absolute left-4 top-1/2 hidden -translate-y-1/2 -rotate-90 font-mono text-[9px] uppercase tracking-[0.3em] text-paper/40 lg:block">
          Wedding photography since 2017
        </span>
      </section>

      <Marquee
        items={['Muhurtham', 'Reception', 'Engagement', 'Pre-wedding', 'Haldi', 'Mehendi', 'Destination', 'Albums']}
      />

      {/* ---------------------------------------------------- manifesto --- */}
      <Container className="py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <div className="relative aspect-[4/5] max-w-[22rem] overflow-hidden bg-paper-2">
                <img src={site.about.portrait} alt={site.photographer} className="size-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-4">
                  <p className="text-[15px] text-paper">{site.photographer}</p>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/70">Photographer · Founder</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="mt-6 max-w-[22rem]">
              <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-muted">
                Fairlands, Salem · Working across Tamil Nadu, Bengaluru and Puducherry
              </p>
              <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-[13px] text-ink rule-link">
                Read the full story <Arrow size={12} />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-8 lg:pl-8">
            <Reveal>
              <Label className="text-brick">01 — The practice</Label>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="display mt-6 text-[clamp(1.75rem,3.7vw,3.15rem)] leading-[1.14] text-ink">
                {site.about.standfirst}
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-8 max-w-[58ch] text-[15.5px] leading-[1.8] text-muted">
                Nine years of photographing weddings has taught me one thing: the day is already happening. The job is to
                stand in the right place, stay out of the ceremony, and catch the two minutes everyone will talk about
                afterwards.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.05}>
                  <p className="display text-[clamp(2.2rem,4vw,3.4rem)] text-ink">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 max-w-[14ch] font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
                    {s.label}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* -------------------------------------------------- selected work --- */}
      <Container className="pb-20 sm:pb-28">
        <SectionHead
          index="02"
          title="Recent weddings"
          note="Muhurthams, receptions and one three-day destination week, photographed between 2024 and 2026."
          action={
            <Link to="/work" className="inline-flex items-center gap-2 whitespace-nowrap text-[12.5px] rule-link">
              All work <span className="text-muted">({site.projects.length})</span>
            </Link>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-12">
          {featured[0] && (
            <Reveal className="md:col-span-7">
              <ProjectCard project={featured[0]} index={0} aspect="aspect-[5/4]" />
            </Reveal>
          )}
          {featured[1] && (
            <Reveal className="md:col-span-5 md:mt-20" delay={0.06}>
              <ProjectCard project={featured[1]} index={1} aspect="aspect-[3/4]" />
            </Reveal>
          )}
          {featured[2] && (
            <Reveal className="md:col-span-4 md:mt-4">
              <ProjectCard project={featured[2]} index={2} aspect="aspect-[4/5]" />
            </Reveal>
          )}
          {featured[3] && (
            <Reveal className="md:col-span-4 md:mt-24" delay={0.06}>
              <ProjectCard project={featured[3]} index={3} aspect="aspect-[4/5]" />
            </Reveal>
          )}
          {featured[4] && (
            <Reveal className="md:col-span-4 md:mt-8" delay={0.12}>
              <ProjectCard project={featured[4]} index={4} aspect="aspect-[4/5]" />
            </Reveal>
          )}
        </div>
      </Container>

      {/* ---------------------------------------------------- frames rail --- */}
      <section className="border-y border-line bg-paper-2/50 py-14">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <Label className="text-brick">03 — Outtakes</Label>
              <h2 className="display mt-3 text-[clamp(1.8rem,3.6vw,2.9rem)]">Latest frames</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => railScroll(-1)} aria-label="Scroll frames left" className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper">
                <Chevron dir="left" />
              </button>
              <button type="button" onClick={() => railScroll(1)} aria-label="Scroll frames right" className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper">
                <Chevron />
              </button>
            </div>
          </div>
        </Container>
        <div ref={railRef} className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8 lg:px-12">
          {rail.map((p, i) => (
            <Link
              key={p.id}
              to={`/work/${p.slug}`}
              data-cursor="view"
              className="group relative w-[76vw] shrink-0 snap-start overflow-hidden bg-paper-3 sm:w-[46vw] lg:w-[27vw]"
            >
              <img
                src={p.cover}
                alt={p.images[0]?.caption ?? p.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-[1.3s] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/60">{String(i + 1).padStart(2, '0')}</p>
                  <p className="mt-1 text-[15px] text-paper">{p.title}</p>
                </div>
                <Arrow className="text-paper" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- services --- */}
      <Container className="py-20 sm:py-28">
        <SectionHead index="04" title="What I cover" note="Six ways families book the studio. Every one includes the edited gallery and a shareable link for relatives." />
        <div className="mt-10 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.05} className="bg-paper">
              <div className="group relative h-full overflow-hidden p-6 sm:p-7">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                  <img src={s.image} alt="" className="size-full scale-105 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-night/78" />
                </div>
                <div className="relative">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-brick transition-colors group-hover:text-brick">{String(i + 1).padStart(2, '0')}</span>
                    <Arrow className="text-ink transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" />
                  </div>
                  <h3 className="mt-10 text-[21px] leading-tight text-ink transition-colors duration-500 group-hover:text-paper">{s.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-[14px] leading-[1.65] text-muted transition-colors duration-500 group-hover:text-paper/75">
                    {s.text}
                  </p>
                  <span className="mt-8 inline-block h-px w-8 bg-ink/30 transition-colors group-hover:bg-paper/40" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* --------------------------------------------------------- process --- */}
      <section className="grain bg-night py-20 text-night-text sm:py-28">
        <Container>
          <div className="flex flex-col gap-6 border-t border-night-line pt-5 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex items-baseline gap-6">
              <span className="eyebrow text-brick">05</span>
              <h2 className="display text-[clamp(2rem,4.6vw,3.8rem)]">How a wedding runs</h2>
            </div>
            <p className="max-w-[34ch] text-[14px] leading-relaxed text-night-muted">
              Four steps, one page of paperwork, no surprises on the invoice.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.07}>
                <div className="border-t border-night-line pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-brick">{p.step}</span>
                    {i < process.length - 1 && <span className="hidden h-px w-8 bg-night-line lg:block" />}
                  </div>
                  <h3 className="mt-6 text-[20px] text-night-text">{p.title}</h3>
                  <p className="mt-3 max-w-[30ch] text-[14px] leading-[1.7] text-night-muted">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- testimonial --- */}
      <Container className="py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Label className="text-brick">06 — Word of mouth</Label>
            <p className="mt-6 max-w-[20ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              Couples, their parents, and one very organised wedding planner.
            </p>
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => setQuote((q) => (q - 1 + testimonials.length) % testimonials.length)}
                className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => setQuote((q) => (q + 1) % testimonials.length)}
                className="grid size-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper"
              >
                <Chevron />
              </button>
            </div>
          </div>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.figure
                key={quote}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <blockquote className="display text-[clamp(1.6rem,3.6vw,3rem)] leading-[1.16] text-ink">
                  <span className="text-brick">“</span>
                  {t.quote}
                  <span className="text-brick">”</span>
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-5">
                  <span className="text-[14px] text-ink">{t.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{t.role}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-faint">
                    {String(quote + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
      </Container>

      {/* -------------------------------------------------------- clients --- */}
      <div className="border-t border-line">
        <Container className="py-8">
          <Label className="text-faint">Venues &amp; vendors we work with</Label>
        </Container>
        <Marquee items={clients} slow />
      </div>

      {/* ------------------------------------------------------------ cta --- */}
      <Container className="py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-10 border-t border-line pt-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className={cx('display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[0.94] text-ink')}>
              Have a date
              <br />
              in <em className="italic text-brick">mind?</em>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-8">
            <p className="max-w-[38ch] text-[15px] leading-[1.75] text-muted">
              Send the date, the venue and how many functions. You will get a fixed quote, a shot list and the time I plan
              to arrive at the getting-ready room.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action to="/contact" arrow>
                Check my date
              </Action>
              <Action href={`mailto:${site.contact.email}`} variant="outline">
                {site.contact.email}
              </Action>
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-faint">
              {site.hero.note} · {site.contact.hours}
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}
