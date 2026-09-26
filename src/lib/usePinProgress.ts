import { useEffect, useRef, useState } from 'react'

/* ============================================================================
   PIN PROGRESS

   How far a sticky-pinned section has travelled: 0 the moment its top meets
   the top of the viewport, 1 when its bottom meets the bottom. That is exactly
   the window in which `position: sticky` holds the stage still, so a value
   from here maps one-to-one onto what the viewer sees being held.

   The value is damped rather than taken raw. A mouse wheel does not deliver a
   smooth signal — it delivers steps, often a hundred pixels at a time — and
   anything driven straight off the raw number inherits those steps and reads
   as stuttering however well the page is painting. Easing the value toward
   where the scrollbar actually is turns a staircase into a slide, and costs
   about a tenth of a second of lag to do it.

   Off screen the value snaps instead, so a section nowhere near the viewport
   never spends a frame animating toward a number nobody is looking at.
   ========================================================================== */

/* Share of the remaining distance covered per frame. Higher is tighter to the
   scrollbar and steppier; lower is smoother and laggier. */
const EASE = 0.14
/* Close enough to stop animating. Below a thousandth nothing moves a pixel. */
const SETTLED = 0.0004

export function usePinProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let target = 0
    let current = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /** Where the scrollbar says we are, and whether anyone can see it. */
    const measure = () => {
      const travel = el.offsetHeight - window.innerHeight
      const box = el.getBoundingClientRect()
      /* Shorter than the viewport means it is not pinning at all. */
      if (travel <= 0) return { value: 0, visible: false }
      const value = Math.min(1, Math.max(0, -box.top / travel))
      const visible = box.bottom > -200 && box.top < window.innerHeight + 200
      return { value, visible }
    }

    const frame = () => {
      const gap = target - current
      if (Math.abs(gap) < SETTLED) {
        current = target
        raf = 0
        setProgress(current)
        return
      }
      current += gap * EASE
      setProgress(current)
      raf = requestAnimationFrame(frame)
    }

    const schedule = () => {
      const { value, visible } = measure()
      target = value
      /* Nothing to ease toward when it cannot be seen — and nothing to ease
         with when the reader has asked for stillness. */
      if (!visible || reduced) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        current = target
        setProgress(current)
        return
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, progress }
}
