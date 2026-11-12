import { lazy, Suspense } from 'react'
import { model } from '@/content/manufacturing'
import { css, pad } from '../glass/kit'
import { Head } from './Head'
import { useAuto } from './hooks'

const Element3D = lazy(() => import('../final/Element3D'))

/* ============================================================================
   THE MANUFACTURING PAGE — 04 · THE NEXT MANUFACTURING MODEL

   "Test the change. Before changing the plant." The opening's line comes
   back with its twin beside it:

     left   the physical plant: the line in UMM's clear glass, stopping at
            its gate
     right  the digital twin: the same line drawn in blue light on a grid
            over flat sky,
            running ahead without stopping, rehearsing
     seam   what passes between them, by step:
              observe   the plant's signals flowing across into the twin
              simulate  three candidate plans compared on the twin, ranked
              act       the feasible plan travelling back to the plant, and
                        the actuals returning
     below  the three steps, stepping on by themselves with a progress line
            (it runs on under the pointer; stops once one is picked). Only
            the step in focus opens its text; the others show their number,
            verb and title
     foot   the industry reference and its two links
   ========================================================================== */

/* the three candidate plans, by how well each meets the delivery dates */
const PLANS = [{ w: 0.62 }, { w: 0.86 }, { w: 0.44 }]

export function MfgModel() {
  const c = model
  const { i, pick, host } = useAuto<HTMLDivElement>(c.steps.length, 5200)
  return (
    <section id={c.id} className="mo mf-sec" aria-labelledby="mo-title">
      <Head id="mo-title" head={c.head} />

      <div ref={host} className="mo__body" data-step={i}>
        <div className="mo__split" data-umm-reveal>
          <div className="ff-tile ff-tile--studio mo__side">
            <Suspense fallback={null}>
              <Element3D kinds={['line']} ground="#e4e4e8" at={[0.5, 0.56]} shadow finish="clear" />
            </Suspense>
            <span className="ff-glass mo__tag">{c.sides[0]}</span>
          </div>

          {/* the seam: signals across, the plan back */}
          <div className="mo__seam" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((k) => (
              <i key={k} className="mo__sig" style={css({ '--k': k })} />
            ))}
            <span className="mo__plan">
              <svg viewBox="0 0 16 16">
                <path d="M4 8.4l2.6 2.6L12 5.4" />
              </svg>
            </span>
          </div>

          <div className="ff-tile mo__side mo__side--twin">
            <Suspense fallback={null}>
              <Element3D kinds={['twin']} ground="#d1e7ff" at={[0.5, 0.56]} />
            </Suspense>
            <span className="ff-glass mo__tag">{c.sides[1]}</span>
            {/* the twin compares three plans and ranks them */}
            <div className="mo__compare" aria-hidden="true">
              {PLANS.map((p, k) => (
                <div key={k} className="mo__opt" data-best={k === 1 || undefined} style={css({ '--w': p.w, '--k': k })}>
                  <b>{String.fromCharCode(65 + k)}</b>
                  <i />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="mo__steps">
          {c.steps.map((s, k) => (
            <li key={s.title} data-on={k === i || undefined}>
              <button type="button" aria-pressed={k === i} onClick={() => pick(k)}>
                <span className="mo__num">{pad(k)}</span>
                <span className="mo__verb">{s.verb}</span>
                <span className="mo__title">{s.title}</span>
                <span className="mo__text">{s.body}</span>
                <i className="mo__bar" />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mo__ref">
        <p className="mo__ref-k">{c.reference.eyebrow}</p>
        <p className="mo__ref-body">{c.reference.body}</p>
        <div className="mo__ref-links">
          {c.reference.links.map((l) => (
            <a key={l.href} className="mf-link" href={l.href} target="_blank" rel="noopener">
              {l.label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
