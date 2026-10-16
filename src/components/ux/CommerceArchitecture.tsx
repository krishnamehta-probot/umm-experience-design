import type { CSSProperties, ReactNode } from 'react'
import { AiHead } from '@/components/ai/AiHead'
import type { Tone } from '@/components/primitives'
import { useReadingStep } from '@/lib/useReadingStep'
import { commerce as commerce0 } from '@/content/uxCommerce'
import { Receipt, ShopPhone, type PhoneStep } from './ShopPhone'
import '@/styles/cloud-arch.css'
import '@/styles/ux-phone.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · THE THINKING BEHIND THE INTERFACE

   The page's story: one order, from the first search to the systems that
   fulfil it, through the doc's four layers (experience, AI and
   personalization, commerce services, business operations), then four
   business models, then three principles.

   16 Oct, Krish: the four service pages' thinking sections had grown alike
   (the same ink board, a diagram, numbered stations). This one is now the
   shopper's phone: a paper board washed in blossom, a drawn phone held
   beside the cards (ShopPhone, ux-phone.css), its shop changing with the
   card being read, and a receipt printing a line for each card read so
   far. It reads as a product, not a diagram, so there are no stations.

     01–04  the layers: storefront, AI search, checkout, order tracking
     05–08  the business models: a product page, a bulk quote, a plan
            switched on, a booking

   Every word sits in the cards, in the page's flow. Wide screens hold the
   phone beside them; phones and tablets hold a small one over them; short
   windows don't hold it at all. What holds across the architecture closes
   the board. Then the principles.
   ========================================================================== */

const ICON = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
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

const tone = (t: Tone) => ({ ['--tone' as string]: `var(--umm-${t})` }) as CSSProperties

export function CommerceArchitecture({ content = commerce0 }: { content?: typeof commerce0 }) {
  const { board, models, principles } = content
  const { at, holdRef, cardRef } = useReadingStep()

  /* the eight cards, in order: the layers, then the business models */
  const steps: PhoneStep[] = [
    { focus: 'experience', tone: 'coral', name: split(board.experience.label)[1] },
    { focus: 'ai', tone: 'lilac', name: split(board.ai.label)[1] },
    { focus: 'services', tone: 'sky', name: split(board.services.label)[1] },
    { focus: 'operations', tone: 'citrus', name: split(board.operations.label)[1] },
    ...models.map((m, i) => ({ focus: m.id, tone: TONES[i], name: m.label })),
  ]
  const num = (i: number) => String(i + 1).padStart(2, '0')

  /** a card, with its tone, lit while it is read */
  const card = (i: number, body: ReactNode) => (
    <li
      key={steps[i].focus}
      className="up__step"
      data-on={i === at || undefined}
      data-read={i < at || undefined}
      ref={cardRef(i)}
      style={tone(steps[i].tone)}
    >
      {body}
    </li>
  )

  /** a layer: its number, its name */
  const head = (label: string) => {
    const [n, name] = split(label)
    return (
      <>
        <span className="up__tag">
          <i aria-hidden="true" />
          {n}
        </span>
        <h3 className="up__title">{name}</h3>
      </>
    )
  }

  /** a connector, named: where the order goes next */
  const link = (text: string, icon: ReactNode = <Arrow />) => (
    <p className="up__link">
      <span className="up__link-icon">{icon}</span>
      {text}
    </p>
  )

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
        <div className="up__board" role="group" aria-label={board.label}>
          <p className="up__eyebrow">
            <span className="up__live" aria-hidden="true" />
            {board.label}
          </p>

          <div className="up__story">
            {/* the phone, held while the cards pass */}
            <div className="up__hold" ref={holdRef} style={tone(steps[at].tone)}>
              <div className="up__stage">
                <i className="up__glow" aria-hidden="true" />
                <ShopPhone steps={steps} at={at} />
                <Receipt steps={steps} at={at} />
              </div>
            </div>

            {/* the cards, in the page's flow */}
            <ol className="up__steps">
              {card(
                0,
                <>
                  {head(board.experience.label)}
                  <ul className="up__chips">
                    {board.experience.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  {link(board.experience.link)}
                </>,
              )}

              {card(
                1,
                <>
                  {head(board.ai.label)}
                  <p className="up__lede">{board.ai.title}</p>
                  <ul className="up__chips">
                    {board.ai.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  {link(board.ai.link)}
                </>,
              )}

              {card(
                2,
                <>
                  {head(board.services.label)}
                  <p className="up__body">{board.services.note}</p>
                  <ul className="up__svcs">
                    {board.services.items.map((s) => (
                      <li key={s.title}>
                        <span className="up__svc-title">{s.title}</span>
                        <span className="up__svc-sub">{s.body}</span>
                      </li>
                    ))}
                  </ul>
                  {link(board.services.link)}
                </>,
              )}

              {card(
                3,
                <>
                  {head(board.operations.label)}
                  <ul className="up__chips">
                    {board.operations.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  {link(board.operations.loop, <Loop />)}
                </>,
              )}

              {/* the business models, under their heading */}
              <li className="up__divider">
                <p className="up__mono">{content.modelsEyebrow}</p>
                <p className="up__divider-title">{content.modelsTitle}</p>
              </li>

              {models.map((m, k) =>
                card(
                  4 + k,
                  <>
                    <span className="up__tag">
                      <i aria-hidden="true" />
                      {num(4 + k)} / {m.eyebrow}
                    </span>
                    <h3 className="up__title">{m.title}</h3>
                    <p className="up__body">{m.body}</p>
                    <div className="up__part">
                      <span className="up__mono">{content.aiLabel}</span>
                      <p>{m.ai}</p>
                    </div>
                    <div className="up__part">
                      <span className="up__mono">{content.connectsLabel}</span>
                      <ol className="up__chain">
                        {m.connects.map((c, j) => (
                          <li key={c} style={{ ['--i' as string]: j } as CSSProperties}>
                            {c}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>,
                ),
              )}
            </ol>
          </div>

          {/* across the architecture */}
          <div className="up__across">
            <span className="up__mono">{board.across.label}</span>
            <ul className="up__checks">
              {board.across.items.map((a) => (
                <li key={a}>
                  <span className="up__check">
                    <Check />
                  </span>
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
