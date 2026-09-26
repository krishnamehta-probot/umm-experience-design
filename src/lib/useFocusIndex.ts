import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Tracks which item in a list the reader is currently focused on, defined as
 * the item whose centre sits nearest a fixed line across the viewport.
 *
 * This is the mechanic behind "show me where to look": exactly one row in a
 * list is ever active, it changes smoothly as the reader descends, and it
 * never flickers between two candidates the way per-item IntersectionObservers
 * do when rows are taller than the viewport.
 *
 * Returns -1 while the list is off-screen, so callers can render a neutral
 * state rather than falsely highlighting the first row.
 */
export function useFocusIndex(count: number, focusRatio = 0.46) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(-1)
  const itemsRef = useRef<(HTMLElement | null)[]>([])
  const frameRef = useRef(0)

  const register = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      itemsRef.current[index] = node
    },
    []
  )

  useEffect(() => {
    if (reduced) return

    const update = () => {
      frameRef.current = 0
      const items = itemsRef.current.slice(0, count).filter(Boolean) as HTMLElement[]
      if (items.length === 0) return

      const focusY = window.innerHeight * focusRatio

      // If the whole list is clear of the focus line, nothing is active.
      const first = items[0].getBoundingClientRect()
      const last = items[items.length - 1].getBoundingClientRect()
      if (last.bottom < focusY || first.top > window.innerHeight) {
        setActive(-1)
        return
      }

      let best = -1
      let bestDistance = Infinity
      items.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - focusY)
        if (distance < bestDistance) {
          bestDistance = distance
          best = i
        }
      })

      setActive(best)
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
  }, [count, focusRatio, reduced])

  return { active, register }
}
