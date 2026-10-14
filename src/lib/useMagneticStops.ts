import { useEffect, useRef, type RefObject } from 'react'
import { addFence } from './smoothWheel'

/* ============================================================================
   MAGNETIC STOPS — a pinned section that rests on one step at a time

   The section's scroll travel is cut into `stops` equal lanes. A section
   reads its stop as floor(progress * stops) and plays each change as a full
   animation, so the scroll speed never decides how a change looks. This hook
   adds the magnet: when the scroll goes quiet inside the section, the page
   glides to the middle of the nearest lane, so every stop is seen at rest.

   Entering and leaving are never pulled back: nothing happens before the
   first stop's resting point or after the last one's. Any wheel, touch or
   key input cancels a glide in progress, so the reader always wins.

   Returns `glideTo(stop)`, for controls that jump to a stop.

   By default the section's travel is its own scroll while it holds (CSS
   sticky: top to bottom-minus-a-screen). A section that holds over a
   different stretch passes `geometry`, giving the page scroll where its
   travel starts and how long it is.

   Stepping is the default (Krish, 14 Oct: "the sections are too fast
   scrolled"; every pinned section on the v2 pages steps, on the same lane,
   styles/v2-scroll.css). `step: false` leaves the old drift-and-settle.
   Stepping: while it holds,
   each scroll gesture (a wheel turn or trackpad swipe, a touch swipe, an
   arrow / page key) moves exactly one stop, gliding the page there, and
   the gesture's leftover momentum is swallowed so a hard flick can never
   skip a stop. At the first stop going up and the last going down the
   section lets go and the page scrolls on as normal.

   14 Oct, later ("too direct and speedy … not a jerk change in anything"):
   the glide is longer and eases in and out on a sine, so its top speed is
   about half what it was; a page gliding in under the smooth wheel
   (lib/smoothWheel) is stopped at the first stop and comes to rest there
   rather than being stepped straight on past it.

   `pace` stretches the settle: above 1 the page waits a little longer
   before it settles and glides there more slowly, for a gentler pull.
   ========================================================================== */

/** Scroll position (share of the section's travel) at which a stop rests. */
export const stopAnchor = (stop: number, stops: number) => (stop + 0.5) / stops

