import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type CSSProperties,
} from 'react'
import type { RouteContent, RouteStop } from '@/content/fintech'
import '@/styles/route.css'

/* ============================================================================
   THE ROUTE — one payment, start to finish (Krish, 5 Nov: "go ahead and
   create one version")

   The page is built on one idea: a payment is sent in the hero and travels
   down the page, and each section is a stop on its way. The engine is the
   same for every industry; only the traveller and its stops change
   (content: `route`).

     SendCard    in the hero: the payment, and the button that sends it.
                 Scrolling on without pressing it sends it anyway.
     RouteLayer  the route itself: one line from the card, along the gap
                 under the hero's words, down the left gutter past every
                 section, and across under the close into the receipt. The
                 payment rides it with the scroll and rests at each stop;
                 the line behind it is drawn in ink, the line ahead dashed.
     Stamp       in each section's head, the stop: status, time, a note.
     Receipt     at the close, filling in as the stops are passed; the
                 payment docks into it at the end.

   The line only runs where nothing is: the gutter (widened for it), the gap
   between the hero's words and its base line, and the space under the
   close. It never crosses a word. The geometry is measured from the layout
   (offsets, not boxes, so reveals and transforms don't move it) and redrawn
   whenever the page changes size.
   ========================================================================== */

type Ctx = {
  content: RouteContent
  sentAt: number | null
  reached: ReadonlySet<string>
  send: () => void
  reach: (id: string) => void
  time: (stop: RouteStop) => string
}

const RouteCtx = createContext<Ctx | null>(null)

const clock = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

export function RouteProvider({ content, children }: { content: RouteContent; children: ReactNode }) {
  const [sentAt, setSentAt] = useState<number | null>(null)
  const [reached, setReached] = useState<ReadonlySet<string>>(() => new Set())
  const reach = useCallback(
    (id: string) => setReached((r) => (r.has(id) ? r : new Set(r).add(id))),
    [],
  )
  const send = useCallback(() => {
    setSentAt((t) => t ?? Date.now())
    reach('top')
  }, [reach])
  const time = useCallback((s: RouteStop) => (sentAt == null ? '--:--:--' : clock(sentAt + s.dt * 1000)), [sentAt])
  const value = useMemo(() => ({ content, sentAt, reached, send, reach, time }), [content, sentAt, reached, send, reach, time])
  return <RouteCtx.Provider value={value}>{children}</RouteCtx.Provider>
}

export const useRoute = () => useContext(RouteCtx)

/** the stop for a section, when the page has a route */
export function useRouteStop(id: string) {
  const r = useRoute()
  if (!r) return null
  const stop = r.content.stops.find((s) => s.at === id)
  if (!stop) return null
  return { stop, reached: r.reached.has(id), time: r.time(stop) }
}

/* --- the stamp in a section's head ------------------------------------------ */

export function Stamp({ id }: { id: string }) {
  const s = useRouteStop(id)
  if (!s) return null
  return (
    <p className="ip-stamp" data-on={s.reached || undefined} aria-hidden={!s.reached}>
      <span className="ip-stamp__status" data-umm-tone={s.stop.tone}>
        {s.stop.status}
      </span>
      <span className="ip-stamp__time">{s.time}</span>
      <span className="ip-stamp__note">{s.stop.note}</span>
    </p>
  )
}

/* --- the hero's card ------------------------------------------------------- */

export function SendCard() {
  const r = useRoute()
  if (!r) return null
  const c = r.content.card
  const sent = r.sentAt != null
  const first = r.content.stops[0]
  return (
    <div className="rt-card" data-route-start data-sent={sent || undefined}>
      <div className="rt-card__top">
        <p className="ip-label">{c.label}</p>
        <p className="rt-card__eta">{sent ? `${c.follow} ↓` : c.eta}</p>
      </div>
      <p className="rt-card__amount">{c.amount}</p>
      <div className="rt-card__to">
        <span className="rt-card__avatar" aria-hidden="true">
          {c.to[0]}
        </span>
        <span>
          <b>{c.to}</b>
          <small>{c.place}</small>
        </span>
      </div>
      <button type="button" className="rt-card__send" onClick={r.send} disabled={sent}>
        {sent ? (
          <>
            <Check />
            {c.sent} · <span className="rt-card__time">{r.time(first)}</span>
          </>
        ) : (
          <>
            {c.send}
            <Arrow />
          </>
        )}
      </button>
    </div>
  )
}

