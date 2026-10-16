import { useEffect, useRef, useState } from 'react'

/**
 * The data pipeline's level, for Cloud's architecture (ConnectedArchitecture).
 *
 * The pipe fills with the reader: its water reaches a line a little under the
 * middle of the screen, so the level follows the scroll and never runs ahead.
 * Each card hangs off the pipe at a joint (its anchor); a card is lit once
 * the water has reached its joint. The platform's tank fills as the water
 * passes it.
 *
 * Positions inside the run are measured once per layout (resize, fonts,
 * content), and the scroll only reads the run's own top, once a frame, on a
 * passive listener. The level is written straight to CSS variables on the
 * run (--cp-fill, --cp-level), so scrolling never re-renders; only the set of
 * lit cards is React state, and it changes a handful of times.
 *
 * With reduced motion the pipe is simply full: every card lit.
 */
export function usePipeFlow() {
  const runRef = useRef<HTMLDivElement>(null)
  const tankRef = useRef<HTMLLIElement>(null)
  const anchors = useRef<(HTMLElement | null)[]>([])
  const [lit, setLit] = useState(0)

  useEffect(() => {
    const run = runRef.current
    if (!run) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let ys: number[] = []
    let len = 0
    let tank = { top: 0, height: 1 }
    let last = -1
    let raf = 0

    /** where each joint sits on the pipe, and how long the pipe is */
    const layout = () => {
      const r = run.getBoundingClientRect()
      ys = anchors.current.map((a) => {
        if (!a) return Infinity
        const b = a.getBoundingClientRect()
        return b.top - r.top + Math.min(b.width, b.height) / 2
      })
      len = Math.max(0, ...ys.filter(Number.isFinite))
      run.style.setProperty('--cp-len', `${len.toFixed(1)}px`)
      run.style.setProperty('--cp-dur', `${Math.max(5, len / 140).toFixed(2)}s`)
      const t = tankRef.current
      if (t) {
        const b = t.getBoundingClientRect()
        tank = { top: b.top - r.top, height: Math.max(1, b.height) }
      }
      last = -1
    }

    const frame = () => {
      raf = 0
      const r = run.getBoundingClientRect()
      const line = window.innerHeight * (window.innerWidth < 1000 ? 0.62 : 0.56)
      const fill = still.matches ? len : Math.min(len, Math.max(0, line - r.top))
      if (Math.abs(fill - last) < 0.5) return
      last = fill
      run.style.setProperty('--cp-fill', `${fill.toFixed(1)}px`)
      const level = Math.min(1, Math.max(0, (fill - tank.top) / tank.height))
      run.style.setProperty('--cp-level', level.toFixed(3))
      run.dataset.flow = fill <= 0.5 ? 'dry' : fill >= len - 0.5 ? 'full' : 'run'
      let mask = 0
      ys.forEach((y, i) => {
        if (y <= fill + 1) mask |= 1 << i
      })
      setLit((p) => (p === mask ? p : mask))
    }

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const relayout = () => {
      layout()
      queue()
    }

    layout()
    frame()
    const watch = new ResizeObserver(relayout)
    watch.observe(run)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', relayout)
    still.addEventListener('change', relayout)
    document.fonts?.ready.then(relayout)
    return () => {
      watch.disconnect()
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', relayout)
      still.removeEventListener('change', relayout)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const anchorRef = (i: number) => (el: HTMLElement | null) => {
    anchors.current[i] = el
  }
  const isLit = (i: number) => (lit & (1 << i)) !== 0

  return { runRef, tankRef, anchorRef, isLit }
}
