import type { CSSProperties, ReactElement, ReactNode } from 'react'

/* ============================================================================
   THE MANUFACTURING PAGE — its drawings (Krish, 12 Nov: "nice thin-lined
   Lottie animations")

   Drawn the way line Lottie animations are made, as the Fintech page's
   operations cards were (OpsLine.tsx):

   · one hairline weight, round caps and joins, ink only, on soft white
     sheets with one pastel accent (--ml-a, the card's tone)
   · lines draw themselves on, as Lottie's trim paths do, in a stagger,
     hold, then draw off the way they came (one eight-second loop)
   · eased everywhere, a small overshoot when a dot lands
   · secondary motion that never stops: a part travelling, a scan line, a
     ping, a belt running, a switch flicking

   The tags inside the drawings are the draft's own ("LINE 02 / SHIFT PLAN",
   "ASSET / 0042", "QUOTE / REVISION B"). Most in a 240 × 150 box; the
   deck's are taller (240 × 260) and the work's 240 × 210, to fill their
   panels. Where a scene is one sequence (something travels and sets things
   off), it runs on SMIL's clock so the two stay in step.
   Styles: mfg-art.css.
   ========================================================================== */

export type ArtName =
  | 'sequence'
  | 'hold'
  | 'asset'
  | 'production'
  | 'decision'
  | 'connected'
  | 'platform'
  | 'material'
  | 'supplier'
  | 'plant'
  | 'truck'
  | 'invoice'
  | 'recover'
  | 'pricing'
  | 'benefits'
  | 'schedule'
  | 'quality'
  | 'service'
  | 'records'
  | 'st-discrete'
  | 'st-process'
  | 'st-oem'
  | 'st-contract'

/** when a piece starts in the loop, in seconds */
const t = (s: number) => ({ '--t': `${s}s` }) as CSSProperties

/** a white sheet with a soft one under it */
function Sheet({ x, y, w, h, r = 10, at = 0, still = false }: { x: number; y: number; w: number; h: number; r?: number; at?: number; still?: boolean }) {
  return (
    <>
      <rect className="ml-under" x={x + 3} y={y + 5} width={w} height={h} rx={r} />
      <rect className="ml-sheet" x={x} y={y} width={w} height={h} rx={r} />
      {still ? (
        <rect x={x} y={y} width={w} height={h} rx={r} />
      ) : (
        <rect className="ml-draw" style={t(at)} pathLength={1} x={x} y={y} width={w} height={h} rx={r} />
      )}
    </>
  )
}

function Person({ x, y, s = 1, at }: { x: number; y: number; s?: number; at?: number }) {
  return (
    <g transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}>
      <circle className="ml-draw" style={at === undefined ? undefined : t(at)} pathLength={1} cx="12" cy="9.2" r="3.6" />
      <path className="ml-draw" style={at === undefined ? undefined : t(at + 0.15)} pathLength={1} d="M5.6 19.6c1-3.5 3.5-5.2 6.4-5.2s5.4 1.7 6.4 5.2" />
    </g>
  )
}

function Check({ x, y, r = 6.6, at = 0 }: { x: number; y: number; r?: number; at?: number }) {
  return (
    <g className="ml-pop" style={t(at)}>
      <circle className="ml-ink" cx={x} cy={y} r={r} />
      <path className="ml-on-ink" d={`M${x - 3} ${y + 0.2}l2.1 2.1 3.9-4.2`} />
    </g>
  )
}

function Label({ x, y, children, end = false }: { x: number; y: number; children: string; end?: boolean }) {
  return (
    <text className="ml-t" x={x} y={y} textAnchor={end ? 'end' : undefined}>
      {children}
    </text>
  )
}

/** eased keySplines for `n` intervals of a SMIL animation */
const SPLINES = (n: number) => Array.from({ length: n }, () => '0.6 0 0.4 1').join(';')

/** shown from `on` until `off` (fractions of the eight-second loop) on SMIL's
 *  clock, so a scene's events stay in step with what travels through it */
function When({ on, off = 0.95, children }: { on: number; off?: number; children: ReactNode }) {
  const a = Math.max(0.001, on)
  const b = Math.min(a + 0.03, off - 0.005)
  return (
    <g opacity="0">
      <animate attributeName="opacity" dur="8s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${a};${b};${off};${Math.min(off + 0.03, 0.999)};1`} />
      {children}
    </g>
  )
}

/* --- 02 · the reality ------------------------------------------------------------ */

/** Line 02's shift plan: two jobs want the same part; the late part arrives,
 *  the second job slides along and a dashed handoff joins them */
function Sequence() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={26} y={20} w={188} h={112} r={12} />
      <Label x={40} y={38}>
        Line 02 / Shift plan
      </Label>
      {[56, 82, 108].map((y, k) => (
        <path key={y} className="ml-draw ml-quiet" style={t(0.2 + k * 0.1)} pathLength={1} d={`M40 ${y + 10}h160`} />
      ))}
      <rect className="ml-a ml-grow" style={t(0.7)} x="44" y="52" width="70" height="10" rx="5" />
      <g className="ml-shift">
        <rect className="ml-b ml-grow" style={t(1)} x="92" y="78" width="62" height="10" rx="5" />
        <path className="ml-dash" d="M114 57h10v26" />
      </g>
      <rect className="ml-c ml-grow" style={t(1.3)} x="60" y="104" width="48" height="10" rx="5" />
      {/* the late part, arriving */}
      <g className="ml-part">
        <circle className="ml-node" cx="186" cy="38" r="5.5" />
        <path d="M183.6 38h4.8M186 35.6v4.8" />
      </g>
      <path className="ml-draw ml-quiet" style={t(1.6)} pathLength={1} d="M186 44v8c0 6-4 9-10 9h-6" />
    </svg>
  )
}

/** a quality hold: the inspector stops the lot; the hold travels slowly down
 *  a long line to dispatch, which still shows stock until it arrives */
function Hold() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the lot */}
      <g>
        <rect className="ml-under" x="33" y="61" width="58" height="48" rx="7" />
        <rect className="ml-sheet" x="30" y="56" width="58" height="48" rx="7" />
        <rect className="ml-draw" style={t(0)} pathLength={1} x="30" y="56" width="58" height="48" rx="7" />
        <path className="ml-draw ml-quiet" style={t(0.3)} pathLength={1} d="M30 72h58M59 56v48" />
      </g>
      <Label x={30} y={122}>
        Lot 024
      </Label>
      {/* the inspector's glass */}
      <g className="ml-float">
        <circle className="ml-a" cx="80" cy="44" r="15" />
        <circle className="ml-draw" style={t(0.5)} pathLength={1} cx="80" cy="44" r="15" />
        <path className="ml-draw" style={t(0.8)} pathLength={1} d="M91 55l10 10" />
        <path className="ml-draw" style={t(1.1)} pathLength={1} d="M74 44.5l4 4 8-8.5" />
      </g>
      {/* the hold, a pill */}
      <g className="ml-pop" style={t(1.4)}>
        <rect className="ml-ink" x="36" y="82" width="34" height="14" rx="7" />
        <text className="ml-t ml-t--ink" x="53" y="91.6" textAnchor="middle">
          Hold
        </text>
      </g>
      {/* the long, slow line to dispatch */}
      <path className="ml-draw ml-quiet" style={t(0.6)} pathLength={1} d="M88 80c30 0 34 30 64 30h10" />
      <circle className="ml-ink ml-slow" r="3.2">
        <animateMotion dur="8s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.25;0.85;1" calcMode="linear" path="M88 80c30 0 34 30 64 30h10" />
      </circle>
      {/* dispatch */}
      <Sheet x={162} y={70} w={54} h={62} r={9} at={0.4} />
      <Label x={170} y={86}>
        Dispatch
      </Label>
      {[96, 106, 116].map((y, k) => (
        <rect key={y} className="ml-b ml-grow" style={t(0.9 + k * 0.15)} x="170" y={y} width={[30, 22, 26][k]} height="5" rx="2.5" />
      ))}
      <g className="ml-late">
        <circle className="ml-ink" cx="208" cy="74" r="6" />
        <path className="ml-on-ink" d="M208 71v3.6M208 77v.2" />
      </g>
    </svg>
  )
}

