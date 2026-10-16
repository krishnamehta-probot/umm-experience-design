import type { CSSProperties, ReactElement } from 'react'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import { aiMoments as moments0, platforms as platforms0 } from '@/content/uxCommerce'
import '@/styles/ux-extras.css'

/* ============================================================================
   UX & DIGITAL COMMERCE · AI MOMENTS AND THE NEXT PLATFORM

   AI where it improves the experience (under the services): three small
   moments, each opening on its own little scene, drawn in CSS and wordless:
   a search filling with the right products, a product's attributes tagged
   and checked before it publishes, a product page writing itself with
   recommendations beside it.

   Your next commerce platform (after the architecture, where the other
   pages have their toolkit): Shopify, Adobe Commerce / Magento and Amazon,
   as three cards, each with a call to discuss it, then the doc's note on
   the platforms we also assess.
   ========================================================================== */

function Scene({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="ux-scene ux-scene--search" aria-hidden="true">
        <span className="ux-scene__bar">
          <i className="ux-scene__glass" />
          <i className="ux-scene__typed" />
        </span>
        <span className="ux-scene__grid">
          {[0, 1, 2].map((k) => (
            <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />
          ))}
        </span>
      </div>
    )
  if (i === 1)
    return (
      <div className="ux-scene ux-scene--catalog" aria-hidden="true">
        <span className="ux-scene__thumb" />
        <span className="ux-scene__tags">
          {[0, 1, 2, 3].map((k) => (
            <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />
          ))}
        </span>
        <span className="ux-scene__ok">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.2 4.2L19 7" />
          </svg>
        </span>
      </div>
    )
  return (
    <div className="ux-scene ux-scene--content" aria-hidden="true">
      <span className="ux-scene__page">
        <span className="ux-scene__thumb" />
        <span className="ux-scene__lines">
          {[0, 1, 2].map((k) => (
            <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />
          ))}
        </span>
      </span>
      <span className="ux-scene__recs">
        {[0, 1].map((k) => (
          <i key={k} style={{ ['--k' as string]: k } as CSSProperties} />
        ))}
      </span>
    </div>
  )
}

export function AiMoments({ content = moments0 }: { content?: typeof moments0 }) {
  return (
    <section className="umm-section ux-ai" aria-labelledby="ux-ai-title">
      <div className="umm-container">
        <div className="cx-head cx-head--tight">
          <ChipHead
            id="ux-ai-title"
            line1={content.line1}
            line2={withAccent(content.line2, content.line2)}
            chip={content.eyebrow}
            tone="blossom"
            lineRecipe={1}
          />
        </div>
        <ul className="ux-ai__grid">
          {content.items.map((m, i) => (
            <li key={m.title} className="ux-ai__card" data-umm-tone={m.tone}>
              <Scene i={i} />
              <span className="ux-ai__step">
                {String(i + 1).padStart(2, '0')} / {m.step}
              </span>
              <h3 className="ux-ai__title">{m.title}</h3>
              <p className="ux-ai__body">{m.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const MARK = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Plain marks for the platforms, not their logos: a bag, a stack of
 *  modules, a storefront. */
const PLATFORM_MARKS: Record<string, ReactElement> = {
  shopify: (
    <svg {...MARK}>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  ),
  adobe: (
    <svg {...MARK}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" />
      <path d="M12 21v-9M4 7.5l8 4.5 8-4.5" />
    </svg>
  ),
  amazon: (
    <svg {...MARK}>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5c0 1.5 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.5 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.3 2.5 2.6 2.5S20 11 20 9.5" />
      <path d="M5.5 12v8h13v-8M10 20v-4.5h4V20" />
    </svg>
  ),
}

export function Platforms({ content = platforms0 }: { content?: typeof platforms0 }) {
  return (
    <section className="umm-section ux-plat" aria-labelledby="ux-plat-title">
      <div className="umm-container">
        <div className="cx-head ux-plat__head">
          <ChipHead
            id="ux-plat-title"
            line1={content.line1}
            line2={withAccent(content.line2, content.line2)}
            chip={content.eyebrow}
            tone="sun"
            lineRecipe={1}
          />
          <p className="cx-lead">{content.lead}</p>
        </div>
        <ul className="ux-plat__grid">
          {content.items.map((p) => (
            <li key={p.id} className="ux-plat__card" data-umm-tone={p.tone}>
              <span className="ux-plat__mark">{PLATFORM_MARKS[p.id]}</span>
              <h3 className="ux-plat__title">{p.title}</h3>
              <p className="ux-plat__body">{p.body}</p>
              <a className="ux-plat__cta" href="https://umm.digital/contact/">
                {p.cta}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <p className="ux-plat__note">{content.note}</p>
      </div>
    </section>
  )
}
