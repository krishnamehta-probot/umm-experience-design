import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { CASES, INDUSTRY, caseImage } from '../components/home/cases'
import '../styles/case-concepts.css'

/* ============================================================================
   CASE CONCEPTS — /casestudies-concepts

   Six rough sketches for the case-study main page (5 Nov), for Krish to
   pick two or three from. The two references he liked were Griflan Labs
   (labs.griflan.com: every project a cluster of tiles on a curved grid you
   drag around) and byholm.co (the work on one bent strip, a project at a
   time). Each sketch is the idea only, not a design: it runs on its own,
   on the twelve case renders in public/home/cases (the live page has 29),
   in Mosvita and the brand pastels.

     01 Atlas       Griflan, light: clusters on a curved paper grid
     02 Reel        byholm: one bent strip, one project at a time
     03 Zoom-out    one project full screen, pulling back to all of them
     04 Mosaic      the UMM mark's quarter tiles, turned by the filter
     05 Index       a typographic list, a card following the cursor
     06 Fly-through the projects hung in depth over a floor grid
   ========================================================================== */

type Case = { slug: string; title: string; industry: string; img: string }

const ALL: Case[] = CASES.map(([slug, title]) => ({ slug, title, industry: INDUSTRY[slug], img: caseImage(slug) }))
const TOTAL = 29
const INDUSTRIES = 14
const TONES = ['blossom', 'citrus', 'sky', 'sun', 'coral', 'lilac'] as const

const mod = (a: number, n: number) => ((a % n) + n) % n
const caseAt = (i: number) => ALL[mod(i, ALL.length)]
const pad = (n: number) => String(n).padStart(2, '0')
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** broad groups for the sketches' filters (the real page filters by its 14 industries) */
const GROUPS: { name: string; of: string[] }[] = [
  { name: 'Finance', of: ['Fintech', 'Blockchain', 'Mobile money'] },
  { name: 'Commerce', of: ['E-commerce', 'Home goods', 'Commercial flooring'] },
  { name: 'Tech & telecom', of: ['Telecom', 'AI & DevOps', 'Energy'] },
  { name: 'Life & planet', of: ['Biotech', 'Sustainability', 'Education'] },
]
const groupOf = (c: Case) => GROUPS.findIndex((g) => g.of.includes(c.industry))

/* ---------------------------------------------------------------- shared */

/** every sketch draws on a fixed 1280 x 720 canvas, scaled to its stage */
const CW = 1280
const CH = 720

function useInView(ref: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return on
}

/** fn(dt, now) every frame while on */
function useFrame(on: boolean, fn: (dt: number, now: number) => void) {
  const f = useRef(fn)
  useLayoutEffect(() => {
    f.current = fn
  })
  useEffect(() => {
    if (!on) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      f.current(dt, now)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on])
}

