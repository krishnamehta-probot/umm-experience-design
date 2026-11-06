import { CoolIcon, pad, useCycle, type IconName } from '../glass/kit'
import { audiences } from '@/content/fintech'
import '@/styles/fin-final-audiences.css'

/* ============================================================================
   THE FINAL FINTECH PAGE — 07 · WHO WE WORK WITH (Krish, 6 Nov: "kind of
   simple 4 parts clickable item, see what can you do with that")

   Four panels side by side, one for each kind of institution, in its own
   pastel. The chosen one opens wide: its name, its line, what we do for it,
   and its Cool Shape as a white cut-out turning slowly behind. The others
   close to slim columns with their names standing on end. They step on by
   themselves (paused under the pointer, stopped once one is picked); a panel
   opens on a click, or on focus from the keyboard.

   On phones the panels stack and open downwards. The copy is the final copy.
   ========================================================================== */

const ICON: IconName[] = ['fintech', 'energy', 'real-estate', 'telecom']

export function FinalAudiences() {
  const c = audiences
  const n = c.items.length
  const { i, pick, host } = useCycle<HTMLDivElement>(n, 6200)
  return (
    <section id={c.id} className="fa" aria-labelledby="fa-title">
      <div className="fr__top" data-umm-reveal>
        <div className="fr__head">
          <p className="ff-eyebrow">{c.head.eyebrow}</p>
          <h2 id="fa-title" className="fr__title">
            <span>{c.head.lines[0]}</span>
            <span>
              <span className="ff-blue">{c.head.lines[1]}</span>
            </span>
          </h2>
        </div>
        <p className="fr__lead">{c.head.intro}</p>
      </div>

      <div ref={host} className="fa__row" data-umm-reveal>
        {c.items.map((x, k) => {
          const on = k === i
          return (
            <article key={x.id} className="fa__panel" data-on={on || undefined} data-umm-tone={x.tone}>
              <button
                type="button"
                className="fa__hit"
                aria-expanded={on}
                aria-controls={`fa-${x.id}`}
                onClick={() => pick(k)}
                onFocus={() => pick(k)}
              >
                <span className="fa__num">{pad(k)}</span>
                <span className="fa__label">{x.label}</span>
                <span className="fa__plus" aria-hidden="true" />
              </button>
              <span className="fa__shape" aria-hidden="true">
                <CoolIcon name={ICON[k]} look="single" />
              </span>
              <div className="fa__more" id={`fa-${x.id}`} aria-hidden={!on}>
                <h3>{x.title}</h3>
                <p>{x.body}</p>
              </div>
              <i className="fa__bar" aria-hidden="true" />
            </article>
          )
        })}
      </div>
    </section>
  )
}
