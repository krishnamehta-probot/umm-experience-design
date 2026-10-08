import { useLayoutEffect, useRef, useState } from 'react'
import { FlyArrow } from '../primitives'
import { ChipHead, withAccent } from './ChipHead'
import { StageLight } from './StageLight'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { stages } from '@/content/cxUiDesign'

/* ============================================================================
   5 · BUILT FOR WHERE YOU ARE — the v1 company-size filter, kept

   Santosh singled this interaction out, so the mechanics are v1's Stages
   unchanged and only the content and the skin are new: a verb headline per
   stage (Pitch), one big number as the hero of each stage (Stripe), the
   engagement model folded in as "how we'd work together", and a picture of
   light behind the number that grows with the company (StageLight: a spark,
   a rising curve, a lit skyline).

   8 Oct, final copy: there is no number any more. The card draws the
   stage's flow instead (Idea → Prototype → Product) as a path of light:
   three points on a line that light up one after another as the scroll
   moves through the stage, the line filling between them, and the last
   point pulsing once it is reached. Each stage's path is carried in and
   out like the panels beside it.

   v1's notes on the mechanics follow.

   Three numbered tabs over one panel. The section pins and the scroll moves
   between stages; the tabs are not a second control sitting beside the scroll,
   they are a readout of it — and clicking one scrolls the page to that stage
   rather than switching anything directly. There is only ever one source of
   truth for which stage is showing.

   The figure does not swap with the rest of the panel. It is an odometer: the
   glyphs are stacked in reels and the whole set is wound by the scroll, so
   2-5x re-forms into 30-50% into $1M+ without ever being absent. The number
   growing as the company grows is the argument of the section, made physical.
   ========================================================================== */

const CARDS_START = 0.24
/* Out before in — see the note in Services. Panels of running text cannot
   cross-fade through each other legibly. */
const PARK_IN = 0.36
const PARK_OUT = 0.36
const EXIT_END = 0.5
const ENTER_START = 0.5

const clamp = (v: number) => Math.min(1, Math.max(0, v))
/* How much of a stage's hold it takes to light its whole path. */
const LIGHT_SPAN = PARK_IN
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const items = stages.items
/** How far a stage has travelled from its seat, and which way it is going. */
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