/** Asset 0042: the machine, rebuilt twice (two outlines growing out behind
 *  it), and the original manual that no longer matches */
function Asset() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      {/* the manual */}
      <g className="ml-tilt">
        <rect className="ml-under" x="25" y="45" width="50" height="66" rx="5" />
        <rect className="ml-sheet" x="22" y="40" width="50" height="66" rx="5" />
        <rect className="ml-draw" style={t(0)} pathLength={1} x="22" y="40" width="50" height="66" rx="5" />
        {[54, 62, 70, 78].map((y, k) => (
          <path key={y} className="ml-draw ml-quiet" style={t(0.2 + k * 0.1)} pathLength={1} d={`M30 ${y}h${[30, 22, 34, 18][k]}`} />
        ))}
        <rect className="ml-c" x="30" y="86" width="20" height="10" rx="5" />
      </g>
      {/* the rebuilds, behind */}
      <rect className="ml-draw ml-quiet ml-rebuild" style={t(1.2)} pathLength={1} x="112" y="22" width="92" height="96" rx="12" />
      <rect className="ml-draw ml-quiet ml-rebuild" style={t(0.9)} pathLength={1} x="104" y="30" width="92" height="96" rx="12" />
      {/* the machine today */}
      <Sheet x={96} y={38} w={92} h={96} r={12} at={0.4} />
      <Label x={108} y={56}>
        Asset / 0042
      </Label>
      <circle className="ml-a" cx="142" cy="92" r="20" />
      <g className="ml-turn" style={{ transformOrigin: '142px 92px' }}>
        <circle className="ml-draw" style={t(0.7)} pathLength={1} cx="142" cy="92" r="11" />
        <path className="ml-draw" style={t(0.9)} pathLength={1} d="M142 77v6M142 101v6M127 92h6M151 92h6" />
      </g>
      {/* the question the manual can't answer */}
      <path className="ml-dash" d="M72 74c12 0 14 8 24 8" />
      <circle className="ml-ping" cx="96" cy="82" r="3.5" />
    </svg>
  )
}

/* --- 03 · what UMM enables: the deck's drawings (12 Nov, second pass: Krish,
   "the animation in here can be improved… in card only"). Taller, so they
   fill the card's drawing panel, and each a scene that plays through on its
   eight-second loop rather than a still with a little motion. All in a
   240 × 260 box, on the card's flat pastel. ------------------------------------- */

/** procurement: the purchase order confirmed, the truck bringing the
 *  material to the dock, the week's plan filling once it lands */
function Material() {
  return (
    <svg className="ml-art" viewBox="0 0 240 260" aria-hidden="true">
      {/* the purchase order, confirmed */}
      <Sheet x={14} y={18} w={106} h={98} r={11} />
      <Label x={26} y={36}>
        PO / 7731
      </Label>
      {[52, 66, 80].map((y, k) => (
        <g key={y}>
          <path className="ml-draw ml-quiet" style={t(0.3 + k * 0.1)} pathLength={1} d={`M26 ${y}h${[50, 40, 54][k]}`} />
          <path className="ml-draw" style={t(0.4 + k * 0.1)} pathLength={1} d={`M96 ${y}h12`} />
        </g>
      ))}
      <g className="ml-stamp" style={t(1.1)}>
        <rect className="ml-b" x="34" y="91" width="66" height="16" rx="8" transform="rotate(-6 67 99)" />
        <rect x="34" y="91" width="66" height="16" rx="8" transform="rotate(-6 67 99)" />
        <text className="ml-t ml-t--big" x="67" y="101.8" textAnchor="middle" transform="rotate(-6 67 99)">
          Confirmed
        </text>
      </g>
      {/* the order going out to the supplier, the material coming back */}
      <path className="ml-dash" d="M60 116v64" />

      {/* the week's plan, filling once the material lands */}
      <Sheet x={134} y={18} w={92} h={124} r={11} at={0.2} />
      <Label x={146} y={36}>
        Plan / Wk 46
      </Label>
      {[50, 72, 94, 116].map((y, k) => (
        <g key={y}>
          <path className="ml-draw ml-hair" style={t(0.4)} pathLength={1} d={`M146 ${y + 12}h68`} />
          <rect className={`ml-grow ${['ml-b', 'ml-c', 'ml-a', 'ml-b'][k]}`} style={t(3 + k * 0.18)} x={146 + [0, 14, 6, 22][k]} y={y} width={[46, 40, 54, 30][k]} height="8" rx="4" />
        </g>
      ))}
      <Check x={212} y={32} r={6} at={4} />

      {/* the dock, and the material rising into the plan */}
      <path className="ml-sheet" d="M154 232v-48l36-20 36 20v48z" />
      <path className="ml-draw" style={t(0.3)} pathLength={1} d="M154 232v-48l36-20 36 20v48" />
      <path className="ml-draw ml-quiet" style={t(0.6)} pathLength={1} d="M176 232v-28h28v28M176 216h28" />
      {[0, 1].map((k) => (
        <circle key={k} className="ml-ink ml-rise" style={{ ...t(2.6 + k * 0.7), '--rise': '-22px' } as CSSProperties} cx="190" cy="170" r="2.3" />
      ))}

      {/* the road and the truck bringing it in */}
      <path className="ml-draw ml-quiet" style={t(0)} pathLength={1} d="M8 233h224" />
      <g className="ml-arrive">
        <rect className="ml-node" x="30" y="186" width="66" height="40" rx="5" />
        {[0, 1, 2].map((k) => (
          <rect key={k} className={['ml-a', 'ml-c', 'ml-b'][k]} x={38 + k * 18} y="196" width="14" height="22" rx="2.5" />
        ))}
        <path className="ml-node" d="M96 196h16l14 14v16H96z" />
        <path className="ml-quiet" d="M102 202h8l8 8h-16z" />
        {[48, 110].map((x) => (
          <circle key={x} className="ml-node" cx={x} cy="228" r="7" />
        ))}
      </g>
    </svg>
  )
}

/** smart production operations: the line's live view above; under it a
 *  press, the belt indexing a part beneath it each beat, the press coming
 *  down and the part leaving finished, an inspection gate scanning it; the
 *  press's facts rising to the view */
