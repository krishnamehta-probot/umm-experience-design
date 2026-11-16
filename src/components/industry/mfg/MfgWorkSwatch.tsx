import type { CSSProperties } from 'react'
import { work } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { Head } from './Head'
import { useAuto } from './hooks'
import { CaseCard, Weave } from './WorkParts'

/* ============================================================================
   THE MANUFACTURING PAGE — 06 · RELEVANT WORK, option: the swatch book
   (?work=swatch; Krish, 16 Nov: "make it interactive that it
   can be remembered")

   Mohawk makes floors, so its three engagements are samples in a swatch
   book, pinned at the foot like a fan deck. The book fans open as the
   section arrives; each sample is its engagement's pastel woven in its own
   construction (loop pile, twill, basket) with a label below. The sample
   in hand is pulled out of the fan and its engagement opens beside it. The
   book turns to the next sample by itself until the reader picks one.
   ========================================================================== */

export function MfgWorkSwatch() {
  const c = work
  const n = c.cases.length
  const { i, pick, host } = useAuto<HTMLDivElement>(n, 6000)
  return (
    <section id={c.id} className="wsw mf-sec" aria-labelledby="mw-title">
      <Head id="mw-title" head={c.head} />
      <div ref={host} className="wsw__body" data-umm-reveal>
        <div className="wsw__book">
          <p className="wsw__plate">
            <img src={c.featured.logo} alt="Mohawk" />
            <span>{c.book}</span>
          </p>
          <div className="wsw__fan" style={{ '--px': `${50 - ((n - 1) / 2 - i) * 18}%` } as CSSProperties}>
            {c.cases.map((x, k) => (
              <button
                key={x.name}
                type="button"
                className="wsw__strip"
                data-tone={x.tone}
                data-on={k === i || undefined}
                aria-pressed={k === i}
                style={{ '--a': k - i, zIndex: n - Math.abs(k - i) } as CSSProperties}
                onClick={() => pick(k)}
              >
                <span className="wsw__face">
                  <Weave kind={x.weave} />
                </span>
                <span className="wsw__label">
                  <small>
                    Mohawk / No. {pad(k)}
                  </small>
                  <b>{x.name.replace('Mohawk ', '')}</b>
                  <em>{x.eyebrow}</em>
                </span>
              </button>
            ))}
            <i className="wsw__pivot" aria-hidden="true" />
          </div>
        </div>
        <div className="wsw__case">
          <CaseCard key={i} x={c.cases[i]} k={i} />
        </div>
      </div>
    </section>
  )
}
