import { lazy, Suspense } from 'react'
import { SplitButton } from '@/components/primitives'
import { contact } from '@/content/fintech'

const Element3D = lazy(() => import('./Element3D'))

/* ============================================================================
   THE FINAL FINTECH PAGE — 10 · YOUR NEXT CHAPTER (Krish, 6 Nov: "last is
   cta so try to make it match our current vibe")

   The close comes back to where the page began: the hero's studio grey, its
   flower, now in clear glass bending soft pastel light (as section 02's
   elements are), turning slowly on the right; the eyebrow, the heading with
   its second line in blue, the question, and UMM's own button. The flower
   leans after the pointer and swells under it, as in the hero. The copy is
   the final copy.

   (Styles in fin-final-ai.css, with section 09.)
   ========================================================================== */

export function FinalContact() {
  const c = contact
  /* on a narrow screen the words take the foot, so the flower goes up top */
  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  return (
    <section id={c.id} className="fct" aria-labelledby="fct-title">
      <div className="fct__panel" data-umm-reveal>
        <Suspense fallback={null}>
          <Element3D kinds={['flower']} ground="#e4e4e8" at={narrow ? [0.55, 0.24] : [0.74, 0.5]} shadow finish="glass" />
        </Suspense>
        <div className="fct__copy">
          <p className="ff-eyebrow">{c.eyebrow}</p>
          <h2 id="fct-title" className="fct__title">
            <span>{c.lines[0]}</span>
            <span className="ff-blue">{c.lines[1]}</span>
          </h2>
          <p className="fct__body">{c.body}</p>
          <SplitButton href={c.cta.href}>{c.cta.label}</SplitButton>
        </div>
      </div>
    </section>
  )
}