export function StagesV2() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const tabsRef = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<{ x: number; w: number }[]>([])
  const pinned = usePinned()
  /* Unpinned, the scroll cannot select anything, so the tabs do. */
  const [picked, setPicked] = useState(0)

  const laneSize = (1 - CARDS_START) / items.length
  const lane = pinned ? (progress - CARDS_START) / laneSize : picked
  const u = pinned ? Math.min(items.length - 1, Math.max(0, lane)) : picked

  /* Measure the tabs once they are laid out, and again whenever the box
     changes — the underline is positioned in pixels, so it has to be. */
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
  /* The box blends between the two neighbouring stage colours rather than
     switching at a threshold, so the colour moves with the scroll exactly as
     the reels do. */
  const toneA = items[seat].tone
  const toneB = items[Math.min(items.length - 1, seat + 1)].tone

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
      className="umm-section umm-pin cx-stages"
      id="stages"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: items.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner umm-pin__inner--stack">
          <div className="cx-head cx-head--tight">
            <ChipHead
              line1={stages.line1}
              line2={withAccent(stages.line2, stages.accent)}
              chip={stages.chip}
              tone="sky"
              lineRecipe={4}
            />
            <p className="cx-lead">{stages.lead}</p>
          </div>

          <div className="umm-stage">
            <div className="umm-stage__tabs" ref={tabsRef} role="tablist">
              {items.map((item, i) => (
                <button
                  type="button"
                  role="tab"
                  key={item.tab}
                  className="umm-stage__tab"
                  aria-selected={Math.round(u) === i}
                  onClick={() => goTo(i)}
                  /* Full ink at its own seat, fading with distance from it. */
                  style={{ ['--near' as string]: 1 - clamp(Math.abs(u - i)) }}
                >
                  <span className="umm-stage__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="umm-stage__name">{item.tab}</span>
                </button>
              ))}

              {/* One line, not two: it runs from the left edge to the end of
                  whichever tab is live, so it is a progress bar for the whole
                  section and is complete exactly when Enterprises is. */}
              {from ? (
                <span
                  className="umm-stage__underline"
                  aria-hidden="true"
                  style={{
                    width: `${lerp(from.x + from.w, to.x + to.w, frac)}px`,
                  }}
                />
              ) : null}
            </div>

            <div className="umm-stage__body">
              <div
                className="umm-stage__figure"
                style={{
                  ['--tone-a' as string]: `var(--umm-${toneA})`,
                  ['--tone-b' as string]: `var(--umm-${toneB})`,
                  ['--frac' as string]: frac,
                }}
              >
                <div className="umm-stage__captions cx-path__stack">
                  {items.map((item, i) => {
                    const rel = lane - i
                    const { t, leaving } = place(rel, i === 0, i === items.length - 1)
                    /* 0 → 1 across the start of the stage's hold; tapped
                       (unpinned), the chosen stage is simply fully lit */
                    const q = pinned ? clamp((rel + PARK_IN) / LIGHT_SPAN) : i === picked ? 1 : 0
                    return (
                      <ol
                        className="umm-stage__caption cx-path"
                        key={item.tab}
                        aria-hidden={t > 0.5}
                        aria-label={item.flow.join(', then ')}
                        style={{
                          ['--lift' as string]: `${((leaving ? -1 : 1) * t * 40).toFixed(1)}px`,
                          ['--op' as string]: 1 - t,
                          ['--tone' as string]: `var(--umm-${item.tone})`,
                          ['--q' as string]: q.toFixed(3),
                        }}
                      >
                        {/* the rail the light runs down, first point to last */}
                        <span className="cx-path__rail" aria-hidden="true" />
                        {item.flow.map((step, k) => (
                          <li
                            key={step}
                            className="cx-path__step"
                            data-lit={q >= (k / (item.flow.length - 1)) * 0.96 + 0.02 || undefined}
                            data-end={k === item.flow.length - 1 || undefined}
                            style={{ ['--n' as string]: k }}
                          >
                            <span className="cx-path__dot" aria-hidden="true" />
                            <span className="cx-path__name">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )
                  })}
                </div>
                {/* the picture behind the flow grows with the company: a
                    spark, a rising curve, a lit skyline, morphing on the same
                    scroll value as the reels */}
                <StageLight u={u} />
              </div>

              <div className="umm-stage__panels">
                {items.map((item, i) => {
                  const { t, leaving } = place(lane - i, i === 0, i === items.length - 1)
                  return (
                    <div
                      className="umm-stage__detail cx-stage__detail"
                      key={item.tab}
                      aria-hidden={t > 0.5}
                      style={{
                        ['--lift' as string]: `${((leaving ? -1 : 1) * t * 56).toFixed(1)}px`,
                        ['--op' as string]: 1 - t,
                        ['--tone' as string]: `var(--umm-${item.tone})`,
                        zIndex: t >= 1 ? 0 : Math.round((1 - t) * 10),
                        pointerEvents: t > 0.4 ? 'none' : undefined,
                      }}
                    >
                      <h3 className="cx-stage__title">{item.title}</h3>
                      <p className="cx-stage__text">{item.body}</p>
                      <div className="cx-stage__model">
                        <ul className="cx-stage__services">
                          {item.services.map((sv) => (
                            <li key={sv}>{sv}</li>
                          ))}
                        </ul>
                        <a
                          className="cx-stage__cta"
                          href={item.cta.href}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={t > 0.5 ? -1 : undefined}
                        >
                          <span>{item.cta.label}</span>
                          <span className="cx-stage__cta-orb" aria-hidden="true">
                            <FlyArrow size={16} strokeWidth={2} />
                          </span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
