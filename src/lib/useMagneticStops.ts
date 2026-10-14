import { useEffect, useRef, type RefObject } from 'react'

/* ============================================================================
   PINNED STOPS — a pinned section's steps, and gliding to one on request

   The section's scroll travel is cut into `stops` equal lanes. A section
   reads its stop as floor(progress * stops) and plays each change as a full
   animation, so the scroll speed never decides how a change looks.

   The scroll itself is the reader's (Krish, 14 Oct: "whatever I scroll …
   everything to be like a smooth scroll as per what we scroll"): no
   stepping, no magnet, no settling. The page moves exactly as far as it is
   scrolled, smoothed under a mouse wheel by lib/smoothWheel.

   What is left here is `glideTo(stop)`, for controls (tabs, dots) that jump
   to a stop. Any wheel, touch or key input cancels a glide in progress, so
   the reader always wins.

   By default the section's travel is its own scroll while it holds (CSS
   sticky: top to bottom-minus-a-screen). A section that holds over a
   different stretch passes `geometry`, giving the page scroll where its
   travel starts and how long it is.
   ========================================================================== */

/** Scroll position (share of the section's travel) at which a stop rests. */
export const stopAnchor = (stop: number, stops: number) => (stop + 0.5) / stops

/* A sine in-out: no sudden start or stop, and a gentle top speed. */
function easeInOut(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

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
) {
  const glide = useRef<(stop: number) => void>(() => {})
  const geo = useRef(geometryOf)
  geo.current = geometryOf

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    let tween = 0

    const cancel = () => {
      if (tween) cancelAnimationFrame(tween)
      tween = 0
    }

    glide.current = (s: number) => {
      cancel()
      const { top, travel } = geo.current(el)
      const from = window.scrollY
      const d = top + travel * stopAnchor(s, stops) - from
      if (Math.abs(d) < 2) return
      const dur = Math.min(1400, 700 + Math.abs(d) * 0.4)
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        window.scrollTo({ top: from + d * easeInOut(t), behavior: 'instant' })
        tween = t < 1 ? requestAnimationFrame(step) : 0
      }
      tween = requestAnimationFrame(step)
    }

    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', cancel)
    return () => {
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
      cancel()
      glide.current = () => {}
    }
  }, [ref, stops, enabled])

  return (stop: number) => glide.current(stop)
}

/** The stop a pinned section is on, from its scroll progress (0 to 1). */
export const stopAt = (progress: number, stops: number) =>
  Math.min(stops - 1, Math.max(0, Math.floor(progress * stops)))
