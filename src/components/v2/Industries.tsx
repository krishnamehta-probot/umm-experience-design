import { useEffect, useRef, type ComponentType } from 'react'
import type { Tone } from '../primitives'
import { ChipHead, Eyebrow, withAccent } from './ChipHead'
import '@/styles/industries.css'

/* ============================================================================
   INDUSTRIES — where the work makes a difference

   16 Oct: each service page's doc now has a band under its services naming
   the kinds of business it serves (Cloud: three, Engineering: three,
   Growth and UX & Commerce: four). The same band on every page: a chip
   head, then a card per sector, its line in the sector's pastel down the
   left. A page can give each card a small drawing of that sector's system
   (`art`, its own subject); without one the card carries its number.

   17 Oct review: the drawings loop forever, so they are paused while the
   band is off screen (data-live, industries.css), sparing phones dozens of
   running animations.
   ========================================================================== */

export type IndustriesContent = {
  eyebrow: string
  /** the headline; a band without one carries its eyebrow alone */
  line1?: string
  line2?: string
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
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.dataset.live = ''
      return
    }
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.dataset.live = ''
        else delete el.dataset.live
      },
      { rootMargin: '120px 0px' },
    )
    seen.observe(el)
    return () => seen.disconnect()
  }, [])

  return (
    <section className="umm-section cx-ind" aria-labelledby="cx-ind-title" ref={ref}>
      <div className="umm-container">
        <div className="cx-head cx-head--tight">
          {content.line1 && content.line2 ? (
            <ChipHead
              id="cx-ind-title"
              line1={content.line1}
              line2={withAccent(content.line2, content.line2)}
              chip={content.eyebrow}
              tone={tone}
              lineRecipe={1}
            />
          ) : (
            <h2 className="cx-ind__label" id="cx-ind-title">
              <Eyebrow>{content.eyebrow}</Eyebrow>
            </h2>
          )}
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