function Production() {
  return (
    <svg className="ml-art" viewBox="0 0 240 260" aria-hidden="true">
      {/* the live view */}
      <Sheet x={12} y={16} w={216} h={94} r={12} />
      <Label x={26} y={34}>
        Line 02 / Live
      </Label>
      <circle className="ml-ink ml-blink" cx="94" cy="31.6" r="2.2" />
      <Label x={214} y={34} end>
        OEE 86%
      </Label>
      <path className="ml-hair" d="M26 52h188M26 72h188M26 92h188" />
      <path className="ml-trace" pathLength={1} d="M26 86l16-6 14 3 16-14 14 7 16-4 16-16 14 6 16-10 14 5 16-12 14 4 16-8" />

      {/* the press's facts, rising */}
      <path className="ml-dash" d="M120 132v-22" />
      {[0, 1].map((k) => (
        <circle key={k} className="ml-ink ml-rise" style={{ ...t(k * 1.2), '--rise': '-22px' } as CSSProperties} cx="120" cy="132" r="2.2" />
      ))}

      {/* the press */}
      <path className="ml-draw" style={t(0.3)} pathLength={1} d="M86 204V132h68v72" />
      <rect className="ml-node" x="100" y="132" width="40" height="16" rx="4" />
      <circle className="ml-ink ml-blink" cx="132" cy="140" r="2" />
      <g className="ml-press">
        <path d="M120 148v16" />
        <rect className="ml-c" x="106" y="164" width="28" height="11" rx="3" />
        <rect x="106" y="164" width="28" height="11" rx="3" />
      </g>

      {/* the inspection gate, downstream */}
      <path className="ml-draw ml-quiet" style={t(0.5)} pathLength={1} d="M172 204v-34h44v34" />
      <path className="ml-scan" style={{ '--range': '26px' } as CSSProperties} d="M176 174h36" />

      {/* the belt: it indexes one part under the press each beat */}
      <path className="ml-draw" style={t(0)} pathLength={1} d="M6 204h228" />
      <path className="ml-draw ml-quiet" style={t(0.1)} pathLength={1} d="M6 218h228" />
      {Array.from({ length: 9 }, (_, k) => (
        <circle key={k} className="ml-roll" cx={16 + k * 26} cy="211" r="4.4" />
      ))}
      <g className="ml-index">
        {[-60, -4, 52, 108, 164, 220].map((x) => (
          <rect key={x} className={`ml-node${x === 52 ? ' ml-stamped' : x > 52 ? ' ml-done' : ''}`} x={x} y="188" width="24" height="16" rx="4" />
        ))}
      </g>
    </svg>
  )
}

/** decision support: the camera measures the part; its picture joins the
 *  quality, planning and supply pictures, each checked in turn; one spine
 *  carries them down to the decision, and the lot is released */
function Decision() {
  const spine = 'M222 39h8v153h-46'
  return (
    <svg className="ml-art" viewBox="0 0 240 260" aria-hidden="true">
      {/* the camera over the part */}
      <rect className="ml-node" x="26" y="22" width="48" height="26" rx="6" />
      <rect className="ml-draw" style={t(0)} pathLength={1} x="26" y="22" width="48" height="26" rx="6" />
      <circle className="ml-node" cx="50" cy="35" r="7.5" />
      <circle className="ml-ink" cx="50" cy="35" r="2.6" />
      <path className="ml-hair" d="M50 48L24 104M50 48l26 56" />
      <rect className="ml-sheet" x="28" y="104" width="44" height="28" rx="6" />
      <rect className="ml-c" x="34" y="110" width="32" height="16" rx="3" />
      <rect className="ml-draw" style={t(0.3)} pathLength={1} x="28" y="104" width="44" height="28" rx="6" />
      <path className="ml-scan" style={{ '--range': '30px' } as CSSProperties} d="M24 102h52" />
      {/* its measure */}
      <path className="ml-draw ml-quiet" style={t(0.6)} pathLength={1} d="M28 146h44M28 142v8M72 142v8" />
      <text className="ml-t ml-fade" style={t(0.8)} x="50" y="162" textAnchor="middle">
        24.0 mm
      </text>
      <path className="ml-dash" d="M72 118c20 0 18-79 38-79" />

      {/* the three pictures, checked in turn */}
      {['Quality', 'Planning', 'Supply'].map((w, k) => {
        const y = 22 + k * 44
        return (
          <g key={w}>
            <Sheet x={110} y={y} w={112} h={34} r={9} at={0.4 + k * 0.15} />
            <Label x={122} y={y + 14}>
              {w}
            </Label>
            <path className="ml-draw ml-quiet" style={t(0.8 + k * 0.15)} pathLength={1} d={`M122 ${y + 24}h${[52, 40, 60][k]}`} />
            <Check x={207} y={y + 17} r={5.6} at={1.3 + k * 0.45} />
          </g>
        )
      })}

      {/* one spine down to the decision */}
      <path className="ml-draw ml-quiet" style={t(1)} pathLength={1} d={spine} />
      <path className="ml-draw ml-quiet" style={t(1.1)} pathLength={1} d="M222 83h8M222 127h8" />
      {[0, 1, 2].map((k) => (
        <circle key={k} className="ml-ink" r="2.4">
          <animateMotion dur="2.4s" begin={`${k * 0.8}s`} repeatCount="indefinite" path={spine} />
        </circle>
      ))}

      {/* the decision */}
      <Sheet x={52} y={170} w={132} h={66} r={12} at={1.6} />
      <Label x={64} y={188}>
        Lot 024 / Decision
      </Label>
      <text className="ml-t ml-t--big ml-fade" style={t(2)} x="64" y="206">
        Release the lot
      </text>
      <g className="ml-pop" style={t(3)}>
        <rect className="ml-ink" x="64" y="214" width="52" height="13" rx="6.5" />
        <text className="ml-t ml-t--ink" x="90" y="222.8" textAnchor="middle">
          Released
        </text>
      </g>
      <Check x={168} y={196} r={8} at={3.2} />
    </svg>
  )
}

/** connected products: the unit in the field sends its condition up; the
 *  service portal reads its serial history and answers with the spare; the
 *  technician's van comes to the unit */
