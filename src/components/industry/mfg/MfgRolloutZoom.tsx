import { memo, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { rollout } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { Head } from './Head'
import { scrollThrough, useProgress } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 09 · FROM PILOTS TO OPERATING IMPACT, the zoom
   (Krish, 16 Nov: "make this section also nicer", and of three ideas he
   chose this one)

   The idea of Powers of Ten. The section pins, and scrolling down pulls the
   camera out of one machine to the whole estate, one step at each scale:

     machine   01 choose the lever: one press, its scrap rate pinned against
               a baseline
     line      02 connect the data: the line's four machines wired into one
               shared record, asset, lot and time running up the wires
     plant     03 validate: the plant, a shift sweeping across it, the line
               checked shift by shift
     network   04 embed and repeat: the plant's other lines take the
               pattern, then the routes run out to four more plants, which
               light in turn

   The estate is one drawing (world units below) and the camera is its
   viewBox, eased between the four framings, with hairlines that stay
   hairlines at every scale (non-scaling strokes). Each scale's detail
   fades in only around its own framing. Beside it: how much is in view,
   counting up as you pull out (1 machine to 60), and the four steps, the
   one at this scale open. The scale bar on the stage works like a map's:
   pick a scale to go there.

   The version before, the estate plan stepping by itself, is kept as
   MfgRollout (?rollout=estate).
   ========================================================================== */

type Box = { cx: number; cy: number; w: number; h: number }

/* the camera's four framings, in world units */
const FRAME: Box[] = [
  { cx: 740, cy: 444, w: 150, h: 96 },
  { cx: 780, cy: 420, w: 400, h: 150 },
  { cx: 800, cy: 490, w: 470, h: 340 },
  { cx: 800, cy: 505, w: 1640, h: 1060 },
]

/* scroll → scale: a rest at each scale, the pull between them */
const STOPS = [
  [0, 0.1],
  [0.28, 0.38],
  [0.56, 0.66],
  [0.84, 1],
]

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** where along the four scales the scroll is, 0–3 */
function level(p: number) {
  for (let k = 0; k < STOPS.length; k++) {
    if (p <= STOPS[k][1]) return k
    const next = STOPS[k + 1]
    if (next && p < next[0]) return k + ease((p - STOPS[k][1]) / (next[0] - STOPS[k][1]))
  }
  return STOPS.length - 1
}

/** the camera at a point between scales: the width eased on a log scale,
 *  so the pull feels even all the way out */
function camera(L: number, aspect: number) {
  const k = Math.min(FRAME.length - 2, Math.floor(L))
  const t = L - k
  const a = FRAME[k]
  const b = FRAME[k + 1]
  const lerp = (x: number, y: number) => x + (y - x) * t
  const loglerp = (x: number, y: number) => Math.exp(lerp(Math.log(x), Math.log(y)))
  const w = loglerp(a.w, b.w)
  const h = loglerp(a.h, b.h)
  const cx = lerp(a.cx, b.cx)
  const cy = lerp(a.cy, b.cy)
  const bw = Math.max(w, h * aspect)
  const bh = bw / aspect
  return `${(cx - bw / 2).toFixed(2)} ${(cy - bh / 2).toFixed(2)} ${bw.toFixed(2)} ${bh.toFixed(2)}`
}

/* --- the estate ----------------------------------------------------------------------------- */

const MX = [0, 80, 160, 240]

/** a plant: its sheet, its name, three lines of four machines */
function PlantLines({ x, w, rows, id }: { x: number; w: number; rows: number[]; id: string }) {
  return (
    <>
      {rows.map((ry, li) => (
        <g key={ry} className="mz-line" style={{ '--li': li } as CSSProperties}>
          <path className="mz-track" d={`M${x + 20} ${ry + 18}H${x + w - 20}`} />
          {MX.map((mx, m) => (
            <rect
              key={mx}
              className="mz-m"
              data-pilot={id === 'A' && li === 0 && m === 1 ? '' : undefined}
              data-row={id === 'A' && li === 0 ? '' : undefined}
              x={x + 40 + mx}
              y={ry - 14}
              width="40"
              height="28"
              rx="5"
            />
          ))}
        </g>
      ))}
    </>
  )
}

const OTHERS = [
  { id: 'B', x: 110, y: 80, d: 'M600 400C470 400 520 200 410 200' },
  { id: 'C', x: 1190, y: 80, d: 'M1000 400C1110 400 1080 200 1190 200' },
  { id: 'D', x: 110, y: 700, d: 'M600 600C470 600 520 810 410 810' },
  { id: 'E', x: 1190, y: 700, d: 'M1000 600C1110 600 1080 810 1190 810' },
]

/** the whole estate, drawn once; the camera moves over it */
const World = memo(function World() {
  return (
    <>
      {/* 04 · the network: the routes out and the four other plants */}
      <g className="mz-l3">
        {OTHERS.map((o, k) => (
          <g key={o.id} style={{ '--k': k } as CSSProperties}>
            <path className="mz-route" d={o.d} />
            <circle className="mz-runner" r="7">
              <animateMotion dur="3.2s" begin={`${k * 0.5}s`} repeatCount="indefinite" path={o.d} />
            </circle>
            <rect className="mz-plant" x={o.x} y={o.y} width="300" height="240" rx="22" />
            <text className="mz-name" x={o.x + 22} y={o.y + 40}>
              {`Plant ${o.id}`}
            </text>
            <g className="mz-copy" style={{ '--k': k } as CSSProperties}>
              {[o.y + 90, o.y + 140, o.y + 190].map((ry, li) => (
                <g key={ry}>
                  <path className="mz-track" d={`M${o.x + 20} ${ry + 18}H${o.x + 280}`} />
                  {[0, 60, 120, 180].map((mx) => (
                    <rect key={mx} className="mz-m mz-m--far" style={{ '--li': li } as CSSProperties} x={o.x + 40 + mx} y={ry - 12} width="40" height="24" rx="5" />
                  ))}
                </g>
              ))}
            </g>
          </g>
        ))}
        <text className="mz-name" x="620" y="326">
          Plant A / Pilot
        </text>
      </g>

      {/* Plant A, the pilot */}
      <rect className="mz-plant" x="600" y="340" width="400" height="300" rx="20" />
      <text className="mz-t mz-l2" x="620" y="364">
        Plant A / Pilot
      </text>
      <PlantLines x={600} w={400} rows={[440, 510, 580]} id="A" />

      {/* 03 · the plant: a shift sweeping across, the line checked shift by shift */}
      <g className="mz-l2">
        <rect className="mz-sweep" x="600" y="342" width="70" height="296" />
        {['A', 'B', 'C'].map((s, k) => {
          const x = 932 + k * 22
          return (
            <g key={s} className={`mz-pass mz-pass--${k}`}>
              <circle className="mz-ok" cx={x} cy="404" r="8" />
              <path className="mz-ok-tick" d={`M${x - 3.8} 404.3l2.6 2.6 5-5.4`} />
              <text className="mz-t mz-t--shift" x={x} y="422" textAnchor="middle">
                {s}
              </text>
            </g>
          )
        })}
      </g>

      {/* 02 · the line: its four machines wired into one shared record */}
      <g className="mz-l1">
        <rect className="mz-record" x="736" y="378" width="88" height="22" rx="6" />
        <text className="mz-t mz-t--rec" x="780" y="392.6" textAnchor="middle">
          Shared record
        </text>
        {MX.map((mx, m) => {
          const x0 = 660 + mx
          const x1 = 756 + m * 16
          const d = `M${x0} 426C${x0} 412 ${x1} 414 ${x1} 400`
          return (
            <g key={mx}>
              <path className="mz-wire" d={d} />
              <circle className="mz-bit" r="2.2">
                <animateMotion dur="1.6s" begin={`${m * 0.3}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          )
        })}
      </g>

      {/* 01 · the machine: the press working, its scrap pinned against a baseline */}
      <g className="mz-l0">
        <g className="mz-ram">
          <path d="M740 428v4" />
          <rect x="730" y="432" width="20" height="5" rx="1.4" />
        </g>
        <rect className="mz-part" x="734" y="447" width="12" height="3.4" rx="1" />
        <text className="mz-read" x="704" y="470">
          Scrap 4.2%
        </text>
        <text className="mz-t mz-t--small" x="704" y="477">
          Baseline / 30 days
        </text>
        <path className="mz-base" d="M704 481h72" />
        <path className="mz-now" d="M704 481h30" />
      </g>

      {/* the lever, pinned to the pilot machine (01, 02) */}
      <g className="mz-pin">
        <path d="M740 424c-4.6-4.6-6.6-8-6.6-11.2a6.6 6.6 0 0 1 13.2 0c0 3.2-2 6.6-6.6 11.2z" />
        <circle cx="740" cy="412.8" r="2.2" />
      </g>
    </>
  )
})

/* --- the section --------------------------------------------------------------------------- */

export function MfgRolloutZoom() {
  const c = rollout
  const z = c.zoom
  const n = z.levels.length
  const { ref, p } = useProgress<HTMLElement>()
  const stage = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [aspect, setAspect] = useState(1.6)

  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      if (width && height) setAspect(width / height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const L = level(p)
  const i = Math.round(L)
  const lv = z.levels[i]

  /* the camera, straight onto the drawing (no re-render of the estate) */
  useLayoutEffect(() => {
    svg.current?.setAttribute('viewBox', camera(L, aspect))
  }, [L, aspect])

  /* how much is in view, counting up on the same log scale */
  const k = Math.min(n - 2, Math.floor(L))
  const t = L - k
  const count = Math.round(Math.exp(Math.log(z.levels[k].count) + (Math.log(z.levels[k + 1].count) - Math.log(z.levels[k].count)) * t))

  /* each scale's detail, only around its own framing */
  const vars: Record<string, string | number> = { '--L': L.toFixed(3) }
  for (let s = 0; s < n; s++) vars[`--o${s}`] = clamp(1 - Math.abs(L - s) * 1.8).toFixed(3)
  vars['--o3'] = clamp((L - 2.4) / 0.6).toFixed(3)
  vars['--pin'] = clamp(1.8 - L * 1.1).toFixed(3)

  const go = (s: number) => scrollThrough(ref.current, (STOPS[s][0] + STOPS[s][1]) / 2)

  return (
    <section id={c.id} ref={ref} className="mz" style={{ '--n': n } as CSSProperties} aria-labelledby="mz-title">
      <div className="mz__pin">
        <Head id="mz-title" head={c.head} />

        <div className="mz__body" data-level={i}>
          <div className="mz__side">
            <p className="mz__count" aria-live="polite">
              <b>{count}</b>
              <span>
                {count === 1 ? z.unit[0] : z.unit[1]}
                <em>{lv.where}</em>
              </span>
            </p>
            <ol className="mz__steps">
              {c.steps.map((s, k) => (
                <li key={s.title} data-on={k === i || undefined} data-done={k < i || undefined}>
                  <button type="button" aria-current={k === i || undefined} onClick={() => go(k)}>
                    <span className="mz__num">{pad(k)}</span>
                    <span className="mz__title">{s.title}</span>
                    <span className="mz__text">{s.body}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div ref={stage} className="mz__stage" style={vars as CSSProperties}>
            <svg ref={svg} className="mz-world" viewBox={camera(0, aspect)} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <World />
            </svg>

            <p className="ff-glass mz__tag" key={i}>
              {lv.tag}
            </p>

            {/* the scale bar, as on a map */}
            <div className="mz__scale" style={{ '--L': L } as CSSProperties}>
              <i aria-hidden="true" />
              {z.levels.map((x, s) => (
                <button key={x.name} type="button" data-on={s === i || undefined} onClick={() => go(s)}>
                  {x.name}
                </button>
              ))}
            </div>

            <ul className="mz__chips" key={`c${i}`}>
              {lv.chips.map((x, s) => (
                <li key={x} data-on={(i === 0 && s === 0) || undefined} style={{ '--k': s } as CSSProperties}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
