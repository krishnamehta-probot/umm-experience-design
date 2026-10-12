import { useLayoutEffect, useRef } from 'react'
import '@/styles/ai-apps.css'
import { AiHead } from './AiHead'
import { FlyArrow } from '@/components/primitives'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { applications, type AppDemo, type AppItem } from '@/content/aiAutomation'

export type AppsContent = typeof applications

/** Off-site links open in a new tab; links within the page stay put. */
const offSite = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

/* ============================================================================
   3 · AI IN PRACTICE — three small applications, each shown working

   Each application is a card with a vignette on top: a little picture of the
   thing working, drawn in plain shapes rather than screenshots, so it reads
   as the work and not as a product ad. A knowledge assistant answers a
   question from an approved source; a document workflow reads a form and
   checks it against its reference; a decision view shows the one reading
   that needs a human to look.

   Each vignette plays once when its card scrolls into view, and on a
   device with a pointer the visitor can replay it by moving onto the card.
   The text under it rises in, staggered across the row. Reduced motion:
   nothing moves, and every vignette sits in its finished state.

   The vignette is aria-hidden; the card's own words carry the meaning.
   ========================================================================== */

/* ---- vignettes (pure DOM and inline SVG) --------------------------------- */

function Assistant({ demo }: { demo: AppDemo }) {
  const question = demo.question ?? ''
  return (
    <>
      <div className="ai-app__bubble">
        <span className="ai-app__dot" />
        <span className="ai-app__q">
          <span className="ai-app__ghost" aria-hidden="true">
            {question}
          </span>
          {/* written in full so a still (the film's last frame) reads; the
              typing timeline clears it before it types */}
          <span className="ai-app__typed" aria-hidden="true">
            {question}
          </span>
        </span>
        <span className="ai-app__sr">{question}</span>
      </div>
      <div className="ai-app__answer">
        <span className="ai-app__sk" style={{ width: '92%' }} />
        <span className="ai-app__sk" style={{ width: '78%' }} />
        <span className="ai-app__sk" style={{ width: '55%' }} />
        <span className="ai-app__src">{`↳ ${demo.source ?? ''}`}</span>
      </div>
    </>
  )
}

