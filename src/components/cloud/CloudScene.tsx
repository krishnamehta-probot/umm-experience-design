import type { ArchWorkflow } from '@/content/cloudData'

/* ============================================================================
   CLOUD & DATA · THE DATA'S JOURNEY (ConnectedArchitecture's picture)

   The architecture as a picture, on the ink board: your systems on the
   left (an app window, a database, a code file), the cloud in the middle
   holding the movement band, the runtime's rack, the data platform's
   stores and the observability monitor; what it enables on the right, as
   three screens; the AI orchestration orb above, its beam into the cloud;
   the engineer's checks along the floor; the loop from the screens back
   up to the orb.

   `focus` is the card being read. The architecture's four light their
   part, packets running into it; the three workflows light their route,
   packets running it from system to screen:

     systems       the three systems, packets into the cloud
     platform      the cloud's parts, packets across it
     outcomes      the three screens, packets out to them, the loop
     oversight     the checks along the floor, one after another
     provisioning  engineering context → the runtime → applications
     migration     enterprise data → the band → the stores → data
     operations    business apps → observability → performance, the loop

   Motion: cloud-flow.css; the packets are SVG's own animateMotion.
   ========================================================================== */

export type SceneFocus = 'systems' | 'platform' | 'outcomes' | 'oversight' | ArchWorkflow['id']

const L = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const RAISE = { ...L, fill: 'var(--umm-ink-raise)' } as const

const ROW_Y = [110, 190, 270]
const IN = ROW_Y.map((y) => `M172 ${y}C256 ${y} 256 190 340 190`)
const OUT = ROW_Y.map((y) => `M660 190C744 190 744 ${y} 828 ${y}`)

/** what each card lights, and the routes its packets run */
const SCENE: Record<
  SceneFocus,
  { sys: number[]; parts: string[]; out: number[]; guard?: boolean; loop?: boolean; routes: string[] }
> = {
  systems: { sys: [0, 1, 2], parts: [], out: [], routes: IN },
  platform: {
    sys: [],
    parts: ['movement', 'runtime', 'data', 'observe'],
    out: [],
    routes: ['M340 190L420 147H580L660 190', 'M340 190L444 210H556L660 190', 'M340 190L500 264L660 190'],
  },
  outcomes: { sys: [], parts: [], out: [0, 1, 2], loop: true, routes: OUT },
  oversight: { sys: [], parts: [], out: [], guard: true, routes: ['M200 326H800'] },
  provisioning: {
    sys: [2],
    parts: ['runtime'],
    out: [0],
    routes: ['M172 270C256 270 256 190 340 190L444 210L660 190C744 190 744 110 828 110'],
  },
  migration: {
    sys: [1],
    parts: ['movement', 'data'],
    out: [1],
    routes: ['M172 190H340L420 147H580L556 210L660 190H828'],
  },
  operations: {
    sys: [0],
    parts: ['observe'],
    out: [2],
    loop: true,
    routes: ['M172 110C256 110 256 190 340 190L500 264L660 190C744 190 744 270 828 270'],
  },
}

