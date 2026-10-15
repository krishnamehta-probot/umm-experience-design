import { useEffect, useRef, type RefObject } from 'react'
import { screenPx } from './lane'

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

   Drift-and-settle is the default (Krish, 14 Oct, end of day: "keep it
   scroll friendly, keep magnetic over pinned, remove the freeze"): the
   wheel is never taken, the page scrolls natively, and only once the
   scroll goes quiet inside a pinned section does it glide onto the nearest
   stop. `step: true` turns on the old stepping, which held the scroll for
   1.3s per stop and read as a freeze. Stepping: while it holds,
   each scroll gesture (a wheel turn or trackpad swipe, a touch swipe, an
   arrow / page key) moves exactly one stop, gliding the page there, and
   the gesture's leftover momentum is swallowed so a hard flick can never
   skip a stop. At the first stop going up and the last going down the
   section lets go and the page scrolls on as normal.

   `pace` stretches the settle: above 1 the page waits a little longer
   before it settles and glides there more slowly, for a gentler pull.
   ========================================================================== */

/** Scroll position (share of the section's travel) at which a stop rests. */
export const stopAnchor = (stop: number, stops: number) => (stop + 0.5) / stops

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

type Geometry = (el: HTMLElement) => { top: number; travel: number }

const ownTravel: Geometry = (el) => ({
  top: el.getBoundingClientRect().top + window.scrollY,
  travel: el.offsetHeight - screenPx(),
})

export function useMagneticStops(
  ref: RefObject<HTMLElement | null>,
  stops: number,
  enabled: boolean,
  geometryOf: Geometry = ownTravel,
  { step = false, pace = 1 }: { step?: boolean; pace?: number } = {},
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
      /* a glide decides where the page goes: a settle still waiting (a
         tap's lift queues one) would pull it straight back */
      window.clearTimeout(idle)
      const from = window.scrollY
      const d = to - from
      if (Math.abs(d) < 2) return
      const dur = Math.min(1000, 420 + Math.abs(d) * 0.5) * pace
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

    /* A finger resting on the screen sends no scroll, but it still holds
       the page: settling then made the glide and the finger fight over it,
       and the page shook (iPhone, 15 Oct). So nothing settles while a
       finger is down; once it lifts, the momentum's own scroll restarts
       the wait. */
    let touching = false
    const onScroll = () => {
      if (gliding) return
      window.clearTimeout(idle)
      if (!touching) idle = window.setTimeout(settle, 160 * pace)
    }
    const interrupt = () => {
      if (gliding) cancel()
    }
    const onTouchDown = () => {
      touching = true
      window.clearTimeout(idle)
      interrupt()
    }
    const onTouchUp = (e: TouchEvent) => {
      if (e.touches.length) return
      touching = false
      onScroll()
    }

    /* A touchpad sends a stream of fine steps plus a second or two of
       momentum, so one swipe ran past several stops (Krish, 14 Oct: "on
       touchpad it feels too fast, on a normal mouse it feels perfect").
       While the section holds, a touchpad moves the page at TOUCHPAD of
       its own speed; a mouse wheel, and the rest of the page, are left to
       the browser. Nothing is held or swallowed. */
    const TOUCHPAD = 0.5
    const isTouchpad = (e: WheelEvent) => {
      if (e.deltaMode !== 0) return false
      // Chrome, Edge and Safari: a wheel notch is 120 here, a touchpad
      // reports three times its pixel delta
      const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
      if (legacy) return Math.abs(legacy + 3 * e.deltaY) < 1
      return Math.abs(e.deltaY) < 40
    }
    const onWheelFree = (e: WheelEvent) => {
      interrupt()
      if (e.ctrlKey || !isTouchpad(e)) return
      const { top, travel } = geometry()
      if (travel <= 0) return
      const p = (window.scrollY - top) / travel
      if (p < 0 || p > 1) return
      e.preventDefault()
      window.scrollBy({ top: e.deltaY * TOUCHPAD, behavior: 'instant' })
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
      const { top, travel } = geometry()
      glideTo(top + travel * stopAnchor(to, stops))
      // hold the section while the stop's change plays
      lockUntil = performance.now() + 1300
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
        acc = 0
      }
      lastWheel = now
      lastMag = mag
      lastDir = dir
      if (mine || locked(now)) {
        e.preventDefault()
        return
      }
      if (!owns(dir)) {
        if (gliding) cancel()
        return
      }
      e.preventDefault()
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

    window.addEventListener('scroll', onScroll, { passive: true })
    if (step) {
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('keydown', onKey)
    } else {
      window.addEventListener('wheel', onWheelFree, { passive: false })
      window.addEventListener('touchstart', onTouchDown, { passive: true })
      window.addEventListener('touchend', onTouchUp, { passive: true })
      window.addEventListener('touchcancel', onTouchUp, { passive: true })
      window.addEventListener('keydown', interrupt)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheelFree)
      window.removeEventListener('touchstart', onTouchDown)
      window.removeEventListener('touchend', onTouchUp)
      window.removeEventListener('touchcancel', onTouchUp)
      window.removeEventListener('keydown', interrupt)
      window.removeEventListener('wheel', onWheel)
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
