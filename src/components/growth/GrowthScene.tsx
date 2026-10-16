import type { GrowthWorkflow } from '@/content/growth'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH SYSTEM AS A PICTURE (GrowthSystem's)

   On the ink board: the brief at the top (commercial direction), its beam
   into the growth engine; the customer signals on the left (CRM, the web
   and its cart, brand and search knowledge); the engine in the middle, its
   four modules (audience, creative, journeys, experiments); the channels
   on the right (ads, email, search); the measurement chart over them, its
   loop back to the brief; the people's checks along the floor.

   `focus` is the card being read. The system's four light their part with
   packets running into it; the four workflows light their route:

     signals    the three sources, packets into the engine
     engine     the four modules, packets across it
     channels   the three channels, packets out to them
     measure    the chart, responses climbing to it, the loop to the brief
     discovery  brand and search knowledge → creative → search → the chart
     paid       CRM → audience → ads → the chart
     lifecycle  CRM → journeys → email and CRM, back to the CRM
     content    the brief → creative → the checks → ads and search

   Motion: cloud-flow.css (the shared story) and growth-scene.css.
   ========================================================================== */

export type GrowthFocus = 'signals' | 'engine' | 'channels' | 'measure' | GrowthWorkflow['id']

const L = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const RAISE = { ...L, fill: 'var(--umm-ink-raise)' } as const

const ROW_Y = [130, 210, 290]
const IN = ROW_Y.map((y) => `M172 ${y}C276 ${y} 276 210 380 210`)
const OUT = ROW_Y.map((y) => `M620 210C724 210 724 ${y} 828 ${y}`)
/** the modules' tiles, 2 by 2 inside the engine, and their centres */
const TILE = [
  [392, 140],
  [508, 140],
  [392, 216],
  [508, 216],
]
const MID = TILE.map(([x, y]) => [x + 50, y + 32])

const SCENE: Record<
  GrowthFocus,
  {
    sig: number[]
    mod: number[]
    ch: number[]
    brief?: boolean
    chart?: boolean
    guard?: boolean
    loop?: boolean
    routes: string[]
  }
> = {
  signals: { sig: [0, 1, 2], mod: [], ch: [], routes: IN },
  engine: { sig: [], mod: [0, 1, 2, 3], ch: [], routes: ['M380 210H620', 'M500 130V292'] },
  channels: { sig: [], mod: [], ch: [0, 1, 2], routes: OUT },
  measure: {
    sig: [],
    mod: [],
    ch: [],
    chart: true,
    loop: true,
    routes: ['M942 290C986 290 986 50 942 50', 'M828 50H524'],
  },
  discovery: {
    sig: [2],
    mod: [1],
    ch: [2],
    chart: true,
    routes: [`M172 290C276 290 276 210 380 210L${MID[1][0]} ${MID[1][1]}L620 210C724 210 724 290 828 290`],
  },
  paid: {
    sig: [0],
    mod: [0],
    ch: [0],
    chart: true,
    routes: [`M172 130C276 130 276 210 380 210L${MID[0][0]} ${MID[0][1]}L620 210C724 210 724 130 828 130`],
  },
  lifecycle: {
    sig: [0],
    mod: [2],
    ch: [1],
    routes: [
      `M172 130C276 130 276 210 380 210L${MID[2][0]} ${MID[2][1]}L620 210C724 210 724 210 828 210`,
      'M884 238V330H116V158',
    ],
  },
  content: {
    sig: [],
    mod: [1],
    ch: [0, 2],
    brief: true,
    guard: true,
    routes: [
      `M500 66V120L${MID[1][0]} ${MID[1][1]}L620 210C724 210 724 130 828 130`,
      `M500 66V120L${MID[1][0]} ${MID[1][1]}L620 210C724 210 724 290 828 290`,
    ],
  },
}

/** the modules' small marks, drawn at a tile's centre */
const MOD_MARK = [
  (x: number, y: number) =>
    `M${x} ${y}m-12 0a12 12 0 1 0 24 0a12 12 0 1 0 -24 0M${x} ${y}m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0`,
  (x: number, y: number) => `M${x} ${y - 13}v26M${x - 13} ${y}h26M${x - 9} ${y - 9}l18 18M${x + 9} ${y - 9}l-18 18`,
  (x: number, y: number) => `M${x - 16} ${y - 6}h28l-6 -6M${x + 16} ${y + 6}h-28l6 6`,
  (x: number, y: number) => `M${x - 12} ${y + 12}l24 -24M${x - 2} ${y - 12}h14v14`,
]

export function GrowthScene({ focus }: { focus: GrowthFocus }) {
  const s = SCENE[focus]
  const on = (lit: boolean) => (lit ? 'true' : undefined)
  const packets = s.routes.length > 1 ? 2 : 3
  return (
    <svg className="cd-sky gr-sky" viewBox="0 0 1000 350" aria-hidden="true" data-focus={focus}>
      <g className="cd-sky__pipes">
        {IN.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
        {OUT.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
      </g>

      {/* the brief, its beam into the engine */}
      <g className="cd-sky__lit gr-sky__brief" data-on={on(!!s.brief)}>
        <path {...L} className="cd-sky__beam" d="M500 70V118" />
        <path {...RAISE} d="M478 14h34l12 12v40h-46z" />
        <path {...L} d="M512 14v12h12M486 38h26M486 48h30M486 58h18" />
      </g>

      {/* the loop: responses back to the brief */}
      <path {...L} className="cd-sky__loop" data-on={on(!!s.loop)} d="M828 50H530" />

      {/* customer signals */}
      <g className="cd-sky__lit" data-on={on(s.sig.includes(0))}>
        {/* CRM: a contact card */}
        <rect {...RAISE} x="62" y="104" width="108" height="52" rx="8" />
        <circle {...L} cx="86" cy="124" r="8" />
        <path {...L} d="M74 146c2 -7 6 -10 12 -10s10 3 12 10M108 120h48M108 132h36M108 144h42" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.sig.includes(1))}>
        {/* the web and its cart */}
        <rect {...RAISE} x="62" y="184" width="108" height="52" rx="8" />
        <path {...L} d="M62 198h108M74 214h24M74 224h34" />
        <path {...L} d="M124 212h4l4 14h18l3 -10h-23M136 232h0M148 232h0" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.sig.includes(2))}>
        {/* brand and search knowledge: a book and a lens */}
        <path {...RAISE} d="M70 268h38v46H70zM108 268h38v46h-38z" />
        <circle {...RAISE} cx="148" cy="306" r="11" />
        <path {...L} d="M156 314l10 10M78 280h22M78 290h18M116 280h22M116 290h16" />
      </g>

      {/* the growth engine and its modules */}
      <rect {...RAISE} className="cd-sky__cloud" x="380" y="126" width="240" height="168" rx="22" />
      {TILE.map(([x, y], i) => (
        <g key={i} className="cd-sky__lit" data-on={on(s.mod.includes(i))}>
          <rect {...RAISE} x={x} y={y} width="100" height="64" rx="12" />
          <path {...L} className={i === 1 ? 'gr-sky__twirl' : undefined} d={MOD_MARK[i](x + 50, y + 32)} />
        </g>
      ))}

      {/* the channels */}
      <g className="cd-sky__lit" data-on={on(s.ch.includes(0))}>
        {/* ads: a megaphone */}
        <rect {...RAISE} x="830" y="104" width="112" height="52" rx="8" />
        <path {...L} d="M858 122h10l22 -10v36l-22 -10h-10zM868 138l4 10M900 124c4 2 4 10 0 12" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.ch.includes(1))}>
        {/* email: an envelope */}
        <rect {...RAISE} x="830" y="184" width="112" height="52" rx="8" />
        <path {...L} d="M862 198h48v26h-48zM862 198l24 16 24 -16" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.ch.includes(2))}>
        {/* search: a results page */}
        <rect {...RAISE} x="830" y="264" width="112" height="52" rx="8" />
        <path {...L} d="M846 278h56M846 290h40M846 302h48" />
        <circle {...L} cx="918" cy="288" r="8" />
        <path {...L} d="M924 294l8 8" />
      </g>

      {/* measurement: the chart, climbing */}
      <g className="cd-sky__lit gr-sky__chart" data-on={on(!!s.chart)}>
        <rect {...RAISE} x="830" y="18" width="112" height="64" rx="8" />
        {[0, 1, 2, 3].map((k) => (
          <rect
            key={k}
            className="cd-sky__bar"
            x={846 + k * 22}
            y={70 - (k + 1) * 10}
            width="12"
            height={(k + 1) * 10}
            rx="2"
            style={{ ['--i' as string]: k }}
          />
        ))}
        <path {...L} d="M844 56l22 -8 22 -10 22 -10 22 -8" />
      </g>

      {/* the people's checks along the floor */}
      <g className="cd-sky__guard" data-on={on(!!s.guard)}>
        <path {...L} d="M360 336H640" />
        {[420, 500, 580].map((x, i) => (
          <g key={x} style={{ ['--i' as string]: i }} className="cd-sky__shield">
            <path {...RAISE} d={`M${x} 318l-11 4v7c0 6 4.6 10.6 11 12 6.4 -1.4 11 -6 11 -12v-7z`} />
            <path {...L} strokeWidth="1.6" d={`M${x - 4.5} 329l3 3 6 -6`} />
          </g>
        ))}
      </g>

      {/* the routes lit, and the packets running them */}
      <g key={focus}>
        {s.routes.map((d, r) => (
          <g key={d}>
            <path {...L} className="cd-sky__route" d={d} id={`gr-sky-route-${r}`} />
            {Array.from({ length: packets }, (_, k) => (
              <circle key={k} className="cd-sky__packet" r="5.5">
                <animateMotion
                  dur="2.6s"
                  begin={`-${(k * 2.6) / packets + r * 0.4}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#gr-sky-route-${r}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
