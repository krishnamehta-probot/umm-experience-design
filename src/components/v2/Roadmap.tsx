import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { Shape } from './Shape'
import type { ShapeName } from './shapes.data'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { process } from '@/content/cxUiDesign'

/* ============================================================================
   7a · HOW WE WORK — the roadmap

   "From first call to launch, in five steps", drawn as the road it is. A
   road winds across the section from "First call" through five milestones,
   past the Launch flag at Deliver, and carries on off the edge after Improve
   (improving does not end). Flat pastels only, as the brand does it.

   The section pins and each milestone is a magnetic stop
   (lib/useMagneticStops). A "you are here" marker drives along the road to
   the stop's milestone; the road behind it fills with the five pastels in
   turn, the road ahead stays a dashed planned route. Each milestone has a
   signpost: a dashed outline while it is ahead, filled in its pastel once
   reached, so by the last stop the whole roadmap reads at once. Clicking a
   signpost drives there.

   Phones and reduced motion: the road runs down the left of a list, and each
   stretch fills as its milestone scrolls into view (reduced motion: all
   filled).
   ========================================================================== */

const NUMERALS: ShapeName[] = ['number-1', 'number-2', 'number-3', 'number-4', 'number-5']
const TONES = ['sun', 'sky', 'blossom', 'citrus', 'coral'] as const
const STEPS = process.steps.length

/* The drawing: a 1200 x 560 box. The road enters bottom left, passes the
   five milestones and leaves on the right. */
const W = 1200
const H = 560
const START: [number, number] = [-60, 430]
const PINS: [number, number][] = [
  [130, 352],
  [368, 210],
  [612, 342],
  [858, 200],
  [1090, 334],
]
const END: [number, number] = [1290, 230]
/** Signposts stand on the outside of each bend, clear of the road: above a
 *  high milestone, below a low one. */
const ABOVE = PINS.map(([, y]) => y < H / 2)

