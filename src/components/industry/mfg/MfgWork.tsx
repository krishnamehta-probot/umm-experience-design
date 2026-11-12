import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SplitButton } from '@/components/primitives'
import { work } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'
import { scrollThrough, useProgress } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · RELEVANT WORK

   "Manufacturing work you can see." The section pins and its panels ride
   sideways as the reader scrolls down:

     first   Mohawk Industries on ink: the featured manufacturer, why the
             change reached beyond the line, and its three areas, which are
             also the way to each engagement
     then    the three engagements, each a wide card: on the left its scope
             illustration on its flat pastel (the draft's drawings, drawn
             again in fine line, each playing its engagement through: the
             recovery case stopping at each station as it lights and the
             report filling; a price changed, the quote approved and the
             field app taken offline; the area and the question found and
             answered); on the right the engagement, its line, what UMM did,
             UMM's role, and one action, UMM's own button to the case study
             (Krish, 12 Nov: one CTA, in UMM's branding)
     foot    a progress line and where you are

   On a phone the panels stack, unpinned.
   ========================================================================== */

export function MfgWork() {
  const c = work
  const n = c.cases.length
  const { ref, p } = useProgress<HTMLElement>()
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)

  useEffect(() => {
    const measure = () => {
      const v = view.current
      const t = track.current
      if (v && t) setRun(Math.max(0, t.scrollWidth - v.clientWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    if (view.current) ro.observe(view.current)
    return () => ro.disconnect()
  }, [])

  /* a little rest at each end of the scroll */
  const q = Math.min(1, Math.max(0, (p - 0.04) / 0.92))
  const at = Math.min(n, Math.round(q * n))

  return (
    <section id={c.id} ref={ref} className="mw" style={{ '--n': n } as CSSProperties} aria-labelledby="mw-title">
      <div className="mw__pin">
        <Head id="mw-title" head={c.head} />

        <div ref={view} className="mw__view">
          <div ref={track} className="mw__track" style={{ translate: `${-q * run}px 0` }}>
            <article className="mw-feat">
              <span className="mw-feat__aura" aria-hidden="true" />
              <p className="ff-glass ff-glass--dark">{c.featured.eyebrow}</p>
              <h3 className="mw-feat__name">{c.featured.name}</h3>
              <p className="mw-feat__body">{c.featured.body}</p>
              <ol className="mw-feat__areas">
                {c.featured.areas.map((a, k) => (
                  <li key={a}>
                    <button type="button" onClick={() => scrollThrough(ref.current, 0.04 + ((k + 1) / n) * 0.92)}>
                      <span>{pad(k)}</span>
                      {a}
                      <i aria-hidden="true">→</i>
                    </button>
                  </li>
                ))}
              </ol>
            </article>

            {c.cases.map((x, k) => (
              <article key={x.name} className="mw-case" data-tone={x.tone} data-on={at === k + 1 || undefined}>
                <div className="mw-case__art">
                  <span className="ff-glass mw-case__tag">{x.tag}</span>
                  <MfgArt name={x.art} />
                </div>
                <div className="mw-case__text">
                  <p className="mw-case__k">
                    <span>{pad(k)}</span>
                    {x.eyebrow}
                  </p>
                  <h3>{x.name}</h3>
                  <p className="mw-case__title">{x.title}</p>
                  <p className="mw-case__body">{x.body}</p>
                  <div className="mw-case__role">
                    <p>{c.roleLabel}</p>
                    <ul>
                      {x.role.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <SplitButton className="mw-case__go" href={x.href} target="_blank" rel="noopener">
                    {c.read}
                  </SplitButton>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mw__foot" aria-hidden="true">
          <i className="mw__bar" style={{ '--q': q } as CSSProperties} />
          <span>
            {pad(Math.max(0, at - 1))} <em>/ {pad(n - 1)}</em>
          </span>
        </div>
      </div>
    </section>
  )
}