/* --- the receipt at the close ---------------------------------------------- */

export function Receipt() {
  const r = useRoute()
  if (!r) return null
  const { card, receipt, stops } = r.content
  const done = r.reached.has('contact')
  const last = stops[stops.length - 1]
  const secs = last.dt
  const total = secs >= 60 ? `${Math.floor(secs / 60)} min ${secs % 60} s` : `${secs} s`
  return (
    <div className="rt-receipt" data-route-end data-done={done || undefined}>
      <div className="rt-receipt__head">
        <span className="rt-receipt__mark" aria-hidden="true">
          {done ? <Check /> : <i />}
        </span>
        <div>
          <p className="rt-receipt__title">{done ? receipt.done : receipt.pending}</p>
          <p className="rt-receipt__sub">
            {card.to} · {card.place}
          </p>
        </div>
        <p className="rt-receipt__amount">{card.amount}</p>
      </div>
      <ol className="rt-receipt__log">
        {stops.map((s) => {
          const on = r.reached.has(s.at)
          return (
            <li key={s.at} data-on={on || undefined}>
              <i data-umm-tone={s.tone} />
              <span className="rt-receipt__status">{s.status}</span>
              <span className="rt-receipt__note">{s.note}</span>
              <time>{on ? r.time(s) : '—'}</time>
            </li>
          )
        })}
      </ol>
      <div className="rt-receipt__foot">
        <span>{receipt.total}</span>
        <b>{done ? total : '—'}</b>
      </div>
    </div>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

/* --- the route ----------------------------------------------------------------- */

type Seg =
  | { k: 'l'; x1: number; y1: number; x2: number; y2: number; len: number }
  | { k: 'a'; cx: number; cy: number; r: number; a0: number; a1: number; len: number }

type Station = {
  id: string
  L: number
  x: number
  y: number
  trig: number
  rail: boolean
  tone: string
  state: RouteStop['state']
}

type Geo = {
  w: number
  h: number
  d: string
  segs: Seg[]
  total: number
  stations: Station[]
  /** where the payment waits once sent, before the scroll moves it */
  waitL: number
  railX: number
  gutter: number
  td: number
  nd: number
}

/** where `el` sits inside `root`, by layout alone */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y }
}

