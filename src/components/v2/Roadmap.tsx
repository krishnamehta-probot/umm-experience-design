import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ChipHead, withAccent } from './ChipHead'
import { Shape } from './Shape'
import type { ShapeName } from './shapes.data'
import { usePinProgress } from '@/lib/usePinProgress'
import { usePinned } from '@/lib/usePinned'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { stopAt, useMagneticStops } from '@/lib/useMagneticStops'
import { process } from '@/content/cxUiDesign'

/* ============================================================================
   7a · HOW WE WORK — the roadmap

   8 Oct, final copy: four stages (Assessment, Ideation, Design or redesign,
   Optimisation), each ending in a deliverable. The deliverable is the
   sticker stamped on as the stage's bar fills (it was "Signed off"), and the
   axis mark is where the design is ready to build.

   "From first call to launch, in five steps", drawn the way a product team
   draws a roadmap: a white board, the steps down the left (hairline rows,
   as in the rules and the tools), and a timeline on the right where each
   step is a rounded pastel bar. The bars overlap a little, as real work
   does. The axis is marked only where the copy marks it: First call,
   Launch (the end of Deliver) and Ongoing; no invented week numbers.

   A "today" line moves along the timeline. Each step is a magnetic stop
   (lib/useMagneticStops), on the same rhythm as the rules and the tools:
   the scroll moves today to the end of that step's bar, the bars it passes
   fill with their pastel, and each finished step gets a "Signed off" sticker
   (the lead: every step ends with something you can sign off). Clicking a
   row glides to it.

   Phones and reduced motion: the same board, each row's bar under its text;
   today sweeps the whole plan once it scrolls into view (reduced motion:
   already done).
   ========================================================================== */

const NUMERALS: ShapeName[] = ['number-1', 'number-2', 'number-3', 'number-4']
const TONES = ['sun', 'sky', 'blossom', 'citrus'] as const
const STEPS = process.steps.length

/** Each stage's bar on a 12-column timeline: [start, end]. Optimisation
 *  runs on off the end of the board. */
const SPAN: [number, number][] = [
  [0, 2.9],
  [2.4, 5.5],
  [4.9, 8.6],
  [8.1, 12],
]
const COLS = 12
/** The axis mark: where Design or redesign hands over a build-ready design. */
const LAUNCH = SPAN[2][1]
/** Where each stage's deliverable is stamped: just past the end of its bar,
 *  in the empty part of the row. The last bar runs off the board, so its
 *  sticker sits just before the bar starts instead. */
const STAMP = SPAN.map(([a, b], i) => (i === SPAN.length - 1 ? a : b))

export function Roadmap() {
  const { ref, progress } = usePinProgress<HTMLElement>()
  const wide = usePinned()
  const reduced = useReducedMotion()
  const pinMode = wide && !reduced
  const stop = stopAt(progress, STEPS)
  const glideTo = useMagneticStops(ref, STEPS, pinMode)

  /* Until the board is on screen, today sits at the first call, so the
     first fill plays as the reader arrives. */
  const board = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(reduced)
  useEffect(() => {
    const el = board.current
    if (!el || reduced) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), {
      rootMargin: '0px 0px -25% 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const reached = !seen ? -1 : pinMode ? stop : STEPS - 1
  const today = reached < 0 ? 0 : SPAN[reached][1]

  return (
    <section
      className="umm-section umm-pin cx-plan"
      id="process"
      ref={ref}
      data-mode={pinMode ? 'scroll' : reduced ? 'still' : 'list'}
      style={{ ['--umm-pin-steps' as string]: STEPS }}
    >
      <div className="umm-pin__stage">
        <div className="umm-container cx-plan__inner">
          <div className="cx-head cx-head--tight">
            <ChipHead
              line1={process.line1}
              line2={withAccent(process.line2, process.accent)}
              chip={process.chip}
              tone="blossom"
              lineRecipe={0}
            />
            <p className="cx-lead">{process.lead}</p>
          </div>

          <div
            className="cx-plan__board"
            ref={board}
            style={{ ['--today' as string]: today, ['--cols' as string]: COLS } as CSSProperties}
          >
            <div className="cx-plan__axis" aria-hidden="true">
              <span className="cx-plan__axis-step">Step</span>
              <span className="cx-plan__axis-track">
                <span className="cx-plan__mark" style={{ ['--at' as string]: 0 } as CSSProperties}>
                  First call
                </span>
                <span
                  className="cx-plan__mark cx-plan__mark--launch"
                  style={{ ['--at' as string]: LAUNCH } as CSSProperties}
                >
                  {process.ready}
                  <i />
                </span>
                <span className="cx-plan__mark cx-plan__mark--end">Ongoing →</span>
              </span>
            </div>

            <ol className="cx-plan__rows">
              {process.steps.map((step, i) => {
                const [a, b] = SPAN[i]
                const done = i <= reached
                const open = pinMode ? i === stop : true
                return (
                  <li key={step.title} className="cx-plan__row" data-umm-tone={TONES[i]}>
                    <button
                      type="button"
                      className="cx-plan__label"
                      onClick={pinMode ? () => glideTo(i) : undefined}
                      tabIndex={pinMode ? 0 : -1}
                      data-open={open}
                      data-done={done}
                      aria-current={pinMode && i === stop ? 'step' : undefined}
                    >
                      <span className="cx-plan__tick" aria-hidden="true">
                        <svg viewBox="0 0 20 20">
                          <path d="M5 10.5 8.5 14 15 6.5" />
                        </svg>
                      </span>
                      <span className="cx-plan__n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="cx-plan__title">{step.title}</span>
                    </button>
                    <div className="cx-plan__body" data-open={open}>
                      <p>
                        {step.body}
                        <strong className="cx-plan__get">{step.get}</strong>
                      </p>
                    </div>

                    <div className="cx-plan__track" aria-hidden="true">
                      <span
                        className="cx-plan__bar"
                        data-open={pinMode && i === stop}
                        data-last={i === STEPS - 1}
                        style={{ ['--a' as string]: a, ['--b' as string]: b } as CSSProperties}
                      >
                        <span className="cx-plan__fill" />
                        <span className="cx-plan__num">
                          <Shape name={NUMERALS[i]} />
                        </span>
                        <span className="cx-plan__name">{step.title}</span>
                      </span>
                      {/* the stage's deliverable, stamped on as it is reached */}
                      <span
                        className="cx-plan__signed"
                        data-on={done}
                        data-before={i === STEPS - 1 || undefined}
                        style={{ ['--b' as string]: STAMP[i] } as CSSProperties}
                      >
                        <svg viewBox="0 0 20 20">
                          <path d="M5 10.5 8.5 14 15 6.5" />
                        </svg>
                        <span className="cx-plan__stamp">{step.get}</span>
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>

            {/* the grid and the today line sit over the timeline column */}
            <div className="cx-plan__over" aria-hidden="true">
              <span className="cx-plan__launch" style={{ ['--at' as string]: LAUNCH } as CSSProperties} />
              <span className="cx-plan__today">
                <b>Today</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
