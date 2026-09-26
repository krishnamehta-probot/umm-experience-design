import { useState } from 'react'
import { LottieMark, SectionHead, toneAt, toneVar } from '../primitives'
import { usePinProgress } from '@/lib/usePinProgress'
import { services } from '@/content/experienceDesign'

import compass from '@/lottie/compass.json'
import journey from '@/lottie/journey.json'
import design from '@/lottie/design.json'
import data from '@/lottie/data.json'
import measure from '@/lottie/measure.json'
import operations from '@/lottie/operations.json'

/* ============================================================================
   SERVICES

   Six services, shown three at a time. The section pins; the head sets, the
   first three rise into frame, and then they rise out while the next three
   take their place. Same direction of travel as the journey above it, so the
   page keeps one sense of "forward".

   Each card has a second face. The + opens it: the card fills with its own
   brand colour and shows what you receive, with a mark animating beside it.
   ========================================================================== */

const PER_PAGE = 3
/* Late enough that the first page starts the section genuinely below the fold
   and has to travel in, rather than being there from the top. */
const CARDS_START = 0.34

/* One brand colour per card, walked off the shared tone sequence so the six
   cards land on sun, sky, blossom, citrus, coral, sun without naming a hex. */
const MARKS = [compass, journey, design, data, measure, operations]

/* A card parks, then leaves, and only then is it replaced.

   EXIT_END <= 1 - ENTER_START is the rule that matters: it means the outgoing
   card in a column has completely gone before the incoming one starts. Let the
   two windows overlap and you get two pages of dense type dissolving through
   each other, which reads as a double exposure rather than a change.

   Nothing is lost to the gap because the columns are staggered — while one is
   empty its neighbours are full, so the row turns over as a wave. */
const PARK_IN = 0.38
const PARK_OUT = 0.38
const EXIT_END = 0.5
const ENTER_START = 0.5
/* How far each column lags the one to its left, in lanes. Wide enough that a
   column is alone in changing: its neighbours are still solid while it turns,
   so the row is never three faint cards at once. */
const STAGGER = 0.12

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}

export function Services() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const [open, setOpen] = useState<number | null>(null)

  const pages: (typeof services.items)[number][][] = []
  for (let i = 0; i < services.items.length; i += PER_PAGE) {
    pages.push(services.items.slice(i, i + PER_PAGE))
  }

  /* Deliberately not clamped at zero: a negative lane is what puts the first
     page below the stage waiting to come up. */
  const lane = (progress - CARDS_START) / ((1 - CARDS_START) / pages.length)

  return (
    <section
      className="umm-section umm-pin"
      id="services"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: pages.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner umm-pin__inner--stack">
          <div className="umm-svc__head">
            <SectionHead
              chapter={services.chapter}
              title={
                <>
                  {services.titleLead} {services.titleAccent}
                </>
              }
              lead={services.lead}
            />
          </div>

          <div className="umm-svc__pages">
            {pages.map((page, p) => {
              const pageRel = lane - p

              return (
                <div className="umm-svc__page" key={p}>
                  {page.map((service, j) => {
                    const index = p * PER_PAGE + j
                    const isOpen = open === index

                    /* Each column is a beat behind the one to its left, so the
                       row turns over rather than switching all at once. */
                    const rel = pageRel - j * STAGGER
                    const held = p === pages.length - 1 && rel > 0

                    let t = 0
                    let leaving = false
                    if (!held && rel > PARK_OUT) {
                      t = smooth((rel - PARK_OUT) / (EXIT_END - PARK_OUT))
                      leaving = true
                    } else if (!held && rel < -PARK_IN) {
                      t = smooth((-rel - PARK_IN) / (ENTER_START - PARK_IN))
                    }

                    /* A short lift, not a flight across the viewport. The
                       distance is deliberately less than the card is tall — the
                       fade does the work, the movement only gives it a
                       direction. */
                    const lift = (leaving ? -1 : 1) * t * 74
                    const gone = t >= 1

                    return (
                      <div
                        className="umm-svc__slot"
                        key={service.title}
                        aria-hidden={t > 0.5}
                        style={{
                          ['--lift' as string]: `${lift.toFixed(1)}px`,
                          ['--scale' as string]: 1 - t * 0.045,
                          ['--op' as string]: 1 - t,
                          zIndex: gone ? 0 : Math.round((1 - t) * 10),
                          pointerEvents: t > 0.4 ? 'none' : undefined,
                        }}
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
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
