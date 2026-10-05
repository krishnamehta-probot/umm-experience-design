import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { IconArrowUpRight } from '../icons'
import { LottieMark } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { measurePeel, peelFrame, sheetPath, type PeelGeometry } from '@/lib/cornerPeel'
import { services, type ServiceMark } from '@/content/cxUiDesign'

import research from '@/lottie/services/research.json'
import journey from '@/lottie/services/journey.json'
import interfaces from '@/lottie/services/interface.json'
import brand from '@/lottie/services/brand.json'
import data from '@/lottie/services/data.json'
import testing from '@/lottie/services/testing.json'

/* ============================================================================
   4 · WHAT WE DO — six services, all at once, each a card with two sides

   The front says when you need the service and what we do; the back says
   what you walk away with, with a live scene of it (an 8-second Lottie loop,
   built by scripts/build_service_marks.py) and the case study. All six are on screen together and all
   the same size, because the question a reader brings here is about the
   whole set.

   The black button in each card's bitten corner turns the card over. It
   peels: a fold sweeps from the bite to the far corner, the lifted paper
   turns back over the sheet and lets go, and the back is uncovered beneath.
   Pressing again lays the sheet back down. The geometry is in
   lib/cornerPeel.ts; this file measures, and writes each frame into style.

   The marks only run while their card is showing its back and the grid is
   near the screen; otherwise the player is destroyed, so the rest of the
   page pays nothing for them.
   ========================================================================== */

const MARKS: Record<ServiceMark, unknown> = {
  research,
  journey,
  interface: interfaces,
  brand,
  data,
  testing,
}

type Service = (typeof services.items)[number]
type Side = 'front' | 'back'

export function ServicesV2() {
  const ref = useRef<HTMLElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const node = grid.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setLive(entry.isIntersecting)
        // Fetch the player before anyone turns a card, so the first mark is
        // there the moment the back is.
        if (entry.isIntersecting) void import('lottie-web/build/player/lottie_light')
      },
      { rootMargin: '240px 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cx-svc', {
        opacity: 0,
        y: 60,
        rotate: (i: number) => [-4, 3, -2, 4, -3, 2][i % 6],
        duration: 0.9,
        stagger: { each: 0.08, grid: 'auto', from: 'start' },
        ease: 'back.out(1.3)',
        scrollTrigger: { trigger: '.cx-svc__grid', start: 'top 80%', once: true },
      })
      gsap.from('.cx-svc__flip', {
        scale: 0,
        rotate: -90,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2.4)',
        delay: 0.5,
        /* hand the transform back to CSS, or the hover never shows */
        clearProps: 'transform',
        scrollTrigger: { trigger: '.cx-svc__grid', start: 'top 80%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="umm-section cx-svcs" id="services" ref={ref}>
      <div className="umm-container">
        <div className="cx-head">
          <ChipHead
            line1={services.line1}
            line2={withAccent(services.line2, services.accent)}
            chip={services.chip}
            tone="sun"
            chipAt="74%"
            tilt={8}
            lineRecipe={1}
            chipRecipe={1}
          />
          <p className="cx-lead">{services.lead}</p>
        </div>

        <ul className="cx-svc__grid" ref={grid}>
          {services.items.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} total={services.items.length} live={live} />
          ))}
        </ul>

        <aside className="cx-signpost">
          <span className="cx-signpost__mark" aria-hidden="true">
            <IconArrowUpRight size={18} strokeWidth={1.9} />
          </span>
          <p>
            <strong>{services.signpost.question}</strong> {services.signpost.before}{' '}
            {services.signpost.href ? (
              <a href={services.signpost.href}>{services.signpost.page}</a>
            ) : (
              <em>{services.signpost.page}</em>
            )}{' '}
            {services.signpost.after}
          </p>
        </aside>
      </div>
    </section>
  )
}

/* How far short of flat the flap is held mid-turn: flat at either end, so it
   starts as a crease and finishes lying down, and up off the paper between. */
const lift = (p: number) => 44 * Math.sin(Math.PI * p)

