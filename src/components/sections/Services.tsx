import { useState } from 'react'
import { LottieMark, SectionHead, toneAt, toneVar } from '../primitives'
import { IconArrowUpRight } from '../icons'
import { stagger } from '@/lib/useReveal'
import { services } from '@/content/experienceDesign'

import compass from '@/lottie/compass.json'
import journey from '@/lottie/journey.json'
import design from '@/lottie/design.json'
import data from '@/lottie/data.json'
import measure from '@/lottie/measure.json'
import operations from '@/lottie/operations.json'

/* ============================================================================
   SERVICES

   All six at once, three across and two down.

   This section used to pin and turn: three cards held on a sticky stage, then
   lifted out while the next three rose to replace them. It read well, but it
   answered the wrong question. Somebody arriving here wants to know the shape
   of what we do — how many things, how they differ, which one is theirs — and
   that is a question about the whole set. A page-turn hides half the set to
   dramatise the half it is showing, so the one comparison that matters can
   never actually be made.

   Losing the pin costs the section its scroll choreography, so the arrival
   does the work instead: the grid reveals on a stagger that runs along each
   row, and the cards keep their second face.

   Under the grid sits the scope note. It is not a call to action in the usual
   sense — it exists to send some readers away, to the commerce page, before
   they spend any longer on the wrong one.
   ========================================================================== */

const MARKS = [compass, journey, design, data, measure, operations]

export function Services() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="umm-section umm-section--railed" id="services">
      <div className="umm-container">
        <SectionHead
          chapter={services.chapter}
          title={
            <>
              {services.titleLead} {services.titleAccent}
            </>
          }
          lead={services.lead}
        />

        <div className="umm-svc__grid">
          {services.items.map((service, index) => {
            const isOpen = open === index

            return (
              <div
                className="umm-svc__slot"
                key={service.title}
                data-umm-reveal
                style={stagger(index, 70)}
              >
                <article
                  className="umm-svc"
                  data-open={isOpen}
                  style={{ ['--tone' as string]: toneVar(toneAt(index)) }}
                >
                  <span className="umm-svc__notch" aria-hidden="true" />

                  <div className="umm-svc__face umm-svc__face--front">
                    <h3 className="umm-svc__title">{service.title}</h3>
                    <div className="umm-svc__detail">
                      <span className="umm-svc__label">When you need it</span>
                      <p>{service.when}</p>
                    </div>
                    <div className="umm-svc__detail">
                      <span className="umm-svc__label">What we do</span>
                      <p>{service.what}</p>
                    </div>
                  </div>

                  <div className="umm-svc__face umm-svc__face--back">
                    <span className="umm-svc__label">You receive</span>
                    <p className="umm-svc__receive">{service.receive}</p>
                    <LottieMark data={MARKS[index]} playing={isOpen} />
                  </div>

                  <span className="umm-svc__bar" aria-hidden="true" />
                </article>

                <button
                  type="button"
                  className="umm-svc__toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="umm-sr-only">
                    {isOpen ? 'Hide' : 'Show'} what you receive from{' '}
                    {service.title}
                  </span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h16" />
                    <path className="umm-svc__stem" d="M12 4v16" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        <aside className="umm-scope" data-umm-reveal>
          <span className="umm-scope__mark" aria-hidden="true">
            <IconArrowUpRight size={20} strokeWidth={1.75} />
          </span>

          <p className="umm-scope__text">
            <strong className="umm-scope__question">
              {services.boundary.question}
            </strong>{' '}
            {services.boundary.before}{' '}
            {services.boundary.href ? (
              <a className="umm-scope__link" href={services.boundary.href}>
                {services.boundary.page}
              </a>
            ) : (
              <em className="umm-scope__page">{services.boundary.page}</em>
            )}{' '}
            {services.boundary.after}
          </p>
        </aside>
      </div>
    </section>
  )
}
