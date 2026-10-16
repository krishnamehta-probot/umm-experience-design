import { useEffect, useRef, useState } from 'react'

/* ============================================================================
   TO THE TOP — the round button bottom right

   Krish, 13 Oct: it took the hidden scrollbar's place; the scrollbar came
   back on 16 Oct and the button stays. It appears once the reader is past the first screen and
   glides back to the top. The ring round it fills with the page as it
   scrolls, so it still says how far down the page you are.
   ========================================================================== */

const R = 25
const C = 2 * Math.PI * R

export function ToTop() {
  const [shown, setShown] = useState(false)
  const ring = useRef<SVGCircleElement>(null)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      setShown(window.scrollY > window.innerHeight * 0.8)
      ring.current?.style.setProperty('stroke-dashoffset', String(C * (1 - p)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const up = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className="cx-top"
      data-shown={shown}
      onClick={up}
      aria-label="Back to the top"
      tabIndex={shown ? 0 : -1}
    >
      <svg className="cx-top__ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={R} />
        <circle ref={ring} cx="28" cy="28" r={R} style={{ strokeDasharray: C, strokeDashoffset: C }} />
      </svg>
      <svg className="cx-top__arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
      </svg>
    </button>
  )
}
