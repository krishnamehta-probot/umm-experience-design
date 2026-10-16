import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import type { Tone } from '@/components/primitives'
import { growthSystem as content0 } from '@/content/growth'
import { useGrowthCurve } from './growthCurve'
import '@/styles/cloud-arch.css'
import '@/styles/growth-curve.css'

/* ============================================================================
   INTEGRATED GROWTH · THE THINKING BEHIND THE GROWTH: THE GROWTH CURVE

   16 Oct, the doc's second version: the UMM growth system, the page's
   story: the commercial direction (one brief) over customer signals that
   flow into the growth engine, which activates the channels, whose
   responses return as intelligence; four workflows through it; then the
   marketing factory.

   16 Oct, late, Krish: the four service pages' thinking sections looked
   alike (the same ink board, the same held picture beside cards). Each now
   gets a picture of its own service. Growth's, his approved concept, is
   the growth curve: one large chart on a light chart-paper board.

     - the commercial direction heads the chart, its target line across
       the top of the plot
     - a line climbs from the axis to the top right as you scroll (drawn
       by growthCurve.ts), through four pins: customer signals, the growth
       engine, channel activation, measurement and feedback, each card
       hanging from its pin, each further right and up
     - each pin lights with a pulse when the line reaches it, its step
       number rolling up to its own
     - the four workflows fan off the axis below as four rising lines, a
       multi-line chart with its legend (the workflows' names: choose one
       to see its line), each line ending in its workflow's card
     - what holds across the architecture is the chart's baseline

   All of it in the page's flow, nothing held. On a phone or tablet the
   cards stack full width and the line is a rail down their left edge,
   splitting into four lanes for the workflows. Then the factory.
   ========================================================================== */

const ICON = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const MODULE_ICONS = [
  // audience: rings
  <svg {...ICON} key="a">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r=".6" />
  </svg>,
  // creative: a spark
  <svg {...ICON} key="c">
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>,
  // journey: two ways
  <svg {...ICON} key="j">
    <path d="M4 8h14l-3-3M20 16H6l3 3" />
  </svg>,
  // experiment: up and to the right
  <svg {...ICON} key="e">
    <path d="M6 18 18 6M9 6h9v9" />
  </svg>,
]

const Loop = () => (
  <svg {...ICON}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)
