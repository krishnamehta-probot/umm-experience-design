import { reality } from '@/content/manufacturing'
import { css, pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { useAuto } from './hooks'
import { Head } from './Head'

/* ============================================================================
   THE MANUFACTURING PAGE — 02 · THE REALITY

     top    the eyebrow and the heading on the left, the intro on the right
            (the head every section on the page shares, Head.tsx)
     cards  the three handoffs, each a pastel card with its own drawing
            acting it out: Line 02's plan resequencing round a late part;
            a quality hold travelling slowly down a long line to dispatch,
            which shows stock until it arrives; the machine rebuilt twice,
            its outlines growing out behind it, the manual left behind.
            They deal in one after another as the section arrives
     view   the point of view on an ink strip, drawn: the decision in the
            middle (release the lot, resequence a run, call the buyer, in
            turn), the line running back to the evidence and on to the team
            that acts next
   ========================================================================== */

export function MfgReality() {
  const c = reality
  const v = c.view
  const { i, host } = useAuto<HTMLDivElement>(v.decisions.length, 2600)
  return (
    <section id={c.id} className="mr mf-sec" aria-labelledby="mr-title">
      <Head id="mr-title" head={c.head} />

      <div className="mr__cards">
        {c.cards.map((x, k) => (
          <article key={x.title} className="mr-card" data-tone={x.tone} data-umm-reveal style={css({ '--umm-reveal-delay': `${k * 120}ms` })}>
            <div className="mr-card__art">
              <MfgArt name={x.art} />
            </div>
            <div className="mr-card__text">
              <p className="mr-card__meta">
                <span>{pad(k)}</span>
                {x.tag}
              </p>
              <h3>{x.title}</h3>
              <p>{x.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div ref={host} className="mr__pov" data-umm-reveal>
        <div className="mr__pov-head">
          <p className="ff-glass ff-glass--dark">{v.eyebrow}</p>
          <p className="mr__pov-title">{v.title}</p>
        </div>
        <div className="mr__route" aria-hidden="true">
          <span className="mr__end">{v.sides[0]}</span>
          <i className="mr__wire mr__wire--back" />
          <span className="mr__decision">
            {v.decisions.map((d, k) => (
              <b key={d} data-on={k === i || undefined}>
                {d}
              </b>
            ))}
          </span>
          <i className="mr__wire" />
          <span className="mr__end">{v.sides[1]}</span>
        </div>
        <p className="mr__pov-body">{v.body}</p>
      </div>
    </section>
  )
}
