import type { CSSProperties } from 'react'
import type { OpsScene } from './OpsArt'

/* ============================================================================
   THE FINAL FINTECH PAGE — 04 · the operations cards' scenes, in fine line
   (Krish, 6 Nov: "have you seen the lottie animations… simple light lined
   animations… this feels too thick lined… I want something sleek and nice")

   Drawn the way line Lottie animations are made:

   · one hairline weight throughout (about 1.3px on screen), round caps and
     joins, ink only, with a single soft pastel fill or two
   · lines draw themselves on, as Lottie's trim paths do, in a stagger,
     hold, then draw themselves off the way they came, so the loop is
     seamless (one eight-second loop per scene)
   · ease in and out on every move, a small overshoot when a dot lands
   · a little secondary motion that never stops (a trace running, a ring
     turning, typing dots), so the scene is alive between the draws

     support  a conversation building up, bubble by bubble, the case history
              growing beside it as a thread of entries, and the thread running
              on to the person who can resolve it, who takes a check
     revops   adoption as a curve drawing up through four milestones
              (application, onboarding, activation, retention), each dropping a
              line to its symbol; a ping where relationships stall
     aiops    a monitor with its trace running, a prioritised queue drawing in
              under it, and the operating rhythm as a ring turning through
              alert, owner and resolution round the AI's spark

   (OpsArt.tsx keeps the first, bolder drawing; ?ops=bold on the page.)
   ========================================================================== */

/** when a piece starts in the loop, in seconds */
const t = (s: number) => ({ '--t': `${s}s` }) as CSSProperties

