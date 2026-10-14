import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import '@/styles/ai-workflow.css'
import { AiHead } from './AiHead'
import { gsap } from '@/lib/gsap'
import { usePinProgress } from '@/lib/usePinProgress'
import { PIN_V2, usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { workflow, type WorkflowScenario } from '@/content/aiAutomation'

/* ============================================================================
   INSIDE A WORKING AI WORKFLOW — a pinned control room

   The heading and lead sit in normal flow above. Only the control room pins:
   the scenario tabs, the track and the caption, on the viewport below the nav.

   The track is measured in pixels and laid out in three bands that never
   overlap:
     top     the extracted fields, as chips (stop 0 and 1)
     middle  the invoice above the rail; the rail, its three stations and their
             labels; the fork; the two terminal bays on the right
     bottom  the records panel under station 2 (stop 1); the three station
             rules docked under the stations (stop 3)

   One invoice travels the rail with the scroll. Four magnetic stops:
     stop 0  at station 1 — a scan beam, the fields pop out as chips
     stop 1  at station 2 — the records panel opens; chips carry tick marks
     stop 2  through the fork into its bay — stamped; the status shows
     stop 3  the station rules dock; the invoice rests in its bay

   Changing the scenario tweens the fork (back.out 1.7, 0.5 s); the invoice and
   the light re-route with it if they are already past it.

   Phones pin too (13 Oct): the same room on the same four stops, folded
   into three bands that fit an upright phone (PhoneRoom): the rail with its
   stations and the two bays across the top, the invoice under it, and under
   that whatever the stop brings (the fields, the records, the routing, the
   station rules). Phones on their side and reduced motion: nothing pins; the
   same content is a plain list.
   ========================================================================== */

type Content = typeof workflow
type Scenario = WorkflowScenario
type Pt = [number, number]

const STOPS = 4

/* --- geometry, in px of the track ---------------------------------------- */

/* the rail sits at this height in a track of 440px; taller tracks spread it */
const RAIL_BASE = 194
const CARD_W = 240
const CARD_TOP = 54
const CARD_H = 92
/* the card rides this far above the rail: its centre to the rail */
const CARD_LIFT = RAIL_BASE - (CARD_TOP + CARD_H / 2)
/* bays: 12 pad | docked card (0.8 x 240) | 16 gap | status | 12 pad */
const DOCK_SCALE = 0.8
const DOCK_W = CARD_W * DOCK_SCALE
const DOCK_CX = 12 + DOCK_W / 2
const BAY_W = 12 + DOCK_W + 16 + 150 + 12
const BAY_H = 140
const BAY_TOP = 14
const PRIN_W = 200
const PRIN_TOP = 62
const REC_W = 300
/* the chip row is one line, 500px wide, kept 16px inside the track */
const CHIPS_W = 500

const STATION_FRAC: [number, number, number] = [0.1, 0.3, 0.5]
const FORK_FRAC = 0.6
const TONE = ['sky', 'lilac', 'sun'] as const

type Geo = { w: number; h: number }

/* station 1 keeps the docked-width card 16px inside the track */
const stationX = (w: number, i: number) => Math.max(w * STATION_FRAC[i], i === 0 ? CARD_W / 2 + 16 : 0)

const railY = (h: number) => RAIL_BASE + Math.max(0, Math.min(40, (h - 440) / 2))
/** Bay centre height: the upper bay is ready (m 0), the lower is hold (m 1). */
const bayY = (h: number, m: number) => {
  const upper = BAY_TOP + BAY_H / 2
  const lower = h - BAY_TOP - BAY_H / 2
  return upper + (lower - upper) * m
}
const bayLeft = (w: number) => Math.max(w * FORK_FRAC + 60, w - BAY_W - 8)

/** The route, in px: station 1, 2, 3, the fork, the bay entrance, the docked card. */
function route(g: Geo, m: number): Pt[] {
  const r = railY(g.h)
  const bl = bayLeft(g.w)
  const y = bayY(g.h, m)
  return [
    [stationX(g.w, 0), r],
    [g.w * STATION_FRAC[1], r],
    [g.w * STATION_FRAC[2], r],
    [g.w * FORK_FRAC, r],
    [bl, y],
    [bl + DOCK_CX, y],
  ]
}

/** Where the invoice is along the route. u 0 at station 1, 1 at station 2, 2 docked. */
function locate(u: number, pts: Pt[]) {
  const legs: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    legs.push(l)
    total += l
  }
  const v = Math.min(2, Math.max(0, u))
  let d = v <= 1 ? v * legs[0] : legs[0] + (v - 1) * (total - legs[0])
  const trail: Pt[] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const l = legs[i - 1]
    if (d <= l) {
      const t = l ? d / l : 0
      const p: Pt = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
      trail.push(p)
      return { p, trail }
    }
    d -= l
    trail.push(pts[i])
  }
  return { p: pts[pts.length - 1], trail }
}