const Arrow = () => (
  <svg {...ICON}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const Rise = () => (
  <svg {...ICON}>
    <path d="M4 18 10 12l3.5 3.5L20 8" />
    <path d="M14.5 8H20v5.5" />
  </svg>
)

/** the system's four pins, and the workflows' four series */
const POINT_TONES: Tone[] = ['sun', 'citrus', 'coral', 'sky']
const SERIES_TONES: Tone[] = ['citrus', 'sun', 'coral', 'blossom']
/** the factory's four, as they were */
const FACTORY_TONES: Tone[] = ['citrus', 'sun', 'sky', 'blossom']

/** "01 Customer signals" → ["01", "Customer signals"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

const num = (i: number) => String(i + 1).padStart(2, '0')
const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

/** The pin on the line: the step number, its last digit rolling up from 0
 *  as the line reaches it. The number is read in the card's heading. */
function Pin({ n }: { n: number }) {
  return (
    <span className="gc__pin" aria-hidden="true">
      <span className="gc__dot">
        <span>{n < 10 ? '0' : Math.floor(n / 10)}</span>
        <span className="gc__roll">
          <span className="gc__digits" style={{ ['--n' as string]: n % 10 } as CSSProperties}>
            {Array.from({ length: (n % 10) + 1 }, (_, d) => (
              <span key={d}>{d}</span>
            ))}
          </span>
        </span>
      </span>
    </span>
  )
}

export function GrowthSystem({ content = content0 }: { content?: typeof content0 }) {
  const { board, workflows, factory } = content
  const plotRef = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<number | null>(null)
  useGrowthCurve(plotRef)

  /** a card on the system's line */
  const point = (i: number, label: string, body: ReactNode) => {
    const [n, name] = split(label)
    return (
      <li className="gc__point" data-gc-pin="main" style={tone(POINT_TONES[i])}>
        <Pin n={Number(n) || i + 1} />
        <div className="gc__card">
          <h3 className="gc__name">
            <span className="umm-sr-only">{n} </span>
            {name}
          </h3>
          {body}
        </div>
      </li>
    )
  }

  /** a list of a part's sources or channels */
  const nodes = (list: { title: string; body: string }[]) => (
    <ul className="gc__nodes">
      {list.map((n) => (
        <li key={n.title}>
          <span className="gc__node-title">{n.title}</span>
          <span className="gc__node-sub">{n.body}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <section className="umm-section cd-arch gc" id="growth" aria-labelledby="gs-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="gs-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="sun"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="gc__board" role="group" aria-label={board.label}>
          <div className="gc__top">
            <span className="gc__eyebrow">
              <span className="gc__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="gc__mono">{board.tag}</span>
          </div>

          {/* the commercial direction: what the chart is climbing towards */}
          <div className="gc__direction">
            <span className="gc__dir-icon">
              <Rise />
            </span>
            <div className="gc__dir-head">
              <span className="gc__mono">{board.direction.label}</span>
              <p className="gc__dir-title">{board.direction.title}</p>
            </div>
            <ul className="gc__dir-items">
              {board.direction.items.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="gc__plot" ref={plotRef} data-focus={pick !== null || undefined}>
            <svg className="gc__svg" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="gc-rise" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" style={{ stopColor: 'var(--umm-sun)' }} />
                  <stop offset="0.55" style={{ stopColor: 'var(--umm-citrus)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--umm-coral)' }} />
                </linearGradient>
                {SERIES_TONES.map((t, k) => (
                  <linearGradient key={t} id={`gc-area${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style={{ stopColor: `var(--umm-${t})`, stopOpacity: 0.55 }} />
                    <stop offset="0.7" style={{ stopColor: `var(--umm-${t})`, stopOpacity: 0 }} />
                  </linearGradient>
                ))}
              </defs>
              <path className="gc__ticks" data-gc="ticks" />
              <path className="gc__axis" data-gc="axis" />
              <path className="gc__guides" data-gc="guides" />
              <path className="gc__target" data-gc="target" />
              {[...workflows.keys()].reverse().map((k) => (
                <path
                  key={k}
                  className="gc__area"
                  data-gc={`area${k}`}
                  data-picked={pick === k || undefined}
                  fill={`url(#gc-area${k})`}
                />
              ))}
              {workflows.map((w, k) => (
                <g
                  key={w.id}
                  className="gc__series"
                  data-picked={pick === k || undefined}
                  style={tone(SERIES_TONES[k])}
                >
                  <path className="gc__ribbon" data-gc={`flow${k}`} />
                  <path className="gc__ink" data-gc={`flow${k}`} />
                  <circle className="gc__head" data-gc={`head${k}`} r="4" />
                </g>
              ))}
              <g className="gc__main">
                <path className="gc__ribbon" data-gc="main" />
                <path className="gc__ink" data-gc="main" />
                <circle className="gc__head gc__head--main" data-gc="head-main" r="5.5" />
              </g>
              <path data-gc="scratch" fill="none" stroke="none" />
            </svg>

            {/* the system: four points up the curve */}
            <ol className="gc__system" data-gc-run="main">
              {point(
                0,
                board.signals.label,
                <>
                  {nodes(board.signals.nodes)}
                  <p className="gc__link">
                    <Arrow />
                    {board.signals.link}
                  </p>
                </>,
              )}

              {point(
                1,
                board.engine.label,
                <>
                  <div className="gc__engine">
                    <p className="gc__big">{board.engine.title}</p>
                    <p className="gc__sub">{board.engine.sub}</p>
                  </div>
                  <ul className="gc__mods">
                    {board.engine.modules.map((m, i) => (
                      <li key={m.title}>
                        <span className="gc__mod-icon">{MODULE_ICONS[i]}</span>
                        <span>
                          <span className="gc__node-title">{m.title}</span>
                          <span className="gc__node-sub">{m.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className="gc__checks">
                    {board.engine.guard.map((g) => (
                      <li key={g}>
                        <Check />
                        {g}
                      </li>
                    ))}
                  </ul>
                </>,
              )}

              {point(
                2,
                board.channels.label,
                <>
                  {nodes(board.channels.nodes)}
                  <p className="gc__link">
                    <Arrow />
                    {board.channels.link}
                  </p>
                </>,
              )}

              {point(
                3,
                board.measure.label,
                <>
                  <p className="gc__big">{board.measure.title}</p>
                  <p className="gc__chain">
                    {board.measure.chain.map((c, i) => (
                      <span key={c}>
                        {c}
                        {i < board.measure.chain.length - 1 ? (i < 3 ? ' + ' : ' → ') : ''}
                      </span>
                    ))}
                  </p>
                  <p className="gc__link">
                    <Loop />
                    {board.measure.loop}
                  </p>
                </>,
              )}

              {/* the workflows' heading, and the chart's legend */}
              <li className="gc__legend-wrap">
                <p className="gc__follow">{content.workflowsLabel}</p>
                <p className="gc__follow-lead">{content.workflowsLead}</p>
                <ul className="gc__legend">
                  {workflows.map((w, k) => (
                    <li key={w.id} style={tone(SERIES_TONES[k])}>
                      <button
                        type="button"
                        className="gc__key"
                        aria-pressed={pick === k}
                        onClick={() => setPick((p) => (p === k ? null : k))}
                      >
                        <span className="gc__swatch" aria-hidden="true" />
                        {w.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ol>

            {/* the workflows: four lines off the axis, each to its card */}
            <ol className="gc__flows" data-gc-run="flows">
              {workflows.map((w, k) => (
                <li
                  key={w.id}
                  className="gc__flow"
                  data-gc-pin="flow"
                  data-picked={pick === k || undefined}
                  style={tone(SERIES_TONES[k])}
                >
                  <Pin n={5 + k} />
                  <div className="gc__card">
                    <span className="gc__mono">{w.eyebrow}</span>
                    <h3 className="gc__name gc__name--flow">
                      <span className="umm-sr-only">{num(4 + k)} </span>
                      {w.title}
                    </h3>
                    <p className="gc__body">{w.body}</p>
                    <div className="gc__part">
                      <span className="gc__mono">{content.doesLabel}</span>
                      <ol className="gc__does">
                        {w.does.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="gc__part">
                      <span className="gc__mono">{content.controlsLabel}</span>
                      <p className="gc__controls">{w.controls}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* across the architecture: the chart's baseline */}
          <div className="gc__across">
            <span className="gc__mono">{board.across.label}</span>
            <ul className="gc__checks gc__checks--across">
              {board.across.items.map((a) => (
                <li key={a}>
                  <Check />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* the marketing factory model */}
        <div className="gc__factory">
          <div className="gc__factory-head">
            <ChipHead
              line1={factory.line1}
              line2={withAccent(factory.line2, factory.line2)}
              chip={factory.eyebrow}
              tone="blossom"
              lineRecipe={1}
              as="h3"
            />
            <p className="cx-lead">{factory.lead}</p>
          </div>
          <ol className="gc__steps">
            {factory.steps.map((s, i) => (
              <li
                key={s.label}
                className="gc__step"
                data-umm-tone={FACTORY_TONES[i]}
                style={{ ['--i' as string]: i } as CSSProperties}
              >
                <span className="gc__step-label">
                  {String(i + 1).padStart(2, '0')} / {s.label}
                </span>
                <p className="gc__step-title">{s.title}</p>
                <p className="gc__step-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
