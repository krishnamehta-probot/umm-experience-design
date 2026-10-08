import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import { SplitButton } from '../primitives'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { hero } from '@/content/cxUiDesign'

/* three.js is the heaviest thing on the page: it loads on its own, after the
   headline has painted */
const GlassCube3D = lazy(() => import('./GlassCube3D'))

const SHOW_ACTIONS = false

/* ============================================================================
   1 · HERO — the AI & Automation artifact's arrangement

   Big headline top-left, the round black CTA pulled right and overlapping the
   headline's last line (on hover its arrow flies out and a new one flies in), and the paragraph right-aligned beneath it on the
   CTA's right edge, so the CTA and the copy read as one column.

   The hero holds still (sticky) while the dark Why section rises over it; the
   ribbon on that section's top edge is already visible along the bottom of
   this first screen (see RibbonCurtain). As the black rises, the hero sinks
   back a little, so the wipe has depth rather than being a flat slide.
   ========================================================================== */

export function HeroV2() {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    /* the lines clip only while they rise; after that nothing may crop the
       tilted chip */
    const settle = () => el.querySelector('.cx-hero__title')?.classList.add('is-in')
    if (prefersReducedMotion()) {
      settle()
      return
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15, onComplete: settle })
        .from('.cx-hero__eyebrow', {
          opacity: 0,
          y: 10,
          duration: 0.7,
          ease: 'power3.out',
        })
        .from('.cx-hero__line > span', { yPercent: 112, duration: 1.05, stagger: 0.11, ease: 'power4.out' }, '-=.45')
        .from(
          '.cx-hero__chip',
          {
            opacity: 0,
            scale: 0.55,
            rotate: '+=24',
            duration: 0.75,
            ease: 'back.out(2)',
          },
          '-=.55',
        )
        .from('.cx-hero__cta', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(1.7)' }, '-=.6')
        .from('.cx-hero__lead', { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out' }, '-=.5')

      /* The hero sinks back as the black rises over it. Measured in scroll
         distance rather than off #why's edges: the curtain is already on the
         first screen, so an edge-based start would begin the sink at load. */
      gsap.to(['.cx-hero__wrap', '.cx-hero__cube'], {
        scale: 0.93,
        opacity: 0.35,
        transformOrigin: '50% 30%',
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: () => {
            const why = document.getElementById('why')
            return why ? why.getBoundingClientRect().top + window.scrollY : window.innerHeight
          },
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="cx-hero" id="top" ref={ref} aria-labelledby="cx-hero-title">
      <div className="cx-hero__cube">
        <div className="cx-hero__cube-slot" aria-hidden="true">
          <Suspense fallback={null}>
            <GlassCube3D coveredBy="#why" />
          </Suspense>
        </div>
      </div>

      <div className="umm-container cx-hero__wrap">
        <p className="cx-hero__eyebrow">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
          </svg>
          {hero.eyebrow}
        </p>

        <div className="cx-hero__block">
          <div className="cx-hero__head">
            <h1 className="cx-hero__title" id="cx-hero-title">
              {hero.lines.map((line) => (
                <span className="cx-hero__line" key={line}>
                  <span>{line}</span>
                </span>
              ))}
              <span className="cx-hero__line">
                <span>
                  <span className="cx-hero__chip" data-umm-tone="blossom">
                    {hero.accent}
                  </span>
                  {hero.tail ? ` ${hero.tail}` : null}
                </span>
              </span>
            </h1>

            <a className="cx-hero__cta" href="#contact" aria-label={hero.primaryCta}>
              {/* two arrows: on hover the first leaves through the top right and
              the second comes in from the bottom left */}
              {[0, 1].map((k) => (
                <svg
                  key={k}
                  className={k ? 'cx-hero__cta-in' : 'cx-hero__cta-out'}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              ))}
            </a>
          </div>

          <div className="cx-hero__copy">
            <p className="cx-hero__lead">{hero.lead}</p>

            {/* Krish, 8 Oct: the two buttons are hidden for now; the round CTA
              above carries the action. Restore by setting SHOW_ACTIONS. */}
            {SHOW_ACTIONS ? (
              <div className="cx-hero__actions">
                <SplitButton href="#contact">{hero.primaryCta}</SplitButton>
                <SplitButton href="#work" variant="outline">
                  {hero.secondaryCta}
                </SplitButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
