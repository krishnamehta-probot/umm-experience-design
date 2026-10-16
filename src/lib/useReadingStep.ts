import { useEffect, useRef, useState } from 'react'

/**
 * Which of a list of cards is being read, for the scroll-told boards (Cloud's
 * architecture, Growth's system): the last card whose top has passed the
 * reading line. The line is mid-screen on a wide window, where the picture
 * sits beside the cards; on a phone, where the picture is held at the top,
 * it is a little under the picture. Measured on scroll, once a frame.
 *
 * Returns the index, a ref for the held picture and a ref setter per card.
 */
export function useReadingStep() {
  const [at, setAt] = useState(0)
  const holdRef = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const hold = holdRef.current
      if (!hold) return
      const vh = window.innerHeight
      const held = hold.getBoundingClientRect()
      const line = window.innerWidth < 1000 ? held.bottom + (vh - held.bottom) * 0.35 : vh * 0.5
      let now = 0
      cards.current.forEach((c, i) => {
        if (c && c.getBoundingClientRect().top < line) now = i
      })
      setAt((p) => (p === now ? p : now))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const cardRef = (i: number) => (el: HTMLElement | null) => {
    cards.current[i] = el
  }
  const goTo = (i: number) => cards.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return { at, holdRef, cardRef, goTo }
}