const amount = (s: string) => Number(s.replace(/[^\d]/g, ''))
const dollars = (n: number) => `$${n.toLocaleString('en-US')}`
const px = (n: number) => `${Math.round(n)}px`

/* --- icons --------------------------------------------------------------- */

const ICON = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const Sparkle = () => (
  <svg {...ICON}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </svg>
)
const Shield = () => (
  <svg {...ICON}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)
const People = () => (
  <svg {...ICON}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
    <circle cx="16.5" cy="9" r="2.4" />
    <path d="M15.5 14.2c2.4.2 4.2 2 4.8 4.6" />
  </svg>
)
const Doc = () => (
  <svg {...ICON}>
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v4h4" />
    <path d="M9.5 12h5M9.5 15.5h5" />
  </svg>
)
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)
const Bang = () => (
  <svg {...ICON}>
    <path d="M12 5v9" />
    <path d="M12 18.5v.5" />
  </svg>
)
const Pause = () => (
  <svg {...ICON}>
    <path d="M9 6v12M15 6v12" />
  </svg>
)
const Data = () => (
  <svg {...ICON}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
)
const Pulse = () => (
  <svg {...ICON}>
    <path d="M3 12h4l2.5-5 4 10 2.5-5H21" />
  </svg>
)
const Person = () => (
  <svg {...ICON}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.8 3.4-6 7-6s6.2 2.2 7 6" />
  </svg>
)

const STATION_ICON = [Sparkle, Shield, People]
const PRINCIPLE_ICON = { data: Data, check: Shield, pulse: Pulse } as const

function StateIcon({ state }: { state: 'done' | 'flag' | 'hold' }) {
  if (state === 'flag') return <Bang />
  if (state === 'hold') return <Pause />
  return <Check />
}

/* --- pieces -------------------------------------------------------------- */

function Mark({ kind }: { kind: 'ok' | 'flag' }) {
  return (
    <span className={`ai-flow__mark ai-flow__mark--${kind}`} aria-hidden="true">
      {kind === 'ok' ? <Check /> : <Bang />}
    </span>
  )
}

function Stamp({ outcome }: { outcome: Scenario['outcome'] }) {
  return (
    <span className="ai-flow__stamp" data-state={outcome} aria-hidden="true">
      <Person />
      <span className="ai-flow__stamp-badge">{outcome === 'ready' ? <Check /> : <Pause />}</span>
    </span>
  )
}

function InvoiceCard({ demo, scen, stamped = false }: { demo: Content['demo']; scen: Scenario; stamped?: boolean }) {
  return (
    <div className="ai-flow__card">
      <span className="ai-flow__beam" aria-hidden="true" />
      <div className="ai-flow__card-top">
        <Doc />
        <strong className="ai-flow__card-supplier">{demo.supplier}</strong>
        <span className="ai-flow__card-no">{demo.invoiceNo}</span>
      </div>
      <div className="ai-flow__card-row">
        <span>{demo.fields.po}</span>
        <b className="ai-flow__roll" key={`po-${scen.id}`}>
          {scen.po}
        </b>
      </div>
      <div className="ai-flow__card-row">
        <span>{demo.fields.amount}</span>
        <b className="ai-flow__roll" key={`amt-${scen.id}`}>
          {scen.amount}
        </b>
      </div>
      {stamped ? <Stamp key={scen.id} outcome={scen.outcome} /> : null}
    </div>
  )
}

