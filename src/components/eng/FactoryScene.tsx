import type { Tone } from '@/components/primitives'

/* ============================================================================
   DIGITAL ENGINEERING · THE FACTORY FLOOR (EngineeringFactory's picture)

   A side view of the delivery line, drawn on the ink board. A conveyor runs
   under five machines, one per stage; the work item rides it, carried by
   the reader's scroll (--p, 0 to 4, set by EngineeringFactory without a
   render). Above the belt, the agents' machines; under it, the engineer at
   each station, lit where the work is:

     Define    a printer: the brief is printed onto the item
     Build     two robot arms, spark-tipped (the agents), stack its parts
     Validate  a scanner arch sweeps it, three lights come on
     Release   the review gate: a barrier that lifts as the item reaches it
     Evolve    a monitor reads production; its signal runs back along the
               loop pipe, over the line, into Define

   The item keeps what each station gave it: the brief, the parts, the
   check, the release seal, the live pulse. Motion: eng-line.css.
   ========================================================================== */

/** each station's centre on the 1000-wide floor */
export const STATION_X = [110, 305, 500, 695, 890]
/** the distance between stations, what one step of --p moves the item */
export const STATION_GAP = 195

const L = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const RAISE = { ...L, fill: 'var(--umm-ink-raise)' } as const

function Engineer({ x }: { x: number }) {
  return (
    <g>
      <circle {...RAISE} cx={x} cy={276} r={9} />
      <path {...RAISE} d={`M${x - 17} 310c0 -13 7.6 -19 17 -19s17 6 17 19`} />
    </g>
  )
}

