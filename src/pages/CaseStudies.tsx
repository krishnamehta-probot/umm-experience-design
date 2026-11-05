import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Ambient, lift } from '../components/casestudies/Ambient'
import {
  CASE_RATIO,
  CASE_STUDIES,
  INDUSTRY_COUNT,
  caseLink,
  caseLogo,
  casePoster,
  caseThumb,
  industryIcon,
  type CaseStudy,
} from '../content/caseStudies'
import '../styles/case-studies.css'

/* ============================================================================
   CASE STUDIES — /casestudies, the case-study main page

   Krish's idea (5 Nov), from his own sketch: small cards in a column down
   each side, the same cards in the reverse order on the right, one selected
   on each side, and between them one big card playing that case's film.
   Scrolling moves to the next case; the columns run on without end, the
   left one up and the right one down; it should feel like a connection.

   How the connection is made: the case travels. As the page scrolls, the
   next case's small card on the left grows out of its column into the big
   card, while the case that was showing shrinks away into its twin on the
   right, so each case passes left to right through the middle. Scrolling
   slowly scrubs it, a flick or a key steps it, and it always comes to rest
   on one case. At rest, a beam of light runs from the selected card on the
   left into the big card and out of it to its twin on the right.

   Options (the review dock, all kept in the URL):
     ?cards=original|uniform  the live cards (the render, the logo over it)
                              as in his sketch; or one card design for all
                              (Krish: "a better and uniform card", keeping
                              the original too, since the boss is picky)
     ?layout=diagonal|level   the selected cards at the top left and the
                              foot right, as he drew it; or both level
     ?icons=bright|pastel     uniform cards: the industry's Cool Shape in
                              its own bright colours or in UMM's pastels
     ?tile=white|black        uniform cards: white or black (Krish, 5 Nov)

   On a phone the columns run across, along the top and the foot.
   ========================================================================== */

type Cards = 'original' | 'uniform'
type Layout = 'diagonal' | 'level'
type Icons = 'bright' | 'pastel'
type TileTone = 'white' | 'black'

const N = CASE_STUDIES.length
/** how much larger the selected small card is */
const SEL = 1.12
/** the big card's corner, and the small cards' */
const R_BIG = 22
const R_SMALL = 10

const mod = (a: number, n: number) => ((a % n) + n) % n
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)
/** where i sits from the case at p, the shorter way round */
const relOf = (i: number, p: number) => mod(i - p + N / 2, N) - N / 2

