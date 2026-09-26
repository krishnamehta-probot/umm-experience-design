import { useLayoutEffect, useRef, useState } from 'react'
import { SectionHead, toneAt, toneVar } from '../primitives'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { engagement } from '@/content/experienceDesign'

/* ============================================================================
   ENGAGEMENT MODELS

   Built on the same mechanism as "For every stage": the section pins, the
   scroll moves between models, and the numbered tabs are a readout of the
   scroll rather than a second control competing with it. Clicking a tab
   scrolls the page to that model, so there is one source of truth.

   Where Stages shows a single figure, a model is four facts of equal weight —
   what is in scope, what you are handed, how we work together, how long it
   runs. Four tiles, one colour each, held to the same shape in every model so
   the models can be compared by reading across rather than down.
   ========================================================================== */

const CARDS_START = 0.24
/* Out before in. Four tiles of running text cannot cross-fade through each
   other legibly — see the note in Services. */
const PARK_IN = 0.36
const PARK_OUT = 0.36
const EXIT_END = 0.5
const ENTER_START = 0.5

/* One colour per fact, fixed across every model: the colour identifies which
   question the tile answers, not which model you are on. Taken off the shared
   tone sequence so no component restates the palette. */

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const items = engagement.items

/** How far a model has travelled from its seat, and which way it is going. */
function place(rel: number, first: boolean, last: boolean) {
  const held = (first && rel < 0) || (last && rel > 0)
  if (!held && rel > PARK_OUT) {
    return { t: smooth((rel - PARK_OUT) / (EXIT_END - PARK_OUT)), leaving: true }
  }
  if (!held && rel < -PARK_IN) {
    return { t: smooth((-rel - PARK_IN) / (ENTER_START - PARK_IN)), leaving: false }
  }
  return { t: 0, leaving: false }
}

export function Engagement() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const tabsRef = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<{ x: number; w: number }[]>([])

  const pinned = usePinned()
  /* Unpinned, the scroll cannot select anything, so the tabs do. */
  const [picked, setPicked] = useState(0)

  const laneSize = (1 - CARDS_START) / items.length
  const lane = pinned ? (progress - CARDS_START) / laneSize : picked
  const u = pinned ? Math.min(items.length - 1, Math.max(0, lane)) : picked

  /* The rule under the tabs is positioned in pixels, so it has to be measured
     once the labels have laid out — and again whenever they move. */
  useLayoutEffect(() => {
    const host = tabsRef.current
    if (!host) return
    const read = () => {
      const base = host.getBoundingClientRect().left
      setMarks(
        [...host.querySelectorAll('.umm-stage__tab')].map((el) => {
          const r = el.getBoundingClientRect()
          /* The strip scrolls sideways on narrow screens. The rule is an
             absolutely positioned child, so it scrolls with the content and
             has to be measured in content coordinates, not viewport ones. */
          return { x: r.left - base + host.scrollLeft, w: r.width }
        }),
      )
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(host)
    document.fonts?.ready.then(read)
    return () => ro.disconnect()
  }, [])

  const seat = Math.floor(u)
  const frac = u - seat
  const from = marks[seat]
  const to = marks[Math.min(items.length - 1, seat + 1)] ?? from

  const goTo = (i: number) => {
    if (!pinned) {
      setPicked(i)
      /* Keep the chosen tab on screen — the strip scrolls sideways here. */
      const tab = tabsRef.current?.querySelectorAll('.umm-stage__tab')[i]
      tab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      return
    }
    const el = ref.current
    if (!el) return
    const travel = el.offsetHeight - window.innerHeight
    if (travel <= 0) return
    window.scrollTo({
      top: el.offsetTop + travel * (CARDS_START + i * laneSize),
      behavior: 'smooth',
    })
  }

  return (
    <section
      className="umm-section umm-pin"
      id="engagement"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: items.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner umm-pin__inner--stack">
          <SectionHead
            chapter={engagement.chapter}
            title={
              <>
                {engagement.titleLead} {engagement.titleAccent}
              </>
            }
            lead={engagement.lead}
          />

          <div className="umm-stage">
            <div
              className="umm-stage__tabs umm-stage__tabs--four"
              ref={tabsRef}
              role="tablist"
            >
              {items.map((item, i) => (
                <button
                  type="button"
                  role="tab"
                  key={item.title}
                  className="umm-stage__tab"
                  aria-selected={Math.round(u) === i}
                  onClick={() => goTo(i)}
                  style={{ ['--near' as string]: 1 - clamp(Math.abs(u - i)) }}
                >
                  <span className="umm-stage__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="umm-stage__name">{item.tab}</span>
                </button>
              ))}

              {/* Runs from the left edge to the end of whichever tab is live,
                  so it is complete exactly when the last model is. */}
              {from ? (
                <span
                  className="umm-stage__underline"
                  aria-hidden="true"
                  style={{ width: `${lerp(from.x + from.w, to.x + to.w, frac)}px` }}
                />
              ) : null}
            </div>

            <div className="umm-eng__panels">
              {items.map((item, i) => {
                const { t, leaving } = place(lane - i, i === 0, i === items.length - 1)
                const faces = [
                  { label: 'Scope', text: item.scope },
                  { label: 'You receive', text: item.receive },
                  { label: 'Collaboration', text: item.collaboration },
                  { label: 'Duration', text: item.duration },
                ]
                return (
                  <div
                    className="umm-eng__panel"
                    key={item.title}
                    aria-hidden={t > 0.5}
                    style={{
                      ['--op' as string]: 1 - t,
                      zIndex: t >= 1 ? 0 : Math.round((1 - t) * 10),
                      pointerEvents: t > 0.4 ? 'none' : undefined,
                    }}
                  >
                    <div
                      className="umm-eng__head"
                      style={{
                        ['--lift' as string]: `${((leaving ? -1 : 1) * t * 44).toFixed(1)}px`,
                      }}
                    >
                      {/* The strip is abbreviated so four labels fit one line;
                          the model's full name belongs here. */}
                      <h3 className="umm-eng__title">{item.title}</h3>
                      <p className="umm-eng__lead">{item.lead}</p>
                    </div>

                    <div className="umm-eng__tiles">
                      {faces.map((face, j) => (
                        <div
                          className="umm-eng__tile"
                          key={face.label}
                          style={{
                            ['--tone' as string]: toneVar(toneAt(j)),
                            /* Each tile travels a little further than the one
                               before it, so the row turns over as a wave
                               rather than as one slab. */
                            ['--lift' as string]: `${(
                              (leaving ? -1 : 1) *
                              t *
                              (56 + j * 14)
                            ).toFixed(1)}px`,
                          }}
                        >
                          <span className="umm-eng__label">{face.label}</span>
                          <p className="umm-eng__text">{face.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
