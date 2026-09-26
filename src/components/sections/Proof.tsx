import { useState } from 'react'
import { ButtonLink, Chapter } from '../primitives'
import { iconRegistry } from '../icons'
import { stagger } from '@/lib/useReveal'
import { proof } from '@/content/experienceDesign'

/* ============================================================================
   HOW WE EVIDENCE WORK

   Four deliverables as a numbered list rather than four cards: the colour is
   the edge of the row, and choosing a row pulls that colour across it from
   the edge inward. One row is open at a time, the pointer opens on contact,
   and the keyboard opens on focus — so it responds before it is clicked.

   The argument of the section is that we hand over objects, not metrics. A
   list of objects says that more plainly than a grid of panels does.
   ========================================================================== */

export function Proof() {
  const [open, setOpen] = useState(0)

  return (
    <section className="umm-section umm-section--railed umm-proof" id="proof">
      <div className="umm-container umm-proof__inner">
        <div className="umm-proof__copy" data-umm-reveal>
          <Chapter>{proof.chapter}</Chapter>

          <h2 className="umm-proof__title">
            {proof.titleLead} {proof.titleAccent}
          </h2>

          {proof.paragraphs.map((paragraph) => (
            <p className="umm-proof__text" key={paragraph.slice(0, 32)}>
              {paragraph}
            </p>
          ))}

          <ButtonLink href="#contact" className="umm-proof__cta">
            {proof.cta}
          </ButtonLink>
        </div>

        <ul className="umm-proof__list">
          {proof.artifacts.map((artifact, i) => {
            const Glyph = iconRegistry[artifact.icon]
            const on = open === i
            return (
              <li
                key={artifact.title}
                data-umm-reveal
                style={stagger(i, 80)}
              >
                <button
                  type="button"
                  className="umm-proof__row"
                  data-on={on}
                  aria-expanded={on}
                  onClick={() => setOpen(i)}
                  onMouseEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  style={{ ['--tone' as string]: `var(--umm-${artifact.tone})` }}
                >
                  <span className="umm-proof__wash" aria-hidden="true" />

                  <span className="umm-proof__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="umm-proof__mark" aria-hidden="true">
                    <Glyph size={20} />
                  </span>

                  <span className="umm-proof__lines">
                    <span className="umm-proof__name">{artifact.title}</span>
                    <span className="umm-proof__body">{artifact.body}</span>
                  </span>

                  <span className="umm-proof__edge" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
