import type { CSSProperties } from 'react'
import { ai } from '@/content/fintech'
import '@/styles/fin-final-ai.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 09 · AI IN FINANCIAL SERVICES (Krish, 6 Nov:
   "again 3 cards that you can take inspiration from service page")

   Three workflows, each a card in the service cards' way: its pastel, a
   scene at the top, the words under it. The scene is the workflow itself,
   drawn in the fine line of section 04: where the work comes from, the AI
   step, the person who decides, joined by a line that a case runs along;
   it pauses at the AI step (which glows) and ends with the person's check.
   Under it: the title, what AI does and what stays with the team, and what
   to measure.

   The close turns its three sentences into three steps ("Start with a
   workflow." → "Prove its value." → "Then extend."), with the way to do it
   beside them. Each card starts a moment after the last, so the three run
   out of step. The copy is the final copy.
   ========================================================================== */

function Doc() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
      <path d="M14 3.5V7.5h4M9.5 12h5M9.5 15h5M9.5 18h3" />
    </svg>
  )
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c.8 5 3.9 8.2 9 9-5.1.8-8.2 3.9-9 9-.8-5.1-3.9-8.2-9-9 5.1-.8 8.2-4 9-9z" />
    </svg>
  )
}

function Person() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.8" r="3.6" />
      <path d="M5.4 19.6c1-3.6 3.6-5.4 6.6-5.4s5.6 1.8 6.6 5.4" />
    </svg>
  )
}

const STATION = [Doc, Spark, Person]

export function FinalAi() {
  const c = ai
  const steps = c.close.title.split(/(?<=\.)\s+/)
  return (
    <section id={c.id} className="fx" aria-labelledby="fx-title">
      <div className="fr__top" data-umm-reveal>
        <div className="fr__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fx-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
        </div>
        <p className="fr__lead">{c.head.intro}</p>
      </div>

      <ul className="fx__cards">
        {c.cards.map((card, k) => (
          <li
            key={card.title}
            className="fx__card"
            data-umm-tone={card.tone}
            data-umm-reveal
            style={{ '--umm-reveal-delay': `${k * 90}ms`, '--lag': `${k * -1.6}s` } as CSSProperties}
          >
            <div className="fx__flow" aria-label={card.flow.join(' → ')} role="img">
              <span className="fx__line" aria-hidden="true">
                <i />
              </span>
              <span className="fx__case" aria-hidden="true" />
              {card.flow.map((f, s) => {
                const Icon = STATION[s]
                return (
                  <span key={f} className={`fx__station fx__station--${s + 1}`} aria-hidden="true">
                    <span className="fx__node">
                      <Icon />
                      {s === 2 ? <b className="fx__ok" /> : null}
                    </span>
                    <small>{f}</small>
                  </span>
                )
              })}
            </div>
            <div className="fx__text">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
            <div className="fx__measure">
              <p>{c.measureLabel}</p>
              <ul>
                {card.measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <div className="fx__close" data-umm-reveal>
        <ol className="fx__steps">
          {steps.map((s, k) => (
            <li key={s} style={{ '--k': k } as CSSProperties}>
              {s}
            </li>
          ))}
        </ol>
        <p>{c.close.body}</p>
      </div>
    </section>
  )
}