function Document({ demo }: { demo: AppDemo }) {
  const checks = demo.checks ?? []
  return (
    <>
      <div className="ai-app__docrow">
        <div className="ai-app__doc">
          <svg className="ai-app__page" viewBox="0 0 64 80" aria-hidden="true">
            <path d="M6 4h36l16 16v56H6z" />
            <path d="M42 4v16h16" />
            <path d="M16 38h32M16 48h32M16 58h20M16 68h28" />
          </svg>
          <span className="ai-app__scan" />
        </div>
        <span className="ai-app__arrow">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </span>
        <div className="ai-app__panel">
          {checks.map((c) => (
            <div className="ai-app__row" key={c.label}>
              <span className="ai-app__key">{c.label}</span>
              <span className="ai-app__val">
                {c.value}
                <svg className="ai-app__tick" viewBox="0 0 12 12" aria-hidden="true">
                  <path pathLength={1} d="M2 6.5 5 9.5 10 3" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
      {demo.note ? <span className="ai-app__note">{demo.note}</span> : null}
    </>
  )
}

/* Seven columns: five settled, two forecast. The fourth settled column is
   the one that stands apart, so its marker sits at the chart's centre. */
const SOLID = [34, 46, 40, 70, 64]
const FORECAST = [84, 92]

function Decision({ demo }: { demo: AppDemo }) {
  return (
    <>
      <div className="ai-app__chart">
        {SOLID.map((h, i) => (
          <span className="ai-app__col" key={`s${i}`}>
            <span className="ai-app__bar" style={{ height: `${h}%` }} />
          </span>
        ))}
        {FORECAST.map((h, i) => (
          <span className="ai-app__col" key={`f${i}`}>
            <span className="ai-app__bar ai-app__bar--fc" style={{ height: `${h}%` }} />
          </span>
        ))}
        <span className="ai-app__mark">
          <span className="ai-app__ring" />
        </span>
      </div>
      <div className="ai-app__lines">
        {(demo.lines ?? []).map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </>
  )
}

export function Vignette({ item }: { item: AppItem }) {
  if (item.kind === 'assistant') return <Assistant demo={item.demo} />
  if (item.kind === 'document') return <Document demo={item.demo} />
  return <Decision demo={item.demo} />
}

/* ---- timelines ----------------------------------------------------------- */

/** The assistant: the question types in, the answer rises, the lines grow,
 *  then the source chip pops. */
function buildAssistant(card: HTMLElement) {
  const typed = card.querySelector('.ai-app__typed') as HTMLElement
  const full = card.querySelector('.ai-app__sr')?.textContent ?? ''
  const answer = card.querySelector('.ai-app__answer') as HTMLElement
  const lines = gsap.utils.toArray<HTMLElement>('.ai-app__sk', card)
  const chip = card.querySelector('.ai-app__src') as HTMLElement
  const count = { n: 0 }

  typed.textContent = ''
  const tl = gsap.timeline({ paused: true })
  tl.to(count, {
    n: full.length,
    duration: full.length * 0.03,
    ease: 'none',
    onUpdate: () => {
      typed.textContent = full.slice(0, Math.round(count.n))
    },
  })
  tl.fromTo(answer, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '+=0.15')
  tl.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out', stagger: 0.12 }, '-=0.2')
  tl.fromTo(chip, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.05')
  return tl
}

/** The document: a scan bar sweeps the page twice, the arrow nudges, then
 *  each check's value and tick arrive in turn, and the note pops. */
function buildDocument(card: HTMLElement) {
  const doc = card.querySelector('.ai-app__doc') as HTMLElement
  const scan = card.querySelector('.ai-app__scan') as HTMLElement
  const arrow = card.querySelector('.ai-app__arrow') as HTMLElement
  const note = card.querySelector('.ai-app__note') as HTMLElement | null
  const rows = gsap.utils.toArray<HTMLElement>('.ai-app__row', card)
  const step = 0.45

  const tl = gsap.timeline({ paused: true })
  tl.fromTo(scan, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' }, 0)
  tl.fromTo(scan, { y: 0 }, { y: () => doc.offsetHeight - 3, duration: 0.8, ease: 'none', repeat: 1 }, 0)
  tl.to(scan, { opacity: 0, duration: 0.25, ease: 'none' })
  tl.fromTo(arrow, { x: 0 }, { x: 6, duration: 0.25, ease: 'power1.inOut', repeat: 1, yoyo: true })

  tl.addLabel('rows')
  rows.forEach((row, i) => {
    const at = `rows+=${i * step}`
    const val = row.querySelector('.ai-app__val') as HTMLElement
    const tick = row.querySelector('.ai-app__tick path') as SVGPathElement
    tl.fromTo(val, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, at)
    tl.fromTo(tick, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.out' }, at)
  })
  if (note) {
    tl.fromTo(
      note,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
      `rows+=${rows.length * step}`,
    )
  }
  return tl
}

/** The decision view: bars rise, the forecast draws in, the one marker pops
 *  and pulses twice, then the two lines fade up. */
function buildDecision(card: HTMLElement) {
  const bars = gsap.utils.toArray<HTMLElement>('.ai-app__bar:not(.ai-app__bar--fc)', card)
  const fc = gsap.utils.toArray<HTMLElement>('.ai-app__bar--fc', card)
  const mark = card.querySelector('.ai-app__mark') as HTMLElement
  const ring = card.querySelector('.ai-app__ring') as HTMLElement
  const lines = gsap.utils.toArray<HTMLElement>('.ai-app__lines p', card)

  const tl = gsap.timeline({ paused: true })
  tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
  tl.fromTo(
    fc,
    { opacity: 0, scaleY: 0.4 },
    { opacity: 1, scaleY: 1, duration: 0.6, ease: 'power2.out', stagger: 0.12 },
    '-=0.3',
  )
  tl.fromTo(mark, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' })
  tl.fromTo(
    ring,
    { scale: 1, opacity: 0.7 },
    { scale: 2.2, opacity: 0, duration: 0.9, ease: 'power2.out', repeat: 2, repeatDelay: 0.1 },
  )
  tl.fromTo(
    lines,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.15 },
    '-=0.6',
  )
  return tl
}

/* ---- component ----------------------------------------------------------- */

function AppCard({ item }: { item: AppItem }) {
  return (
    <article className="ai-app" data-umm-tone={item.tone} data-kind={item.kind}>
      <div className="ai-app__stage">
        <span className="ai-app__label">{item.label}</span>
        <div className="ai-app__vig" aria-hidden="true">
          <Vignette item={item} />
        </div>
      </div>
      <div className="ai-app__body">
        <p className="ai-app__meta">
          <span>{item.area}</span>
          <span>{item.tag}</span>
        </p>
        <h3 className="ai-app__title">{item.title}</h3>
        <p className="ai-app__text">{item.body}</p>
        <a className="ai-app__link" href={item.link.href} {...offSite(item.link.href)}>
          <span>{item.link.label}</span>
          <FlyArrow size={14} strokeWidth={2} />
        </a>
      </div>
    </article>
  )
}

export function AiApplications({ content = applications }: { content?: AppsContent }) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const cards = gsap.utils.toArray<HTMLElement>('.ai-app', root)

    if (prefersReducedMotion()) {
      // Nothing moves: the question is shown whole, every vignette in its final state.
      root.querySelectorAll<HTMLElement>('.ai-app__typed').forEach((t) => {
        t.textContent = t.closest('.ai-app__bubble')?.querySelector('.ai-app__sr')?.textContent ?? ''
      })
      return
    }

    const hover = window.matchMedia('(hover: hover)').matches
    const cleanups: (() => void)[] = []

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const body = card.querySelector('.ai-app__body') as HTMLElement
        const kind = card.dataset.kind
        const tl =
          kind === 'assistant' ? buildAssistant(card) : kind === 'document' ? buildDocument(card) : buildDecision(card)
        const delay = (i % 3) * 0.15
        const restart = () => tl.restart()

        gsap.set(body, { y: 24, opacity: 0 })
        ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(body, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay })
            gsap.delayedCall(delay, restart)
          },
        })

        if (hover) {
          card.addEventListener('pointerenter', restart)
          cleanups.push(() => card.removeEventListener('pointerenter', restart))
        }
      })
    }, root)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <section className="umm-section ai-apps" id="applications" ref={ref}>
      <div className="umm-container">
        <AiHead
          chip={content.chip}
          line1={content.line1}
          tone="sky"
          lineRecipe={2}
          line2={content.line2}
          accent={content.accent}
          lead={content.lead}
        />

        <div className="ai-apps__grid">
          {content.items.map((item) => (
            <AppCard key={item.label} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