function Connected() {
  const link = 'M100 168c18 0 4-80 22-80'
  return (
    <svg className="ml-art" viewBox="0 0 240 260" aria-hidden="true">
      {/* the service portal */}
      <Sheet x={110} y={16} w={116} h={142} r={12} />
      <Label x={122} y={34}>
        Service / SN 0042
      </Label>
      <Person x={134} y={56} s={0.8} at={0.6} />
      <path className="ml-draw ml-quiet" style={t(0.8)} pathLength={1} d="M150 52h58M150 60h40" />
      <path className="ml-hair" d="M126 82v28" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle className={k === 2 ? 'ml-ink' : 'ml-node'} cx="126" cy={82 + k * 14} r="3" />
          <path className="ml-draw ml-quiet" style={t(1 + k * 0.12)} pathLength={1} d={`M134 ${82 + k * 14}h${[46, 58, 38][k]}`} />
        </g>
      ))}
      <rect className="ml-c ml-grow" style={t(2.2)} x="120" y="130" width="76" height="16" rx="8" />
      <text className="ml-t ml-fade" style={t(2.4)} x="130" y="140.4">
        Spare / PN-118
      </text>
      <Check x={210} y={138} r={6} at={2.8} />

      {/* the unit in the field, calling */}
      <Sheet x={14} y={128} w={86} h={96} r={12} at={0.2} />
      <Label x={26} y={146}>
        Field unit
      </Label>
      <circle className="ml-b" cx="57" cy="188" r="22" />
      <g className="ml-turn" style={{ transformOrigin: '57px 188px' }}>
        <circle className="ml-draw" style={t(0.5)} pathLength={1} cx="57" cy="188" r="12" />
        <path className="ml-draw" style={t(0.7)} pathLength={1} d="M57 170v6M57 200v6M39 188h6M69 188h6" />
      </g>
      {[12, 20, 28].map((r, k) => (
        <path key={r} className="ml-wave" style={t(k * 0.35)} d={`M${57 - r * 0.7} ${120 - r * 0.2}a${r} ${r} 0 0 1 ${r * 1.4} 0`} />
      ))}
      <path className="ml-dash" d={link} />
      <circle className="ml-ink" r="2.4">
        <animateMotion dur="2.6s" repeatCount="indefinite" path={link} />
      </circle>

      {/* the technician, on the way */}
      <path className="ml-draw ml-quiet" style={t(0)} pathLength={1} d="M108 238h124" />
      <g className="ml-arrive-l">
        <rect className="ml-node" x="166" y="206" width="50" height="26" rx="5" />
        <rect className="ml-c" x="176" y="214" width="30" height="8" rx="4" />
        <path className="ml-node" d="M166 214h-14l-10 10v8h24z" />
        <path className="ml-quiet" d="M158 218h-6l-5 5h11z" />
        {[152, 202].map((x) => (
          <circle key={x} className="ml-node" cx={x} cy="234" r="6" />
        ))}
      </g>
    </svg>
  )
}

/** platform foundations: edge, plant and cloud stacked; the shared context
 *  (asset, part, lot, revision) over them; the data rising through all
 *  three; a lock on the seam between OT and IT */
function Platform() {
  const pane = (y: number, cls: string, at: number) => (
    <g>
      <path className={cls} d={`M56 ${y}l72-24 72 24-72 24z`} />
      <path className="ml-draw" style={t(at)} pathLength={1} d={`M56 ${y}l72-24 72 24-72 24z`} />
    </g>
  )
  return (
    <svg className="ml-art" viewBox="0 0 240 260" aria-hidden="true">
      {/* the context every layer shares */}
      {['Asset', 'Part', 'Lot', 'Rev'].map((w, k) => (
        <g key={w} className="ml-pop" style={t(1.6 + k * 0.15)}>
          <rect className="ml-node" x={40 + k * 42} y="22" width="38" height="15" rx="7.5" />
          <text className="ml-t" x={59 + k * 42} y="32" textAnchor="middle">
            {w}
          </text>
        </g>
      ))}
      <path className="ml-dash" d="M128 37v46" />

      {/* the risers, then the three layers, bottom first */}
      <path className="ml-draw ml-quiet" style={t(0.2)} pathLength={1} d="M56 212v-56M200 212v-56M128 236v-56M56 156v-56M200 156v-56M128 180v-56" />
      {pane(212, 'ml-sheet', 0)}
      {pane(156, 'ml-b', 0.3)}
      {pane(100, 'ml-sheet', 0.6)}

      {/* edge: the sensors */}
      {[
        [100, 212],
        [128, 220],
        [156, 212],
        [128, 204],
      ].map(([x, y], k) => (
        <g key={k}>
          <circle className="ml-node" cx={x} cy={y} r="3.6" />
          <circle className="ml-ping" style={{ animationDelay: `${k * 0.5}s` }} cx={x} cy={y} r="3.6" />
        </g>
      ))}
      {/* plant: the line's server */}
      <path className="ml-node" d="M114 152l14-6 14 6v10l-14 6-14-6z" />
      <path d="M114 152l14 6 14-6M128 158v10" />
      {/* cloud */}
      <path className="ml-node" d="M112 98a9 9 0 0 1 16-6a8 8 0 0 1 14 5a6 6 0 0 1-1 12h-27a6 6 0 0 1-2-11z" />

      {/* the data, rising through all three */}
      {[0, 1, 2].map((k) => (
        <circle key={k} className="ml-ink ml-rise" style={{ ...t(k * 0.8), '--rise': '-110px' } as CSSProperties} cx={116 + k * 12} cy="212" r="2.3" />
      ))}

      {/* the names */}
      {['Cloud', 'Plant', 'Edge'].map((w, k) => {
        const y = [100, 156, 212][k]
        return (
          <g key={w}>
            <path className="ml-hair" d={`M44 ${y}h10`} />
            <Label x={40} y={y + 2.4} end>
              {w}
            </Label>
          </g>
        )
      })}

      {/* the lock between OT and IT */}
      <g className="ml-pop" style={t(1.2)}>
        <rect className="ml-ink" x="205" y="177" width="18" height="15" rx="3.5" />
        <path d="M208.5 177v-4a5.5 5.5 0 0 1 11 0v4" />
        <circle className="ml-on-ink" cx="214" cy="184.5" r="1.6" />
      </g>
      <text className="ml-t" x="214" y="204" textAnchor="middle">
        OT / IT
      </text>
    </svg>
  )
}

/* --- 05 · the value chain's four stages ------------------------------------------- */

function Supplier() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-draw ml-quiet" style={t(0)} pathLength={1} d="M14 118h212" />
      <g className="ml-drive">
        <rect className="ml-a" x="34" y="56" width="86" height="54" rx="6" />
        <rect className="ml-draw" style={t(0.2)} pathLength={1} x="34" y="56" width="86" height="54" rx="6" />
        <path className="ml-draw" style={t(0.4)} pathLength={1} d="M120 74h28l20 22v14h-48z" />
        <path className="ml-draw ml-quiet" style={t(0.6)} pathLength={1} d="M128 80h16l12 13h-28z" />
        {[54, 150].map((x) => (
          <g key={x}>
            <circle className="ml-node" cx={x} cy="114" r="10" />
            <circle className="ml-quiet" cx={x} cy="114" r="3" />
          </g>
        ))}
        {[44, 68, 92].map((x) => (
          <rect key={x} className="ml-node" x={x} y="66" width="18" height="16" rx="3" />
        ))}
      </g>
      <path className="ml-draw" style={t(0.9)} pathLength={1} d="M200 30v52M190 72l10 10 10-10" />
    </svg>
  )
}

function Plant() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-draw" style={t(0)} pathLength={1} d="M12 112h216" />
      <g className="ml-belt" style={{ '--step': '56px' } as CSSProperties}>
        {[-1, 0, 1, 2, 3].map((k) => (
          <rect key={k} className={k === 1 ? 'ml-a' : 'ml-node'} x={18 + k * 56} y="96" width="26" height="16" rx="4" />
        ))}
      </g>
      <rect className="ml-sheet" x="34" y="34" width="58" height="56" rx="6" />
      <rect className="ml-draw" style={t(0.3)} pathLength={1} x="34" y="34" width="58" height="56" rx="6" />
      <rect className="ml-b" x="44" y="44" width="38" height="24" rx="4" />
      <g className="ml-arm" style={{ transformOrigin: '140px 88px' }}>
        <path className="ml-draw" style={t(0.6)} pathLength={1} d="M140 88l-14-30 22-20" />
        <circle className="ml-node" cx="140" cy="88" r="6" />
        <circle className="ml-node" cx="126" cy="58" r="5" />
        <path className="ml-draw" style={t(0.9)} pathLength={1} d="M148 38l8 8" />
      </g>
      <path className="ml-draw ml-quiet" style={t(0.5)} pathLength={1} d="M176 34h36v54M176 34v14h36M194 48v12" />
      <path className="ml-scan ml-scan--x" d="M178 70h32" />
      <circle className="ml-c ml-blink" cx="212" cy="26" r="4" />
    </svg>
  )
}

