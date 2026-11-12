import { lazy, Suspense, useEffect, useState } from 'react'
import { MegaNav } from '@/components/home/MegaNav'
import { SplitButton } from '@/components/primitives'
import { Arrow, css } from '../glass/kit'
import { hero } from '@/content/manufacturing'

const Element3D = lazy(() => import('../final/Element3D'))

/* ============================================================================
   THE MANUFACTURING PAGE — 01 · OPENING (Krish, 12 Nov: the new industry
   flow, "full creative mode")

   The Fintech hero's system (the heading left; the lead and UMM's actions
   right; two tiles under them), told as the plant:

     left tile   the production line in UMM's clear glass (the service
                 pages' glass objects) on the studio grey: lots
                 riding the rollers into a quality gate, the line easing to a
                 stop with a lot under the gate while its light sheet scans
                 it and the review light pulses, then running on. The draft's
                 two notes ride on the tile as frosted glass: the quality gate
                 holding Lot 024, "Review required"
     right tile  the planning queue on ink, as the planner's screen: Line
                 02's three orders, each with its slot on the shift under a
                 time axis and the "now" line crossing it. A late part
                 lands, the two orders under review trade places, slots and
                 all, and the plan settles: "2 orders to review"

   (The foot bar, with its pause, was taken out: Krish, 12 Nov, "not
   required at hero section".)

   The 3D leans after the pointer, as everywhere on the industry pages.
   ========================================================================== */

/* the queue: three orders on Line 02's shift, each with its slot on the
   shift (start and length, 0–1 of the shift) */
const ROWS = [
  { id: 'SO-4466', what: 'Carpet tile / 400 m²', x: 0.02, w: 0.4, tone: 'sky', review: false },
  { id: 'SO-4471', what: 'Broadloom / Rev B', x: 0.3, w: 0.36, tone: 'citrus', review: true },
  { id: 'SO-4480', what: 'Underlay / 12 rolls', x: 0.56, w: 0.32, tone: 'blossom', review: true },
]

/* the loop, a phase every 2.4s: steady → the late part lands → the two
   orders under review change places → the plan settles */
const NOTE = ['', 'Late part / PN-7731 / +1 day', 'Resequencing Line 02', 'Plan updated / 2 to review']

function Queue({ phase }: { phase: number }) {
  const swap = phase >= 2
  return (
    <div className="mh-q" data-phase={phase} aria-hidden="true">
      <div className="mh-q__axis">
        <span>Line 02</span>
        <span className="mh-q__ticks">
          {['06:00', '09:00', '12:00', '14:00'].map((h) => (
            <i key={h}>{h}</i>
          ))}
        </span>
      </div>
      <div className="mh-q__rows">
        {ROWS.map((r, k) => {
          /* the two under review trade places, slots and all */
          const row = swap && r.review ? (k === 1 ? 2 : 1) : k
          const x = swap && r.review ? (k === 1 ? 0.54 : 0.28) : r.x
          return (
            <div key={r.id} className="mh-q__row" data-review={r.review || undefined} style={css({ '--r': row, '--k': k })}>
              <span className="mh-q__id">
                <b>{r.id}</b>
                <small>{r.what}</small>
              </span>
              <span className="mh-q__track">
                <i className={`mh-q__slot mh-q__slot--${r.tone}`} style={css({ '--x': x, '--w': r.w })} />
              </span>
              <span className="mh-q__state">{r.review ? 'Review' : 'Ready'}</span>
            </div>
          )
        })}
        <i className="mh-q__now" />
      </div>
      <p className="mh-q__note" key={phase} data-on={phase > 0 || undefined}>
        <i />
        {NOTE[phase] || NOTE[3]}
      </p>
    </div>
  )
}

export function MfgHero() {
  const c = hero
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setPhase((v) => (v + 1) % 4), 2400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="mh" aria-labelledby="mh-title">
      <MegaNav />
      <div className="mh__in">
        <div className="mh__top">
          <div className="mh__head">
            <p className="ff-eyebrow">{c.eyebrow}</p>
            <h1 id="mh-title" className="mh__title">
              <span className="ff-up" style={css({ '--i': 0 })}>
                <span>{c.lines[0]}</span>
              </span>
              <span className="ff-up" style={css({ '--i': 1 })}>
                <span className="ff-blue">{c.lines[1]}</span>
              </span>
            </h1>
          </div>
          <div className="mh__side">
            <p className="mh__lead">{c.lead}</p>
            <div className="mh__actions">
              <SplitButton href={c.primary.href}>{c.primary.label}</SplitButton>
              <div className="mh__links">
                {c.links.map((l, k) => (
                  <a key={l.href} className="mh__link" href={l.href}>
                    {l.label}
                    <span aria-hidden="true">{k === 0 ? '↓' : '↗'}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mh__tiles">
          <div className="ff-tile ff-tile--studio mh__line">
            <Suspense fallback={null}>
              <Element3D kinds={['line']} ground="#e4e4e8" at={[0.52, 0.56]} shadow finish="clear" />
            </Suspense>
            <div className="mh__chip mh__chip--gate">
              <span className="mh__chip-k">{c.chips[0].label}</span>
              <span className="mh__chip-v">
                <i className="mh__pulse" />
                {c.chips[0].value}
              </span>
            </div>
            <p className="mh__caption">{c.caption}</p>
          </div>

          <div className="ff-tile ff-tile--ink mh__queue">
            <div className="mh__queue-head">
              <span className="ff-glass ff-glass--dark">{c.chips[1].label}</span>
            </div>
            <Queue phase={phase} />
            <div className="ff-tile__foot">
              <p className="ff-tile__line">{c.chips[1].value}</p>
              <a className="ff-orb" href={c.links[0].href} aria-label={c.links[0].label}>
                <Arrow />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