/** A smooth road through the points (Catmull-Rom, as cubic Béziers). */
function road(points: [number, number][]) {
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`
  }
  return d
}
const ROAD = road([START, ...PINS, END])

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function Roadmap() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = stopAt(progress, STEPS)
  const glideTo = useMagneticStops(ref, STEPS, pinMode)

  return (
    <section
      className="umm-section umm-pin cx-road"
      id="process"
      ref={ref}
      data-mode={pinMode ? 'scroll' : 'list'}
      style={{ ['--umm-pin-steps' as string]: STEPS }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container cx-road__inner">
          <div className="cx-head cx-head--tight">
            <ChipHead
              line1={process.line1}
              line2={withAccent(process.line2, process.accent)}
              chip={process.chip}
              tone="blossom"
              chipAt="40%"
              tilt={7}
              lineRecipe={0}
              chipRecipe={1}
            />
            <p className="cx-lead">{process.lead}</p>
          </div>

          {pinMode ? <RoadMap stop={stop} onPick={glideTo} /> : <RoadList reduced={reduced} />}
        </div>
      </div>
    </section>
  )
}

/* --- wide screens: the road across the section ---------------------------- */

function RoadMap({ stop, onPick }: { stop: number; onPick: (i: number) => void }) {
  const path = useRef<SVGPathElement>(null)
  const done = useRef<SVGPathElement>(null)
  const marker = useRef<HTMLSpanElement>(null)
  const geo = useRef<{ total: number; at: number[] } | null>(null)
  const shown = useRef(0)
  const tween = useRef(0)
  const stopNow = useRef(stop)
  stopNow.current = stop

  /* Put the marker and the filled road at a distance along the road. */
  const place = useCallback((len: number) => {
    const p = path.current
    const g = geo.current
    if (!p || !g || !done.current || !marker.current) return
    shown.current = len
    done.current.style.strokeDashoffset = String(g.total - len)
    const pt = p.getPointAtLength(len)
    const ahead = p.getPointAtLength(Math.min(g.total, len + 2))
    const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI
    marker.current.style.left = `${(pt.x / W) * 100}%`
    marker.current.style.top = `${(pt.y / H) * 100}%`
    marker.current.style.setProperty('--heading', `${angle.toFixed(1)}deg`)
  }, [])

  /* Where along the road each milestone sits. */
  useLayoutEffect(() => {
    const p = path.current
    if (!p) return
    const total = p.getTotalLength()
    const at = PINS.map(([x, y]) => {
      let best = 0
      let bestD = Infinity
      for (let l = 0; l <= total; l += 2) {
        const q = p.getPointAtLength(l)
        const d = (q.x - x) ** 2 + (q.y - y) ** 2
        if (d < bestD) {
          bestD = d
          best = l
        }
      }
      return best
    })
    geo.current = { total, at }
    if (done.current) done.current.style.strokeDasharray = `${total} ${total}`
    // Start at the milestone the page is on; every move after this drives.
    place(at[stopNow.current])
  }, [place])

  /* Drive to the stop's milestone. */
  useEffect(() => {
    const g = geo.current
    if (!g) return
    cancelAnimationFrame(tween.current)
    const from = shown.current
    const to = g.at[stop]
    if (Math.abs(to - from) < 1) return place(to)
    const dur = Math.min(1600, 700 + Math.abs(to - from) * 0.9)
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      place(from + (to - from) * easeInOut(t))
      if (t < 1) tween.current = requestAnimationFrame(step)
    }
    tween.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(tween.current)
  }, [stop, place])

  return (
    <div className="cx-road__map">
      <div className="cx-road__box">
        <svg className="cx-road__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <defs>
            <linearGradient id="cx-road-fill" x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0.08" stopColor="var(--umm-sun)" />
              <stop offset="0.3" stopColor="var(--umm-sky)" />
              <stop offset="0.52" stopColor="var(--umm-blossom)" />
              <stop offset="0.72" stopColor="var(--umm-citrus)" />
              <stop offset="0.92" stopColor="var(--umm-coral)" />
            </linearGradient>
          </defs>
          {/* the road itself: a white band with a soft edge */}
          <path className="cx-road__shadow" d={ROAD} />
          <path className="cx-road__base" d={ROAD} ref={path} />
          {/* the stretch travelled, in the pastels */}
          <path className="cx-road__done" d={ROAD} ref={done} />
          {/* the centre line: dashed all the way, the planned route */}
          <path className="cx-road__lane" d={ROAD} />
        </svg>

        <span className="cx-road__start" style={{ left: '1.5%', top: '66%' }}>
          First call
        </span>

        {process.steps.map((step, i) => {
          const [x, y] = PINS[i]
          const state = i < stop ? 'past' : i === stop ? 'here' : 'ahead'
          return (
            <div
              key={step.title}
              className="cx-mile"
              data-umm-tone={TONES[i]}
              data-state={state}
              data-above={ABOVE[i]}
              style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` } as CSSProperties}
            >
              <span className="cx-mile__pin" aria-hidden="true">
                <svg viewBox="0 0 20 20">
                  <path d="M5 10.5 8.5 14 15 6.5" />
                </svg>
              </span>
              {i === 3 ? (
                <span className="cx-mile__flag" aria-hidden="true">
                  <i />
                  <b>Launch</b>
                </span>
              ) : null}
              <button
                type="button"
                className="cx-mile__sign"
                onClick={() => onPick(i)}
                aria-current={state === 'here' ? 'step' : undefined}
              >
                <span className="cx-mile__head">
                  <span className="cx-mile__num" aria-hidden="true">
                    <Shape name={NUMERALS[i]} />
                  </span>
                  <span className="cx-mile__step">Step {String(i + 1).padStart(2, '0')}</span>
                </span>
                <span className="cx-mile__title">{step.title}</span>
                <span className="cx-mile__body">{step.body}</span>
              </button>
            </div>
          )
        })}

        <span className="cx-road__onward" aria-hidden="true">
          and on
        </span>

        <span className="cx-road__marker" ref={marker} aria-hidden="true">
          <i />
        </span>
      </div>
    </div>
  )
}

/* --- phones and reduced motion: the road down the side of a list ---------- */

function RoadList({ reduced }: { reduced: boolean }) {
  const list = useRef<HTMLOListElement>(null)
  const [reached, setReached] = useState(() => (reduced ? STEPS : 0))

  useEffect(() => {
    if (reduced) {
      setReached(STEPS)
      return
    }
    const items = Array.from(list.current?.children ?? [])
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = items.indexOf(e.target)
          if (e.isIntersecting) setReached((r) => Math.max(r, i + 1))
          else if (e.boundingClientRect.top > 0) setReached((r) => Math.min(r, i))
        }
      },
      { rootMargin: '0px 0px -45% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [reduced])

  return (
    <ol className="cx-road__list" ref={list}>
      {process.steps.map((step, i) => (
        <li
          key={step.title}
          className="cx-mile"
          data-umm-tone={TONES[i]}
          data-state={i < reached ? 'past' : 'ahead'}
        >
          <span className="cx-mile__pin" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M5 10.5 8.5 14 15 6.5" />
            </svg>
          </span>
          <div className="cx-mile__sign">
            <span className="cx-mile__head">
              <span className="cx-mile__num" aria-hidden="true">
                <Shape name={NUMERALS[i]} />
              </span>
              <span className="cx-mile__step">
                Step {String(i + 1).padStart(2, '0')}
                {i === 3 ? ' · Launch' : ''}
              </span>
            </span>
            <span className="cx-mile__title">{step.title}</span>
            <span className="cx-mile__body">{step.body}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
