import { useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

type Options = {
  /**
   * Where the element's top must reach, as a fraction of viewport height,
   * for progress to begin. 0.9 = "just after it enters from the bottom".
   */
  start?: number
  /**
   * Where the element's bottom must reach for progress to complete.
   * 0.35 = "once it is well into the upper half of the screen".
   */
  end?: number
}

/**
 * Scroll-linked 0..1 progress for a single element as it travels through the
 * viewport. Drives the local animations that a global page progress value
 * cannot express: a line drawing itself, a rail filling, a counter ticking.
 *
 * Returns 1 immediately when the user prefers reduced motion, so anything
 * gated on progress renders in its completed state rather than empty.
 */
export function useElementProgress(
  ref: RefObject<HTMLElement | null>,
  { start = 0.88, end = 0.4 }: Options = {}
): number {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (reduced) {
      setProgress(1)
      return
    }

    const el = ref.current
    if (!el) return

    const update = () => {
      frameRef.current = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      const startY = vh * start
      const endY = vh * end

      // Distance the element must travel for progress to run 0 -> 1.
      const span = rect.height + (startY - endY)
      if (span <= 0) {
        setProgress(1)
        return
      }

      const travelled = startY - rect.top
      setProgress(Math.min(1, Math.max(0, travelled / span)))
    }

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [ref, start, end, reduced])

  return progress
}
