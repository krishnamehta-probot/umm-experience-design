import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import { FlyArrow } from '@/components/primitives'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { discovery as discovery0, gensify as gensify0, services as services0 } from '@/content/growth'
import { GensifyStage } from './GensifyStage'
import { Place } from './DiscoveryPlaces'
import '@/styles/growth-extras.css'

/* ============================================================================
   INTEGRATED GROWTH · GENSIFY AND SEARCH, ADS & AI DISCOVERY

   16 Oct, new in the doc, both under the six service cards:

   Gensify, the seventh service, as one wide card: what it is on the left;
   on the right the production line it runs, from a shared brief to
   reviewed assets, its six steps lighting one after another as a brief
   travels them, then what the work can include and the call to discuss it.

   Search, ads & AI discovery: SEO, paid ads, AEO and LLMO as four cards.
   Each opens on a small picture of the place it gets a brand found: a
   search result, a sponsored result, an answer box, an AI answer citing
   its source. Then the doc's line on what can and cannot be promised.

   17 Oct, Krish: Gensify should show "all 6 services ... in genz mode", so
   the card now opens on a stage where the six services' own scenes are
   turned into stickers by a passing wand (GensifyStage.tsx). And the
   discovery cards were "too pale": they now stand at the service cards'
   strength, on their full tone, each picture drawn in the services' ink
   and white and playing a small loop (DiscoveryPlaces.tsx).
   ========================================================================== */

export function Gensify({
  content = gensify0,
  crew = services0.items,
}: {
  content?: typeof gensify0
  /** the six services the stage turns Gen-Z */
  crew?: (typeof services0)['items']
}) {
  return (
    <section className="umm-section gx-gen" aria-labelledby="gx-gen-title">
      <div className="umm-container">
        <article className="gx-gen__card">
          <GensifyStage items={crew} />
          <div className="gx-gen__main">
            <span className="gx-gen__step">07 / {content.step}</span>
            <h3 className="gx-gen__title" id="gx-gen-title">
              {content.title}
            </h3>
            <p className="gx-gen__body">{content.body}</p>
            <ul className="gx-gen__tags">
              {content.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="gx-gen__side">
            <p className="gx-gen__label">{content.flowLabel}</p>
            <ol className="gx-gen__flow" style={{ ['--n' as string]: content.flow.length } as CSSProperties}>
              {content.flow.map((f, i) => (
                <li key={f} style={{ ['--i' as string]: i } as CSSProperties}>
                  {f}
                </li>
              ))}
            </ol>
            <p className="gx-gen__note">{content.note}</p>
            <details className="gx-gen__more">
              <summary>{content.includesLabel}</summary>
              <ul>
                {content.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="gx-gen__scope">{content.scope}</p>
            </details>
            <a className="gx-gen__cta" href={content.cta.href}>
              {content.cta.label}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}

export function Discovery({ content = discovery0 }: { content?: typeof discovery0 }) {
  const grid = useRef<HTMLUListElement>(null)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()

  // The pictures play only while the grid is on screen.
  useEffect(() => {
    const node = grid.current
    if (!node) return
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { rootMargin: '-40px 0px' })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <section className="umm-section gx-disc" aria-labelledby="gx-disc-title">
      <div className="umm-container">
        <div className="cx-head gx-disc__head">
          <ChipHead
            id="gx-disc-title"
            line1={content.line1}
            line2={withAccent(content.line2, content.accent)}
            chip={content.eyebrow}
            tone="sky"
            lineRecipe={1}
          />
          <p className="cx-lead">{content.lead}</p>
        </div>
        <ul className="gx-disc__grid" ref={grid} data-live={live || undefined}>
          {content.channels.map((c, i) => (
            <li key={c.id} className="gx-disc__card" data-umm-tone={c.tone}>
              <Place id={c.id} live={live} reduced={reduced} query={content.query} lead={i * 350} />
              <span className="gx-disc__label">{c.label}</span>
              <h3 className="gx-disc__title">{c.title}</h3>
              <p className="gx-disc__body">{c.body}</p>
              <ul className="gx-disc__points">
                {c.points.map((p) => (
                  <li key={p}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="10" cy="10" r="8.5" />
                      <path d="M6 10.4l2.7 2.6L14.2 7.4" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
              <a className="gx-disc__cta" href="https://umm.digital/contact/">
                <strong>{c.cta}</strong>
                <span className="gx-disc__go">
                  <FlyArrow size={16} strokeWidth={2.2} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="gx-disc__note">{content.note}</p>
      </div>
    </section>
  )
}
