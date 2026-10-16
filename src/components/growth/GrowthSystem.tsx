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
   alike. Growth's own picture, his approved concept, is the growth curve.
   Later the same day: the idea was right but the execution was not ("can
   be 100% more customized and premium"). Rebuilt as one designed chart:

     - the hero is a chart card on the paper board: the commercial
       direction as its title, a single ink curve over a sun gradient, a
       glowing live tip, four pins on the curve and the four stages along
       its axis. On a tall window it is held (sticky) above the stage rows,
       so the tip sits on the row being read; at the last card it lets go
       and rides up above it, so it never rests over a word. Static on
       short windows.
     - the four stages are quiet rows (the CX row: tick, number, title,
       0.45 to 1), what links each on under its title, their details as
       hairline columns, the growth engine as the board's one pastel tile
     - the four workflows rise as ribbons from four points on the baseline,
       one as its card is read; the legend (segmented pills) picks one, its
       ribbon drawn in ink and its card lifted
     - across the architecture is the board's baseline

   On a phone or tablet the chart is a frosted strip held at the top (under
   a third of the screen), its caption naming where the line is; the rows
   and cards run full width under it. Then the factory, as it was.
   ========================================================================== */

/** the system's light, and the workflows' four ribbons (the page tone and
 *  three support tones) */
const PAGE_TONE: Tone = 'sun'
const SERIES_TONES: Tone[] = ['citrus', 'sky', 'coral', 'sun']
/** the factory's four, as they were */
const FACTORY_TONES: Tone[] = ['citrus', 'sun', 'sky', 'blossom']

/** "01 Customer signals" → ["01", "Customer signals"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

const num = (i: number) => String(i + 1).padStart(2, '0')
const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

const Check = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M5 10.5 8.5 14 15 6.5" />
  </svg>
)

export function GrowthSystem({ content = content0 }: { content?: typeof content0 }) {
  const { board, workflows, factory } = content
  const runRef = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<number | null>(null)
  useGrowthCurve(runRef, pick)

  const stages = [board.signals.label, board.engine.label, board.channels.label, board.measure.label].map(split)

  /** a list of a part's sources or channels */
  const nodes = (list: { title: string; body: string }[]) => (
    <ul className="gc__nodes">
      {list.map((n) => (
        <li key={n.title}>
          <span className="gc__item">{n.title}</span>
          <span className="gc__small">{n.body}</span>
        </li>
      ))}
    </ul>
  )

  /** a stage row: tick, number and title (and what links it on, under the
   *  title), then what the stage holds */
  const stage = (i: number, body: ReactNode, side?: ReactNode) => {
    const [n, name] = stages[i]
    return (
      <li className="gc__stage" data-gc-stage="" style={tone(PAGE_TONE)}>
        <div className="gc__stage-head">
          <span className="gc__tick" aria-hidden="true">
            <Check />
          </span>
          <span className="gc__n" aria-hidden="true">
            {n}
          </span>
          <h3 className="gc__stage-title">
            <span className="umm-sr-only">{n} </span>
            {name}
          </h3>
        </div>
        {side ? <div className="gc__stage-side">{side}</div> : null}
        <div className="gc__stage-body">{body}</div>
      </li>
    )
  }

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
          <div className="gc__run" ref={runRef} data-phase="system">
            {/* the hero: the chart card, held above the rows on a tall window */}
            <div className="gc__chart" data-gc-hold="">
              <div className="gc__top">
                <span className="gc__eyebrow">
                  <span className="gc__live" aria-hidden="true" />
                  {board.eyebrow}
                </span>
                <span className="gc__label">{board.tag}</span>
              </div>

              {/* the commercial direction: the chart's title, what it climbs towards */}
              <div className="gc__direction">
                <p className="gc__label">{board.direction.label}</p>
                <p className="gc__dir-title">{board.direction.title}</p>
                <ul className="gc__pills">
                  {board.direction.items.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="gc__strip" data-gc-hold="">
                <div className="gc__plot" aria-hidden="true">
                  <span className="gc__glow" />
                  <svg className="gc__svg" focusable="false">
                    <defs>
                      <linearGradient id="gc-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" className="gc__stop" style={{ stopOpacity: 0.62 }} />
                        <stop offset="0.55" className="gc__stop" style={{ stopOpacity: 0.2 }} />
                        <stop offset="1" className="gc__stop" style={{ stopOpacity: 0 }} />
                      </linearGradient>
                      <clipPath id="gc-clip">
                        <rect data-gc="clip" x="-40" y="-60" width="0" height="0" />
                      </clipPath>
                      <clipPath id="gc-under">
                        <path data-gc="under" />
                      </clipPath>
                      <filter id="gc-soft" x="-10%" y="-60%" width="120%" height="220%">
                        <feGaussianBlur stdDeviation="12" />
                      </filter>
                    </defs>
                    <path className="gc__grid" data-gc="grid" />
                    {stages.map(([n]) => (
                      <path key={n} className="gc__drop" data-gc="drop" />
                    ))}
                    <path className="gc__base" data-gc="base" />
                    {/* the light under the line: a gradient, and a soft band hugging the curve */}
                    <g className="gc__lit" clipPath="url(#gc-clip)">
                      <path className="gc__area" data-gc="area" fill="url(#gc-fill)" />
                      <g clipPath="url(#gc-under)">
                        <path className="gc__band" data-gc="band" filter="url(#gc-soft)" />
                      </g>
                    </g>
                    <path className="gc__ghost" data-gc="ghost" />
                    {workflows.map((w, k) => (
                      <g key={w.id} className="gc__series" data-gc-series="" style={tone(SERIES_TONES[k])}>
                        <linearGradient id={`gc-rib${k}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0" className="gc__rib-stop" style={{ stopOpacity: 0 }} />
                          <stop offset="0.45" className="gc__rib-stop" style={{ stopOpacity: 0.55 }} />
                          <stop offset="1" className="gc__rib-stop" style={{ stopOpacity: 1 }} />
                        </linearGradient>
                        <path className="gc__ribbon" stroke={`url(#gc-rib${k})`} />
                        <path className="gc__core" />
                        <circle className="gc__end" r="4.5" />
                      </g>
                    ))}
                    <path className="gc__halo" data-gc="line" />
                    <path className="gc__line" data-gc="line" />
                    <path data-gc="scratch" fill="none" stroke="none" />
                  </svg>

                  {/* the pins on the curve: their real number dim, rolling over as lit */}
                  {stages.map(([n]) => (
                    <span key={n} className="gc__pin">
                      <span className="gc__pin-n">
                        <span>{n}</span>
                        <span>{n}</span>
                      </span>
                    </span>
                  ))}
                  <span className="gc__tip" />
                </div>

                {/* the axis: the four stages under their pins (wide) */}
                <div className="gc__axis" aria-hidden="true">
                  {stages.map(([n, name]) => (
                    <span key={n} className="gc__x">
                      <b>{n}</b>
                      {name}
                    </span>
                  ))}
                </div>

                {/* the caption under the strip (narrow): where the line is */}
                <div className="gc__readout" aria-hidden="true">
                  <span className="gc__roll">
                    {stages.map(([n, name]) => (
                      <span key={n}>
                        <b>{n}</b>
                        {name}
                      </span>
                    ))}
                    {workflows.map((w, k) => (
                      <span key={w.id} style={tone(SERIES_TONES[k])}>
                        <i />
                        {w.label}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>

            {/* the system: four stages, read in turn as the curve climbs */}
            <ol className="gc__stages">
              {stage(0, nodes(board.signals.nodes), <p className="gc__link">{board.signals.link}</p>)}

              {stage(
                1,
                <>
                  <ul className="gc__mods">
                    {board.engine.modules.map((m) => (
                      <li key={m.title}>
                        <span className="gc__item">{m.title}</span>
                        <span className="gc__small">{m.body}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="gc__chips">
                    {board.engine.guard.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </>,
                <div className="gc__engine">
                  <p className="gc__engine-title">{board.engine.title}</p>
                  <p className="gc__engine-sub">{board.engine.sub}</p>
                </div>,
              )}

              {stage(2, nodes(board.channels.nodes), <p className="gc__link">{board.channels.link}</p>)}

              {stage(
                3,
                <>
                  <p className="gc__headline">{board.measure.title}</p>
                  <p className="gc__chain">
                    {board.measure.chain.map((c, i) => (
                      <span key={c}>
                        {c}
                        {i < board.measure.chain.length - 1 ? (i < 3 ? ' + ' : ' → ') : ''}
                      </span>
                    ))}
                  </p>
                </>,
                <p className="gc__link">{board.measure.loop}</p>,
              )}
            </ol>

            {/* the workflows: the heading and the chart's legend */}
            <div className="gc__wf">
              <div className="gc__wf-copy">
                <h3 className="gc__wf-title">{content.workflowsLabel}</h3>
                <p className="gc__small" id="gc-wf-lead">
                  {content.workflowsLead}
                </p>
              </div>
              <ul className="gc__legend" aria-describedby="gc-wf-lead">
                {workflows.map((w, k) => (
                  <li key={w.id} style={tone(SERIES_TONES[k])}>
                    <button
                      type="button"
                      className="gc__key"
                      aria-pressed={pick === k}
                      onClick={() => setPick((p) => (p === k ? null : k))}
                    >
                      {w.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* the four workflows, each a card its ribbon rises to */}
            <ol className="gc__flows">
              {workflows.map((w, k) => (
                <li
                  key={w.id}
                  className="gc__flow"
                  data-gc-flow=""
                  data-picked={pick === k || undefined}
                  style={tone(SERIES_TONES[k])}
                >
                  <div className="gc__flow-head">
                    <p className="gc__label gc__eyebrow-dot">{w.eyebrow}</p>
                    <h4 className="gc__flow-title">{w.title}</h4>
                    <p className="gc__small">{w.body}</p>
                  </div>
                  <div className="gc__spec">
                    <p className="gc__label">{content.doesLabel}</p>
                    <ol className="gc__does">
                      {w.does.map((d, i) => (
                        <li key={d}>
                          <span className="gc__n" aria-hidden="true">
                            {num(i)}
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="gc__spec">
                    <p className="gc__label">{content.controlsLabel}</p>
                    <p className="gc__small">{w.controls}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* across the architecture: the board's baseline */}
          <div className="gc__across">
            <p className="gc__label">{board.across.label}</p>
            <ul className="gc__assure" style={tone(PAGE_TONE)}>
              {board.across.items.map((a) => (
                <li key={a}>
                  <span className="gc__tick" data-done="" aria-hidden="true">
                    <Check />
                  </span>
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