export function FactoryScene({ at, tones }: { at: number; tones: Tone[] }) {
  const on = (i: number) => (at === i ? 'true' : undefined)
  const tone = (i: number) => ({
    ['--tone' as string]: `var(--umm-${tones[i % tones.length]})`,
  })
  return (
    <svg className="ef-floor" viewBox="0 0 1000 320" aria-hidden="true" data-at={at}>
      {/* the loop: production signals back to Define */}
      <g className="ef-floor__loop" data-on={on(4)} style={tone(4)}>
        <path {...L} className="ef-floor__pipe" d="M890 92V30a6 6 0 0 0 -6 -6H116a6 6 0 0 0 -6 6V96" />
        <path {...L} className="ef-floor__flow" d="M890 92V30a6 6 0 0 0 -6 -6H116a6 6 0 0 0 -6 6V96" />
      </g>

      {/* 1 · Define: the printer */}
      <g className="ef-floor__st ef-floor__st--define" data-on={on(0)} style={tone(0)}>
        <g className="ef-floor__sheet">
          <rect {...L} x="86" y="146" width="48" height="34" rx="3" fill="var(--umm-ink-paper)" stroke="none" />
          <path {...L} stroke="var(--umm-ink)" strokeWidth="1.6" d="M93 155h22M93 162h30M93 169h16" />
        </g>
        <rect {...RAISE} x="58" y="96" width="104" height="56" rx="10" />
        <rect {...L} className="ef-floor__screen" x="70" y="106" width="44" height="16" rx="3" />
        <path {...L} className="ef-floor__cursor" d="M76 114h8" />
        <circle className="ef-floor__lamp" cx="148" cy="112" r="4.5" />
        <path {...L} d="M78 152h64" />
      </g>

      {/* 2 · Build: the agents' arms */}
      <g className="ef-floor__st ef-floor__st--build" data-on={on(1)} style={tone(1)}>
        <path {...L} d="M250 40v30M360 40v30" />
        <rect {...RAISE} x="240" y="66" width="130" height="12" rx="6" />
        <g className="ef-floor__arm ef-floor__arm--a">
          <path {...L} strokeWidth="5" d="M282 78l-14 42 22 36" />
          <circle {...RAISE} cx="282" cy="78" r="6" />
          <circle {...RAISE} cx="268" cy="120" r="5" />
          <circle className="ef-floor__spark" cx="290" cy="158" r="6" />
        </g>
        <g className="ef-floor__arm ef-floor__arm--b">
          <path {...L} strokeWidth="5" d="M328 78l14 42 -22 36" />
          <circle {...RAISE} cx="328" cy="78" r="6" />
          <circle {...RAISE} cx="342" cy="120" r="5" />
          <circle className="ef-floor__spark" cx="320" cy="158" r="6" />
        </g>
        <rect className="ef-floor__part" x="298" y="140" width="14" height="14" rx="2" />
      </g>

      {/* 3 · Validate: the scanner */}
      <g className="ef-floor__st ef-floor__st--validate" data-on={on(2)} style={tone(2)}>
        <path {...L} strokeWidth="6" d="M452 238V152a14 14 0 0 1 14 -14h68a14 14 0 0 1 14 14V238" />
        {[480, 500, 520].map((x, i) => (
          <circle key={x} className="ef-floor__light" cx={x} cy="126" r="4.5" style={{ ['--i' as string]: i }} />
        ))}
        <path className="ef-floor__beam" d="M460 156h80" />
      </g>

      {/* 4 · Release: the review gate */}
      <g
        className="ef-floor__st ef-floor__st--release"
        data-on={on(3)}
        data-open={at >= 3 || undefined}
        style={tone(3)}
      >
        <g className="ef-floor__badge">
          <path {...RAISE} d="M695 82l-20 8v15c0 12 8.4 22 20 25 11.6 -3 20 -13 20 -25V90z" />
          <path {...L} className="ef-floor__tick" d="M686 106l6 6 11 -12" />
        </g>
        <rect {...RAISE} x="742" y="148" width="10" height="90" rx="3" />
        <g className="ef-floor__bar">
          <rect {...RAISE} x="640" y="190" width="110" height="10" rx="5" />
          <path className="ef-floor__stripes" d="M652 195h90" />
        </g>
        <circle {...RAISE} cx="747" cy="195" r="6" />
      </g>

      {/* 5 · Evolve: the monitor */}
      <g className="ef-floor__st ef-floor__st--evolve" data-on={on(4)} style={tone(4)}>
        <rect {...RAISE} x="836" y="92" width="108" height="68" rx="9" />
        <path {...L} d="M890 160v16M868 178h44" />
        <path {...L} className="ef-floor__pulse" d="M848 132h16l6 -16 8 30 6 -14h12l5 -9 5 9h20" />
      </g>

      {/* the conveyor */}
      <rect {...RAISE} x="28" y="236" width="944" height="18" rx="9" />
      <path {...L} className="ef-floor__treads" d="M40 236H960" />
      {Array.from({ length: 16 }, (_, k) => (
        <g key={k} className="ef-floor__roller" transform={`translate(${52 + k * 60} 245)`}>
          <g>
            <circle {...L} r="5" strokeWidth="1.5" />
            <path {...L} strokeWidth="1.5" d="M-5 0h10" />
          </g>
        </g>
      ))}

      {/* the work item, carried by the scroll */}
      <g className="ef-floor__item">
        <rect {...RAISE} x="78" y="194" width="64" height="42" rx="6" />
        <g className="ef-floor__has" data-show={at >= 0 || undefined}>
          <rect x="86" y="202" width="24" height="26" rx="2" fill="var(--umm-ink-paper)" />
          <path {...L} stroke="var(--umm-ink)" strokeWidth="1.6" d="M91 210h14M91 216h10M91 222h12" />
        </g>
        <g className="ef-floor__has" data-show={at >= 1 || undefined} style={tone(1)}>
          <rect className="ef-floor__toned" x="84" y="180" width="14" height="14" rx="2" />
          <rect className="ef-floor__toned" x="100" y="180" width="14" height="14" rx="2" />
          <rect className="ef-floor__toned" x="92" y="166" width="14" height="14" rx="2" />
        </g>
        <g className="ef-floor__has" data-show={at >= 2 || undefined} style={tone(2)}>
          <circle className="ef-floor__toned" cx="130" cy="206" r="9" />
          <path {...L} stroke="var(--umm-ink)" d="M125.5 206l3.4 3.4 6 -6.4" />
        </g>
        <g className="ef-floor__has" data-show={at >= 3 || undefined} style={tone(3)}>
          <path className="ef-floor__toned" d="M118 220h22v14l-5 -3 -6 3 -6 -3 -5 3z" />
        </g>
        <g className="ef-floor__has ef-floor__live" data-show={at >= 4 || undefined} style={tone(4)}>
          <circle className="ef-floor__ring" cx="110" cy="215" r="40" />
        </g>
      </g>

      {/* the engineers, one at each station */}
      {STATION_X.map((x, i) => (
        <g key={x} className="ef-floor__eng" data-on={on(i)} style={tone(i)}>
          <Engineer x={x} />
        </g>
      ))}
    </svg>
  )
}
