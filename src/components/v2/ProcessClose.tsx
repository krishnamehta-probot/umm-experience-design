import { useLayoutEffect, useRef } from 'react'
import { Accordion, Marquee, SplitButton } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import { GlassCube } from './GlassCube'
import { Shape } from './Shape'
import type { ShapeName } from './shapes.data'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { closing, faq, meta, nav, process, ribbon } from '@/content/cxUiDesign'

/* ============================================================================
   7 · HOW WE WORK + LET'S TALK

   The five steps first, as one compact row: Designjoy's verb-only names, each
   numbered with a Cool Shapes numeral, joined by a line that draws itself as
   the row scrolls through (scrubbed, not pinned: the page already pins three
   times and the end should feel quick).

   Then the second dark band, laid out like Cal.com's FAQ: the big ask, its
   line and the buttons on the left, the seven questions on the right. That
   puts every buyer worry beside the button that resolves it.

   The ribbon comes back once, small, above the footer, so the page ends the
   way it started.
   ========================================================================== */

const NUMERALS: ShapeName[] = ['number-1', 'number-2', 'number-3', 'number-4', 'number-5']
const STEP_TONES = ['sun', 'sky', 'blossom', 'citrus', 'coral'] as const

export function ProcessClose() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cx-steps__line',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.cx-steps', start: 'top 78%', end: 'bottom 55%', scrub: 0.6 },
        },
      )
      gsap.from('.cx-step', {
        opacity: 0,
        y: 34,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-steps', start: 'top 80%', once: true },
      })
      gsap.from('.cx-step__num', {
        scale: 0.3,
        rotate: -90,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '.cx-steps', start: 'top 80%', once: true },
      })
      gsap.from('.cx-close__copy > *', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-close', start: 'top 70%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref}>
      <section className="umm-section cx-process" id="process">
        <div className="umm-container">
          <div className="cx-head">
            <ChipHead
              line1={process.line1}
              line2={withAccent(process.line2, process.accent)}
              chip={process.chip}
              tone="blossom"
              chipAt="40%"
              tilt={7}
              lineRecipe={0}
              chipRecipe={1}
            />
            <p className="cx-lead">{process.lead}</p>
          </div>

          <ol className="cx-steps">
            <span className="cx-steps__line" aria-hidden="true" />
            {process.steps.map((step, i) => (
              <li className="cx-step" key={step.title} data-umm-tone={STEP_TONES[i]}>
                <span className="cx-step__num" aria-hidden="true">
                  <Shape name={NUMERALS[i]} />
                </span>
                <h3 className="cx-step__title">
                  <span className="umm-sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="cx-step__body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cx-close" id="contact" data-umm-theme="ink">
        <GlassCube className="cx-close__cube" />
        <div className="umm-container cx-close__inner">
          <div className="cx-close__copy">
            <h2 className="cx-close__title">
              <span>{closing.line1}</span> <em>{closing.line2}</em>
            </h2>
            <p className="cx-close__lead">{closing.lead}</p>
            <div className="cx-close__actions">
              <SplitButton href={`mailto:${meta.contactEmail}`}>{closing.primaryCta}</SplitButton>
              <SplitButton href="#work" variant="outline">
                {closing.secondaryCta}
              </SplitButton>
            </div>
          </div>

          <div className="cx-close__faq">
            <p className="cx-close__faq-label">Questions people ask first</p>
            <Accordion
              entries={faq.map((f) => ({ question: f.question, answer: <p>{f.answer}</p> }))}
              defaultOpen={0}
            />
          </div>
        </div>
      </section>

      <footer className="cx-footer" data-umm-theme="ink">
        <div className="cx-footer__ribbon" aria-hidden="true">
          <Marquee items={ribbon} />
        </div>
        <div className="umm-container cx-footer__inner">
          <a className="cx-nav__logo cx-footer__logo" href="#top" aria-label="Unified Modern Minds, back to top">
            umm
          </a>
          <nav className="cx-footer__links" aria-label="Footer">
            {nav.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <p className="cx-footer__meta">
            {meta.locations} · <a href={`mailto:${meta.contactEmail}`}>{meta.contactEmail}</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
