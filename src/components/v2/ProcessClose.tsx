import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Accordion, Marquee, SplitButton } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import { GlassCube } from './GlassCube'
import { Shape } from './Shape'
import type { ShapeName } from './shapes.data'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { closing, faq, meta, nav, process, ribbon } from '@/content/cxUiDesign'

/* ============================================================================
   7 · HOW WE WORK + LET'S TALK

   The five steps are five big squares, dealt onto a pile. The section pins
   and each step is a magnetic stop (lib/useMagneticStops): the next square
   slides up from below the screen and lands on top, the ones before it sink
   back into the pile (smaller, tilted, shaded), and the list on the left
   counts along. Each square is its step's brand colour deepening across the
   card, with the step's Cool Shapes numeral large in its deep shade.

   Phones and reduced motion: nothing pins; the squares stack as you scroll
   (each sticks a little below the last), so the pile still builds.

   Then the dark band rises over the end of the pile with rounded shoulders,
   laid out like Cal.com's FAQ: the big ask, its line and the buttons on the
   left, the seven questions on the right. The footer closes on the ribbon
   and a full-width wordmark.
   ========================================================================== */

const NUMERALS: ShapeName[] = ['number-1', 'number-2', 'number-3', 'number-4', 'number-5']
const STEP_TONES = ['sun', 'sky', 'blossom', 'citrus', 'coral'] as const

const STEPS = process.steps.length

export function ProcessClose() {
  const ref = useRef<HTMLDivElement>(null)
  const { ref: deckRef, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = pinMode ? stopAt(progress, STEPS) : STEPS - 1
  const glideTo = useMagneticStops(deckRef, STEPS, pinMode)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cx-close__title > *', {
        yPercent: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.cx-close', start: 'top 72%', once: true },
      })
      gsap.from('.cx-close__copy > :not(.cx-close__title)', {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.25,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-close', start: 'top 72%', once: true },
      })
      gsap.from('.cx-close__faq .umm-accordion__item', {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cx-close__faq', start: 'top 78%', once: true },
      })
      gsap.from('.cx-footer__word span', {
        yPercent: 100,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.cx-footer__word', start: 'top 95%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref}>
      <section
        className="umm-section umm-pin cx-deck"
        id="process"
        ref={deckRef}
        data-mode={pinMode ? 'scroll' : 'stack'}
        style={{ ['--umm-pin-steps' as string]: STEPS }}
      >
        <div className="umm-pin__stage">
          <div className="umm-container cx-deck__inner">
            <div className="cx-deck__copy">
              <div className="cx-head cx-head--tight">
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

              {pinMode ? (
                <ol className="cx-deck__index">
                  {process.steps.map((step, i) => (
                    <li key={step.title}>
                      <button
                        type="button"
                        onClick={() => glideTo(i)}
                        data-on={i === stop}
                        data-done={i < stop}
                        data-umm-tone={STEP_TONES[i]}
                        aria-current={i === stop ? 'step' : undefined}
                      >
                        <span className="cx-deck__dot" aria-hidden="true" />
                        <span className="cx-deck__n">{String(i + 1).padStart(2, '0')}</span>
                        {step.title}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <ol className="cx-deck__pile">
              {process.steps.map((step, i) => {
                const d = i - stop
                return (
                  <li
                    className="cx-sq"
                    key={step.title}
                    data-ramp={STEP_TONES[i]}
                    data-state={d > 0 ? 'next' : d === 0 ? 'top' : 'under'}
                    data-far={d > 1 || d < -3 || undefined}
                    inert={pinMode && d !== 0}
                    style={
                      {
                        '--d': d,
                        '--i': i,
                        '--tilt': i % 2 ? 1 : -1,
                        zIndex: i + 1,
                      } as CSSProperties
                    }
                  >
                    <div className="cx-sq__face">
                      <span className="cx-sq__step">
                        Step {String(i + 1).padStart(2, '0')}
                        <span> / {String(STEPS).padStart(2, '0')}</span>
                      </span>
                      <span className="cx-sq__num" aria-hidden="true">
                        <Shape name={NUMERALS[i]} />
                      </span>
                      <h3 className="cx-sq__title">
                        <span className="umm-sr-only">Step {i + 1}: </span>
                        {step.title}
                      </h3>
                      <p className="cx-sq__body">{step.body}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
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
        <p className="cx-footer__word" aria-hidden="true">
          <span>u</span>
          <span>m</span>
          <span>m</span>
        </p>
      </footer>
    </div>
  )
}
