import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { system } from '@/content/fintech'
import '@/styles/fin-final-system.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 05 · HOW IT CONNECTS (Krish, 6 Nov: "i am not
   getting what that section is all about… make sure that its perfectly
   interactive and great to enjoy… it needs to be bestly beautiful and easy
   to understand")

   The reference architecture as a guided tour. Pick a journey; its case then
   travels through the system one step at a time, so the diagram explains
   itself instead of asking to be read:

     stage   a dark system view. Three lanes, top to bottom: what people see
             (experiences), the work behind it (financial workflows), the
             records it touches (connected systems). Faint wires join the
             boxes that work together; at each step of "How the work moves"
             the boxes in play light, their wires light, and a glowing case
             runs along them, down for requests, up for outcomes. The
             direction labels light with it, and the identity and API spine
             lights as the case passes through it. AI assistance is a sweep
             along the workflow lane. Controls run along the foot.
     player  the four steps, stepping on by themselves (paused under the
             pointer; a pick or the pause button stops them). The exception
             path is a switch: the case turns aside at the checks, in coral,
             and the step list gives way to what happens and the context
             that travels with the case
     side    the AI assistance in the journey, with AI operations; and how
             AI changes the journey, friction to contribution to impact.
             The journey's sentence sits beside the picker

   Wires and the case are drawn over the lanes in an SVG measured from the
   boxes themselves, so they stay true at any size. The copy is the final
   copy, every label included.
   ========================================================================== */

type Lane = 'e' | 'w' | 's'
type Key = `${Lane}${number}`
type Seg = [Key, Key]
type Box = { x: number; y: number; w: number; h: number }

/* the route the case takes at each step (the same shape for every journey:
   two experiences, three workflows, three systems) */
const ROUTES: Seg[][] = [
  [['e0', 'w0']],
  [
    ['w0', 'w1'],
    ['w0', 's0'],
    ['w1', 's1'],
  ],
  [
    ['e1', 'w2'],
    ['w2', 's0'],
  ],
  [
    ['s2', 'w2'],
    ['w2', 'e0'],
  ],
]
/* the exception: into the checks, and stopped there */
const EXCEPTION: Seg[] = [
  ['e0', 'w0'],
  ['w0', 'w1'],
]
const WIRES: Seg[] = [...ROUTES.flat()].filter(
  (s, i, all) => all.findIndex((o) => o[0] === s[0] && o[1] === s[1]) === i,
)

const LANE: Record<Lane, number> = { e: 0, w: 1, s: 2 }
const STEP_MS = 3600
const SEG_MS = 950
const SEG_GAP = 300
const HOLD = 900

/** which way each lane gap is crossed, for the direction labels */
function crossings(segs: Seg[]) {
  const on = new Set<string>()
  for (const [a, b] of segs) {
    const la = LANE[a[0] as Lane]
    const lb = LANE[b[0] as Lane]
    if (la === lb) continue
    const gap = Math.min(la, lb)
    on.add(`${gap}${lb > la ? 'down' : 'up'}`)
  }
  return on
}