function Truck() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-draw ml-quiet" style={t(0)} pathLength={1} d="M12 118h216" />
      <path className="ml-sheet" d="M22 52l52-26 52 26v66H22z" />
      <path className="ml-draw" style={t(0.2)} pathLength={1} d="M22 52l52-26 52 26v66H22z" />
      <path className="ml-draw ml-quiet" style={t(0.5)} pathLength={1} d="M46 70h56v48H46zM46 86h56M46 102h56" />
      <g className="ml-depart">
        <rect className="ml-a" x="134" y="70" width="44" height="38" rx="5" />
        <path className="ml-draw" style={t(0.7)} pathLength={1} d="M178 80h20l18 18v10h-38" />
        {[148, 202].map((x) => (
          <circle key={x} className="ml-node" cx={x} cy="112" r="8" />
        ))}
      </g>
      <path className="ml-draw" style={t(1)} pathLength={1} d="M140 46h56m-9-8 9 8-9 8" />
    </svg>
  )
}

function Invoice() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-draw" style={t(0.6)} pathLength={1} d="M18 32h44m-8-7 8 7-8 7" />
      <path className="ml-under" d="M77 25h86l22 22v92H77z" />
      <path className="ml-sheet" d="M74 20h86l22 22v92H74z" />
      <path className="ml-draw" style={t(0)} pathLength={1} d="M74 20h86l22 22v92H74z" />
      <path className="ml-draw ml-quiet" style={t(0.2)} pathLength={1} d="M160 20v22h22" />
      {[56, 70, 84, 98].map((y, k) => (
        <path key={y} className="ml-draw ml-quiet" style={t(0.4 + k * 0.1)} pathLength={1} d={`M88 ${y}h${[64, 76, 52, 40][k]}`} />
      ))}
      <g className="ml-pop" style={t(1.3)}>
        <circle className="ml-b" cx="178" cy="108" r="24" />
        <circle className="ml-draw" style={t(1.3)} pathLength={1} cx="178" cy="108" r="24" />
        <path className="ml-draw ml-bold" style={t(1.6)} pathLength={1} d="M167 108l8 8 14-15" />
      </g>
    </svg>
  )
}

/* --- 06 · the work's scope illustrations (12 Nov, second pass: Krish, "in
   that as well animation can be improved"). Each now plays its engagement
   through as one sequence on SMIL's clock, so what travels and what it sets
   off stay in step: the recovery case stopping at each station as it lights;
   the quote edited, approved and taken offline; the question found and
   answered. 240 × 210, on the card's flat pastel. ----------------------------- */

/** the stations of the recovery route, and when the case reaches each */
const RECOVER = [
  { x: 32, y: 60, at: 0.02, name: 'Request' },
  { x: 104, y: 60, at: 0.22, name: 'Schedule' },
  { x: 176, y: 60, at: 0.46, name: 'Pickup' },
  { x: 176, y: 140, at: 0.7, name: 'Recycle' },
]

/** Recover: request → schedule → pickup → recycling, the case stopping at
 *  each as it lights, then the report filling */
function Recover() {
  const route = 'M32 60H176V140'
  const icons = [
    <g key="pin">
      <path d="M32 69c-6-6-8-9-8-12.5a8 8 0 0 1 16 0c0 3.5-2 6.5-8 12.5z" />
      <circle cx="32" cy="56.5" r="2.6" />
    </g>,
    <g key="cal">
      <rect x="96" y="53" width="16" height="15" rx="2.5" />
      <path d="M96 58h16M100 50v5M108 50v5" />
      <rect className="ml-c" x="100" y="61" width="4" height="4" rx="1" />
    </g>,
    <g key="truck">
      <rect x="165" y="54" width="13" height="10" rx="1.5" />
      <path d="M178 57h4l4 4v3h-8z" />
      <circle className="ml-node" cx="169.5" cy="65.5" r="2.2" />
      <circle className="ml-node" cx="182" cy="65.5" r="2.2" />
    </g>,
    <g key="loop" className="ml-spin" style={{ transformOrigin: '176px 140px' }}>
      <path d="M169 137a7.5 7.5 0 0 1 13-2.4M183 143a7.5 7.5 0 0 1-13 2.4" />
      <path d="M182.6 131.4l-.6 3.4-3.3-1M169.4 148.6l.6-3.4 3.3 1" />
    </g>,
  ]
  return (
    <svg className="ml-art" viewBox="0 0 240 210" aria-hidden="true">
      <path className="ml-hair" d={route} />
      <path className="ml-draw" style={t(0)} pathLength={1} d={route} />

      {RECOVER.map((s, k) => (
        <g key={s.name}>
          <circle className="ml-node" cx={s.x} cy={s.y} r="16" />
          <When on={s.at}>
            <circle className="ml-b" cx={s.x} cy={s.y} r="16" />
            <circle className="ml-ring" cx={s.x} cy={s.y} r="16">
              <animate attributeName="r" dur="8s" repeatCount="indefinite" values={`16;16;24;24`} keyTimes={`0;${s.at};${s.at + 0.08};1`} />
              <animate attributeName="stroke-opacity" dur="8s" repeatCount="indefinite" values="0;0;0.6;0;0" keyTimes={`0;${s.at};${s.at + 0.01};${s.at + 0.08};1`} />
            </circle>
          </When>
          <circle cx={s.x} cy={s.y} r="16" />
          {icons[k]}
          <text className="ml-t" x={s.x} y={k === 2 ? s.y - 24 : s.y + 30} textAnchor="middle">
            {s.name}
          </text>
        </g>
      ))}

      {/* the case, travelling */}
      <circle className="ml-ink" r="4.2">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={route}
          calcMode="spline"
          keyTimes="0;0.06;0.22;0.3;0.46;0.54;0.7;1"
          keyPoints="0;0;0.3214;0.3214;0.6429;0.6429;1;1"
          keySplines={SPLINES(7)}
        />
      </circle>

      {/* the report, filling once the material is recycled */}
      <Sheet x={16} y={112} w={118} h={84} r={10} at={0.3} />
      <Label x={28} y={130}>
        Report / Q3
      </Label>
      {[144, 160, 176].map((y, k) => (
        <g key={y}>
          <path className="ml-hair" d={`M28 ${y + 4}h92`} />
          <rect className={['ml-b', 'ml-c', 'ml-a'][k]} x="28" y={y} height="8" rx="4" width="0">
            <animate attributeName="width" dur="8s" repeatCount="indefinite" values={`0;0;${[78, 56, 68][k]};${[78, 56, 68][k]};0`} keyTimes={`0;${0.74 + k * 0.03};${0.82 + k * 0.03};0.95;1`} />
          </rect>
          <rect x="28" y={y} height="8" rx="4" width="0" className="ml-quiet">
            <animate attributeName="width" dur="8s" repeatCount="indefinite" values={`0;0;${[78, 56, 68][k]};${[78, 56, 68][k]};0`} keyTimes={`0;${0.74 + k * 0.03};${0.82 + k * 0.03};0.95;1`} />
          </rect>
        </g>
      ))}
      <path className="ml-dash" d="M160 140h-26" />
      <When on={0.86}>
        <circle className="ml-ink" cx="118" cy="127" r="6" />
        <path className="ml-on-ink" d="M115.2 127.2l2 2 3.8-4" />
      </When>
    </svg>
  )
}

