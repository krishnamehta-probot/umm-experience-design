import { useLayoutEffect, useRef } from 'react'
import { IconArrowUpRight } from '../icons'
import { ChipHead, withAccent } from './ChipHead'
import { Shape } from './Shape'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { services } from '@/content/cxUiDesign'

/* ============================================================================
   4 · WHAT WE DO — six services, all at once

   Pastel tiles with a bold shape, the Truus recipe from the reference board:
   each card is one flat brand colour with a solid ink silhouette and three
   short lines that answer "when would I need this, what do you do, what do I
   walk away with". All six are on screen together, because the question a
   reader brings here is about the whole set.

   The "See it in" link is a tilted sticker hanging off the card's edge and
   goes straight to the case study, so sections 3 and 4 point at each other.
   Only the shape moves on hover; the text never does, so it is always
   readable (the Google "The Web Can Do What" rule).
   ========================================================================== */

export function ServicesV2() {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cx-svc', {
        opacity: 0,
        y: 60,
        rotate: (i: number) => [-4, 3, -2, 4, -3, 2][i % 6],
        duration: 0.9,
        stagger: { each: 0.08, grid: 'auto', from: 'start' },
        ease: 'back.out(1.3)',
        scrollTrigger: { trigger: '.cx-svc__grid', start: 'top 80%', once: true },
      })
      gsap.from('.cx-svc__sticker', {
        opacity: 0,
        scale: 0.4,
        rotate: '+=30',
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2.4)',
        delay: 0.5,
        scrollTrigger: { trigger: '.cx-svc__grid', start: 'top 80%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="umm-section cx-svcs" id="services" ref={ref}>
      <div className="umm-container">
        <div className="cx-head">
          <ChipHead
            line1={services.line1}
            line2={withAccent(services.line2, services.accent)}
            chip={services.chip}
            tone="sun"
            chipAt="74%"
            tilt={8}
            lineRecipe={1}
            chipRecipe={1}
          />
          <p className="cx-lead">{services.lead}</p>
        </div>

        <ul className="cx-svc__grid">
          {services.items.map((s) => (
            <li className="cx-svc" key={s.title} data-umm-tone={s.tone}>
              <Shape name={s.shape} className="cx-svc__shape" />
              <h3 className="cx-svc__title">{s.title}</h3>
              <dl className="cx-svc__lines">
                <div>
                  <dt>You need this when</dt>
                  <dd>{s.when}</dd>
                </div>
                <div>
                  <dt>What we do</dt>
                  <dd>{s.what}</dd>
                </div>
                <div>
                  <dt>What you get</dt>
                  <dd>{s.get}</dd>
                </div>
              </dl>
              {s.seeIt ? (
                <a className="cx-svc__sticker" href={s.seeIt.href} target="_blank" rel="noreferrer">
                  See it in: {s.seeIt.label}
                  <IconArrowUpRight size={14} strokeWidth={2.2} />
                </a>
              ) : null}
            </li>
          ))}
        </ul>

        <aside className="cx-signpost">
          <span className="cx-signpost__mark" aria-hidden="true">
            <IconArrowUpRight size={18} strokeWidth={1.9} />
          </span>
          <p>
            <strong>{services.signpost.question}</strong> {services.signpost.before}{' '}
            {services.signpost.href ? (
              <a href={services.signpost.href}>{services.signpost.page}</a>
            ) : (
              <em>{services.signpost.page}</em>
            )}{' '}
            {services.signpost.after}
          </p>
        </aside>
      </div>
    </section>
  )
}
