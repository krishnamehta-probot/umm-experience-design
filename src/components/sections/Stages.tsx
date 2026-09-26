import { useLayoutEffect, useRef, useState } from 'react'
import { SectionHead } from '../primitives'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { stages } from '@/content/experienceDesign'

/* ============================================================================
   FOR EVERY STAGE

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
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const items = stages.items
/* The reels are as wide as the longest figure; shorter ones ride on blanks. */
const REEL_W = Math.max(...items.map((i) => [...i.stat].length))
const REELS = Array.from({ length: REEL_W }, (_, col) =>
  items.map((i) => [...i.stat][col] ?? ' '),
)

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

export function Stages() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const tabsRef = useRef<HTMLDivElement>(null)
  const odoRef = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<{ x: number; w: number }[]>([])
  /* Advance width of every glyph in every reel, in em. */
  const [reelW, setReelW] = useState<number[][]>([])
  /* Cell height, in em, taken from real ink extents rather than the em box. */
  const [cellH, setCellH] = useState(1.5)

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

  /* A column as wide as its widest glyph would park the en-dash of "30-50%"
     in a box sized for the "M" of "$1M+". Measuring each glyph lets the column
     width be wound by the same scroll value as the reel, so the figure keeps
     proper spacing at every frame of the roll — including the ones between
     two stages. */
  useLayoutEffect(() => {
    const el = odoRef.current
    if (!el) return
    const read = () => {
      const cs = getComputedStyle(el)
      const size = parseFloat(cs.fontSize)
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx || !size) return
      ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`
      const track = parseFloat(cs.letterSpacing) || 0

      /* The clip box has to clear the tallest ascent and the deepest descent
         of any glyph that will ever ride these reels — the dollar sign's stem
         runs well past the em box, which is what was slicing it. */
      let up = 0
      let down = 0
      for (const glyphs of REELS) {
        for (const g of glyphs) {
          if (!g.trim()) continue
          const m = ctx.measureText(g)
          up = Math.max(up, m.actualBoundingBoxAscent)
          down = Math.max(down, m.actualBoundingBoxDescent)
        }
      }
      if (up + down > 0) setCellH((up + down) / size + 0.26)

      setReelW(
        REELS.map((glyphs) =>
          glyphs.map((g) =>
            /* Blank pad collapses to nothing, so a short figure carries no
               trailing air and the rule beneath it ends with the glyphs. */
            g.trim() === '' ? 0 : (ctx.measureText(g).width + track) / size,
          ),
        ),
      )
    }
    read()
    document.fonts?.ready.then(read)
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
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
      className="umm-section umm-pin"
      id="stages"
      ref={ref}
      style={{ ['--umm-pin-steps' as string]: items.length }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container umm-pin__inner umm-pin__inner--stack">
          <SectionHead
            chapter={stages.chapter}
            title={
              <>
                {stages.titleLead} {stages.titleAccent}
              </>
            }
            lead={stages.lead}
          />

          <div className="umm-stage">
            <div className="umm-stage__tabs" ref={tabsRef} role="tablist">
              {items.map((item, i) => (
                <button
                  type="button"
                  role="tab"
                  key={item.type}
                  className="umm-stage__tab"
                  aria-selected={Math.round(u) === i}
                  onClick={() => goTo(i)}
                  /* Full ink at its own seat, fading with distance from it. */
                  style={{ ['--near' as string]: 1 - clamp(Math.abs(u - i)) }}
                >
                  <span className="umm-stage__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
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
                <div
                  className="umm-odo"
                  ref={odoRef}
                  style={{ ['--u' as string]: u, ['--odo-h' as string]: `${cellH}em` }}
                >
                  <span className="umm-sr-only">{items[Math.round(u)].stat}</span>
                  {REELS.map((glyphs, col) => (
                    <span
                      className="umm-odo__col"
                      key={col}
                      aria-hidden="true"
                      style={
                        reelW[col]
                          ? {
                              width: `${lerp(
                                reelW[col][seat],
                                reelW[col][Math.min(items.length - 1, seat + 1)],
                                frac,
                              ).toFixed(4)}em`,
                            }
                          : undefined
                      }
                    >
                      <span className="umm-odo__reel">
                        {glyphs.map((g, i) => (
                          <span className="umm-odo__cell" key={i}>
                            {g}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
                </div>

                <div className="umm-stage__captions">
                  {items.map((item, i) => {
                    const { t, leaving } = place(
                      lane - i,
                      i === 0,
                      i === items.length - 1,
                    )
                    return (
                      <p
                        className="umm-stage__caption"
                        key={item.type}
                        aria-hidden={t > 0.5}
                        style={{
                          ['--lift' as string]: `${((leaving ? -1 : 1) * t * 40).toFixed(1)}px`,
                          ['--op' as string]: 1 - t,
                        }}
                      >
                        {item.statCaption}
                      </p>
                    )
                  })}
                </div>
              </div>

              <div className="umm-stage__panels">
                {items.map((item, i) => {
                  const { t, leaving } = place(
                    lane - i,
                    i === 0,
                    i === items.length - 1,
                  )
                  return (
                    <dl
                      className="umm-stage__detail"
                      key={item.type}
                      aria-hidden={t > 0.5}
                      style={{
                        ['--lift' as string]: `${((leaving ? -1 : 1) * t * 56).toFixed(1)}px`,
                        ['--op' as string]: 1 - t,
                        ['--tone' as string]: `var(--umm-${item.tone})`,
                        zIndex: t >= 1 ? 0 : Math.round((1 - t) * 10),
                        pointerEvents: t > 0.4 ? 'none' : undefined,
                      }}
                    >
                      <dt>Your challenge</dt>
                      <dd>{item.challenge}</dd>
                      <dt>Our approach</dt>
                      <dd>{item.approach}</dd>
                    </dl>
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
