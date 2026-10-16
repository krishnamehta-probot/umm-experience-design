import type { CSSProperties } from 'react'
import { ChipHead, withAccent } from '@/components/v2/ChipHead'
import { discovery as discovery0, gensify as gensify0, type DiscoveryChannel } from '@/content/growth'
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
   ========================================================================== */

export function Gensify({ content = gensify0 }: { content?: typeof gensify0 }) {
  return (
    <section className="umm-section gx-gen" aria-labelledby="gx-gen-title">
      <div className="umm-container">
        <article className="gx-gen__card">
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

/** The place each channel gets a brand found, drawn small. */
function Place({ id }: { id: DiscoveryChannel['id'] }) {
  if (id === 'seo')
    return (
      <div className="gx-place gx-place--seo" aria-hidden="true">
        <span className="gx-place__bar">
          <i className="gx-place__glass" />
        </span>
        <span className="gx-place__hit">
          <b />
          <i />
          <i />
        </span>
        <span className="gx-place__row">
          <b />
          <i />
        </span>
      </div>
    )
  if (id === 'ads')
    return (
      <div className="gx-place gx-place--ads" aria-hidden="true">
        <span className="gx-place__bar">
          <i className="gx-place__glass" />
        </span>
        <span className="gx-place__hit">
          <em />
          <b />
          <i />
        </span>
        <span className="gx-place__row">
          <b />
          <i />
        </span>
      </div>
    )
  if (id === 'aeo')
    return (
      <div className="gx-place gx-place--aeo" aria-hidden="true">
        <span className="gx-place__q">?</span>
        <span className="gx-place__answer">
          <b />
          <i />
          <i />
          <i />
        </span>
      </div>
    )
  return (
    <div className="gx-place gx-place--llmo" aria-hidden="true">
      <span className="gx-place__ask">
        <i />
      </span>
      <span className="gx-place__reply">
        <span className="gx-place__spark" />
        <span className="gx-place__lines">
          <i />
          <i />
          <i />
        </span>
        <span className="gx-place__cite">1</span>
      </span>
    </div>
  )
}

export function Discovery({ content = discovery0 }: { content?: typeof discovery0 }) {
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
        <ul className="gx-disc__grid">
          {content.channels.map((c) => (
            <li key={c.id} className="gx-disc__card" data-umm-tone={c.tone}>
              <Place id={c.id} />
              <span className="gx-disc__label">{c.label}</span>
              <h3 className="gx-disc__title">{c.title}</h3>
              <p className="gx-disc__body">{c.body}</p>
              <ul className="gx-disc__points">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <a className="gx-disc__cta" href="https://umm.digital/contact/">
                {c.cta}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <p className="gx-disc__note">{content.note}</p>
      </div>
    </section>
  )
}
