import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import { industries as cloudIndustries } from '@/content/cloudData'
import '@/styles/cloud-net.css'

/* ============================================================================
   CLOUD & DATA · WHERE THE FOUNDATION MAKES A DIFFERENCE

   16 Oct, new in the doc: under the services, three kinds of business and
   what a connected foundation gives each. Three cards on white, each with
   its sector's picture drawn as a small system: buildings on one network,
   a plant linked to its depots, locations feeding one view. Each card's
   lines carry a packet of data, slowly.
   ========================================================================== */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Property & Living: three buildings on one line */
const Property = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 56V26h18v30M32 56V14h22v42M60 56V30h16v26" />
      <path d="M14 34h6M14 42h6M38 22h10M38 30h10M38 38h10M66 38h4M66 46h4" />
      <path className="cd-ind__wire" d="M4 60h108" />
      <path d="M84 56V40l10-8 10 8v16" />
    </g>
    <circle className="cd-ind__packet" r="2.6" cy="60" cx="0" />
  </svg>
)

/** Manufacturing & Distribution: a plant linked to two depots */
const Plant = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M8 56V30l12 8v-8l12 8v-8l12 8v18z" />
      <path d="M38 30V12h6v18" />
      <path className="cd-ind__wire" d="M44 44C62 44 66 22 84 22M44 50c18 0 22 12 40 12" />
      <rect x="86" y="14" width="22" height="16" rx="3" />
      <rect x="86" y="48" width="22" height="14" rx="3" />
    </g>
    <circle className="cd-ind__packet cd-ind__packet--curve" r="2.6" cx="0" cy="0" />
  </svg>
)

/** Multi-location businesses: three pins feeding one view */
const Locations = () => (
  <svg viewBox="0 0 120 64" aria-hidden="true">
    <g {...STROKE}>
      <path d="M14 26c0-5 4-9 9-9s9 4 9 9c0 7-9 14-9 14s-9-7-9-14z" />
      <path d="M14 52c0-4 3-7 7-7s7 3 7 7c0 5-7 10-7 10" />
      <path d="M40 12c0-4 3-7 7-7s7 3 7 7c0 5-7 10-7 10s-7-5-7-10z" />
      <path className="cd-ind__wire" d="M30 32h38M27 54h41M50 22c8 0 10 10 18 10" />
      <rect x="70" y="18" width="42" height="40" rx="5" />
      <path d="M78 48V38M86 48V30M94 48V34M102 48V26" />
    </g>
  </svg>
)

const ART = [Property, Plant, Locations]

export function Industries({ content = cloudIndustries }: { content?: typeof cloudIndustries }) {
  return (
    <section className="umm-section cd-ind" aria-labelledby="cd-ind-title">
      <div className="umm-container">
        <div className="cx-head cx-head--tight">
          <ChipHead
            id="cd-ind-title"
            line1={content.line1}
            line2={withAccent(content.line2, content.line2)}
            chip={content.eyebrow}
            tone="citrus"
            lineRecipe={1}
          />
        </div>
        <ul className="cd-ind__grid">
          {content.items.map((item, i) => {
            const Art = ART[i % ART.length]
            return (
              <li key={item.sector} className="cd-ind__card" data-umm-tone={item.tone}>
                <span className="cd-ind__art">
                  <Art />
                </span>
                <span className="cd-ind__sector">{item.sector}</span>
                <h3 className="cd-ind__title">{item.title}</h3>
                <p className="cd-ind__body">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