/** PriceFX: a price on the quote changed, the quote approved and stamped,
 *  then the field app switched offline with the approved list on it */
function Pricing() {
  const prices = ['18.20', '64.50', '42.10', '9.80', '27.00']
  return (
    <svg className="ml-art" viewBox="0 0 240 210" aria-hidden="true">
      <Sheet x={14} y={14} w={124} h={182} r={12} />
      <Label x={26} y={32}>
        Quote / Revision B
      </Label>
      {/* the row being changed, lit behind */}
      <When on={0.16}>
        <rect className="ml-c" x="20" y="79" width="112" height="14" rx="5" />
      </When>
      {[50, 68, 86, 104, 122].map((y, k) => (
        <g key={y}>
          <path className="ml-draw ml-quiet" style={t(0.2 + k * 0.08)} pathLength={1} d={`M26 ${y}h${[52, 44, 58, 40, 48][k]}`} />
          {k === 2 ? (
            <>
              <When on={0.001} off={0.2}>
                <text className="ml-t ml-t--num" x="126" y={y + 2.4} textAnchor="end">
                  {prices[k]}
                </text>
              </When>
              <When on={0.24}>
                <text className="ml-t ml-t--num ml-t--dark" x="126" y={y + 2.4} textAnchor="end">
                  39.80
                </text>
              </When>
            </>
          ) : (
            <text className="ml-t ml-t--num" x="126" y={y + 2.4} textAnchor="end">
              {prices[k]}
            </text>
          )}
        </g>
      ))}
      <path className="ml-draw ml-quiet" style={t(0.7)} pathLength={1} d="M26 138h100" />

      {/* approve, pressed */}
      <rect className="ml-ink" x="26" y="160" width="60" height="16" rx="8" />
      <text className="ml-t ml-t--ink" x="56" y="170.4" textAnchor="middle">
        Approve
      </text>
      <When on={0.36} off={0.42}>
        <rect x="22" y="156" width="68" height="24" rx="12" />
      </When>
      {/* and stamped */}
      <When on={0.4}>
        <g transform="rotate(-8 104 118)">
          <rect className="ml-b" x="70" y="108" width="68" height="22" rx="11" />
          <rect x="70" y="108" width="68" height="22" rx="11" />
          <text className="ml-t ml-t--big" x="104" y="122" textAnchor="middle">
            Approved
          </text>
        </g>
      </When>

      {/* in sync with the field app */}
      <circle className="ml-node" cx="144" cy="38" r="10" />
      <g className="ml-spin" style={{ transformOrigin: '144px 38px' }}>
        <path d="M139 36a5.4 5.4 0 0 1 9.4-1.6M149 40a5.4 5.4 0 0 1-9.4 1.6" />
        <path d="M148.8 31.6l-.4 2.8-2.7-.6M139.2 44.4l.4-2.8 2.7.6" />
      </g>

      {/* the field app, switched offline with the approved list on it */}
      <Sheet x={152} y={56} w={74} h={140} r={14} at={0.4} />
      <Label x={162} y={74}>
        Field app
      </Label>
      <rect className="ml-node" x="162" y="82" width="46" height="16" rx="8" />
      <circle className="ml-ink" cx="170" cy="90" r="5">
        <animate attributeName="cx" dur="8s" repeatCount="indefinite" values="170;170;200;200;170" keyTimes="0;0.54;0.58;0.95;1" />
      </circle>
      <When on={0.001} off={0.55}>
        <text className="ml-t" x="162" y="112">
          Online
        </text>
      </When>
      <When on={0.58}>
        <text className="ml-t ml-t--dark" x="162" y="112">
          Offline
        </text>
      </When>
      {[124, 138, 152, 166].map((y, k) => (
        <When key={y} on={0.62 + k * 0.03}>
          <path className="ml-quiet" d={`M162 ${y}h${[34, 28, 38, 24][k]}`} />
          <path d={`M204 ${y}h10`} />
        </When>
      ))}
      <When on={0.76}>
        <circle className="ml-ink" cx="208" cy="182" r="6" />
        <path className="ml-on-ink" d="M205.2 182.2l2 2 3.8-4" />
      </When>

      {/* the hand doing it */}
      <g opacity="0">
        <animate attributeName="opacity" dur="8s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.05;0.08;0.66;0.7;1" />
        <animateTransform
          attributeName="transform"
          type="translate"
          dur="8s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.06;0.16;0.24;0.32;0.4;0.5;0.6;0.7;1"
          values="232 206;232 206;118 90;118 90;60 170;60 170;196 92;196 92;236 206;236 206"
          keySplines={SPLINES(9)}
        />
        <path className="ml-pointer" d="M0 0v14l4-3.6 2.7 6.2 2.6-1.2-2.6-6.1h5.4z" />
      </g>
    </svg>
  )
}

/** Benefits: the area found, the question found under it, and its answer */
function Benefits() {
  return (
    <svg className="ml-art" viewBox="0 0 240 210" aria-hidden="true">
      {/* the information, organised: one root, three areas */}
      <path className="ml-draw ml-quiet" style={t(0.2)} pathLength={1} d="M120 34v12M44 46h152M44 46v10M120 46v10M196 46v10" />
      <rect className="ml-ink" x="88" y="16" width="64" height="18" rx="9" />
      <text className="ml-t ml-t--ink" x="120" y="27.4" textAnchor="middle">
        Benefits
      </text>
      {['Health', 'Leave', 'Retirement'].map((w, k) => {
        const x = [44, 120, 196][k]
        return (
          <g key={w}>
            <rect className="ml-node" x={x - 36} y="56" width="72" height="18" rx="9" />
            {k === 1 && (
              <When on={0.16}>
                <rect className="ml-b" x={x - 36} y="56" width="72" height="18" rx="9" />
              </When>
            )}
            <rect x={x - 36} y="56" width="72" height="18" rx="9" />
            <text className="ml-t" x={x} y="67.4" textAnchor="middle">
              {w}
            </text>
          </g>
        )
      })}

      {/* the questions under it */}
      <When on={0.2}>
        <path className="ml-quiet" d="M120 74v12" />
      </When>
      {[0, 1, 2].map((k) => {
        const y = 88 + k * 21
        return (
          <When key={k} on={0.22 + k * 0.03}>
            <rect className="ml-node" x="56" y={y} width="128" height="16" rx="8" />
            {k === 1 && (
              <When on={0.44}>
                <rect className="ml-c" x="56" y={y} width="128" height="16" rx="8" />
              </When>
            )}
            <rect x="56" y={y} width="128" height="16" rx="8" />
            <circle className="ml-quiet" cx="66" cy={y + 8} r="3" />
            <path className="ml-quiet" d={`M74 ${y + 8}h${[70, 84, 60][k]}`} />
          </When>
        )
      })}

      {/* its answer */}
      <When on={0.5}>
        <path className="ml-dash" d="M184 117h14v51h-6" />
      </When>
      <When on={0.53}>
        <rect className="ml-under" x="43" y="159" width="150" height="42" rx="10" />
        <rect className="ml-sheet" x="40" y="156" width="150" height="42" rx="10" />
        <rect x="40" y="156" width="150" height="42" rx="10" />
        <text className="ml-t" x="52" y="170">
          Answer
        </text>
        <path className="ml-quiet" d="M52 180h96M52 189h70" />
      </When>
      <When on={0.64}>
        <circle className="ml-ink" cx="176" cy="170" r="6" />
        <path className="ml-on-ink" d="M173.2 170.2l2 2 3.8-4" />
      </When>

      {/* the reader, finding it */}
      <g opacity="0">
        <animate attributeName="opacity" dur="8s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.05;0.08;0.7;0.74;1" />
        <animateTransform
          attributeName="transform"
          type="translate"
          dur="8s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.06;0.14;0.3;0.42;0.5;0.62;0.74;1"
          values="230 200;230 200;126 68;126 68;150 120;150 120;150 184;236 206;236 206"
          keySplines={SPLINES(8)}
        />
        <path className="ml-pointer" d="M0 0v14l4-3.6 2.7 6.2 2.6-1.2-2.6-6.1h5.4z" />
      </g>
    </svg>
  )
}

