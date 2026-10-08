import { useLayoutEffect, useRef } from 'react'
import { Accordion, Marquee, SplitButton } from '../primitives'
import { Eyebrow } from './ChipHead'
import { GlassCube } from './GlassCube'
import { Roadmap } from './Roadmap'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { closing, faq, meta, nav, ribbon } from '@/content/cxUiDesign'

/* ============================================================================
   7 · HOW WE WORK + LET'S TALK

   The four stages are a roadmap (Roadmap.tsx). Then the dark band rises over
   the end of it with rounded shoulders, laid out like Cal.com's FAQ: the big
   ask, its line and the buttons on the left, the seven questions on the
   right. The footer closes on the ribbon and a full-width wordmark.
   ========================================================================== */

export function ProcessClose() {
  const ref = useRef<HTMLDivElement>(null)

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
      <Roadmap />

      <section className="cx-close" id="contact" data-umm-theme="ink">
        <GlassCube className="cx-close__cube" />
        <div className="umm-container cx-close__inner">
          <div className="cx-close__copy">
            <Eyebrow className="cx-close__eyebrow">{closing.eyebrow}</Eyebrow>
            <h2 className="cx-close__title">
              {closing.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span>
                <em className="cx-h__chip" data-umm-tone="citrus">
                  {closing.accent}
                </em>
              </span>
            </h2>
            <p className="cx-close__lead">{closing.lead}</p>
            <div className="cx-close__actions">
              <SplitButton href={closing.primaryCta.href} target="_blank" rel="noreferrer">
                {closing.primaryCta.label}
              </SplitButton>
              <SplitButton href={closing.secondaryCta.href} variant="outline">
                {closing.secondaryCta.label}
              </SplitButton>
            </div>
          </div>

          <div className="cx-close__faq">
            <p className="cx-close__faq-label">{closing.faqLabel}</p>
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
