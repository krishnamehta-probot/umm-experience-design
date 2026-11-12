import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/* ============================================================================
   THE MANUFACTURING PAGE — shared motion hooks

   useAuto      steps through `count` items by itself every `ms`, with the
                time so far as --p (0–1) on the host for a progress line;
                waits only while it is off screen (Krish, 12 Nov: "line or
                timer should not stop on hover"); stops for good once the
                reader picks one
   useProgress  how far the reader has scrolled through a tall (pinned)
                section, 0–1, as --sp on the section and as a number
   ========================================================================== */

export function useAuto<T extends HTMLElement = HTMLDivElement>(count: number, ms: number) {
  const host = useRef<T | null>(null)
  const [i, setI] = useState(0)
  const auto = useRef(true)
  const acc = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = host.current
    if (!el || reduced) return
    let raf = 0
    let last = 0
    let running = false
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 100) : 0
      last = now
      if (auto.current) {
        acc.current += dt
        if (acc.current >= ms) {
          acc.current = 0
          setI((v) => (v + 1) % count)
        }
      }
      el.style.setProperty('--p', auto.current ? (acc.current / ms).toFixed(4) : '1')
      if (auto.current) raf = requestAnimationFrame(tick)
      else running = false
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && auto.current && !running) {
          running = true
          last = 0
          raf = requestAnimationFrame(tick)
        } else if (!e.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [count, ms, reduced])

  const pick = (n: number) => {
    auto.current = false
    acc.current = 0
    host.current?.style.setProperty('--p', '1')
    setI(n)
  }
  return { i, pick, host }
}

/** 0 as the section's top meets the top of the screen, 1 as its bottom meets
 *  the bottom: the scroll through a pinned section */
export function useProgress<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    const read = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const run = r.height - window.innerHeight
      const v = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0
      if (Math.abs(v - last) > 0.0005) {
        last = v
        el.style.setProperty('--sp', v.toFixed(4))
        setP(v)
      }
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return { ref, p }
}

/** scroll to the point `f` (0–1) of the way through a pinned section */
export function scrollThrough(el: HTMLElement | null, f: number) {
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  const run = el.offsetHeight - window.innerHeight
  window.scrollTo({ top: top + run * f, behavior: 'smooth' })
}
