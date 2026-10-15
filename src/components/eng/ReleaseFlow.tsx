import { useState, type CSSProperties, type ReactElement } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { release, type GateState } from '@/content/engineering'
import '@/styles/cloud-arch.css'

/* ============================================================================
   DIGITAL ENGINEERING · FROM COMMIT TO CUSTOMER

   The page's one new section, on the same board as the Cloud & Data page's
   architecture example (cloud-arch.css, cd-arch__): pill scenario buttons
   marked with where the release ends up, white stations ringed in ink on a
   route, a white state badge on each, rule cards under the board. It does
   not pin.

   One release (v2.4 → v2.5) through four gates. Three scenarios: the checks
   pass, a test fails, an issue appears live. Each sets every gate's status;
   the route is drawn solid in ink up to where the release stops, dashed
   beyond it. Then the status, what it means, and what the team can see.
   ========================================================================== */

const TONE: Tone[] = ['sky', 'sun', 'blossom', 'citrus']

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

const Code = () => (
  <svg {...ICON}>
    <path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14" />
  </svg>
)
const Flask = () => (
  <svg {...ICON}>
    <path d="M9.5 3.5h5M10 3.5v6L5 18.5A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2L14 9.5v-6" />
    <path d="M7.5 14.5h9" />
  </svg>
)
const Layers = () => (
  <svg {...ICON}>
    <path d="M12 4 3.5 8.5 12 13l8.5-4.5z" />
    <path d="M3.5 12.5 12 17l8.5-4.5" />
    <path d="M3.5 16.5 12 21l8.5-4.5" />
  </svg>
)
const Pulse = () => (
  <svg {...ICON}>
    <path d="M3 12h4l2.5-5 4 10 2.5-5H21" />
  </svg>
)
const Check = () => (
  <svg {...ICON}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)
const Cross = () => (
  <svg {...ICON}>
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
)
const Bang = () => (
  <svg {...ICON}>
    <path d="M12 5v9" />
    <path d="M12 18.5v.5" />
  </svg>
)
const Pause = () => (
  <svg {...ICON}>
    <path d="M9 6v12M15 6v12" />
  </svg>
)
const Dash = () => (
  <svg {...ICON}>
    <path d="M7 12h10" />
  </svg>
)
const Eye = () => (
  <svg {...ICON}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
)

const GATE_ICON: (() => ReactElement)[] = [Code, Flask, Layers, Pulse]

const STATE_ICON: Record<GateState, () => ReactElement> = {
  done: Check,
  pass: Check,
  staged: Check,
  watch: Eye,
  fail: Cross,
  hold: Pause,
  idle: Dash,
  alert: Bang,
}

/** states that stop the release: the route is solid up to the first */
const STOPS: GateState[] = ['fail', 'hold', 'idle', 'alert']

export function ReleaseFlow({ content = release }: { content?: typeof release }) {
  const { demo, scenarios, principles } = content
  const [pick, setPick] = useState(0)
  const scen = scenarios[pick]
  const stopAt = scen.gates.findIndex((g) => STOPS.includes(g.state))
  /* how far the solid line reaches, as a share of the route between the
     first and last station */
  const reach = stopAt < 0 ? 1 : stopAt / (scen.gates.length - 1)

  return (
    <section className="umm-section cd-arch" id="release" aria-labelledby="de-release-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="de-release-title"
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
        <div className="cd-arch__board" aria-label={demo.label} role="group">
          <div className="cd-arch__top">
            <span className="cd-arch__eyebrow">{demo.heading}</span>
            <span className="cd-arch__tag">{demo.context}</span>
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
                  className="cd-arch__tab cd-arch__tab--dot"
                  data-outcome={s.outcome}
                  aria-selected={i === pick}
                  aria-controls="de-release-panel"
                  onClick={() => setPick(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="cd-arch__version">
              {demo.from}
              <span aria-hidden="true">→</span>
              {demo.to}
            </span>
          </div>

          <div className="cd-arch__panel" id="de-release-panel" role="tabpanel" aria-live="polite">
            <div className="cd-arch__scene" key={scen.id}>
              <ol
                className="cd-arch__route cd-arch__route--gates"
                style={{ ['--reach' as string]: reach } as CSSProperties}
              >
                {demo.gates.map((g, i) => {
                  const Icon = GATE_ICON[i]
                  const { status, state } = scen.gates[i]
                  const State = STATE_ICON[state]
                  return (
                    <li
                      key={g.name}
                      className="cd-arch__node"
                      data-umm-tone={TONE[i]}
                      data-state={state}
                      style={{ ['--i' as string]: i } as CSSProperties}
                    >
                      <span className="cd-arch__station" aria-hidden="true">
                        <Icon />
                        <span className="cd-arch__state">
                          <State />
                        </span>
                      </span>
                      <div className="cd-arch__card">
                        <span className="cd-arch__place">{g.name}</span>
                        <p className="cd-arch__node-title">{status}</p>
                        <p className="cd-arch__node-body">{g.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <div className="cd-arch__verdict" data-outcome={scen.outcome}>
                <span className="cd-arch__status">{scen.statusLabel}</span>
                <h3 className="cd-arch__title">{scen.title}</h3>
                <p className="cd-arch__prompt">{scen.body}</p>
                <dl className="cd-arch__read cd-arch__read--one">
                  <div className="cd-arch__cell">
                    <dt>{demo.seeLabel}</dt>
                    <dd>{scen.see}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <p className="cd-arch__note">{demo.disclaimer}</p>
        </div>

        <ol className="cd-arch__rules">
          {principles.map((p, i) => (
            <li key={p.title} className="cd-arch__rule" data-umm-tone={TONE[i]}>
              <span className="cd-arch__rule-tag">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="cd-arch__rule-title">{p.title}</h3>
              <p className="cd-arch__rule-body">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