/** a smooth curve through points (Catmull-Rom, as cubic Béziers) */
function through(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)]
    const b = p[i]
    const c = p[i + 1]
    const e = p[Math.min(p.length - 1, i + 2)]
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0]} ${c[1]}`
  }
  return d
}

function Person({ x, y, s = 1, ms }: { x: number; y: number; s?: number; ms?: number }) {
  return (
    <g transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}>
      <circle className="fl-draw" style={ms === undefined ? undefined : t(ms)} pathLength={1} cx="12" cy="9.2" r="3.6" />
      <path className="fl-draw" style={ms === undefined ? undefined : t(ms + 0.15)} pathLength={1} d="M5.6 19.6c1-3.5 3.5-5.2 6.4-5.2s5.4 1.7 6.4 5.2" />
    </g>
  )
}

function Support() {
  const entries = [30, 52, 74, 96]
  return (
    <svg className="fl-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the conversation */}
      <rect className="fl-soft fl-fade" style={t(0.5)} x="22" y="22" width="80" height="22" rx="11" />
      <rect className="fl-draw" style={t(0)} pathLength={1} x="22" y="22" width="80" height="22" rx="11" />
      <path className="fl-draw fl-quiet" style={t(0.35)} pathLength={1} d="M34 33h44" />

      <rect className="fl-a fl-fade" style={t(1.1)} x="58" y="54" width="80" height="22" rx="11" />
      <rect className="fl-draw" style={t(0.6)} pathLength={1} x="58" y="54" width="80" height="22" rx="11" />
      <path className="fl-draw fl-quiet" style={t(0.95)} pathLength={1} d="M70 65h36M110 65h14" />

      <rect className="fl-soft fl-fade" style={t(1.7)} x="22" y="86" width="44" height="22" rx="11" />
      <rect className="fl-draw" style={t(1.2)} pathLength={1} x="22" y="86" width="44" height="22" rx="11" />
      {[34, 44, 54].map((x, k) => (
        <circle key={x} className="fl-dot fl-type" style={t(k * 0.16)} cx={x} cy="97" r="1.7" />
      ))}

      {/* the case history, a thread of entries */}
      <path className="fl-draw" style={t(0.4)} pathLength={1} d="M166 30v66" />
      {entries.map((y, k) => (
        <g key={y}>
          <circle className="fl-node fl-pop" style={t(0.6 + k * 0.28)} cx="166" cy={y} r="3.4" />
          <path className="fl-draw fl-quiet" style={t(0.7 + k * 0.28)} pathLength={1} d={`M176 ${y}h${[30, 22, 34, 18][k]}`} />
        </g>
      ))}
      {/* the story joins the thread */}
      <path className="fl-dash" d="M138 65c12 0 14-13 28-13" />

      {/* on to the person who can resolve it */}
      <path className="fl-draw" style={t(1.9)} pathLength={1} d="M166 96c0 18 6 24 18 24" />
      <circle className="fl-a fl-fade" style={t(2.5)} cx="198" cy="120" r="14" />
      <circle className="fl-draw" style={t(2.2)} pathLength={1} cx="198" cy="120" r="14" />
      <Person x={198} y={120} s={0.92} ms={2.4} />
      <g className="fl-pop" style={t(2.9)}>
        <circle className="fl-ink" cx="211" cy="107" r="6.6" />
        <path className="fl-on-ink" d="M208 107.2l2.1 2.1 3.9-4.2" />
      </g>
    </svg>
  )
}

/* the adoption curve and its milestones */
const CURVE: [number, number][] = [
  [24, 120],
  [66, 106],
  [112, 88],
  [160, 62],
  [210, 30],
]
const CURVE_D = through(CURVE)

function RevOps() {
  const marks = CURVE.slice(1)
  return (
    <svg className="fl-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* a quiet grid */}
      {[40, 72, 104].map((y) => (
        <path key={y} className="fl-hair" d={`M22 ${y}h196`} />
      ))}
      <path className="fl-draw fl-quiet" style={t(0)} pathLength={1} d="M22 136h196" />

      {/* adoption, drawing up through the milestones */}
      <path className="fl-draw fl-curve" style={t(0.3)} pathLength={1} d={CURVE_D} />

      {marks.map(([x, y], k) => (
        <g key={x}>
          <path className="fl-draw fl-quiet" style={t(0.7 + k * 0.42)} pathLength={1} d={`M${x} ${y + 6}V128`} />
          <circle className="fl-node fl-pop" style={t(0.55 + k * 0.42)} cx={x} cy={y} r="4" />
        </g>
      ))}

      {/* where relationships stall */}
      <circle className="fl-ping" cx={CURVE[2][0]} cy={CURVE[2][1]} r="4" />

      {/* their symbols: application, onboarding, activation, retention */}
      <g className="fl-pop" style={t(1.0)}>
        <rect x="61" y="125" width="10" height="13" rx="2" />
        <path className="fl-quiet" d="M64 130h4M64 133.5h4" />
      </g>
      <g className="fl-pop" style={t(1.42)}>
        <circle cx="112" cy="129" r="2.6" />
        <path d="M107.4 136.4c.7-2.4 2.4-3.6 4.6-3.6s3.9 1.2 4.6 3.6" />
      </g>
      <g className="fl-pop" style={t(1.84)}>
        <rect x="153" y="126.5" width="14" height="9.5" rx="2" />
        <path className="fl-quiet" d="M153 129.8h14" />
      </g>
      <g className="fl-pop" style={t(2.26)}>
        <path d="M214.6 127.6a5.4 5.4 0 1 0 .5 5" />
        <path d="M215.2 123.8v4.2H211" />
      </g>
      <g className="fl-pop" style={t(2.5)}>
        <circle className="fl-a" cx="210" cy="30" r="8" />
        <path d="M206.6 31.6l3.4-3.4 3.4 3.4" />
      </g>
    </svg>
  )
}

function AiOps() {
  const rows = [112, 124, 136]
  const ring: [number, number][] = [
    [186, 32],
    [208.5, 71],
    [163.5, 71],
  ]
  return (
    <svg className="fl-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the monitor */}
      <rect className="fl-soft fl-fade" style={t(0.6)} x="20" y="18" width="124" height="80" rx="10" />
      <rect className="fl-draw" style={t(0)} pathLength={1} x="20" y="18" width="124" height="80" rx="10" />
      <path className="fl-draw fl-quiet" style={t(0.3)} pathLength={1} d="M20 32h124" />
      {[29, 36, 43].map((x, k) => (
        <circle key={x} className="fl-dot fl-pop" style={t(0.4 + k * 0.08)} cx={x} cy="25" r="1.6" />
      ))}
      <path className="fl-hair" d="M30 66h18l6-14 7 26 7-19 5 7h14l5-9 5 9h11l6-15 6 23 5-8h9" />
      <path className="fl-trace" pathLength={1} d="M30 66h18l6-14 7 26 7-19 5 7h14l5-9 5 9h11l6-15 6 23 5-8h9" />

      {/* the queue, prioritised */}
      {rows.map((y, k) => (
        <g key={y}>
          <circle className={`fl-pop ${k === 0 ? 'fl-ink' : 'fl-node'}`} style={t(0.9 + k * 0.25)} cx="26" cy={y} r="2.8" />
          <path className="fl-draw" style={t(1 + k * 0.25)} pathLength={1} d={`M36 ${y}h${[74, 52, 62][k]}`} />
        </g>
      ))}
      <path className="fl-draw fl-quiet" style={t(1.6)} pathLength={1} d="M118 112h22" />

      {/* the operating rhythm round the AI's spark */}
      <circle className="fl-draw fl-quiet" style={t(0.5)} pathLength={1} cx="186" cy="58" r="26" />
      <g className="fl-orbit">
        <circle className="fl-arc" pathLength={1} cx="186" cy="58" r="26" />
      </g>
      {ring.map(([x, y], k) => (
        <circle key={x} className={`fl-node fl-pop fl-beat fl-beat--${k + 1}`} style={t(1 + k * 0.2)} cx={x} cy={y} r="4.2" />
      ))}
      <path className="fl-a fl-fade" style={t(1.6)} d="M186 47l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" />
      <path className="fl-draw fl-spark" style={t(1.2)} pathLength={1} d="M186 47l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" />
      <path className="fl-dash" d="M144 86c16 0 22 8 30 14" />
      <g className="fl-pop" style={t(2.4)}>
        <circle className="fl-ink" cx="182" cy="108" r="6.6" />
        <path className="fl-on-ink" d="M179 108.2l2.1 2.1 3.9-4.2" />
      </g>
    </svg>
  )
}

const SCENE: Record<OpsScene, () => JSX.Element> = {
  support: Support,
  revops: RevOps,
  aiops: AiOps,
}

export function OpsLine({ scene }: { scene: OpsScene }) {
  const Scene = SCENE[scene]
  return <Scene />
}
