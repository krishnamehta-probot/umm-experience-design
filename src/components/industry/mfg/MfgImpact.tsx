import { Fragment, type CSSProperties } from 'react'
import { impact as mfgImpact, type Head as HeadContent, type ImpactCard } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { Head } from './Head'
import { useAuto } from './hooks'

/* ============================================================================
   HOW AI IS IMPACTING <INDUSTRY> — the industry pages' template, new flow
   (Krish, 6 Nov: "this section is needed to be highlighted more… all
   industry pages will have this thing"; 12 Nov: the new flow)

   The page's one full dark sheet. Every industry writes this section the
   same way now: six uses of AI across the operation, each with what makes
   it work (the connected information, the decision owner) and how to
   measure the effect. The template turns that shape into its motion:

     left    the six areas, stepping on by themselves (paused under the
             pointer, stopped once one is picked), a line filling under the
             one in view
     right   the use itself, large; what it does; then what makes it work
             as a formula: the connected information, piece + piece +
             piece, arriving one by one and running into the decision
             owner, who signs it off; under it the measures, each lit
     ground  a slow aura that takes on the colour of the use in view

   Give it another industry's `impact` content and it needs nothing else:
   the pieces come from splitting `info` at " + ", the measures from
   splitting `measures` at " · ", the colours from the tones.
   ========================================================================== */

export type ImpactContent = {
  id: string
  head: HeadContent
  labels: { works: string; info: string; owner: string; measure: string }
  cards: ImpactCard[]
}

export function MfgImpact({ content = mfgImpact }: { content?: ImpactContent }) {
  const c = content
  const n = c.cards.length
  const { i, pick, host } = useAuto<HTMLDivElement>(n, 7600)
  const card = c.cards[i]
  const info = card.info.split(' + ')
  const measures = card.measures.split(' · ')

  return (
    <section id={c.id} className="mi" aria-labelledby="mi-title">
      <div className="mi__in" data-tone={card.tone}>
        <span className="mi__aura" aria-hidden="true">
          <i />
          <i />
        </span>

        <Head id="mi-title" head={c.head} dark />

        <div ref={host} className="mi__main" data-umm-reveal>
          <ol className="mi__areas">
            {c.cards.map((x, k) => (
              <li key={x.area}>
                <button type="button" aria-pressed={k === i} data-tone={x.tone} onClick={() => pick(k)}>
                  <span>{pad(k)}</span>
                  {x.area}
                  <i />
                </button>
              </li>
            ))}
          </ol>

          <div className="mi__case" key={i} aria-live="polite">
            <p className="mi__k">
              {pad(i)} / {card.area}
            </p>
            <p className="mi__title">{card.title}</p>
            <p className="mi__body">{card.body}</p>

            <div className="mi__works">
              <p className="mi__label">{c.labels.works}</p>
              <div className="mi__formula">
                <div className="mi__info">
                  <small>{c.labels.info}</small>
                  <div className="mi__pieces">
                    {info.map((x, k) => (
                      <Fragment key={x}>
                        <span className="mi__piece" style={{ '--k': k } as CSSProperties}>
                          {x}
                        </span>
                        {k < info.length - 1 ? (
                          <i className="mi__plus" style={{ '--k': k } as CSSProperties} aria-hidden="true">
                            +
                          </i>
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                </div>
                <span className="mi__into" style={{ '--k': info.length } as CSSProperties} aria-hidden="true">
                  <i />
                </span>
                <div className="mi__owner" style={{ '--k': info.length + 1 } as CSSProperties}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="9" r="3.6" />
                    <path d="M5.6 19.6c1-3.5 3.5-5.2 6.4-5.2s5.4 1.7 6.4 5.2" />
                  </svg>
                  <div>
                    <small>{c.labels.owner}</small>
                    <p>{card.owner}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mi__measure">
              <p className="mi__label">{c.labels.measure}</p>
              <ul>
                {measures.map((m, k) => (
                  <li key={m} style={{ '--k': k } as CSSProperties}>
                    <svg viewBox="0 0 20 12" aria-hidden="true">
                      <path d="M1 10l5-4 4 2 8-7" />
                    </svg>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
