import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Board,
  SectionHead,
  TabPanel,
  Tabs,
  TickList,
} from '../primitives'
import { iconRegistry } from '../icons'
import { sectors } from '@/content/experienceDesign'

/* ============================================================================
   SECTOR CONTEXT

   The panel is a departure board. Both sectors are mounted at once, stacked in
   a reel inside a slot that shows exactly one of them; changing tab rolls the
   reel up by the height of the one leaving. Old goes out of the top, new comes
   up from the bottom, in a single continuous move — always upward, whichever
   tab you pick, because a board only turns one way.

   The slot's height travels on the same curve as the roll, so a taller sector
   opens the panel as it arrives rather than after it has landed.

   A click during a roll is queued and rolls again on landing, which is what a
   board does too.
   ========================================================================== */

const ID_BASE = 'umm-sectors'
const items = sectors.items
/* One roll. Long enough to read as mechanical rather than as a cut. */
const ROLL = 720

type Sector = (typeof items)[number]

function Panel({ sector, index }: { sector: Sector; index: number }) {
  const Glyph = iconRegistry[sector.icon]
  return (
    <>
      <div className="umm-sector__copy">
        <span className="umm-sector__count">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(items.length).padStart(2, '0')}
        </span>

        <h3 className="umm-sector__title">
          <span className="umm-sector__icon">
            <Glyph size={26} />
          </span>
          {sector.label}
        </h3>

        <p className="umm-sector__body">{sector.body}</p>

        <TickList items={sector.points} />
      </div>

      <div className="umm-sector__board">
        <Board title="What good looks like" rows={sector.board} />
      </div>
    </>
  )
}

export function Sectors() {
  /* What the slot is holding. */
  const [shown, setShown] = useState(items[0].id)
  /* What is rolling into it, if anything. */
  const [next, setNext] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  /* Heights of the outgoing and incoming panels, measured from the live DOM.
     They differ, and the reel has to travel by the exact height of the one
     leaving or the incoming panel lands off its seat. */
  const [geom, setGeom] = useState<{ from: number; to: number } | null>(null)

  const outRef = useRef<HTMLDivElement>(null)
  const inRef = useRef<HTMLDivElement>(null)
  const queued = useRef<string | null>(null)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const current = next ?? shown

  const change = (id: string) => {
    if (id === current) return
    if (reduced.current) {
      setShown(id)
      return
    }
    /* Mid-roll clicks are not dropped; they are the next board change. */
    if (next) {
      queued.current = id
      return
    }
    setNext(id)
  }

  /* Measure before paint, then start on the next frame — a transition needs a
     frame at the old values to have something to travel from. */
  useLayoutEffect(() => {
    if (!next) return
    const a = outRef.current
    const b = inRef.current
    if (!a || !b) return
    /* Fractional, not rounded: offsetHeight truncates to whole pixels, and the
       reel has to travel the panel's exact height or the arriving panel lands
       a fraction off its seat. */
    setGeom({
      from: a.getBoundingClientRect().height,
      to: b.getBoundingClientRect().height,
    })
    const raf = requestAnimationFrame(() => setRolling(true))
    return () => cancelAnimationFrame(raf)
  }, [next])

  useEffect(() => {
    if (!rolling || !next) return
    const t = window.setTimeout(() => {
      setShown(next)
      setNext(null)
      setRolling(false)
      setGeom(null)
      const q = queued.current
      queued.current = null
      if (q && q !== next) requestAnimationFrame(() => setNext(q))
    }, ROLL)
    return () => window.clearTimeout(t)
  }, [rolling, next])

  const shownIndex = items.findIndex((s) => s.id === shown)
  const nextIndex = items.findIndex((s) => s.id === next)
  const target = items[nextIndex] ?? items[shownIndex] ?? items[0]

  return (
    <section
      className="umm-section umm-section--railed"
      id="sectors"
      /* The CSS times the roll off the same constant the component clocks it
         with, so the two can never drift apart. */
      style={{ ['--roll' as string]: `${ROLL}ms` }}
    >
      <div className="umm-container">
        <SectionHead
          chapter={sectors.chapter}
          title={
            <>
              {sectors.titleLead} {sectors.titleAccent}
            </>
          }
        />

        <div data-umm-reveal>
          <Tabs
            idBase={ID_BASE}
            label="Industry sectors"
            items={items.map((s) => ({ id: s.id, label: s.label, icon: s.icon }))}
            value={current}
            onChange={change}
          />
        </div>

        <div className="umm-sector" data-umm-tone={target.tone} data-umm-reveal>
          <TabPanel idBase={ID_BASE} id={current}>
            <div
              className="umm-sector__slot"
              /* Armed while the roll is staged, disarmed the moment it lands.
                 Keyed to the geometry rather than to `rolling` so the
                 transition is already in place a frame before the value it
                 animates changes — and is gone again before the inline value
                 is removed. */
              data-rolling={geom ? 'true' : 'false'}
              style={
                geom ? { height: `${rolling ? geom.to : geom.from}px` } : undefined
              }
            >
              <div
                className="umm-sector__reel"
                data-rolling={geom ? 'true' : 'false'}
                style={
                  geom
                    ? {
                        transform: rolling
                          ? `translate3d(0, ${-geom.from}px, 0)`
                          : 'translate3d(0, 0, 0)',
                      }
                    : undefined
                }
              >
                <div
                  className="umm-sector__inner"
                  data-umm-tone={items[shownIndex].tone}
                  ref={outRef}
                >
                  <Panel sector={items[shownIndex]} index={shownIndex} />
                </div>

                {next ? (
                  <div
                    className="umm-sector__inner"
                    data-umm-tone={items[nextIndex].tone}
                    ref={inRef}
                    aria-hidden="true"
                  >
                    <Panel sector={items[nextIndex]} index={nextIndex} />
                  </div>
                ) : null}
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </section>
  )
}
