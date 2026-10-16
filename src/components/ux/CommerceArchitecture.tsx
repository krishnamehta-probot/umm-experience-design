import { useState, type CSSProperties } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { commerce as commerce0, type CommerceModel } from '@/content/uxCommerce'
import '@/styles/cloud-arch.css'
import '@/styles/ux-commerce.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE THINKING BEHIND THE INTERFACE

   The page's story: one order, from the first search to the systems that
   fulfil it. The board stacks the doc's four layers, as the visual does:

     01 Experience        where the customer is (storefront, app, portal…)
     02 AI & personalization   making discovery more relevant
     03 Commerce services      the ink band: products, accounts, payments, orders
     04 Business operations    ERP, fulfilment, product data, CRM, analytics

   An order travels down the connectors between them, one layer after the
   next, and the signals loop back to the top. Choosing a business model
   (Retail and DTC, B2B, Subscriptions, Services and bookings) lights the
   parts of each layer that model leans on, and plays "what connects behind
   it" as a chain, link by link. Then the three principles as rule cards.
   ========================================================================== */

/** What each model lights in each layer. */
const LIT: Record<CommerceModel['id'], { exp: number[]; ai: number[]; svc: number[]; ops: number[] }> = {
  retail: { exp: [0, 1], ai: [0, 1], svc: [0, 2], ops: [1, 2] },
  b2b: { exp: [2], ai: [2, 1], svc: [1, 0], ops: [0] },
  subscriptions: { exp: [0, 1], ai: [3, 1], svc: [1, 3], ops: [3, 4] },
  bookings: { exp: [0, 1], ai: [0, 1], svc: [3, 2], ops: [3] },
}

const TONES: Tone[] = ['coral', 'sky', 'blossom', 'sun']
const RULE_TONES: Tone[] = ['coral', 'sky', 'citrus']

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

const SERVICE_ICONS = [
  // products and pricing: a tag
  <svg {...ICON} key="p">
    <path d="M3.5 12.5V4.5h8l9 9-8 8z" />
    <circle cx="8" cy="9" r="1.4" />
  </svg>,
  // accounts and access: a person
  <svg {...ICON} key="a">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" />
  </svg>,
  // transactions: a card
  <svg {...ICON} key="t">
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
    <path d="M3 10h18M7 14.5h4" />
  </svg>,
  // orders and lifecycle: a box
  <svg {...ICON} key="o">
    <path d="M3.5 8 12 4l8.5 4v8L12 20l-8.5-4z" />
    <path d="M3.5 8 12 12l8.5-4M12 12v8" />
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
const Bag = () => (
  <svg {...ICON}>
    <path d="M5 8h14l-1 12H6z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
)

/** A connector between layers: its line, and the order travelling it. */
function Pass({ label, step, both }: { label: string; step: number; both?: boolean }) {
  return (
    <div className="uc__pass" style={{ ['--s' as string]: step } as CSSProperties}>
      <span className="uc__pass-line" aria-hidden="true">
        <span className="uc__order">
          <Bag />
        </span>
        {both ? <i className="uc__back" /> : null}
      </span>
      <span className="uc__pass-label">{label}</span>
    </div>
  )
}

export function CommerceArchitecture({ content = commerce0 }: { content?: typeof commerce0 }) {
  const { board, models, principles } = content
  const [pick, setPick] = useState(0)
  const model = models[pick]
  const lit = LIT[model.id]

  return (
    <section className="umm-section cd-arch uc" id="commerce" aria-labelledby="uc-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="uc-title"
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
        <div className="uc__board" role="group" aria-label={board.label} data-model={model.id}>
          <p className="uc__label uc__board-label">{board.label}</p>

          {/* 01 · where the customer is */}
          <div className="uc__layer uc__layer--exp">
            <span className="uc__label">{board.experience.label}</span>
            <ul className="uc__row">
              {board.experience.items.map((x, i) => (
                <li key={x} className="uc__item" data-on={lit.exp.includes(i)}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <Pass label={board.experience.link} step={0} />

          {/* 02 · relevance */}
          <div className="uc__layer uc__layer--ai">
            <div>
              <span className="uc__label">{board.ai.label}</span>
              <p className="uc__layer-title">{board.ai.title}</p>
            </div>
            <ul className="uc__pills">
              {board.ai.items.map((x, i) => (
                <li key={x} className="uc__pill" data-on={lit.ai.includes(i)}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <Pass label={board.ai.link} step={1} />

          {/* 03 · the commerce services: the ink band */}
          <div className="uc__layer uc__layer--svc" data-umm-theme="ink">
            <div className="uc__svc-head">
              <span className="uc__label">{board.services.label}</span>
              <span className="uc__note">{board.services.note}</span>
            </div>
            <ul className="uc__cards">
              {board.services.items.map((s, i) => (
                <li key={s.title} className="uc__card" data-on={lit.svc.includes(i)}>
                  {SERVICE_ICONS[i]}
                  <p className="uc__card-title">{s.title}</p>
                  <p className="uc__card-body">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <Pass label={board.services.link} step={2} both />

          {/* 04 · the business behind it */}
          <div className="uc__layer uc__layer--ops">
            <span className="uc__label">{board.operations.label}</span>
            <ul className="uc__row uc__row--ops">
              {board.operations.items.map((x, i) => (
                <li key={x} className="uc__item" data-on={lit.ops.includes(i)}>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <p className="uc__loop">
            <Loop />
            {board.operations.loop}
          </p>

          <div className="uc__across">
            <span className="uc__label">{board.across.label}</span>
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

        {/* one architecture, different business needs */}
        <div className="uc__models">
          <p className="uc__models-eyebrow">{content.modelsEyebrow}</p>
          <h3 className="uc__models-title">{content.modelsTitle}</h3>
          <div className="uc__picks" role="tablist" aria-label={content.modelsTitle}>
            {models.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                className="uc__pick"
                aria-selected={i === pick}
                aria-controls="uc-panel"
                data-umm-tone={TONES[i]}
                onClick={() => setPick(i)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="uc__detail" id="uc-panel" role="tabpanel" aria-live="polite" key={model.id}>
            <div className="uc__detail-intro">
              <span className="uc__label uc__label--ink">{model.eyebrow}</span>
              <h4 className="uc__detail-title">{model.title}</h4>
              <p className="uc__detail-body">{model.body}</p>
            </div>
            <div className="uc__detail-side">
              <span className="uc__label uc__label--ink">{content.aiLabel}</span>
              <p className="uc__detail-text">{model.ai}</p>
              <span className="uc__label uc__label--ink">{content.connectsLabel}</span>
              <ol className="uc__chain" data-umm-tone={TONES[pick]}>
                {model.connects.map((c, i) => (
                  <li key={c} style={{ ['--i' as string]: i } as CSSProperties}>
                    {c}
                  </li>
                ))}
              </ol>
            </div>
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