function build(root: HTMLElement, stops: RouteStop[]): Geo | null {
  const sec = root.querySelector<HTMLElement>('.ip-sec')
  const end = root.querySelector<HTMLElement>('[data-route-end]')
  const main = root.querySelector<HTMLElement>('main')
  if (!sec || !end || !main) return null
  const gutter = parseFloat(getComputedStyle(sec).paddingLeft) || 16
  const railX = Math.round(gutter / 2)
  const r = Math.max(6, Math.min(16, gutter * 0.3))
  const segs: Seg[] = []
  let d = ''
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    segs.push({ k: 'l', x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) })
    d += `${d ? '' : `M${x1} ${y1}`}L${x2} ${y2}`
  }
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    segs.push({ k: 'a', cx, cy, r, a0, a1, len: r * Math.abs(a1 - a0) })
    d += `A${r} ${r} 0 0 ${a1 > a0 ? 1 : 0} ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`
  }
  const sum = () => segs.reduce((s, g) => s + g.len, 0)

  const stations: Station[] = []
  const stop = (id: string) => stops.find((s) => s.at === id)
  const toneOf = (id: string) => `var(--umm-${stop(id)?.tone ?? 'sky'})`

  /* the start: under the hero's card, along the gap under its words, to the
     gutter; without the card (other heroes, narrow windows) the top of the
     first section */
  const card = root.querySelector<HTMLElement>('[data-route-start]')
  const cardOn = !!card && card.offsetParent !== null && card.offsetWidth > 0
  let railY0: number
  let waitL = 0
  if (cardOn) {
    const c = offsetIn(card, root)
    const sx = c.x + card.offsetWidth / 2
    const sy = c.y + card.offsetHeight
    const base = root.querySelector<HTMLElement>('.fh__base')
    const gapY = Math.round(base ? (sy + offsetIn(base, root).y) / 2 : sy + 24)
    line(sx, sy, sx, gapY - r)
    arc(sx - r, gapY - r, 0, Math.PI / 2)
    line(sx - r, gapY, railX + r, gapY)
    arc(railX + r, gapY + r, -Math.PI / 2, -Math.PI)
    railY0 = gapY + r
    waitL = sum()
    stations.push({ id: 'top', L: 0, x: sx, y: sy, trig: sy, rail: false, tone: toneOf('top'), state: 'ok' })
  } else {
    railY0 = offsetIn(main, root).y
    d = `M${railX} ${railY0}`
    stations.push({ id: 'start', L: 0, x: railX, y: railY0, trig: railY0, rail: false, tone: toneOf('top'), state: 'ok' })
  }
  const railL0 = sum()

  /* the end: down past the close, across under it, up into the receipt */
  const e = offsetIn(end, root)
  const ex = Math.round(e.x + end.offsetWidth / 2)
  const ey = e.y + end.offsetHeight
  const stage = end.closest<HTMLElement>('.ip-next__stage') ?? end
  const copy = end.closest('.ip-sec')?.querySelector<HTMLElement>('.ip-next__copy')
  const below = Math.max(
    offsetIn(stage, root).y + stage.offsetHeight,
    copy ? offsetIn(copy, root).y + copy.offsetHeight : 0,
  )
  const endY = Math.round(below + Math.min(40, gutter * 0.5 + 12))

  /* the stops on the way: level with each section's name */
  for (const s of stops) {
    if (s.at === 'top' || s.at === 'contact') continue
    const eb = root.querySelector<HTMLElement>(`#${s.at} .ip-head .ip-eyebrow`)
    if (!eb) continue
    const y = Math.round(offsetIn(eb, root).y + eb.offsetHeight / 2)
    if (y <= railY0 || y >= endY - r) continue
    stations.push({ id: s.at, L: railL0 + (y - railY0), x: railX, y, trig: y, rail: true, tone: toneOf(s.at), state: s.state })
  }

  line(railX, railY0, railX, endY - r)
  arc(railX + r, endY - r, Math.PI, Math.PI / 2)
  line(railX + r, endY, ex - r, endY)
  arc(ex - r, endY - r, Math.PI / 2, 0)
  line(ex, endY - r, ex, ey)
  const total = sum()
  stations.push({ id: 'contact', L: total, x: ex, y: ey, trig: ey, rail: false, tone: toneOf('contact'), state: 'done' })

  return {
    w: root.offsetWidth,
    h: root.offsetHeight,
    d,
    segs,
    total,
    stations,
    waitL,
    railX,
    gutter,
    td: Math.round(Math.max(12, Math.min(32, gutter * 0.36))),
    nd: Math.round(Math.max(6, Math.min(12, gutter * 0.14))),
  }
}

function pointAt(g: Geo, L: number) {
  let left = Math.max(0, Math.min(L, g.total))
  for (const s of g.segs) {
    if (left <= s.len || s === g.segs[g.segs.length - 1]) {
      const t = s.len ? Math.min(1, left / s.len) : 0
      if (s.k === 'l') return { x: s.x1 + (s.x2 - s.x1) * t, y: s.y1 + (s.y2 - s.y1) * t }
      const a = s.a0 + (s.a1 - s.a0) * t
      return { x: s.cx + s.r * Math.cos(a), y: s.cy + s.r * Math.sin(a) }
    }
    left -= s.len
  }
  return { x: 0, y: 0 }
}

const ease = (t: number) => t * t * (3 - 2 * t)

/** where on the route the payment should be, for a reading line at `Y`
 *  (page px, half way down the window): it rests at each stop while the
 *  section's name is near the line, and travels between them */
function target(g: Geo, Y: number, vh: number) {
  const st = g.stations
  const P = Math.min(vh * 0.1, 90)
  /* the last stop has to be reachable: the page can only scroll so far */
  const maxY = g.h - vh * 0.5
  const trig = st.map((s) => s.trig)
  trig[trig.length - 1] = Math.min(st[st.length - 1].trig - vh * 0.12, maxY - P - 8)
  for (let i = 1; i < trig.length; i++) trig[i] = Math.max(trig[i], trig[i - 1] + 2 * P + 1)
  if (Y <= trig[0] + P) return st[0].L
  for (let i = 0; i < st.length - 1; i++) {
    const a = trig[i] + P
    const b = trig[i + 1] - P
    if (Y <= b) return st[i].L + (st[i + 1].L - st[i].L) * ease(Math.max(0, Math.min(1, (Y - a) / Math.max(1, b - a))))
    if (Y <= trig[i + 1] + P) return st[i + 1].L
  }
  return st[st.length - 1].L
}

