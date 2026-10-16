import { useState, type CSSProperties } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { factory as engFactory } from '@/content/engineering'
import '@/styles/cloud-arch.css'
import '@/styles/eng-factory.css'

/* ============================================================================
   DIGITAL ENGINEERING · INSIDE OUR ENGINEERING FACTORY

   16 Oct, the doc's second version: the release example gave way to the
   factory, the page's one story. An ink board, as the closing band is:

     the shared context (Jira, Figma, GitHub) feeds a delivery line of five
     stages, Define → Build → Validate → Release → Evolve. A work item rides
     the line, carrying what the stage it sits on delivers; every stage it
     has passed is stamped done. Under the line, the stage's intent, who
     directs (engineers), who assists (agents), the review gate it must
     pass and its delivery artifact. Next moves the work on; after Evolve
     it rides the loop back to Define, as production feedback returns to
     the backlog.

   Clicking a stage goes straight to it. It does not pin. Then the three
   principles, as the other boards' rule cards.
   ========================================================================== */

const TONES: Tone[] = ['blossom', 'sky', 'citrus', 'sun', 'coral']
const RULE_TONES: Tone[] = ['sky', 'sun', 'blossom']

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

const Person = () => (
  <svg {...ICON}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" />
  </svg>
)
const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
)
const Gate = () => (
  <svg {...ICON}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z" />
    <path d="m8.8 12.2 2.3 2.3 4.4-4.6" />
  </svg>
)
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

export function EngineeringFactory({ content = engFactory }: { content?: typeof engFactory }) {
  const { board, stages, principles } = content
  const n = stages.length
  const [at, setAt] = useState(0)
  /* counts the times the work has gone round, so the loop back can replay */
  const [laps, setLaps] = useState(0)
  const stage = stages[at]
  const next = (at + 1) % n

  const go = (i: number) => {
    if (i === 0 && at === n - 1) setLaps((l) => l + 1)
    setAt(i)
  }

  return (
    <section className="umm-section cd-arch ef" id="factory" aria-labelledby="ef-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="ef-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="blossom"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <p className="cx-lead ef__intro">{content.intro}</p>

        <div className="ef__board" data-umm-theme="ink" role="group" aria-label={board.label}>
          <div className="ef__top">
            <span className="ef__eyebrow">
              <span className="ef__live" aria-hidden="true" />
              {board.eyebrow}
            </span>
            <span className="ef__label">{board.tag}</span>
          </div>

          {/* the shared context feeding the line */}
          <div className="ef__context">
            <span className="ef__label">{board.contextLabel}</span>
            <ul>
              {board.context.map((c) => (
                <li key={c.tool}>
                  <strong>{c.tool}</strong>
                  <span>{c.role}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* the delivery line */}
          <div className="ef__line" style={{ ['--at' as string]: at, ['--n' as string]: n } as CSSProperties}>
            <ol className="ef__stages" role="tablist" aria-label={board.label}>
              {stages.map((s, i) => (
                <li key={s.name} data-umm-tone={TONES[i % TONES.length]}>
                  <button
                    type="button"
                    role="tab"
                    className="ef__stage"
                    aria-selected={i === at}
                    aria-controls="ef-panel"
                    data-done={i < at || undefined}
                    onClick={() => go(i)}
                  >
                    <span className="ef__stage-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ef__stage-name">{s.name}</span>
                    <span className="ef__stamp" aria-hidden="true">
                      <Check />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {/* the work item riding the line, carrying this stage's artifact */}
            <div className="ef__rail" aria-hidden="true">
              <span className="ef__belt" />
              <span className="ef__item" key={laps} data-lap={laps > 0 || undefined} data-umm-tone={TONES[at % TONES.length]}>
                <i />
                {stage.artifact}
              </span>
            </div>
          </div>

          <div className="ef__panel" id="ef-panel" role="tabpanel" aria-live="polite">
            <div className="ef__detail" key={at}>
              <div className="ef__intent">
                <span className="ef__label ef__label--tone" style={{ ['--tone' as string]: `var(--umm-${TONES[at % TONES.length]})` } as CSSProperties}>
                  {String(at + 1).padStart(2, '0')} / {stage.name}
                </span>
                <h3 className="ef__title">{stage.title}</h3>
                <p className="ef__body">{stage.body}</p>
                <div className="ef__artifact">
                  <span className="ef__label">{board.artifactLabel}</span>
                  <p>{stage.artifact}</p>
                </div>
              </div>
              <ul className="ef__roles">
                <li>
                  <span className="ef__role-icon">
                    <Person />
                  </span>
                  <span>
                    <span className="ef__label">{board.directLabel}</span>
                    <p>{stage.direct}</p>
                  </span>
                </li>
                <li>
                  <span className="ef__role-icon ef__role-icon--agent">
                    <Spark />
                  </span>
                  <span>
                    <span className="ef__label">{board.assistLabel}</span>
                    <p>{stage.assist}</p>
                  </span>
                </li>
                <li className="ef__gate">
                  <span className="ef__role-icon ef__role-icon--gate">
                    <Gate />
                  </span>
                  <span>
                    <span className="ef__label">{board.gateLabel}</span>
                    <p>{stage.gate}</p>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="ef__foot">
            <p className="ef__loop" data-on={at === n - 1 || undefined}>
              <Loop />
              {board.loop}
            </p>
            <button type="button" className="ef__next" onClick={() => go(next)}>
              {board.next}: {stages[next].name}
              <Arrow />
            </button>
          </div>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={RULE_TONES[i]}>
              <span className="cd-arch__rule-tag">
                {String(i + 1).padStart(2, '0')} / {p.step}
              </span>
              <h3 className="cd-arch__rule-title">{p.title}</h3>
              <p className="cd-arch__rule-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
