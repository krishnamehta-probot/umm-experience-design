import type { CSSProperties } from 'react'

/* ============================================================================
   THE FINAL FINTECH PAGE — 04 · the operations cards' scenes

   Drawn the way the service cards' scenes are (Krish, 6 Nov: "take
   inspiration from services cards"): ink outlines on white, a sheet offset
   behind for depth, small fills in the other pastels, and something always
   going on in a slow loop.

     support  a chat with the whole case history beside it, the
              conversation building up, a route on to the person who can
              resolve it, and their check
     revops   a CRM record over the journey from application to retention,
              progress running along it lighting each milestone, adoption
              rising in a chart
     aiops    a monitor tracing output quality and latency, a prioritised
              queue of exceptions, an owner on it, a fallback switch, the
              AI's spark

   SVG units are px for CSS transforms inside the drawing.
   ========================================================================== */

export type OpsScene = 'support' | 'revops' | 'aiops'

/** a piece's place in the loop, in seconds */
const t = (s: number) => ({ '--t': `${s}s` }) as CSSProperties

function Person({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="fo-person" transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}>
      <circle cx="12" cy="9.4" r="3.7" />
      <path d="M5.6 19.8c1-3.5 3.5-5.2 6.4-5.2s5.4 1.7 6.4 5.2" />
    </g>
  )
}

/** a white sheet with another just behind it */
function Sheet({ x, y, w, h, r = 9 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <>
      <rect className="fo-under" x={x + 4} y={y + 4} width={w} height={h} rx={r} />
      <rect x={x} y={y} width={w} height={h} rx={r} />
    </>
  )
}

function Dots({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[0, 7, 14].map((d) => (
        <circle key={d} className="fo-ink" cx={x + d} cy={y} r="1.9" />
      ))}
    </>
  )
}

function Support() {
  return (
    <svg className="fo-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the case history */}
      <Sheet x={150} y={20} w={72} h={66} />
      <path className="fo-thin" d="M160 33h26" />
      <path className="fo-thin" d="M161 50.6v5.8M161 63.6v5.8" />
      {[47, 60, 73].map((y, k) => (
        <g key={y} className="fo-seq" style={t(0.15 + k * 0.25)}>
          <circle className={k === 2 ? 'fo-a' : undefined} cx="161" cy={y} r="3.4" />
          <path className="fo-thin" d={`M170 ${y}h${[38, 28, 34][k]}`} />
        </g>
      ))}

      {/* the conversation */}
      <Sheet x={18} y={18} w={118} h={104} r={11} />
      <path d="M18 36h118" />
      <Dots x={29} y={27} />
      <g className="fo-seq" style={t(0.5)}>
        <rect x="28" y="46" width="64" height="17" rx="8.5" />
        <path className="fo-thin" d="M37 54.5h44" />
      </g>
      <g className="fo-seq" style={t(1.2)}>
        <rect className="fo-a" x="62" y="70" width="64" height="17" rx="8.5" />
        <path className="fo-thin" d="M71 78.5h40" />
      </g>
      <g className="fo-seq" style={t(1.9)}>
        <rect x="28" y="94" width="38" height="17" rx="8.5" />
        {[38, 47, 56].map((x, k) => (
          <circle key={x} className="fo-ink fo-type" style={t(k * 0.18)} cx={x} cy="102.5" r="1.9" />
        ))}
      </g>

      {/* on to the person who can resolve it */}
      <path className="fo-route" d="M136 104c22 0 28 14 46 14" />
      <circle className="fo-b" cx="197" cy="118" r="15" />
      <Person x={197} y={118} s={0.95} />
      <g className="fo-seq fo-pop" style={t(2.5)}>
        <circle className="fo-ink" cx="210" cy="105" r="7.5" />
        <path className="fo-on-ink" d="M206.4 105.3l2.4 2.4 4.4-4.8" />
      </g>
    </svg>
  )
}

