import { useId, useState, type CSSProperties } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { growthModel } from '@/content/growth'
import '@/styles/cloud-arch.css'

/* ============================================================================
   INTEGRATED GROWTH & STRATEGY · WHERE GROWTH ADDS UP

   The page's one new section, on the same board as the Cloud & Data and
   Digital Engineering examples (cloud-arch.css, cd-arch__): three levers as
   cards with a slider each, the result in an ink-ringed panel beside them,
   the three principles as rule cards under the board. It does not pin.

   The model is the doc's, exactly: visits × conversion rate × (1 + repeat
   purchase rate) × average order value, the order value fixed at ₹2,500.
   Orders are whole: first orders round to the nearest order, and repeat
   orders are that share of the first. Money is shown in Indian grouping
   (₹6,00,000). Reset example restores the three defaults.
   ========================================================================== */

const TONE: Tone[] = ['sun', 'sky', 'coral']

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const count = (n: number) => Math.round(n).toLocaleString('en-IN')

function model(visits: number, conv: number, repeat: number, aov: number) {
  const first = Math.round((visits * conv) / 100)
  const again = Math.round((first * repeat) / 100)
  return { first, again, firstRev: first * aov, againRev: again * aov, total: (first + again) * aov }
}

const Reset = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </svg>
)

export function GrowthModel({ content = growthModel }: { content?: typeof growthModel }) {
  const { demo, levers, principles } = content
  const defaults = levers.map((l) => l.value)
  const [values, setValues] = useState<number[]>(defaults)
  const id = useId()

  const base = model(defaults[0], defaults[1], defaults[2], demo.aov)
  const now = model(values[0], values[1], values[2], demo.aov)
  const changed = values.some((v, i) => v !== defaults[i])
  const delta = (now.total / base.total - 1) * 100
  const deltaText = `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta).toLocaleString('en-IN', {
    maximumFractionDigits: 1,
  })}%`
  const share = now.total > 0 ? now.firstRev / now.total : 1

  const shown = (i: number) => {
    const l = levers[i]
    const v = values[i]
    return l.unit === 'count'
      ? count(v)
      : `${v.toLocaleString('en-IN', { minimumFractionDigits: l.step_ < 1 ? 1 : 0, maximumFractionDigits: 1 })}%`
  }

  return (
    <section className="umm-section cd-arch" id="growth" aria-labelledby="ig-model-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="ig-model-title"
          chip={content.chip}
          line1={content.line1}
          line2={content.line2}
          accent={content.accent}
          tone="coral"
          lineRecipe={2}
        />
        <p className="cx-lead cd-arch__lead">{content.lead}</p>
      </div>

      <div className="umm-container">
        <div className="cd-arch__board" aria-label={demo.label} role="group">
          <div className="cd-arch__top">
            <span className="cd-arch__eyebrow">{demo.eyebrow}</span>
            <button
              type="button"
              className="cd-arch__reset"
              onClick={() => setValues(defaults)}
              disabled={!changed}
            >
              <Reset />
              {demo.reset}
            </button>
          </div>
          <h3 className="cd-arch__title">{demo.title}</h3>

          <div className="ig-model">
            <div className="ig-model__levers">
              {levers.map((l, i) => {
                const fill = ((values[i] - l.min) / (l.max - l.min)) * 100
                return (
                  <div className="ig-model__lever" key={l.step} data-umm-tone={TONE[i]}>
                    <div className="ig-model__lever-head">
                      <span className="cd-arch__place">
                        {l.step} {l.title}
                      </span>
                      <output className="ig-model__value" htmlFor={`${id}-${i}`}>
                        {shown(i)}
                      </output>
                    </div>
                    <label className="ig-model__label" htmlFor={`${id}-${i}`}>
                      {l.label}
                    </label>
                    <input
                      id={`${id}-${i}`}
                      className="ig-model__range"
                      type="range"
                      min={l.min}
                      max={l.max}
                      step={l.step_}
                      value={values[i]}
                      style={{ ['--fill' as string]: `${fill}%` } as CSSProperties}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setValues((prev) => prev.map((p, k) => (k === i ? v : p)))
                      }}
                    />
                  </div>
                )
              })}
              <p className="ig-model__aov">
                {demo.aovLabel}: <strong>{inr(demo.aov)}</strong>
              </p>
            </div>

            <div className="ig-model__result" aria-live="polite">
              <span className="cd-arch__tag">{demo.resultTag}</span>
              <p className="ig-model__result-label">{demo.revenueLabel}</p>
              <p className="ig-model__total">{inr(now.total)}</p>
              <p className="ig-model__delta" data-dir={delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}>
                {changed ? (
                  <>
                    <strong>{deltaText}</strong> {demo.changedNote}
                  </>
                ) : (
                  <>
                    <strong>{demo.baselineLabel}</strong> · {demo.baselineNote}
                  </>
                )}
              </p>

              <div className="ig-model__bar" aria-hidden="true">
                <span className="ig-model__bar-first" style={{ width: `${share * 100}%` }} />
                <span className="ig-model__bar-repeat" style={{ width: `${(1 - share) * 100}%` }} />
              </div>

              <dl className="ig-model__stats">
                <div data-part="first">
                  <dt>{demo.firstLabel}</dt>
                  <dd>{inr(now.firstRev)}</dd>
                </div>
                <div data-part="repeat">
                  <dt>{demo.repeatLabel}</dt>
                  <dd>{inr(now.againRev)}</dd>
                </div>
                <div>
                  <dt>{demo.firstOrdersLabel}</dt>
                  <dd>{count(now.first)}</dd>
                </div>
                <div>
                  <dt>{demo.repeatOrdersLabel}</dt>
                  <dd>{count(now.again)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <details className="ig-model__how">
            <summary>{demo.howLabel}</summary>
            <p>{demo.how}</p>
          </details>
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
