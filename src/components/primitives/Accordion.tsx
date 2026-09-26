import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { IconPlus } from '../icons'

export type AccordionEntry = {
  question: string
  answer: ReactNode
}

/**
 * Single-open accordion.
 *
 * Height is animated with a `grid-template-rows: 0fr -> 1fr` transition rather
 * than a measured pixel height, so it stays correct through font swaps,
 * resizes and copy changes without any JS measurement.
 *
 * The panel stays mounted and is hidden with `inert` + `hidden="until-found"`
 * semantics via aria, so in-page find still reaches closed answers.
 */
export function Accordion({
  entries,
  defaultOpen = null,
}: {
  entries: AccordionEntry[]
  defaultOpen?: number | null
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const baseId = useId()

  return (
    <div className="umm-accordion">
      {entries.map((entry, i) => {
        const isOpen = open === i
        const triggerId = `${baseId}-t-${i}`
        const panelId = `${baseId}-p-${i}`

        return (
          <div className="umm-accordion__item" data-open={isOpen} key={entry.question}>
            <h3>
              <button
                type="button"
                id={triggerId}
                className="umm-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="umm-accordion__index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="umm-accordion__question">{entry.question}</span>
                <span className="umm-accordion__marker">
                  <IconPlus size={18} />
                </span>
              </button>
            </h3>
            <div
              className="umm-accordion__panel"
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
            >
              <div>
                <div className="umm-accordion__answer">{entry.answer}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