export function CloudScene({ focus }: { focus: SceneFocus }) {
  const s = SCENE[focus]
  const on = (lit: boolean) => (lit ? 'true' : undefined)
  const part = (name: string) => on(s.parts.includes(name))
  const packets = s.routes.length > 1 ? 2 : 3
  return (
    <svg className="cd-sky" viewBox="0 0 1000 340" aria-hidden="true" data-focus={focus}>
      {/* the pipes: every system into the cloud, the cloud to every screen */}
      <g className="cd-sky__pipes">
        {IN.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
        {OUT.map((d) => (
          <path key={d} {...L} d={d} />
        ))}
      </g>

      {/* the AI orchestration orb, its beam into the cloud */}
      <g className="cd-sky__orb">
        <path {...L} className="cd-sky__beam" d="M500 66V122" />
        <circle {...RAISE} cx="500" cy="40" r="24" />
        <g className="cd-sky__spark">
          <path {...L} d="M500 28v24M488 40h24M491.5 31.5l17 17M508.5 31.5l-17 17" />
        </g>
      </g>

      {/* the loop: production signals back up to the orb */}
      <path {...L} className="cd-sky__loop" data-on={on(!!s.loop)} d="M944 270C988 270 988 40 900 40H530" />

      {/* your systems */}
      <g className="cd-sky__lit" data-on={on(s.sys.includes(0))}>
        <rect {...RAISE} x="62" y="84" width="106" height="52" rx="8" />
        <path {...L} d="M62 98h106M72 91h0M80 91h0" />
        <path {...L} d="M76 110h30M76 120h44M126 108h30v20h-30z" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.sys.includes(1))}>
        <path {...RAISE} d="M84 172v36c0 6 14 10 31 10s31 -4 31 -10v-36" />
        <ellipse {...RAISE} cx="115" cy="172" rx="31" ry="9" />
        <path {...L} d="M84 190c0 6 14 10 31 10s31 -4 31 -10" />
      </g>
      <g className="cd-sky__lit" data-on={on(s.sys.includes(2))}>
        <path {...RAISE} d="M84 244h40l14 14v40h-54z" />
        <path {...L} d="M124 244v14h14M98 268l-6 6 6 6M114 268l6 6 -6 6M108 264l-4 20" />
      </g>

      {/* the cloud */}
      <path
        {...RAISE}
        className="cd-sky__cloud"
        d="M372 300H636A58 58 0 0 0 652 186A84 84 0 0 0 496 128A64 64 0 0 0 380 170A66 66 0 0 0 372 300Z"
      />
      <g className="cd-sky__lit" data-on={part('movement')}>
        <rect {...L} x="414" y="140" width="172" height="14" rx="7" />
        <path {...L} className="cd-sky__move" d="M424 147H576" />
      </g>
      <g className="cd-sky__lit" data-on={part('runtime')}>
        {[168, 192, 216].map((y, i) => (
          <g key={y}>
            <rect {...RAISE} x="408" y={y} width="72" height="18" rx="4" />
            <circle className="cd-sky__led" cx="420" cy={y + 9} r="3" style={{ ['--i' as string]: i }} />
            <path {...L} d={`M432 ${y + 9}h36`} />
          </g>
        ))}
      </g>
      <g className="cd-sky__lit" data-on={part('data')}>
        {[528, 566].map((x, i) => (
          <g key={x} className="cd-sky__store" style={{ ['--i' as string]: i }}>
            <path {...RAISE} d={`M${x - 16} 178v40c0 4 7 7 16 7s16 -3 16 -7v-40`} />
            <ellipse {...RAISE} cx={x} cy="178" rx="16" ry="6" />
            <path {...L} d={`M${x - 16} 198c0 4 7 7 16 7s16 -3 16 -7`} />
          </g>
        ))}
      </g>
      <g className="cd-sky__lit" data-on={part('observe')}>
        <rect {...RAISE} x="464" y="244" width="72" height="40" rx="6" />
        <path {...L} className="cd-sky__pulse" d="M472 266h12l5 -10 7 20 5 -12h8l4 -5 4 5h11" />
      </g>

      {/* what it enables */}
      {ROW_Y.map((y, i) => (
        <g key={y} className="cd-sky__lit cd-sky__out" data-on={on(s.out.includes(i))}>
          <rect {...RAISE} x="830" y={y - 28} width="112" height="56" rx="8" />
          {i === 0 && <path {...L} d={`M842 ${y - 14}h40M842 ${y - 4}h60M842 ${y + 6}h28M912 ${y - 16}h18v28h-18z`} />}
          {i === 1 &&
            [0, 1, 2, 3].map((k) => (
              <rect
                key={k}
                className="cd-sky__bar"
                x={848 + k * 20}
                y={y - 16}
                width="12"
                height="32"
                rx="2"
                style={{ ['--i' as string]: k }}
              />
            ))}
          {i === 2 && <path {...L} d={`M856 ${y + 14}a30 30 0 0 1 60 0M886 ${y + 14}l14 -18`} />}
        </g>
      ))}

      {/* the engineer's checks along the floor */}
      <g className="cd-sky__guard" data-on={on(!!s.guard)}>
        <path {...L} d="M200 326H800" />
        {[290, 430, 570, 710].map((x, i) => (
          <g key={x} style={{ ['--i' as string]: i }} className="cd-sky__shield">
            <path {...RAISE} d={`M${x} 310l-11 4v7c0 6 4.6 10.6 11 12 6.4 -1.4 11 -6 11 -12v-7z`} />
            <path {...L} strokeWidth="1.6" d={`M${x - 4.5} 321l3 3 6 -6`} />
          </g>
        ))}
      </g>

      {/* the routes lit, and the packets running them */}
      <g key={focus}>
        {s.routes.map((d, r) => (
          <g key={d}>
            <path {...L} className="cd-sky__route" d={d} id={`cd-sky-route-${r}`} />
            {Array.from({ length: packets }, (_, k) => (
              <circle key={k} className="cd-sky__packet" r="5.5">
                <animateMotion
                  dur="2.4s"
                  begin={`-${(k * 2.4) / packets + r * 0.4}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                >
                  <mpath href={`#cd-sky-route-${r}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