function Stage({ children, className = '' }: { children: (on: boolean, k: number) => ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const on = useInView(ref)
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setK(el.clientWidth / CW))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className={`cc-stage ${className}`}>
      <div className="cc-canvas" style={{ transform: `scale(${k})` }}>
        {children(on, k)}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 01 Atlas */

const AT = { R: 1250, STEP: 5, COLS: 72, ROWS: 16, LAT0: -25 }
/** clusters per band, and the band nearest the middle of the view */
const PER = AT.COLS / 4
const FRONT_BAND = 2
type Cell = { col: number; row: number; kind: 'empty' | 'img' | 'crop' | 'label'; c?: Case; q?: number; tone?: string; n?: number }
const QUARTER = ['0% 0%', '100% 0%', '0% 100%', '100% 100%']
const BANDS: [number, number][] = [
  [1, 0],
  [5, 2],
  [9, 1],
  [13, 3],
]

function atlasCells() {
  const grid = new Map<string, Cell>()
  let n = 0
  for (const [r0, off] of BANDS) {
    for (let m = 0; m < PER; m++) {
      const c0 = off + m * 4
      const c = caseAt(n)
      const tone = TONES[n % TONES.length]
      n++
      const put = (dc: number, dr: number, cell: Omit<Cell, 'col' | 'row'>) => {
        const col = mod(c0 + dc, AT.COLS)
        const row = r0 + dr
        grid.set(`${col}:${row}`, { col, row, ...cell })
      }
      put(0, 1, { kind: 'img', c, q: 0 })
      put(1, 1, { kind: 'img', c, q: 1 })
      put(0, 0, { kind: 'img', c, q: 2 })
      put(1, 0, { kind: 'img', c, q: 3 })
      put(2, 1, { kind: 'crop', c })
      put(2, 0, { kind: 'label', c, tone, n })
    }
  }
  const out: Cell[] = []
  for (let row = 0; row < AT.ROWS; row++)
    for (let col = 0; col < AT.COLS; col++) out.push(grid.get(`${col}:${row}`) ?? { col, row, kind: 'empty' })
  return out
}

/** which cluster of the middle band faces the viewer at this turn */
const frontCluster = (yaw: number) => {
  const col = mod(Math.round(-yaw / AT.STEP), AT.COLS)
  const [, off] = BANDS[FRONT_BAND]
  return FRONT_BAND * PER + mod(Math.floor((col - off) / 4), PER)
}

function Atlas({ on, k }: { on: boolean; k: number }) {
  const cells = useMemo(atlasCells, [])
  const globe = useRef<HTMLDivElement>(null)
  const st = useRef({ yaw: 0, tilt: 17, vy: 0, drag: null as null | { x: number; y: number }, idle: 0 })
  const [front, setFront] = useState(frontCluster(0))
  const arc = (AT.R * AT.STEP * Math.PI) / 180

  useFrame(on, (dt) => {
    const s = st.current
    if (!s.drag) {
      s.idle += dt
      s.yaw += s.vy * dt
      s.vy *= Math.pow(0.9, dt / 16)
      if (s.idle > 1200) s.yaw -= 0.0016 * dt
    }
    if (globe.current)
      globe.current.style.transform = `translateZ(${-AT.R}px) rotateX(${s.tilt}deg) rotateY(${s.yaw}deg)`
    const f = frontCluster(s.yaw)
    setFront((p) => (p === f ? p : f))
  })

  const down = (e: PointerEvent) => {
    st.current.drag = { x: e.clientX, y: e.clientY }
    st.current.vy = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    const s = st.current
    if (!s.drag) return
    const dx = (e.clientX - s.drag.x) / k
    const dy = (e.clientY - s.drag.y) / k
    s.drag = { x: e.clientX, y: e.clientY }
    s.yaw += dx * 0.06
    s.vy = (dx * 0.06) / 16
    s.tilt = clamp(s.tilt - dy * 0.04, 6, 30)
  }
  const up = () => {
    st.current.drag = null
    st.current.idle = 0
  }

  const c = caseAt(front)
  return (
    <div className="cc-atlas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="cc-atlas-globe" ref={globe}>
        {cells.map((cell) => {
          const lat = AT.LAT0 + cell.row * AT.STEP
          const w = arc * Math.cos((lat * Math.PI) / 180) + 0.5
          const h = arc + 0.5
          const style: CSSProperties = {
            width: w,
            height: h,
            marginLeft: -w / 2,
            marginTop: -h / 2,
            transform: `rotateY(${cell.col * AT.STEP}deg) rotateX(${-lat}deg) translateZ(${AT.R}px)`,
          }
          if (cell.kind === 'img' && cell.c) {
            style.backgroundImage = `url(${cell.c.img})`
            style.backgroundSize = '200% 200%'
            style.backgroundPosition = QUARTER[cell.q ?? 0]
          }
          if (cell.kind === 'crop' && cell.c) {
            style.backgroundImage = `url(${cell.c.img})`
            style.backgroundSize = '330% 330%'
            style.backgroundPosition = '72% 36%'
          }
          return (
            <div
              key={`${cell.col}:${cell.row}`}
              className={`cc-atlas-cell is-${cell.kind}`}
              data-umm-tone={cell.tone}
              style={style}
            >
              {cell.kind === 'label' && cell.c && (
                <>
                  <span className="cc-mono">{cell.c.industry}</span>
                  <span className="cc-mono is-quiet">No. {pad(mod(cell.n ?? 0, TOTAL) || TOTAL)}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
      <div className="cc-atlas-hud">
        <span className="cc-mono">{c.industry}</span>
        <span className="cc-mono">
          {TOTAL} projects · {INDUSTRIES} industries
        </span>
      </div>
      <div className="cc-atlas-front">
        <span className="cc-mono is-quiet">In front</span>
        <span className="cc-atlas-title">{c.title}</span>
      </div>
      <div className="cc-pill cc-atlas-hint">Drag to explore</div>
    </div>
  )
}

/* -------------------------------------------------------------- 02 Reel */

const RL = { R: 1400, W: 500, H: 405, GAP: 40, PERSP: 1100 }

function Reel({ on }: { on: boolean }) {
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const st = useRef({ p: 0, target: 0, wait: 0 })
  const [active, setActive] = useState(0)
  const step = ((RL.W + RL.GAP) / RL.R) * (180 / Math.PI)

  useFrame(on, (dt) => {
    const s = st.current
    s.wait += dt
    if (s.wait > 3400) {
      s.wait = 0
      s.target++
    }
    s.p += (s.target - s.p) * (1 - Math.exp(-dt / 280))
    cards.current.forEach((el, i) => {
      if (!el) return
      const rel = mod(i - s.p + TOTAL / 2, TOTAL) - TOTAL / 2
      const a = rel * step
      const hide = Math.abs(a) > 56
      el.style.visibility = hide ? 'hidden' : 'visible'
      if (hide) return
      el.style.transform = `translateZ(${RL.R}px) rotateY(${-a}deg) translateZ(${-RL.R}px)`
      el.style.filter = `brightness(${1 - Math.min(0.12, Math.abs(rel) * 0.06)})`
    })
    const a = mod(Math.round(s.p), TOTAL)
    setActive((p) => (p === a ? p : a))
  })

  const go = (d: number) => {
    st.current.target += d
    st.current.wait = -2000
  }
  const c = caseAt(active)
  return (
    <div className="cc-reel">
      <div className="cc-chips cc-reel-chips">
        {['All', ...GROUPS.map((g) => g.name)].map((g, i) => (
          <span key={g} className={`cc-chip ${i === 0 ? 'is-on' : ''}`}>
            {g}
          </span>
        ))}
      </div>
      <div className="cc-reel-scene" style={{ perspective: RL.PERSP }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              cards.current[i] = el
            }}
            className="cc-reel-card"
            style={{ width: RL.W, height: RL.H, marginLeft: -RL.W / 2, marginTop: -RL.H / 2 }}
          >
            <img src={caseAt(i).img} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <div className="cc-reel-floor" />
      <button className="cc-round cc-reel-prev" onClick={() => go(-1)} aria-label="Previous">
        ←
      </button>
      <button className="cc-round cc-reel-next" onClick={() => go(1)} aria-label="Next">
        →
      </button>
      <div className="cc-reel-caption">
        <span className="cc-mono is-quiet">
          {pad(active + 1)} / {TOTAL}
        </span>
        <span className="cc-reel-title">{c.title}</span>
        <span className="cc-tag" data-umm-tone={TONES[active % TONES.length]}>
          {c.industry}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- 03 Zoom-out */

const ZG = { COLS: 8, ROWS: 4, W: 140, H: 113, GAP: 10, FOCUS: 10, LOOP: 14000 }
const ZW = ZG.COLS * ZG.W + (ZG.COLS - 1) * ZG.GAP
const ZH = ZG.ROWS * ZG.H + (ZG.ROWS - 1) * ZG.GAP
const ZX = (CW - ZW) / 2
const ZY = 420 - ZH / 2

function ZoomOut({ on }: { on: boolean }) {
  const grid = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const t0 = useRef(0)

  const fc = ZG.FOCUS % ZG.COLS
  const fr = Math.floor(ZG.FOCUS / ZG.COLS)
  const cx = fc * (ZG.W + ZG.GAP) + ZG.W / 2
  const cy = fr * (ZG.H + ZG.GAP) + ZG.H / 2
  const dx = CW / 2 - ZX - cx
  const dy = CH / 2 - ZY - cy
  const S = (CW / ZG.W) * 1.02

  useFrame(on, (_dt, now) => {
    if (!t0.current) t0.current = now
    const t = ((now - t0.current) % ZG.LOOP) / 1000
    // u: 1 = the one project full screen, 0 = the whole wall
    let u = 1
    let tl = 0
    if (t < 2.4) u = 1
    else if (t < 5.6) u = 1 - ease((t - 2.4) / 3.2)
    else if (t < 6.6) u = 0
    else if (t < 8.4) ((u = 0), (tl = ease((t - 6.6) / 1.8)))
    else if (t < 11.6) ((u = 0), (tl = 1))
    else {
      const b = ease((t - 11.6) / 2.4)
      u = b
      tl = 1 - b
    }
    const s = Math.pow(S, u)
    const f = (s - 1) / (S - 1)
    if (grid.current) grid.current.style.transform = `translate(${dx * f}px, ${dy * f}px) scale(${s})`
    if (tilt.current) tilt.current.style.transform = `rotateX(${tl * 32}deg) scale(${1 + tl * 0.08})`
    if (intro.current) intro.current.style.opacity = String(clamp((u - 0.82) / 0.18, 0, 1))
    if (head.current) head.current.style.opacity = String(clamp((0.25 - u) / 0.25, 0, 1) * (1 - tl * 0.35))
  })

  const focus = caseAt(ZG.FOCUS)
  return (
    <div className="cc-zoom">
      <div className="cc-zoom-head" ref={head}>
        <h3>
          {TOTAL} projects. {INDUSTRIES} industries.
        </h3>
        <div className="cc-chips">
          {['All', ...GROUPS.map((g) => g.name)].map((g, i) => (
            <span key={g} className={`cc-chip ${i === 0 ? 'is-on' : ''}`}>
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="cc-zoom-persp">
        <div className="cc-zoom-tilt" ref={tilt} style={{ transformOrigin: `${CW / 2}px ${ZY + ZH / 2}px` }}>
          <div
            className="cc-zoom-grid"
            ref={grid}
            style={{
              left: ZX,
              top: ZY,
              width: ZW,
              height: ZH,
              transformOrigin: `${cx}px ${cy}px`,
              gridTemplateColumns: `repeat(${ZG.COLS}, ${ZG.W}px)`,
              gridAutoRows: `${ZG.H}px`,
              gap: ZG.GAP,
            }}
          >
            {Array.from({ length: ZG.COLS * ZG.ROWS }, (_, i) => (
              <div key={i} className="cc-zoom-cell" style={{ backgroundImage: `url(${caseAt(i).img})` }}>
                <span className="cc-tag is-tiny" data-umm-tone={TONES[i % TONES.length]}>
                  {caseAt(i).industry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="cc-zoom-intro" ref={intro}>
        <span className="cc-mono">Featured · {focus.industry}</span>
        <span className="cc-zoom-title">{focus.title}</span>
        <span className="cc-pill">Scroll to see all {TOTAL}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ 04 Mosaic */

const MO = { COLS: 10, ROWS: 5, S: 108, GAP: 10 }

/** a fixed scatter: which tiles hold a project, which a colour, and their corners */
function mosaicTiles() {
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  let n = 0
  return Array.from({ length: MO.COLS * MO.ROWS }, (_, i) => {
    const r = rnd()
    const kind = r < 0.36 ? 'case' : r < 0.72 ? 'tone' : r < 0.8 ? 'ink' : 'line'
    return {
      i,
      col: i % MO.COLS,
      row: Math.floor(i / MO.COLS),
      kind,
      c: kind === 'case' ? caseAt(n++) : undefined,
      tone: TONES[Math.floor(rnd() * TONES.length)],
      turn: Math.floor(rnd() * 4),
    }
  })
}

function Mosaic({ on }: { on: boolean }) {
  const tiles = useMemo(mosaicTiles, [])
  const [f, setF] = useState(-1)
  const [spin, setSpin] = useState(0)
  const hold = useRef(0)
  const wait = useRef(0)

  useFrame(on, (dt) => {
    if (hold.current > 0) {
      hold.current -= dt
      return
    }
    wait.current += dt
    if (wait.current > 3600) {
      wait.current = 0
      setF((p) => (p + 2) % (GROUPS.length + 1) - 1)
      setSpin((s) => s + 1)
    }
  })

  const pick = (g: number) => {
    setF(g)
    setSpin((s) => s + 1)
    hold.current = 9000
  }
  const lit = (c?: Case) => !!c && (f < 0 || groupOf(c) === f)
  const count = f < 0 ? TOTAL : tiles.filter((t) => t.c && groupOf(t.c) === f).length
  const W = MO.COLS * MO.S + (MO.COLS - 1) * MO.GAP

  return (
    <div className="cc-mosaic">
      <div className="cc-chips cc-mosaic-chips">
        {['All', ...GROUPS.map((g) => g.name)].map((g, i) => (
          <button key={g} className={`cc-chip ${i - 1 === f ? 'is-on' : ''}`} onClick={() => pick(i - 1)}>
            {g}
          </button>
        ))}
      </div>
      <div
        className="cc-mosaic-board"
        style={{
          width: W,
          gridTemplateColumns: `repeat(${MO.COLS}, ${MO.S}px)`,
          gridAutoRows: `${MO.S}px`,
          gap: MO.GAP,
        }}
      >
        {tiles.map((t) => {
          const deg = (t.turn + spin) * 90
          const isLit = lit(t.c)
          const delay = (t.col + t.row) * 45
          return (
            <div
              key={t.i}
              className={`cc-mosaic-tile is-${t.kind} ${t.c && !isLit ? 'is-dim' : ''}`}
              data-umm-tone={t.tone}
              style={{ transform: `rotate(${deg}deg)`, transitionDelay: `${delay}ms` }}
              title={t.c?.title}
            >
              {t.c && (
                <div
                  className="cc-mosaic-img"
                  style={{
                    backgroundImage: `url(${t.c.img})`,
                    transform: `rotate(${-deg}deg)`,
                    transitionDelay: `${delay}ms`,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="cc-mosaic-caption">
        <span className="cc-mono">{f < 0 ? 'All work' : GROUPS[f].name}</span>
        <span className="cc-mono is-quiet">
          {count} {count === 1 ? 'project' : 'projects'}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 05 Index */

const IX = { TOP: 168, ROW: 44, CARD_W: 320, CARD_H: 259 }

function Index({ on, k }: { on: boolean; k: number }) {
  const list = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const st = useRef({ x: 820, y: IX.TOP, tx: 820, ty: IX.TOP, real: false, t: 0 })
  const [row, setRow] = useState(0)

  useFrame(on, (dt) => {
    const s = st.current
    if (!s.real) {
      s.t += dt
      const n = ALL.length
      const per = 1500
      const ph = (s.t / per) % (2 * n - 2)
      const r = ph < n - 1 ? ph : 2 * n - 2 - ph
      const idx = Math.round(r)
      s.ty = IX.TOP + idx * IX.ROW + IX.ROW / 2
      s.tx = 760 + Math.sin(s.t / 1700) * 60
    }
    const a = 1 - Math.exp(-dt / 110)
    s.x += (s.tx - s.x) * a
    s.y += (s.ty - s.y) * a
    if (card.current)
      card.current.style.transform = `translate(${Math.min(s.x + 28, CW - IX.CARD_W - 24)}px, ${clamp(s.y - IX.CARD_H / 2, 40, CH - IX.CARD_H - 30)}px)`
    const r = clamp(Math.floor((s.ty - IX.TOP) / IX.ROW), 0, ALL.length - 1)
    setRow((p) => (p === r ? p : r))
  })

  const move = (e: PointerEvent) => {
    const box = list.current?.parentElement?.getBoundingClientRect()
    if (!box) return
    st.current.real = true
    st.current.tx = (e.clientX - box.left) / k
    st.current.ty = (e.clientY - box.top) / k
  }

  return (
    <div className="cc-index" onPointerMove={move} onPointerLeave={() => (st.current.real = false)}>
      <div className="cc-index-head">
        <h3>Selected work</h3>
        <span className="cc-mono is-quiet">
          {TOTAL} projects · {INDUSTRIES} industries
        </span>
      </div>
      <div className="cc-index-cols cc-mono is-quiet">
        <span>No.</span>
        <span>Outcome</span>
        <span>Industry</span>
        <span />
      </div>
      <div className="cc-index-list" ref={list} style={{ top: IX.TOP }}>
        {ALL.map((c, i) => (
          <div
            key={c.slug}
            className={`cc-index-row ${i === row ? 'is-on' : ''}`}
            data-umm-tone={TONES[i % TONES.length]}
            style={{ height: IX.ROW }}
          >
            <span className="cc-mono">{pad(i + 1)}</span>
            <span className="cc-index-title">{c.title}</span>
            <span className="cc-index-ind">{c.industry}</span>
            <span className="cc-index-arrow">→</span>
          </div>
        ))}
      </div>
      <div className="cc-index-card" ref={card} style={{ width: IX.CARD_W, height: IX.CARD_H }}>
        {ALL.map((c, i) => (
          <img key={c.slug} src={c.img} alt="" className={i === row ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------- 06 Fly-through */

const FT = { SP: 560, PERSP: 800, W: 330, H: 267 }
type Item = { kind: 'sign'; text: string } | { kind: 'card'; c: Case; side: number; lift: number }

function flyItems(): Item[] {
  const out: Item[] = []
  GROUPS.forEach((g, gi) => {
    out.push({ kind: 'sign', text: g.name })
    ALL.filter((c) => groupOf(c) === gi).forEach((c, j) =>
      out.push({ kind: 'card', c, side: j % 2 ? 1 : -1, lift: ((j * 37) % 3) - 1 }),
    )
  })
  return out
}

function FlyThrough({ on }: { on: boolean }) {
  const items = useMemo(flyItems, [])
  const els = useRef<(HTMLDivElement | null)[]>([])
  const floor = useRef<HTMLDivElement>(null)
  const st = useRef({ t: 0 })
  const [near, setNear] = useState(1)
  const LEN = items.length * FT.SP

  useFrame(on, (dt) => {
    const s = st.current
    s.t += dt * 0.32
    let best = -1
    let bz = -Infinity
    items.forEach((it, i) => {
      const el = els.current[i]
      if (!el) return
      const z = mod(-i * FT.SP + s.t, LEN) - (LEN - 420)
      const o = clamp((z + 6400) / 1600, 0, 1) * clamp((440 - z) / 260, 0, 1)
      el.style.opacity = String(o)
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      if (it.kind === 'card') {
        el.style.transform = `translate3d(${it.side * 290}px, ${it.lift * 46 - 30}px, ${z}px)`
        if (z < 120 && z > bz) ((bz = z), (best = i))
      } else el.style.transform = `translate3d(0px, -40px, ${z}px)`
    })
    if (floor.current) floor.current.style.backgroundPosition = `0px ${(s.t % 160).toFixed(1)}px`
    if (best >= 0) setNear((p) => (p === best ? p : best))
  })

  const it = items[near]
  return (
    <div className="cc-fly">
      <div className="cc-fly-scene" style={{ perspective: FT.PERSP }}>
        <div className="cc-fly-floor" ref={floor} />
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              els.current[i] = el
            }}
            className={`cc-fly-item is-${item.kind}`}
            style={
              item.kind === 'card'
                ? { width: FT.W, height: FT.H, marginLeft: -FT.W / 2, marginTop: -FT.H / 2 }
                : undefined
            }
          >
            {item.kind === 'card' ? <img src={item.c.img} alt="" /> : <span>{item.text}</span>}
          </div>
        ))}
      </div>
      {it && it.kind === 'card' && (
        <div className="cc-fly-caption">
          <span className="cc-mono is-quiet">{it.c.industry}</span>
          <span className="cc-fly-title">{it.c.title}</span>
        </div>
      )}
      <div className="cc-pill cc-fly-hint">Scroll to move through</div>
    </div>
  )
}

/* -------------------------------------------------------------- the page */

const CONCEPTS: {
  n: string
  name: string
  from: string
  what: string
  why: string
  watch: string
  draw: (on: boolean, k: number) => ReactNode
}[] = [
  {
    n: '01',
    name: 'Atlas',
    from: 'Griflan Labs, made light',
    what: 'All the projects on one curved paper grid, each a cluster of its screens with a pastel label tile, grouped by industry. Drag to roam; choosing an industry flies the view to it.',
    why: 'Shows our range in one look: 29 projects across 14 industries. White paper and hairlines in place of their black.',
    watch: 'Each project needs 3–5 images for its cluster (we hold one render each). Phones get a swipeable grid.',
    draw: (on, k) => <Atlas on={on} k={k} />,
  },
  {
    n: '02',
    name: 'Reel',
    from: 'byholm',
    what: 'One bent strip of large project cards, like a curved cinema screen on a soft studio floor. Scroll or swipe and the next project comes to the centre; its number, outcome and industry sit large below.',
    why: 'One project at a time, each given its moment. The live page’s card videos can play in the centre card.',
    watch: 'Slow to scan 29, so the industry filter does the work. Close in feel to the homepage ring.',
    draw: (on) => <Reel on={on} />,
  },
  {
    n: '03',
    name: 'Zoom-out',
    from: 'both, in one scroll',
    what: 'The page opens on one flagship project filling the screen. Scrolling pulls back until it is one tile in the wall of all 29, which then tips back into a table you can filter.',
    why: 'The scroll “journey” the boss asked for, and it ends on something practical: the full index.',
    watch: 'The opening project has to be our strongest; we choose it.',
    draw: (on) => <ZoomOut on={on} />,
  },
  {
    n: '04',
    name: 'Mosaic',
    from: 'the UMM mark',
    what: 'The work on a board of quarter-circle tiles (the shapes our mark is built from) mixed with brand-pastel and ink tiles. Choosing an industry turns every tile a quarter; its projects stay lit and the rest go pale.',
    why: 'Branded, not borrowed. Ties in with the mosaic hero on the industry pages.',
    watch: 'Each render is cut to a quarter circle, so less of the work shows.',
    draw: (on) => <Mosaic on={on} />,
  },
  {
    n: '05',
    name: 'Index',
    from: 'the enterprise list',
    what: 'A plain typographic list: number, outcome, industry. The row under the cursor lights in a pastel, and a card with that project’s render follows the cursor.',
    why: 'The fastest to scan and the most enterprise of the six. Simple on phones.',
    watch: 'The least flashy; its effect is the following card and the colour.',
    draw: (on, k) => <Index on={on} k={k} />,
  },
  {
    n: '06',
    name: 'Fly-through',
    from: 'byholm’s depth, Griflan’s grid',
    what: 'The projects hang in a white space over a floor grid. Scrolling carries you forward past them, with an industry sign opening each “room”.',
    why: 'Immersive and memorable; the most “experience” of the six.',
    watch: 'Hard to use as a list. Best for 10–12 picks, with the full list under it.',
    draw: (on) => <FlyThrough on={on} />,
  },
]

export function CaseConcepts() {
  return (
    <main className="cc-page">
      <header className="cc-top">
        <span className="cc-mono is-quiet">Case studies · main page</span>
        <h1>Six concepts</h1>
        <p>
          Rough sketches of the idea only, not the design. Each runs on its own; drag the Atlas, use the arrows on
          the Reel, click the Mosaic’s filters, move over the Index. Twelve of the 29 renders, so some repeat.
        </p>
        <nav className="cc-jump">
          {CONCEPTS.map((c) => (
            <a key={c.n} href={`#c${c.n}`}>
              {c.n} {c.name}
            </a>
          ))}
        </nav>
      </header>
      {CONCEPTS.map((c) => (
        <section key={c.n} id={`c${c.n}`} className="cc-concept">
          <div className="cc-copy">
            <div className="cc-name">
              <span className="cc-num">{c.n}</span>
              <h2>{c.name}</h2>
              <span className="cc-from">from {c.from}</span>
            </div>
            <p className="cc-what">{c.what}</p>
            <dl>
              <dt>For UMM</dt>
              <dd>{c.why}</dd>
              <dt>Watch</dt>
              <dd>{c.watch}</dd>
            </dl>
          </div>
          <Stage>{c.draw}</Stage>
        </section>
      ))}
    </main>
  )
}
