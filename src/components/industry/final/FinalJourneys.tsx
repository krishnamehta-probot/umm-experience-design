import { Arrow, pad, useCycle } from '../glass/kit'
import { journeys } from '@/content/fintech'
import { JourneyArt, type JourneyId } from './JourneyArt'
import '@/styles/fin-final-journeys.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 03 · FINANCIAL JOURNEYS (Krish, 6 Nov: "I like
   the other version of your creation for the third section… sir actually
   likes that kind of section… but not exactly… on the right side nice
   illustrations kind of thing")

   Panel's journeys section, in the final page's language:

     left    the eyebrow, the heading with its second line in blue, the
             intro; the connected view at the foot, level with the list's end
     right   the six journeys as an expanding list; the open one's card holds
             its title, text and points, and beside them its illustration
             (JourneyArt), which plays in as it opens

   The list steps on by itself (paused under the pointer, stopped once one is
   picked), a blue line filling under the open row as it waits. The open card
   has a fixed height, so the section never changes size between journeys.
   The copy is the final copy.
   ========================================================================== */

export function FinalJourneys() {
  const c = journeys
  const { i, pick, host } = useCycle<HTMLOListElement>(c.items.length, 7000)
  return (
    <section id={c.id} className="fj" aria-labelledby="fj-title">
      <div className="fj__intro" data-umm-reveal>
        <div className="fj__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fj-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
          <p className="fj__lead">{c.head.intro}</p>
        </div>
        <div className="fj__view">
          <p className="fj__view-k">{c.view.eyebrow}</p>
          <p>{c.view.body}</p>
        </div>
      </div>

      <ol ref={host} className="fj__list" data-umm-reveal>
        {c.items.map((it, k) => {
          const on = k === i
          return (
            <li key={it.id} className="fj__item" data-on={on || undefined} data-umm-tone={it.tone}>
              <button
                type="button"
                className="fj__row"
                aria-expanded={on}
                aria-controls={`fj-${it.id}`}
                onClick={() => pick(k)}
              >
                <span className="fj__num">{pad(k)}</span>
                <span className="fj__label">{it.label}</span>
                <span className="fj__circle">
                  <Arrow down={on} />
                </span>
                <span className="fj__bar" />
              </button>
              <div className="fj__panel" id={`fj-${it.id}`}>
                <div className="fj__clip">
                  <div className="fj__card">
                    <div className="fj__text">
                      <h3>{it.title}</h3>
                      <p>{it.body}</p>
                      <ul className="fj__ticks">
                        {it.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <JourneyArt id={it.id as JourneyId} tone={it.tone} />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