/* --- phones: the room folded into three bands ----------------------------- */

/* the rail across the top band, at this height */
const P_RAIL = 40
/* stations, fork and bays as shares of the track's width */
const P_ST: [number, number, number] = [0.11, 0.35, 0.59]
const P_FORK = 0.73
const P_BAY = 0.79
/* the bays sit this far above (ready) and below (hold) the rail */
const P_BAY_DY = 22
/* the invoice's band */
const P_CARD_TOP = 92

function phoneRoute(w: number, m: number): Pt[] {
  const y = P_RAIL + (m * 2 - 1) * P_BAY_DY
  return [
    [w * P_ST[0], P_RAIL],
    [w * P_ST[1], P_RAIL],
    [w * P_ST[2], P_RAIL],
    [w * P_FORK, P_RAIL],
    /* the light stops at the bay's door, not on its label */
    [w * P_BAY - 8, y],
    [w * P_BAY - 4, y],
  ]
}

type RoomProps = {
  w: number
  h: number
  u: number
  m: number
  stop: number
  scen: Scenario
  content: Content
  glideTo: (stop: number) => void
}

/** The pinned control room on an upright phone: the same stops, three bands. */
function PhoneRoom({ w, h, u, m, stop, scen, content, glideTo }: RoomProps) {
  const { demo, principles } = content
  const missing = scen.flag === 'po'
  const mismatch = scen.flag === 'amount'
  const pts = phoneRoute(w, m)
  const { p: pos, trail } = locate(u, pts)
  const fork = w * P_FORK
  const switchEnd: Pt = [fork + (w * P_BAY - fork) * 0.45, P_RAIL + (m * 2 - 1) * P_BAY_DY * 0.45]
  const cardW = Math.min(300, w - 32)
  const cardLeft = (w - cardW) / 2
  const below = P_CARD_TOP + 118
  const chipVals = [demo.supplier, demo.invoiceNo, scen.po, scen.amount]
  const chipMark = (i: number): 'ok' | 'flag' | null => {
    if (i === 2) return missing ? 'flag' : 'ok'
    if (i === 3) return mismatch ? 'flag' : missing ? null : 'ok'
    return 'ok'
  }
  const poValue = amount(demo.poValue)
  const invValue = amount(scen.amount)
  const poShare = poValue / Math.max(poValue, invValue)
  const gapText = dollars(Math.abs(invValue - poValue))
  const docked = stop >= 2
  const outState = scen.outcome === 'ready' ? 'done' : 'hold'

  return (
    <>
      <svg className="ai-flow__wires" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <polyline className="ai-flow__ghost" points={`${pts[0][0]},${P_RAIL} ${fork},${P_RAIL}`} />
        <polyline
          className="ai-flow__ghost ai-flow__ghost--branch"
          points={`${fork},${P_RAIL} ${w * P_BAY},${P_RAIL - P_BAY_DY}`}
        />
        <polyline
          className="ai-flow__ghost ai-flow__ghost--branch"
          points={`${fork},${P_RAIL} ${w * P_BAY},${P_RAIL + P_BAY_DY}`}
        />
        <polyline className="ai-flow__trail" points={trail.map((q) => q.join(',')).join(' ')} />
        <polyline className="ai-flow__switch" points={`${fork},${P_RAIL} ${switchEnd[0]},${switchEnd[1]}`} />
      </svg>
      <span className="ai-flow__pivot" style={{ left: px(fork), top: px(P_RAIL) }} aria-hidden="true" />

      {/* the two bays: ready above the rail, hold below */}
      {(['ready', 'hold'] as const).map((o) => (
        <span
          key={o}
          className="ai-flow__pbay"
          data-umm-tone={o === 'ready' ? 'citrus' : 'coral'}
          data-active={scen.outcome === o && docked}
          style={{ left: px(w * P_BAY), top: px(P_RAIL + (o === 'ready' ? -P_BAY_DY : P_BAY_DY)) }}
          aria-hidden="true"
        >
          {o === 'ready' ? 'Ready' : 'Hold'}
        </span>
      ))}

      {P_ST.map((f, i) => {
        const Icon = STATION_ICON[i]
        return (
          <button
            key={i}
            type="button"
            className="ai-flow__station"
            data-umm-tone={TONE[i]}
            data-lit={stop >= i || undefined}
            data-on={stop === i || undefined}
            style={{ left: px(w * f), top: px(P_RAIL) }}
            onClick={() => glideTo(i)}
            aria-current={stop === i ? 'step' : undefined}
          >
            <Icon />
            <span className="ai-flow__station-label">{['AI', 'Rules', 'People'][i]}</span>
          </button>
        )
      })}
      <span
        className="ai-flow__light"
        aria-hidden="true"
        style={{ left: px(pos[0]), top: px(pos[1]), opacity: u >= 2 ? 0 : 1 }}
      />

      {/* the invoice, under the rail */}
      <div className="ai-flow__invoice" style={{ left: px(cardLeft), top: px(P_CARD_TOP), width: px(cardW) }}>
        <InvoiceCard demo={demo} scen={scen} stamped={docked} />
      </div>

      {/* stops 0 and 1: the fields the AI read, marked once the rules checked them */}
      <div className="ai-flow__chips ai-flow__chips--fold" style={{ left: px(cardLeft), top: px(below), width: px(cardW) }}>
        {chipVals.map((v, i) => {
          const mk = chipMark(i)
          const slot = i === 2 && missing
          return (
            <div
              key={`${scen.id}-${i}`}
              className={`ai-flow__chip${slot ? ' ai-flow__chip--slot' : ''}`}
              style={{ ['--i' as string]: i } as CSSProperties}
            >
              <span className="ai-flow__chip-in">
                {slot ? (
                  <Bang />
                ) : (
                  <span className="ai-flow__roll" key={v}>
                    {v}
                  </span>
                )}
              </span>
              {mk ? <Mark kind={mk} /> : null}
            </div>
          )
        })}
      </div>

      {/* stop 1: the records it is checked against */}
      <div className="ai-flow__records" style={{ left: px(cardLeft), top: px(below), width: px(cardW) }}>
        <div className="ai-flow__rec">
          <span className="ai-flow__rec-label">{demo.fields.po}</span>
          {missing ? (
            <span className="ai-flow__slot" aria-hidden="true" />
          ) : (
            <span className="ai-flow__rec-value ai-flow__roll">{scen.po}</span>
          )}
          {missing ? <Mark kind="flag" /> : <Mark kind="ok" />}
        </div>
        <div className="ai-flow__cmp">
          {!missing ? (
            <>
              <div className="ai-flow__cmp-line">
                <span className="ai-flow__rec-label">{demo.fields.poValue}</span>
                <span className="ai-flow__rec-value ai-flow__roll">{demo.poValue}</span>
              </div>
              <div className="ai-flow__cmp-bar">
                <i className="ai-flow__cmp-po" style={{ width: `${Math.round(poShare * 100)}%` }} />
              </div>
            </>
          ) : null}
          <div className="ai-flow__cmp-line">
            <span className="ai-flow__rec-label">{demo.fields.amount}</span>
            <span className="ai-flow__rec-value ai-flow__roll">{scen.amount}</span>
            {mismatch ? <Mark kind="flag" /> : !missing ? <Mark kind="ok" /> : null}
          </div>
          <div className={`ai-flow__cmp-bar${mismatch ? ' ai-flow__cmp-bar--gap' : ''}`}>
            <i className="ai-flow__cmp-inv" style={{ width: '100%' }} />
            {mismatch ? (
              <b
                className="ai-flow__cmp-gap"
                style={{ left: `${Math.round(poShare * 100)}%`, width: `${Math.round((1 - poShare) * 100)}%` }}
              >
                <span>{gapText}</span>
              </b>
            ) : null}
          </div>
        </div>
      </div>

      {/* stop 2: where the person sent it */}
      <div
        className="ai-flow__routed"
        data-umm-tone={scen.outcome === 'ready' ? 'citrus' : 'coral'}
        style={{ left: px(cardLeft), top: px(below), width: px(cardW) }}
      >
        <span className="ai-flow__state" data-state={outState}>
          <StateIcon state={outState} />
        </span>
        <span className="ai-flow__routed-text">{scen.status}</span>
      </div>

      {/* stop 3: the station rules */}
      <div className="ai-flow__prules" style={{ left: px(cardLeft), top: px(below), width: px(cardW) }}>
        {principles.map((pr, i) => {
          const Icon = PRINCIPLE_ICON[pr.icon]
          return (
            <article
              key={pr.icon}
              className="ai-flow__principle"
              data-umm-tone={TONE[i]}
              style={{ ['--i' as string]: i } as CSSProperties}
            >
              <span className="ai-flow__principle-icon">
                <Icon />
              </span>
              <div>
                <h3 className="ai-flow__principle-title">
                  {pr.title[0]} <span>{pr.title[1]}</span>
                </h3>
                <p className="ai-flow__principle-body">{pr.body}</p>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

/* ============================================================================ */

export function InvoiceFlow({ content = workflow }: { content?: Content }) {
  const { demo, scenarios, roles, principles } = content
  const { ref, progress } = usePinProgress<HTMLDivElement>()
  const trackRef = useRef<HTMLDivElement>(null)
  const wide = usePinned(PIN_V2)
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = pinMode ? stopAt(progress, STOPS) : 0
  const u = pinMode ? Math.min(3, Math.max(0, progress * STOPS - 0.5)) : 0
  const glideTo = useMagneticStops(ref, STOPS, pinMode)

  /* the track's size in px: every position in the pinned control room uses it */
  const [box, setBox] = useState<Geo>({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const read = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pinMode])

  const [scenIdx, setScenIdx] = useState(0)
  const scen = scenarios[scenIdx]
  const missing = scen.flag === 'po'
  const mismatch = scen.flag === 'amount'

  /* the fork: 0 routes up to the ready bay, 1 down to the hold bay */
  const target = scen.outcome === 'hold' ? 1 : 0
  const [m, setM] = useState(target)
  const mNow = useRef(target)
  useEffect(() => {
    if (!pinMode) {
      mNow.current = target
      setM(target)
      return
    }
    const o = { v: mNow.current }
    const tw = gsap.to(o, {
      v: target,
      duration: 0.5,
      ease: 'back.out(1.7)',
      onUpdate: () => {
        mNow.current = o.v
        setM(o.v)
      },
    })
    return () => {
      tw.kill()
    }
  }, [target, pinMode])

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pick = (i: number) => {
    setScenIdx(i)
    tabRefs.current[i]?.focus()
  }
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = scenarios.length
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (dir) {
      e.preventDefault()
      e.stopPropagation()
      pick((scenIdx + dir + n) % n)
    } else if (e.key === 'Home') {
      e.preventDefault()
      e.stopPropagation()
      pick(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      e.stopPropagation()
      pick(n - 1)
    }
  }

  const tabs = (
    <div className="ai-flow__tabs" role="tablist" aria-label={demo.scenariosLabel} onKeyDown={onTabKey}>
      {scenarios.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => {
            tabRefs.current[i] = el
          }}
          type="button"
          role="tab"
          id={`ai-flow-tab-${s.id}`}
          className="ai-flow__tab"
          aria-selected={i === scenIdx}
          tabIndex={i === scenIdx ? 0 : -1}
          onClick={() => setScenIdx(i)}
        >
          <span className="ai-flow__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="ai-flow__name">{s.label}</span>
        </button>
      ))}
    </div>
  )

  /* the heading is AiHead, in normal flow above the pin */
  const heading = (
    <div className="ai-flow__head umm-container">
      <AiHead
        chip={content.chip}
        line1={content.line1}
        line2={content.line2}
        accent={content.accent}
        tone="sun"
        lineRecipe={2}
      />
      <p className="cx-lead ai-flow__lead">{content.lead}</p>
    </div>
  )

  /* --- stack: phones, narrow screens, reduced motion ---------------------- */
  if (!pinMode) {
    return (
      <section className="umm-section ai-flow" id="workflow">
        {heading}
        <div className="umm-container ai-flow__plain">
          <div className="ai-flow__bar">
            {tabs}
            <span className="ai-flow__tag">{demo.tag}</span>
          </div>
          <div className="ai-flow__stack">
            <InvoiceCard demo={demo} scen={scen} />

            <ol className="ai-flow__steps">
              {scen.steps.map((step, i) => {
                const Icon = STATION_ICON[i]
                return (
                  <li key={step.title} className="ai-flow__step" data-umm-tone={TONE[i]}>
                    <span className="ai-flow__station-mini">
                      <Icon />
                    </span>
                    <span className="ai-flow__state" data-state={step.state}>
                      <StateIcon state={step.state} />
                    </span>
                    <div className="ai-flow__step-text">
                      <h3 className="ai-flow__cap-title">{step.title}</h3>
                      <p className="ai-flow__cap-body">{step.body}</p>
                      <span className="ai-flow__role">{roles[i]}</span>
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="ai-flow__status-card" data-state={scen.outcome}>
              <span className="ai-flow__status-line">{scen.status}</span>
              <p className="ai-flow__note-plain">{scen.note}</p>
            </div>

            <ol className="ai-flow__principles-stack">
              {principles.map((p) => {
                const Icon = PRINCIPLE_ICON[p.icon]
                return (
                  <li key={p.icon} className="ai-flow__principle">
                    <div className="ai-flow__principle-head">
                      <span className="ai-flow__principle-icon">
                        <Icon />
                      </span>
                      <h3 className="ai-flow__principle-title">
                        {p.title[0]} <span>{p.title[1]}</span>
                      </h3>
                    </div>
                    <p className="ai-flow__principle-body">{p.body}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>
    )
  }

  /* --- pinned control room --------------------------------------------- */

  const { w, h } = box
  /* phones and upright tablets: the room folds into bands (PhoneRoom); the
     wide room's bays need a desktop's width */
  const phone = w > 0 && (w < 600 || window.innerWidth < 900)
  const pts = w && h ? route({ w, h }, m) : ([[0, 0]] as Pt[])
  const { p: pos, trail } = locate(u, pts)
  const k = Math.min(1, Math.max(0, u - 1))
  const cardScale = 1 - (1 - DOCK_SCALE) * k
  const cardCy = pos[1] - CARD_LIFT * (1 - k)
  const rail = railY(h)
  const sx = [0, 1, 2].map((i) => stationX(w, i))
  const fork = w * FORK_FRAC
  const bl = bayLeft(w)
  const upperCy = bayY(h, 0)
  const lowerCy = bayY(h, 1)
  const switchEnd: Pt = [fork + (bl - fork) * 0.42, rail + (bayY(h, m) - rail) * 0.42]
  const chipsLeft = Math.min(Math.max(pos[0] - CHIPS_W / 2, 16), w - CHIPS_W - 16)
  const chipVals = [demo.supplier, demo.invoiceNo, scen.po, scen.amount]
  const cap = Math.min(stop, 2)
  const step = scen.steps[cap]

  const poValue = amount(demo.poValue)
  const invValue = amount(scen.amount)
  const top = Math.max(poValue, invValue)
  const poShare = poValue / top
  const gapText = dollars(Math.abs(invValue - poValue))
  const recLeft = sx[1] - REC_W / 2

  /* a chip's mark at stop 1: the tick the rules gave it, or the flag */
  const chipMark = (i: number): 'ok' | 'flag' | null => {
    if (i === 2) return missing ? 'flag' : 'ok'
    if (i === 3) return mismatch ? 'flag' : missing ? null : 'ok'
    return 'ok'
  }

  return (
    <section className="umm-section ai-flow" id="workflow">
      {heading}
      <div
        className="umm-pin ai-flow__pin"
        ref={ref}
        data-mode="scroll"
        style={{ ['--umm-pin-steps' as string]: STOPS } as CSSProperties}
      >
        <div className="umm-pin__stage">
          <div className="umm-container ai-flow__inner">
            <div className="ai-flow__bar">
              {tabs}
              <span className="ai-flow__tag">{demo.tag}</span>
            </div>

            <div className="ai-flow__track" data-stop={stop} data-fold={phone || undefined} ref={trackRef}>
              {w && h && phone ? (
                <PhoneRoom w={w} h={h} u={u} m={m} stop={stop} scen={scen} content={content} glideTo={glideTo} />
              ) : w && h ? (
                <>
                  <svg className="ai-flow__wires" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
                    <polyline className="ai-flow__ghost" points={`0,${rail} ${fork},${rail}`} />
                    <polyline
                      className="ai-flow__ghost ai-flow__ghost--branch"
                      points={`${fork},${rail} ${bl},${upperCy} ${bl + DOCK_CX},${upperCy}`}
                    />
                    <polyline
                      className="ai-flow__ghost ai-flow__ghost--branch"
                      points={`${fork},${rail} ${bl},${lowerCy} ${bl + DOCK_CX},${lowerCy}`}
                    />
                    <polyline className="ai-flow__trail" points={trail.map((q) => q.join(',')).join(' ')} />
                    <polyline className="ai-flow__switch" points={`${fork},${rail} ${switchEnd[0]},${switchEnd[1]}`} />
                  </svg>
                  <span className="ai-flow__pivot" style={{ left: px(fork), top: px(rail) }} aria-hidden="true" />

                  {/* the terminal bays: ready above, hold below */}
                  <div
                    className="ai-flow__bay"
                    data-umm-tone="citrus"
                    data-active={scen.outcome === 'ready'}
                    style={{ left: px(bl), top: px(BAY_TOP), width: px(BAY_W), height: px(BAY_H) }}
                  >
                    <span className="ai-flow__bay-status">{scen.outcome === 'ready' ? scen.status : ''}</span>
                  </div>
                  <div
                    className="ai-flow__bay"
                    data-umm-tone="coral"
                    data-active={scen.outcome === 'hold'}
                    style={{ left: px(bl), top: px(h - BAY_TOP - BAY_H), width: px(BAY_W), height: px(BAY_H) }}
                  >
                    <span className="ai-flow__bay-status">{scen.outcome === 'hold' ? scen.status : ''}</span>
                  </div>

                  {/* the three stations on the rail */}
                  {sx.map((x, i) => {
                    const Icon = STATION_ICON[i]
                    return (
                      <button
                        key={i}
                        type="button"
                        className="ai-flow__station"
                        data-umm-tone={TONE[i]}
                        data-lit={stop >= i || undefined}
                        data-on={stop === i || undefined}
                        style={{ left: px(x), top: px(rail) }}
                        onClick={() => glideTo(i)}
                        aria-current={stop === i ? 'step' : undefined}
                      >
                        <Icon />
                        <span className="ai-flow__station-label">{['AI', 'Rules', 'People'][i]}</span>
                      </button>
                    )
                  })}

                  {/* the extracted fields, above the card, with their marks */}
                  <div className="ai-flow__chips" style={{ left: px(chipsLeft), width: px(CHIPS_W) }}>
                    {chipVals.map((v, i) => {
                      const mk = chipMark(i)
                      const slot = i === 2 && missing
                      return (
                        <div
                          key={`${scen.id}-${i}`}
                          className={`ai-flow__chip${slot ? ' ai-flow__chip--slot' : ''}`}
                          style={{ ['--i' as string]: i } as CSSProperties}
                        >
                          <span className="ai-flow__chip-in">
                            {slot ? (
                              <Bang />
                            ) : (
                              <span className="ai-flow__roll" key={v}>
                                {v}
                              </span>
                            )}
                          </span>
                          {mk ? <Mark kind={mk} /> : null}
                        </div>
                      )
                    })}
                  </div>

                  {/* the records panel, below station 2 */}
                  <div className="ai-flow__records" style={{ left: px(recLeft), top: px(rail + PRIN_TOP) }}>
                    <div className="ai-flow__rec">
                      <span className="ai-flow__rec-label">{demo.fields.po}</span>
                      {missing ? (
                        <span className="ai-flow__slot" aria-hidden="true" />
                      ) : (
                        <span className="ai-flow__rec-value ai-flow__roll">{scen.po}</span>
                      )}
                      {missing ? <Mark kind="flag" /> : <Mark kind="ok" />}
                    </div>
                    {/* both amounts on one baseline: the PO value at 30% ink, the invoice in full ink */}
                    <div className="ai-flow__cmp">
                      {!missing ? (
                        <>
                          <div className="ai-flow__cmp-line">
                            <span className="ai-flow__rec-label">{demo.fields.poValue}</span>
                            <span className="ai-flow__rec-value ai-flow__roll">{demo.poValue}</span>
                          </div>
                          <div className="ai-flow__cmp-bar">
                            <i className="ai-flow__cmp-po" style={{ width: `${Math.round(poShare * 100)}%` }} />
                          </div>
                        </>
                      ) : null}
                      <div className="ai-flow__cmp-line">
                        <span className="ai-flow__rec-label">{demo.fields.amount}</span>
                        <span className="ai-flow__rec-value ai-flow__roll">{scen.amount}</span>
                        {mismatch ? <Mark kind="flag" /> : !missing ? <Mark kind="ok" /> : null}
                      </div>
                      <div className={`ai-flow__cmp-bar${mismatch ? ' ai-flow__cmp-bar--gap' : ''}`}>
                        <i className="ai-flow__cmp-inv" style={{ width: '100%' }} />
                        {mismatch ? (
                          <b
                            className="ai-flow__cmp-gap"
                            style={{
                              left: `${Math.round(poShare * 100)}%`,
                              width: `${Math.round((1 - poShare) * 100)}%`,
                            }}
                          >
                            <span>{gapText}</span>
                          </b>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* the invoice, riding the rail and docking in its bay */}
                  <div
                    className="ai-flow__invoice"
                    style={{
                      left: px(pos[0]),
                      top: px(cardCy),
                      transform: `translate(-50%, -50%) scale(${cardScale.toFixed(3)})`,
                    }}
                  >
                    <InvoiceCard demo={demo} scen={scen} stamped={stop >= 2} />
                  </div>
                  <span
                    className="ai-flow__light"
                    aria-hidden="true"
                    style={{ left: px(pos[0]), top: px(pos[1]), opacity: u >= 2 ? 0 : 1 }}
                  />

                  {/* the station rules, docked under the stations */}
                  {principles.map((p, i) => {
                    const Icon = PRINCIPLE_ICON[p.icon]
                    return (
                      <article
                        key={p.icon}
                        className="ai-flow__principle"
                        data-umm-tone={TONE[i]}
                        style={{ left: px(sx[i] - PRIN_W / 2), top: px(rail + PRIN_TOP), width: px(PRIN_W) }}
                      >
                        <div className="ai-flow__principle-head">
                          <span className="ai-flow__principle-icon">
                            <Icon />
                          </span>
                          <h3 className="ai-flow__principle-title">
                            {p.title[0]} <span>{p.title[1]}</span>
                          </h3>
                        </div>
                        <p className="ai-flow__principle-body">{p.body}</p>
                      </article>
                    )
                  })}
                </>
              ) : null}
            </div>

            <div className="ai-flow__caption" aria-live="polite">
              <div className="ai-flow__cap" key={`${scen.id}-${cap}`} data-umm-tone={TONE[cap]}>
                <span className="ai-flow__state" data-state={step.state} aria-label={step.state}>
                  <StateIcon state={step.state} />
                </span>
                <div className="ai-flow__cap-text">
                  <h3 className="ai-flow__cap-title">{step.title}</h3>
                  <p className="ai-flow__cap-body">{step.body}</p>
                  {stop >= 2 ? <p className="ai-flow__note">{scen.note}</p> : null}
                </div>
                <span className="ai-flow__role">{roles[cap]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