const GLYPH: Record<RouteStop['state'], string> = { ok: '£', held: '£', flag: '!', done: '✓' }

export function RouteLayer({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const r = useRoute()!
  const [geo, setGeo] = useState<Geo | null>(null)
  const geoRef = useRef<Geo | null>(null)
  geoRef.current = geo
  const trail = useRef<SVGPathElement>(null)
  const token = useRef<HTMLDivElement>(null)
  const live = useRef({ sentAt: r.sentAt, reached: r.reached, send: r.send, reach: r.reach })
  live.current = { sentAt: r.sentAt, reached: r.reached, send: r.send, reach: r.reach }
  const stops = r.content.stops

  /* the geometry, from the layout, whenever the page changes size */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setGeo(build(root, stops)))
    }
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    document.fonts?.ready.then(measure)
    measure()
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [rootRef, stops])

  /* the payment, riding the route with the scroll */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let L = 0
    let last = performance.now()
    let raf = 0
    let shown = ''
    let ping = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const g = geoRef.current
      const tk = token.current
      if (!g || !tk) return
      const vh = window.innerHeight
      const top = root.getBoundingClientRect().top + window.scrollY
      const Y = window.scrollY + vh * 0.5 - top
      const { sentAt, reached, send, reach } = live.current
      /* scrolling on without pressing send sends it */
      if (sentAt == null && window.scrollY > vh * 0.25) send()
      const sent = sentAt != null
      const want = sent ? Math.max(target(g, Y, vh), g.waitL) : 0
      const dt = Math.min(now - last, 64) / 1000
      last = now
      L = still ? want : L + (want - L) * (1 - Math.exp(-dt * 6))
      if (Math.abs(want - L) < 0.05) L = want
      const p = pointAt(g, L)
      tk.style.transform = `translate3d(${p.x - g.td / 2}px, ${p.y - g.td / 2}px, 0)`
      trail.current?.setAttribute('stroke-dasharray', `${Math.max(0, L)} ${g.total + 20}`)
      /* the stops passed: stamped once, for good; the payment looks the
         way the last one passed says */
      let at = g.stations[0]
      for (const s of g.stations) {
        if (L < s.L - 0.5) break
        at = s
        if (sent && !reached.has(s.id) && s.id !== 'start') {
          reach(s.id)
          if (!still) {
            tk.dataset.ping = ''
            window.clearTimeout(ping)
            ping = window.setTimeout(() => delete tk.dataset.ping, 900)
          }
        }
      }
      const key = `${sent}|${at.state}|${at.tone}`
      if (key !== shown) {
        shown = key
        if (sent) tk.dataset.sent = ''
        tk.dataset.state = at.state
        tk.style.setProperty('--tone', at.tone)
        tk.firstElementChild!.textContent = GLYPH[at.state]
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(ping)
    }
  }, [rootRef])

  return (
    <div
      className="rt"
      aria-hidden="true"
      style={geo ? ({ height: geo.h, '--td': `${geo.td}px`, '--nd': `${geo.nd}px` } as CSSProperties) : undefined}
    >
      {geo && (
        <>
          <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
            <path className="rt-base" d={geo.d} />
            <path ref={trail} className="rt-trail" d={geo.d} strokeDasharray={`0 ${geo.total + 20}`} />
          </svg>
          {geo.stations
            .filter((s) => s.rail)
            .map((s) => {
              const on = r.reached.has(s.id) || undefined
              return (
                <span key={s.id}>
                  <span
                    className="rt-spur"
                    data-on={on}
                    style={{ left: s.x + geo.nd / 2 + 4, top: s.y, width: Math.max(0, geo.gutter - s.x - geo.nd / 2 - 7) }}
                  />
                  <span className="rt-node" data-on={on} style={{ left: s.x, top: s.y, '--umm-tone': s.tone } as CSSProperties} />
                </span>
              )
            })}
        </>
      )}
      <div ref={token} className="rt-token">
        <span>£</span>
      </div>
    </div>
  )
}