/* --- 07 · who we work with -------------------------------------------------------- */

/** discrete: the right revision on the right line */
function Schedule() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={20} y={18} w={200} h={114} r={12} />
      <Label x={34} y={36}>
        Line 02 / Shift plan
      </Label>
      {[54, 78, 102].map((y, k) => (
        <g key={y}>
          <path className="ml-draw ml-quiet" style={t(0.2 + k * 0.1)} pathLength={1} d={`M34 ${y + 14}h172`} />
          <rect className={`ml-grow ${['ml-a', 'ml-b', 'ml-c'][k]}`} style={t(0.6 + k * 0.2)} x={[40, 92, 64][k]} y={y} width={[64, 78, 52][k]} height="10" rx="5" />
        </g>
      ))}
      <g className="ml-pop" style={t(1.4)}>
        <rect className="ml-ink" x="176" y="74" width="30" height="16" rx="8" />
        <text className="ml-t ml-t--ink" x="191" y="84.6" textAnchor="middle">
          Rev B
        </text>
      </g>
      <path className="ml-dash" d="M170 83h-6" />
    </svg>
  )
}

/** process: each batch's status, release when the evidence is in */
function Quality() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-draw ml-quiet" style={t(0)} pathLength={1} d="M16 126h208" />
      {[0, 1, 2].map((k) => {
        const x = 26 + k * 66
        return (
          <g key={k}>
            <path className="ml-sheet" d={`M${x} 46h48v66a8 8 0 0 1-8 8H${x + 8}a8 8 0 0 1-8-8z`} />
            <path className={`ml-fill ${['ml-a', 'ml-b', 'ml-c'][k]}`} style={t(k * 0.6)} d={`M${x + 4} ${116 - [40, 54, 30][k]}h40v${[40, 54, 30][k] - 4}a4 4 0 0 1-4 4H${x + 8}a4 4 0 0 1-4-4z`} />
            <path className="ml-draw" style={t(0.2 + k * 0.2)} pathLength={1} d={`M${x} 46h48v66a8 8 0 0 1-8 8H${x + 8}a8 8 0 0 1-8-8z`} />
            <path className="ml-draw ml-quiet" style={t(0.4 + k * 0.2)} pathLength={1} d={`M${x - 4} 46h56`} />
          </g>
        )
      })}
      <Check x={162} y={34} at={1.6} />
      <circle className="ml-ping" cx="162" cy="34" r="6.6" />
    </svg>
  )
}

/** OEMs: the unit in the field, its as-built record, the spare and the visit */
function Service() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={24} y={40} w={88} h={82} r={12} />
      <circle className="ml-a" cx="68" cy="81" r="22" />
      <g className="ml-turn" style={{ transformOrigin: '68px 81px' }}>
        <circle className="ml-draw" style={t(0.3)} pathLength={1} cx="68" cy="81" r="12" />
        <path className="ml-draw" style={t(0.5)} pathLength={1} d="M68 63v6M68 93v6M50 81h6M80 81h6" />
      </g>
      <path className="ml-dash" d="M112 70c20 0 22-24 42-24" />
      <Sheet x={152} y={22} w={66} h={48} r={9} at={0.5} />
      <path className="ml-draw ml-quiet" style={t(0.8)} pathLength={1} d="M162 36h40M162 46h30M162 56h36" />
      <g className="ml-pop" style={t(1.2)}>
        <circle className="ml-node" cx="176" cy="104" r="16" />
        <path d="M168 112l10-10M176 98a5 5 0 1 0 6 6" />
      </g>
      <Person x={208} y={104} s={0.9} at={1.4} />
      <path className="ml-draw ml-quiet" style={t(1)} pathLength={1} d="M112 100c22 0 30 4 48 4" />
    </svg>
  )
}

/** contract & suppliers: each customer's drawing and criteria, carried through */
function Records() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={20} y={24} w={112} h={102} r={10} />
      <rect className="ml-a" x="40" y="48" width="56" height="34" rx="4" />
      <rect className="ml-draw" style={t(0.4)} pathLength={1} x="40" y="48" width="56" height="34" rx="4" />
      <path className="ml-draw ml-quiet" style={t(0.7)} pathLength={1} d="M40 92h56M40 88v8M96 88v8M108 48v34M104 48h8M104 82h8" />
      <path className="ml-draw ml-quiet" style={t(0.9)} pathLength={1} d="M32 112h40" />
      <path className="ml-draw" style={t(1)} pathLength={1} d="M132 75h20m-7-7 7 7-7 7" />
      <Sheet x={156} y={30} w={64} h={90} r={10} at={0.8} />
      {[48, 68, 88].map((y, k) => (
        <g key={y}>
          <Check x={170} y={y} r={5.4} at={1.2 + k * 0.3} />
          <path className="ml-draw ml-quiet" style={t(1.3 + k * 0.3)} pathLength={1} d={`M180 ${y}h${[30, 24, 28][k]}`} />
        </g>
      ))}
    </svg>
  )
}

/* --- 07 · who we work with: the four stations (12 Nov, second pass: Krish,
   "this whole section come up with something else"). One belt runs through
   the four cards and the same order rides it from station to station; each
   station is drawn over the belt, held still (only its work moves), its
   work centred where the order stops
   (x 120; the belt itself, at y 118, is drawn by the section across all four
   cards). A station idles until the order is in it (an ancestor marked
   data-on), then does its work: the press stamps the revision on; the batch
   pours and is released; the serial plate goes on and the spare is matched;
   the customer's criteria are checked off. 240 × 150. -------------------------- */

/** the belt's rollers and underside, as in every station */
function Rollers() {
  return (
    <>
      <path className="ml-quiet" d="M0 134h240" />
      {Array.from({ length: 10 }, (_, k) => (
        <circle key={k} className="ml-roll" cx={12 + k * 24} cy="126" r="4" />
      ))}
    </>
  )
}

/** a check that lands when the order is in the station, `d` after it */
function OnCheck({ x, y, r = 6, d }: { x: number; y: number; r?: number; d: string }) {
  return (
    <g className="st-on" style={{ '--d': d } as CSSProperties}>
      <circle className="ml-ink" cx={x} cy={y} r={r} />
      <path className="ml-on-ink" d={`M${x - r * 0.45} ${y + 0.2}l${r * 0.32} ${r * 0.32} ${r * 0.6}-${r * 0.64}`} />
    </g>
  )
}

