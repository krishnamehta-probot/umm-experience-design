import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { hero } from '@/content/cxUiDesign'

/* three.js is the heaviest thing on the page: it loads on its own, after the
   headline has painted */
const GlassCube3D = lazy(() => import('./GlassCube3D'))

/* ============================================================================
   1 · HERO — the AI & Automation artifact's arrangement

   Big headline top-left, the round black CTA pulled right and overlapping the
   headline's last line, and the paragraph right-aligned beneath it on the
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
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .from('.cx-hero__line > span', { yPercent: 112, duration: 1.05, stagger: 0.11, ease: 'power4.out' })
        .from('.cx-hero__chip', { opacity: 0, scale: 0.55, rotate: '+=24', duration: 0.75, ease: 'back.out(2)' }, '-=.55')
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
      <div className="cx-hero__cube" aria-hidden="true">
        <Suspense fallback={null}>
          <GlassCube3D coveredBy="#why" />
        </Suspense>
      </div>

      <div className="umm-container cx-hero__wrap">
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
              </span>{' '}
              {hero.tail}
            </span>
          </span>
        </h1>

        <a className="cx-hero__cta" href="#contact" aria-label={hero.primaryCta}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>

        <p className="cx-hero__lead">{hero.lead}</p>
      </div>
    </section>
  )
}
