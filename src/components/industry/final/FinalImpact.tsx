import type { CSSProperties } from 'react'
import { pad, splitShift, useCycle } from '../glass/kit'
import { impact } from '@/content/fintech'
import '@/styles/fin-final-impact.css'

/* ============================================================================
   HOW AI IS IMPACTING <INDUSTRY> — a template for every industry page
   (Krish, 6 Nov: "this section is needed to be highlighted more… all
   industry pages will have this thing so that needs to be a kind of more
   impactful templatisation")

   The page's one full dark sheet, so it stands apart from everything around
   it. Every industry writes this section the same way: four shifts, each
   titled "From X to Y.", with what it can change, and a closing word on
   responsibility. The template turns that shape into its motion:

     left    the four areas the shift happens in, stepping on by themselves
             (paused under the pointer, stopped once one is picked), a line
             filling under the one in view
     right   the shift itself: "From X" struck through and dimmed, "to Y."
             rising in light; the explanation; what it can change, lit
     foot    the closing word, under a hairline
     ground  a slow aura that takes on the colour of the shift in view

   Give it another industry's `impact` content and it needs nothing else:
   the areas come from the eyebrows ("01 / Customer relationships"), the
   shifts from the titles (split at " to "), the colours from the tones.
   ========================================================================== */

export type ImpactContent = {
  id: string
  head: { eyebrow: string; lines: readonly string[]; intro: string }
  changeLabel: string
  cards: readonly { eyebrow: string; title: string; body: string; change: string; tone: string }[]
  close: { title: string; body: string }
}

/** "01 / Customer relationships" → ["01", "Customer relationships"] */
function area(eyebrow: string, k: number): [string, string] {
  const at = eyebrow.indexOf(' / ')
  return at < 0 ? [pad(k), eyebrow] : [eyebrow.slice(0, at), eyebrow.slice(at + 3)]
}

export function FinalImpact({ content = impact }: { content?: ImpactContent }) {
  const c = content
  const n = c.cards.length
  const { i, pick, host } = useCycle<HTMLDivElement>(n, 7200)
  const card = c.cards[i]
  const [from, to] = splitShift(card.title)

  return (
    <section id={c.id} className="fi" aria-labelledby="fi-title">
      <div className="fi__in" data-umm-tone={card.tone}>
        <span className="fi__aura" aria-hidden="true">
          <i />
          <i />
        </span>

        <div className="fi__top" data-umm-reveal>
          <div className="fi__head">
            <p className="fi__eyebrow">{c.head.eyebrow}</p>
            <h2 id="fi-title" className="fi__title">
              <span>{c.head.lines[0]}</span>
              <span className="fi__glow">{c.head.lines.slice(1).join(' ')}</span>
            </h2>
          </div>
          <p className="fi__lead">{c.head.intro}</p>
        </div>

        <div ref={host} className="fi__main" data-umm-reveal>
          <ol className="fi__areas">
            {c.cards.map((x, k) => {
              const [num, name] = area(x.eyebrow, k)
              return (
                <li key={x.eyebrow}>
                  <button
                    type="button"
                    aria-pressed={k === i}
                    data-umm-tone={x.tone}
                    onClick={() => pick(k)}
                  >
                    <span>{num}</span>
                    {name}
                    <i />
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="fi__shift" key={card.eyebrow} aria-live="polite">
            {to ? (
              <p className="fi__from">
                <span>{from}</span>
              </p>
            ) : null}
            <p className="fi__to">{to || from}</p>
            <p className="fi__body">{card.body}</p>
            <div className="fi__change" style={{ '--d': '0.9s' } as CSSProperties}>
              <span className="fi__pulse" aria-hidden="true" />
              <p>
                <b>{c.changeLabel}</b>
                {card.change}
              </p>
            </div>
          </div>
        </div>

        <div className="fi__close" data-umm-reveal>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3l7 3v5.4c0 4.4-2.9 8.3-7 9.6-4.1-1.3-7-5.2-7-9.6V6z" />
            <path d="M8.8 12.2l2.2 2.2 4.4-4.6" />
          </svg>
          <b>{c.close.title}</b>
          <p>{c.close.body}</p>
        </div>
      </div>
    </section>
  )
}
