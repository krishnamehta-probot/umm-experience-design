/* ============================================================================
   BEAM JOURNEY

   A road, travelled. The line runs down the left of the stage; each stop is a
   checkpoint welded to its card — node, arm and card are one object. Scrolling
   moves the road, not the cards past a fixed marker, which is the difference
   between watching a slideshow and travelling.

   Everything is a pure function of the host section's pin progress, so there
   is no internal state to fall out of sync with the scrollbar. Scrub backwards
   and it runs backwards exactly.

     0.00 - 0.04  the copy has the stage to itself
     0.04 - 0.17  the road draws down from the top and stops at the centre
     0.17 - 0.23  the first checkpoint opens where it stopped
     0.23 - 0.32  and only then does the first card arrive beside it
     0.32 - 0.86  one lane per stop: the whole road travels, checkpoint and
                  card rising together while the next rises from below
     0.86 - 0.90  parked at the last checkpoint, its bar filling
     0.90 - 1.00  the road blends back into the ground before the next section

   Between the first checkpoint and the last the line keeps drawing downward,
   so the road is being laid as you travel rather than sitting there complete.
   ========================================================================== */

const BEAM_START = 0.04
const BEAM_END = 0.17
const NODE_IN = 0.23
const CARDS_START = 0.32
const FILL_END = 0.90

/* The share of the section given over to travelling. More stops means more
   lanes to fit, and squeezing them into a fixed window is what makes a long
   journey move faster than a short one for no reason the reader can see — so
   the window opens up instead, and every lane gets roughly the same run of
   scroll whatever the section holds. */
function cardsEnd(count: number) {
  return Math.min(0.88, 0.86 + (count - 3) * 0.02)
}
function cardsStart(count: number) {
  return Math.max(0.26, CARDS_START - (count - 3) * 0.03)
}

/* How a stop crosses its lane.

   A stop genuinely parks: it holds at its checkpoint for the first and last
   fifth of the lane and travels between. That dwell is the point — a
   checkpoint you drift past is not a checkpoint.

   What made the first version lurch was not the dwell, it was the speed the
   dwell forced. Squeezing a long journey into a short run means the card
   crosses the stage faster than the page that is driving it, and motion that
   outruns the wheel stops feeling attached to it. The fix is the distance,
   not the curve: a shorter hop, and the card that is leaving gives up its
   last stretch to a fade rather than travelling the whole way off. */
const HOLD = 0.2
const RUN = 0.6

const clampEarly = (v: number) => Math.min(1, Math.max(0, v))

const pace = (t: number) => {
  const c = clampEarly((t - HOLD) / RUN)
  return c * c * (3 - 2 * c)
}

/* One brand colour per stop, read from the token layer rather than restated
   here — the palette is defined in exactly one file. Five entries so a
   five-stage journey gets five colours instead of cycling back to the first. */
const TONES = [
  'var(--umm-sun)',
  'var(--umm-blossom)',
  'var(--umm-sky)',
  'var(--umm-citrus)',
  'var(--umm-coral)',
]

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}

export type BeamStep = {
  eyebrow: string
  title: string
  body: string
}

/** The mark in the card's top-right corner: a filled four-point star. */
function Star() {
  return (
    <svg viewBox="0 0 24 24" className="umm-beam__star" aria-hidden="true">
      <path d="M12 1.6c.5 4.6 2.2 7.6 5.5 8.9-3.3 1.3-5 4.3-5.5 8.9-.5-4.6-2.2-7.6-5.5-8.9 3.3-1.3 5-4.3 5.5-8.9Z" />
    </svg>
  )
}

export function BeamJourney({
  steps,
  progress,
}: {
  steps: BeamStep[]
  progress: number
}) {
  const count = steps.length

  /* The road reaching the centre, the checkpoint opening on it, then the card
     arriving — three gates in order, so nothing appears before its turn. */
  const intro = smooth((progress - BEAM_START) / (BEAM_END - BEAM_START))
  const nodeIn = smooth((progress - BEAM_END) / (NODE_IN - BEAM_END))
  const bloom = smooth((progress - NODE_IN) / (CARDS_START - NODE_IN))


  /* How far along the journey. The line is half-drawn when it reaches the
     centre and completes exactly as the last checkpoint lands. */
  const start = cardsStart(count)
  const end = cardsEnd(count)
  const run = clamp((progress - start) / (end - start))
  const draw = intro * 0.5 + run * 0.5
  const exit = smooth((progress - FILL_END) / (1 - FILL_END))

  /* Lanes run 0 .. count-1: the last stop parks at the centre rather than
     travelling one lane further and leaving the stage empty. */
  const raw = run * Math.max(1, count - 1)
  const seat = Math.min(count - 1, Math.floor(raw))
  const lane = seat + pace(raw - seat)
  const nearest = Math.min(count - 1, Math.max(0, Math.round(lane)))

  return (
    <div
      className="umm-beam"
      style={{
        ['--draw' as string]: draw,
        ['--intro' as string]: intro,
        ['--exit' as string]: exit,
        ['--beam-tone' as string]: TONES[nearest % TONES.length],
      }}
    >
      <span className="umm-beam__line" aria-hidden="true" />
      {/* Rides the leading edge of the road, so the track is never still even
          while a card is parked. */}
      <span className="umm-beam__spark" aria-hidden="true" />

      <ol className="umm-beam__cards">
        {steps.map((step, i) => {
          /* Positive above the centre and travelling away, negative below and
             still to arrive. Node, arm and card all read this one number. */
          const rel = lane - i
          const parked = Math.abs(rel) < 0.02

          /* The first checkpoint is not travelled to — it opens where the road
             stopped, and its card arrives after it. Every other stop is
             already off-stage below until the road brings it up. */
          const appear = i === 0 ? nodeIn : 1
          /* A stop dissolves as it leaves the checkpoint, which is what lets
             the hop be short enough to keep pace with the scroll. It starts
             early on purpose: a short hop means two cards share the stage
             through the crossover, and the one on its way out has to be
             visibly on its way out rather than a second card competing for
             the same attention. The first card still blooms in place. */
          const away = clamp((Math.abs(rel) - 0.28) / 0.55)
          const op = (i === 0 ? bloom : 1) * (1 - away)

          /* The bar fills across the window the card is parked, so the
             hand-off is something you can see coming. The last one keeps
             filling into the tail of the section, and the road only fades
             once it is full. */
          const fill =
            i === count - 1
              ? clamp((progress - (end - 0.12)) / (FILL_END - (end - 0.12)))
              : clamp((rel + 0.3) / 0.6)

          return (
            <li
              key={step.title}
              className="umm-beam__stop"
              data-umm-live={parked}
              aria-hidden={!parked}
              style={{
                ['--pos' as string]: rel,
                ['--appear' as string]: appear,
                ['--op' as string]: op,
                ['--near' as string]: 1 - clamp(Math.abs(rel) * 2.2),
                ['--scale' as string]: 1 - away * 0.05,
                ['--fill' as string]: fill,
                ['--card-tone' as string]: TONES[i % TONES.length],
                zIndex: parked ? 3 : 1,
              }}
            >
              <span className="umm-beam__mark" aria-hidden="true">
                <span className="umm-beam__arm" />
                <span className="umm-beam__node" />
              </span>

              <div className="umm-beam__card">
                <div className="umm-beam__top">
                  <span className="umm-beam__eyebrow">{step.eyebrow}</span>
                  <Star />
                </div>
                <h3 className="umm-beam__title">{step.title}</h3>
                <span className="umm-beam__rule" />
                <p className="umm-beam__text">{step.body}</p>
                <span className="umm-beam__bar" />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
