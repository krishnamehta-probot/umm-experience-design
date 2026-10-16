import type { CSSProperties, ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import { useReadingStep } from '@/lib/useReadingStep'
import type { Tone } from '@/components/primitives'
import { architecture } from '@/content/cloudData'
import { CloudScene, type SceneFocus } from './CloudScene'
import '@/styles/cloud-arch.css'
import '@/styles/cloud-flow.css'

/* ============================================================================
   CLOUD & DATA · THE THINKING BEHIND THE INFRASTRUCTURE

   16 Oct, the doc's second version: one connected architecture, with three
   workflow views (Cloud provisioning, Data migration, Cloud operations)
   and three principles.

   16 Oct, evening, Krish: the engineering factory works, this should too,
   all of it. So it is built as the factory is: one ink board, the
   intelligence layer across its top, then a picture that holds still
   (CloudScene) beside seven cards in the page's flow (over them on a
   phone), every word of them on screen as the reader scrolls:

     01–04  the architecture: your existing systems, the connected
            platform, what it enables (and the loop), engineer oversight
     05–07  the three workflows: path, what AI supports, the engineer's
            decision, evidence, outcome

   The card being read lights its part of the picture, packets of data
   running into it or along its route. The stations under the picture
   scroll to their card. Where the window is too short to hold the
   picture still, it sits above the cards. Then the principles.
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

const Spark = () => (
  <svg {...ICON}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
)
const Apps = () => (
  <svg {...ICON}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
)
const Data = () => (
  <svg {...ICON}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
)
const Code = () => (
  <svg {...ICON}>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />
  </svg>
)
const Cloud = () => (
  <svg {...ICON}>
    <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.4 9.1 4.75 4.75 0 0 0 7 18.5z" />
  </svg>
)
const Stack = () => (
  <svg {...ICON}>
    <rect x="4" y="4.5" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="10" width="16" height="4.5" rx="1.2" />
    <rect x="4" y="15.5" width="16" height="4.5" rx="1.2" />
  </svg>
)
const Pulse = () => (
  <svg {...ICON}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
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

const SYSTEM_ICON = [Apps, Data, Code]
const OUT_TONE: Tone[] = ['sky', 'citrus', 'blossom']
const RULE_TONE: Tone[] = ['sky', 'citrus', 'blossom']

export function ConnectedArchitecture({ content = architecture }: { content?: typeof architecture }) {
  const { board, workflows, principles } = content

  /* the seven cards, in order: the architecture's four, the workflows */
  const steps: { focus: SceneFocus; tone: Tone; name: string }[] = [
    { focus: 'systems', tone: 'sky', name: board.systemsLabel },
    { focus: 'platform', tone: 'lilac', name: board.platformLabel },
    { focus: 'outcomes', tone: 'blossom', name: board.outcomesLabel },
    { focus: 'oversight', tone: 'citrus', name: board.oversightLabel },
    ...workflows.map((w, i) => ({ focus: w.id as SceneFocus, tone: OUT_TONE[i], name: w.label })),
  ]

  const { at, holdRef, cardRef, goTo } = useReadingStep()
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

  return (
    <section className="umm-section cd-arch cf" id="architecture" aria-labelledby="cf-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="cf-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="sky"
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

          {/* the intelligence layer, over everything */}
          <div className="cf__layer">
            <span className="cf__layer-icon">
              <Spark />
            </span>
            <div>
              <span className="cf__mono">{board.layerEyebrow}</span>
              <p className="cf__layer-title">{board.layerTitle}</p>
            </div>
            <div className="cf__layer-side">
              <p>{board.layerNote}</p>
              <p className="cf__mono">{board.assist}</p>
            </div>
          </div>

          <div className="cf__story">
            {/* the picture, held still while the cards pass */}
            <div
              className="cf__hold"
              ref={holdRef}
              style={{ ['--tone' as string]: `var(--umm-${steps[at].tone})` } as CSSProperties}
            >
              <CloudScene focus={steps[at].focus} />
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
                  <span className="cf__label">{num(0)}</span>
                  <h3 className="cf__title">{board.systemsLabel}</h3>
                  <ul className="cf__list">
                    {board.systems.map((s, i) => {
                      const Icon = SYSTEM_ICON[i]
                      return (
                        <li key={s.title} className="cf__node">
                          <span className="cf__node-icon">
                            <Icon />
                          </span>
                          <span>
                            <span className="cf__node-title">{s.title}</span>
                            <span className="cf__node-sub">{s.items}</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="cf__link">
                    <Arrow />
                    {board.systemsLink}
                  </p>
                </>,
              )}

              {card(
                1,
                <>
                  <span className="cf__label">{num(1)}</span>
                  <h3 className="cf__title">{board.platformLabel}</h3>
                  <div className="cf__platform">
                    <p className="cf__move">{board.movement}</p>
                    <div className="cf__pair">
                      <div className="cf__box">
                        <Cloud />
                        <span className="cf__node-title">{board.runtime.title}</span>
                        <span className="cf__node-sub">{board.runtime.body}</span>
                      </div>
                      <div className="cf__box">
                        <Stack />
                        <span className="cf__node-title">{board.data.title}</span>
                        <span className="cf__node-sub">{board.data.body}</span>
                      </div>
                    </div>
                    <div className="cf__box cf__box--row">
                      <Pulse />
                      <span>
                        <span className="cf__node-title">{board.observe.title}</span>
                        <span className="cf__node-sub">{board.observe.items}</span>
                      </span>
                    </div>
                    <p className="cf__providers">{board.providers.join(' · ')}</p>
                  </div>
                </>,
              )}

              {card(
                2,
                <>
                  <span className="cf__label">{num(2)}</span>
                  <h3 className="cf__title">{board.outcomesLabel}</h3>
                  <p className="cf__link">
                    <Arrow />
                    {board.outcomesLink}
                  </p>
                  <ol className="cf__list">
                    {board.outcomes.map((o, i) => (
                      <li key={o} className="cf__outcome" data-umm-tone={OUT_TONE[i]}>
                        <span className="cf__mono">{num(i)}</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="cf__loop">
                    <Loop />
                    {board.loop}
                  </p>
                </>,
              )}

              {card(
                3,
                <>
                  <span className="cf__label">{num(3)}</span>
                  <h3 className="cf__title">{board.oversightLabel}</h3>
                  <ul className="cf__checks">
                    {board.oversight.map((o) => (
                      <li key={o}>
                        <Check />
                        {o}
                      </li>
                    ))}
                  </ul>
                </>,
              )}

              {workflows.map((w, k) =>
                card(
                  4 + k,
                  <>
                    <span className="cf__label">
                      {num(4 + k)} / {w.eyebrow}
                    </span>
                    <h3 className="cf__title">{w.title}</h3>
                    <p className="cf__body">{w.body}</p>
                    <dl className="cf__facts">
                      <div>
                        <dt className="cf__mono">{board.aiLabel}</dt>
                        <dd>{w.ai}</dd>
                      </div>
                      <div>
                        <dt className="cf__mono">{board.decisionLabel}</dt>
                        <dd>{w.decision}</dd>
                      </div>
                      <div>
                        <dt className="cf__mono">{board.evidenceLabel}</dt>
                        <dd>{w.evidence.join(' · ')}</dd>
                      </div>
                      <div>
                        <dt className="cf__mono">{board.outcomeLabel}</dt>
                        <dd>{w.outcome}</dd>
                      </div>
                    </dl>
                  </>,
                ),
              )}
            </ol>
          </div>
        </div>

        <p className="cd-arch__note cf__note">{board.disclaimer}</p>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={RULE_TONE[i]}>
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
