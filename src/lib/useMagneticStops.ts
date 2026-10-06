import { useEffect, useRef, type RefObject } from 'react'

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
   ========================================================================== */

/** Scroll position (share of the section's travel) at which a stop rests. */
export const stopAnchor = (stop: number, stops: number) => (stop + 0.5) / stops

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function useMagneticStops(ref: RefObject<HTMLElement | null>, stops: number, enabled: boolean) {
  const glide = useRef<(stop: number) => void>(() => {})

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    let idle = 0
    let tween = 0
    let gliding = false

    const geometry = () => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      travel: el.offsetHeight - window.innerHeight,
    })

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
      const dur = Math.min(1000, 420 + Math.abs(d) * 0.5)
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
      idle = window.setTimeout(settle, 160)
    }
    const interrupt = () => {
      if (gliding) cancel()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('keydown', interrupt)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', interrupt)
      window.clearTimeout(idle)
      cancel()
      glide.current = () => {}
    }
  }, [ref, stops, enabled])

  return (stop: number) => glide.current(stop)
}

/** The stop a pinned section is on, from its scroll progress (0 to 1). */
export const stopAt = (progress: number, stops: number) =>
  Math.min(stops - 1, Math.max(0, Math.floor(progress * stops)))
