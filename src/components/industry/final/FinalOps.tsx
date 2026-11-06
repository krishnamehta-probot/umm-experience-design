import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { FlyArrow } from '@/components/primitives'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { measurePeel, peelFrame, sheetPath, type PeelGeometry } from '@/lib/cornerPeel'
import { hero, operations } from '@/content/fintech'
import { services as cx } from '@/content/cxUiDesign'
import { OpsArt, type OpsScene } from './OpsArt'
import { OpsLine } from './OpsLine'
import { Arrow, CoolIcon, pad, type IconName } from '../glass/kit'
import '@/styles/fin-final-ops.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 04 · BEYOND THE TRANSACTION (Krish, 6 Nov: "next
   one is again cards this time try to take inspiration from services cards")

   The service pages' cards (ServicesV2), for the three operations:

     top     the eyebrow and heading on the left (its second line in blue),
             the intro on the right, as in the sections above
     cards   one pastel card each, with the service card's bitten corner and
             black button. The front: its number and name, the title, the
             text, and a scene drawn the service-card way (OpsArt), always
             quietly at work. The button peels the card back from its corner
             (lib/cornerPeel.ts, as on the service pages) to the three points,
             ticking themselves off, and a way to talk; pressing again lays
             the sheet back down

   The scenes are drawn in fine line by default (OpsLine, after line Lottie
   animations: Krish found the first drawing "too thick lined"). Kept as
   options: ?ops=bold (that first drawing, OpsArt) and ?ops=panel (Panel's
   cards from his screenshot: a big pastel Cool Shape in each, the glass
   foot opening to the text and points under the pointer).

   The cards come in as the service cards do: up, slightly turned, settling.
   The hint and the list's label are the service cards' own words; the copy
   is the final copy.
   ========================================================================== */

type Card = (typeof operations.cards)[number]
type Side = 'front' | 'back'

const SCENES: OpsScene[] = ['support', 'revops', 'aiops']
const OPS_ICON: IconName[] = ['media', 'real-estate', 'healthtech']

type Look = 'line' | 'bold' | 'panel'
const look: Look = (() => {
  const v = new URLSearchParams(window.location.search).get('ops')
  return v === 'bold' || v === 'panel' ? v : 'line'
})()

/* each card's scene picks up two of the other pastels */
const ACCENTS: Record<string, [string, string]> = {
  sky: ['var(--umm-sun)', 'var(--umm-blossom)'],
  citrus: ['var(--umm-sky)', 'var(--umm-blossom)'],
  blossom: ['var(--umm-sky)', 'var(--umm-citrus)'],
}

/* how far short of flat the flap is held mid-turn (as the service cards) */
const lift = (p: number) => 44 * Math.sin(Math.PI * p)