function wire(g: Record<string, Box>, a: Key, b: Key) {
  const A = g[a]
  const B = g[b]
  if (!A || !B) return ''
  const la = LANE[a[0] as Lane]
  const lb = LANE[b[0] as Lane]
  if (la === lb) {
    const ltr = A.x < B.x
    const y = A.y + A.h / 2
    return `M${ltr ? A.x + A.w : A.x} ${y} L${ltr ? B.x : B.x + B.w} ${y}`
  }
  const down = lb > la
  const x1 = A.x + A.w / 2
  const y1 = down ? A.y + A.h : A.y
  const x2 = B.x + B.w / 2
  const y2 = down ? B.y : B.y + B.h
  const my = (y1 + y2) / 2
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function Spark() {
  return (
    <svg className="fs-spark" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 .8C8.6 5.2 10.8 7.4 15.2 8 10.8 8.6 8.6 10.8 8 15.2 7.4 10.8 5.2 8.6.8 8 5.2 7.4 7.4 5.2 8 .8z" />
    </svg>
  )
}

function Play({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {on ? <path d="M5 3.5v9M11 3.5v9" /> : <path d="M5 3.2v9.6L12.6 8z" />}
    </svg>
  )
}

export function FinalSystem() {
  const c = system
  const L = c.labels
  const [ji, setJi] = useState(0)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [exc, setExc] = useState(false)
  const [near, setNear] = useState<Key | null>(null)
  const j = c.journeys[ji]

  const stage = useRef<HTMLDivElement>(null)
  const lanes = useRef<HTMLDivElement>(null)
  const nodes = useRef<Partial<Record<Key, HTMLSpanElement | null>>>({})
  const [geo, setGeo] = useState<{ w: number; h: number; g: Record<string, Box> } | null>(null)

  const segs = exc ? EXCEPTION : ROUTES[step]
  const lit = new Set<string>(segs.flat())
  const crossed = crossings(segs)

  /* the loop's view of the state */
  const live = useRef({ playing, exc, over: false, seen: false, acc: 0, t0: 0 })
  live.current.playing = playing
  live.current.exc = exc
  const paths = useRef<(SVGPathElement | null)[]>([])
  const dots = useRef<(SVGCircleElement | null)[]>([])

  /* a new journey starts its tour from the top */
  useEffect(() => {
    setStep(0)
    live.current.acc = 0
  }, [ji])
  /* every change of route sends the case off again */
  useEffect(() => {
    live.current.t0 = performance.now()
  }, [ji, step, exc])

  /* measure the boxes, so the wires meet them exactly */
  useLayoutEffect(() => {
    const host = lanes.current
    if (!host) return
    const measure = () => {
      const b = host.getBoundingClientRect()
      const g: Record<string, Box> = {}
      for (const [k, el] of Object.entries(nodes.current)) {
        if (!el) continue
        const r = el.getBoundingClientRect()
        g[k] = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }
      }
      setGeo({ w: b.width, h: b.height, g })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    Object.values(nodes.current).forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [ji])

  /* one loop: the step timer (paused under the pointer, off screen, or
     once stopped) and the case running along the lit wires */
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const s = live.current
      const dt = Math.min(64, now - last)
      last = now
      if (s.playing && !s.over && !s.exc && !calm) {
        s.acc += dt
        if (s.acc >= STEP_MS) {
          s.acc = 0
          setStep((v) => (v + 1) % 4)
        }
      }
      el.style.setProperty('--p', s.playing && !s.exc ? (s.acc / STEP_MS).toFixed(4) : '1')
      const n = paths.current.length
      const cycle = SEG_GAP * Math.max(0, n - 1) + SEG_MS + HOLD
      const tt = (now - s.t0) % cycle
      for (let i = 0; i < n; i++) {
        const p = paths.current[i]
        const d = dots.current[i]
        if (!p || !d) continue
        const k = Math.min(1, Math.max(0, (tt - i * SEG_GAP) / SEG_MS))
        const len = p.getTotalLength()
        const at = p.getPointAtLength(ease(calm ? 1 : k) * len)
        d.setAttribute('cx', at.x.toFixed(1))
        d.setAttribute('cy', at.y.toFixed(1))
        d.style.opacity = calm ? '1' : k <= 0 || k >= 1 ? '0' : String(Math.min(1, Math.min(k, 1 - k) * 8))
      }
      if (s.seen) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      live.current.seen = e.isIntersecting
      if (e.isIntersecting) {
        last = performance.now()
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(tick)
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const go = (k: number) => {
    setExc(false)
    setStep(k)
    setPlaying(false)
    live.current.acc = 0
  }

  const node = (lane: Lane, k: number, label: string) => {
    const key = `${lane}${k}` as Key
    const on = lit.has(key)
    const warn = exc && key === 'w1'
    return (
      <span
        key={label}
        ref={(el) => {
          nodes.current[key] = el
        }}
        className="fs__node"
        data-on={on || undefined}
        data-warn={warn || undefined}
        onPointerEnter={() => setNear(key)}
        onPointerLeave={() => setNear(null)}
      >
        {label}
      </span>
    )
  }

  const [opsLabel, opsRest] = L.aiOps.split(' / ')
  /* only this step's wires carry the case */
  paths.current.length = segs.length
  dots.current.length = segs.length

  return (
    <section id={c.id} className="fs" aria-labelledby="fs-title">
      <div className="fr__top" data-umm-reveal>
        <div className="fr__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fs-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
        </div>
        <p className="fr__lead">{c.head.intro}</p>
      </div>

      <div className="fs__bar" data-umm-reveal>
      <div className="fs__pick" role="tablist" aria-label={L.reference}>
        {c.journeys.map((x, k) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={k === ji}
            onClick={() => {
              setJi(k)
              setExc(false)
              setPlaying(true)
            }}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="fs__sum" key={j.id}>
        {j.summary}
      </p>
      </div>

      <div className="fs__main" data-umm-reveal>
        {/* the system view */}
        <div
          ref={stage}
          className="fs__stage"
          data-exc={exc || undefined}
          onPointerEnter={() => (live.current.over = true)}
          onPointerLeave={() => (live.current.over = false)}
        >
          <p className="fs__stage-k">
            <i />
            {L.reference}
          </p>
          <div ref={lanes} className="fs__lanes" key={j.id}>
            <svg className="fs__wires" width={geo?.w ?? 0} height={geo?.h ?? 0} aria-hidden="true">
              {geo && (
                <>
                  {WIRES.map(([a, b]) => (
                    <path
                      key={a + b}
                      className="fs-wire"
                      data-near={near === a || near === b || undefined}
                      d={wire(geo.g, a, b)}
                    />
                  ))}
                  {segs.map(([a, b], i) => (
                    <path
                      key={`${step}${exc}${a}${b}`}
                      ref={(el) => {
                        paths.current[i] = el
                      }}
                      className="fs-wire fs-wire--on"
                      data-warn={(exc && b === 'w1') || undefined}
                      d={wire(geo.g, a, b)}
                    />
                  ))}
                  {segs.map(([a, b], i) => (
                    <circle
                      key={`d${step}${exc}${a}${b}`}
                      ref={(el) => {
                        dots.current[i] = el
                      }}
                      className="fs-case"
                      data-warn={(exc && b === 'w1') || undefined}
                      r="4.5"
                      cx="-20"
                      cy="-20"
                    />
                  ))}
                </>
              )}
            </svg>

            <p className="fs__label">{L.rows[0]}</p>
            <div className="fs__row" style={{ '--n': j.experiences.length } as CSSProperties}>
              {j.experiences.map((x, k) => node('e', k, x))}
            </div>

            <p className="fs__dir">
              <span data-on={crossed.has('0down') || undefined}>↓ {L.down1}</span>
              <span data-on={crossed.has('0up') || undefined}>↑ {L.up1}</span>
            </p>
            <div className="fs__gap" />

            <p className="fs__label">
              {L.rows[1]}
              <span className="fs__ai">
                <Spark />
                AI
              </span>
            </p>
            <div className="fs__row fs__row--ai" style={{ '--n': j.workflows.length } as CSSProperties}>
              {j.workflows.map((x, k) => node('w', k, x))}
            </div>

            <p className="fs__dir">
              <span data-on={crossed.has('1down') || undefined}>↓ {L.down2}</span>
              <span data-on={crossed.has('1up') || undefined}>↑ {L.up2}</span>
            </p>
            <div className="fs__gap fs__gap--spine" data-on={crossed.has('1down') || crossed.has('1up') || undefined}>
              {L.spine.map((s) => (
                <b key={s}>{s}</b>
              ))}
            </div>

            <p className="fs__label">{L.rows[2]}</p>
            <div className="fs__row" style={{ '--n': j.systems.length } as CSSProperties}>
              {j.systems.map((x, k) => node('s', k, x))}
            </div>

            <p className="fs__ctl">
              <span>{L.exchange}</span>
              <span>
                <b>{L.controls}</b> {L.controlsList}
              </span>
            </p>
          </div>

          {/* how the work moves */}
          <div className="fs__player">
            <div className="fs__player-head">
              <p>
                <b>{L.stepsHead}</b> <span>{L.stepsTag}</span>
              </p>
              <div className="fs__tools">
                <button
                  type="button"
                  className="fs__exc-btn"
                  aria-pressed={exc}
                  onClick={() => setExc((v) => !v)}
                >
                  ↳ {L.exception}
                </button>
                <button
                  type="button"
                  className="fs__play"
                  aria-label={playing && !exc ? 'Pause the walkthrough' : 'Play the walkthrough'}
                  onClick={() => {
                    if (exc) setExc(false)
                    setPlaying((v) => (exc ? true : !v))
                  }}
                >
                  <Play on={playing && !exc} />
                </button>
              </div>
            </div>
            {exc ? (
              <div className="fs__excbox" key={`x${j.id}`}>
                <p>{j.exception}</p>
                <p className="fs__ctx">
                  <b>{L.context}</b> {j.context}
                </p>
              </div>
            ) : (
              <ol className="fs__steps">
                {j.steps.map((s, k) => (
                  <li key={s}>
                    <button
                      type="button"
                      aria-current={k === step ? 'step' : undefined}
                      data-done={k < step || undefined}
                      onClick={() => go(k)}
                    >
                      <i>{k < step ? '✓' : k + 1}</i>
                      <span>{s}</span>
                      <em />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* the journey, its AI assistance, and what AI changes */}
        <aside className="fs__side" key={j.id}>
          <div className="fs__aicard">
            <p className="fs__k">
              <Spark />
              {L.ai.join(' ')}
            </p>
            <b>{j.ai.title}</b>
            <p>{j.ai.body}</p>
            <p className="fs__ops">
              <b>{opsLabel}</b> {opsRest}
            </p>
          </div>
          <div className="fs__change">
            <p className="fs__k">{L.changeHead}</p>
            <ol>
              {L.change.map((lab, k) => (
                <li key={lab} data-k={k}>
                  <small>{lab}</small>
                  <span>{j.change[k]}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <p className="fs__note">{L.note}</p>
    </section>
  )
}
