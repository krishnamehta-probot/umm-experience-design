import type { CSSProperties } from 'react'
import type { Tone } from '@/components/primitives'
import {
  C,
  R,
  beltPath,
  fillPath,
  labelPath,
  ringBottom,
  ringTop,
  rotorBolts,
  rotorSlots,
  rotorTicks,
  satCentre,
  segmentPath,
} from './growthFlywheel'

/* ============================================================================
   INTEGRATED GROWTH · THE GROWTH FLYWHEEL (the drawing; GrowthSystem's hero)

   17 Oct, Krish's pick for the growth system: a flywheel. Decorative and
   aria-hidden: every word on it is also in the rows beside it (the stage
   titles, the workflow names) or in the commercial direction's own block.
   The geometry and the motion live in growthFlywheel.ts; the look in
   growth-flywheel.css.
   ========================================================================== */

const tone = (t: Tone, more?: Record<string, string>) =>
  ({ ['--tone' as string]: `var(--umm-${t})`, ...more }) as CSSProperties

/** the 5-stop cylindrical body, across the track's thickness */
const TUBE = [
  { at: R.in / R.out, c: 'deep' },
  { at: 0.895, c: 'tone' },
  { at: R.mid / R.out, c: 'light' },
  { at: 0.968, c: 'tone' },
  { at: 1, c: 'deep' },
]

