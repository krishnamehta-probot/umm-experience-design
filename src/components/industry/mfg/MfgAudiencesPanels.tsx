import { audiences } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'
import { useAuto } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 07 · WHO WE WORK WITH, the first version (kept
   as an option, ?audiences=panels; Krish, 12 Nov: "this whole section come
   up with something else", so the page now shows MfgAudiences.tsx)

   "Same order book. Different constraints." Four operating contexts as four
   pastel panels side by side; the one chosen opens wide with its drawing
   (the right revision on the right line; each batch's status; the unit in
   the field; each customer's drawing carried through), its line and what it
   means. The closed ones show their name upright. They step on by
   themselves with a line filling (stopped once one is picked). On a phone they stack, the chosen one open.
   ========================================================================== */

export function MfgAudiencesPanels() {
  const c = audiences
  const { i, pick, host } = useAuto<HTMLDivElement>(c.items.length, 6000)
  return (
    <section id={c.id} className="mu mf-sec" aria-labelledby="mu-title">
      <Head id="mu-title" head={c.head} />
      <div ref={host} className="mu__panels" data-umm-reveal>
        {c.items.map((x, k) => (
          <article key={x.name} className="mu-p" data-tone={x.tone} data-on={k === i || undefined}>
            <h3 className="mu-p__head">
              <button type="button" aria-expanded={k === i} onClick={() => pick(k)}>
                <span className="mu-p__num">{pad(k)}</span>
                <span className="mu-p__name">{x.name}</span>
                <i className="mu-p__plus" aria-hidden="true" />
              </button>
            </h3>
            <div className="mu-p__body" aria-hidden={k !== i}>
              <div className="mu-p__art">
                <MfgArt name={x.art} />
              </div>
              <div className="mu-p__text">
                <p className="mu-p__title">{x.title}</p>
                <p className="mu-p__copy">{x.body}</p>
              </div>
            </div>
            <i className="mu-p__bar" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  )
}
