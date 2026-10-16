import { useState, type CSSProperties } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import type { Tone } from '@/components/primitives'
import { growthSystem as content0, type GrowthWorkflow } from '@/content/growth'
import '@/styles/cloud-arch.css'
import '@/styles/growth-system.css'

/* ============================================================================
   INTEGRATED GROWTH · THE THINKING BEHIND THE GROWTH

   16 Oct, the doc's second version: the growth model (the calculator) gave
   way to the UMM growth system, the page's story. An ink board:

     the commercial direction (one brief) across the top; customer signals
     flow into the growth engine (intelligence and orchestration), which
     activates the channels; their responses come back as intelligence, the
     loop to the brief and the engine closing under it.

   Choosing one of the four workflows lights its path across the board, the
   sources, engine modules and channels it uses, with a pulse running down
   the wires, and plays "what the workflow does" step by step beneath, with
   what people control beside it. Then the marketing factory: brief,
   produce, review, activate and learn, the work travelling the four.
   ========================================================================== */

/** What each workflow lights: signal, module and channel indexes. */
const LIT: Record<GrowthWorkflow['id'], { signals: number[]; modules: number[]; channels: number[] }> = {
  discovery: { signals: [2], modules: [1, 3], channels: [2] },
  paid: { signals: [0, 1], modules: [0, 2], channels: [0] },
  lifecycle: { signals: [0], modules: [0, 2], channels: [1] },
  content: { signals: [2], modules: [1], channels: [0, 2] },
}

const TONES: Tone[] = ['citrus', 'sun', 'sky', 'blossom']

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

function Wire() {
  return (
    <div className="gs__wire" aria-hidden="true">
      <span className="gs__wire-line">
        <i />
        <i />
      </span>
    </div>
  )
}

export function GrowthSystem({ content = content0 }: { content?: typeof content0 }) {
  const { board, workflows, factory } = content
  const [pick, setPick] = useState(0)
  const wf = workflows[pick]
  const lit = LIT[wf.id]

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
        <div className="gs__board" data-umm-theme="ink" data-flow={wf.id} role="group" aria-label={board.label}>
          <div className="gs__top">
            <span className="gs__label gs__label--bright">{board.eyebrow}</span>
            <span className="gs__label">
              <span className="gs__live" aria-hidden="true" />
              {board.tag}
            </span>
          </div>

          {/* one brief */}
          <div className="gs__direction">
            <div>
              <span className="gs__label">{board.direction.label}</span>
              <p className="gs__direction-title">{board.direction.title}</p>
            </div>
            <p className="gs__direction-items">{board.direction.items.join(' · ')}</p>
          </div>

          <div className="gs__row">
            <div className="gs__col">
              <span className="gs__label">{board.signals.label}</span>
              <ul className="gs__nodes">
                {board.signals.nodes.map((n, i) => (
                  <li key={n.title} className="gs__node" data-on={lit.signals.includes(i)}>
                    <p className="gs__node-title">{n.title}</p>
                    <p className="gs__node-body">{n.body}</p>
                  </li>
                ))}
              </ul>
              <p className="gs__link">{board.signals.link}</p>
            </div>

            <Wire />

            <div className="gs__engine">
              <span className="gs__label">{board.engine.label}</span>
              <p className="gs__engine-title">{board.engine.title}</p>
              <p className="gs__engine-sub">{board.engine.sub}</p>
              <ul className="gs__modules">
                {board.engine.modules.map((m, i) => (
                  <li key={m.title} className="gs__module" data-on={lit.modules.includes(i)}>
                    {MODULE_ICONS[i]}
                    <p className="gs__node-title">{m.title}</p>
                    <p className="gs__node-body">{m.body}</p>
                  </li>
                ))}
              </ul>
              <p className="gs__guard">{board.engine.guard.join(' · ')}</p>
            </div>

            <Wire />

            <div className="gs__col">
              <span className="gs__label">{board.channels.label}</span>
              <ul className="gs__nodes">
                {board.channels.nodes.map((n, i) => (
                  <li key={n.title} className="gs__node" data-on={lit.channels.includes(i)}>
                    <p className="gs__node-title">{n.title}</p>
                    <p className="gs__node-body">{n.body}</p>
                  </li>
                ))}
              </ul>
              <p className="gs__link">{board.channels.link}</p>
            </div>
          </div>

          {/* responses return as intelligence */}
          <div className="gs__measure">
            <span className="gs__measure-icon">
              <Loop />
            </span>
            <div className="gs__measure-text">
              <span className="gs__label">{board.measure.label}</span>
              <p className="gs__measure-title">{board.measure.title}</p>
              <p className="gs__chain">
                {board.measure.chain.map((c, i) => (
                  <span key={c}>
                    {c}
                    {i < board.measure.chain.length - 1 ? (i < 3 ? ' + ' : ' → ') : ''}
                  </span>
                ))}
              </p>
            </div>
            <p className="gs__loop">{board.measure.loop}</p>
          </div>

          <div className="gs__across">
            <span className="gs__label">{board.across.label}</span>
            <ul>
              {board.across.items.map((a) => (
                <li key={a}>
                  <Check />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* follow a workflow */}
        <div className="gs__follow">
          <div className="gs__follow-head">
            <p className="gs__follow-label">{content.workflowsLabel}</p>
            <p className="gs__follow-lead">{content.workflowsLead}</p>
          </div>
          <div className="gs__picks" role="tablist" aria-label={content.workflowsLabel}>
            {workflows.map((w, i) => (
              <button
                key={w.id}
                type="button"
                role="tab"
                className="gs__pick"
                aria-selected={i === pick}
                aria-controls="gs-panel"
                data-umm-tone={TONES[i]}
                onClick={() => setPick(i)}
              >
                <span className="gs__pick-num">{String(i + 1).padStart(2, '0')}</span>
                {w.label}
              </button>
            ))}
          </div>

          <div className="gs__detail" id="gs-panel" role="tabpanel" aria-live="polite" key={wf.id}>
            <div className="gs__detail-intro">
              <span className="gs__label gs__label--ink">{wf.eyebrow}</span>
              <h3 className="gs__detail-title">{wf.title}</h3>
              <p className="gs__detail-body">{wf.body}</p>
            </div>
            <div className="gs__detail-side">
              <span className="gs__label gs__label--ink">{content.doesLabel}</span>
              <ol className="gs__does" data-umm-tone={TONES[pick]}>
                {wf.does.map((d, i) => (
                  <li key={d} style={{ ['--i' as string]: i } as CSSProperties}>
                    <span className="gs__does-dot" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ol>
              <span className="gs__label gs__label--ink">{content.controlsLabel}</span>
              <p className="gs__controls">{wf.controls}</p>
            </div>
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
              <li key={s.label} className="gs__step" data-umm-tone={TONES[i]} style={{ ['--i' as string]: i } as CSSProperties}>
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
