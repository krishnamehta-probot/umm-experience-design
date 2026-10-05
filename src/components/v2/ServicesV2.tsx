import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconArrowUpRight } from '../icons'
import { LottieMark } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { services, type ServiceMark } from '@/content/cxUiDesign'

import compass from '@/lottie/compass.json'
import journey from '@/lottie/journey.json'
import design from '@/lottie/design.json'
import brand from '@/lottie/brand.json'
import data from '@/lottie/data.json'
import measure from '@/lottie/measure.json'

/* ============================================================================
   4 · WHAT WE DO — six services, all at once

   Pastel cards on a white ground, each with a live mark: a short Lottie loop
   that acts out the service (a bearing taken, a route walked, a row chosen,
   a brand tried on, four sources arriving as one, a line held to a target).
   All six are on screen together, because the question a reader brings here
   is about the whole set.

   The bottom-right corner of every card is bitten out, and the arrow sits in
   the bite: it goes straight to the case study, so sections 3 and 4 point at
   each other. The middle column hangs a step lower than its neighbours, which
   keeps a grid of six from reading as a spreadsheet.

   The marks only run while the grid is near the screen; scrolled away, each
   player is destroyed rather than paused, so the rest of the page pays
   nothing for them. Only the marks and the arrow move; the text never does,
   so it is always readable (the Google "The Web Can Do What" rule).
   ========================================================================== */

const MARKS: Record<ServiceMark, unknown> = { compass, journey, design, brand, data, measure }

/** Where the arrow goes when a service has no case study picked yet. */
const FALLBACK = { label: 'Talk to us', href: '#contact' }

export function ServicesV2() {
  const ref = useRef<HTMLElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const node = grid.current
    if (!node) return
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      rootMargin: '240px 0px',
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

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
      gsap.from('.cx-svc__go-mark', {
        scale: 0,
        rotate: -90,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2.4)',
        delay: 0.5,
        /* hand the transform back to CSS, or the hover turn never shows */
        clearProps: 'transform',
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

        <ul className="cx-svc__grid" ref={grid}>
          {services.items.map((s, i) => {
            const go = s.seeIt ?? FALLBACK
            const external = /^https?:/.test(go.href)
            return (
              <li className="cx-svc" key={s.title} data-umm-tone={s.tone}>
                <div className="cx-svc__top">
                  <span className="cx-svc__index">
                    {String(i + 1).padStart(2, '0')} / {String(services.items.length).padStart(2, '0')}
                  </span>
                  <LottieMark data={MARKS[s.mark]} playing={live} className="cx-svc__mark" />
                </div>
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

                <span className="cx-svc__notch" aria-hidden="true" />
                <a
                  className="cx-svc__go"
                  href={go.href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span className="cx-svc__go-label">
                    {s.seeIt ? (
                      <>
                        See it in <strong>{s.seeIt.label}</strong>
                      </>
                    ) : (
                      go.label
                    )}
                  </span>
                  <span className="cx-svc__go-mark">
                    <IconArrowUpRight size={18} strokeWidth={2} />
                  </span>
                </a>
              </li>
            )
          })}
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
