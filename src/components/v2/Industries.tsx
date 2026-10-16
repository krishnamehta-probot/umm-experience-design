import type { ComponentType } from 'react'
import type { Tone } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import '@/styles/industries.css'

/* ============================================================================
   INDUSTRIES — where the work makes a difference

   16 Oct: each service page's doc now has a band under its services naming
   the kinds of business it serves (Cloud: three, Engineering: three,
   Growth and UX & Commerce: four). The same band on every page: a chip
   head, then a card per sector, its line in the sector's pastel down the
   left. A page can give each card a small drawing of that sector's system
   (`art`, its own subject); without one the card carries its number.
   ========================================================================== */

export type IndustriesContent = {
  eyebrow: string
  line1: string
  line2: string
  items: { sector?: string; title?: string; body: string; tone: Tone }[]
}

export function Industries({
  content,
  art,
  tone = 'citrus',
}: {
  content: IndustriesContent
  /** a small drawing per card, in order */
  art?: ComponentType[]
  /** the headline chip's colour */
  tone?: Tone
}) {
  const n = content.items.length
  return (
    <section className="umm-section cx-ind" aria-labelledby="cx-ind-title">
      <div className="umm-container">
        <div className="cx-head cx-head--tight">
          <ChipHead
            id="cx-ind-title"
            line1={content.line1}
            line2={withAccent(content.line2, content.line2)}
            chip={content.eyebrow}
            tone={tone}
            lineRecipe={1}
          />
        </div>
        <ul className="cx-ind__grid" style={{ ['--n' as string]: n }}>
          {content.items.map((item, i) => {
            const Art = art?.[i % art.length]
            return (
              <li key={item.sector ?? item.title} className="cx-ind__card" data-umm-tone={item.tone}>
                {Art ? (
                  <span className="cx-ind__art">
                    <Art />
                  </span>
                ) : (
                  <span className="cx-ind__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {item.sector && <span className="cx-ind__sector">{item.sector}</span>}
                {item.title && <h3 className="cx-ind__title">{item.title}</h3>}
                <p className="cx-ind__body">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