export function FinalOps() {
  const c = operations
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || look === 'panel') return
    const ctx = gsap.context(() => {
      gsap.from('.fo-card', {
        opacity: 0,
        y: 60,
        rotate: (i: number) => [-4, 3, -2][i % 3],
        duration: 0.9,
        stagger: 0.08,
        ease: 'back.out(1.3)',
        scrollTrigger: { trigger: '.fo__grid', start: 'top 80%', once: true },
      })
      gsap.from('.fo-card .cx-svc__flip', {
        scale: 0,
        rotate: -90,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2.4)',
        delay: 0.5,
        clearProps: 'transform',
        scrollTrigger: { trigger: '.fo__grid', start: 'top 80%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id={c.id} className="fo" aria-labelledby="fo-title" ref={ref}>
      <div className="fr__top" data-umm-reveal>
        <div className="fr__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fo-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
        </div>
        <p className="fr__lead">{c.head.intro}</p>
      </div>

      {look === 'panel' ? (
        <PanelCards />
      ) : (
        <ul className="fo__grid">
          {c.cards.map((card, k) => (
            <OpsCard key={card.title} card={card} index={k} />
          ))}
        </ul>
      )}
    </section>
  )
}

function OpsCard({ card, index }: { card: Card; index: number }) {
  const backId = useId()
  const [side, setSide] = useState<Side>('front')
  const [busy, setBusy] = useState(false)

  const li = useRef<HTMLLIElement>(null)
  const bite = useRef<HTMLSpanElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const sheets = useRef<HTMLDivElement[]>([])
  const flap = useRef<HTMLDivElement>(null)
  const flapPaper = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLSpanElement>(null)

  const geom = useRef<PeelGeometry | null>(null)
  const target = useRef<Side>('front')
  const state = useRef({ p: 0 })
  const tween = useRef<gsap.core.Tween | null>(null)

  const sheet = (i: number) => (el: HTMLDivElement | null) => {
    if (el) sheets.current[i] = el
  }

  const paint = useCallback((p: number) => {
    const g = geom.current
    if (!g || !front.current || !flap.current || !flapPaper.current || !shade.current) return
    const f = peelFrame(g, p, lift(p))
    front.current.style.clipPath = f.rest
    flapPaper.current.style.clipPath = f.lifted
    flap.current.style.transform = f.turn
    flapPaper.current.style.backgroundImage = `linear-gradient(${g.angle}deg, var(--peel-tip) 0px, var(--peel-mid) ${f.d * 0.66}px, var(--peel-fold) ${f.d}px)`
    const dark = 0.18 * Math.min(1, (1 - p) * 4)
    shade.current.style.backgroundImage = `linear-gradient(${g.angle}deg, transparent ${Math.max(0, f.d - 90)}px, rgb(16 14 20 / ${dark.toFixed(3)}) ${f.d}px)`
  }, [])

  const clear = useCallback(() => {
    for (const el of [front.current, flap.current, flapPaper.current, shade.current]) {
      el?.removeAttribute('style')
    }
  }, [])

  /* measure the outline (the bite is a real cut-out) and keep it fitted */
  useLayoutEffect(() => {
    const el = li.current
    if (!el) return
    const draw = () => {
      const first = sheets.current[0]
      if (!first || !bite.current) return
      const radius = parseFloat(getComputedStyle(first).borderTopLeftRadius) || 24
      const g = measurePeel(el.offsetWidth, el.offsetHeight, radius, bite.current.offsetWidth)
      geom.current = g
      const outline = `path("${sheetPath(g)}")`
      for (const s of sheets.current) s.style.clipPath = outline
      if (tween.current?.isActive()) paint(state.current.p)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [paint])

  useEffect(() => () => void tween.current?.kill(), [])

  const turn = useCallback(() => {
    const next: Side = target.current === 'front' ? 'back' : 'front'
    target.current = next
    setSide(next)

    if (prefersReducedMotion()) {
      tween.current?.kill()
      tween.current = null
      state.current.p = next === 'back' ? 1 : 0
      clear()
      setBusy(false)
      return
    }

    paint(state.current.p)
    setBusy(true)
    if (!tween.current) {
      const from = state.current.p
      tween.current = gsap.fromTo(
        state.current,
        { p: 0 },
        {
          p: 1,
          duration: 0.95,
          ease: 'power1.in',
          paused: true,
          onUpdate: () => paint(state.current.p),
          onComplete: () => setBusy(false),
          onReverseComplete: () => {
            setBusy(false)
            clear()
          },
        },
      )
      tween.current.progress(from, true)
    }
    if (next === 'back') tween.current.play()
    else tween.current.reverse()
  }, [paint, clear])

  const number = String(index + 1).padStart(2, '0')
  const showsBack = side === 'back'
  const [a, b] = ACCENTS[card.tone] ?? ACCENTS.sky

  return (
    <li
      className="cx-svc fo-card"
      data-umm-tone={card.tone}
      data-side={side}
      data-busy={busy || undefined}
      ref={li}
      style={{ '--fo-a': a, '--fo-b': b } as CSSProperties}
    >
      {/* underneath: the points */}
      <div className="cx-svc__sheet cx-svc__sheet--back" id={backId} ref={sheet(0)} inert={!showsBack}>
        <span className="cx-svc__shade" ref={shade} aria-hidden="true" />
        <span className="cx-svc__index">
          {number} — {card.eyebrow}
        </span>
        <p className="fo-card__name">{card.title}</p>
        <div className="cx-svc__inc">
          <p className="cx-svc__label">{cx.includesLabel}</p>
          <ul>
            {card.points.map((item, i) => (
              <li key={item} style={{ '--i': i } as CSSProperties}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.5" />
                  <path d="M6 10.4l2.7 2.6L14.2 7.4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <a className="cx-svc__foot cx-svc__cta" href={hero.primary.href}>
          <strong>{hero.primary.label}</strong>
          <FlyArrow size={14} strokeWidth={2.2} />
        </a>
      </div>

      {/* on top: the operation and its scene */}
      <div className="cx-svc__rest" ref={front} inert={showsBack}>
        <div className="cx-svc__sheet cx-svc__sheet--front" ref={sheet(1)}>
          <span className="cx-svc__index">
            {number} — {card.eyebrow}
          </span>
          <h3 className="cx-svc__title">{card.title}</h3>
          <p className="cx-svc__body">{card.body}</p>
          <div className="fo-card__art">
            {look === 'bold' ? <OpsArt scene={SCENES[index]} /> : <OpsLine scene={SCENES[index]} />}
          </div>
          <span className="cx-svc__foot cx-svc__hint" aria-hidden="true" onClick={turn}>
            {cx.hint}
          </span>
        </div>
      </div>

      {/* the paper that lifts during a turn: the front's underside */}
      <div className="cx-svc__flap-clip" ref={sheet(2)} aria-hidden="true">
        <div className="cx-svc__flap" ref={flap}>
          <div className="cx-svc__flap-sheet" ref={sheet(3)}>
            <div className="cx-svc__flap-paper" ref={flapPaper} />
          </div>
        </div>
      </div>

      <span className="cx-svc__bite" ref={bite}>
        <button
          type="button"
          className="cx-svc__flip"
          onClick={turn}
          aria-expanded={showsBack}
          aria-controls={backId}
          aria-label={showsBack ? `Back to ${card.title}` : `${cx.hint}: ${card.eyebrow}`}
        >
          <FlyArrow size={20} strokeWidth={2.2} />
        </button>
      </span>
    </li>
  )
}

/* ?ops=panel: Panel's cards, from Krish's screenshot */
function PanelCards() {
  const c = operations
  const [open, setOpen] = useState<number | null>(null)
  const touch = () => window.matchMedia('(hover: none)').matches
  return (
    <div className="fp-ops">
      {c.cards.map((card, k) => (
        <article
          key={card.eyebrow}
          className="fp-op"
          data-umm-tone={card.tone}
          data-open={open === k || undefined}
          data-umm-reveal
          style={{ '--umm-reveal-delay': `${k * 90}ms` } as CSSProperties}
          tabIndex={0}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(k)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
          onFocus={() => setOpen(k)}
          onBlur={() => setOpen(null)}
          onClick={() => touch() && setOpen((o) => (o === k ? null : k))}
        >
          <div className="fp-op__ground">
            <span className="fp-op__icon">
              <CoolIcon name={OPS_ICON[k]} />
            </span>
          </div>
          <div className="fp-op__top">
            <p className="fp-chip">{card.eyebrow}</p>
            <span className="fp-op__num">{pad(k)}</span>
          </div>
          <div className="fp-op__foot">
            <h3>{card.title}</h3>
            <div className="fp-op__more">
              <div>
                <p>{card.body}</p>
                <ul className="fp-ticks">
                  {card.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <span className="fp-op__hint" aria-hidden="true">
              <Arrow />
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