const LIFTED = CASE_STUDIES.map((c) => c.colors.map(lift))
const css = (c: number[]) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`

/* -------------------------------------------------------------- geometry */

type Geo = {
  /** the columns run down the sides (wide) or across (phone) */
  vertical: boolean
  vw: number
  vh: number
  /** big card: size and centre */
  W: number
  H: number
  cx: number
  cy: number
  /** small card: size, and the step between two */
  w: number
  h: number
  pitch: number
  /** each column's line across (x for side columns, y for top and foot) */
  aL: number
  aR: number
  /** where the selected card stands along each column */
  sL: number
  sR: number
  capTop: number
}

function geometry(vw: number, vh: number, layout: Layout): Geo {
  if (vw >= 760) {
    const top = 76
    const capH = 108
    const foot = 28
    const w = clamp(vw * 0.085, 84, 150)
    const h = w / CASE_RATIO
    const pad = Math.max(20, vw * 0.035)
    const gap = Math.max(90, vw * 0.08)
    const W = Math.min(vw - 2 * (pad + w * SEL + gap), (vh - top - capH - foot) * CASE_RATIO, 920)
    const H = W / CASE_RATIO
    const y0 = top + (vh - top - foot - (H + capH)) / 2
    const cy = y0 + H / 2
    const hs = (h * SEL) / 2
    return {
      vertical: true,
      vw,
      vh,
      W,
      H,
      cx: vw / 2,
      cy,
      w,
      h,
      pitch: h + 16,
      aL: pad + (w * SEL) / 2,
      aR: vw - pad - (w * SEL) / 2,
      sL: layout === 'diagonal' ? cy - H / 2 + hs : cy,
      sR: layout === 'diagonal' ? cy + H / 2 - hs : cy,
      capTop: y0 + H + 20,
    }
  }
  const top = 58
  const w = clamp(vw * 0.22, 76, 112)
  const h = w / CASE_RATIO
  const hs = (h * SEL) / 2
  const aL = top + hs + 4
  const aR = vh - 18 - hs
  const capH = 128
  const r0 = aL + hs + 18
  const r1 = aR - hs - 18
  const W = Math.min(vw - 32, (r1 - r0 - capH) * CASE_RATIO)
  const H = W / CASE_RATIO
  const cy = r0 + (r1 - r0 - capH - H) / 2 + H / 2
  const ws = (w * SEL) / 2
  return {
    vertical: false,
    vw,
    vh,
    W,
    H,
    cx: vw / 2,
    cy,
    w,
    h,
    pitch: w + 12,
    aL,
    aR,
    sL: layout === 'diagonal' ? vw / 2 - W / 2 + ws : vw / 2,
    sR: layout === 'diagonal' ? vw / 2 + W / 2 - ws : vw / 2,
    capTop: cy + H / 2 + 14,
  }
}

/** the centre of case i's small card in a column, with p the case showing */
function railAt(g: Geo, side: 'L' | 'R', i: number, p: number) {
  const rel = relOf(i, p)
  const along = side === 'L' ? g.sL + rel * g.pitch : g.sR - rel * g.pitch
  const across = side === 'L' ? g.aL : g.aR
  return { x: g.vertical ? across : along, y: g.vertical ? along : across, rel }
}
const selOf = (rel: number) => Math.max(0, 1 - Math.abs(rel))
const scaleOf = (rel: number) => 1 + (SEL - 1) * selOf(rel)
const dimOf = (rel: number) => 1 - Math.min(0.42, Math.abs(rel) * 0.07)

/* ----------------------------------------------------------- the options */

function readOptions() {
  const q = new URLSearchParams(window.location.search)
  const pick = <T extends string>(k: string, all: readonly T[], d: T) => {
    const v = q.get(k) as T | null
    return v && all.includes(v) ? v : d
  }
  return {
    cards: pick<Cards>('cards', ['original', 'uniform'], 'original'),
    layout: pick<Layout>('layout', ['diagonal', 'level'], 'diagonal'),
    icons: pick<Icons>('icons', ['bright', 'pastel'], 'bright'),
    tile: pick<TileTone>('tile', ['white', 'black'], 'white'),
  }
}

/* ------------------------------------------------------------ the faces */

/** one card design for every case: its number, its field, the client, and
 *  its industry's Cool Shape (Krish, 5 Nov: sir likes those icons), in the
 *  shapes' own bright colours or in UMM's pastels. Sized in cqw so the small
 *  card and the big one growing out of it look the same. */
function Tile({ c, i, icons, tone }: { c: CaseStudy; i: number; icons: Icons; tone: TileTone }) {
  return (
    <div className={`cs-tile is-${tone}`}>
      <div className="cs-tile__top">
        <span>{String(i + 1).padStart(2, '0')}</span>
        <span>{c.industry}</span>
      </div>
      <span className="cs-tile__name">{c.client}</span>
      <img className="cs-tile__icon" src={industryIcon(c.industry, icons === 'pastel')} alt="" draggable={false} />
    </div>
  )
}

/** the live site's card: the render with the client's logo set on it */
function Original({ c, big }: { c: CaseStudy; big?: boolean }) {
  return (
    <>
      <img className="cs-face__img" src={big ? casePoster(c.slug) : caseThumb(c.slug)} alt="" draggable={false} />
      <img className="cs-face__logo" src={caseLogo(c.slug)} alt={c.client} draggable={false} />
    </>
  )
}

/* -------------------------------------------------------- the big card */

function BigCard({
  c,
  i,
  cards,
  icons,
  tone,
  playing,
  setEl,
}: {
  c: CaseStudy
  i: number
  cards: Cards
  icons: Icons
  tone: TileTone
  playing: boolean
  setEl: (el: HTMLDivElement | null) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) {
      if (!v.getAttribute('src')) v.setAttribute('src', c.video)
      v.currentTime = 0
      v.play().catch(() => {})
    } else v.pause()
  }, [playing, c.video])

  return (
    <div className={`cs-big ${shown ? 'is-playing' : ''}`} ref={setEl} data-cards={cards}>
      <a className="cs-big__in" href={caseLink(c.slug)} aria-label={`${c.client}: ${c.title}`} draggable={false}>
        <img className="cs-face__img" src={casePoster(c.slug)} alt="" draggable={false} />
        {/* the film over the render; it gives way to the render again as
            the card shrinks back into a column */}
        <span className="cs-big__media">
          <video
            ref={video}
            className={`cs-big__video ${shown ? 'is-on' : ''}`}
            muted
            loop
            playsInline
            preload="none"
            onPlaying={() => setShown(true)}
          />
        </span>
        {cards === 'original' ? (
          <img className="cs-face__logo" src={caseLogo(c.slug)} alt="" draggable={false} />
        ) : (
          <>
            <div className="cs-big__tile">
              <Tile c={c} i={i} icons={icons} tone={tone} />
            </div>
            <span className="cs-big__chip">
              <b>{c.client}</b>
              <span>{c.industry}</span>
            </span>
          </>
        )}
      </a>
    </div>
  )
}

/* ------------------------------------------------------------- the page */

export function CaseStudies() {
  const [opt, setOpt] = useState(readOptions)
  const [geo, setGeo] = useState(() => geometry(window.innerWidth, window.innerHeight, opt.layout))
  /** the case nearest the middle (caption, counter) */
  const [near, setNear] = useState(0)
  /** the two cases that can be big at once: floor(p) and the next */
  const [pair, setPair] = useState<[number, number]>([0, 1])
  /** at rest on a case: its film plays and the beams are lit */
  const [still, setStill] = useState(false)
  const [dock, setDock] = useState(false)
  /* the first second: the columns slide in, the big card comes up */
  const [entering, setEntering] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setEntering(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  const stage = useRef<HTMLDivElement>(null)
  const railEls = useRef<{ L: (HTMLButtonElement | null)[]; R: (HTMLButtonElement | null)[] }>({ L: [], R: [] })
  const bigEls = useRef(new Map<number, HTMLDivElement>())
  const beams = useRef<SVGGElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const ambient = useRef<Ambient | null>(null)
  const geoRef = useRef(geo)
  const calm = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  /* the scroll: p is where the page is (in cases), target where it is going */
  const sc = useRef({ p: 0, target: 0, g0: 0, wheelAt: 0, gesture: false, touch: null as null | { a: number; t0: number } })

  useLayoutEffect(() => {
    geoRef.current = geo
  }, [geo])

  /* options into the URL */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    q.set('cards', opt.cards)
    q.set('layout', opt.layout)
    q.delete('bg')
    q.set('icons', opt.icons)
    q.set('tile', opt.tile)
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`)
  }, [opt])

  useEffect(() => {
    const on = () => setGeo(geometry(window.innerWidth, window.innerHeight, opt.layout))
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [opt.layout])

  /* the light behind: the glow (Krish, 5 Nov: the field lines and the plain
     ground taken out of the options; Ambient.ts keeps the field mode) */
  useEffect(() => {
    if (!stage.current) return
    let a: Ambient | null = null
    try {
      a = new Ambient(stage.current, 'glow')
    } catch {
      return
    }
    ambient.current = a
    a.setCard(geoRef.current.cx, geoRef.current.cy, geoRef.current.W, geoRef.current.H)
    return () => {
      a?.dispose()
      ambient.current = null
    }
  }, [])

  useEffect(() => {
    ambient.current?.setCard(geo.cx, geo.cy, geo.W, geo.H)
  }, [geo])

  /* ------------------------------------------------------------ input */

  const go = useCallback((steps: number) => {
    const s = sc.current
    const base = Math.round(s.target)
    s.target = base + steps
    s.g0 = s.target
    s.gesture = false
  }, [])

  const goTo = useCallback((i: number) => {
    const s = sc.current
    const base = Math.round(s.p)
    s.target = base + relOf(i, base)
    s.g0 = s.target
    s.gesture = false
  }, [])

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const s = sc.current
    const wheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.ha-dock')) return
      e.preventDefault()
      const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? 16 : 1)
      if (!s.gesture) {
        s.gesture = true
        s.g0 = Math.round(s.p)
      }
      s.target = clamp(s.target + d / 420, s.p - 2.2, s.p + 2.2)
      s.wheelAt = performance.now()
    }
    const key = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        go(1)
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        go(-1)
      }
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const g = geoRef.current
      s.touch = { a: g.vertical ? e.clientY : e.clientX, t0: s.target }
      s.gesture = true
      s.g0 = Math.round(s.p)
    }
    const move = (e: PointerEvent) => {
      if (!s.touch) return
      const g = geoRef.current
      const a = g.vertical ? e.clientY : e.clientX
      s.target = s.touch.t0 - (a - s.touch.a) / (g.pitch * 1.4)
      s.wheelAt = performance.now()
    }
    const up = () => {
      s.touch = null
    }
    el.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [go])

  /* ------------------------------------------------------------ frame */

  useEffect(() => {
    const s = sc.current
    let raf = 0
    let last = performance.now()
    let lastPair = ''
    let lastNear = -1
    let lastStill = false

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(64, now - last)
      last = now
      const g = geoRef.current

      /* the gesture over: come to rest on a case, the way it was going */
      if (s.gesture && !s.touch && now - s.wheelAt > 150) {
        const d = s.target - s.g0
        s.target = Math.abs(d) < 0.12 ? s.g0 : s.g0 + Math.sign(d) * Math.max(1, Math.round(Math.abs(d)))
        s.gesture = false
      }
      s.p = calm.current ? s.target : s.p + (s.target - s.p) * (1 - Math.exp(-dt / 170))
      if (Math.abs(s.target - s.p) < 0.0004) s.p = s.target

      const n = Math.floor(s.p)
      const f = s.p - n
      const e = smooth(f)
      const a = mod(n, N)
      const b = mod(n + 1, N)
      const key = `${a}:${b}`
      if (key !== lastPair) {
        lastPair = key
        setPair([a, b])
      }
      const nr = mod(Math.round(s.p), N)
      if (nr !== lastNear) {
        lastNear = nr
        setNear(nr)
      }
      const rest = Math.abs(s.p - Math.round(s.p)) < 0.003 && !s.gesture
      if (rest !== lastStill) {
        lastStill = rest
        setStill(rest)
      }
      const moving = f > 0.0005 && f < 0.9995

      /* the columns */
      for (const side of ['L', 'R'] as const) {
        railEls.current[side].forEach((el, i) => {
          if (!el) return
          const r = railAt(g, side, i, s.p)
          const span = g.vertical ? g.vh : g.vw
          const pos = g.vertical ? r.y : r.x
          const off = pos < -g.pitch * 2 || pos > span + g.pitch * 2
          /* the two cards flying as big ones are hidden in their columns */
          const flying = moving && ((side === 'L' && i === b) || (side === 'R' && i === a))
          el.style.visibility = off || flying ? 'hidden' : 'visible'
          if (off) return
          const k = scaleOf(r.rel)
          el.style.transform = `translate(${r.x - g.w / 2}px, ${r.y - g.h / 2}px) scale(${k})`
          el.style.opacity = String(dimOf(r.rel))
          el.style.setProperty('--sel', String(selOf(r.rel)))
        })
      }

      /* the big cards: a shrinking into its twin on the right, b growing
         out of its card on the left */
      const place = (el: HTMLDivElement | undefined, from: { x: number; y: number; k: number }, to: { x: number; y: number; k: number }, t: number, op0: number, op1: number) => {
        if (!el) return
        const x = lerp(from.x, to.x, t)
        const y = lerp(from.y, to.y, t)
        const k = lerp(from.k, to.k, t)
        el.style.transform = `translate(${x - (g.W * k) / 2}px, ${y - (g.H * k) / 2}px) scale(${k})`
        el.style.opacity = String(lerp(op0, op1, t))
        const small = (1 - k) / (1 - g.w / g.W)
        el.style.setProperty('--small', String(clamp(small, 0, 1)))
        el.style.setProperty('--r', `${lerp(R_BIG, R_SMALL, clamp(small, 0, 1)) / k}px`)
      }
      const centre = { x: g.cx, y: g.cy, k: 1 }
      const ra = railAt(g, 'R', a, s.p)
      const lb = railAt(g, 'L', b, s.p)
      const toA = { x: ra.x, y: ra.y, k: (g.w * scaleOf(ra.rel)) / g.W }
      const fromB = { x: lb.x, y: lb.y, k: (g.w * scaleOf(lb.rel)) / g.W }
      const elA = bigEls.current.get(a)
      const elB = bigEls.current.get(b)
      if (elA) {
        elA.style.visibility = f > 0.9995 ? 'hidden' : 'visible'
        elA.style.zIndex = e < 0.5 ? '4' : '3'
      }
      if (elB) {
        elB.style.visibility = f < 0.0005 ? 'hidden' : 'visible'
        elB.style.zIndex = e < 0.5 ? '3' : '4'
      }
      place(elA, centre, toA, e, 1, dimOf(ra.rel))
      place(elB, fromB, centre, e, dimOf(lb.rel), 1)

      /* the beams and the caption, lit only at rest */
      const settle = clamp(1 - Math.abs(s.p - Math.round(s.p)) * 6, 0, 1)
      if (beams.current) beams.current.style.opacity = String(settle * settle)
      if (caption.current) caption.current.style.opacity = String(0.15 + 0.85 * settle)

      /* the light: the two cases' colours, eased across */
      const amb = ambient.current
      if (amb) {
        const ca = LIFTED[a]
        const cb = LIFTED[b]
        const mix = (i: number) => ca[i].map((v, j) => lerp(v, cb[i][j], e))
        amb.setColors(mix(0), mix(1), mix(2))
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ------------------------------------------------------------ render */

  const c = CASE_STUDIES[near]
  const [la, lb] = [LIFTED[near][0], LIFTED[near][1]]
  const hs = (geo.h * SEL) / 2
  const ws = (geo.w * SEL) / 2
  /* the beams: from the left card's edge to the big card's, and from the
     big card's to the right card's (side columns only) */
  const L = geo.vertical
    ? [
        [geo.aL + ws + 8, geo.sL - hs],
        [geo.cx - geo.W / 2 - 8, geo.cy - geo.H / 2],
        [geo.cx - geo.W / 2 - 8, geo.cy + geo.H / 2],
        [geo.aL + ws + 8, geo.sL + hs],
      ]
    : null
  const R = geo.vertical
    ? [
        [geo.cx + geo.W / 2 + 8, geo.cy - geo.H / 2],
        [geo.aR - ws - 8, geo.sR - hs],
        [geo.aR - ws - 8, geo.sR + hs],
        [geo.cx + geo.W / 2 + 8, geo.cy + geo.H / 2],
      ]
    : null
  const pts = (q: number[][]) => q.map((v) => v.join(',')).join(' ')
  const line = (p0: number[], p1: number[]) => `M${p0[0]},${p0[1]} L${p1[0]},${p1[1]}`

  const set = <K extends keyof typeof opt>(k: K, v: (typeof opt)[K]) => setOpt((o) => ({ ...o, [k]: v }))

  return (
    <main
      className={`cs ${geo.vertical ? 'is-wide' : 'is-phone'} ${entering ? 'is-entering' : ''}`}
      ref={stage}
      data-cards={opt.cards}
      style={{ '--w': `${geo.w}px`, '--h': `${geo.h}px`, '--W': `${geo.W}px`, '--H': `${geo.H}px` } as CSSProperties}
    >
      <header
        className="cs-top"
        style={geo.vertical ? { left: geo.cx - geo.W / 2, right: geo.vw - (geo.cx + geo.W / 2), padding: 0 } : undefined}
      >
        <div className="cs-top__title">
          <h1>Case Studies</h1>
          <span>
            {N} projects · {INDUSTRY_COUNT} industries
          </span>
        </div>
        <div className="cs-top__count" aria-live="polite">
          <b>{String(near + 1).padStart(2, '0')}</b>
          <span>/ {N}</span>
        </div>
      </header>

      {L && R && (
        <svg className="cs-beams" width={geo.vw} height={geo.vh} aria-hidden="true">
          <defs>
            <linearGradient id="cs-beam-l" x1={L[0][0]} x2={L[1][0]} y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={css(la)} stopOpacity="0.55" />
              <stop offset="1" stopColor={css(la)} stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="cs-beam-r" x1={R[0][0]} x2={R[1][0]} y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={css(lb)} stopOpacity="0.06" />
              <stop offset="1" stopColor={css(lb)} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <g ref={beams}>
            <polygon points={pts(L)} fill="url(#cs-beam-l)" />
            <polygon points={pts(R)} fill="url(#cs-beam-r)" />
            {[
              [L[0], L[1]],
              [L[3], L[2]],
              [R[0], R[1]],
              [R[3], R[2]],
            ].map(([p0, p1], i) => (
              <g key={i}>
                <path className="cs-beams__edge" d={line(p0, p1)} />
                <path className="cs-beams__run" d={line(p0, p1)} pathLength={100} style={{ animationDelay: `${-i * 0.6}s` }} />
              </g>
            ))}
          </g>
        </svg>
      )}

      {(['L', 'R'] as const).map((side) => (
        <div key={side} className={`cs-rail cs-rail--${side}`} aria-label={side === 'L' ? 'Case studies' : undefined}>
          {CASE_STUDIES.map((cs, i) => (
            <button
              key={cs.slug}
              type="button"
              className="cs-card"
              ref={(el) => {
                railEls.current[side][i] = el
              }}
              onClick={() => goTo(i)}
              aria-label={side === 'L' ? `${cs.client}: ${cs.title}` : undefined}
              tabIndex={side === 'L' ? 0 : -1}
              aria-hidden={side === 'R' ? true : undefined}
            >
              <span className="cs-card__in">{opt.cards === 'original' ? <Original c={cs} /> : <Tile c={cs} i={i} icons={opt.icons} tone={opt.tile} />}</span>
              <span className="cs-card__ring" />
            </button>
          ))}
        </div>
      ))}

      {[...new Set(pair)].map((i) => (
        <BigCard
          key={i}
          c={CASE_STUDIES[i]}
          i={i}
          cards={opt.cards}
          icons={opt.icons}
          tone={opt.tile}
          playing={still && i === near}
          setEl={(el) => {
            if (el) bigEls.current.set(i, el)
            else bigEls.current.delete(i)
          }}
        />
      ))}

      <div
        className="cs-cap"
        ref={caption}
        style={{ top: geo.capTop, left: geo.cx - geo.W / 2, width: geo.W }}
      >
        <div className="cs-cap__text" key={near}>
          <span className="cs-cap__meta">
            <i style={{ background: css(la) }} />
            {c.client} · {c.industry}
          </span>
          <span className="cs-cap__title">{c.title}</span>
        </div>
        <a className="cs-cap__go" href={caseLink(c.slug)}>
          View case study
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <aside className="ha-dock cs-dock" data-open={dock} aria-label="Page options">
        <button type="button" className="ha-dock__toggle" aria-expanded={dock} onClick={() => setDock((v) => !v)}>
          {dock ? 'Hide options' : 'Options'}
        </button>
        {dock && (
          <div className="ha-dock__body">
            <fieldset className="ha-dock__set">
              <legend>Cards</legend>
              <div>
                {(
                  [
                    ['original', 'Original'],
                    ['uniform', 'Uniform'],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={opt.cards === v} onClick={() => set('cards', v)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            {opt.cards === 'uniform' && (
              <fieldset className="ha-dock__set">
                <legend>Card colour</legend>
                <div>
                  {(
                    [
                      ['white', 'White'],
                      ['black', 'Black'],
                    ] as const
                  ).map(([v, l]) => (
                    <button key={v} type="button" aria-pressed={opt.tile === v} onClick={() => set('tile', v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {opt.cards === 'uniform' && (
              <fieldset className="ha-dock__set">
                <legend>Shapes</legend>
                <div>
                  {(
                    [
                      ['bright', 'Bright'],
                      ['pastel', 'Pastel'],
                    ] as const
                  ).map(([v, l]) => (
                    <button key={v} type="button" aria-pressed={opt.icons === v} onClick={() => set('icons', v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset className="ha-dock__set">
              <legend>Layout</legend>
              <div>
                {(
                  [
                    ['diagonal', 'Diagonal'],
                    ['level', 'Level'],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={opt.layout === v} onClick={() => set('layout', v)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </aside>
    </main>
  )
}