/* A sine in-out: no sudden start or stop, and a gentle top speed. */
function easeInOut(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/** How long a glide over `d` pixels takes. */
const glideMs = (d: number, pace: number) => Math.min(1500, 800 + Math.abs(d) * 0.55) * pace

type Geometry = (el: HTMLElement) => { top: number; travel: number }

const ownTravel: Geometry = (el) => ({
  top: el.getBoundingClientRect().top + window.scrollY,
  travel: el.offsetHeight - window.innerHeight,
})

export function useMagneticStops(
  ref: RefObject<HTMLElement | null>,
  stops: number,
  enabled: boolean,
  geometryOf: Geometry = ownTravel,
  { step = true, pace = 1 }: { step?: boolean; pace?: number } = {},
) {
  const glide = useRef<(stop: number) => void>(() => {})
  const geo = useRef(geometryOf)
  geo.current = geometryOf

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    let idle = 0
    let tween = 0
    let gliding = false

    const geometry = () => geo.current(el)

    const cancel = () => {
      if (tween) cancelAnimationFrame(tween)
      tween = 0
      gliding = false
    }

    const glideTo = (to: number) => {
      cancel()
      const from = window.scrollY
      const d = to - from
      if (Math.abs(d) < 2) return
      const dur = glideMs(d, pace)
      const t0 = performance.now()
      gliding = true
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        window.scrollTo({ top: from + d * easeInOut(t), behavior: 'instant' })
        if (t < 1) tween = requestAnimationFrame(step)
        else {
          tween = 0
          gliding = false
        }
      }
      tween = requestAnimationFrame(step)
    }

    glide.current = (s: number) => {
      const { top, travel } = geometry()
      glideTo(top + travel * stopAnchor(s, stops))
    }

    const settle = () => {
      const { top, travel } = geometry()
      if (travel <= 0) return
      const p = (window.scrollY - top) / travel
      // Free on the way in and out: only between the first and last stop.
      if (p <= stopAnchor(0, stops) || p >= stopAnchor(stops - 1, stops)) return
      glideTo(top + travel * stopAnchor(Math.round(p * stops - 0.5), stops))
    }

    const onScroll = () => {
      if (gliding) return
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, 160 * pace)
    }
    const interrupt = () => {
      if (gliding) cancel()
    }

    /* --- stepping ------------------------------------------------------ */

    const EPS = 0.004
    let lockUntil = 0
    let lastWheel = 0
    let lastMag = 0
    let lastDir = 0
    let acc = 0
    let touchY: number | null = null

    /** Where the page is, as a share of the travel, and the nearest stop. */
    const where = () => {
      const { top, travel } = geometry()
      const p = travel > 0 ? (window.scrollY - top) / travel : 0
      const near = Math.min(stops - 1, Math.max(0, Math.round(p * stops - 0.5)))
      return { p, near }
    }

    /** Whether a move in `dir` belongs to the section (true) or to the page. */
    const owns = (dir: number) => {
      // a section that is not holding (no travel: stacked, reduced motion)
      // never takes the scroll
      if (geometry().travel <= 0) return false
      const { p } = where()
      const first = stopAnchor(0, stops)
      const last = stopAnchor(stops - 1, stops)
      if (dir > 0) return p >= -EPS && p < last - EPS
      return p > first + EPS && p <= last + EPS
    }

    /** One stop in `dir` from where the page is. */
    const stepBy = (dir: number) => {
      const { p, near } = where()
      // resting on a stop: move one; caught between stops (arriving from
      // outside, or after a scrollbar drag): settle on the nearest
      const resting = Math.abs(p - stopAnchor(near, stops)) < 0.02
      const to = Math.min(stops - 1, Math.max(0, resting ? near + dir : near))
      settleOn(to)
    }

    /** Glide to `to` and hold the section while its change plays. */
    const settleOn = (to: number) => {
      const { top, travel } = geometry()
      const y = top + travel * stopAnchor(to, stops)
      glideTo(y)
      lockUntil = performance.now() + Math.max(1300, glideMs(y - window.scrollY, pace) + 250)
      acc = 0
    }

    /* Held while the stop's change plays; after that the next stop needs a
       fresh gesture. */
    const locked = (now: number) => now < lockUntil

    /* A wheel gesture is one run of events with no gap over 160ms (a
       trackpad's momentum runs on for a second or two). Whoever the
       gesture starts with keeps it: once the section has taken a step on
       it, the rest of it (its momentum) is swallowed; a gesture the page
       has, the page keeps, unless it carries the page into the section,
       which then catches it at the nearest stop. */
    let mine = false
    /* whether the gesture began with the page; one that then carries the
       page into the section comes to rest on the nearest stop */
    let fromPage: boolean | null = null
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      const now = performance.now()
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY
      const dir = Math.sign(dy)
      if (!dir) return
      /* a pause starts a new gesture, unless what follows is still the
         last one's momentum dying away (small and still falling): a busy
         page (the film starting) can hold those back past the pause, and
         they must not carry the page on past the stop */
      const gap = now - lastWheel
      const mag = Math.abs(dy)
      const dying = gap < 700 && dir === lastDir && mag <= lastMag && mag < 60
      if (gap > 160 && !dying) {
        mine = false
        fromPage = null
        acc = 0
      }
      lastWheel = now
      lastMag = mag
      lastDir = dir
      if (mine || locked(now)) {
        e.preventDefault()
        return
      }
      const own = owns(dir)
      if (fromPage === null) fromPage = !own
      if (!own) {
        if (gliding) cancel()
        return
      }
      e.preventDefault()
      if (fromPage) {
        mine = true
        settleOn(where().near)
        return
      }
      acc += dy
      if (Math.abs(acc) < 24) return
      mine = true
      stepBy(Math.sign(acc))
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return
      const dy = touchY - (e.touches[0]?.clientY ?? touchY)
      const dir = Math.sign(dy)
      if (dir && (owns(dir) || locked(performance.now()))) e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      const dir = Math.sign(dy)
      if (Math.abs(dy) < 36 || locked(performance.now()) || !owns(dir)) return
      stepBy(dir)
    }

    const KEYS: Record<string, number> = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const dir = (e.key === ' ' && e.shiftKey ? -1 : KEYS[e.key]) ?? 0
      if (!dir || e.altKey || e.ctrlKey || e.metaKey || !owns(dir)) return interrupt()
      e.preventDefault()
      if (!locked(performance.now())) stepBy(dir)
    }

    /* a page gliding in under the smooth wheel stops on the first stop
       going down, or the last going up */
    const fence = (from: number, to: number) => {
      const { top, travel } = geometry()
      if (travel <= 0) return to
      const a = top + travel * stopAnchor(0, stops)
      const b = top + travel * stopAnchor(stops - 1, stops)
      if (to > from && from < a - 1 && to > a) return a
      if (to < from && from > b + 1 && to < b) return b
      return to
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    let unfence = () => {}
    if (step) {
      unfence = addFence(fence)
      // on the document while it captures: ahead of the smooth wheel
      document.addEventListener('wheel', onWheel, { passive: false, capture: true })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('keydown', onKey)
    } else {
      window.addEventListener('wheel', interrupt, { passive: true })
      window.addEventListener('touchstart', interrupt, { passive: true })
      window.addEventListener('keydown', interrupt)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', interrupt)
      document.removeEventListener('wheel', onWheel, { capture: true })
      unfence()
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(idle)
      cancel()
      glide.current = () => {}
    }
  }, [ref, stops, enabled, step, pace])

  return (stop: number) => glide.current(stop)
}

/** The stop a pinned section is on, from its scroll progress (0 to 1). */
export const stopAt = (progress: number, stops: number) =>
  Math.min(stops - 1, Math.max(0, Math.floor(progress * stops)))
