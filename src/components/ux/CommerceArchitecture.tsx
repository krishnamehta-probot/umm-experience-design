import type { CSSProperties, ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { useReadingStep } from '@/lib/useReadingStep'
import { commerce as commerce0 } from '@/content/uxCommerce'
import { CommerceScene, type CommerceFocus } from './CommerceScene'
import '@/styles/cloud-arch.css'
import '@/styles/cloud-flow.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE THINKING BEHIND THE INTERFACE

   The page's story: one order, from the first search to the systems that
   fulfil it, through the doc's four layers (experience, AI and
   personalization, commerce services, business operations), then four
   business models, then three principles.

   16 Oct, evening, Krish: tell it as you scroll, as the other service
   pages' boards now are (cloud-flow.css). One ink board: a picture of the
   order's journey holds still (CommerceScene) beside eight cards in the
   page's flow (over them on a phone), every word on screen as the reader
   scrolls:

     01–04  the layers: experience, AI and personalization, commerce
            services, business operations
     05–08  the business models: where AI adds value, what connects
            behind it, link by link

   The card being read lights its part of the picture, an order running
   its route; the stations scroll to their card. What holds across the
   architecture closes the board. Then the principles.
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

const Loop = () => (
  <svg {...ICON} data-spin>
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

const TONES: Tone[] = ['coral', 'sky', 'blossom', 'sun']
const RULE_TONES: Tone[] = ['coral', 'sky', 'citrus']

/** "01 Experience" → ["01", "Experience"] */
const split = (label: string) => {
  const m = label.match(/^(\d+)\s+(.*)$/)
  return m ? [m[1], m[2]] : ['', label]
}

export function CommerceArchitecture({ content = commerce0 }: { content?: typeof commerce0 }) {
  const { board, models, principles } = content
  const { at, holdRef, cardRef, goTo } = useReadingStep()

  /* the eight cards, in order: the layers, then the business models */
  const steps: { focus: CommerceFocus; tone: Tone; name: string }[] = [
    { focus: 'experience', tone: 'coral', name: split(board.experience.label)[1] },
    { focus: 'ai', tone: 'lilac', name: split(board.ai.label)[1] },
    { focus: 'services', tone: 'sky', name: split(board.services.label)[1] },
    { focus: 'operations', tone: 'citrus', name: split(board.operations.label)[1] },
    ...models.map((m, i) => ({ focus: m.id as CommerceFocus, tone: TONES[i], name: m.label })),
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

  /** a layer: its number, its name */
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
    <section className="umm-section cd-arch uc" id="commerce" aria-labelledby="uc-title">
      <div className="umm-container cd-arch__head">
        <AiHead
          id="uc-title"
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
        <div className="cf__board" data-umm-theme="ink" role="group" aria-label={board.label}>
          <div className="cf__top">
            <span className="cf__eyebrow">
              <span className="cf__live" aria-hidden="true" />
              {board.label}
            </span>
          </div>

          <div className="cf__story">
            {/* the picture, held still while the cards pass */}
            <div
              className="cf__hold"
              ref={holdRef}
              style={{ ['--tone' as string]: `var(--umm-${steps[at].tone})` } as CSSProperties}
            >
              <CommerceScene focus={steps[at].focus} />
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
                  {head(board.experience.label)}
                  <ul className="cf__chips">
                    {board.experience.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Arrow />
                    {board.experience.link}
                  </p>
                </>,
              )}

              {card(
                1,
                <>
                  {head(board.ai.label)}
                  <p className="cf__layer-title">{board.ai.title}</p>
                  <ul className="cf__chips">
                    {board.ai.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Arrow />
                    {board.ai.link}
                  </p>
                </>,
              )}

              {card(
                2,
                <>
                  {head(board.services.label)}
                  <p className="cf__body">{board.services.note}</p>
                  <ul className="cf__list cf__list--two">
                    {board.services.items.map((s) => (
                      <li key={s.title} className="cf__node">
                        <span>
                          <span className="cf__node-title">{s.title}</span>
                          <span className="cf__node-sub">{s.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Arrow />
                    {board.services.link}
                  </p>
                </>,
              )}

              {card(
                3,
                <>
                  {head(board.operations.label)}
                  <ul className="cf__chips">
                    {board.operations.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p className="cf__loop">
                    <Loop />
                    {board.operations.loop}
                  </p>
                </>,
              )}

              {/* the business models, under their heading */}
              <li className="cf__divider">
                <p className="cf__mono">{content.modelsEyebrow}</p>
                <p className="cf__divider-title">{content.modelsTitle}</p>
              </li>

              {models.map((m, k) =>
                card(
                  4 + k,
                  <>
                    <span className="cf__label">
                      {num(4 + k)} / {m.eyebrow}
                    </span>
                    <h3 className="cf__title">{m.title}</h3>
                    <p className="cf__body">{m.body}</p>
                    <div className="cf__part">
                      <span className="cf__mono">{content.aiLabel}</span>
                      <p>{m.ai}</p>
                    </div>
                    <div className="cf__part">
                      <span className="cf__mono">{content.connectsLabel}</span>
                      <ol className="cf__chain">
                        {m.connects.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ol>
                    </div>
                  </>,
                ),
              )}
            </ol>
          </div>

          {/* across the architecture */}
          <div className="cf__across">
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