function ServiceCard({
  service: s,
  index,
  total,
  live,
}: {
  service: Service
  index: number
  total: number
  live: boolean
}) {
  const backId = useId()
  const [side, setSide] = useState<Side>('front')
  const [busy, setBusy] = useState(false)

  const card = useRef<HTMLLIElement>(null)
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
    // The underside: lit where it bends at the fold, darker out at the tip.
    flapPaper.current.style.backgroundImage = `linear-gradient(${g.angle}deg, var(--peel-tip) 0px, var(--peel-mid) ${f.d * 0.66}px, var(--peel-fold) ${f.d}px)`
    // The lifted paper's shadow, falling on the back just short of the fold;
    // gone by the time the fold reaches the far corner.
    const dark = 0.18 * Math.min(1, (1 - p) * 4)
    shade.current.style.backgroundImage = `linear-gradient(${g.angle}deg, transparent ${Math.max(0, f.d - 90)}px, rgb(16 14 20 / ${dark.toFixed(3)}) ${f.d}px)`
  }, [])

  const clear = useCallback(() => {
    for (const el of [front.current, flap.current, flapPaper.current, shade.current]) {
      el?.removeAttribute('style')
    }
  }, [])

  // Measure the card and cut the bite: the outline depends on the card's
  // size, so it is drawn here rather than in CSS, and redrawn on resize.
  useLayoutEffect(() => {
    const li = card.current
    if (!li) return
    const draw = () => {
      const first = sheets.current[0]
      if (!first || !bite.current) return
      const radius = parseFloat(getComputedStyle(first).borderTopLeftRadius) || 24
      const g = measurePeel(li.offsetWidth, li.offsetHeight, radius, bite.current.offsetWidth)
      geom.current = g
      const outline = `path("${sheetPath(g)}")`
      for (const el of sheets.current) el.style.clipPath = outline
      if (tween.current?.isActive()) paint(state.current.p)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(li)
    return () => ro.disconnect()
  }, [paint])

  useEffect(() => () => void tween.current?.kill(), [])

  const turn = useCallback(() => {
    const next: Side = target.current === 'front' ? 'back' : 'front'
    target.current = next
    setSide(next)

    if (prefersReducedMotion()) {
      // No peel: the side simply changes. Drop any turn in progress so the
      // sheets are left exactly as that side shows them.
      tween.current?.kill()
      tween.current = null
      state.current.p = next === 'back' ? 1 : 0
      clear()
      setBusy(false)
      return
    }

    // Paint before showing the flap, so it never flashes up unclipped.
    paint(state.current.p)
    setBusy(true)
    if (!tween.current) {
      const from = state.current.p
      tween.current = gsap.fromTo(
        state.current,
        { p: 0 },
        {
          p: 1,
          // Gives way like paper: slow to lift, quick to clear. Played back,
          // the same curve sweeps the sheet in fast and lands it softly.
          duration: 0.95,
          ease: 'power1.in',
          paused: true,
          onUpdate: () => paint(state.current.p),
          // Turned over: the last frame stays painted (front clipped to
          // nothing, flap turned off the card), so there is no frame where
          // the front could show again before the re-render hides it.
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

  const number = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const showsBack = side === 'back'

  return (
    <li
      className="cx-svc"
      data-umm-tone={s.tone}
      data-side={side}
      data-busy={busy || undefined}
      ref={card}
    >
      {/* Underneath: what you get */}
      <div className="cx-svc__sheet cx-svc__sheet--back" id={backId} ref={sheet(0)} inert={!showsBack}>
        <span className="cx-svc__shade" ref={shade} aria-hidden="true" />
        <div className="cx-svc__top">
          <span className="cx-svc__index">{number}</span>
          <span className="cx-svc__name">{s.title}</span>
        </div>
        <LottieMark data={MARKS[s.mark]} playing={live && (showsBack || busy)} still={150} className="cx-svc__mark" />
        <dl className="cx-svc__get">
          <dt>What you get</dt>
          <dd>{s.get}</dd>
        </dl>
        {s.seeIt ? (
          <a className="cx-svc__foot cx-svc__case" href={s.seeIt.href} target="_blank" rel="noreferrer">
            See it in <strong>{s.seeIt.label}</strong>
            <IconArrowUpRight size={14} strokeWidth={2.2} />
          </a>
        ) : null}
      </div>

      {/* On top: when you need it, what we do */}
      <div className="cx-svc__rest" ref={front} inert={showsBack}>
        <div className="cx-svc__sheet cx-svc__sheet--front" ref={sheet(1)}>
          <span className="cx-svc__index">{number}</span>
          <h3 className="cx-svc__title">{s.title}</h3>
          <dl className="cx-svc__lines">
            <div>
              <dt>You need this when</dt>
              <dd>{s.when}</dd>
            </div>
            <div>
              <dt>What we do</dt>
              <dd>{s.what}</dd>
            </div>
          </dl>
          <span className="cx-svc__foot cx-svc__hint" aria-hidden="true" onClick={turn}>
            See what you get
          </span>
        </div>
      </div>

      {/* The paper that lifts during a turn: the front's underside. It is
          kept inside the card's outline, so it rolls away to the far corner
          rather than sailing out over the neighbouring cards. */}
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
          aria-label={showsBack ? `Back to ${s.title}` : `See what you get: ${s.title}`}
        >
          <IconArrowUpRight size={20} strokeWidth={2.2} />
        </button>
      </span>
    </li>
  )
}
