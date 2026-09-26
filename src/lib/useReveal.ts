import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Promotes every `[data-umm-reveal]` element to its "in" state once it crosses
 * into the viewport, then stops observing it.
 *
 * Why an attribute rather than a per-component hook: sections are authored as
 * plain markup, so a single observer covers the whole page including elements
 * added later (tab panels, accordion bodies). One observer, no per-node cost.
 *
 * The reveal is one-way by design. Content that has been read must not vanish
 * when the user scrolls back up.
 */
export function useReveal(deps: unknown[] = []) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-umm-reveal]')
    ).filter((el) => el.dataset.ummReveal !== 'in')

    if (reduced) {
      nodes.forEach((el) => {
        el.dataset.ummReveal = 'in'
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.dataset.ummReveal = 'in'
          observer.unobserve(el)
        })
      },
      {
        // Fire a little before the element is fully on screen so the motion
        // resolves as it arrives rather than after it has already landed.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08,
      }
    )

    nodes.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps])
}

/**
 * Builds the inline custom properties that stagger a sequence of siblings.
 * Index 0 fires immediately, each subsequent item trails by one step.
 */
export function stagger(index: number, step = 70): React.CSSProperties {
  return { '--umm-reveal-delay': `${index * step}ms` } as React.CSSProperties
}
