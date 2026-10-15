import { useState, type CSSProperties, type ReactElement } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { architecture, type ArchScenario } from '@/content/cloudData'
import '@/styles/cloud-arch.css'

/* ============================================================================
   CLOUD & DATA · THE THINKING BEHIND THE INFRASTRUCTURE

   The page's one new section, built in the language of the AI page's
   invoice workflow (InvoiceFlow): the same white board, pill scenario
   buttons, ink-ringed white stations on a route and rule cards. It does not
   pin: a reader clicks through it, on any screen.

   Three scenarios (Data freshness, Demand & resilience, Cloud economics),
   each seen two ways (The challenge, The designed response). Changing the
   scenario keeps the view; Reset example goes back to Data freshness, The
   challenge. Each view follows one path through three stations, then says
   what it means, the design decision and what we would check. Under the
   board, the three principles as cards.
   ========================================================================== */

type View = 'challenge' | 'response'

const TONE: Tone[] = ['sky', 'citrus', 'blossom']

const ICON = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const Data = () => (
  <svg {...ICON}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </svg>
)
const Cloud = () => (
  <svg {...ICON}>
    <path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.4 9.1 4.75 4.75 0 0 0 7 18.5z" />
  </svg>
)
const Chart = () => (
  <svg {...ICON}>
    <path d="M4 20h16" />
    <path d="M7 16v-4M12 16V8M17 16v-6" />
  </svg>
)
const Window = () => (
  <svg {...ICON}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <path d="M3.5 9h17" />
    <path d="M6.5 7h.01M9 7h.01" />
  </svg>
)
const People = () => (
  <svg {...ICON}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
    <circle cx="16.5" cy="9" r="2.4" />
    <path d="M15.5 14.2c2.4.2 4.2 2 4.8 4.6" />
  </svg>
)
const Coin = () => (
  <svg {...ICON}>
    <circle cx="12" cy="12" r="8" />
    <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.6.8-2.6 2s1.1 1.6 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.1 0-2-.4-2.5-1.2" />
    <path d="M12 6.5V8M12 16v1.5" />
  </svg>
)
const Tag = () => (
  <svg {...ICON}>
    <path d="M3.5 12.5V4.5h8l9 9-8 8z" />
    <circle cx="8" cy="9" r="1.4" />
  </svg>
)
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)
const Bang = () => (
  <svg {...ICON}>
    <path d="M12 5v9" />
    <path d="M12 18.5v.5" />
  </svg>
)
const Reset = () => (
  <svg {...ICON}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)

/** each scenario's three stations */
const STATIONS: Record<ArchScenario['id'], (() => ReactElement)[]> = {
  freshness: [Data, Cloud, Chart],
  demand: [Window, Cloud, People],
  economics: [Coin, Tag, Chart],
}

export function ArchitectureFlow({ content = architecture }: { content?: typeof architecture }) {
  const { demo, scenarios, principles } = content
  const [pick, setPick] = useState(0)
  const [view, setView] = useState<View>('challenge')
  const scen = scenarios[pick]
  const shown = scen[view]
  const icons = STATIONS[scen.id]
  const changed = pick !== 0 || view !== 'challenge'

  return (
    <section className="umm-section cd-arch" id="architecture" aria-labelledby="cd-arch-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="cd-arch-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="citrus"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="cd-arch__board" aria-label={demo.label} role="group">
          <div className="cd-arch__top">
            <span className="cd-arch__eyebrow">{demo.eyebrow}</span>
            <span className="cd-arch__tag">{demo.tag}</span>
          </div>

          <div className="cd-arch__controls">
            <div className="cd-arch__tabs" role="tablist" aria-label={demo.scenariosLabel}>
              <span className="cd-arch__label" aria-hidden="true">
                {demo.scenariosLabel}
              </span>
              {scenarios.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  className="cd-arch__tab"
                  aria-selected={i === pick}
                  aria-controls="cd-arch-panel"
                  onClick={() => setPick(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="cd-arch__compare">
              <span className="cd-arch__label" aria-hidden="true">
                {demo.viewsLabel}
              </span>
              <div className="cd-arch__switch" role="radiogroup" aria-label={demo.viewsLabel} data-view={view}>
                {(['challenge', 'response'] as View[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={view === v}
                    className="cd-arch__seg"
                    data-view={v}
                    onClick={() => setView(v)}
                  >
                    {demo.views[v]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="cd-arch__reset"
                onClick={() => {
                  setPick(0)
                  setView('challenge')
                }}
                disabled={!changed}
              >
                <Reset />
                {demo.reset}
              </button>
            </div>
          </div>

          <div className="cd-arch__panel" id="cd-arch-panel" role="tabpanel" aria-live="polite">
            <div className="cd-arch__scene" key={`${scen.id}-${view}`} data-view={view}>
              <div className="cd-arch__brief">
                <h3 className="cd-arch__title">{scen.title}</h3>
                <p className="cd-arch__prompt">{scen.prompt}</p>
              </div>

              <ol className="cd-arch__route">
                {shown.nodes.map((n, i) => {
                  const Icon = icons[i]
                  /* the challenge is the problem as it travels the path; the
                     response, the same path with the design in place */
                  const flagged = view === 'challenge'
                  return (
                    <li
                      key={n.place}
                      className="cd-arch__node"
                      data-umm-tone={TONE[i]}
                      data-flag={flagged || undefined}
                      style={{ ['--i' as string]: i } as CSSProperties}
                    >
                      <span className="cd-arch__station" aria-hidden="true">
                        <Icon />
                        <span className="cd-arch__state" data-flag={flagged || undefined}>
                          {flagged ? <Bang /> : <Check />}
                        </span>
                      </span>
                      <div className="cd-arch__card">
                        <span className="cd-arch__place">{n.place}</span>
                        <p className="cd-arch__node-title">{n.title}</p>
                        <p className="cd-arch__node-body">{n.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <dl className="cd-arch__read">
                <div className="cd-arch__cell">
                  <dt>{demo.meansLabel}</dt>
                  <dd>{shown.means}</dd>
                </div>
                <div className="cd-arch__cell">
                  <dt>{demo.decisionLabel}</dt>
                  <dd>{shown.decision}</dd>
                </div>
                <div className="cd-arch__cell">
                  <dt>{demo.checksLabel}</dt>
                  <dd>
                    <ul className="cd-arch__checks">
                      {shown.checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <p className="cd-arch__note">{demo.disclaimer}</p>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={TONE[i]}>
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
