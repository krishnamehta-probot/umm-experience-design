import type { CSSProperties, ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import type { Tone } from '@/components/primitives'
import { useReadingStep } from '@/lib/useReadingStep'
import { growthSystem as content0 } from '@/content/growth'
import { GrowthScene, type GrowthFocus } from './GrowthScene'
import '@/styles/cloud-arch.css'
import '@/styles/cloud-flow.css'
import '@/styles/growth-system.css'

/* ============================================================================
   INTEGRATED GROWTH · THE THINKING BEHIND THE GROWTH

   16 Oct, the doc's second version: the UMM growth system, the page's
   story: the commercial direction (one brief) over customer signals that
   flow into the growth engine, which activates the channels, whose
   responses return as intelligence; four workflows through it; then the
   marketing factory.

   16 Oct, evening, Krish: tell it as you scroll, as Engineering's factory
   and Cloud's architecture are. The same board (cloud-flow.css): the brief
   across its top, then a picture of the system that holds still
   (GrowthScene) beside eight cards in the page's flow (over them on a
   phone), every word of them on screen as the reader scrolls:

     01–04  the system: customer signals, the growth engine, channel
            activation, measurement and feedback
     05–08  the four workflows: what each does, step by step, and what
            people control

   The card being read lights its part of the picture, packets running
   into it or along its route; the stations scroll to their card. What
   holds across the architecture closes the board. Then the factory.
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

const TONES: Tone[] = ['citrus', 'sun', 'sky', 'blossom']

/** "01 Customer signals" → ["01", "Customer signals"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

export function GrowthSystem({ content = content0 }: { content?: typeof content0 }) {
  const { board, workflows, factory } = content
  const { at, holdRef, cardRef, goTo } = useReadingStep()

  /* the eight cards, in order: the system's four, the workflows */
  const steps: { focus: GrowthFocus; tone: Tone; name: string }[] = [
    { focus: 'signals', tone: 'sky', name: split(board.signals.label)[1] },
    { focus: 'engine', tone: 'lilac', name: split(board.engine.label)[1] },
    { focus: 'channels', tone: 'blossom', name: split(board.channels.label)[1] },
    { focus: 'measure', tone: 'citrus', name: split(board.measure.label)[1] },
    ...workflows.map((w, i) => ({ focus: w.id as GrowthFocus, tone: TONES[i], name: w.label })),
  ]
  const num = (i: number) => String(i + 1).padStart(2, '0')

  /** a card, with its tone, lit while it is read */
  const card = (i: number, body: ReactNode) => (
    <li
      key={steps[i].focus}
      className="cf__step"
      data-on={i === at || undefined}
      ref={cardRef(i)}
      style={{ ['--tone' as string]: `var(--umm-${steps[i].tone})` } as CSSProperties}
    >
      {body}
    </li>
  )

  /** a part of the system: its number, its name */
  const head = (label: string) => {
    const [n, name] = split(label)
    return (
      <>
        <span className="cf__label">{n}</span>
        <h3 className="cf__title">{name}</h3>
      </>
    )
  }

  return (
    <section className="umm-section cd-arch gs" id="growth" aria-labelledby="gs-title">
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
        <div className="cf__board" data-umm-theme="ink" role="group" aria-label={board.label}>
          <div className="cf__top">
            <span className="cf__eyebrow">
              <span className="cf__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="cf__mono">{board.tag}</span>
          </div>

          {/* the commercial direction, over everything */}
          <div className="cf__layer">
            <span className="cf__layer-icon">
              <Arrow />
            </span>
            <div>
              <span className="cf__mono">{board.direction.label}</span>
              <p className="cf__layer-title">{board.direction.title}</p>
            </div>
            <div className="cf__layer-side">
              <p>{board.direction.items.join(' · ')}</p>
            </div>
          </div>

          <div className="cf__story">
            {/* the picture, held still while the cards pass */}
            <div
              className="cf__hold"
              ref={holdRef}
              style={{ ['--tone' as string]: `var(--umm-${steps[at].tone})` } as CSSProperties}
            >
              <GrowthScene focus={steps[at].focus} />
              <ol
                className="cf__stations"
                aria-label={board.label}
                style={{ ['--n' as string]: steps.length } as CSSProperties}
              >
                {steps.map((s, i) => (
                  <li key={s.focus} data-umm-tone={s.tone}>
                    <button
                      type="button"
                      className="cf__station"
                      aria-current={i === at ? 'step' : undefined}
                      data-done={i < at || undefined}
                      aria-label={s.name}
                      onClick={() => goTo(i)}
                    >
                      <span className="cf__station-num">{num(i)}</span>
                      <span className="cf__station-name">{s.name}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="cf__now" aria-hidden="true">
                <span>{num(at)}</span> {steps[at].name}
              </p>
            </div>

            {/* the cards, in the page's flow */}
            <ol className="cf__steps">
              {card(
                0,
                <>
                  {head(board.signals.label)}
                  <ul className="cf__list">
                    {board.signals.nodes.map((n) => (
                      <li key={n.title} className="cf__node">
                        <span>
                          <span className="cf__node-title">{n.title}</span>
                          <span className="cf__node-sub">{n.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Arrow />
                    {board.signals.link}
                  </p>
                </>,
              )}

              {card(
                1,
                <>
                  {head(board.engine.label)}
                  <div className="gs__engine-card">
                    <p className="cf__layer-title">{board.engine.title}</p>
                    <p className="cf__body">{board.engine.sub}</p>
                  </div>
                  <ul className="gs__mods">
                    {board.engine.modules.map((m, i) => (
                      <li key={m.title} className="cf__node gs__mod">
                        <span className="cf__node-icon">{MODULE_ICONS[i]}</span>
                        <span>
                          <span className="cf__node-title">{m.title}</span>
                          <span className="cf__node-sub">{m.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className="cf__checks">
                    {board.engine.guard.map((g) => (
                      <li key={g}>
                        <Check />
                        {g}
                      </li>
                    ))}
                  </ul>
                </>,
              )}

              {card(
                2,
                <>
                  {head(board.channels.label)}
                  <ul className="cf__list">
                    {board.channels.nodes.map((n) => (
                      <li key={n.title} className="cf__node">
                        <span>
                          <span className="cf__node-title">{n.title}</span>
                          <span className="cf__node-sub">{n.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Arrow />
                    {board.channels.link}
                  </p>
                </>,
              )}

              {card(
                3,
                <>
                  {head(board.measure.label)}
                  <p className="cf__layer-title">{board.measure.title}</p>
                  <p className="gs__chain">
                    {board.measure.chain.map((c, i) => (
                      <span key={c}>
                        {c}
                        {i < board.measure.chain.length - 1 ? (i < 3 ? ' + ' : ' → ') : ''}
                      </span>
                    ))}
                  </p>
                  <p className="cf__loop">
                    <Loop />
                    {board.measure.loop}
                  </p>
                </>,
              )}

              {/* the workflows, under their heading */}
              <li className="gs__follow-head">
                <p className="gs__follow-label">{content.workflowsLabel}</p>
                <p className="gs__follow-lead">{content.workflowsLead}</p>
              </li>

              {workflows.map((w, k) =>
                card(
                  4 + k,
                  <>
                    <span className="cf__label">
                      {num(4 + k)} / {w.eyebrow}
                    </span>
                    <h3 className="cf__title">{w.title}</h3>
                    <p className="cf__body">{w.body}</p>
                    <div className="gs__does-wrap">
                      <span className="cf__mono">{content.doesLabel}</span>
                      <ol className="gs__does-list">
                        {w.does.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="gs__does-wrap">
                      <span className="cf__mono">{content.controlsLabel}</span>
                      <p className="gs__controls-text">{w.controls}</p>
                    </div>
                  </>,
                ),
              )}
            </ol>
          </div>

          {/* across the architecture */}
          <div className="gs__across-row">
            <span className="cf__mono">{board.across.label}</span>
            <ul className="cf__checks">
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
        <div className="gs__factory">
          <div className="gs__factory-head">
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
          <ol className="gs__steps">
            {factory.steps.map((s, i) => (
              <li
                key={s.label}
                className="gs__step"
                data-umm-tone={TONES[i]}
                style={{ ['--i' as string]: i } as CSSProperties}
              >
                <span className="gs__label gs__label--ink">
                  {String(i + 1).padStart(2, '0')} / {s.label}
                </span>
                <p className="gs__step-title">{s.title}</p>
                <p className="gs__step-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