export function Flywheel({
  stages,
  items,
  stageTones,
  flowTones,
}: {
  /** ["01", "Customer signals"], … */
  stages: string[][]
  /** the commercial direction's four priorities */
  items: string[]
  stageTones: Tone[]
  flowTones: Tone[]
}) {
  const half = Math.ceil(items.length / 2)
  const lines = [items.slice(0, half), items.slice(half)]

  return (
    <div className="gf__wheel" aria-hidden="true">
      <span className="gf__glow" />

      {/* the track: the four stages as one loop, and the belts round it */}
      <svg className="gf__base" viewBox="0 0 1000 1000" focusable="false">
        <defs>
          <radialGradient id="gf-tube-base" gradientUnits="userSpaceOnUse" cx={C} cy={C} r={R.out}>
            {TUBE.map((s) => (
              <stop key={s.at} offset={s.at} className={`gf__bs gf__bs--${s.c}`} />
            ))}
          </radialGradient>
          {stages.map((_, i) => (
            <path key={i} id={`gf-lp-${i}`} d={labelPath(i)} />
          ))}
        </defs>

        {stages.map(([n, name], i) => {
          const d = segmentPath(i)
          const [nx, ny] = [C + R.mid * Math.sin((i * Math.PI) / 2), C - R.mid * Math.cos((i * Math.PI) / 2)]
          return (
            <g key={n} className="gf__seg" data-gf-seg="" style={tone(stageTones[i])}>
              <radialGradient id={`gf-tube-${i}`} gradientUnits="userSpaceOnUse" cx={C} cy={C} r={R.out}>
                {TUBE.map((s) => (
                  <stop key={s.at} offset={s.at} className={`gf__ts gf__ts--${s.c}`} />
                ))}
              </radialGradient>
              <clipPath id={`gf-clip-${i}`}>
                <path d={d} />
              </clipPath>
              <path className="gf__seg-base" d={d} fill="url(#gf-tube-base)" />
              <path
                className="gf__seg-fill"
                data-gf="fill"
                d={fillPath(i)}
                pathLength={1}
                stroke={`url(#gf-tube-${i})`}
                clipPath={`url(#gf-clip-${i})`}
              />
              <path className="gf__seg-edge" d={d} />
              <text className="gf__seg-name">
                <textPath href={`#gf-lp-${i}`} startOffset="50%" textAnchor="middle">
                  <tspan className="gf__seg-n">{n}</tspan>
                  {' '}
                  {name}
                </textPath>
              </text>
              <text className="gf__seg-num" x={nx} y={ny}>
                {n}
              </text>
            </g>
          )
        })}

        {flowTones.map((t, k) => (
          <g key={k} className="gf__belt" data-gf-belt="" style={tone(t)}>
            <path className="gf__belt-band" d={beltPath(k)} pathLength={1} />
            <path className="gf__belt-shine" d={beltPath(k)} pathLength={1} />
          </g>
        ))}
      </svg>

      {/* the flywheel: the only part that turns */}
      <div className="gf__rotor">
        <svg viewBox={`${-R.rotor} ${-R.rotor} ${R.rotor * 2} ${R.rotor * 2}`} focusable="false">
          <defs>
            <radialGradient id="gf-rotor" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R.rotor}>
              <stop offset="0.74" className="gf__rs gf__rs--in" />
              <stop offset="0.86" className="gf__rs gf__rs--mid" />
              <stop offset="0.97" className="gf__rs gf__rs--out" />
              <stop offset="1" className="gf__rs gf__rs--edge" />
            </radialGradient>
            <radialGradient id="gf-slot" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={R.rotor}>
              <stop offset={(R.slot - 14) / R.rotor} className="gf__ss gf__ss--deep" />
              <stop offset={(R.slot - 3) / R.rotor} className="gf__ss gf__ss--light" />
              <stop offset={(R.slot + 14) / R.rotor} className="gf__ss gf__ss--deep" />
            </radialGradient>
          </defs>
          <circle className="gf__rotor-body" r={R.rotor - 0.5} fill="url(#gf-rotor)" />
          <circle className="gf__rotor-groove" r={R.tickIn - 8} />
          <path className="gf__ticks" d={rotorTicks} />
          {rotorSlots.map((d) => (
            <path key={d} className="gf__slot" d={d} stroke="url(#gf-slot)" />
          ))}
          {rotorBolts.map(([x, y]) => (
            <circle key={`${x}${y}`} className="gf__bolt" cx={x} cy={y} r="6" />
          ))}
        </svg>
      </div>
      <span className="gf__sheen" />
      <span className="gf__hub" />

      {/* what sits still over it: the smear at speed, the hub's core and its
          engraved priorities */}
      <svg className="gf__over" viewBox="0 0 1000 1000" focusable="false">
        <defs>
          <path id="gf-ring-top" d={ringTop} />
          <path id="gf-ring-bottom" d={ringBottom} />
          <radialGradient id="gf-smear" gradientUnits="userSpaceOnUse" cx={C} cy={C} r={R.rotor}>
            <stop offset={(R.slot - 15) / R.rotor} className="gf__ss gf__ss--clear" />
            <stop offset={R.slot / R.rotor} className="gf__ss gf__ss--light" />
            <stop offset={(R.slot + 15) / R.rotor} className="gf__ss gf__ss--clear" />
          </radialGradient>
        </defs>
        <circle className="gf__smear gf__smear--ticks" cx={C} cy={C} r={(R.rotor + R.tickIn) / 2} />
        <circle className="gf__smear gf__smear--slots" cx={C} cy={C} r={R.slot} stroke="url(#gf-smear)" />
        <g className="gf__core">
          <circle cx={C} cy={C} r="196" />
          <circle cx={C} cy={C} r="132" />
          <circle className="gf__core-sun" cx={C} cy={C} r="58" />
          <circle className="gf__core-pin" cx={C} cy={C} r="16" />
        </g>
        <g className="gf__ring">
          {lines.map((line, j) => (
            <text key={j}>
              <textPath href={j ? '#gf-ring-bottom' : '#gf-ring-top'} startOffset="50%" textAnchor="middle">
                {line.map((it, k) => (
                  <tspan key={it}>
                    {k ? <tspan className="gf__ring-dot">{' · '}</tspan> : null}
                    {it}
                  </tspan>
                ))}
              </textPath>
            </text>
          ))}
        </g>
      </svg>

      {/* the lit tip, running the loop at the reader's place */}
      <div className="gf__arm">
        <span className="gf__tip" />
      </div>

      {/* the four workflows: small wheels in the corners */}
      {flowTones.map((t, k) => {
        const [x, y] = satCentre(k)
        return (
          <span
            key={k}
            className="gf__sat"
            data-gf-sat=""
            style={tone(t, { ['--x' as string]: `${x / 10}%`, ['--y' as string]: `${y / 10}%` })}
          >
            <svg viewBox="-64 -64 128 128" focusable="false">
              <circle className="gf__sat-body" r="61" />
              <path
                className="gf__sat-ticks"
                d={Array.from({ length: 24 }, (_, j) => {
                  const a = (j * 15 * Math.PI) / 180
                  return `M${(54 * Math.cos(a)).toFixed(1)} ${(54 * Math.sin(a)).toFixed(1)}L${(46 * Math.cos(a)).toFixed(1)} ${(46 * Math.sin(a)).toFixed(1)}`
                }).join('')}
              />
              <path
                className="gf__sat-spokes"
                d={Array.from({ length: 5 }, (_, j) => {
                  const a = ((j * 72 - 90) * Math.PI) / 180
                  return `M${(17 * Math.cos(a)).toFixed(1)} ${(17 * Math.sin(a)).toFixed(1)}L${(38 * Math.cos(a)).toFixed(1)} ${(38 * Math.sin(a)).toFixed(1)}`
                }).join('')}
              />
              <circle className="gf__sat-hub" r="11" />
            </svg>
          </span>
        )
      })}
    </div>
  )
}
