import { lazy, Suspense } from 'react'
import { SplitButton } from '@/components/primitives'
import { contact } from '@/content/manufacturing'

const Element3D = lazy(() => import('../final/Element3D'))

/* ============================================================================
   THE MANUFACTURING PAGE — 10 · WORK WITH UMM

   "Which handoff holds your plant back?" The close returns to the opening's
   studio grey: three gears in UMM's clear glass, each handing the turn to the
   next (a handoff that works), turning slowly on the right and leaning
   after the pointer; the draft's note, Line 02's shift plan, on frosted
   glass; the eyebrow, the heading with its second line in blue, the
   question, and UMM's own button.
   ========================================================================== */

export function MfgContact() {
  const c = contact
  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  return (
    <section id={c.id} className="mct" aria-labelledby="mct-title">
      <div className="mct__panel" data-umm-reveal>
        <Suspense fallback={null}>
          <Element3D kinds={['gears']} ground="#e4e4e8" at={narrow ? [0.55, 0.26] : [0.72, 0.5]} shadow finish="clear" />
        </Suspense>
        <span className="ff-glass mct__tag">{c.tag}</span>
        <div className="mct__copy">
          <p className="ff-eyebrow">{c.eyebrow}</p>
          <h2 id="mct-title" className="mct__title">
            <span>{c.lines[0]}</span>
            <span className="ff-blue">{c.lines[1]}</span>
          </h2>
          <p className="mct__body">{c.body}</p>
          <SplitButton href={c.cta.href}>{c.cta.label}</SplitButton>
        </div>
      </div>
    </section>
  )
}
