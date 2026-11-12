import { useLayoutEffect, useRef, useState } from 'react'
import { audiences } from '@/content/manufacturing'
import { pad } from '../glass/kit'
import { MfgArt } from './MfgArt'
import { Head } from './Head'
import { useAuto } from './hooks'

/* ============================================================================
   THE MANUFACTURING PAGE — 07 · WHO WE WORK WITH (12 Nov, second pass:
   Krish, "this whole section come up with something else")

   "Same order book. Different constraints." Told literally: one belt runs
   through four pastel cards, one per operating context, and the same order
   rides it from station to station. Each card's station is drawn over the
   belt and does its own work while the order is in it:

     discrete      the cell's press puts the right revision on the job
     process       the batch pours, its inspection is in, it is released
     OEMs          the serial plate goes on, the matching spare comes up
     contract      the customer's drawing travels with it, its acceptance
                   criteria checked off one by one

   Every card's words stay readable all the time (no tabs, no hover); the
   order moving through them is the motion. It never waits under the
   pointer. At the last station it leaves along the belt and a new order
   enters at the first. On a phone the cards stack; each still works in turn.

   The previous version, four panels opening wide, is kept as
   MfgAudiencesPanels (?audiences=panels).
   ========================================================================== */

/* the belt runs at y 118 of each station's 150-high drawing */
const BELT = 118 / 150

type Geo = { y: number; xs: number[] }

export function MfgAudiences() {
  const c = audiences
  const n = c.items.length
  const { i, host } = useAuto<HTMLDivElement>(n, 4200)
  const arts = useRef<(HTMLDivElement | null)[]>([])
  const [geo, setGeo] = useState<Geo | null>(null)

  /* each time round, a new order enters at the first station */
  const laps = useRef({ i: 0, n: 0 })
  if (i !== laps.current.i) {
    if (i < laps.current.i) laps.current.n++
    laps.current.i = i
  }

  /* where the belt runs and where each station's work is, in the row */
  useLayoutEffect(() => {
    const row = host.current
    if (!row) return
    const measure = () => {
      const r = row.getBoundingClientRect()
      const first = arts.current[0]
      if (!first || !r.width) return
      const a = first.getBoundingClientRect()
      setGeo({
        y: a.top - r.top + a.height * BELT,
        xs: arts.current.map((el) => {
          const b = el!.getBoundingClientRect()
          return b.left - r.left + b.width / 2
        }),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [host])

  return (
    <section id={c.id} className="mu mf-sec" aria-labelledby="mu-title">
      <Head id="mu-title" head={c.head} />
      <div ref={host} className="mu__row" data-umm-reveal>
        {c.items.map((x, k) => (
          <article key={x.name} className="mu-c" data-tone={x.tone} data-on={k === i || undefined}>
            <div
              className="mu-c__art"
              ref={(el) => {
                arts.current[k] = el
              }}
            >
              <MfgArt name={x.station} />
            </div>
            <div className="mu-c__text">
              <p className="mu-c__k">
                <span>{pad(k)}</span>
                {x.name}
              </p>
              <h3>{x.title}</h3>
              <p className="mu-c__body">{x.body}</p>
            </div>
          </article>
        ))}

        {geo && (
          <>
            <i className="mu__belt" style={{ top: geo.y }} aria-hidden="true" />
            <span
              key={laps.current.n}
              className="mu__order"
              data-last={i === n - 1 || undefined}
              style={{ translate: `${geo.xs[i]}px ${geo.y}px` }}
              aria-hidden="true"
            >
              {c.order}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