/** a dark tag that lands over the order */
function OnTag({ w, children, d }: { w: number; children: string; d: string }) {
  return (
    <g className="st-on" style={{ '--d': d } as CSSProperties}>
      <rect className="ml-ink" x={120 - w / 2} y="86" width={w} height="13" rx="6.5" />
      <text className="ml-t ml-t--ink" x="120" y="94.8" textAnchor="middle">
        {children}
      </text>
    </g>
  )
}

/** discrete: the cell's press puts the right revision on the job */
function StationDiscrete() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={12} y={14} w={70} h={58} r={9} still />
      <Label x={22} y={30}>
        Line 02
      </Label>
      <rect className="ml-b" x="22" y="38" width="40" height="7" rx="3.5" />
      <rect className="ml-c st-grow" style={{ '--d': '1.4s' } as CSSProperties} x="30" y="53" width="42" height="7" rx="3.5" />
      <path d="M92 118V36h56v82" />
      <rect className="ml-node" x="104" y="32" width="32" height="10" rx="3" />
      <g className="st-press">
        <path d="M120 42v24" />
        <rect className="ml-node" x="106" y="66" width="28" height="10" rx="3" />
      </g>
      <g className="st-on" style={{ '--d': '1.5s' } as CSSProperties}>
        <rect className="ml-ink" x="101" y="12" width="38" height="14" rx="7" />
        <text className="ml-t ml-t--ink" x="120" y="21.4" textAnchor="middle">
          Rev B
        </text>
      </g>
      <Label x={162} y={70}>
        Parts
      </Label>
      <path className="ml-quiet" d="M160 98h66" />
      {[0, 1, 2].map((k) => (
        <rect key={k} className={k === 1 ? 'ml-b' : 'ml-node'} x={164 + k * 22} y="80" width="16" height="18" rx="3" />
      ))}
      <rect x="186" y="80" width="16" height="18" rx="3" />
      <OnCheck x={208} y={66} r={5.4} d="1.9s" />
      <Rollers />
    </svg>
  )
}

/** process: the batch pours, its inspection is in, it is released */
function StationProcess() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <path className="ml-sheet" d="M22 14h56v58a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10z" />
      <path className="ml-b st-pour" d="M26 40h48v32a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6z" />
      <path d="M22 14h56v58a10 10 0 0 1-10 10H32a10 10 0 0 1-10-10z" />
      <Label x={30} y={30}>
        Batch 18
      </Label>
      <path d="M50 82v12h70v8" />
      <circle className="ml-node" cx="86" cy="94" r="5" />
      <path d="M83 91l6 6M83 97l6-6" />
      {[0, 1, 2].map((k) => (
        <circle key={k} className="ml-b st-drip" style={{ '--d': `${1 + k * 0.3}s` } as CSSProperties} cx="120" cy="104" r="2" />
      ))}
      <Sheet x={148} y={14} w={80} h={70} r={9} still />
      <Label x={158} y={30}>
        Inspection
      </Label>
      <path className="ml-quiet" d="M158 42h40M158 52h30" />
      <g className="st-on" style={{ '--d': '2.1s' } as CSSProperties}>
        <rect className="ml-ink" x="158" y="62" width="52" height="13" rx="6.5" />
        <text className="ml-t ml-t--ink" x="184" y="70.8" textAnchor="middle">
          Released
        </text>
      </g>
      <Rollers />
    </svg>
  )
}

/** OEMs: the unit's serial plate goes on, its as-built record and the
 *  matching spare come up */
function StationOem() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={12} y={14} w={80} h={70} r={9} still />
      <Label x={22} y={30}>
        As-built
      </Label>
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle className={k === 2 ? 'ml-ink' : 'ml-node'} cx="24" cy={44 + k * 12} r="2.6" />
          <path className="ml-quiet" d={`M32 ${44 + k * 12}h${[40, 48, 34][k]}`} />
        </g>
      ))}
      <Sheet x={148} y={14} w={80} h={70} r={9} still />
      <Label x={158} y={30}>
        Field
      </Label>
      <circle className="ml-b" cx="188" cy="54" r="17" />
      <g className="ml-turn" style={{ transformOrigin: '188px 54px' }}>
        <circle cx="188" cy="54" r="9.5" />
        <path d="M188 40v5M188 63v5M174 54h5M197 54h5" />
      </g>
      <circle className="ml-ink" cx="218" cy="26" r="2.4" />
      <circle className="ml-ping" cx="218" cy="26" r="2.4" />
      <path className="ml-dash" d="M92 40h56" />
      <g className="st-on" style={{ '--d': '1.8s' } as CSSProperties}>
        <rect className="ml-c" x="98" y="50" width="44" height="13" rx="6.5" />
        <text className="ml-t" x="120" y="58.8" textAnchor="middle">
          Spare
        </text>
      </g>
      <OnTag w={44} d="1.1s">
        SN 0042
      </OnTag>
      <Rollers />
    </svg>
  )
}

/** contract & suppliers: the customer's drawing travels with the job and its
 *  acceptance criteria are checked off one by one */
function StationContract() {
  return (
    <svg className="ml-art" viewBox="0 0 240 150" aria-hidden="true">
      <Sheet x={12} y={14} w={84} h={70} r={9} still />
      <Label x={22} y={30}>
        Dwg / Cust A
      </Label>
      <rect className="ml-b" x="24" y="40" width="38" height="24" rx="3" />
      <rect x="24" y="40" width="38" height="24" rx="3" />
      <path className="ml-quiet" d="M24 72h38M24 69v6M62 69v6M74 40v24M71 40h6M71 64h6" />
      <Sheet x={144} y={14} w={84} h={70} r={9} still />
      <Label x={154} y={30}>
        Acceptance
      </Label>
      {[0, 1, 2].map((k) => {
        const y = 44 + k * 13
        return (
          <g key={k}>
            <circle className="ml-node" cx="158" cy={y} r="4.4" />
            <OnCheck x={158} y={y} r={4.4} d={`${1.2 + k * 0.35}s`} />
            <path className="ml-quiet" d={`M167 ${y}h${[44, 36, 50][k]}`} />
          </g>
        )
      })}
      <path className="ml-dash" d="M96 49h48" />
      <OnTag w={42} d="0.9s">
        Cust A
      </OnTag>
      <Rollers />
    </svg>
  )
}

const SCENE: Record<ArtName, () => ReactElement> = {
  sequence: Sequence,
  hold: Hold,
  asset: Asset,
  material: Material,
  production: Production,
  decision: Decision,
  connected: Connected,
  platform: Platform,
  supplier: Supplier,
  plant: Plant,
  truck: Truck,
  invoice: Invoice,
  recover: Recover,
  pricing: Pricing,
  benefits: Benefits,
  schedule: Schedule,
  quality: Quality,
  service: Service,
  records: Records,
  'st-discrete': StationDiscrete,
  'st-process': StationProcess,
  'st-oem': StationOem,
  'st-contract': StationContract,
}

export function MfgArt({ name, className = '' }: { name: string; className?: string }) {
  const Scene = SCENE[name as ArtName]
  if (!Scene) return null
  return (
    <div className={`ml ${className}`.trim()}>
      <Scene />
    </div>
  )
}