function RevOps() {
  const xs = [40, 92, 144, 196]
  return (
    <svg className="fo-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the CRM record */}
      <Sheet x={20} y={12} w={88} h={50} />
      <circle className="fo-a" cx="37" cy="29" r="9" />
      <Person x={37} y={29} s={0.62} />
      <path className="fo-thin" d="M53 25h40M53 33h26M30 49h66" />

      {/* adoption, rising */}
      <Sheet x={126} y={12} w={94} h={58} />
      <path className="fo-thin" d="M136 60h74" />
      {[14, 22, 31, 41].map((h, k) => (
        <rect
          key={h}
          className={`fo-bar ${k === 3 ? 'fo-ink' : k % 2 ? 'fo-b' : 'fo-a'}`}
          style={t(0.6 + k * 0.22)}
          x={140 + k * 18}
          y={60 - h}
          width="11"
          height={h}
          rx="2.5"
        />
      ))}

      {/* the CRM tied to the milestones */}
      <path className="fo-route" d="M64 62c0 18 28 20 28 38" />

      {/* the journey: application, onboarding, activation, retention */}
      <path className="fo-thin" d="M28 112h184" />
      <path className="fo-track" pathLength={1} d="M28 112h184" />
      {xs.map((x, k) => (
        <circle key={x} className={`fo-node fo-node--${k + 1}`} cx={x} cy="112" r="12.5" />
      ))}
      <g className="fo-glyph">
        <rect x="35.5" y="105" width="9" height="13" rx="1.6" />
        <path d="M38 109.5h4M38 113h4" />
      </g>
      <Person x={92} y={112} s={0.62} />
      <g className="fo-glyph">
        <rect x="137" y="107.5" width="14" height="9" rx="2" />
        <path d="M137 110.6h14" />
      </g>
      <g className="fo-glyph">
        <path d="M201.2 108.6a5.6 5.6 0 1 0 .6 5.4" />
        <path d="M201.8 104.6v4.4h-4.4" />
      </g>
      <circle className="fo-ink fo-walker" cx="28" cy="112" r="4.6" />
    </svg>
  )
}

function AiOps() {
  return (
    <svg className="fo-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the monitor: output quality and latency */}
      <Sheet x={18} y={14} w={128} h={82} r={10} />
      <path d="M18 31h128" />
      <Dots x={28} y={22.5} />
      <path className="fo-thin" d="M28 82h108" />
      <path className="fo-faint" d="M28 64h17l6-15 8 28 7-21 5 8h15l5-10 5 10h12l6-17 7 26 5-9h10" />
      <path className="fo-trace" pathLength={1} d="M28 64h17l6-15 8 28 7-21 5 8h15l5-10 5 10h12l6-17 7 26 5-9h10" />

      {/* the AI's spark */}
      <path className="fo-b fo-spark" d="M146 6.5l3.2 7.3 7.3 3.2-7.3 3.2-3.2 7.3-3.2-7.3-7.3-3.2 7.3-3.2z" />

      {/* the queue, prioritised */}
      <Sheet x={160} y={26} w={62} h={92} r={10} />
      {[44, 66, 88].map((y, k) => (
        <g key={y} className="fo-seq fo-slide" style={t(0.4 + k * 0.35)}>
          <rect className={k === 0 ? 'fo-a' : undefined} x="168" y={y - 8} width="46" height="16" rx="8" />
          <circle className={k === 0 ? 'fo-ink' : k === 1 ? 'fo-b' : undefined} cx="177" cy={y} r="3.2" />
          <path className="fo-thin" d={`M185 ${y}h${[20, 16, 22][k]}`} />
        </g>
      ))}

      {/* its owner, and the fallback path */}
      <path className="fo-route" d="M74 122c34 0 58-4 86-14" />
      <circle className="fo-a" cx="58" cy="122" r="15" />
      <Person x={58} y={122} s={0.95} />
      <rect className="fo-b" x="96" y="114" width="36" height="18" rx="9" />
      <circle className="fo-knob" cx="105" cy="123" r="6" />
    </svg>
  )
}

const SCENE: Record<OpsScene, () => JSX.Element> = {
  support: Support,
  revops: RevOps,
  aiops: AiOps,
}

export function OpsArt({ scene }: { scene: OpsScene }) {
  const Scene = SCENE[scene]
  return <Scene />
}
